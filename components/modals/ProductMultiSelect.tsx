"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X, Search, Loader2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
};

export default function ProductMultiSelect({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/products/search", {
          params: { q: query },
        });
        setResults(res.data || []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const addProduct = (product: Product) => {
    if (value.includes(product.id)) return;
    onChange([...value, product.id]);
    setQuery("");
    setResults([]);
  };

  const removeProduct = (id: number) => {
    onChange(value.filter((pid) => pid !== id));
  };

  return (
    <div className="p-2 space-y-3 bg-white">
      {/* SEARCH INPUT AREA */}
      <div className="relative group">
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search products to drop..."
          className="w-full pl-10 pr-4 py-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-lg font-bold text-amazon-darkBlue placeholder:text-amazon-mutedText focus:bg-white transition-all outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-amazon-orange" size={18} />
        )}
      </div>

      {/* SEARCH RESULTS DROPDOWN */}
      {results.length > 0 && (
        <div className="border-4 border-amazon-darkBlue bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] max-h-56 overflow-auto z-20 relative">
          {results.map((p:any) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              className="w-full text-left px-4 py-3 border-b-2 border-amazon-borderGray last:border-none hover:bg-amazon-orange hover:text-amazon-darkBlue transition-colors flex justify-between items-center group"
            >
              <span className="font-bold text-amazon-darkBlue group-hover:text-amazon-darkBlue">
                {p.title}
              </span>
              <span className="text-[10px] font-black bg-amazon-darkBlue text-white px-2 py-0.5 rounded">
                ID: {p.id}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* SELECTED PRODUCTS (TAGS) */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {value.map((id) => (
            <div
              key={id}
              className="flex items-center gap-2 bg-amazon-navy text-white px-3 py-1.5 rounded-full border-2 border-amazon-darkBlue shadow-[2px_2px_0px_0px_rgba(255,153,0,1)] text-xs font-black uppercase tracking-tight"
            >
              ID: {id}
              <button
                type="button"
                onClick={() => removeProduct(id)}
                className="hover:text-amazon-orange transition-colors"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}