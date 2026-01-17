"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function EditProductSubtypePage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [subtypeRes, typesRes] = await Promise.all([
        api.get(`/product-subtypes/${id}`),
        api.get("/product-types"),
      ]);

      setName(subtypeRes.data.name);
      setTypeId(subtypeRes.data.typeId.toString());
      setTypes(typesRes.data);
      setLoading(false);
    }

    loadData();
  }, [id]);

  const submit = async () => {
    await api.patch(`/product-subtypes/${id}`, {
      name,
      typeId: Number(typeId),
    });

    router.push("/product-subtypes");
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
        <h1 className="text-xl font-bold">Edit Product Subtype</h1>

        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="Subtype name"
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
