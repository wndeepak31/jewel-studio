"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", imageUrl: "", weight14k: 0, weight18k: 0 });

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSettings(data);
            } else {
                console.error("Failed to fetch settings: Expected array, got", data);
                setSettings([]);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setSettings([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async (id?: string) => {
        const res = await fetch("/api/admin/setting", {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(id ? { ...formData, id } : formData),
        });
        if (res.ok) {
            fetchSettings();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: "", imageUrl: "", weight14k: 0, weight18k: 0 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this setting?")) return;
        await fetch("/api/admin/setting", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id }),
        });
        fetchSettings();
    };

    const startEdit = (s: any) => {
        setEditingId(s.id);
        setFormData({
            name: s.name,
            imageUrl: s.imageUrl,
            weight14k: s.weight14k || 0,
            weight18k: s.weight18k || 0,
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ring Settings</h1>
                    <p className="text-gray-500 mt-1">Manage prong/head settings and their weights.</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg">
                    Add Setting
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 mb-8 space-y-4">
                    <h3 className="font-bold text-gray-900">New Setting</h3>
                    <ImageUpload currentImage={formData.imageUrl} onUploadComplete={(url: string) => setFormData({ ...formData, imageUrl: url })} />
                    <input type="text" placeholder="Setting Name" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1">14K Weight (g)</label>
                            <input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none" value={formData.weight14k} onChange={e => setFormData({ ...formData, weight14k: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1">18K Weight (g)</label>
                            <input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none" value={formData.weight18k} onChange={e => setFormData({ ...formData, weight18k: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleSave()} className="bg-black text-white px-8 py-2.5 rounded-xl font-semibold text-sm">Save</button>
                        <button onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-xl font-semibold text-sm">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(settings) && settings.map((s) => (
                    <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm relative group">
                        <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center">
                            <img src={s.imageUrl} alt={s.name} className="max-h-[80%] max-w-[80%] object-contain" />
                        </div>

                        {editingId === s.id ? (
                            <div className="space-y-3">
                                <input type="text" className="w-full px-3 py-1.5 rounded-lg border border-gray-100 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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
                                <div className="flex gap-2">
                                    <button onClick={() => handleSave(s.id)} className="p-2 bg-green-50 text-green-600 rounded-lg"><Check size={16} /></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-red-50 text-red-600 rounded-lg"><X size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-900">{s.name}</h3>
                                <div className="mt-2 flex justify-between text-xs text-gray-500">
                                    <span>14K: {s.weight14k || 0}g</span>
                                    <span>18K: {s.weight18k || 0}g</span>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(s)} className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-gray-900 shadow-sm"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-400 hover:text-red-600 shadow-sm"><Trash2 size={14} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {Array.isArray(settings) && settings.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No head settings found.
                    </div>
                )}
            </div>
        </div>
    );
}
