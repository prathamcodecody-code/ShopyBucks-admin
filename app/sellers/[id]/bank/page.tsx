"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerBankDetailsPage() {
  const params = useParams();
  const sellerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchBank() {
    try {
      const res = await api.get(`/admin/sellers/${sellerId}/bank`);
      setBank(res.data);
    } catch {
      setBank(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sellerId) fetchBank();
  }, [sellerId]);

  async function verifyBank() {
    if (!confirm("Verify this bank account?")) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/sellers/${sellerId}/bank/verify`);
      fetchBank();
    } catch {
      alert("Failed to verify bank");
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectBank() {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/sellers/${sellerId}/bank/reject`, { reason });
      fetchBank();
    } catch {
      alert("Failed to reject bank");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-gray-500">
          Loading bank details…
        </p>
      </AdminLayout>
    );
  }

  if (!bank) {
    return (
      <AdminLayout>
        <p className="py-24 text-center text-red-500">
          No bank details submitted by seller.
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">Seller Bank Details</h1>

        <div className="bg-white border rounded-xl p-6 space-y-3">
          <p><b>Account Holder:</b> {bank.accountHolder}</p>
          <p><b>Account Number:</b> ****{bank.accountNumber?.slice(-4)}</p>
          <p><b>IFSC:</b> {bank.ifscCode}</p>
          <p><b>Bank Name:</b> {bank.bankName}</p>
          <p><b>UPI ID:</b> {bank.upiId || "—"}</p>

          <p>
            <b>Status:</b>{" "}
            <span className={`font-semibold ${
              bank.isVerified
                ? "text-green-600"
                : bank.rejectedReason
                ? "text-red-600"
                : "text-yellow-600"
            }`}>
              {bank.isVerified
                ? "VERIFIED"
                : bank.rejectedReason
                ? "REJECTED"
                : "PENDING"}
            </span>
          </p>

          {!bank.isVerified && bank.rejectedReason && (
            <p className="text-sm text-red-500">
              <b>Reason:</b> {bank.rejectedReason}
            </p>
          )}
        </div>

        {!bank.isVerified && (
          <div className="flex gap-4">
            <button
              disabled={actionLoading}
              onClick={verifyBank}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Verify Bank
            </button>

            <button
              disabled={actionLoading}
              onClick={rejectBank}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Reject Bank
            </button>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
