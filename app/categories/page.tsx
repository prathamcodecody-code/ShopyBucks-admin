"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import Link from "next/link";
import { Pencil, Plus, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ADDED: Toggle status function
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/categories/${id}`, { isActive: !currentStatus });
      toast.success("Status updated");
      loadCategories();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category? This will affect related products.")) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      loadCategories();
    } catch {
      toast.error("Error deleting category");
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amazon-text">
          Categories Management
        </h1>

        <Link
          href="/categories/create"
          className="flex items-center gap-2 px-4 py-2 rounded-md
                     bg-amazon-orange text-black font-bold text-sm
                     hover:bg-amazon-orangeHover transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-sm border border-amazon-borderGray overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-amazon-lightGray text-amazon-mutedText text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left font-bold w-16">ID</th>
              <th className="p-4 text-left font-bold w-20">Image</th>
              <th className="p-4 text-left font-bold">Name</th>
              <th className="p-4 text-left font-bold">Status</th>
              <th className="p-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-t border-amazon-borderGray hover:bg-amazon-lightGray/30 transition-colors"
              >
                <td className="p-4 text-amazon-mutedText">#{cat.id}</td>

                <td className="p-4">
                  <div className="w-10 h-10 rounded-md border border-amazon-borderGray overflow-hidden bg-white flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${cat.image}`}
                        alt={cat.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-[8px] text-amazon-mutedText uppercase font-bold text-center">
                        No Img
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-4 font-bold text-amazon-text">{cat.name}</td>

                {/* STATUS COLUMN */}
                <td className="p-4">
                  <button
                    onClick={() => toggleStatus(cat.id, cat.isActive)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase transition-all
                      ${cat.isActive 
                        ? "bg-green-100 text-amazon-success border border-amazon-success/20" 
                        : "bg-red-100 text-amazon-danger border border-amazon-danger/20"}`}
                  >
                    {cat.isActive ? (
                      <><CheckCircle size={12} /> Active</>
                    ) : (
                      <><XCircle size={12} /> Inactive</>
                    )}
                  </button>
                </td>

                <td className="p-4 text-right text-amazon-mutedText">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/product-types?categoryId=${cat.id}`}
                      className="p-2 rounded-md hover:bg-amazon-darkBlue hover:text-white transition-all"
                      title="View Collections"
                    >
                      <Eye size={18} />
                    </Link>

                    <Link
                      href={`/categories/edit/${cat.id}`}
                      className="p-2 rounded-md hover:bg-amazon-lightGray transition-all"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Link>

                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 rounded-md text-amazon-danger hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-amazon-lightGray/10">
            <p className="text-amazon-mutedText font-medium italic">
              No categories found. Start by adding one above.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
