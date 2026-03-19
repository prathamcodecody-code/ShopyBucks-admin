"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function ReferralsListPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter !== "ALL") params.status = statusFilter;

      const [referralsRes, statsRes] = await Promise.all([
        api.get("/admin/referral/list", { params }),
        api.get("/admin/referral/stats"),
      ]);

      setReferrals(referralsRes.data.referrals);
      setPagination(referralsRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.referrer.name?.toLowerCase().includes(searchLower) ||
      r.referrer.email?.toLowerCase().includes(searchLower) ||
      r.referredUser.name?.toLowerCase().includes(searchLower) ||
      r.referredUser.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-black text-white rounded-xl">
                <Users size={24} />
              </div>
              Referral Tracking
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Monitor all referrals and their completion status
            </p>
          </div>

          <button
            onClick={() => router.push("/referrals/referral-settings")}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-gray-200 transition-all"
          >
            <DollarSign size={18} />
            Settings
          </button>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              label="Total Referrals" 
              value={stats.totalReferrals}
              icon={<Users className="text-blue-600" size={20}/>} 
              bgColor="bg-blue-50"
            />
            <StatCard 
              label="Completed" 
              value={stats.completedReferrals}
              icon={<CheckCircle className="text-green-600" size={20}/>} 
              bgColor="bg-green-50"
            />
            <StatCard 
              label="Pending" 
              value={stats.pendingReferrals}
              icon={<Clock className="text-orange-600" size={20}/>} 
              bgColor="bg-orange-50"
            />
            <StatCard 
              label="Total Paid" 
              value={`₹${stats.totalPaidOut}`}
              icon={<TrendingUp className="text-purple-600" size={20}/>} 
              bgColor="bg-purple-50"
            />
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none p-3 pl-10 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-sm cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Referrer</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Referred User</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Reward</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Date</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-16 bg-gray-100 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Users size={48} />
                      <p className="mt-2 font-black uppercase tracking-widest text-xs">No Referrals Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50/50 transition-all">
                    {/* Referrer */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="font-black text-gray-900 flex items-center gap-2">
                          <UserCheck size={16} className="text-blue-600" />
                          {referral.referrer.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Mail size={12} />
                          {referral.referrer.email}
                        </div>
                        {referral.referrer.phone && (
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Phone size={12} />
                            {referral.referrer.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Referred User */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="font-black text-gray-900 flex items-center gap-2">
                          {referral.referredUser.isVerified ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Clock size={16} className="text-orange-600" />
                          )}
                          {referral.referredUser.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Mail size={12} />
                          {referral.referredUser.email}
                        </div>
                        {referral.referredUser.phone && (
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Phone size={12} />
                            {referral.referredUser.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Reward */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg font-black text-sm">
                          ₹{referral.rewardAmount}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 font-bold flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </div>
                        {referral.rewardedAt && (
                          <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle size={10} />
                            Rewarded {new Date(referral.rewardedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <StatusBadge status={referral.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 rounded-lg font-black text-sm transition-all"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-black text-sm transition-all ${
                    page === i + 1
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 rounded-lg font-black text-sm transition-all"
            >
              Next
            </button>
          </div>
        )}
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

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    COMPLETED: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      icon: <CheckCircle size={12} />,
    },
    PENDING: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      icon: <Clock size={12} />,
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      icon: <XCircle size={12} />,
    },
  };

  const style = styles[status] || styles.PENDING;

  return (
    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-full border flex items-center gap-1.5 w-fit ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {status}
    </span>
  );
}