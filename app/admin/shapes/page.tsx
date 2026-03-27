"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Check, X, Eye, EyeOff } from "lucide-react";

export default function ShapesPage() {
    const [shapes, setShapes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", imageUrl: "" });

    const fetchShapes = async () => {
        try {
            const res = await fetch("/api/shapes?all=true");
            const data = await res.json();
            if (Array.isArray(data)) {
                setShapes(data);
            } else {
                console.error("Failed to fetch shapes: Expected array, got", data);
                setShapes([]);
            }
        } catch (error) {
            console.error("Error fetching shapes:", error);
            setShapes([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchShapes(); }, []);

    const resetForm = () => {
        setFormData({ name: "", slug: "", imageUrl: "" });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSave = async (id?: string) => {
        const res = await fetch("/api/admin/shape", {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(id ? { ...formData, id } : formData),
        });
        if (res.ok) {
            fetchShapes();
            resetForm();
        }
    };

    const handleToggleVisibility = async (shape: any) => {
        await fetch("/api/admin/shape", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id: shape.id, isActive: !shape.isActive }),
        });
        fetchShapes();
    };

    const handleEdit = (shape: any) => {
        setEditingId(shape.id);
        setFormData({ name: shape.name, slug: shape.slug, imageUrl: shape.imageUrl });
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this shape?")) return;
        await fetch("/api/admin/shape", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id }),
        });
        fetchShapes();
    };

    const renderFormRow = (id?: string) => (
        <tr className="bg-gray-50/30">
            <td className="px-8 py-4">
                <input type="text" placeholder="Round" className="w-full bg-transparent border-b border-gray-200 outline-none py-1" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </td>
            <td className="px-8 py-4">
                <input type="text" placeholder="round" className="w-full bg-transparent border-b border-gray-200 outline-none py-1" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </td>
            <td className="px-8 py-4">
                <input type="text" placeholder="/studio/shapes/round.png" className="w-full bg-transparent border-b border-gray-200 outline-none py-1" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
            </td>
            <td className="px-8 py-4">
                {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="w-10 h-10 object-contain mx-auto" />}
            </td>
            <td className="px-8 py-4"></td>
            <td className="px-8 py-4 text-right">
                <button onClick={() => handleSave(id)} className="text-green-600 mr-4 font-bold text-sm">Save</button>
                <button onClick={resetForm} className="text-gray-400 font-bold text-sm">Cancel</button>
            </td>
        </tr>
    );

    return (
        <div className="max-w-6xl mx-auto px-1 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Diamond Shapes</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage available diamond shapes and their preview images.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg w-full sm:w-auto text-sm"
                >
                    <Plus size={18} />
                    Add New Shape
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isAdding && (
                    <div className="bg-gray-50 p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col justify-between">
                        <div className="aspect-square rounded-2xl bg-gray-100 mb-4 overflow-hidden flex items-center justify-center p-4">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="preview" className="max-h-full max-w-full object-contain opacity-80" />
                            ) : (
                                <span className="text-gray-400 text-sm">Image Preview</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Shape Name"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Slug"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => handleSave()} className="flex-1 p-2 bg-green-50 text-green-600 rounded-lg flex items-center justify-center gap-1 text-sm font-medium hover:bg-green-100 transition-colors">
                                    <Check size={16} /> Save
                                </button>
                                <button onClick={resetForm} className="flex-1 p-2 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-1 text-sm font-medium hover:bg-red-100 transition-colors">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {shapes.map((shape) => (
                    <div key={shape.id} className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm relative group overflow-hidden">
                        <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center p-4">
                            <img src={shape.imageUrl} alt={shape.name} className="max-h-full max-w-full object-contain opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        {editingId === shape.id ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-100 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleSave(shape.id)} className="p-2 bg-green-50 text-green-600 rounded-lg"><Check size={16} /></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-red-50 text-red-600 rounded-lg"><X size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{shape.name}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditingId(shape.id); setFormData(shape); }} className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(shape.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {Array.isArray(shapes) && shapes.length === 0 && !loading && (
                    <div className="col-span-full px-8 py-20 text-center text-gray-400">No shapes found.</div>
                )}
            </div>
        </div>
    );
}
