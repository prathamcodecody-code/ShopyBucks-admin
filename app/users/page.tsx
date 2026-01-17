"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-gray-500">
          Loading users…
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold">Users</h1>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="New Today" value={stats.newToday} />
          <StatCard title="New This Week" value={stats.newThisWeek} />
          <StatCard title="Buyers" value={stats.buyers} />
        </div>

        {/* ===== USERS TABLE ===== */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => router.push(`/users/${u.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{u.name || "—"}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.ordersCount}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    ₹{u.totalSpent}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {pages > 1 && (
          <div className="flex justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm font-semibold">
              Page {page} of {pages}
            </span>

            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
