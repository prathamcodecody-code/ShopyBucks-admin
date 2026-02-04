"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import ProductMultiSelect from "@/components/modals/ProductMultiSelect";

const SECTION_TYPES = [
  "HERO",
  "COLLECTION",
  "PRODUCT_LIST",
  "BANNER",
  "TEXT",
] as const;

const TARGETS = ["ALL", "WEB", "MOBILE"] as const;

export default function CreateHomepageSectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("HERO");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [collectionTag, setCollectionTag] = useState("");
  const [productIds, setProductIds] = useState<number[]>([]);
  const [target, setTarget] = useState("ALL");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const submit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      if (title) formData.append("title", title);
      if (subtitle) formData.append("subtitle", subtitle);
      if (linkUrl) formData.append("linkUrl", linkUrl);
      if (buttonText) formData.append("buttonText", buttonText);
      if (collectionTag) formData.append("collectionTag", collectionTag);
      if (target) formData.append("target", target);
      if (startAt) formData.append("startAt", startAt);
      if (endAt) formData.append("endAt", endAt);
      if (productIds.length > 0) {
        formData.append("productIds", JSON.stringify(productIds));
      }
      if (image) {
        formData.append("image", image);
      }
      await api.post("/admin/homepage-sections", formData);
      router.push("/homepage");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 md:p-12 text-amazon-darkBlue">
        {/* HEADER AREA */}
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
            Create Section
          </h1>
          <p className="text-amazon-mutedText font-medium text-lg">
            Drop some fresh content onto the homepage.
          </p>
        </div>

        <div className="bg-white border-4 border-amazon-darkBlue shadow-[8px_8px_0px_0px_rgba(19,25,33,1)] rounded-2xl p-8 space-y-8">
          
          {/* TYPE SELECTOR */}
          <Field label="Section Type">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 text-xs font-bold rounded-full border-2 transition-all ${
                    type === t 
                    ? "bg-amazon-orange border-amazon-darkBlue text-amazon-darkBlue scale-105 shadow-md" 
                    : "bg-amazon-lightGray border-transparent text-amazon-mutedText hover:border-amazon-borderGray"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          {/* TITLE */}
          <Field label="Main Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Summer Drop 2024"
              className="w-full p-4 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl focus:ring-4 focus:ring-amazon-orangeHover outline-none font-bold text-amazon-text transition-all placeholder:text-gray-400"
            />
          </Field>

          {/* TEXT CONTENT */}
          {type === "TEXT" && (
            <Field label="Text Content">
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={4}
                className="w-full p-4 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl focus:ring-4 focus:ring-amazon-orangeHover outline-none font-medium text-amazon-text transition-all"
                placeholder="Write something vibey..."
              />
            </Field>
          )}

          {/* IMAGE UPLOAD */}
          {(type === "HERO" || type === "BANNER" || type === "COLLECTION") && (
            <Field label="Visual Asset">
              <div className="relative border-2 border-dashed border-amazon-darkBlue rounded-xl p-8 text-center bg-amazon-lightGray hover:bg-amazon-borderGray transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-amazon-darkBlue font-bold group-hover:underline">
                  {image ? image.name : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-amazon-mutedText mt-1 uppercase">PNG, JPG up to 10MB</p>
              </div>
            </Field>
          )}

          {/* PRODUCT LIST FIXES */}
          {type === "PRODUCT_LIST" && (
            <div className="space-y-6">
              <Field label="Collection Tag">
                <input
                  value={collectionTag}
                  onChange={(e) => setCollectionTag(e.target.value)}
                  placeholder="e.g. streetwear-2024"
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium text-amazon-text"
                />
              </Field>
              
              <Field label="Select Products">
                {/* FIX: We wrap the select in a div that forces text-amazon-darkBlue 
                  and handles the input sizing via a helper class 
                */}
                <div className="border-2 border-amazon-darkBlue rounded-xl overflow-hidden bg-white text-amazon-darkBlue [&_input]:w-full [&_input]:p-3 [&_input]:text-amazon-darkBlue [&_input]:bg-transparent">
                  <ProductMultiSelect value={productIds} onChange={setProductIds} />
                </div>
              </Field>
            </div>
          )}

          {/* TARGET & SCHEDULING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-2 border-amazon-borderGray">
             <Field label="Target">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-3 bg-amazon-darkBlue text-white rounded-xl font-bold appearance-none cursor-pointer"
                >
                  {TARGETS.map((t) => (
                    <option key={t} value={t} className="text-white">{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date">
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium text-amazon-text"
                />
              </Field>
              <Field label="End Date">
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium text-amazon-text"
                />
              </Field>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 text-amazon-darkBlue font-black uppercase tracking-widest hover:underline transition-all"
            >
              Go Back
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="px-10 py-4 bg-amazon-orange text-amazon-darkBlue border-4 border-amazon-darkBlue font-black uppercase tracking-tighter rounded-xl shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? "SAVING..." : "DEPLOY SECTION"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amazon-navy px-1">
        {label}
      </label>
      {children}
    </div>
  );
}