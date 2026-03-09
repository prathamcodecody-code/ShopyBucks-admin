"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Calendar, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Search
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  async function loadData() {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/users/stats"),
        api.get("/admin/users", {
          params: { page, limit },
        }),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPages(usersRes.data.pages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-amazon-darkBlue">
              <div className="p-2 bg-amazon-darkBlue text-white rounded-xl">
                <Users size={24} />
              </div>
              Customer Directory
            </h1>
            <p className="text-amazon-mutedText font-medium mt-1">Manage user accounts and monitor purchasing behavior</p>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            label="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={<Users size={20} className="text-blue-600" />} 
            bgColor="bg-blue-50" 
          />
          <StatCard 
            label="New Today" 
            value={stats?.newToday || 0} 
            icon={<UserPlus size={20} className="text-amazon-success" />} 
            bgColor="bg-green-50" 
          />
          <StatCard 
            label="This Week" 
            value={stats?.newThisWeek || 0} 
            icon={<Calendar size={20} className="text-purple-600" />} 
            bgColor="bg-purple-50" 
          />
          <StatCard 
            label="Blocked" 
            value={stats?.blockedUsers || 0} 
            icon={<UserMinus size={20} className="text-amazon-danger" />} 
            bgColor="bg-red-50" 
          />
          <StatCard 
            label="Total Buyers" 
            value={stats?.buyers || 0} 
            icon={<ShoppingBag size={20} className="text-amazon-orange" />} 
            bgColor="bg-orange-50" 
          />
        </div>

        {/* USERS TABLE */}
        <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amazon-lightGray/50 border-b border-amazon-borderGray text-amazon-mutedText">
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">User Profile</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Account Status</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Order History</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Lifetime Value</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Registration</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amazon-borderGray/30">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-8 bg-amazon-lightGray rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => router.push(`/users/${u.id}`)}
                  className="border-t hover:bg-amazon-lightGray/30 cursor-pointer transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-amazon-text group-hover:text-amazon-orange transition-colors tracking-tight">
                        {u.name || "Anonymous User"}
                      </span>
                      <span className="text-[11px] text-amazon-mutedText font-bold uppercase">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.isBlocked ? (
                      <Badge color="red" label="Blocked" />
                    ) : (
                      <Badge color="green" label="Active" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 font-black text-amazon-darkBlue">
                      {u.ordersCount}
                      <span className="text-[9px] text-amazon-mutedText uppercase tracking-tighter">Orders</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-amazon-text">₹{u.totalSpent.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-[11px] text-amazon-mutedText font-bold">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-4 border-t border-amazon-borderGray/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">
            Page <span className="text-amazon-darkBlue">{page}</span> of {pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function StatCard({ label, value, icon, bgColor }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-amazon-borderGray shadow-sm group hover:border-amazon-darkBlue transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">{label}</p>
          <p className="text-2xl font-black mt-1 text-amazon-darkBlue tracking-tight">{value}</p>
        </div>
        <div className={`p-3 ${bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "red" | "gray" }) {
  const styles = {
    green: "bg-green-50 text-amazon-success border-green-100",
    red: "bg-red-50 text-amazon-danger border-red-100",
    gray: "bg-amazon-lightGray text-amazon-mutedText border-amazon-borderGray",
  };
  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
}
