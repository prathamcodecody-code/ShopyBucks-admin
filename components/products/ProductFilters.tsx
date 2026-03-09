"use client";

import { useState } from "react";
import { Search, Filter, RefreshCcw } from "lucide-react";

export default function ProductFilters({ onChange }: any) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const applyFilters = () => {
    onChange({
      search,
      status,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    onChange({ search: "", status: "" });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-amazon-borderGray shadow-sm flex flex-col md:flex-row items-center gap-4 mb-8">
      
      {/* SEARCH INPUT */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-3 text-amazon-mutedText" size={18} />
        <input
          type="text"
          placeholder="Search by title, SKU, or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-amazon-lightGray/50 border-none p-3 pl-10 rounded-xl focus:ring-2 focus:ring-amazon-orange outline-none font-medium text-sm text-amazon-text placeholder:text-amazon-mutedText/60"
        />
      </div>

      {/* STATUS DROPDOWN */}
      <div className="relative w-full md:w-48">
        <Filter className="absolute left-3 top-3 text-amazon-mutedText" size={16} />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-amazon-lightGray/50 border-none p-3 pl-10 rounded-xl focus:ring-2 focus:ring-amazon-orange outline-none font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Draft/Inactive</option>
        </select>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={applyFilters}
          className="flex-1 md:flex-none bg-amazon-darkBlue hover:bg-amazon-navy text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-gray-200"
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          title="Reset Filters"
          className="p-3 bg-amazon-lightGray hover:bg-amazon-borderGray text-amazon-navy rounded-xl transition-all"
        >
          <RefreshCcw size={18} />
        </button>
      </div>
    </div>
  );
}