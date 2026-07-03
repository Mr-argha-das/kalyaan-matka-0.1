import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { API_URL } from "../config";

export default function DepositeByOwn() {

  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [settings, setSettings] = useState(null);

  const [amount, setAmount] = useState(
    () => localStorage.getItem("add_amount") || ""
  );

  useEffect(() => {
    localStorage.setItem("add_amount", amount);
  }, [amount]);

  const showPopup = (type, message) => {
    alert(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) < settings?.min_deposit) {
      showPopup("error", `Minimum deposit is Rs ${settings?.min_deposit}`);
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
        error?.response?.data?.detail || "Payment gateway error!"
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
          placeholder={`Add amount (Min Rs ${settings?.min_deposit})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-gray-200 py-2 px-4 rounded-md border
           border-gray-50/15 focus:ring focus:ring-[#b00fdc] outline-none mb-3"
        />

        <div className="grid grid-cols-3 gap-3 mb-4">

          {[300, 500, 1000, 2000, 5000].map((amt) => (

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
          disabled={
            loading ||
            !settings?.min_deposit ||
            amount < settings?.min_deposit
          }
          className={`w-full bg-gradient-to-tl
            from-[#212b61] to-[#79049a] text-white font-semibold py-2 rounded-lg flex items-center justify-center transition
            ${
              loading || amount < settings?.min_deposit
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
