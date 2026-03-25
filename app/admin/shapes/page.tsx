"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit3, Eye, EyeOff } from "lucide-react";

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
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Diamond Shapes</h1>
                    <p className="text-gray-500 mt-1">Manage diamond shapes available in the ring configurator.</p>
                </div>
                <button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg">
                    Add Shape
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Slug</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Image URL</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Preview</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Visibility</th>
                            <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isAdding && renderFormRow()}
                        {Array.isArray(shapes) && shapes.map((shape) => (
                            editingId === shape.id ? (
                                renderFormRow(shape.id)
                            ) : (
                                <tr key={shape.id} className={`hover:bg-gray-50/50 transition-colors ${!shape.isActive ? "opacity-50" : ""}`}>
                                    <td className="px-8 py-6 font-semibold text-gray-900">
                                        {shape.name}
                                        {!shape.isActive && <span className="ml-2 text-xs text-red-400 font-normal">(Hidden)</span>}
                                    </td>
                                    <td className="px-8 py-6 text-gray-500">{shape.slug}</td>
                                    <td className="px-8 py-6 text-gray-500 text-sm truncate max-w-[200px]">{shape.imageUrl}</td>
                                    <td className="px-8 py-6 text-center">
                                        <img src={shape.imageUrl} alt={shape.name} className="w-10 h-10 object-contain mx-auto" />
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => handleToggleVisibility(shape)}
                                            className={`p-2 rounded-lg transition-all ${shape.isActive
                                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                : "bg-red-50 text-red-400 hover:bg-red-100"
                                                }`}
                                            title={shape.isActive ? "Click to hide" : "Click to show"}
                                        >
                                            {shape.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right space-x-4">
                                        <button onClick={() => handleEdit(shape)} className="text-gray-400 hover:text-gray-900 transition-colors"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDelete(shape.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )
                        ))}
                        {Array.isArray(shapes) && shapes.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-gray-400">No shapes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
