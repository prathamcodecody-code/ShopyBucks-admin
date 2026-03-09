"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminProducts } from "@/lib/products";
import ProductTable from "@/components/products/ProductTable";
import ProductFilters from "@/components/products/ProductFilters";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts({
        page,
        limit: 10, // Adjusted for better view
        ...filters,
      });
      setProducts(data.products || []);
      setPages(data.pages || 1);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-amazon-darkBlue">
              <div className="p-2 bg-amazon-darkBlue text-white rounded-xl">
                <Package size={24} />
              </div>
              Inventory Management
            </h1>
            <p className="text-amazon-mutedText font-medium mt-1">
              View, track, and manage your product stock levels
            </p>
          </div>

          
        </div>

        {/* FILTERS */}
        <ProductFilters 
          onChange={(newFilters: any) => {
            setFilters(newFilters);
            setPage(1); // Reset to page 1 on search
          }} 
        />

        {/* TABLE */}
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          <ProductTable products={products} />
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-amazon-borderGray/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">
            Showing Page <span className="text-amazon-darkBlue">{page}</span> of {pages}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-colors text-amazon-darkBlue"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Simple Page Numbers */}
            <div className="flex gap-1">
              {[...Array(pages)].map((_, i) => {
                const p = i + 1;
                // Only show current, first, last, and neighbors if many pages
                if (pages > 5 && p !== 1 && p !== pages && Math.abs(p - page) > 1) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                      page === p 
                      ? "bg-amazon-darkBlue text-white shadow-md" 
                      : "text-amazon-mutedText hover:bg-amazon-lightGray"
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
              className="p-2 border border-amazon-borderGray rounded-lg disabled:opacity-30 hover:bg-amazon-lightGray transition-colors text-amazon-darkBlue"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}