"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";

export default function MetalsPage() {
    const [metals, setMetals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", purity: "14K", color: "White", pricePerGram: 0 });

    const fetchMetals = async () => {
        try {
            const res = await fetch("/api/metals");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMetals(data);
                setError(null);
            } else {
                console.error("Failed to fetch metals: Expected array, got", data);
                setError(data.error || "Failed to load metals");
                setMetals([]);
            }
        } catch (error) {
            console.error("Error fetching metals:", error);
            setError("Network error or server unavailable");
            setMetals([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMetals();
    }, []);

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
            fetchMetals();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: "", purity: "14K", color: "White", pricePerGram: 0 });
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Metals & Purity</h1>
                    <p className="text-gray-500 mt-1">Manage metal types, purity, and pricing per gram.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg"
                >
                    Add Metal Option
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100 flex items-center justify-between">
                    <p className="text-sm font-medium">Error: {error}</p>
                    <button onClick={fetchMetals} className="text-xs bg-white px-3 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">Retry</button>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Metal Name</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Purity</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Price / Gram</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isAdding && (
                            <tr className="bg-gray-50/30">
                                <td className="px-8 py-4"><input type="text" className="w-full bg-transparent border-b border-gray-200" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></td>
                                <td className="px-8 py-4"><input type="text" className="w-full bg-transparent border-b border-gray-200" value={formData.purity} onChange={e => setFormData({ ...formData, purity: e.target.value })} /></td>
                                <td className="px-8 py-4"><input type="text" className="w-full bg-transparent border-b border-gray-200" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} /></td>
                                <td className="px-8 py-4"><input type="number" className="w-full bg-transparent border-b border-gray-200" value={formData.pricePerGram} onChange={e => setFormData({ ...formData, pricePerGram: parseFloat(e.target.value) })} /></td>
                                <td className="px-8 py-4 text-right">
                                    <button onClick={() => handleSave()} className="text-green-600 mr-4 font-bold">Save</button>
                                    <button onClick={() => setIsAdding(false)} className="text-gray-400 font-bold">X</button>
                                </td>
                            </tr>
                        )}
                        {Array.isArray(metals) && metals.map((metal) => (
                            <tr key={metal.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6 font-semibold text-gray-900">{metal.name}</td>
                                <td className="px-8 py-6 text-gray-500">{metal.purity}</td>
                                <td className="px-8 py-6 text-gray-500">{metal.color}</td>
                                <td className="px-8 py-6 text-gray-900 font-medium">₹{metal.pricePerGram}</td>
                                <td className="px-8 py-6 text-right space-x-4">
                                    <button onClick={() => { setEditingId(metal.id); setFormData(metal); }} className="text-gray-400 hover:text-gray-900 transition-colors"><Edit3 size={18} /></button>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        {Array.isArray(metals) && metals.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-gray-400">No metal options found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
