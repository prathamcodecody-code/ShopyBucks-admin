"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PayoutDetailsPage() {
  const params = useParams();
  const sellerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const payoutId = Array.isArray(params.payoutId)
    ? params.payoutId[0]
    : params.payoutId;

  const router = useRouter();
  const [payout, setPayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!payoutId) return;

    api
      .get(`/admin/payouts/${payoutId}`)
      .then((res) => setPayout(res.data))
      .catch(() => setPayout(null))
      .finally(() => setLoading(false));
  }, [payoutId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gray-500">
          Loading payout details…
        </div>
      </AdminLayout>
    );
  }

  if (!payout) {
    return (
      
        <div className="py-20 text-center">
          <p className="text-red-500 font-bold">Payout not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-amazon-orange font-bold"
          >
            Go Back
          </button>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payout #{payout.id}</h1>
          <Link
            href={`/sellers/${sellerId}/payouts`}
            className="text-amazon-orange font-bold"
          >
            ← Back to payouts
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <Row label="Seller ID" value={payout.sellerId} />
          <Row label="Amount" value={`₹${Number(payout.amount).toLocaleString()}`} />
          <Row label="Status" value={payout.status} />
          <Row label="Method" value={payout.method || "—"} />
          <Row label="Reference ID" value={payout.referenceId || "—"} />
          <Row
            label="Created At"
            value={new Date(payout.createdAt).toLocaleString()}
          />
        </div>
      </div>

  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}
