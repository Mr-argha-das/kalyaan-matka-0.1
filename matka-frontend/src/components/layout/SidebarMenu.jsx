import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Wallet,
  PlusCircle,
  PlayCircle,
  Gift,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Trophy,
  Gamepad2,
  Phone,
  Lock,
  LogOut,
  X,
  DollarSign,
  Star,
  Play, // Replaced BiMoney with DollarSign from lucide-react
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config";
import { SiMarketo } from "react-icons/si";

const API_BASE = `${API_URL}/user`;

export default function SidebarMenu({ sidebar, setSidebar }) {
  const [notifications, setNotifications] = useState(true);
  const [accessToken, setAccessToken] = useState(null); // Track authentication state
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("accessToken");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ---------------------------
  // GET PROFILE
  // ---------------------------
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile`, authHeader);

      setUser(res.data);
      setUsername(res.data.username || "");
      setMobile(res.data.mobile || "");
    } catch (err) {
      console.log("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. Check for token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  // 2. Corrected handleLogout function
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setAccessToken(null);
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: <User size={18} />, label: "My Profile", link: "/profile" },
    // { icon: <Bell size={18} />, label: "Notification", toggle: true },
    { icon: <Wallet size={18} />, label: "Wallet", link: "/wallet" },

    // { icon: <PlusCircle size={18} />, label: "Add Points" ,link: "/add-points"},
    { icon: <Clock size={18} />, label: "My Bids", link: "/my-bids" },
    {
      icon: <DollarSign size={18} />,
      label: "Add Points",
      link: "/add-points",
    },

    { icon: <Star size={18} />, label: "Starline", link: "/starline" },
    {
      icon: <SiMarketo size={18} />,
      label: "Galidesawar",
      link: "/golidesawar",
    },
    {
      icon: <ArrowDownCircle size={18} />,
      label: "Withdrawal Funds",
      link: "/withdrawal-request",
    },
    // { icon: <ArrowUpCircle size={18} />, label: "Transfer Points" },
    { icon: <Clock size={18} />, label: "Bid History", link: "/bid-history" },
    { icon: <Trophy size={18} />, label: "Win History", link: "/win-history" },
    { icon: <Gamepad2 size={18} />, label: "Game Rate", link: "/game-rate" },
    { icon: <Phone size={18} />, label: "Contact Us", link: "/contact-us" },
    { icon: <Gift size={18} />, label: "Reffer & Earn", link: "/referrals" },
    {
      icon: <Lock size={18} />,
      label: "Change Password",
      link: "/change-password",
    },
    {
      icon: <Play size={18} />,
      label: "How To Play",
      link: "/how-to-play",
    },
    // Only include onClick for the logout action
    {
      icon: <LogOut size={18} />,
      label: "Logout",
      onClick: handleLogout,
      isLogout: true, // Custom flag to identify the logout item
    },
  ];

  return (
    <>
      {/* Overlay when sidebar open */}
      {sidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebar(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 shadow-xl border-r-[0.5px] border-gray-50/10 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex flex-col items-center px-4 py-4 bg-gradient-to-b z-10  from-[#03050e] via-[#192149] to-[#5a0572] text-white rounded-b-2xl relative">
          <button
            onClick={() => setSidebar(false)}
            className="absolute right-4 top-4 text-white hover:text-gray-200"
          >
            <X size={22} />
          </button>

          <div className="capitalize w-16 h-16 border-2 text-white border-purple-900 rounded-full flex items-center justify-center font-bold text-2xl">
            {username?.[0]}
          </div>
          <h3 className="mt-2 text-lg font-semibold capitalize">{username}</h3>
          <p className="text-sm opacity-80">{mobile}</p>
        </div>

        {/* Menu */}
        <div className="p-4 flex flex-col space-y-3 -mt-4 pt-5 overflow-y-auto bg-[rgba(20,25,51,1) bg-blac50 backdrop-blur-2xl text-white h-[calc(100%-136px)]">
          {menuItems
            // 3. Filter the Logout item if the user is not authenticated
            .filter((item) => !item.isLogout || accessToken)
            .map((item, index) => {
              // Determine if the item is a link or an action (like Logout)
              const Component = item.link ? "a" : "div";
              const props = item.link
                ? { href: item.link }
                : { onClick: item.onClick };

              const iconColor = item.isLogout
                ? "text-[#9714bb]"
                : "text-[#9714bb]";

              return (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-gray-100/20 cursor-pointer hover:bg-[#192149] rounded-md transition"
                >
                  <Component
                    {...props}
                    className="flex w-full py-3 px-3 items-center gap-3"
                  >
                    <div className={iconColor}>{item.icon}</div>
                    <span className="text-white font-medium text-sm">
                      {item.label}
                    </span>
                  </Component>

                  {/* Toggle logic is handled separately for items with toggle property */}
                  {item.toggle && (
                    <label className="relative inline-flex items-center cursor-pointer pr-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#9714bb] rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-700"></div>
                    </label>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
