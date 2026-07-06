import datetime
import hashlib
import json
import uuid
from decimal import Decimal, InvalidOperation
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, Request as FastAPIRequest
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from ..auth import get_current_user
from ..config import settings
from ..models import Transaction, Wallet

router = APIRouter(prefix="/payment/watchpays", tags=["WatchPays"])
REQUIRED_DEPOSIT_AMOUNT = Decimal("300.00")


class WatchPaysCreateRequest(BaseModel):
    amount: float


def format_amount(amount: float) -> str:
    try:
        value = Decimal(str(amount))
    except InvalidOperation:
        raise HTTPException(400, "Invalid amount")

    if value <= 0:
        raise HTTPException(400, "Amount must be positive")

    if value < REQUIRED_DEPOSIT_AMOUNT:
        raise HTTPException(400, "Minimum deposit amount 300")

    if value > REQUIRED_DEPOSIT_AMOUNT:
        raise HTTPException(400, "Maximum deposit amount 300")

    return f"{value:.2f}"


def build_signature(params: dict[str, str], api_key: str) -> str:
    clean_params = {
        key: value
        for key, value in params.items()
        if value is not None and str(value) != ""
    }
    sign_string = "&".join(
        f"{key}={clean_params[key]}" for key in sorted(clean_params)
    )
    sign_string = f"{sign_string}&key={api_key}"
    return hashlib.md5(sign_string.encode("utf-8")).hexdigest()


def get_or_create_wallet(user_id: str):
    wallet = Wallet.objects(user_id=user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0).save()
    return wallet


def post_watchpays_create(payload: dict) -> dict:
    url = f"{settings.WATCHPAYS_BASE_URL.rstrip('/')}/v1/create"
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8") or str(exc)
        raise HTTPException(exc.code, detail)
    except URLError as exc:
        raise HTTPException(502, f"WatchPays connection failed: {exc.reason}")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(502, "Invalid response from WatchPays")


@router.post("/create")
def create_watchpays_payment(
    req: WatchPaysCreateRequest,
    user=Depends(get_current_user),
):
    amount = format_amount(req.amount)
    merchant_order_no = f"DEP{uuid.uuid4().hex[:18].upper()}"

    signature_params = {
        "merchant_id": settings.WATCHPAYS_MERCHANT_ID,
        "amount": amount,
        "merchant_order_no": merchant_order_no,
        "callback_url": settings.WATCHPAYS_CALLBACK_URL,
    }
    signature = build_signature(
        signature_params,
        settings.WATCHPAYS_PAYIN_API_KEY,
    )

    payload = {
        **signature_params,
        "api_key": settings.WATCHPAYS_PAYIN_API_KEY,
        "extra": str(user.id),
        "signature": signature,
    }

    txn = Transaction(
        tx_id=merchant_order_no,
        user_id=str(user.id),
        amount=float(amount),
        payment_method="WatchPays",
        status="PENDING",
        gateway="WatchPays",
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    ).save()

    gateway_response = post_watchpays_create(payload)
    if not gateway_response.get("success"):
        txn.status = "FAILED"
        txn.confirmed_at = datetime.datetime.utcnow()
        txn.save()
        raise HTTPException(400, gateway_response or "Payment creation failed")

    txn.gateway_order_no = gateway_response.get("order_no")
    txn.payment_url = gateway_response.get("payment_url")
    txn.save()

    return {
        "success": True,
        "merchant_order_no": merchant_order_no,
        "order_no": txn.gateway_order_no,
        "amount": amount,
        "payment_url": txn.payment_url,
        "status": gateway_response.get("status", "created"),
    }


@router.post("/callback", response_class=PlainTextResponse)
async def watchpays_callback(request: FastAPIRequest):
    payload = await request.json()
    merchant_order = payload.get("merchantOrder")
    gateway_order = payload.get("orderNo")
    status = str(payload.get("status", "")).lower()

    if not merchant_order:
        return PlainTextResponse("missing merchantOrder", status_code=400)

    txn = Transaction.objects(tx_id=merchant_order, gateway="WatchPays").first()
    if not txn:
        return PlainTextResponse("order not found", status_code=404)

    try:
        callback_amount = Decimal(str(payload.get("amount")))
        txn_amount = Decimal(str(txn.amount))
    except InvalidOperation:
        txn.status = "FAILED"
        txn.confirmed_at = datetime.datetime.utcnow()
        txn.save()
        return PlainTextResponse("invalid amount", status_code=400)

    if callback_amount != txn_amount:
        txn.status = "FAILED"
        txn.confirmed_at = datetime.datetime.utcnow()
        txn.save()
        return PlainTextResponse("amount mismatch", status_code=400)

    if txn.status == "SUCCESS":
        return "success"

    txn.gateway_order_no = gateway_order or txn.gateway_order_no
    txn.confirmed_at = datetime.datetime.utcnow()

    if status == "success":
        wallet = get_or_create_wallet(txn.user_id)
        wallet.balance += txn.amount
        wallet.updated_at = datetime.datetime.utcnow()
        wallet.save()
        txn.status = "SUCCESS"
    else:
        txn.status = "FAILED"

    txn.save()
    return "success"
