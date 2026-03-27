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
        <div className="max-w-4xl mx-auto px-1 sm:px-0 pb-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Global Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Control taxes, margins, and the live gold rate.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-3.5 sm:py-3 rounded-full font-bold hover:bg-gray-900 transition-all shadow-xl disabled:bg-gray-400 text-sm sm:text-base"
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4">Pricing Controls</h2>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Live Gold Rate (24K / gram)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                                value={config.goldRate}
                                onChange={e => setConfig({ ...config, goldRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Labour Rate (₹ / gram)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                                value={config.labourRate ?? 2000}
                                onChange={e => setConfig({ ...config, labourRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block px-1">Applied per gram of total gold weight</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Side Stone Rate (₹ / Carat)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                                value={config.sideStoneRate ?? 45000}
                                onChange={e => setConfig({ ...config, sideStoneRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block px-1">Applied to Side Stone weights in Ring Styles</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profit Margin (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                            value={config.profitMargin}
                            onChange={e => setConfig({ ...config, profitMargin: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4">Tax & Discounts</h2>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Government Tax / GST (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                            value={config.taxPercent}
                            onChange={e => setConfig({ ...config, taxPercent: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Global Discount (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all font-medium text-sm sm:text-base"
                            value={config.discountPercent}
                            onChange={e => setConfig({ ...config, discountPercent: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
