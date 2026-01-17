"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function SellerRequestDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadRequest() {
      try {
        const res = await api.get(`/admin/sellers/requests/${id}`);
        setRequest(res.data);
      } catch {
        router.push("/sellers/requests");
      } finally {
        setLoading(false);
      }
    }

    loadRequest();
  }, [id, router]);

  const approve = async () => {
    if (!confirm("Approve this seller?")) return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/sellers/requests/${id}/approve`);
      router.replace("/sellers/requests");
    } catch {
      alert("Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/sellers/requests/${id}/reject`, { reason });
      router.replace("/sellers/requests");
    } catch {
      alert("Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-gray-500">
          Loading seller request…
        </p>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-red-600">
          Seller request not found
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Seller Request #{request.id}
          </h1>

          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${statusColor[request.status]}`}
          >
            {request.status}
          </span>
        </div>

        {/* USER INFO */}
        <section className="bg-white border rounded-xl p-6 space-y-1">
          <h3 className="font-semibold mb-2">User Information</h3>
          <p><b>Name:</b> {request.user?.name || "—"}</p>
          <p><b>Email:</b> {request.user?.email}</p>
        </section>

        {/* BUSINESS INFO */}
        <section className="bg-white border rounded-xl p-6 space-y-1">
          <h3 className="font-semibold mb-2">Business Details</h3>
          <p><b>Business Name:</b> {request.businessName || "—"}</p>
          <p><b>Business Type:</b> {request.businessType || "—"}</p>
          <p><b>PAN:</b> {request.panNumber || "—"}</p>
          <p><b>GST:</b> {request.gstNumber || "—"}</p>
          <p>
            <b>Aadhaar:</b>{" "}
            {request.aadhaarLast4 ? `****${request.aadhaarLast4}` : "—"}
          </p>
        </section>

        {/* DECISION INFO */}
        {request.status !== "PENDING" && (
          <section className="bg-gray-50 border rounded-xl p-6 space-y-1">
            <h3 className="font-semibold mb-2">Decision</h3>

            {request.approvedAt && (
              <p>
                <b>Approved At:</b>{" "}
                {new Date(request.approvedAt).toLocaleString()}
              </p>
            )}

            {request.reason && (
              <p className="text-red-600">
                <b>Reason:</b> {request.reason}
              </p>
            )}
          </section>
        )}

        {/* ACTIONS */}
        {request.status === "PENDING" && (
          <div className="flex gap-4">
            <button
              onClick={approve}
              disabled={actionLoading}
              className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              Approve Seller
            </button>

            <button
              onClick={reject}
              disabled={actionLoading}
              className="px-5 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              Reject Seller
            </button>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
