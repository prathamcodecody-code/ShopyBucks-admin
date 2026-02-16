"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { ChevronLeft, Save, Info, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

/* ---------------- TYPES ---------------- */

type AttributeType = "TEXT" | "NUMBER" | "BOOLEAN" | "RANGE";

type Attribute = {
  id: number;
  name: string;
  slug: string;
  type: AttributeType;
  isFilterable: boolean;
};

/* ---------------- PAGE ---------------- */

export default function EditAttributePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeType>("TEXT");
  const [isFilterable, setIsFilterable] = useState(true);

  /* ---------------- FETCH ATTRIBUTE ---------------- */

  useEffect(() => {
    if (!id) return;

    const fetchAttribute = async () => {
      try {
        const res = await api.get(`/admin/attributes/${id}`);
        const attr: Attribute = res.data;

        setName(attr.name);
        setType(attr.type);
        setIsFilterable(attr.isFilterable);
      } catch (err) {
        console.error(err);
        setError("Failed to load attribute data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [id]);

  /* ---------------- SUBMIT ---------------- */

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/admin/attributes/${id}`, {
        name: name.trim(),
        isFilterable,
      });

      toast.success("Attribute updated successfully");
      router.push("/admin/attributes");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update attribute");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="text-amazon-mutedText font-medium">Loading attribute details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 max-w-xl mx-auto text-center">
          <div className="bg-red-50 text-amazon-danger p-6 rounded-lg border border-red-100 flex flex-col items-center gap-4">
            <AlertCircle size={40} />
            <h2 className="text-xl font-bold">{error}</h2>
            <button 
              onClick={() => router.back()}
              className="text-sm font-bold underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-amazon-lightGray min-h-screen">
        {/* Header / Breadcrumb */}
        <div className="max-w-2xl mx-auto mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1 text-amazon-mutedText hover:text-amazon-text font-bold text-xs uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft size={16} /> Back to Attributes
          </button>
          <h1 className="text-2xl font-bold text-amazon-text tracking-tight">Edit Attribute</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-amazon-borderGray shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider ml-1">
                  Attribute Name
                </label>
                <input
                  className="w-full border border-amazon-borderGray px-4 py-3 rounded-md focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange outline-none font-bold text-amazon-text transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Material, Screen Size..."
                />
              </div>

              {/* Type (READ ONLY) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-amazon-mutedText uppercase tracking-wider ml-1">
                  System Data Type
                </label>
                <div className="relative group cursor-not-allowed">
                  <input
                    className="w-full border border-amazon-borderGray px-4 py-3 rounded-md bg-amazon-lightGray text-amazon-mutedText font-black tracking-widest uppercase text-xs"
                    value={type}
                    disabled
                  />
                </div>
                <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md border border-gray-100 mt-2">
                  <Info size={16} className="text-amazon-navy mt-0.5" />
                  <p className="text-[11px] text-amazon-mutedText leading-relaxed font-medium">
                    The attribute type <strong>{type}</strong> is locked. It cannot be changed after creation to maintain data integrity across existing products.
                  </p>
                </div>
              </div>

              {/* Filterable */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 bg-amazon-lightGray/30 border border-amazon-borderGray rounded-md cursor-pointer hover:bg-amazon-lightGray/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFilterable}
                    onChange={(e) => setIsFilterable(e.target.checked)}
                    className="w-5 h-5 accent-amazon-orange border-amazon-borderGray rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-sm font-bold text-amazon-text">Enable as Filter</span>
                    <span className="block text-[11px] text-amazon-mutedText font-medium">Allow customers to filter products using this attribute on the storefront.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-amazon-lightGray">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-amazon-borderGray rounded-md font-bold text-sm text-amazon-text hover:bg-amazon-lightGray transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-2.5 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text font-black text-sm uppercase tracking-wider rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amazon-text border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Attribute
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}