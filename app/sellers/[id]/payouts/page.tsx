"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Banknote } from "lucide-react"; // Assuming lucide-react is installed

export default function SellerPayoutsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function fetchPayouts() {
    try {
      setLoading(true);
      const res = await api.get(`/admin/sellers/${id}/payouts`);
      setPayouts(res.data || []);
    } catch (err) {
      console.error("Failed to load payouts", err);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchPayouts();
  }, [id]);

  async function approvePayout(payoutId: number) {
    if (!confirm("Approve this payout request?")) return;
    try {
      setActionLoading(payoutId);
      await api.patch(`/admin/payouts/${payoutId}/approve`);
      fetchPayouts();
    } catch {
      alert("Failed to approve payout");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectPayout(payoutId: number) {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;
    try {
      setActionLoading(payoutId);
      await api.patch(`/admin/payouts/${payoutId}/reject`, { reason });
      fetchPayouts();
    } catch {
      alert("Failed to reject payout");
    } finally {
      setActionLoading(null);
    }
  }

  async function markPaid(payoutId: number) {
    const referenceId = prompt("Enter transaction reference / UTR");
    if (!referenceId) return;
    try {
      setActionLoading(payoutId);
      await api.patch(`/admin/payouts/${payoutId}/paid`, {
        referenceId,
        method: "ONLINE",
      });
      fetchPayouts();
    } catch (err) {
      alert("Failed to mark payout as paid");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange mb-4"></div>
          <p className="text-amazon-mutedText">Loading payouts...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amazon-text flex items-center gap-2">
            <Banknote className="text-amazon-orange" />
            Seller Payouts
          </h1>
          <p className="text-sm text-amazon-mutedText bg-gray-100 px-3 py-1 rounded-full">
            Seller ID: {id}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {payouts.length === 0 ? (
            <div className="p-12 text-center">
              <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-amazon-mutedText font-medium">No payout requests found for this seller.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-bold text-gray-600">ID</th>
                    <th className="text-left font-bold text-gray-600">Amount</th>
                    <th className="text-left font-bold text-gray-600">Status</th>
                    <th className="text-left font-bold text-gray-600">Method</th>
                    <th className="text-left font-bold text-gray-600">Created At</th>
                    <th className="text-right p-4 font-bold text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 font-mono text-xs text-gray-500">#{p.id}</td>
                      <td className="font-bold text-amazon-text text-base">
                        ₹{Number(p.amount).toLocaleString()}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="text-gray-600 font-medium">{p.method || "—"}</td>
                      <td className="text-gray-500 italic text-xs">
                        {new Date(p.createdAt).toLocaleDateString()} <br />
                        <span className="opacity-60">{new Date(p.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* DETAIL LINK */}
                          <Link
                            href={`/sellers/${id}/payouts/${p.id}`}
                            className="p-2 text-gray-400 hover:text-amazon-orange transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>

                          {p.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => approvePayout(p.id)}
                                disabled={actionLoading === p.id}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                {actionLoading === p.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => rejectPayout(p.id)}
                                disabled={actionLoading === p.id}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                {actionLoading === p.id ? "..." : "Reject"}
                              </button>
                            </>
                          )}

                          {p.status === "APPROVED" && (
                            <button
                              onClick={() => markPaid(p.id)}
                              disabled={actionLoading === p.id}
                              className="bg-amazon-orange hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              {actionLoading === p.id ? "..." : "Mark Paid"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

  );
}

/* ================= UI HELPERS ================= */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: any }> = {
    PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: ClockIcon },
    APPROVED: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckIcon },
    PAID: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
    REJECTED: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  };

  const style = map[status] || { color: "bg-gray-100 text-gray-700 border-gray-200", icon: null };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center w-fit gap-1 ${style.color}`}>
      {status}
    </span>
  );
}

// Minimal Icons for badge if Lucide is not enough
function ClockIcon({ size = 12 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CheckIcon({ size = 12 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
