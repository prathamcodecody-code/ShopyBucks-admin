"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Clock
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function CreateCouponPage() {
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.code.trim()) return "Coupon code required";
    if (!form.discountValue) return "Discount value required";
    if (!form.startAt || !form.endAt) return "Start and End dates required";
    if (new Date(form.startAt) >= new Date(form.endAt)) return "End date must be after start date";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);
      await api.post("/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      });

      alert("Coupon created successfully");
      router.push("/coupons");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-8 px-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Coupons
            </button>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Create New Coupon</h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? "Saving..." : "Publish Coupon"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* LIVE PREVIEW SECTION */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
               <Sparkles className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:rotate-12 transition-transform" size={120} />
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                      <Ticket size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Customer Preview</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-4xl font-black tracking-tighter">
                      {form.discountValue ? (
                        form.discountType === "PERCENT" ? `${form.discountValue}% OFF` : `₹${form.discountValue} OFF`
                      ) : "OFFER CODE"}
                    </h3>
                    <p className="text-lg font-bold opacity-90">
                      {form.code || "YOURCODEHERE"}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                       <Clock size={14} />
                       {form.endAt ? `Expires: ${new Date(form.endAt).toLocaleDateString()}` : "No Expiry Set"}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {form.minOrderAmount ? `Min. Order: ₹${form.minOrderAmount}` : "No Min. Purchase"}
                    </p>
                  </div>
               </div>
            </div>

            {/* CARD 1: Basic Config */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Ticket size={20}/>
                </div>
                <h2 className="text-xl font-black text-gray-800">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Coupon Code</label>
                  <input
                    value={form.code}
                    onChange={e => updateField("code", e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold text-lg placeholder:text-gray-300"
                    placeholder="E.g. SUMMER50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Discount Type</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button 
                            onClick={() => updateField("discountType", "PERCENT")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${form.discountType === 'PERCENT' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Percent size={14}/> Percentage
                        </button>
                        <button 
                            onClick={() => updateField("discountType", "FLAT")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${form.discountType === 'FLAT' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Banknote size={14}/> Flat Amount
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
                            className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-3.5 text-gray-400 font-bold">
                            {form.discountType === 'PERCENT' ? '%' : '₹'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Limits & Rules */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Settings2 size={20}/>
                </div>
                <h2 className="text-xl font-black text-gray-800">Financial Rules</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={e => updateField("minOrderAmount", e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                    placeholder="₹0.00"
                  />
                </div>

                {form.discountType === "PERCENT" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Max Discount Cap</label>
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={e => updateField("maxDiscount", e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                      placeholder="₹0.00"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-black text-gray-800">Status</h3>
                  <p className="text-xs text-gray-400 font-medium text-balance leading-tight">Activate this coupon immediately</p>
                </div>
                <button 
                    onClick={() => updateField("isActive", !form.isActive)}
                    className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${form.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Calendar size={14} className="text-blue-500"/> Timeline
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Starts At</label>
                        <input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={e => updateField("startAt", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Ends At</label>
                        <input
                            type="datetime-local"
                            value={form.endAt}
                            onChange={e => updateField("endAt", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                        />
                    </div>
                </div>
            </div>

            {/* Usage Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Users size={14} className="text-purple-500"/> Usage Limits
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Global Limit</label>
                        <input
                            type="number"
                            value={form.usageLimit}
                            onChange={e => updateField("usageLimit", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                            placeholder="∞"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">Per User Limit</label>
                        <input
                            type="number"
                            value={form.perUserLimit}
                            onChange={e => updateField("perUserLimit", e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 p-2.5 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-black"
                            placeholder="1"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}