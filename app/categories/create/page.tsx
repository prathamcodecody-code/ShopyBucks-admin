"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      await api.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/categories");
    } catch (err) {
      console.error(err);
      alert("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-brandPink mb-6">
        Create Category
      </h1>

      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-4">
        {/* NAME */}
        <div>
          <label className="block mb-1 font-semibold">Category Name</label>
          <input
            className="border p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="block mb-1 font-semibold">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        <button
          onClick={create}
          disabled={loading}
          className="w-full mt-2 px-4 py-2 bg-amazon-orange text-white rounded hover:bg-amazon-orangeHover disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </AdminLayout>
  );
}
