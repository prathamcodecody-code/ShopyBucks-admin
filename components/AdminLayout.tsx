"use client";

import Sidebar from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-amazon-lightGray min-h-screen">
      {/* SIDEBAR Component */}
      <Sidebar />
         <main className="flex-1 ml-0 md:ml-72 pt-20 md:pt-0 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
