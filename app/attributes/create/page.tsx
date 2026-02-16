"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { ChevronLeft, Plus, Settings, Layers, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

/* -------------------------------- TYPES -------------------------------- */
type Category = {
  id: number;
  name: string;
};

type AttributeType = "TEXT" | "NUMBER" | "BOOLEAN";

export default function CreateAttributePage() {
  const router = useRouter();

  /* STATE */
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeType>("TEXT");
  const [isFilterable, setIsFilterable] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const [inputType, setInputType] = useState("TEXT");

  /* VALIDATION STATE */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedCategory = categories.find(c => c.id === categoryId);

  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data));
  }, []);

  /* INLINE VALIDATION LOGIC */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!categoryId) newErrors.categoryId = "Please select a target category";
    if (!name.trim()) newErrors.name = "Attribute name is required";
    if (sortOrder < 1) newErrors.sortOrder = "Sort order must be at least 1";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      /* 1️⃣ Create attribute */
      const attrRes = await api.post("/admin/attributes", {
        name: name.trim(),
        type,
        isFilterable,
      });

      const attributeId = attrRes.data.id;

      /* 2️⃣ Attach to category */
      await api.post("/admin/attributes/attach", {
        categoryId,
        attributeId,
        isRequired,
        sortOrder,
        inputType,
      });

      toast.success("Attribute created and attached successfully");
      router.push("/admin/attributes");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create attribute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-amazon-lightGray min-h-screen">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1 text-amazon-mutedText hover:text-amazon-text font-bold text-xs uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft size={16} /> Back to Attributes
          </button>
          <h1 className="text-2xl font-bold text-amazon-text tracking-tight">Create New Attribute</h1>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          
          {/* CATEGORY CONFIG CARD */}
          <div className="bg-white border border-amazon-borderGray rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 border-b border-amazon-lightGray bg-gray-50 flex items-center gap-2">
              <Layers size={18} className="text-amazon-orange" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amazon-text">Placement & Scope</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Target Category *</label>
                <select
                  className={`w-full border px-4 py-3 rounded-md outline-none font-bold text-sm transition-all ${
                    errors.categoryId ? "border-red-500 bg-red-50" : "border-amazon-borderGray focus:border-amazon-orange"
                  }`}
                  value={categoryId}
                  onChange={e => {
                    setCategoryId(Number(e.target.value));
                    setErrors({ ...errors, categoryId: "" });
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="flex items-center gap-1 text-[11px] text-red-600 font-bold mt-1">
                    <AlertCircle size={12} /> {errors.categoryId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ATTRIBUTE DEFINITION CARD */}
          <div className="bg-white border border-amazon-borderGray rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 border-b border-amazon-lightGray bg-gray-50 flex items-center gap-2">
              <Settings size={18} className="text-amazon-orange" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amazon-text">Attribute Definition</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Display Name *</label>
                <input
                  className={`w-full border px-4 py-3 rounded-md outline-none font-bold text-sm transition-all ${
                    errors.name ? "border-red-500 bg-red-50" : "border-amazon-borderGray focus:border-amazon-orange"
                  }`}
                  placeholder="e.g. Fabric Material, Battery Capacity..."
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setErrors({ ...errors, name: "" });
                  }}
                />
                {errors.name && (
                  <p className="flex items-center gap-1 text-[11px] text-red-600 font-bold mt-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider">System Type</label>
                  <select
                    className="w-full border border-amazon-borderGray px-4 py-3 rounded-md focus:border-amazon-orange outline-none font-bold text-sm"
                    value={type}
                    onChange={e => setType(e.target.value as AttributeType)}
                  >
                    <option value="TEXT">Plain Text</option>
                    <option value="NUMBER">Numeric Value</option>
                    <option value="BOOLEAN">Yes / No (Boolean)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Seller Input UI</label>
                  <select
                    className="w-full border border-amazon-borderGray px-4 py-3 rounded-md focus:border-amazon-orange outline-none font-bold text-sm"
                    value={inputType}
                    onChange={e => setInputType(e.target.value)}
                  >
                    <option value="TEXT">Free Text Field</option>
                    <option value="SELECT">Dropdown (Single)</option>
                    <option value="MULTI_SELECT">Multi-Select List</option>
                    <option value="BOOLEAN">Checkbox / Switch</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 py-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isFilterable}
                    onChange={e => setIsFilterable(e.target.checked)}
                    className="w-5 h-5 accent-amazon-orange border-amazon-borderGray rounded"
                  />
                  <span className="text-sm font-bold text-amazon-text group-hover:text-amazon-orange transition-colors">Visible in Store Filters</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={e => setIsRequired(e.target.checked)}
                    className="w-5 h-5 accent-amazon-orange border-amazon-borderGray rounded"
                  />
                  <span className="text-sm font-bold text-amazon-text group-hover:text-amazon-orange transition-colors">Required for Sellers</span>
                </label>
              </div>

              <div className="space-y-1 max-w-[200px]">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider">Display Order</label>
                <input
                  type="number"
                  className="w-full border border-amazon-borderGray px-4 py-3 rounded-md focus:border-amazon-orange outline-none font-bold text-sm"
                  value={sortOrder}
                  onChange={e => setSortOrder(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 border border-amazon-borderGray rounded-md font-bold text-sm text-amazon-text hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex items-center gap-2 px-10 py-3 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text font-black text-sm uppercase tracking-wider rounded-md shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-amazon-text border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus size={18} />
                  Create Attribute
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}