import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Smartphone,
  Lock,
  LogIn,
  Power,
  ShieldAlert,
  CheckCircle,
  Ticket,
} from "lucide-react";
import { API_URL } from "../config";
import logo from "../assets/logo.png";
import { useSearchParams } from "react-router-dom";

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  console.log(ref);

  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referral_code, setReferralCode] = useState(ref || "");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);

  const triggerError = (text) => {
    setMessage({ type: "error", text });
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSignup = async () => {
    if (!username || !mobile || mobile.length !== 10 || !password) {
      triggerError("All fields required. Mobile must be 10 digits.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await axios.post(
        `${API_URL}/auth/register`,
        {
          username,
          mobile,
          password,
          referral_code: referral_code || null,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("REGISTER RESPONSE:", res.data);

      // ------------------------------------
      // AUTO LOGIN AFTER REGISTER SUCCESS
      // ------------------------------------
      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("userId", res.data.user.id);
      setTimeout(() => {
        window.location.reload();
      }, 1200);

      setMessage({
        type: "success",
        text: "Registration successful! Redirecting...",
      });

      // REDIRECT BY ROLE
      // setTimeout(() => {
      //   if (res.data.user.role === "admin") {
      //     window.location.href = "/admin";
      //   } else {
      //     window.location.href = "/";
      //   }
      // }, 900);
    } catch (err) {
      console.log("SIGNUP ERROR:", err);

      if (err.response?.data?.detail) {
        triggerError(err.response.data.detail);
      } else {
        triggerError("Server error. Try again.");
      }
    }
    setIsLoading(false);
  };

  const Message = ({ type, text }) => {
    if (!text) return null;

    let bg = "bg-gray-700/40 border-gray-500 text-white";
    let Icon = ShieldAlert;

    if (type === "error") {
      bg = "bg-red-600/20 border border-red-500 text-red-300";
      Icon = Power;
    }
    if (type === "success") {
      bg = "bg-green-600/20 border border-green-500 text-green-300";
      Icon = CheckCircle;
    }

    return (
      <div
        className={`p-3 mt-3 rounded-xl flex items-center gap-2 shadow-lg ${bg} ${
          type === "error" && shake ? "animate-shake" : ""
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl backdrop-blur">
        <div className="flex items-center justify-center">
          <img src={logo} className="h-30  w-30 rounded-full place-items-center mb-3" />
        </div>

        <h1 className="text-center text-3xl text-white font-bold">
          Create Account
        </h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          Register to get started.
        </p>

        {message && <Message type={message.type} text={message.text} />}

        {/* Username */}
        <label className="text-gray-300 block mt-6 mb-1 text-sm font-semibold">
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* Mobile */}
        <label className="text-gray-300 block mt-5 mb-1 text-sm font-semibold">
          Mobile Number
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 10 digit mobile"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-300">
            {mobile.length}/10
          </span>
        </div>

        {/* Password */}
        <label className="text-gray-300 block mt-5 mb-1 text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* Referral Code */}
        <label className="text-gray-300 block mt-5 mb-1 text-sm font-semibold">
          Referral Code (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            value={referral_code}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* Register Button */}
        <button
          onClick={handleSignup}
          disabled={isLoading}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-tl from-[#212b61] to-[#79049a] hover:opacity-90 transition disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <LogIn className="animate-spin" /> Creating...
            </>
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-center text-gray-400 text-sm mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 underline">
            Login
          </a>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
        .animate-shake { animation: shake 0.3s; }
      `}</style>
    </div>
  );
}
