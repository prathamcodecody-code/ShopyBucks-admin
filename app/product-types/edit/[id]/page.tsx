"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function EditProductTypePage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [typeRes, catRes] = await Promise.all([
        api.get(`/product-types/${id}`),
        api.get("/categories"),
      ]);

      setName(typeRes.data.name);
      setCategoryId(typeRes.data.categoryId.toString());
      setCategories(catRes.data);
      setLoading(false);
    }

    loadData();
  }, [id]);

  const submit = async () => {
    await api.patch(`/product-types/${id}`, {
      name,
      categoryId: Number(categoryId),
    });

    router.push("/product-types");
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center py-20 text-gray-500">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold">Edit Product Type</h1>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Type name"
        />

        <button
          onClick={submit}
          className="bg-amazon-orange px-4 py-2 rounded font-semibold w-full"
        >
          Update
        </button>
      </div>
    </AdminLayout>
  );
}
