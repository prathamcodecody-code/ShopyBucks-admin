"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import OrdersBarChart from "@/components/charts/OrdersBarChart";
import OrderStatusPie from "@/components/charts/OrderStatusPie";
import Link from "next/link";

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
      <div className="max-w-7xl mx-auto w-full space-y-10">

        {/* ================= HEADER ================= */}
        <h1 className="text-3xl font-bold text-amazon-text">
          Platform Dashboard
        </h1>

        {/* ================= PLATFORM STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Sellers", value: stats.totalSellers },
            { label: "Pending Seller Requests", value: stats.pendingSellerRequests },
            { label: "Categories", value: stats.totalCategories },
            { label: "Product Types", value: stats.totalProductTypes },
            { label: "Orders", value: stats.totalOrders },
            { label: "Platform Revenue", value: `₹${stats.revenue}` },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-amazon-borderGray"
            >
              <p className="text-sm text-amazon-mutedText">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-amazon-orange mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* ================= SELLER ACTIONS ================= */}
        {stats.pendingSellerRequests > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800">
                Seller Requests Pending
              </h3>
              <p className="text-sm text-yellow-700">
                {stats.pendingSellerRequests} sellers awaiting approval
              </p>
            </div>

            <Link
              href="/sellers/requests"
              className="px-4 py-2 bg-amazon-orange text-black rounded-lg font-semibold"
            >
              Review Requests
            </Link>
          </div>
        )}

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-amazon-borderGray">
            <h3 className="font-semibold mb-4 text-amazon-text">
              Revenue (Last 7 Days)
            </h3>
            <RevenueLineChart data={charts.revenueTrend} />
          </div>

          <div className="bg-white rounded-xl p-6 border border-amazon-borderGray">
            <h3 className="font-semibold mb-4 text-amazon-text">
              Orders (Last 7 Days)
            </h3>
            <OrdersBarChart data={charts.ordersTrend} />
          </div>

          <div className="bg-white rounded-xl p-6 border border-amazon-borderGray">
            <h3 className="font-semibold mb-4 text-amazon-text">
              Order Status Distribution
            </h3>
            <OrderStatusPie data={charts.orderStatus} />
          </div>
        </div>

        {/* ================= QUICK LINKS ================= */}
        <div className="bg-white rounded-xl p-6 border border-amazon-borderGray">
          <h2 className="text-xl font-semibold mb-4 text-amazon-text">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-4">
            <Link href="/categories" className="btn-secondary">
              Manage Categories
            </Link>
            <Link href="/product-types" className="btn-secondary">
              Product Types
            </Link>
            <Link href="/product-subtypes" className="btn-secondary">
              Product Subtypes
            </Link>
            <Link href="/reviews" className="btn-secondary">
              Review Moderation
            </Link>
            <Link href="/feedback" className="btn-secondary">
              User Feedback
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
