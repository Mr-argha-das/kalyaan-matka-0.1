// AppHeader.jsx
import React, { useState, useEffect } from "react";
import { Menu, Wallet2Icon } from "lucide-react";
import { API_URL } from "../../config";

// IMPORTANT: Replace with your actual base URL
const API_BASE_URL = API_URL;

// Utility function to get the token (assumes JWT is stored in localStorage)
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

export default function AppHeader({ setSidebar }) {
  const [balance, setBalance] = useState("...");
  const [loading, setLoading] = useState(true);

  // Function to fetch the wallet balance
  const fetchWalletBalance = async () => {
    setLoading(true);
    const token = getAuthToken();

    if (!token) {
      setBalance("Login");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Format the balance to two decimal places
        setBalance(data.balance.toFixed(2));
      } else {
        // Handle token expiration or other API errors
        setBalance("N/A");
      }
    } catch (err) {
      // Handle network errors
      setBalance("Error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch balance when the component mounts
  useEffect(() => {
    fetchWalletBalance();

    // Optional: Auto-refresh balance every 60 seconds
    const intervalId = setInterval(fetchWalletBalance, 60000);
    return () => clearInterval(intervalId);
  }, []); // Run only on mount and unmount

  return (
    <header className="w-full z-40">
      <div className="p-4 flex justify-between items-center max-w-md mx-auto bg-gradient-to-b from-black via-black to-black 0 rounde-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebar(true)}
            className="text-white hover:text-gray-200"
          >
            <Menu size={26} />
          </button>
          {/* <img src="/logo.png" alt="Logo" className="w-8 h-8" /> */}
          <h1 className="text-white text-lg font-bold">KalyanRatan777</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex font-medium items-center gap-2 text-white py-0.5 px-1 text-sm rounded-md border-[0.5px] border-white hover:bg-gray-700 transition duration-150">
            <Wallet2Icon size={18} />
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `₹${balance}`
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
