"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAdminOrders } from "@/lib/orders";
import OrderTable from "@/components/orders/OrderTable";
import { ShoppingCart, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 15;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders({
        page,
        limit,
      });
      setOrders(data.orders || []);
      setPages(data.pages || 1);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-amazon-darkBlue">
              <div className="p-2 bg-amazon-darkBlue text-white rounded-xl">
                <ShoppingCart size={24} />
              </div>
              Customer Orders
            </h1>
            <p className="text-amazon-mutedText font-medium mt-1">
              Monitor sales, tracking, and fulfillment status across the platform
            </p>
          </div>

        </div>

        {/* TABLE SECTION */}
        <div className={loading ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
          {loading && orders.length === 0 ? (
            <div className="bg-white border border-amazon-borderGray rounded-2xl p-20 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-mutedText">Synchronizing Orders...</p>
            </div>
          ) : (
            <OrderTable orders={orders} />
          )}
        </div>

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-amazon-borderGray/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">
              Displaying <span className="text-amazon-darkBlue">{orders.length}</span> Orders on Page {page}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-colors text-amazon-darkBlue shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-1">
                {[...Array(pages)].map((_, i) => {
                  const p = i + 1;
                  // Basic logic to hide pages if there are too many
                  if (pages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== pages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                        page === p 
                        ? "bg-amazon-darkBlue text-white shadow-md shadow-blue-100" 
                        : "text-amazon-mutedText hover:bg-amazon-lightGray border border-transparent"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-colors text-amazon-darkBlue shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}