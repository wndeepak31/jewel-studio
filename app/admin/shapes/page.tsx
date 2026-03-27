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
                    <div className="bg-gray-50 p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col justify-between h-full">
                        <div className="aspect-square rounded-2xl bg-gray-200 mb-4 overflow-hidden flex items-center justify-center p-4">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="preview" className="max-h-full max-w-full object-contain opacity-50 transition-transform duration-500" />
                            ) : (
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Image Preview</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <input
                                type="text"
                                placeholder="Shape Name (e.g. Round)"
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-black/5 outline-none font-medium shadow-inner bg-white"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Slug (e.g. round)"
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-black/5 outline-none font-medium shadow-inner bg-white"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image URL (e.g. /studio/shapes/round.png)"
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-black/5 outline-none font-medium shadow-inner bg-white"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => handleSave()} className="flex-1 py-2.5 bg-black text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-gray-900 transition-all shadow-md">
                                    <Check size={14} /> Save Shape
                                </button>
                                <button onClick={resetForm} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center text-xs font-bold hover:bg-gray-200 transition-all">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {shapes.map((shape) => (
                    <div key={shape.id} className={`bg-white p-6 rounded-2xl sm:rounded-3xl border shadow-sm relative group overflow-hidden transition-all duration-300 ${!shape.isActive ? 'border-gray-100 bg-gray-50/30' : 'border-gray-50'}`}>
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 ${shape.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                            {shape.isActive ? 'Visible' : 'Hidden'}
                        </div>

                        <div className={`aspect-square rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-4 transition-all duration-500 ${!shape.isActive ? 'bg-gray-100/50 grayscale opacity-40' : 'bg-gray-50'}`}>
                            <img src={shape.imageUrl} alt={shape.name} className="max-h-full max-w-full object-contain opacity-80 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {editingId === shape.id ? (
                            <div className="flex flex-col gap-2.5">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-100 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleSave(shape.id)} className="flex-1 py-2 bg-black text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-gray-900 transition-all"><Check size={14} /> Update</button>
                                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center text-xs font-bold hover:bg-gray-200 transition-all"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`font-bold transition-all duration-300 text-sm sm:text-base ${!shape.isActive ? 'text-gray-400' : 'text-gray-900'}`}>{shape.name}</h3>
                                    <p className="text-[10px] text-gray-300 font-medium tracking-tight mt-0.5">{shape.slug}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        onClick={() => handleToggleVisibility(shape)} 
                                        className={`p-2 rounded-lg transition-all duration-300 ${shape.isActive ? 'text-gray-300 hover:text-blue-500 hover:bg-blue-50' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`}
                                        title={shape.isActive ? "Hide Shape" : "Show Shape"}
                                    >
                                        {shape.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => handleEdit(shape)} className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-colors" title="Edit Shape"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(shape.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Shape"><Trash2 size={18} /></button>
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
