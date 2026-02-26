"use client";

import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function SellerProductsPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const res = await api.get(
        `/admin/sellers/${id}/products`
      );
      setProducts(res.data.products || []);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(
    productId: number,
    status: string
  ) {
    if (status === "ACTIVE") {
      await api.patch(`/admin/products/${productId}/block`);
    } else {
      await api.patch(`/admin/products/${productId}/unblock`);
    }
    loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, [id]);

  return (

      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">
          Seller Products
        </h1>

        {loading && <p>Loading products…</p>}

        {!loading && products.length === 0 && (
          <p className="text-gray-500">
            No products from this seller.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="bg-white border rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      {p.title}
                    </td>

                    <td className="px-4 py-3">
                      {p.category?.name || "—"}
                    </td>

                    <td className="px-4 py-3">
                      ₹{p.price}
                    </td>

                    <td className="px-4 py-3">
                      {p.stock}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {p.status}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleStatus(p.id, p.status)
                        }
                        className={`px-3 py-1 rounded text-white text-xs ${
                          p.status === "ACTIVE"
                            ? "bg-red-500"
                            : "bg-green-600"
                        }`}
                      >
                        {p.status === "ACTIVE"
                          ? "Block"
                          : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

  );
}
