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
        <div className="max-w-4xl mx-auto px-1 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Carat Options</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage standard carat weights available for selection.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg w-full sm:w-auto text-sm"
                >
                    <Plus size={18} />
                    Add Carat Option
                </button>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm overflow-hidden mb-6 p-4 sm:p-6 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400">Every weight you add here will appear as a new column in the <a href="/admin/diamonds" className="text-black font-bold hover:underline">Diamonds Pricing Grid</a>.</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carat Value</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Multiplier</th>
                                <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isAdding && (
                                <tr className="bg-gray-50/30">
                                    <td className="px-6 sm:px-8 py-4"><input type="number" step="0.01" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm" value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })} /></td>
                                    <td className="px-6 sm:px-8 py-4"><input type="number" step="0.01" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-sm" value={formData.multiplier} onChange={e => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })} /></td>
                                    <td className="px-6 sm:px-8 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleSave()} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold mr-2 hover:bg-green-700">Save</button>
                                        <button onClick={() => setIsAdding(false)} className="text-gray-400 text-xs font-bold hover:text-gray-600 px-3 py-1.5">Cancel</button>
                                    </td>
                                </tr>
                            )}
                            {Array.isArray(carats) && carats.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 font-semibold text-gray-900 text-sm sm:text-base">{c.value} ct</td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-gray-500 text-sm sm:text-base">×{c.multiplier}</td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">
                                        <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Option"><Trash2 size={18} /></button>
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
        </div>
    );
}
