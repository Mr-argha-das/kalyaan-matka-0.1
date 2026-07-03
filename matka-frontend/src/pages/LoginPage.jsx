import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LogIn,
  User,
  Power,
  Loader2,
  Smartphone,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { API_URL } from "../config";
import logo from "../assets/logo.png";
const API_BASE_URL = API_URL;
import UpiPayment from "../components/layout/upi";
import { fetchSiteData } from "../components/layout/fetchSiteData";

// Spinner
const LoadingSpinner = () => <Loader2 className="animate-spin h-5 w-5 mr-2" />;

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [shake, setShake] = useState(false);
  // const [userId, setUserId] = useState(null);
  // const token = localStorage.getItem("accessToken");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get(`${API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response", response?.data);
    };

    fetchUser();
  }, [token]);

  // if (token) {
  //   const decoded = jwtDecode(token);
  //   setUserId(decoded?.sub);
  // }

  useEffect(() => {
    const stored = localStorage.getItem("accessToken");
    if (stored) {
      setMessage({ type: "info", text: "You are already logged in!" });
    }
  }, []);

  const showError = (text) => {
    setMessage({ type: "error", text });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async () => {
    if (!mobile || !password || mobile.length !== 10) {
      showError("Enter valid 10-digit mobile & password.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/token`,
        { mobile, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // console.log(response);
      const data = response.data;
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("userId", data.userId);

      setMessage({ type: "success", text: "Login Successful!" });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.log("LOGIN ERROR: ", err);

      if (err.response) {
        const detail = err.response.data.detail;

        if (typeof detail === "string") {
          showError(detail);
        } else if (Array.isArray(detail)) {
          showError(detail[0].msg || "Invalid credentials");
        } else {
          showError("Incorrect mobile or password!");
        }
      } else {
        showError("Server connection failed. Try again.");
      }
    }

    setIsLoading(false);
  };

  const Message = ({ type, text }) => {
    if (!text) return null;

    let bgColor = "bg-gray-700/80 text-white border";
    let Icon = ShieldAlert;

    if (type === "error") {
      bgColor = "bg-red-600/20 border border-red-500 text-red-300";
      Icon = Power;
    }
    if (type === "success") {
      bgColor = "bg-green-600/20 border border-green-500 text-green-300";
      Icon = LogIn;
    }
    if (type === "info") {
      bgColor = "bg-blue-600/20 border border-blue-400 text-blue-300";
      Icon = User;
    }

    return (
      <div
        className={`p-3 rounded-xl flex items-center gap-2 mt-3 shadow-md ${bgColor} ${
          type === "error" && shake ? "animate-shake" : ""
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </div>
    );
  };

    const [site, setSite] = useState(null);
  
    useEffect(() => {
      (async () => {
        const data = await fetchSiteData();
        console.log("data ======", data);
        setSite(data);
      })();
    }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="w-full max-w-md   rounded-2xl  backdrop-blur ">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            className="h-30  w-30 rounded-full place-items-center mb-3"
          />
        </div>
        <h1 className="text-center text-3xl text-white font-bold tracking-wide">
          Login
        </h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          Secure login to continue.
        </p>

        {message && <Message type={message.type} text={message.text} />}

        {/* MOBILE INPUT */}
        <label className="text-gray-300 block mt-6 mb-1 text-sm font-semibold">
          Mobile Number
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 10 digit mobile"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* PASSWORD INPUT */}
        <label className="text-gray-300 block mt-5 mb-1 text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-12 py-3 rounded-xl bg-black/30 text-white border border-purple-600/40 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex mt-5 items-center justify-center bg-gradient-to-tl from-[#212b61] to-[#79049a] text-white font-semibold py-3 rounded-lg hover:bg-purple-800 transition"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Authenticating...
            </>
          ) : (
            <>
              <LogIn size={20} className="mr-2" /> Login
            </>
          )}
        </button>

        <p className="text-center text-gray-400 text-sm mt-5">
          Register a new account?{" "}
          <a href="/signup" className="text-purple-400 underline">
            SignUp
          </a>
        </p>

        <p className="text-center text-gray-400 mt-5 text-sm">
          Need help?{" "}
          <a
            href={`https://wa.me/${site?.whatsapp_number}`}
            // href="https://wa.me/917726035987"
            className="text-green-400 underline"
            target="_blank"
            rel="noreferrer"
          >
            Contact Support
          </a>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
