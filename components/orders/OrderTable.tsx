"use client";

import { Eye, ShoppingBag, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderTable({ orders }: { orders: any[] }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-amazon-borderGray shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-amazon-lightGray/50 border-b border-amazon-borderGray text-amazon-mutedText">
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Order ID</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Customer</th>
            <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Package</th>
            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Total Amount</th>
            <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Status</th>

          </tr>
        </thead>

        <tbody className="divide-y divide-amazon-borderGray/30">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-20 text-center">
                <div className="flex flex-col items-center opacity-30">
                  <ShoppingBag size={48} />
                  <p className="mt-2 font-black uppercase tracking-widest text-xs">No Orders Found</p>
                </div>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-amazon-lightGray/30 transition-all group cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                {/* ORDER ID */}
                <td className="px-6 py-5">
                  <div className="font-black text-amazon-darkBlue tracking-tight">
                    #{order.id.toString().padStart(6, '0')}
                  </div>
                  <div className="text-[10px] text-amazon-mutedText font-bold uppercase tracking-tighter">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                </td>

                {/* CUSTOMER */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-black text-amazon-text tracking-tight uppercase text-xs">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-amazon-mutedText font-medium lowercase">
                      {order.customerEmail}
                    </span>
                  </div>
                </td>

                {/* ITEMS COUNT */}
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-amazon-lightGray rounded-md font-black text-[10px] text-amazon-darkBlue">
                    {order.items} {order.items === 1 ? 'ITEM' : 'ITEMS'}
                  </div>
                </td>

                {/* TOTAL */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-black text-amazon-text text-sm">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-amazon-mutedText font-black uppercase">
                      <CreditCard size={10} /> {order.paymentMethod || 'PREPAID'}
                    </div>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-5 text-center">
                  <Badge 
                    label={order.status} 
                    type={order.status} 
                  />
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================= BADGE COMPONENT ================= */

function Badge({ label, type }: { label: string; type: string }) {
  const getStyles = () => {
    switch (type) {
      case "DELIVERED":
        return "bg-green-50 text-amazon-success border-green-100";
      case "CANCELLED":
      case "FAILED":
        return "bg-red-50 text-amazon-danger border-red-100";
      case "SHIPPED":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "PENDING":
      case "PROCESSING":
        return "bg-orange-50 text-amazon-orange border-orange-100";
      default:
        return "bg-amazon-lightGray text-amazon-mutedText border-amazon-borderGray";
    }
  };

  return (
    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStyles()}`}>
      {label}
    </span>
  );
}