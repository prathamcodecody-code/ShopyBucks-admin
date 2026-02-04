"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProductMultiSelect from "@/components/modals/ProductMultiSelect";
import AdminLayout from "@/components/AdminLayout";

const SECTION_TYPES = [
  "HERO",
  "COLLECTION",
  "PRODUCT_LIST",
  "BANNER",
  "TEXT",
] as const;

const TARGETS = ["ALL", "WEB", "MOBILE"] as const;

export default function EditHomepageSectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<string>("HERO");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [collectionTag, setCollectionTag] = useState("");
  const [productIds, setProductIds] = useState<number[]>([]);
  const [target, setTarget] = useState("ALL");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    api
      .get(`/admin/homepage-sections`)
      .then((res) => {
        const section = res.data.find((s: any) => s.id === Number(id));
        if (!section) return router.push("/homepage");

        setType(section.type);
        setTitle(section.title || "");
        setSubtitle(section.subtitle || "");
        setExistingImage(section.imageUrl || "");
        setImage(null);

        setLinkUrl(section.linkUrl || "");
        setButtonText(section.buttonText || "");
        setCollectionTag(section.collectionTag || "");
        setProductIds(section.productIds || []);
        setTarget(section.target || "ALL");

        setStartAt(section.startAt ? toInputDate(section.startAt) : "");
        setEndAt(section.endAt ? toInputDate(section.endAt) : "");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  /* ================= SAVE ================= */

  const update = async () => {
    setSaving(true);
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

      await api.patch(`/admin/homepage-sections/${id}`, formData);
      router.push("/homepage");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="p-12 flex justify-center items-center">
        <div className="animate-bounce font-black text-2xl italic italic tracking-tighter text-amazon-orange">
          LOADING VIBES...
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6 md:p-12 text-amazon-darkBlue">
        {/* HEADER AREA */}
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
            Edit Section
          </h1>
          <p className="text-amazon-mutedText font-medium text-lg">
            Refreshing the mood for section #{id}
          </p>
        </div>

        <div className="bg-white border-4 border-amazon-darkBlue shadow-[8px_8px_0px_0px_rgba(19,25,33,1)] rounded-2xl p-8 space-y-8">
          
          {/* TYPE SELECTOR (PILLS) */}
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
              className="w-full p-4 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl focus:ring-4 focus:ring-amazon-orangeHover outline-none font-bold text-amazon-text transition-all"
            />
          </Field>

          {/* TEXT CONTENT */}
          {type === "TEXT" && (
            <Field label="Text Content">
              <textarea
                rows={5}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-4 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl focus:ring-4 focus:ring-amazon-orangeHover outline-none font-medium transition-all"
              />
            </Field>
          )}

          {/* IMAGE UPLOAD */}
          {(type === "HERO" || type === "BANNER" || type === "COLLECTION") && (
            <Field label="Visual Asset">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {existingImage && !image && (
                  <div className="relative border-4 border-amazon-darkBlue rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(19,25,33,1)]">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${existingImage}`}
                      className="h-32 w-auto object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-amazon-orange text-[8px] font-black px-1 border-b-2 border-l-2 border-amazon-darkBlue">CURRENT</div>
                  </div>
                )}
                <div className="flex-1 relative border-2 border-dashed border-amazon-darkBlue rounded-xl p-8 text-center bg-amazon-lightGray hover:bg-amazon-borderGray transition-colors group cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-amazon-darkBlue font-bold group-hover:underline uppercase text-sm">
                    {image ? image.name : "Swap Image"}
                  </p>
                </div>
              </div>
            </Field>
          )}

          {/* LINKS */}
          {(type === "HERO" || type === "BANNER") && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Link URL">
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium"
                />
              </Field>
              <Field label="Button Text">
                <input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium"
                />
              </Field>
            </div>
          )}

          {/* PRODUCT LIST FIXES */}
          {type === "PRODUCT_LIST" && (
            <div className="space-y-6">
              <Field label="Collection Tag">
                <input
                  value={collectionTag}
                  onChange={(e) => setCollectionTag(e.target.value)}
                  className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium text-amazon-text"
                />
              </Field>
              <Field label="Select Products">
                {/* Specific container fix for ProductMultiSelect colors */}
                <div className="border-2 border-amazon-darkBlue rounded-xl overflow-hidden bg-white text-amazon-darkBlue [&_*]:text-amazon-darkBlue">
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
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Start At">
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium"
              />
            </Field>

            <Field label="End At">
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full p-3 bg-amazon-lightGray border-2 border-amazon-darkBlue rounded-xl font-medium"
              />
            </Field>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 text-amazon-darkBlue font-black uppercase tracking-widest hover:underline transition-all"
            >
              Cancel
            </button>
            <button
              onClick={update}
              disabled={saving}
              className="px-10 py-4 bg-amazon-orange text-amazon-darkBlue border-4 border-amazon-darkBlue font-black uppercase tracking-tighter rounded-xl shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
            >
              {saving ? "SAVING..." : "Update Section"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= HELPERS ================= */

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

function toInputDate(date: string) {
  return new Date(date).toISOString().slice(0, 16);
}