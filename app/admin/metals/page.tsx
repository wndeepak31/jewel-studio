"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Check, X, RefreshCw } from "lucide-react";

export default function MetalsPage() {
    const [metals, setMetals] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", purity: "14K", color: "White", pricePerGram: 0 });

    const fetchData = async () => {
        try {
            const [metalsRes, settingsRes] = await Promise.all([
                fetch("/api/metals"),
                fetch("/api/global-settings")
            ]);
            
            const metalsData = await metalsRes.json();
            const settingsData = await settingsRes.json();

            setMetals(Array.isArray(metalsData) ? metalsData : []);
            setGlobalSettings(settingsData);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Network error or server unavailable");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSyncAll = async () => {
        if (!globalSettings?.goldRate) return;
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/global-settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                },
                body: JSON.stringify({ goldRate: globalSettings.goldRate }),
            });
            if (res.ok) {
                fetchData();
                alert("All metal prices synchronized with Live Gold Rate!");
            }
        } catch (err) {
            alert("Sync failed.");
        } finally {
            setIsSyncing(false);
        }
    };

    const calculatePrice = (purity: string) => {
        if (!globalSettings?.goldRate) return 0;
        const purityMatch = purity.match(/(\d+)/);
        if (purityMatch) {
            const purityValue = parseInt(purityMatch[1]);
            return Math.round((globalSettings.goldRate / 24) * purityValue);
        }
        return 0;
    };

    const handleSave = async (id?: string) => {
        const res = await fetch("/api/admin/metal", {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(id ? { ...formData, id } : formData),
        });

        if (res.ok) {
            fetchData();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: "", purity: "14K", color: "White", pricePerGram: 0 });
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-1 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Metals & Purity</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage metal types, purity, and pricing per gram.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {globalSettings && (
                        <button
                            onClick={handleSyncAll}
                            disabled={isSyncing}
                            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold hover:bg-blue-100 transition-all border border-blue-100 text-sm"
                        >
                            {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                            Sync with ₹{globalSettings.goldRate} (24K)
                        </button>
                    )}
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center gap-2 bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg text-sm"
                    >
                        <Plus size={18} />
                        Add Metal Option
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100 flex items-center justify-between">
                    <p className="text-sm font-medium">Error: {error}</p>
                    <button onClick={fetchData} className="text-xs bg-white px-3 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">Retry</button>
                </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metal Name</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purity</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price / Gram</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isAdding && (
                                <tr className="bg-gray-50/30">
                                    <td className="px-6 sm:px-8 py-4"><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></td>
                                    <td className="px-6 sm:px-8 py-4"><input type="text" placeholder="18K" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm" value={formData.purity} onChange={e => setFormData({ ...formData, purity: e.target.value, pricePerGram: calculatePrice(e.target.value) })} /></td>
                                    <td className="px-6 sm:px-8 py-4"><input type="text" placeholder="Yellow" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} /></td>
                                    <td className="px-6 sm:px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm font-bold" value={formData.pricePerGram} onChange={e => setFormData({ ...formData, pricePerGram: parseFloat(e.target.value) })} />
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleSave()} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold mr-2 hover:bg-green-700">Save</button>
                                        <button onClick={() => setIsAdding(false)} className="text-gray-400 text-xs font-bold hover:text-gray-600 px-3 py-1.5">Cancel</button>
                                    </td>
                                </tr>
                            )}
                            {Array.isArray(metals) && metals.map((metal) => (
                                <tr key={metal.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 font-bold text-gray-900 text-sm">{metal.name}</td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-gray-500 text-sm font-medium">{metal.purity}</td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-gray-400 text-sm">{metal.color}</td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-bold text-sm">₹{metal.pricePerGram.toLocaleString("en-IN")}</span>
                                            {globalSettings?.goldRate && calculatePrice(metal.purity) !== metal.pricePerGram && (
                                                <span className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Sync Required (₹{calculatePrice(metal.purity)})</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                                        <button onClick={() => { setEditingId(metal.id); setFormData(metal); }} className="text-gray-300 hover:text-black hover:bg-gray-100 p-2 rounded-lg transition-colors"><Edit3 size={18} /></button>
                                        <button className="text-gray-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
