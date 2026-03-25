"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, Check, X, Diamond, Layers, Grid3X3, Settings2, Eye, EyeOff } from "lucide-react";

export default function DiamondsPage() {
    const [activeTab, setActiveTab] = useState<"grid" | "qualities">("grid");
    const [shapes, setShapes] = useState<any[]>([]);
    const [carats, setCarats] = useState<any[]>([]);
    const [diamonds, setDiamonds] = useState<any[]>([]);
    const [selectedDiamondId, setSelectedDiamondId] = useState<string>("");
    const [rates, setRates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddingQuality, setIsAddingQuality] = useState(false);
    const [qualityForm, setQualityForm] = useState({ clarity: "", color: "", pricePerCarat: 0 });

    const fetchData = async () => {
        try {
            const [shapesRes, caratsRes, diamondsRes] = await Promise.all([
                fetch("/api/shapes?all=true"),
                fetch("/api/carats"),
                fetch("/api/admin/diamond", {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
                })
            ]);

            const shapesData = await shapesRes.json();
            const caratsData = await caratsRes.json();
            const diamondsData = await diamondsRes.json();

            setShapes(Array.isArray(shapesData) ? shapesData : []);
            setCarats(Array.isArray(caratsData) ? caratsData : []);
            setDiamonds(Array.isArray(diamondsData) ? diamondsData : []);

            if (Array.isArray(diamondsData) && diamondsData.length > 0 && !selectedDiamondId) {
                setSelectedDiamondId(diamondsData[0].id);
            }
        } catch (error) {
            console.error("Error fetching diamond data:", error);
            setShapes([]);
            setCarats([]);
            setDiamonds([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRates = async (diamondId: string) => {
        if (!diamondId) return;
        try {
            const res = await fetch(`/api/admin/diamond-rate?diamondId=${diamondId}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
            });
            const data = await res.json();
            setRates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching rates:", error);
            setRates([]);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (selectedDiamondId) fetchRates(selectedDiamondId); }, [selectedDiamondId]);

    const handleUpdateRate = async (shapeId: string, caratOptionId: string, value: string) => {
        const rate = parseFloat(value) || 0;
        if (!selectedDiamondId) return;

        const res = await fetch("/api/admin/diamond-rate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ shapeId, caratOptionId, diamondId: selectedDiamondId, rate }),
        });

        if (res.ok) {
            fetchRates(selectedDiamondId);
        }
    };

    const handleSaveQuality = async () => {
        const res = await fetch("/api/admin/diamond", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(qualityForm),
        });
        if (res.ok) {
            fetchData();
            setIsAddingQuality(false);
            setQualityForm({ clarity: "", color: "", pricePerCarat: 0 });
        }
    };

    const handleDeleteQuality = async (id: string) => {
        if (!confirm("Deleting this quality will also remove all its rates in the grid. Continue?")) return;
        const res = await fetch("/api/admin/diamond", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id }),
        });
        if (res.ok) fetchData();
    };

    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        const res = await fetch("/api/admin/diamond", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id, isActive: !currentStatus }),
        });
        if (res.ok) fetchData();
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading Diamond Management...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Diamonds & Pricing</h1>
                    <p className="text-gray-500 mt-1">Manage diamond qualities and their shape/carat specific rates.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab("grid")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "grid" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Grid3X3 size={16} />
                        Pricing Grid
                    </button>
                    <button
                        onClick={() => setActiveTab("qualities")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "qualities" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Layers size={16} />
                        Qualities
                    </button>
                </div>
            </div>

            {activeTab === "grid" ? (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Select Quality:</label>
                            <select
                                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"
                                value={selectedDiamondId}
                                onChange={(e) => setSelectedDiamondId(e.target.value)}
                            >
                                {Array.isArray(diamonds) && diamonds.map(d => (
                                    <option key={d.id} value={d.id}>{d.clarity} {d.color} {!d.isActive ? "(Hidden)" : ""}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-400 max-w-xs text-right">
                            Showing the price (₹/ct) grid for the selected diamond quality.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Shape</th>
                                        {Array.isArray(carats) && carats.map(carat => (
                                            <th key={carat.id} className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                                                {carat.value} CT
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {Array.isArray(shapes) && shapes.map((shape) => (
                                        <tr key={shape.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6 font-semibold text-gray-900 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100">
                                                    <img src={shape.imageUrl} alt={shape.name} className="max-w-full max-h-full object-contain opacity-60" />
                                                </div>
                                                {shape.name}
                                            </td>
                                            {Array.isArray(carats) && carats.map(carat => {
                                                const rateObj = Array.isArray(rates) ? rates.find(r => r.shapeId === shape.id && r.caratOptionId === carat.id) : null;
                                                return (
                                                    <td key={carat.id} className="px-8 py-6 text-center">
                                                        <div className="relative max-w-[150px] mx-auto">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-black/5 outline-none text-right font-medium text-gray-900 transition-all text-sm"
                                                                defaultValue={rateObj?.rate || 0}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== String(rateObj?.rate || 0)) {
                                                                        handleUpdateRate(shape.id, carat.id, e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddingQuality(true)}
                            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Quality
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Clarity</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Base Price (Global)</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isAddingQuality && (
                                    <tr className="bg-gray-50/30">
                                        <td className="px-8 py-4"><input type="text" placeholder="VVS1" className="bg-transparent border-b border-gray-200 outline-none w-full" value={qualityForm.clarity} onChange={e => setQualityForm({ ...qualityForm, clarity: e.target.value })} /></td>
                                        <td className="px-8 py-4"><input type="text" placeholder="D" className="bg-transparent border-b border-gray-200 outline-none w-full" value={qualityForm.color} onChange={e => setQualityForm({ ...qualityForm, color: e.target.value })} /></td>
                                        <td className="px-8 py-4"><input type="number" placeholder="120000" className="bg-transparent border-b border-gray-200 outline-none w-full" value={qualityForm.pricePerCarat} onChange={e => setQualityForm({ ...qualityForm, pricePerCarat: parseFloat(e.target.value) })} /></td>
                                        <td className="px-8 py-4 text-right">
                                            <button onClick={handleSaveQuality} className="text-green-600 font-bold mr-4">Save</button>
                                            <button onClick={() => setIsAddingQuality(false)} className="text-gray-400 font-bold">Cancel</button>
                                        </td>
                                    </tr>
                                )}
                                {Array.isArray(diamonds) && diamonds.map((d) => (
                                    <tr key={d.id} className={`hover:bg-gray-50/50 transition-colors ${!d.isActive ? "opacity-50" : ""}`}>
                                        <td className="px-8 py-6 font-bold text-gray-900 text-lg">
                                            {d.clarity}
                                            {!d.isActive && <span className="ml-2 text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Hidden</span>}
                                        </td>
                                        <td className="px-8 py-6 text-gray-500 font-medium">{d.color}</td>
                                        <td className="px-8 py-6 text-gray-400 italic text-sm">₹{d.pricePerCarat.toLocaleString("en-IN")} /ct (fallback)</td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleToggleVisibility(d.id, d.isActive)}
                                                className={`mr-4 transition-colors ${d.isActive ? "text-gray-300 hover:text-black" : "text-black hover:text-gray-600"}`}
                                                title={d.isActive ? "Hide from Store" : "Show in Store"}
                                            >
                                                {d.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button onClick={() => handleDeleteQuality(d.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-8 bg-black/5 p-6 rounded-3xl border border-black/5">
                <p className="text-xs text-center text-gray-500 leading-relaxed">
                    <span className="font-bold text-gray-900 mr-2">Pro Tip:</span>
                    The Pricing Grid allows you to set the exact rate for specific shape/carat combinations.
                    If a rate is left at 0, the system will use the quality's base price instead.
                </p>
            </div>
        </div>
    );
}
