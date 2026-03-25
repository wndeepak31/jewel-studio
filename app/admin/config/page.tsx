"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";

export default function ConfigPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/global-settings")
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/admin/global-settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(config),
        });
        if (res.ok) alert("Settings updated!");
        setSaving(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Global Configuration</h1>
                    <p className="text-gray-500 mt-1">Control taxes, margins, and the live gold rate.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg disabled:bg-gray-400"
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold">Pricing Controls</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Live Gold Rate (24K / gram)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                                value={config.goldRate}
                                onChange={e => setConfig({ ...config, goldRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Labour Rate (₹ / gram)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                                value={config.labourRate ?? 2000}
                                onChange={e => setConfig({ ...config, labourRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Applied per gram of total gold weight</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Side Stone Rate (₹ / Carat)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                                value={config.sideStoneRate ?? 45000}
                                onChange={e => setConfig({ ...config, sideStoneRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Applied to Side Stone weights in Ring Styles</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                            value={config.profitMargin}
                            onChange={e => setConfig({ ...config, profitMargin: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold">Tax & Discounts</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Government Tax / GST (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                            value={config.taxPercent}
                            onChange={e => setConfig({ ...config, taxPercent: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Global Discount (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none"
                            value={config.discountPercent}
                            onChange={e => setConfig({ ...config, discountPercent: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
