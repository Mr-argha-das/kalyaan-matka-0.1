import React from "react";
import {
  Home,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Send,
  User,
} from "lucide-react";
import { IoHammerOutline } from "react-icons/io5";
import { FaBook } from "react-icons/fa";
import { IoMdBook } from "react-icons/io";
import { MdOutlineCurrencyRupee } from "react-icons/md";

export default function BottomNavBar() {
  return (
    <div className="fixed -bottom-3 left-0 w-full flex justify-center items-center  z-40">
      <div className="relative overflow-hidden  w-[100%] max-w-md bg-[rgba(19,21,41,1)] backdrop-blur-3xl  rounded-t-xl shadow-lg flex justify-between items-center  text-gray-400">
        {/* Left icons */}
        <div className="flex p-3  mt-1 rounded-tl-xl mr-18 rounded-tr-3xl bg-[rgba(78,80,94,1)] /60 w-full items-center space-x-8">
          <a href="/bid-history" className="w-full min-w-11 text-center">
            <IoHammerOutline
              size={22}
              className="cursor-pointer w-full hover:text-white transition"
            />
            <span className="text-xs"> My Bids</span>
          </a>

          <a href="/passbook" className="w-full text-center">
            <IoMdBook
              size={24}
              className="cursor-pointer w-full hover:text-white transition"
            />
            <span className="text-xs"> Passbook</span>
          </a>
        </div>

        {/* Floating Home Button */}

        <span className="bg-[rgba(78,80,94,1)] absolute top-0 left-1/2 transform -translate-x-1/2 rounded-t-full h-19  w-18 "></span>
        <span className="bg-[rgba(19,21,41,1)] absolute -top-10 left-1/2 transform -translate-x-1/2 rounded-full h-19  w-18 "></span>

        {/* Right icons */}
        <div className="grid grid-cols-2 mt-1 -ml-[14px] rounded-tl-3xl rounded-tr-xl  items-center  p-3  bg-[rgba(78,80,94,1)] w-full space-x-8">
          <a href="/withdrawal-request" className="w-full text-center">
            <MdOutlineCurrencyRupee
              size={24}
              className="cursor-pointer  w-full hover:text-white transition"
            />
            <span className="text-xs"> Withdrawal</span>
          </a>
          <a href="/profile" className="w-full text-center">
            <User
              size={22}
              className="cursor-pointer  w-full hover:text-white transition"
            />
            <span className="text-xs"> Profile</span>
          </a>
        </div>
      </div>
      <a
        href="/"
        className="absolute -top-6 left-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gradient-to-bl from-[#212b61] to-[#79049a] p-4 rounded-full shadow-xl  cursor-pointer hover:scale-105 transition">
          <Home size={22} className="text-white" />
        </div>
      </a>
    </div>
  );
}
