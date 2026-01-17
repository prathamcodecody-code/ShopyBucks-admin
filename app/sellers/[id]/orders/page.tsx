"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function SellerOrdersPage() {
  const { id } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get(
          `/admin/sellers/${id}/orders`
        );
        setOrders(res.data.orders || []);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [id]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">
          Seller Orders
        </h1>

        {loading && <p>Loading orders…</p>}

        {!loading && orders.length === 0 && (
          <p className="text-gray-500">
            No orders for this seller.
          </p>
        )}

        {!loading && orders.length > 0 && (
          <div className="bg-white border rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">
                      #{o.order.id}
                    </td>

                    <td className="px-4 py-3">
                      {o.order.user.name}
                    </td>

                    <td className="px-4 py-3">
                      {o.items.length}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      ₹{o.totalAmount}
                    </td>

                    <td className="px-4 py-3">
                      {o.status}
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString()}
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
