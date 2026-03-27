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
    const [editingQualityId, setEditingQualityId] = useState<string | null>(null);
    const [editQualityForm, setEditQualityForm] = useState({ clarity: "", color: "", pricePerCarat: 0 });

    const [pendingRates, setPendingRates] = useState<Record<string, number>>({});
    const [isSavingRates, setIsSavingRates] = useState(false);

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
            setPendingRates({}); // Reset pending on switch
        } catch (error) {
            console.error("Error fetching rates:", error);
            setRates([]);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (selectedDiamondId) fetchRates(selectedDiamondId); }, [selectedDiamondId]);

    const handleRateChange = (shapeId: string, caratOptionId: string, value: string) => {
        const rate = parseFloat(value) || 0;
        setPendingRates(prev => ({
            ...prev,
            [`${shapeId}-${caratOptionId}`]: rate
        }));
    };

    const handleSaveAllRates = async () => {
        if (!selectedDiamondId) return;
        setIsSavingRates(true);
        
        try {
            const promises = Object.entries(pendingRates).map(([key, rate]) => {
                const [shapeId, caratOptionId] = key.split("-");
                return fetch("/api/admin/diamond-rate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    body: JSON.stringify({ shapeId, caratOptionId, diamondId: selectedDiamondId, rate }),
                });
            });

            await Promise.all(promises);
            await fetchRates(selectedDiamondId);
            alert("All prices updated successfully!");
        } catch (err) {
            alert("Error saving some prices. Please try again.");
        } finally {
            setIsSavingRates(false);
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

    const handleUpdateQuality = async () => {
        if (!editingQualityId) return;
        const res = await fetch("/api/admin/diamond", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify({ id: editingQualityId, ...editQualityForm }),
        });
        if (res.ok) {
            fetchData();
            setEditingQualityId(null);
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
        <div className="max-w-6xl mx-auto px-1 sm:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Diamonds & Pricing</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage diamond qualities and their shape/carat specific rates.</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab("grid")}
                        className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "grid" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Grid3X3 size={16} />
                        Pricing Grid
                    </button>
                    <button
                        onClick={() => setActiveTab("qualities")}
                        className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "qualities" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Layers size={16} />
                        Qualities
                    </button>
                </div>
            </div>

            {activeTab === "grid" ? (
                <div className="space-y-6 sm:space-y-8">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Quality:</label>
                                <select
                                    className="w-full sm:w-64 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 text-sm appearance-none cursor-pointer"
                                    value={selectedDiamondId}
                                    onChange={(e) => setSelectedDiamondId(e.target.value)}
                                >
                                    {diamonds.map(d => (
                                        <option key={d.id} value={d.id}>{d.clarity} / {d.color} Quality</option>
                                    ))}
                                </select>
                            </div>

                            {Object.keys(pendingRates).length > 0 && (
                                <button
                                    onClick={handleSaveAllRates}
                                    disabled={isSavingRates}
                                    className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg hover:shadow-black/10 disabled:bg-gray-400 text-sm"
                                >
                                    {isSavingRates ? <Save className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save {Object.keys(pendingRates).length} Updates
                                </button>
                            )}
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-5 py-3 max-w-sm">
                            <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                                Editing prices for <span className="font-bold underline">{diamonds.find(d => d.id === selectedDiamondId)?.clarity} {diamonds.find(d => d.id === selectedDiamondId)?.color}</span>. Changes are tracked locally until you click "Save Updates".
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto scroll-smooth">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shape</th>
                                        {Array.isArray(carats) && carats.map(carat => (
                                            <th key={carat.id} className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                                                {carat.value} CT
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {Array.isArray(shapes) && shapes.map((shape) => (
                                        <tr key={shape.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 sm:px-8 py-4 sm:py-6 font-semibold text-gray-900 flex items-center gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-50 flex items-center justify-center p-1 border border-gray-100 shrink-0">
                                                    <img src={shape.imageUrl} alt={shape.name} className="max-w-full max-h-full object-contain opacity-60" />
                                                </div>
                                                <span className="text-sm">{shape.name}</span>
                                            </td>
                                            {Array.isArray(carats) && carats.map(carat => {
                                                const rateObj = Array.isArray(rates) ? rates.find(r => r.shapeId === shape.id && r.caratOptionId === carat.id) : null;
                                                return (
                                                    <td key={carat.id} className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                                                        <div className="relative max-w-[120px] sm:max-w-[150px] mx-auto group">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold group-focus-within:text-black transition-colors">₹</span>
                                                            <input
                                                                type="number"
                                                                className={`w-full pl-7 pr-3 py-2.5 rounded-xl border outline-none text-right font-bold transition-all text-xs sm:text-sm ${
                                                                    pendingRates[`${shape.id}-${carat.id}`] !== undefined 
                                                                    ? "border-black bg-white ring-2 ring-black/5 text-black" 
                                                                    : "border-gray-100 bg-gray-50/50 text-gray-700"
                                                                }`}
                                                                value={pendingRates[`${shape.id}-${carat.id}`] ?? rateObj?.rate ?? 0}
                                                                onChange={(e) => handleRateChange(shape.id, carat.id, e.target.value)}
                                                                placeholder={rateObj?.rate ? String(rateObj.rate) : "0"}
                                                            />
                                                            {pendingRates[`${shape.id}-${carat.id}`] !== undefined && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-black rounded-full border-2 border-white shadow-sm" />
                                                            )}
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
                <div className="space-y-6 sm:space-y-8">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddingQuality(true)}
                            className="bg-black text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm"
                        >
                            <Plus size={16} />
                            Add Quality
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clarity</th>
                                        <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</th>
                                        <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Base Price (Global)</th>
                                        <th className="px-6 sm:px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isAddingQuality && (
                                        <tr className="bg-gray-50/30">
                                            <td className="px-6 sm:px-8 py-4"><input type="text" placeholder="VVS1" className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm" value={qualityForm.clarity} onChange={e => setQualityForm({ ...qualityForm, clarity: e.target.value })} /></td>
                                            <td className="px-6 sm:px-8 py-4"><input type="text" placeholder="D" className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm" value={qualityForm.color} onChange={e => setQualityForm({ ...qualityForm, color: e.target.value })} /></td>
                                            <td className="px-6 sm:px-8 py-4"><input type="number" placeholder="120000" className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm" value={qualityForm.pricePerCarat} onChange={e => setQualityForm({ ...qualityForm, pricePerCarat: parseFloat(e.target.value) })} /></td>
                                            <td className="px-6 sm:px-8 py-4 text-right whitespace-nowrap">
                                                <button onClick={handleSaveQuality} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold mr-2 hover:bg-green-700">Save</button>
                                                <button onClick={() => setIsAddingQuality(false)} className="text-gray-400 text-xs font-bold hover:text-gray-600 px-3 py-1.5">Cancel</button>
                                            </td>
                                        </tr>
                                    )}
                                    {Array.isArray(diamonds) && diamonds.map((d) => (
                                        <tr key={d.id} className={`hover:bg-gray-50/50 transition-colors ${!d.isActive && !editingQualityId ? "opacity-50" : ""}`}>
                                            <td className="px-6 sm:px-8 py-4 sm:py-6">
                                                {editingQualityId === d.id ? (
                                                    <input 
                                                        type="text" 
                                                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm font-bold" 
                                                        value={editQualityForm.clarity} 
                                                        onChange={e => setEditQualityForm({ ...editQualityForm, clarity: e.target.value })} 
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 text-base sm:text-lg">{d.clarity}</span>
                                                        {!d.isActive && <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Hidden</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 sm:px-8 py-4 sm:py-6">
                                                {editingQualityId === d.id ? (
                                                    <input 
                                                        type="text" 
                                                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm font-medium" 
                                                        value={editQualityForm.color} 
                                                        onChange={e => setEditQualityForm({ ...editQualityForm, color: e.target.value })} 
                                                    />
                                                ) : (
                                                    <span className="text-gray-500 font-medium text-sm sm:text-base">{d.color}</span>
                                                )}
                                            </td>
                                            <td className="px-6 sm:px-8 py-4 sm:py-6">
                                                {editingQualityId === d.id ? (
                                                    <input 
                                                        type="number" 
                                                        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-full text-sm font-bold" 
                                                        value={editQualityForm.pricePerCarat} 
                                                        onChange={e => setEditQualityForm({ ...editQualityForm, pricePerCarat: parseFloat(e.target.value) })} 
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 underline decoration-dotted decoration-gray-200 text-xs sm:text-sm font-medium">₹{d.pricePerCarat.toLocaleString("en-IN")} /ct</span>
                                                )}
                                            </td>
                                            <td className="px-6 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap space-x-1 sm:space-x-2">
                                                {editingQualityId === d.id ? (
                                                    <>
                                                        <button 
                                                            onClick={handleUpdateQuality} 
                                                            className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
                                                        >
                                                            Update
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingQualityId(null)} 
                                                            className="text-gray-400 hover:text-black px-2 py-1.5 transition-all"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingQualityId(d.id);
                                                                setEditQualityForm({ clarity: d.clarity, color: d.color, pricePerCarat: d.pricePerCarat });
                                                            }}
                                                            className="text-gray-300 hover:text-black hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                                            title="Edit Quality"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleVisibility(d.id, d.isActive)}
                                                            className={`transition-colors p-2 rounded-lg ${d.isActive ? "text-gray-300 hover:text-black hover:bg-gray-50" : "text-black bg-black/5 hover:bg-black/10"}`}
                                                            title={d.isActive ? "Hide from Store" : "Show in Store"}
                                                        >
                                                            {d.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                                        </button>
                                                        <button onClick={() => handleDeleteQuality(d.id)} className="text-gray-200 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Quality">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 bg-black/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5">
                <p className="text-[10px] sm:text-xs text-center text-gray-500 leading-relaxed">
                    <span className="font-bold text-gray-900 mr-2">Pro Tip:</span>
                    The <strong className="text-gray-700">Pricing Grid</strong> allows you to set the exact rate for specific shape/carat combinations.
                    If a rate is left at 0, the system will use the quality's <strong className="text-gray-700">Base Price</strong> instead.
                </p>
            </div>
        </div>
    );
}
