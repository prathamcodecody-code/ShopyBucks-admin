"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function ProductSubtypesPage() {
  const [subtypes, setSubtypes] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [typeId, setTypeId] = useState("");

  useEffect(() => {
    api.get("/product-types").then(res => setTypes(res.data));
  }, []);

  useEffect(() => {
    api
      .get("/product-subtypes", {
        params: typeId ? { typeId } : {},
      })
      .then(res => setSubtypes(res.data));
  }, [typeId]);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Subtypes</h1>
          <Link
            href="/product-subtypes/create"
            className="bg-amazon-orange px-4 py-2 rounded font-semibold"
          >
            + Add Subtype
          </Link>
        </div>

        <select
          value={typeId}
          onChange={e => setTypeId(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Types</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>
              {t.category?.name ? `${t.category.name} → ${t.name}` : t.name}
            </option>
          ))}
        </select>

        <div className="bg-white rounded border">
          {subtypes.map(s => (
            <div
              key={s.id}
              className="flex justify-between px-4 py-3 border-b"
            >
              <span>{s.name}</span>
              <Link
                href={`/product-subtypes/edit/${s.id}`}
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
