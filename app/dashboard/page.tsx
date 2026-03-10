"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import OrdersBarChart from "@/components/charts/OrdersBarChart";
import OrderStatusPie from "@/components/charts/OrderStatusPie";
import Link from "next/link";
import { 
  Users, 
  Store, 
  Package, 
  Layers, 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Activity,
  Watch,
  WatchIcon,
  Clock,
  Check,
  PersonStanding,
  User
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/charts"),
        ]);

        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (err) {
        console.error("Admin dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center py-24 text-amazon-mutedText">
          Loading admin dashboard…
        </p>
      </AdminLayout>
    );
  }

  if (!stats || !charts) {
    return (
      <AdminLayout>
        <p className="text-center py-24 text-red-600">
          Failed to load admin dashboard
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto w-full space-y-10 p-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-amazon-darkBlue tracking-tight flex items-center gap-3">
              <div className="p-2 bg-amazon-darkBlue text-white rounded-xl">
                <Activity size={24} />
              </div>
              Platform Command Center
            </h1>
            <p className="text-amazon-mutedText font-medium mt-1">Real-time overview of your marketplace performance</p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText bg-amazon-lightGray px-4 py-2 rounded-full border border-amazon-borderGray">
            System Status: <span className="text-amazon-success ml-1">● Healthy</span>
          </div>
        </div>

        {/* ================= SELLER ALERTS (STICKY) ================= */}
        {stats.pendingSellerRequests > 0 && (
          <div className="bg-white border-l-4 border-amazon-orange rounded-xl p-6 shadow-lg shadow-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-amazon-orange rounded-full">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="font-black text-amazon-darkBlue uppercase tracking-tight">
                  Action Required: Seller Onboarding
                </h3>
                <p className="text-sm text-amazon-mutedText">
                  There are <span className="font-bold text-amazon-text">{stats.pendingSellerRequests}</span> sellers waiting for identity verification and approval.
                </p>
              </div>
            </div>
            <Link
              href="/sellers/requests"
              className="w-full md:w-auto px-6 py-3 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-200"
            >
              Review Requests <ExternalLink size={14} />
            </Link>
          </div>
        )}

        {/* ================= PLATFORM GLOBAL STATS ================= */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText mb-4 ml-1">
            Lifetime Infrastructure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard label="Total Sellers" value={stats.totalSellers} icon={<Store size={20}/>} color="blue" />
            <DashboardCard label="Pending Selle" value={stats.pendingSellerRequests} icon={<Clock size={20}/>} color="orange" />
            <DashboardCard label="Categories" value={stats.totalCategories} icon={<Layers size={20}/>} color="purple" />
            <DashboardCard label="Product Types" value={stats.totalProductTypes} icon={<Package size={20}/>} color="indigo" />
            <DashboardCard label="Total Orders" value={stats.totalOrders } icon={<ShoppingCart size={20}/>} color="green" />
            <DashboardCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="orange" isOrange />
          </div>
        </section>

        {/* ================= DAILY ACTIVITY ================= */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText mb-4 ml-1">
            Real-Time Activity (Today)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard label="Active Users" value={stats.totalUsers} icon={<Users size={20}/>} color="green" />
            <DashboardCard label="New Users Today" value={stats.newUsersToday} icon={<User size={20}/>} color="orange" />
            <DashboardCard label="Orders Today" value={stats.ordersToday} icon={<ShoppingCart size={20}/>} color="green" />
            <DashboardCard label="Delivered Orders" value={stats.deliveredOrders} icon={<Check size={20}/>} color="green" />
            <DashboardCard label="Today's Revenue" value={`₹${stats.todaysRevenue.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="orange" />
            <DashboardCard label="New Sellers Today" value={stats.newSellersToday } icon={<Store size={20}/>} color="blue" />
            <DashboardCard label="Canceled Orders" value={stats.canceledOrders} icon={<XCircle size={20}/>} color="red" />
          </div>
        </section>

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartWrapper title="Revenue Trend (7D)">
            <RevenueLineChart data={charts.revenueTrend} />
          </ChartWrapper>
          <ChartWrapper title="Order Volume (7D)">
            <OrdersBarChart data={charts.ordersTrend} />
          </ChartWrapper>
          <ChartWrapper title="Fulfillment Status">
            <OrderStatusPie data={charts.orderStatus} />
          </ChartWrapper>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="bg-amazon-darkBlue rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <ExternalLink size={20} className="text-amazon-orange" />
            </div>
            <h2 className="text-xl font-black tracking-tight">System Quick Actions</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Manage Categories", href: "/categories" },
              { label: "Product Types", href: "/product-types" },
              { label: "Subtypes", href: "/product-subtypes" },
              { label: "Review Moderation", href: "/reviews" },
              { label: "User Feedback", href: "/feedback" },
            ].map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= SUB-COMPONENTS ================= */

function DashboardCard({ label, value, icon, color, isOrange }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-amazon-success",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-amazon-danger",
    orange: "bg-orange-50 text-amazon-orange",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-amazon-borderGray shadow-sm group hover:border-amazon-darkBlue transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amazon-mutedText mb-1">
            {label}
          </p>
          <p className={`text-2xl font-black tracking-tight ${isOrange ? 'text-amazon-orange' : 'text-amazon-darkBlue'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartWrapper({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-amazon-borderGray shadow-sm">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amazon-orange" />
        {title}
      </h3>
      <div className="h-[250px] w-full">
        {children}
      </div>
    </div>
  );
}
