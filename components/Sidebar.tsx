"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Layers,
  Boxes,
  Box,
  Package,
  ShoppingCart,
  MessageSquare,
  BadgePercent,
  Star,
  Settings,
  LogOut,
  PersonStanding,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const LinkItem = (
    href: string,
    label: string,
    Icon: any
  ) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition
        ${
          pathname === href
            ? "bg-amazon-orange text-black"
            : "text-amazon-text hover:bg-amazon-lightGray"
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-amazon-borderGray flex items-center px-4 z-40">
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>

        <h1 className="ml-4 font-bold text-amazon-text">
          ShopyBucks Admin
        </h1>
      </div>

      {/* OVERLAY (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-amazon-borderGray
          flex flex-col justify-between z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* TOP */}
        <div className="p-6 pt-16 md:pt-6">
          {/* Close button (mobile) */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 md:hidden"
          >
            <X size={22} />
          </button>

          <h1 className="hidden md:block text-2xl font-bold mb-8 text-amazon-text">
            <span className="text-xl md:text-2xl font-black text-[#4F1271] uppercase tracking-tighter">Shopy</span>
            <span className="text-xl md:text-2xl font-black text-amazon-orange italic uppercase tracking-tighter">Bucks</span>
          </h1>

          <nav className="space-y-1">
  {LinkItem("/dashboard", "Dashboard", LayoutDashboard)}

  {/* Catalog Governance */}
  {LinkItem("/categories", "Categories", Layers)}
  {LinkItem("/product-types", "Product Types", Boxes)}
  {LinkItem("/product-subtypes", "Product Subtypes", Box)}

  {/* Seller Governance */}
  {LinkItem("/sellers", "Sellers", Package)} 
  {LinkItem("/sellers/requests", "Seller Requests", Package)}

  {/* Users */}
  {LinkItem("/users", "Users", PersonStanding)}
  {/* Platform Controls */}
  {LinkItem("/discount-events", "Discount Events", BadgePercent)}
  {LinkItem("/reviews", "Reviews", Star)}
  {LinkItem("/feedback", "Feedback", MessageSquare)}

  {LinkItem("/settings", "Settings", Settings)}
</nav>

        </div>

        {/* LOGOUT */}
        <div className="p-6">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-3 rounded-lg
              bg-red-500 text-white font-semibold
              hover:bg-red-600 transition
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-amazon-text">
              Confirm Logout
            </h3>

            <p className="text-sm text-amazon-mutedText mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  router.push("/login");
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
