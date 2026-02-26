"use client";

import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerSettingsPage() {
  const params = useParams();
  const sellerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    const res = await api.get(
      `/admin/sellers/${sellerId}/settings`
    );
    setSettings(res.data);
  }

  async function save() {
    try {
      setSaving(true);
      await api.patch(
        `/admin/sellers/${sellerId}/settings`,
        settings
      );
      alert("Settings saved");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (sellerId) loadSettings();
  }, [sellerId]);

  if (!settings) {
    return (
      <AdminLayout>
        <p className="py-20 text-center text-gray-500">
          Loading settings…
        </p>
      </AdminLayout>
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold">
          Seller Settings
        </h1>

        {/* PAYOUT SETTINGS */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Payout & Commission</h3>

          <div>
            <label className="block text-sm font-medium">
              Commission (%)
            </label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={e =>
                setSettings({
                  ...settings,
                  commissionRate: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Minimum Payout Amount
            </label>
            <input
              type="number"
              value={settings.minPayoutAmount}
              onChange={e =>
                setSettings({
                  ...settings,
                  minPayoutAmount: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoPayout}
              onChange={e =>
                setSettings({
                  ...settings,
                  autoPayout: e.target.checked,
                })
              }
            />
            Enable Auto Payout
          </label>
        </section>

        {/* ORDER RULES */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Order Rules</h3>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.allowCOD}
              onChange={e =>
                setSettings({
                  ...settings,
                  allowCOD: e.target.checked,
                })
              }
            />
            Allow Cash on Delivery
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.payoutHold}
              onChange={e =>
                setSettings({
                  ...settings,
                  payoutHold: e.target.checked,
                })
              }
            />
            Hold Payouts
          </label>
        </section>

        {/* VISIBILITY & COMPLIANCE */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Visibility & Compliance</h3>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.isVerified}
              onChange={e =>
                setSettings({
                  ...settings,
                  isVerified: e.target.checked,
                })
              }
            />
            Seller Verified
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.isVisible}
              onChange={e =>
                setSettings({
                  ...settings,
                  isVisible: e.target.checked,
                })
              }
            />
            Visible on Marketplace
          </label>

          <div>
            <label className="block text-sm font-medium">
              Admin Note
            </label>
            <textarea
              value={settings.adminNote || ""}
              onChange={e =>
                setSettings({
                  ...settings,
                  adminNote: e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </section>

        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Save Settings
        </button>

      </div>

  );
}
