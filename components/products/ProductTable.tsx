"use client";

import { Edit, Eye, Package, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= COMPONENT ================= */

export default function ProductTable({ products }: { products: any[] }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-amazon-lightGray/50 border-b border-amazon-borderGray text-amazon-mutedText">
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Product</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Category</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Pricing</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Inventory</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Status</th>

          </tr>
        </thead>

        <tbody className="divide-y divide-amazon-borderGray/30">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-20 text-center">
                <div className="flex flex-col items-center opacity-30">
                  <Package size={48} />
                  <p className="mt-2 font-black uppercase tracking-widest text-xs">No Products Found</p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const img = product.img1
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product.img1}`
                : "/placeholder.png";

              const isLowStock = product.stock <= 5;

              return (
                <tr key={product.id} className="hover:bg-amazon-lightGray/30 transition-all group">
                  {/* PRODUCT IMAGE & TITLE */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amazon-borderGray bg-white flex-shrink-0">
                        <img src={img} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-black text-amazon-text tracking-tight text-base line-clamp-1">
                          {product.title}
                        </div>
                        <div className="text-[10px] text-amazon-mutedText font-bold uppercase tracking-tighter">
                          SKU: {product.sku || `PROD-${product.id}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-5">
                    <span className="bg-amazon-lightGray text-amazon-navy px-2 py-1 rounded-md font-black text-[10px] uppercase tracking-wider">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </td>

                  {/* PRICING */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <span className="text-amazon-text font-black text-sm">₹{product.price}</span>
                    </div>
                  </td>

                  {/* STOCK */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className={`flex items-center gap-1.5 font-bold ${isLowStock ? "text-amazon-danger" : "text-amazon-text"}`}>
                        {isLowStock && <AlertTriangle size={14} />}
                        {product.stock}
                        <span className="text-[10px] text-amazon-mutedText uppercase font-black">Units</span>
                      </div>
                      {isLowStock && (
                        <span className="text-[9px] font-black uppercase text-amazon-danger tracking-tighter mt-0.5">
                          Restock Required
                        </span>
                      )}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    {product.isActive ? (
                      <Badge color="green" label="Active" />
                    ) : (
                      <Badge color="gray" label="Draft" />
                    )}
                  </td>

                  {/* ACTIONS */}
                                  </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

type BadgeColor = "green" | "red" | "gray";
interface BadgeProps {
  label: string;
  color: BadgeColor;
}

function Badge({ label, color }: BadgeProps) {
  const styles: Record<BadgeColor, string> = {
    green: "bg-green-50 text-amazon-success border-green-100",
    red: "bg-red-50 text-amazon-danger border-red-100",
    gray: "bg-amazon-lightGray text-amazon-mutedText border-amazon-borderGray",
  };

  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tight rounded-full border ${styles[color]}`}>
      {label}
    </span>
  );
}