"use client";

import AdminNavbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR - Fixed position */}
      <Sidebar />

      {/* CONTENT AREA - Takes remaining space */}
      <div className="flex-1 flex flex-col ml-0 md:ml-72">
        
        {/* NAVBAR - Sticky at top */}
        <AdminNavbar />

        {/* MAIN CONTENT - Scrollable area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
