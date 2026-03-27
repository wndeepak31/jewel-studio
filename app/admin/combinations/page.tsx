"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Upload, X, RefreshCw, ImagePlus, Trash2 } from "lucide-react";

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
        <div className="max-w-7xl mx-auto px-1 sm:px-0 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Combination Images</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage lifestyle and preview images for every ring configuration.</p>
                </div>
                <button
                    onClick={fetchCombos}
                    className="flex items-center justify-center p-2.5 sm:p-3 text-gray-400 hover:text-black hover:bg-white rounded-full transition-all"
                    title="Refresh list"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Upload Form Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 mb-10 sm:mb-12">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4">Create New Combination</h2>

                    {/* Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ring Style</label>
                            <select
                                value={styleSlug}
                                onChange={e => setStyleSlug(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all"
                            >
                                {Array.isArray(styles) && styles.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shape</label>
                            <select
                                value={shapeSlug}
                                onChange={e => setShapeSlug(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all"
                            >
                                {Array.isArray(shapes) && shapes.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Carat</label>
                            <select
                                value={carat}
                                onChange={e => setCarat(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all"
                            >
                                {Array.isArray(carats) && carats.map(c => <option key={c.id} value={c.value.toFixed(2)}>{c.value} ct</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Metal Color</label>
                            <select
                                value={metal}
                                onChange={e => setMetal(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all"
                            >
                                <option value="white-gold">White Gold</option>
                                <option value="yellow-gold">Yellow Gold</option>
                                <option value="rose-gold">Rose Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                            <span className="text-[10px] text-gray-400 mt-1 block px-1">Covers both 14K & 18K purity</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Setting Type</label>
                            <select
                                value={settingSlug}
                                onChange={e => setSettingSlug(e.target.value)}
                                className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl border border-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50/50 transition-all"
                            >
                                {Array.isArray(settings) && settings.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* View Uploads Grid */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Capture Views</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl w-fit">
                                {[2, 3, 4].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setViewCount(n)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewCount === n ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {n} Angles
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {Array.from({ length: viewCount }).map((_, i) => (
                                <div key={i} className="relative aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-3xl border-2 border-dashed border-gray-100 hover:border-black/5 transition-all flex flex-col items-center justify-center p-2 sm:p-4 bg-gray-50/30 group overflow-hidden">
                                    {viewPreviews[i] ? (
                                        <>
                                            <img src={viewPreviews[i]} className="absolute inset-0 w-full h-full object-contain p-2" alt={VIEW_LABELS[i]} />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const f = [...viewFiles]; f[i] = null; setViewFiles(f);
                                                    const p = [...viewPreviews]; p[i] = ""; setViewPreviews(p);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-1 sm:gap-2 text-center w-full h-full justify-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300 group-hover:text-black transition-colors">
                                                <ImagePlus size={24} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{VIEW_LABELS[i]}</span>
                                            <input type="file" className="hidden" onChange={handleFileChange(i)} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full sm:w-auto bg-black text-white px-10 sm:px-14 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-gray-900 transition-all shadow-xl flex items-center justify-center gap-3 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {uploading ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
                            {uploading ? "Saving Combination..." : "Confirm & Save Combination"}
                        </button>
                        {message && (
                            <div className={`text-sm font-bold flex items-center gap-2 ${message.includes("Error") || message.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
                                <span>{message}</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-8 px-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Combination Repository</h2>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">{combos.length} Items</div>
            </div>

            {/* Grouped Accordion List */}
            <div className="space-y-4">
                {Object.entries(grouped).map(([styleS, styleCombos]) => {
                    const isExpanded = expandedGroups.has(styleS);
                    return (
                        <div key={styleS} className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <button
                                onClick={() => toggleGroup(styleS)}
                                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? "bg-black text-white shadow-lg" : "bg-gray-50 text-gray-300"}`}>
                                        {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900 text-base sm:text-xl">{getStyleName(styleS)}</h3>
                                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{styleCombos.length} Visual Variations</p>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-gray-50">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[900px]">
                                            <thead className="bg-gray-50/30 border-b border-gray-50">
                                                <tr>
                                                    <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuration Details</th>
                                                    <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Matrix (Click to Swap)</th>
                                                    <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Settings</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {styleCombos.map((c) => (
                                                    <tr key={c.id} className="hover:bg-gray-50/10 transition-colors group">
                                                        <td className="px-6 sm:px-8 py-6">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm sm:text-base font-bold text-gray-900 capitalize">{c.shapeSlug}</span>
                                                                    <span className="text-xs text-gray-300 font-bold">•</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-gray-600">{c.carat} Carat</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                                    <span className={c.metal === 'platinum' ? 'text-blue-400' : 'text-amber-500'}>{c.metal.replace('-', ' ')}</span>
                                                                    <span className="text-gray-200">•</span>
                                                                    <span className="text-gray-400">{c.settingSlug} Design</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 sm:px-8 py-6">
                                                            <div className="flex gap-4">
                                                                {VIEW_KEYS.map((key, idx) => {
                                                                    const url = c[key];
                                                                    const isEditingThis = editingCombo === c.id && editViewIndex === idx;

                                                                    return (
                                                                        <div key={key} className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl border border-gray-100 bg-white flex items-center justify-center group/view overflow-hidden shadow-sm">
                                                                            {url ? (
                                                                                <img src={url} className="w-full h-full object-contain p-1.5 opacity-90 group-hover/view:opacity-50 transition-opacity" alt={`V${idx + 1}`} />
                                                                            ) : (
                                                                                <span className="text-[10px] text-gray-200 font-bold">{idx + 1}</span>
                                                                            )}

                                                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/view:opacity-100 transition-all flex items-center justify-center cursor-pointer text-white">
                                                                                <Upload size={18} />
                                                                                <input
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    onChange={(e) => {
                                                                                        const file = e.target.files?.[0];
                                                                                        if (file) {
                                                                                            setEditingCombo(c.id);
                                                                                            setEditViewIndex(idx);
                                                                                            setEditFile(file);
                                                                                            handleEditSave(c.id, key);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>

                                                                            {isEditingThis && editUploading && (
                                                                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                                                                    <RefreshCw size={20} className="animate-spin text-black" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 sm:px-8 py-6 text-right">
                                                            <button
                                                                onClick={() => handleDelete(c.id)}
                                                                className="p-2 sm:p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                                title="Remove Combination"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {combos.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">No combination records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
