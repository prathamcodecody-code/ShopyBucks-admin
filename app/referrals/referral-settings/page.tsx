"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Save,
  TrendingUp,
  Gift,
  UserPlus,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function ReferralSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [rewardAmount, setRewardAmount] = useState<number>(5);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        api.get("/admin/referral/settings"),
        api.get("/admin/referral/stats"), // You'll need to create this endpoint
      ]);
      
      setSettings(settingsRes.data);
      setStats(statsRes.data);
      
      // Set form values
      setRewardAmount(Number(settingsRes.data.rewardAmount));
      setIsActive(settingsRes.data.isActive);
    } catch (err) {
      console.error("Failed to load referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/admin/referral/settings", {
        rewardAmount,
        isActive,
      });
      
      // Show success feedback
      alert("✅ Settings saved successfully!");
      fetchData();
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-[1400px] mx-auto p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-gray-100 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-black text-white rounded-xl">
                <Gift size={24} />
              </div>
              Referral Program
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Configure reward amounts and program status
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 ${
              isActive 
                ? 'bg-green-50 text-green-600 border-2 border-green-100' 
                : 'bg-red-50 text-red-600 border-2 border-red-100'
            }`}>
              {isActive ? (
                <>
                  <Sparkles size={14} />
                  PROGRAM ACTIVE
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  PROGRAM PAUSED
                </>
              )}
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Total Referrals" 
            value={stats?.totalReferrals || 0}
            icon={<Users className="text-blue-600" size={20}/>} 
            bgColor="bg-blue-50"
          />
          <StatCard 
            label="Completed" 
            value={stats?.completedReferrals || 0}
            icon={<Award className="text-green-600" size={20}/>} 
            bgColor="bg-green-50"
          />
          <StatCard 
            label="Pending" 
            value={stats?.pendingReferrals || 0}
            icon={<UserPlus className="text-orange-600" size={20}/>} 
            bgColor="bg-orange-50"
          />
          <StatCard 
            label="Total Paid Out" 
            value={`₹${stats?.totalPaidOut || 0}`}
            icon={<TrendingUp className="text-purple-600" size={20}/>} 
            bgColor="bg-purple-50"
          />
        </div>

        {/* SETTINGS CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amazon-orange/10 to-amazon-orangeHover/10 p-6 border-b border-gray-100">
            <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
              <DollarSign size={20} />
              Reward Configuration
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Set the reward amount and enable/disable the referral program
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Reward Amount */}
            <div className="space-y-4">
              <label className="block">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Reward Amount (₹)
                  </span>
                  <span className="text-2xl font-black text-amazon-orange">
                    ₹{rewardAmount}
                  </span>
                </div>
                
                {/* Custom Range Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #FF9900 0%, #FF9900 ${rewardAmount}%, #f3f4f6 ${rewardAmount}%, #f3f4f6 100%)`
                    }}
                  />
                  
                  {/* Range Labels */}
                  <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
                    <span>₹1</span>
                    <span>₹50</span>
                    <span>₹100</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium mt-3 flex items-center gap-1">
                  <Gift size={12} />
                  Referrer will receive ₹{rewardAmount} when their friend verifies their account
                </p>
              </label>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[5, 10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRewardAmount(amount)}
                    className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${
                      rewardAmount === amount
                        ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Program Status Toggle */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    Program Status
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {isActive 
                      ? "New referrals are being accepted and rewarded" 
                      : "Referral program is currently paused"
                    }
                  </p>
                </div>

                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'text-green-500 hover:bg-green-50' 
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>

              {/* Warning when disabled */}
              {!isActive && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-red-600 text-sm">Program Disabled</p>
                      <p className="text-xs text-red-600/80 font-medium mt-1">
                        New users cannot use referral codes. Existing pending referrals will not be completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-gray-200 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How it Works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-black text-gray-900 flex items-center gap-2 mb-4">
              <UserPlus size={20} className="text-blue-600" />
              How It Works
            </h3>
            <ol className="space-y-3 text-sm font-medium text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
                <span>User shares their unique referral code with friends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                <span>Friend signs up using the referral code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
                <span>Friend verifies their phone number via OTP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">4</span>
                <span>₹{rewardAmount} is automatically credited to referrer's wallet</span>
              </li>
            </ol>
          </div>

          {/* Best Practices */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
            <h3 className="font-black text-gray-900 flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-green-600" />
              Best Practices
            </h3>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Set rewards between ₹5-₹50 for optimal conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Monitor completion rates to adjust reward amounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Consider seasonal promotions with increased rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Disable program during major changes or maintenance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #FF9900;
          border: 4px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(255, 153, 0, 0.4);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #FF9900;
          border: 4px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(255, 153, 0, 0.4);
        }
      `}</style>
    </AdminLayout>
  );
}

/* ================= SUB-COMPONENTS ================= */

function StatCard({ label, value, icon, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-black transition-all">
      <div>
        <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
          {label}
        </p>
        <p className="text-3xl font-black mt-1 text-gray-900 tracking-tighter">
          {value}
        </p>
      </div>
      <div className={`p-4 ${bgColor} rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}