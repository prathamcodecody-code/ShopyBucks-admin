"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CATEGORY ================= */
  useEffect(() => {
    if (!id) return;

    api
      .get(`/categories/${id}`)
      .then((res) => {
        setName(res.data.name);
        setCurrentImage(res.data.image || null);
      })
      .catch(() => {
        alert("Category not found");
        router.push("/categories");
      });
  }, [id, router]);

  /* ================= UPDATE CATEGORY ================= */
  const update = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      await api.patch(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/categories");
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-amazon-text mb-6">
        Edit Category
      </h1>

      <div className="bg-white p-6 rounded-xl shadow w-[420px] space-y-5">
        {/* NAME */}
        <div>
          <label className="block mb-1 font-semibold">Category Name</label>
          <input
            className="border p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* CURRENT IMAGE */}
        {currentImage && (
          <div>
            <label className="block mb-2 font-semibold">
              Current Image
            </label>
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${currentImage}`}
              alt="Category"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        )}

        {/* NEW IMAGE */}
        <div>
          <label className="block mb-1 font-semibold">
            Replace Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={update}
            disabled={loading}
            className="flex-1 bg-amazon-orange text-black py-2 rounded
                       hover:bg-amazon-orangeHover disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>

          <button
            onClick={() => router.push("/categories")}
            className="flex-1 border border-amazon-borderGray py-2 rounded
                       hover:bg-amazon-lightGray"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
