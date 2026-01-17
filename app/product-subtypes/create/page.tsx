"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function CreateProductSubtype() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    api.get("/product-types").then(res => setTypes(res.data));
  }, []);

  const submit = async () => {
    await api.post("/product-subtypes", {
      name,
      typeId: Number(typeId),
    });
    router.push("/product-subtypes");
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold">Create Product Subtype</h1>

        <select
          className="border px-3 py-2 rounded w-full"
          onChange={e => setTypeId(e.target.value)}
        >
          <option value="">Select Product Type</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Subtype name"
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
