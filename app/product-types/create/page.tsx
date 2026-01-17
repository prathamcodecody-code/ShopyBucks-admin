"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function CreateProductType() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data));
  }, []);

  const submit = async () => {
    await api.post("/product-types", {
      name,
      categoryId: Number(categoryId),
    });
    router.push("/product-types");
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold">Create Product Type</h1>

        <select
          className="border px-3 py-2 rounded w-full"
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Type name"
          className="border px-3 py-2 rounded w-full"
          onChange={e => setName(e.target.value)}
        />

        <button
          onClick={submit}
          className="bg-amazon-orange px-4 py-2 rounded font-semibold w-full"
        >
          Create
        </button>
      </div>
    </AdminLayout>
  );
}
