"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import Link from "next/link";
import { Pencil, Plus, Eye, Trash2 } from "lucide-react";

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

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amazon-text">
          Categories
        </h1>

        <Link
          href="/categories/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-amazon-orange text-black font-semibold
                     hover:bg-amazon-orangeHover"
        >
          <Plus size={16} />
          Add Category
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-amazon-borderGray overflow-hidden">
        <table className="w-full">
          <thead className="bg-amazon-lightGray text-sm">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-t hover:bg-amazon-lightGray/50"
              >
                <td className="p-4">{cat.id}</td>
                <td className="p-4 font-medium">{cat.name}</td>

                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">

                    {/* EDIT CATEGORY */}
                    <Link
                      href={`/categories/edit/${cat.id}`}
                      className="p-2 rounded hover:bg-amazon-lightGray"
                      title="Edit Category"
                    >
                      <Pencil size={16} />
                    </Link>

                    {/* ADD PRODUCT TYPE */}
                    <Link
                      href={`/product-types/create?categoryId=${cat.id}`}
                      className="p-2 rounded hover:bg-amazon-lightGray"
                      title="Add Product Type"
                    >
                      <Plus size={16} />
                    </Link>

                    {/* VIEW PRODUCT TYPES */}
                    <Link
                      href={`/product-types?categoryId=${cat.id}`}
                      className="p-2 rounded hover:bg-amazon-lightGray"
                      title="View Product Types"
                    >
                      <Eye size={16} />
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 rounded text-red-600 hover:bg-red-50"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <p className="text-center text-amazon-mutedText py-8">
            No categories found.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
