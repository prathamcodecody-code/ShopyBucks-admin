"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Ticket,
  Search,
  Calendar,
  Zap,
  Clock,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function CouponsAdminPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (coupon: any) => {
    try {
      await api.patch(`/coupons/${coupon.id}`, {
        isActive: !coupon.isActive,
      });
      fetchCoupons();
    } catch {
      alert("Failed to update status");
    }
  };

  const now = new Date();

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: coupons.length,
    active: coupons.filter(
      c => c.isActive && new Date(c.startAt) <= now && new Date(c.endAt) >= now
    ).length,
    expired: coupons.filter(c => new Date(c.endAt) < now).length,
  };

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-black text-white rounded-xl">
                <Ticket size={24} />
              </div>
              Promotion Coupons
            </h1>
            <p className="text-gray-400 font-medium mt-1">Manage discounts and seasonal offer codes</p>
          </div>

          <button
            onClick={() => router.push("/coupons/create")}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-gray-200 transition-all"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Pool" 
            value={stats.total} 
            icon={<Ticket className="text-blue-600" size={20}/>} 
            bgColor="bg-blue-50"
          />
          <StatCard 
            label="Currently Live" 
            value={stats.active} 
            icon={<Zap className="text-green-600" size={20}/>} 
            bgColor="bg-green-50"
          />
          <StatCard 
            label="Past/Expired" 
            value={stats.expired} 
            icon={<Clock className="text-red-600" size={20}/>} 
            bgColor="bg-red-50"
          />
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search by code (e.g. SUMMER50)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border-none p-3 pl-10 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-sm"
                />
            </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Coupon Details</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Offer Value</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Duration</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Usage</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-lg w-full"></div></td>
                    </tr>
                ))
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                        <Ticket size={48} />
                        <p className="mt-2 font-black uppercase tracking-widest text-xs">No Coupons Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.endAt) < now;

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-6 py-5">
                        <div className="font-black text-gray-900 tracking-tight text-base">
                          {coupon.code}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          ID: #{coupon.id}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-black text-xs">
                                {coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">OFF</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(coupon.startAt).toLocaleDateString()} - {new Date(coupon.endAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-5 font-bold text-gray-500">
                        {coupon.usageLimit ? (
                            <div className="flex items-center gap-1">
                                <span className="text-black">{coupon.usageLimit}</span>
                                <span className="text-[10px] uppercase">Max</span>
                            </div>
                        ) : "∞"}
                      </td>

                      <td className="px-6 py-5">
                        {isExpired ? (
                          <Badge color="red" label="Expired" />
                        ) : coupon.isActive ? (
                          <Badge color="green" label="Active" />
                        ) : (
                          <Badge color="gray" label="Paused" />
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                            <button
                                onClick={() => toggleActive(coupon)}
                                className={`p-2 rounded-lg transition-colors ${coupon.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                title={coupon.isActive ? "Deactivate" : "Activate"}
                            >
                                {coupon.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            </button>

                            <button
                                onClick={() => router.push(`/coupons/edit/${coupon.id}`)}
                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= SUB-COMPONENTS ================= */

function StatCard({ label, value, icon, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-black transition-all">
      <div>
        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
          {label}
        </p>
        <p className="text-3xl font-black mt-1 text-gray-900 tracking-tighter">
          {value}
        </p>
      </div>
      <div className={`p-4 ${bgColor} rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function Badge({ label, color }: any) {
  const styles = {
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    gray: "bg-gray-50 text-gray-400 border-gray-100",
  };

  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
}