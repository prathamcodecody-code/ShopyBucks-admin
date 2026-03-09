"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  ShoppingBag, 
  BarChart3, 
  ArrowLeft,
  Lock,
  Unlock,
  Package
} from "lucide-react";

/* ================= TYPES ================= */

type UserData = {
  name?: string;
  email: string;
  createdAt: string;
  isBlocked?: boolean;
  blockedReason?: string | null;
};

type Summary = {
  orders: number;
  totalSpent: number;
};

type ProductAnalytics = {
  id: number;
  title: string;
  quantity: number;
  amount: number;
};

type CategoryAnalytics = {
  name: string;
  count: number;
};

type UserAnalyticsResponse = {
  user: UserData;
  summary: Summary;
  products: ProductAnalytics[];
  categories: CategoryAnalytics[];
};

/* ================= COMPONENT ================= */

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  const toggleBlock = async () => {
    if (!data) return;
    try {
      setBlocking(true);
      if (data.user.isBlocked) {
        await api.post(`/admin/users/${id}/unblock`);
      } else {
        const reason = prompt("Reason for blocking user?") || "Blocked by admin";
        await api.post(`/admin/users/${id}/block`, { reason });
      }
      const res = await api.get(`/admin/users/${id}/analytics`);
      setData(res.data);
    } finally {
      setBlocking(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/users/${id}/analytics`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;
  const { user, summary, categories, products } = data;

  return (
    <AdminLayout>
      <div className="max-w-[1200px] mx-auto p-8 space-y-8">
        
        {/* TOP NAVIGATION & HEADER */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amazon-mutedText hover:text-amazon-darkBlue font-black uppercase text-[10px] tracking-widest transition-colors w-fit"
          >
            <ArrowLeft size={14} /> Back to Users
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amazon-lightGray rounded-2xl flex items-center justify-center text-amazon-darkBlue border border-amazon-borderGray">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-amazon-darkBlue tracking-tight">
                  {user.name || "Anonymous Customer"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {user.isBlocked ? (
                    <span className="flex items-center gap-1 text-amazon-danger font-black text-[10px] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      <ShieldAlert size={12} /> Account Blocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amazon-success font-black text-[10px] uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">
                      Active Customer
                    </span>
                  )}
                  <span className="text-amazon-mutedText text-xs font-medium">ID: #{id}</span>
                </div>
              </div>
            </div>

            <button
              onClick={toggleBlock}
              disabled={blocking}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                user.isBlocked
                  ? "bg-amazon-success text-white shadow-green-100 hover:bg-green-700"
                  : "bg-amazon-danger text-white shadow-red-100 hover:bg-red-700"
              }`}
            >
              {blocking ? "Processing..." : user.isBlocked ? <><Unlock size={16}/> Unblock User</> : <><Lock size={16}/> Block User</>}
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DetailStat label="Customer Info" value={user.email} subValue={`Joined ${new Date(user.createdAt).toLocaleDateString()}`} icon={<Mail size={20}/>}/>
          <DetailStat label="Total Purchases" value={summary.orders} subValue="Orders Placed" icon={<Package size={20}/>}/>
          <DetailStat label="Lifetime Value" value={`₹${summary.totalSpent.toLocaleString()}`} subValue="Gross Revenue" icon={<ShoppingBag size={20}/>} isHighlight/>
        </div>

        {user.isBlocked && user.blockedReason && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-amazon-danger mt-1" size={18} />
            <div>
              <p className="text-[10px] font-black uppercase text-amazon-danger tracking-widest">Reason for Block</p>
              <p className="text-sm text-amazon-text font-medium mt-1">{user.blockedReason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PURCHASED PRODUCTS */}
          <div className="lg:col-span-2 bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amazon-borderGray flex items-center gap-2">
              <BarChart3 className="text-amazon-darkBlue" size={18}/>
              <h3 className="font-black text-amazon-darkBlue uppercase tracking-widest text-xs">Product Analytics</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-amazon-lightGray/30 text-amazon-mutedText">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Product Title</th>
                  <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Qty</th>
                  <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amazon-borderGray/30">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-amazon-lightGray/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-amazon-text">{p.title}</td>
                    <td className="px-6 py-4 text-center font-black text-amazon-mutedText">{p.quantity}</td>
                    <td className="px-6 py-4 text-right font-black text-amazon-darkBlue">₹{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PREFERRED CATEGORIES */}
          <div className="bg-white border border-amazon-borderGray rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="p-6 border-b border-amazon-borderGray flex items-center gap-2">
              <ShoppingBag className="text-amazon-darkBlue" size={18}/>
              <h3 className="font-black text-amazon-darkBlue uppercase tracking-widest text-xs">Category Affinity</h3>
            </div>
            <div className="p-6 space-y-4">
              {categories.map((c) => (
                <div key={c.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tight text-amazon-text">
                    <span>{c.name}</span>
                    <span className="text-amazon-mutedText">{c.count} Items</span>
                  </div>
                  <div className="w-full bg-amazon-lightGray h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amazon-orange h-full rounded-full" 
                      style={{ width: `${Math.min((c.count / summary.orders) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= HELPER COMPONENTS ================= */

function DetailStat({ label, value, subValue, icon, isHighlight }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${isHighlight ? 'border-amazon-orange shadow-orange-50' : 'border-amazon-borderGray'} shadow-sm flex justify-between items-start`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText mb-1">{label}</p>
        <p className={`text-xl font-black tracking-tight ${isHighlight ? 'text-amazon-orange' : 'text-amazon-darkBlue'}`}>{value}</p>
        <p className="text-xs text-amazon-mutedText font-medium mt-0.5">{subValue}</p>
      </div>
      <div className={`p-3 rounded-xl ${isHighlight ? 'bg-orange-50 text-amazon-orange' : 'bg-amazon-lightGray text-amazon-darkBlue'}`}>
        {icon}
      </div>
    </div>
  );
}
