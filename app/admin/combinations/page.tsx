"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Upload, X, RefreshCw, ImagePlus } from "lucide-react";

type Option = { id: string; name: string; slug: string };
type Metal = { id: string; name: string; purity: string; color: string };
type Carat = { id: string; value: number };
type Combo = {
    id: string; styleSlug: string; shapeSlug: string; carat: string;
    metal: string; settingSlug: string;
    view1Url: string; view2Url: string; view3Url: string; view4Url: string;
    updatedAt: string;
};

const VIEW_LABELS = ["Front View", "Angle View", "Side View", "Top View"];
const VIEW_KEYS = ["view1Url", "view2Url", "view3Url", "view4Url"] as const;

export default function CombinationsPage() {
    const [token, setToken] = useState("");
    const [styles, setStyles] = useState<Option[]>([]);
    const [shapes, setShapes] = useState<Option[]>([]);
    const [settings, setSettings] = useState<Option[]>([]);
    const [metals, setMetals] = useState<Metal[]>([]);
    const [carats, setCarats] = useState<Carat[]>([]);

    const [styleSlug, setStyleSlug] = useState("");
    const [shapeSlug, setShapeSlug] = useState("");
    const [carat, setCarat] = useState("");
    const [metal, setMetal] = useState("white-gold");
    const [settingSlug, setSettingSlug] = useState("");

    const [viewFiles, setViewFiles] = useState<(File | null)[]>([null, null, null, null]);
    const [viewPreviews, setViewPreviews] = useState<string[]>(["", "", "", ""]);
    const [viewCount, setViewCount] = useState(2);

    const [uploading, setUploading] = useState(false);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [message, setMessage] = useState("");

    /* Grouped combos state */
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    /* Edit state */
    const [editingCombo, setEditingCombo] = useState<string | null>(null);
    const [editViewIndex, setEditViewIndex] = useState<number | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState("");
    const [editUploading, setEditUploading] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem("adminToken") || "");
        Promise.all([
            fetch("/api/ring-styles").then(r => r.json()),
            fetch("/api/shapes?all=true").then(r => r.json()),
            fetch("/api/settings").then(r => r.json()),
            fetch("/api/metals").then(r => r.json()),
            fetch("/api/carats").then(r => r.json()),
        ]).then(([st, sh, se, me, ca]) => {
            const stylesData = Array.isArray(st) ? st : [];
            const shapesData = Array.isArray(sh) ? sh : [];
            const settingsData = Array.isArray(se) ? se : [];
            const metalsData = Array.isArray(me) ? me : [];
            const caratsData = Array.isArray(ca) ? ca : [];

            setStyles(stylesData);
            setShapes(shapesData);
            setSettings(settingsData);
            setMetals(metalsData);
            setCarats(caratsData);

            if (stylesData.length) setStyleSlug(stylesData[0].slug);
            if (shapesData.length) setShapeSlug(shapesData[0].slug);
            if (settingsData.length) setSettingSlug(settingsData[0].slug);
            if (caratsData.length) setCarat(caratsData[0].value.toFixed(2));
        }).catch(err => {
            console.error("Error fetching combination data:", err);
            setStyles([]);
            setShapes([]);
            setSettings([]);
            setMetals([]);
            setCarats([]);
        });
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchCombos();
    }, [token]);

    async function fetchCombos() {
        try {
            const res = await fetch("/api/admin/combination-image", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCombos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching combos:", error);
            setCombos([]);
        }
    }

    async function uploadToCloudinary(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        return data.url;
    }

    function handleFileChange(index: number) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            const newFiles = [...viewFiles];
            newFiles[index] = file;
            setViewFiles(newFiles);
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const newPreviews = [...viewPreviews];
                    newPreviews[index] = reader.result as string;
                    setViewPreviews(newPreviews);
                };
                reader.readAsDataURL(file);
            } else {
                const newPreviews = [...viewPreviews];
                newPreviews[index] = "";
                setViewPreviews(newPreviews);
            }
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!viewFiles[0]) { setMessage("Please select View 1 image"); return; }
        setUploading(true);
        setMessage("");

        try {
            const urls: string[] = [];
            for (let i = 0; i < viewCount; i++) {
                if (viewFiles[i]) {
                    urls[i] = await uploadToCloudinary(viewFiles[i]!);
                } else {
                    urls[i] = "";
                }
            }

            const res = await fetch("/api/admin/combination-image", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    styleSlug, shapeSlug, carat, metal, settingSlug,
                    view1Url: urls[0] || "",
                    view2Url: urls[1] || "",
                    view3Url: urls[2] || "",
                    view4Url: urls[3] || "",
                }),
            });

            if (res.ok) {
                setMessage("✓ Combination image saved!");
                setViewFiles([null, null, null, null]);
                setViewPreviews(["", "", "", ""]);
                fetchCombos();
            } else {
                setMessage("✗ Failed to save");
            }
        } catch {
            setMessage("✗ Upload error");
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this combination image?")) return;
        await fetch(`/api/admin/combination-image?id=${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchCombos();
    }

    async function handleEditSave(comboId: string, viewKey: string) {
        if (!editFile) return;
        setEditUploading(true);
        try {
            const url = await uploadToCloudinary(editFile);
            await fetch("/api/admin/combination-image", {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: comboId, [viewKey]: url }),
            });
            fetchCombos();
            setEditingCombo(null);
            setEditViewIndex(null);
            setEditFile(null);
            setEditPreview("");
        } catch {
            alert("Failed to update image");
        } finally {
            setEditUploading(false);
        }
    }

    function toggleGroup(key: string) {
        const next = new Set(expandedGroups);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setExpandedGroups(next);
    }

    /* Group combos by style slug */
    const grouped = Array.isArray(combos) ? combos.reduce<Record<string, Combo[]>>((acc, c) => {
        const key = c.styleSlug;
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {}) : {};

    function getStyleName(slug: string) {
        return Array.isArray(styles) ? (styles.find(s => s.slug === slug)?.name || slug) : slug;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Combination Images</h1>
                <p className="text-gray-500 text-sm mt-1">Upload ring preview images for each style + shape + carat + metal + setting combination</p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                <h2 className="text-lg font-semibold text-gray-800">Upload New Combination</h2>

                {/* Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Ring Style</label>
                        <select value={styleSlug} onChange={e => setStyleSlug(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5">
                            {Array.isArray(styles) && styles.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Shape</label>
                        <select value={shapeSlug} onChange={e => setShapeSlug(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5">
                            {Array.isArray(shapes) && shapes.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Carat</label>
                        <select value={carat} onChange={e => setCarat(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5">
                            {Array.isArray(carats) && carats.map(c => <option key={c.id} value={c.value.toFixed(2)}>{c.value} ct</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Metal Color</label>
                        <select value={metal} onChange={e => setMetal(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5">
                            <option value="white-gold">White Gold</option>
                            <option value="yellow-gold">Yellow Gold</option>
                            <option value="rose-gold">Rose Gold</option>
                        </select>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">Same image for 14K &amp; 18K</span>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Setting</label>
                        <select value={settingSlug} onChange={e => setSettingSlug(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5">
                            {Array.isArray(settings) && settings.map(s => <option key={s.id} value={s.slug}>{s.name} ({s.slug})</option>)}
                        </select>
                    </div>
                </div>

                {/* View Count Control */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600">Number of views:</span>
                    <div className="flex gap-1">
                        {[2, 3, 4].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setViewCount(n)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${viewCount === n ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >{n}</button>
                        ))}
                    </div>
                </div>

                {/* File Uploads — Dynamic */}
                <div className={`grid gap-4 ${viewCount <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
                    {Array.from({ length: viewCount }, (_, i) => (
                        <div key={i}>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                {VIEW_LABELS[i]} {i === 0 && <span className="text-red-500">*</span>}{i > 0 && <span className="text-gray-400">(optional)</span>}
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-gray-400 transition-colors">
                                <input type="file" accept="image/*" onChange={handleFileChange(i)} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-black file:text-white hover:file:bg-gray-800" />
                                {viewPreviews[i] && <img src={viewPreviews[i]} alt={`View ${i + 1}`} className="mt-2 max-h-24 mx-auto rounded-lg object-contain" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Combination Preview Label */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 font-mono">
                    Preview path: <span className="text-gray-800 font-semibold">{styleSlug}/{shapeSlug}/{carat}/{metal}/{settingSlug}</span>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={uploading} className="px-8 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {uploading ? "Uploading..." : "Save Combination Image"}
                    </button>
                    {message && <p className={`text-sm font-medium ${message.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>{message}</p>}
                </div>
            </form>

            {/* Grouped Combinations */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Uploaded Combinations</h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">{combos.length} total</span>
                </div>

                {Object.keys(grouped).length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center bg-white rounded-2xl border border-gray-100">No combination images uploaded yet.</p>
                ) : (
                    Object.entries(grouped).map(([styleSl, items]) => (
                        <div key={styleSl} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(styleSl)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedGroups.has(styleSl)
                                        ? <ChevronDown size={18} className="text-gray-400" />
                                        : <ChevronRight size={18} className="text-gray-400" />
                                    }
                                    <span className="font-semibold text-gray-900">{getStyleName(styleSl)}</span>
                                    <span className="text-xs text-gray-400 font-mono">{styleSl}</span>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{items.length} combos</span>
                            </button>

                            {/* Group Content */}
                            {expandedGroups.has(styleSl) && (
                                <div className="border-t border-gray-100">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">Shape</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">Carat</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">Metal</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">Setting</th>
                                                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400">Views</th>
                                                <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(c => {
                                                const allViews = VIEW_KEYS.map(k => c[k]).filter(Boolean);
                                                return (
                                                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/30">
                                                        <td className="py-3 px-4 font-medium text-gray-700">{c.shapeSlug}</td>
                                                        <td className="py-3 px-4 text-gray-500">{c.carat}</td>
                                                        <td className="py-3 px-4 text-gray-500">{c.metal}</td>
                                                        <td className="py-3 px-4 text-gray-500">{c.settingSlug}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-2 items-center">
                                                                {VIEW_KEYS.map((key, i) => {
                                                                    const url = c[key];
                                                                    if (!url && i >= 2) return null; // Only show empty slots for the first 2
                                                                    const isEditing = editingCombo === c.id && editViewIndex === i;

                                                                    return (
                                                                        <div key={key} className="relative group">
                                                                            {url ? (
                                                                                <>
                                                                                    <img src={url} alt={`v${i + 1}`} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                                                                    {/* Hover overlay to replace */}
                                                                                    <button
                                                                                        onClick={() => { setEditingCombo(c.id); setEditViewIndex(i); setEditFile(null); setEditPreview(""); }}
                                                                                        className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                                                        title={`Replace ${VIEW_LABELS[i]}`}
                                                                                    >
                                                                                        <RefreshCw size={14} className="text-white" />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => { setEditingCombo(c.id); setEditViewIndex(i); setEditFile(null); setEditPreview(""); }}
                                                                                    className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                                                                                    title={`Add ${VIEW_LABELS[i]}`}
                                                                                >
                                                                                    <ImagePlus size={14} className="text-gray-300" />
                                                                                </button>
                                                                            )}

                                                                            {/* Edit Popover */}
                                                                            {isEditing && (
                                                                                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-[10px] font-medium text-gray-500">{VIEW_LABELS[i]}</span>
                                                                                        <button onClick={() => { setEditingCombo(null); setEditViewIndex(null); }} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                                                                                    </div>
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        onChange={e => {
                                                                                            const f = e.target.files?.[0] || null;
                                                                                            setEditFile(f);
                                                                                            if (f) {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = () => setEditPreview(reader.result as string);
                                                                                                reader.readAsDataURL(f);
                                                                                            }
                                                                                        }}
                                                                                        className="block w-full text-[10px] text-gray-500 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-medium file:bg-gray-900 file:text-white mb-2"
                                                                                    />
                                                                                    {editPreview && <img src={editPreview} alt="preview" className="w-full h-20 rounded-lg object-contain mb-2 bg-gray-50" />}
                                                                                    <button
                                                                                        onClick={() => handleEditSave(c.id, key)}
                                                                                        disabled={!editFile || editUploading}
                                                                                        className="w-full py-1.5 text-[11px] font-semibold bg-black text-white rounded-lg disabled:bg-gray-300 hover:bg-gray-800 transition-colors"
                                                                                    >
                                                                                        {editUploading ? "Saving..." : "Save"}
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Add more view button */}
                                                                {allViews.length < 4 && allViews.length >= 2 && (
                                                                    <button
                                                                        onClick={() => { setEditingCombo(c.id); setEditViewIndex(allViews.length); setEditFile(null); setEditPreview(""); }}
                                                                        className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                                                                        title="Add another view"
                                                                    >
                                                                        <ImagePlus size={14} className="text-gray-300" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
