"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSellers() {
      try {
        const res = await api.get("/admin/sellers");
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to load sellers", err);
      } finally {
        setLoading(false);
      }
    }

    loadSellers();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold text-amazon-text">
          Approved Sellers
        </h1>

        {loading && (
          <p className="text-amazon-mutedText">Loading sellers…</p>
        )}

        {!loading && sellers.length === 0 && (
          <p className="text-amazon-mutedText">
            No approved sellers yet
          </p>
        )}

        {!loading && sellers.length > 0 && (
          <div className="bg-white border rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-amazon-lightGray">
                <tr>
                  <th className="px-4 py-3 text-left">Seller</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Approved At</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((s) => (
                  <tr
  key={s.id}
  onClick={() => router.push(`/sellers/${s.id}`)}
  className="border-t cursor-pointer hover:bg-gray-50"
>
                    <td className="px-4 py-3 font-medium">
                      {s.name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {s.email}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {s.sellerApprovedAt
                        ? new Date(s.sellerApprovedAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                        {s.sellerStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/sellers/${s.id}`}
                        className="text-amazon-orange font-semibold text-sm hover:underline"
                      >
                        View
                      </Link>
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
