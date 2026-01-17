"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function ProductTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    api
      .get("/product-types", {
        params: categoryId ? { categoryId } : {},
      })
      .then(res => setTypes(res.data));
  }, [categoryId]);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Types</h1>
          <Link
            href="/product-types/create"
            className="bg-amazon-orange px-4 py-2 rounded font-semibold"
          >
            + Add Type
          </Link>
        </div>

        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="bg-white rounded border">
          {types.map(t => (
            <div
              key={t.id}
              className="flex justify-between px-4 py-3 border-b"
            >
              <span>{t.name}</span>
              <Link
                href={`/product-types/edit/${t.id}`}
                className="text-amazon-orange font-medium"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
