"use client";

import AdminNotificationBell from "@/components/notifications/AdminNotificationBell";
import { HiOutlineUserCircle, HiOutlineChevronDown } from "react-icons/hi2";

export default function AdminNavbar() {
  return (
    <nav className="h-20 bg-white border-b-4 border-amazon-darkBlue flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Search or Page Title Placeholder */}
      <div className="hidden md:block">
        <h2 className="text-amazon-darkBlue font-black uppercase tracking-tighter italic text-xl">
          Control Center
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell with Neo-brutalist Container */}
        <div className="relative hover:scale-110 transition-transform cursor-pointer p-2 rounded-xl border-2 border-transparent hover:border-amazon-darkBlue hover:bg-amazon-orange hover:shadow-[3px_3px_0px_0px_rgba(19,25,33,1)]">
          <AdminNotificationBell />
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-1 bg-amazon-borderGray rounded-full" />

        {/* Profile Dropdown */}
        <button className="group flex items-center gap-3 px-3 py-2 rounded-xl border-2 border-amazon-darkBlue bg-white shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          <div className="w-8 h-8 rounded-lg bg-amazon-orange border-2 border-amazon-darkBlue flex items-center justify-center">
            <HiOutlineUserCircle size={20} className="text-amazon-darkBlue" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest leading-none">Admin</p>
            <p className="text-xs font-bold text-amazon-darkBlue uppercase">Root User</p>
          </div>
          <HiOutlineChevronDown size={14} className="text-amazon-darkBlue group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>
    </nav>
  );
}
