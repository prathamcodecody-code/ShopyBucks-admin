"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { Plus, Trash2, Save, Settings2, ListFilter } from "lucide-react";
import toast from "react-hot-toast";

/* ---------------- TYPES ---------------- */

type Category = {
  id: number;
  name: string;
};

type Attribute = {
  id: number;
  name: string;
  slug: string;
  isFilterable: boolean;
};

type CategoryFilter = {
  attributeId: number;
  displayName: string;
  sortOrder: number;
  attribute: Attribute;
};

export default function AdminCategoryFiltersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [filters, setFilters] = useState<CategoryFilter[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/admin/attributes").then((res) =>
      setAttributes(res.data.filter((a: Attribute) => a.isFilterable))
    );
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    api
      .get("/admin/category-filters", { params: { categoryId } })
      .then((res) => setFilters(res.data))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const exists = (attributeId: number) =>
    filters.some((f) => f.attributeId === attributeId);

  const addFilter = async (attr: Attribute) => {
    try {
      await api.post("/admin/category-filters", {
        categoryId,
        attributeId: attr.id,
        displayName: attr.name,
        sortOrder: filters.length + 1,
      });
      toast.success("Filter added");
      reload();
    } catch {
      toast.error("Failed to add filter");
    }
  };

  const updateFilter = async (f: CategoryFilter) => {
    try {
      await api.post("/admin/category-filters", {
        categoryId,
        attributeId: f.attributeId,
        displayName: f.displayName,
        sortOrder: f.sortOrder,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const removeFilter = async (attributeId: number) => {
    if (!confirm("Remove this filter?")) return;
    try {
      await api.delete("/admin/category-filters", {
        params: { categoryId, attributeId },
      });
      toast.success("Removed");
      reload();
    } catch {
      toast.error("Remove failed");
    }
  };

  const reload = async () => {
    const res = await api.get("/admin/category-filters", {
      params: { categoryId },
    });
    setFilters(res.data);
  };

  return (
    <AdminLayout>
      <div className="bg-amazon-lightGray min-h-screen py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* HEADER */}
          <div className="mb-8 flex items-center gap-3">
            <Settings2 className="text-amazon-navy" size={32} />
            <h1 className="text-2xl font-bold text-amazon-text tracking-tight">
              Manage Category Filters
            </h1>
          </div>

          {/* CATEGORY SELECT CARD */}
          <div className="bg-white border border-amazon-borderGray rounded-md p-6 shadow-sm mb-6">
            <label className="block text-sm font-bold text-amazon-text mb-2">
              Select a Category to configure
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full p-2.5 border border-amazon-borderGray rounded focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange outline-none bg-amazon-lightGray/30 transition-all font-medium"
            >
              <option value="">Choose a Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {!categoryId ? (
            <div className="text-center py-20 bg-white/50 border-2 border-dashed border-amazon-borderGray rounded-lg">
              <ListFilter size={48} className="mx-auto text-amazon-borderGray mb-4" />
              <p className="text-amazon-mutedText font-medium">Select a category above to view and manage its filters.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* ACTIVE FILTERS SECTION */}
              <div className="bg-white border border-amazon-borderGray rounded-md shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-amazon-borderGray flex justify-between items-center">
                  <h2 className="font-bold text-amazon-text uppercase text-xs tracking-wider">
                    Currently Active Filters
                  </h2>
                  <span className="bg-amazon-navy text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {filters.length} Filters
                  </span>
                </div>

                <div className="divide-y divide-amazon-borderGray">
                  {filters.length === 0 ? (
                    <div className="p-8 text-center text-amazon-mutedText italic text-sm">
                      No filters have been assigned to this category yet.
                    </div>
                  ) : (
                    filters
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((f) => (
                        <div
                          key={f.attributeId}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-amazon-lightGray/20 transition-colors"
                        >
                          <div className="flex-1 min-w-[150px]">
                            <p className="text-xs font-bold text-amazon-mutedText uppercase mb-0.5">Attribute</p>
                            <p className="text-amazon-text font-bold">{f.attribute.name}</p>
                          </div>

                          <div className="w-full sm:w-auto">
                            <p className="text-xs font-bold text-amazon-mutedText uppercase mb-0.5">Label</p>
                            <input
                              value={f.displayName}
                              onChange={(e) =>
                                setFilters((prev) =>
                                  prev.map((x) =>
                                    x.attributeId === f.attributeId
                                      ? { ...x, displayName: e.target.value }
                                      : x
                                  )
                                )
                              }
                              className="w-full border border-amazon-borderGray px-2 py-1.5 rounded focus:border-amazon-orange outline-none text-sm"
                            />
                          </div>

                          <div className="w-20">
                            <p className="text-xs font-bold text-amazon-mutedText uppercase mb-0.5">Order</p>
                            <input
                              type="number"
                              value={f.sortOrder}
                              onChange={(e) =>
                                setFilters((prev) =>
                                  prev.map((x) =>
                                    x.attributeId === f.attributeId
                                      ? { ...x, sortOrder: Number(e.target.value) }
                                      : x
                                  )
                                )
                              }
                              className="w-full border border-amazon-borderGray px-2 py-1.5 rounded focus:border-amazon-orange outline-none text-sm text-center"
                            />
                          </div>

                          <div className="flex gap-2 self-end sm:self-center">
                            <button
                              onClick={() => updateFilter(f)}
                              title="Save Changes"
                              className="p-2 text-amazon-navy hover:bg-amazon-lightGray rounded transition-colors"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => removeFilter(f.attributeId)}
                              title="Remove Filter"
                              className="p-2 text-amazon-danger hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* AVAILABLE ATTRIBUTES SECTION */}
              <div className="bg-white border border-amazon-borderGray rounded-md shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-amazon-borderGray">
                  <h2 className="font-bold text-amazon-text uppercase text-xs tracking-wider">
                    Available Attributes
                  </h2>
                </div>
                <div className="divide-y divide-amazon-borderGray max-h-96 overflow-y-auto">
                  {attributes
                    .filter((a) => !exists(a.id))
                    .map((attr) => (
                      <div
                        key={attr.id}
                        className="flex justify-between items-center p-4 hover:bg-amazon-lightGray/20 transition-colors"
                      >
                        <div>
                          <p className="text-amazon-text font-bold">{attr.name}</p>
                          <p className="text-[10px] text-amazon-mutedText font-mono">{attr.slug}</p>
                        </div>
                        <button
                          onClick={() => addFilter(attr)}
                          className="bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text text-sm font-bold px-4 py-1.5 rounded shadow-sm border border-[#a88734] transition-all flex items-center gap-2"
                        >
                          <Plus size={16} /> Add Filter
                        </button>
                      </div>
                    ))}
                  {attributes.filter((a) => !exists(a.id)).length === 0 && (
                    <div className="p-8 text-center text-amazon-mutedText text-sm italic">
                      All filterable attributes are already active.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}