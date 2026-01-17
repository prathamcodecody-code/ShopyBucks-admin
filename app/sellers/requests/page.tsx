"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SellerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/sellers/requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load seller requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = async (id: number) => {
    if (!confirm("Approve this seller?")) return;

    try {
      setActionLoading(id);
      await api.patch(`/admin/sellers/requests/${id}/approve`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id: number) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    try {
      setActionLoading(id);
      await api.patch(`/admin/sellers/requests/${id}/reject`, { reason });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };


  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amazon-text">
            Seller Requests
          </h1>

          <button
            onClick={loadRequests}
            className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-amazon-mutedText">
            Loading seller requests…
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && requests.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-lg font-semibold">
              No pending seller requests 🎉
            </p>
            <p className="text-sm text-gray-500 mt-1">
              All sellers are reviewed.
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && requests.length > 0 && (
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Documents</th>
                  <th className="px-4 py-3 text-left">Requested</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-gray-50"
                  >
                    {/* USER */}
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.user?.name || "—"}</p>
                      <p className="text-xs text-gray-500">
                        {r.user?.email}
                      </p>
                    </td>

                    {/* BUSINESS */}
                    <td className="px-4 py-3">
                      <p>{r.businessName || "—"}</p>
                      <p className="text-xs text-gray-500">
                        {r.businessType || "—"}
                      </p>
                    </td>

                    {/* DOCS */}
                    <td className="px-4 py-3 text-xs space-y-1">
                      <div>PAN: {r.panNumber || "—"}</div>
                      <div>GST: {r.gstNumber || "—"}</div>
                      <div>Aadhaar: ****{r.aadhaarLast4 || "—"}</div>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/sellers/requests/${r.id}`}
                        className="text-blue-600 text-xs font-semibold hover:underline"
                      >
                        View
                      </Link>

                      <button
                        disabled={actionLoading === r.id}
                        onClick={() => approve(r.id)}
                        className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        disabled={actionLoading === r.id}
                        onClick={() => reject(r.id)}
                        className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
