"use client";

type User = {
  name?: string;
  email: string;
  createdAt: string;
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
  user: User;
  summary: Summary;
  products: ProductAnalytics[];
  categories: CategoryAnalytics[];
};

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api.get(`/admin/users/${id}/analytics`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-gray-500">
          Loading user…
        </p>
      </AdminLayout>
    );
  }

  if (!data) return null;
  const { user, summary, categories, products } = data;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold">User Details</h1>

        {/* USER INFO */}
        <div className="bg-white border rounded-xl p-6 space-y-2">
          <p><b>Name:</b> {user.name || "—"}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Joined:</b> {new Date(user.createdAt).toLocaleString()}</p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <Stat title="Orders" value={summary.orders} />
          <Stat title="Total Spent" value={`₹${summary.totalSpent}`} />
        </div>

        {/* PRODUCTS */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Products Bought</h3>

          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left">Product</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.title}</td>
                  <td className="text-center">{p.quantity}</td>
                  <td className="text-center font-semibold">
                    ₹{p.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Categories</h3>

          <ul className="space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.name}>
                {c.name} — <b>{c.count}</b>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </AdminLayout>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
