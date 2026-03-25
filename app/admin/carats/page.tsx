"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function CaratsPage() {
    const [carats, setCarats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ value: 1.0, multiplier: 1.0 });

    const fetchCarats = async () => {
        try {
            const res = await fetch("/api/carats");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCarats(data);
            } else {
                console.error("Failed to fetch carats: Expected array, got", data);
                setCarats([]);
            }
        } catch (error) {
            console.error("Error fetching carats:", error);
            setCarats([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCarats(); }, []);

    const handleSave = async (id?: string) => {
        const res = await fetch("/api/admin/carat", {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(id ? { ...formData, id } : formData),
        });
        if (res.ok) {
            fetchCarats();
            setIsAdding(false);
            setFormData({ value: 1.0, multiplier: 1.0 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this carat option?")) return;
        await fetch("/api/admin/carat", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id }),
        });
        fetchCarats();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Carat Options</h1>
                    <p className="text-gray-500 mt-1">Add weights (1.0, 1.5, 2.0, etc.) to expand your pricing grid.</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2">
                    <Plus size={18} />
                    Add Weight
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden text-center mb-6 p-4">
                <p className="text-sm text-gray-400">Every weight you add here will appear as a new column in the <a href="/admin/diamonds" className="text-black font-bold hover:underline">Diamonds Pricing Grid</a>.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Carat Value</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Multiplier</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isAdding && (
                            <tr className="bg-gray-50/30">
                                <td className="px-8 py-4"><input type="number" step="0.01" className="w-full bg-transparent border-b border-gray-200 outline-none py-1" value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })} /></td>
                                <td className="px-8 py-4"><input type="number" step="0.01" className="w-full bg-transparent border-b border-gray-200 outline-none py-1" value={formData.multiplier} onChange={e => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })} /></td>
                                <td className="px-8 py-4 text-right">
                                    <button onClick={() => handleSave()} className="text-green-600 mr-4 font-bold text-sm">Save</button>
                                    <button onClick={() => setIsAdding(false)} className="text-gray-400 font-bold text-sm">Cancel</button>
                                </td>
                            </tr>
                        )}
                        {Array.isArray(carats) && carats.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6 font-semibold text-gray-900">{c.value} ct</td>
                                <td className="px-8 py-6 text-gray-500">×{c.multiplier}</td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        {Array.isArray(carats) && carats.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-8 py-20 text-center text-gray-400">No carat options found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
