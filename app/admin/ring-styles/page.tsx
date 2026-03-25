"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function RingStylesPage() {
    const [styles, setStyles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", imageUrl: "", weight14k: 0, weight18k: 0, sideStoneWeight: 0 });

    const fetchStyles = async () => {
        try {
            const res = await fetch("/api/admin/ring-style", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setStyles(data);
                setError(null);
            } else {
                console.error("Failed to fetch styles: Expected array, got", data);
                setError(data.error || "Failed to load styles");
                setStyles([]);
            }
        } catch (error) {
            console.error("Error fetching styles:", error);
            setError("Network error or server unavailable");
            setStyles([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStyles();
    }, []);

    const handleSave = async (id?: string) => {
        const method = id ? "PUT" : "POST";
        const res = await fetch("/api/admin/ring-style", {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(id ? { ...formData, id } : formData),
        });

        if (res.ok) {
            fetchStyles();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: "", imageUrl: "", weight14k: 0, weight18k: 0, sideStoneWeight: 0 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch("/api/admin/ring-style", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id }),
        });
        if (res.ok) fetchStyles();
    };

    const startEdit = (style: any) => {
        setEditingId(style.id);
        setFormData({
            name: style.name,
            imageUrl: style.imageUrl,
            weight14k: style.weight14k || 0,
            weight18k: style.weight18k || 0,
            sideStoneWeight: style.sideStoneWeight || 0,
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ring Styles</h1>
                    <p className="text-gray-500 mt-1">Manage shank designs and weights for 14K and 18K.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg"
                >
                    <Plus size={18} />
                    Add New Style
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100 flex items-center justify-between">
                    <p className="text-sm font-medium">Error: {error}</p>
                    <button onClick={fetchStyles} className="text-xs bg-white px-3 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">Retry</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAdding && (
                    <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col gap-4">
                        <h3 className="font-bold">New Style</h3>
                        <ImageUpload
                            currentImage={formData.imageUrl}
                            onUploadComplete={(url: string) => setFormData({ ...formData, imageUrl: url })}
                        />
                        <input
                            type="text"
                            placeholder="Style Name"
                            className="w-full px-4 py-2 rounded-xl border border-gray-100"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">14K Weight (g)</label>
                                <input type="number" step="0.01" className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm" value={formData.weight14k} onChange={(e) => setFormData({ ...formData, weight14k: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">18K Weight (g)</label>
                                <input type="number" step="0.01" className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm" value={formData.weight18k} onChange={(e) => setFormData({ ...formData, weight18k: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1">Side Stone Weight (ct)</label>
                            <input type="number" step="0.01" className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm" value={formData.sideStoneWeight} onChange={(e) => setFormData({ ...formData, sideStoneWeight: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleSave()} className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-semibold">Save</button>
                            <button onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-xl text-sm font-semibold">Cancel</button>
                        </div>
                    </div>
                )}

                {Array.isArray(styles) && styles.map((style) => (
                    <div key={style.id} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm relative group overflow-hidden">
                        <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center">
                            <img src={style.imageUrl} alt={style.name} className="max-h-[80%] max-w-[80%] object-contain" />
                        </div>

                        {editingId === style.id ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-100 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[9px] font-medium text-gray-400 mb-0.5">14K Wt (g)</label>
                                        <input type="number" step="0.01" className="w-full px-2 py-1.5 rounded-lg border border-gray-100 text-sm" value={formData.weight14k} onChange={(e) => setFormData({ ...formData, weight14k: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-medium text-gray-400 mb-0.5">18K Wt (g)</label>
                                        <input type="number" step="0.01" className="w-full px-2 py-1.5 rounded-lg border border-gray-100 text-sm" value={formData.weight18k} onChange={(e) => setFormData({ ...formData, weight18k: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-medium text-gray-400 mb-0.5">Side Stone Wt (ct)</label>
                                    <input type="number" step="0.01" className="w-full px-2 py-1.5 rounded-lg border border-gray-100 text-sm" value={formData.sideStoneWeight} onChange={(e) => setFormData({ ...formData, sideStoneWeight: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleSave(style.id)} className="p-2 bg-green-50 text-green-600 rounded-lg"><Check size={16} /></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-red-50 text-red-600 rounded-lg"><X size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-900">{style.name}</h3>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>14K: {style.weight14k}g</span>
                                        <span>18K: {style.weight18k}g</span>
                                    </div>
                                    {style.sideStoneWeight > 0 && (
                                        <p className="text-xs text-gray-400 font-medium">{style.sideStoneWeight} ct Side Stones</p>
                                    )}
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(style)} className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-gray-900 shadow-sm"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDelete(style.id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-400 hover:text-red-600 shadow-sm"><Trash2 size={14} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {Array.isArray(styles) && styles.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No ring styles found.
                    </div>
                )}
            </div >
        </div >
    );
}
