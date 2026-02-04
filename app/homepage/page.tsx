"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Filter,
  Layers,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

type HomepageSection = {
  id: number;
  type: "HERO" | "COLLECTION" | "PRODUCT_LIST" | "BANNER" | "TEXT";
  title?: string;
  isActive: boolean;
  sortOrder: number;
};

// Map types to specific brand vibes
const TYPE_CONFIG = {
  HERO: { color: "bg-[#FF9900]", icon: "🔥", label: "Hero Drop" },
  COLLECTION: { color: "bg-[#232F3E]", icon: "📁", label: "Collection" },
  PRODUCT_LIST: { color: "bg-[#007600]", icon: "🛍️", label: "Product Grid" },
  BANNER: { color: "bg-[#B12704]", icon: "⚡", label: "Promo Banner" },
  TEXT: { color: "bg-[#565959]", icon: "📝", label: "Text Block" },
};

export default function AdminHomepageIndex() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/homepage-sections");
      setSections(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const toggleSection = async (id: number, isActive: boolean) => {
    await api.patch(`/admin/homepage-sections/${id}/toggle`, { isActive });
    fetchSections();
  };

  const deleteSection = async (id: number) => {
    if (!confirm("Delete this section permanently?")) return;
    await api.delete(`/admin/homepage-sections/${id}`);
    fetchSections();
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    setSections(reordered);

    await api.patch("/admin/homepage-sections/reorder", {
      items: reordered.map((s, index) => ({
        id: s.id,
        sortOrder: index,
      })),
    });
  };

  const filteredSections = filter === "ALL" 
    ? sections 
    : sections.filter(s => s.type === filter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center animate-pulse font-black text-amazon-navy italic">
          LOADING THE BUILDER...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-amazon-darkBlue uppercase">
              Homepage Builder
            </h1>
            <p className="text-amazon-mutedText font-medium text-lg">
              Drag, drop, and deploy your storefront vibe.
            </p>
          </div>

          <Link
            href="/homepage/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-amazon-orange text-amazon-darkBlue border-4 border-amazon-darkBlue rounded-xl font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Add New Section
          </Link>
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 px-3 py-2 bg-amazon-darkBlue text-white rounded-lg text-xs font-black uppercase italic">
            <Filter size={14} /> Filter:
          </div>
          {["ALL", ...Object.keys(TYPE_CONFIG)].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full border-2 text-xs font-bold transition-all whitespace-nowrap ${
                filter === t
                  ? "bg-amazon-orange border-amazon-darkBlue text-amazon-darkBlue shadow-md scale-105"
                  : "bg-white border-amazon-borderGray text-amazon-mutedText hover:border-amazon-darkBlue"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* DRAGGABLE LIST */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {filteredSections.map((section) => (
                <SortableRow
                  key={section.id}
                  section={section}
                  onToggle={toggleSection}
                  onDelete={deleteSection}
                />
              ))}
              {filteredSections.length === 0 && (
                <div className="p-20 text-center border-4 border-dashed border-amazon-borderGray rounded-3xl">
                  <Layers className="mx-auto mb-4 text-amazon-borderGray" size={48} />
                  <p className="font-bold text-amazon-mutedText uppercase tracking-widest">No sections found in this category.</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </AdminLayout>
  );
}

/* ================= SORTABLE ROW COMPONENT ================= */

function SortableRow({
  section,
  onToggle,
  onDelete,
}: {
  section: HomepageSection;
  onToggle: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const config = TYPE_CONFIG[section.type] || TYPE_CONFIG.TEXT;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-5 border-4 border-amazon-darkBlue rounded-2xl bg-white transition-all ${
        isDragging ? "shadow-[12px_12px_0px_0px_rgba(255,153,0,1)] rotate-1 scale-105 opacity-90" : "shadow-[6px_6px_0px_0px_rgba(19,25,33,1)]"
      } ${!section.isActive && !isDragging ? "opacity-60 grayscale-[0.5]" : ""}`}
    >
      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 hover:bg-amazon-lightGray rounded-lg text-amazon-darkBlue transition-colors"
      >
        <GripVertical size={24} strokeWidth={2.5} />
      </div>

      {/* ICON & COLOR BADGE */}
      <div className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-xl border-2 border-amazon-darkBlue text-xl ${config.color}`}>
        {config.icon}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <div className="font-black text-lg text-amazon-darkBlue truncate uppercase tracking-tight leading-none">
          {section.title || "Untitled Section"}
        </div>
        <div className="flex items-center gap-2 mt-1">
           <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-amazon-darkBlue text-white ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] font-bold text-amazon-mutedText uppercase tracking-widest">
            ID: #{section.id}
          </span>
        </div>
      </div>

      {/* TOGGLE SWITCH */}
      <button
        onClick={() => onToggle(section.id, !section.isActive)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full border-2 border-amazon-darkBlue transition-colors ${
          section.isActive ? "bg-amazon-success" : "bg-amazon-lightGray"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full border-2 border-amazon-darkBlue bg-white transition-transform ${
            section.isActive ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>

      {/* ACTIONS */}
      <div className="flex items-center gap-1 border-l-2 border-amazon-borderGray pl-2 ml-2">
        <Link
          href={`/homepage/edit/${section.id}`}
          className="p-2 hover:bg-amazon-orange rounded-lg text-amazon-darkBlue transition-all border-2 border-transparent hover:border-amazon-darkBlue"
        >
          <Pencil size={18} strokeWidth={2.5} />
        </Link>

        <button
          onClick={() => onDelete(section.id)}
          className="p-2 hover:bg-amazon-danger hover:text-white rounded-lg text-amazon-danger transition-all border-2 border-transparent hover:border-amazon-darkBlue"
        >
          <Trash2 size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}