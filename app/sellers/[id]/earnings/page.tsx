"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerEarningsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchEarnings() {
      try {
        const res = await api.get(`/admin/sellers/${id}/earnings`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load earnings", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-amazon-mutedText">
          Loading earnings…
        </p>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-red-500">
          Failed to load earnings
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold text-amazon-text">
          Seller Earnings
        </h1>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Earned"
            value={`₹${data.totalEarned.toLocaleString()}`}
          />
          <StatCard
            title="Total Paid"
            value={`₹${data.totalPaid.toLocaleString()}`}
          />
          <StatCard
            title="Available Balance"
            value={`₹${data.availableBalance.toLocaleString()}`}
            highlight
          />
        </div>

        {/* ================= PAYOUT HISTORY ================= */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4">
            Recent Payouts
          </h3>

          {data.recentPayouts.length === 0 ? (
            <p className="text-sm text-amazon-mutedText">
              No payouts yet.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayouts.map((p: any) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.id}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>₹{Number(p.amount).toLocaleString()}</td>
                    <td>
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-6 ${
        highlight ? "bg-green-50 border-green-200" : "bg-white"
      }`}
    >
      <p className="text-sm text-amazon-mutedText">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
