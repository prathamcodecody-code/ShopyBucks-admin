"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/sellers/${id}` },
    { label: "Orders", href: `/sellers/${id}/orders` },
    { label: "Products", href: `/sellers/${id}/products` },
    { label: "Bank Details", href: `/sellers/${id}/bank` },
    { label: "Earnings", href: `/sellers/${id}/earnings` },
    { label: "Payouts", href: `/sellers/${id}/payouts` },
    { label: "Settings", href: `/sellers/${id}/settings` },
  ];

  return (
    /* 1. md:ml-64 accounts for your fixed sidebar.
       2. Removing mx-auto ensures it doesn't try to center itself 
          within the remaining space, which causes the right-side gap.
    */
    <div className="md:ml-64 min-h-screen bg-gray-50/50">
      {/* Change max-w-7xl to w-full and remove mx-auto to let it span 
         the full remaining width. 
      */}
      <Sidebar />
      <div className="w-full p-4 md:p-8 space-y-6">
        
        {/* TAB NAVIGATION */}
        <div className="flex gap-2 md:gap-6 border-b overflow-x-auto no-scrollbar bg-white px-6 py-1 rounded-t-2xl border-x border-t shadow-sm">
          {tabs.map(t => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`pb-3 pt-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive 
                  ? "border-amazon-orange text-amazon-darkBlue" 
                  : "border-transparent text-amazon-mutedText hover:text-amazon-orange"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* PAGE CONTENT */}
        <div className="bg-white p-4 md:p-8 rounded-b-2xl border border-amazon-borderGray shadow-sm min-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
