"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Save, 
  Ticket, 
  Settings2, 
  Calendar, 
  Users, 
  ArrowLeft,
  Loader2,
  Percent,
  Banknote,
  Sparkles,
  Clock,
  Info
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    maxDiscount: "",
    minOrderAmount: "",
    usageLimit: "",
    perUserLimit: "",
    startAt: "",
    endAt: "",
    isActive: true,
  });

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* ================= FETCH COUPON ================= */
  useEffect(() => {
    if (!id) return;

    const fetchCoupon = async () => {
      try {
        const res = await api.get("/coupons");
        const coupon = res.data.find((c: any) => c.id === Number(id));

        if (!coupon) {
          alert("Coupon not found");
          router.push("/coupons");
          return;
        }

        setForm({
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: String(coupon.discountValue),
          maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
          minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
          perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : "",
          // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
          startAt: new Date(coupon.startAt).toISOString().slice(0, 16),
          endAt: new Date(coupon.endAt).toISOString().slice(0, 16),
          isActive: coupon.isActive,
        });
      } catch {
        alert("Failed to load coupon");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id, router]);

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.code.trim()) return "Coupon code required";
    if (!form.discountValue) return "Discount value required";
    if (!form.startAt || !form.endAt) return "Start and End dates required";
    if (new Date(form.startAt) >= new Date(form.endAt)) return "End date must be after start date";
    return null;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      };

      await api.patch(`/coupons/${id}`, payload);
      alert("Coupon updated successfully");
      router.push("/coupons");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Coupon Data</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8 px-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <button 
              onClick={() => router.push("/coupons")}
              className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Coupons
            </button>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Edit Coupon</h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Updating..." : "Update Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* LIVE PREVIEW CARD */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group border-4 border-white">
               <Sparkles className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:rotate-12 transition-transform" size={150} />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <Ticket size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Campaign Preview</span>
                    </div>
                    {form.isActive ? (
                        <span className="bg-green-400/20 text-green-300 text-[10px] font-black px-3 py-1 rounded-full border border-green-400/30">LIVE</span>
                    ) : (
                        <span className="bg-red-400/20 text-red-300 text-[10px] font-black px-3 py-1 rounded-full border border-red-400/30">DISABLED</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-5xl font-black tracking-tighter">
                      {form.discountValue ? (
                        form.discountType === "PERCENT" ? `${form.discountValue}% OFF` : `₹${form.discountValue} OFF`
                      ) : "OFFER CODE"}
                    </h3>
                    <p className="text-xl font-bold opacity-90 font-mono tracking-wider">
                      {form.code || "----"}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                       <Clock size={14} />
                       {form.endAt ? `Ends: ${new Date(form.endAt).toLocaleDateString()}` : "Ongoing"}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {form.minOrderAmount ? `Orders above ₹${form.minOrderAmount}` : "Valid on all orders"}
                    </p>
                  </div>
               </div>
            </div>

            {/* CONFIGURATION CARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Settings2 size={20}/>
                </div>
                <h2 className="text-xl font-black text-gray-800">Coupon Setup</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Coupon Code</label>
                  <input
                    value={form.code}
                    onChange={e => updateField("code", e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Discount Type</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button 
                            onClick={() => updateField("discountType", "PERCENT")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${form.discountType === 'PERCENT' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            <Percent size={14}/> Percentage
                        </button>
                        <button 
                            onClick={() => updateField("discountType", "FLAT")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${form.discountType === 'FLAT' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        >
                            <Banknote size={14}/> Flat
                        </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Discount Value</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={form.discountValue}
                            onChange={e => updateField("discountValue", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none font-bold"
                        />
                        <span className="absolute right-4 top-3.5 text-gray-400 font-bold">
                            {form.discountType === 'PERCENT' ? '%' : '₹'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Status toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-black text-gray-800">Visibility</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Enable Coupon</p>
                </div>
                <button 
                    onClick={() => updateField("isActive", !form.isActive)}
                    className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all ${form.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500"/> Validity Period
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Start Date</label>
                        <input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={e => updateField("startAt", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">End Date</label>
                        <input
                            type="datetime-local"
                            value={form.endAt}
                            onChange={e => updateField("endAt", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                        />
                    </div>
                </div>
            </div>

            {/* Restrictions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Info size={14} className="text-orange-500"/> Requirements
                </h3>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Minimum Order (₹)</label>
                        <input type="number" value={form.minOrderAmount} onChange={e => updateField("minOrderAmount", e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none" placeholder="0" />
                    </div>
                    {form.discountType === "PERCENT" && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 ml-1">Max Discount (₹)</label>
                            <input type="number" value={form.maxDiscount} onChange={e => updateField("maxDiscount", e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none" placeholder="No Limit" />
                        </div>
                    )}
                </div>
            </div>

            {/* Limits */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Users size={14} className="text-purple-500"/> Usage Quotas
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <input type="number" value={form.usageLimit} onChange={e => updateField("usageLimit", e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none" placeholder="Global Limit (∞)" />
                    <input type="number" value={form.perUserLimit} onChange={e => updateField("perUserLimit", e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none" placeholder="Per User Limit (1)" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}