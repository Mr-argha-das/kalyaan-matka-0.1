import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { API_URL } from "../config";

const REQUIRED_DEPOSIT_AMOUNT = 300;
const QUICK_AMOUNTS = [300];

export default function DepositeByOwn() {

  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [settings, setSettings] = useState(null);

  const [amount, setAmount] = useState(
    () => localStorage.getItem("add_amount") || ""
  );

  const amountValue = Number(amount || 0);
  const amountValidationMessage =
    amount && amountValue < REQUIRED_DEPOSIT_AMOUNT
      ? `Minimum deposit amount ₹${REQUIRED_DEPOSIT_AMOUNT}`
      : "";
  const isAmountInvalid =
    !amount || amountValue < REQUIRED_DEPOSIT_AMOUNT;

  useEffect(() => {
    localStorage.setItem("add_amount", amount);
  }, [amount]);

  const showPopup = (type, message) => {
    alert(message);
  };

  const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (detail && typeof detail === "object") {
      return detail.message || detail.error || JSON.stringify(detail);
    }

    return error?.message || "Payment gateway error!";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAmountInvalid) {
      showPopup("error", `Minimum deposit amount ₹${REQUIRED_DEPOSIT_AMOUNT}`);
      return;
    }

    setLoading(true);

    try {

      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_URL}/payment/watchpays/create`,
        {
          amount: parseFloat(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.payment_url) {
        throw new Error("Payment URL not received");
      }

      setAmount("");
      localStorage.removeItem("add_amount");
      window.location.href = res.data.payment_url;

    } catch (error) {

      console.log(error);
      showPopup(
        "error",
        getErrorMessage(error)
      );

    }

    setLoading(false);
  };

  useEffect(() => {

    async function load() {

      try {

        const res = await axios.get(`${API_URL}/settings/get`);
        const sited = await axios.get(`${API_URL}/sitedata/get`);

        setSiteData(sited?.data);
        setSettings(res?.data);

      } catch (error) {

        console.log("Settings API Error:", error);

      }

    }

    load();

  }, []);

  return (

    <div className="w-full">

      <form
        onSubmit={handleSubmit}
        className="w-[93%] mx-auto bg-white/5 rounded-xl p-4 mt-4"
      >

        <h2 className="text-sm font-semibold text-gray-200 mb-2">
          ADD POINTS
        </h2>

        <input
          type="number"
          min={REQUIRED_DEPOSIT_AMOUNT}
          placeholder={`Deposit amount must be at least ₹${REQUIRED_DEPOSIT_AMOUNT}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full bg-transparent text-gray-200 py-2 px-4 rounded-md border
           ${
             amountValidationMessage
               ? "border-red-400/70"
               : "border-gray-50/15"
           } focus:ring focus:ring-[#b00fdc] outline-none`}
        />
        {amountValidationMessage && (
          <p className="mt-2 mb-3 text-xs font-medium text-red-300">
            {amountValidationMessage}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">

          {QUICK_AMOUNTS.map((amt) => (

            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className="border border-gray-50/15 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
            >

              {amt}

            </button>

          ))}

        </div>

        <button
          disabled={loading || !settings || isAmountInvalid}
          className={`w-full bg-gradient-to-tl
            from-[#212b61] to-[#79049a] text-white font-semibold py-2 rounded-lg flex items-center justify-center transition
            ${
              loading || !settings || isAmountInvalid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-800"
            }`}
        >

          {loading ? <Loader2Icon className="animate-spin" /> : "Proceed"}

        </button>

      </form>

      {siteData?.add_money_html ? (

        <div
          className="text-gray-200 mt-5 text-sm mx-5"
          dangerouslySetInnerHTML={{
            __html: siteData?.add_money_html,
          }}
        />

      ) : (

        <div className="mt-4 mx-5 text max-w-md text-sm text-gray-200 leading-6"></div>

      )}

    </div>

  );
}
