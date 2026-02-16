"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { Search, Plus, Filter, Edit2, Trash2, Check, X } from "lucide-react";

type Attribute = {
  id: number;
  name: string;
  slug: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN";
  isFilterable: boolean;
};

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filterableOnly, setFilterableOnly] = useState(false);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await api.get("/admin/attributes");
      setAttributes(res.data);
    } catch (err) {
      console.error("Failed to load attributes", err);
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */
  const deleteAttribute = async (id: number) => {
    if (!confirm("Are you sure you want to delete this attribute?")) return;

    try {
      await api.delete(`/admin/attributes/${id}`);
      setAttributes(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cannot delete attribute");
    }
  };

  /* FILTER LOGIC */
  const filteredAttributes = useMemo(() => {
    return attributes.filter(a => {
      if (
        search &&
        !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !a.slug.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (typeFilter && a.type !== typeFilter) return false;
      if (filterableOnly && !a.isFilterable) return false;

      return true;
    });
  }, [attributes, search, typeFilter, filterableOnly]);

  return (
    <AdminLayout>
      <div className="p-6 bg-amazon-lightGray min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text tracking-tight">Product Attributes</h1>
            <p className="text-sm text-amazon-mutedText mt-1">Manage specifications and filterable properties for your products.</p>
          </div>

          <Link
            href="/attributes/create"
            className="flex items-center justify-center gap-2 px-6 py-2 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text font-bold rounded-md shadow-sm transition-all"
          >
            <Plus size={18} />
            Create Attribute
          </Link>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-amazon-borderGray rounded-lg p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-amazon-text font-bold text-sm border-b border-amazon-lightGray pb-2">
            <Filter size={16} className="text-amazon-orange" />
            Refine Attributes
          </div>
          
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-amazon-mutedText" size={16} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-amazon-borderGray rounded focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange outline-none text-sm transition-all"
                  placeholder="Filter by name or slug..."
                />
              </div>
            </div>

            <div className="w-48">
              <label className="block text-xs font-bold text-amazon-mutedText uppercase mb-1">Data Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full border border-amazon-borderGray bg-white rounded px-3 py-2 text-sm focus:border-amazon-orange outline-none"
              >
                <option value="">All Types</option>
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="BOOLEAN">BOOLEAN</option>
              </select>
            </div>

            <div className="pb-2.5">
              <label className="flex items-center gap-2 text-sm font-medium text-amazon-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterableOnly}
                  onChange={e => setFilterableOnly(e.target.checked)}
                  className="w-4 h-4 accent-amazon-orange border-amazon-borderGray rounded"
                />
                Filterable only
              </label>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-amazon-borderGray rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin"></div>
              <div className="text-amazon-mutedText font-medium">Loading attributes...</div>
            </div>
          ) : filteredAttributes.length === 0 ? (
            <div className="p-12 text-center">
               <div className="text-amazon-mutedText font-medium">No attributes found.</div>
               <button onClick={() => {setSearch(""); setTypeFilter(""); setFilterableOnly(false)}} className="text-amazon-orange font-bold text-sm mt-2 hover:underline">Clear all filters</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-amazon-lightGray border-b border-amazon-borderGray">
                <tr className="text-left">
                  <th className="p-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Slug</th>
                  <th className="p-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Filterable</th>
                  <th className="p-4 text-xs font-bold text-amazon-mutedText uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amazon-lightGray">
                {filteredAttributes.map(attr => (
                  <tr key={attr.id} className="hover:bg-amazon-lightGray/30 transition-colors group">
                    <td className="p-4 font-bold text-amazon-text">{attr.name}</td>
                    <td className="p-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs text-amazon-navy">{attr.slug}</code>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${
                        attr.type === 'TEXT' ? 'bg-blue-100 text-blue-700' :
                        attr.type === 'NUMBER' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {attr.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {attr.isFilterable ? (
                        <div className="flex items-center gap-1 text-amazon-success font-bold text-sm">
                           <Check size={14} strokeWidth={3} /> Yes
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amazon-mutedText text-sm">
                           <X size={14} strokeWidth={3} /> No
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/attributes/edit/${attr.id}`}
                          className="p-2 text-amazon-navy hover:bg-gray-100 rounded-md border border-transparent hover:border-amazon-borderGray transition-all"
                          title="Edit Attribute"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          onClick={() => deleteAttribute(attr.id)}
                          className="p-2 text-amazon-danger hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-all"
                          title="Delete Attribute"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}