"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function SellerDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadSeller() {
      try {
        const res = await api.get(`/admin/sellers/${id}`);
        setSeller(res.data);
      } catch (err) {
        console.error("Failed to load seller", err);
        router.push("/admin/sellers");
      } finally {
        setLoading(false);
      }
    }

    loadSeller();
  }, [id, router]);

  async function suspend() {
    const reason = prompt("Enter suspension reason");
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/sellers/${id}/suspend`, { reason });

      setSeller((prev: any) => ({
        ...prev,
        sellerStatus: "SUSPENDED",
        sellerRejectedReason: reason,
      }));
    } catch {
      alert("Failed to suspend seller");
    } finally {
      setActionLoading(false);
    }
  }

  async function reactivate() {
    if (!confirm("Reactivate this seller?")) return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/sellers/${id}/reactivate`);

      setSeller((prev: any) => ({
        ...prev,
        sellerStatus: "APPROVED",
        sellerRejectedReason: null,
      }));
    } catch {
      alert("Failed to reactivate seller");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-amazon-mutedText">
        Loading seller…
      </p>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amazon-text">
        Seller Details
      </h1>

      {/* ================= BASIC PROFILE ================= */}
      <div className="bg-white border rounded-xl p-6 space-y-2">
        <p><b>Name:</b> {seller.name || "—"}</p>
        <p><b>Email:</b> {seller.email}</p>
        <p>
          <b>Status:</b>{" "}
          <span className="font-semibold">
            {seller.sellerStatus}
          </span>
        </p>
        <p>
          <b>Approved At:</b>{" "}
          {seller.sellerApprovedAt
            ? new Date(seller.sellerApprovedAt).toLocaleString()
            : "—"}
        </p>

        {seller.sellerStatus === "SUSPENDED" && seller.sellerRejectedReason && (
          <p className="text-red-600 text-sm">
            <b>Suspension Reason:</b> {seller.sellerRejectedReason}
          </p>
        )}
      </div>

      {/* ================= BUSINESS PROFILE ================= */}
      <div className="bg-white border rounded-xl p-6 space-y-2">
        <h3 className="font-semibold mb-2">Business Details</h3>

        <p><b>Business Name:</b> {seller.businessName || "—"}</p>
        <p><b>Business Type:</b> {seller.businessType || "—"}</p>
        <p><b>PAN:</b> {seller.panNumber || "—"}</p>
        <p><b>GST:</b> {seller.gstNumber || "—"}</p>
        <p>
          <b>Aadhaar:</b>{" "}
          {seller.aadhaarLast4
            ? `****${seller.aadhaarLast4}`
            : "—"}
        </p>
      </div>

      {/* ================= ADMIN ACTIONS ================= */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">Admin Actions</h3>

        {seller.sellerStatus === "APPROVED" && (
          <button
            onClick={suspend}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 hover:bg-red-600 transition-colors"
          >
            Suspend Seller
          </button>
        )}

        {seller.sellerStatus === "SUSPENDED" && (
          <button
            onClick={reactivate}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            Reactivate Seller
          </button>
        )}
      </div>
    </div>
  );
}
