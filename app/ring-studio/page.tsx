"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RingLivePreview from "./../../components/RingLivePreview";

/* ─── API Types ──────────────────────────────────────────────── */
type ApiRingStyle = { id: string; name: string; slug: string; imageUrl: string; weight14k: number; weight18k: number; sideStoneWeight: number };
type ApiShape = { id: string; name: string; slug: string; imageUrl: string };
type ApiSetting = { id: string; name: string; slug: string; imageUrl: string; priceMultiplier: number };
type ApiMetal = { id: string; name: string; purity: string; color: string; pricePerGram: number; makingCharges: number };
type ApiDiamond = { id: string; clarity: string; color: string; pricePerCarat: number };
type ApiCarat = { id: string; value: number; multiplier: number };

/* ─── Main Page ──────────────────────────────────────────────── */
export default function RingStudioPage() {
  const [ringStyles, setRingStyles] = useState<ApiRingStyle[]>([]);
  const [shapes, setShapes] = useState<ApiShape[]>([]);
  const [settings, setSettings] = useState<ApiSetting[]>([]);
  const [metals, setMetals] = useState<ApiMetal[]>([]);
  const [diamonds, setDiamonds] = useState<ApiDiamond[]>([]);
  const [carats, setCarats] = useState<ApiCarat[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [styleId, setStyleId] = useState("");
  const [shapeId, setShapeId] = useState("");
  const [caratId, setCaratId] = useState("");
  const [settingId, setSettingId] = useState("");
  const [metalId, setMetalId] = useState("");
  const [diamondId, setDiamondId] = useState("");

  const [ringPrice, setRingPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─── Fetch all data ───────────────────────────────────────── */
  useEffect(() => {
    async function fetchAllData() {
      try {
        const fetchResource = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        };

        const [stylesData, shapesData, settingsData, metalsData, diamondsData, caratsData] = await Promise.all([
          fetchResource("/api/ring-styles"),
          fetchResource("/api/shapes"),
          fetchResource("/api/settings"),
          fetchResource("/api/metals"),
          fetchResource("/api/diamonds"),
          fetchResource("/api/carats"),
        ]);

        setRingStyles(stylesData);
        setShapes(shapesData);
        setSettings(settingsData);
        setMetals(metalsData);
        setDiamonds(diamondsData);
        setCarats(caratsData);

        if (stylesData.length) setStyleId(stylesData[0].id);
        if (shapesData.length) setShapeId(shapesData[0].id);
        if (settingsData.length) setSettingId(settingsData[0].id);
        if (metalsData.length) setMetalId(metalsData[0].id);
        if (diamondsData.length) setDiamondId(diamondsData[0].id);
        if (caratsData.length) setCaratId(caratsData[0].id);

        if (stylesData.length === 0) {
           setError("No ring styles found. Please check your inventory.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load studio data. Please check your internet connection or try again later.");
      } finally {
        setDataLoading(false);
      }
    }
    fetchAllData();
  }, []);

  /* ─── Calculate price ──────────────────────────────────────── */
  const calculatePrice = useCallback(async () => {
    if (!styleId || !metalId || !diamondId || !settingId || !caratId || !shapeId) return;
    setPriceLoading(true);
    try {
      const res = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ringStyleId: styleId, metalId, diamondId, settingId, caratOptionId: caratId, shapeId }),
      });
      const data = await res.json();
      if (res.ok) setRingPrice(data.finalPrice);
    } catch (error) {
      console.error("Price calculation error:", error);
    } finally {
      setPriceLoading(false);
    }
  }, [styleId, metalId, diamondId, settingId, caratId, shapeId]);

  useEffect(() => { calculatePrice(); }, [calculatePrice]);

  /* ─── Auto-height for Shopify ─── */
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'RING_STUDIO_HEIGHT', height }, '*');
    };

    const resizeObserver = new ResizeObserver(() => sendHeight());
    resizeObserver.observe(document.body);
    
    // Initial and periodic backups
    sendHeight();
    const interval = setInterval(sendHeight, 1000);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, []);

  /* ─── Derived state ────────────────────────────────────────── */
  const selectedStyle = Array.isArray(ringStyles) ? ringStyles.find(s => s.id === styleId) : null;
  const selectedMetal = Array.isArray(metals) ? metals.find(m => m.id === metalId) : null;
  const selectedShape = Array.isArray(shapes) ? shapes.find(s => s.id === shapeId) : null;
  const selectedCarat = Array.isArray(carats) ? carats.find(c => c.id === caratId) : null;
  const selectedSetting = Array.isArray(settings) ? settings.find(s => s.id === settingId) : null;
  const selectedDiamond = Array.isArray(diamonds) ? diamonds.find(d => d.id === diamondId) : null;

  /* ─── Loading ──────────────────────────────────────────────── */
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-[#C4A265]/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-[#C4A265] rounded-full animate-spin" />
          </div>
          <p className="text-[#8B7355] text-sm tracking-[0.2em] uppercase font-light">Loading Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="w-full max-w-[1600px] mx-auto pt-4 sm:pt-6 pb-8 sm:pb-12 px-2 sm:px-6">

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline">Refresh</button>
          </div>
        )}

        {/* ─── Breadcrumb ─── */}
        <div className="text-[11px] text-[#9B8E7E] mb-3 sm:mb-4 tracking-wide">
          <span className="hover:text-[#6B5E4E] cursor-pointer transition-colors">Home</span>
          <span className="mx-2 text-[#D1C7B7]">/</span>
          <span className="text-[#6B5E4E]">Design Your Lab Grown Diamond Ring</span>
        </div>

        {/* ─── Step Progress ─── */}
        <div className="flex items-center mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#F0EBE3] overflow-x-auto gap-2">
          <StepItem step={1} label="Setting" active />
          <div className="flex-1 min-w-[20px] h-[1px] bg-gradient-to-r from-[#C4A265] to-[#E8DFD0]" />
          <StepItem step={2} label="Diamond" />
          <div className="flex-1 min-w-[20px] h-[1px] bg-[#E8DFD0]" />
          <StepItem step={3} label="Complete" />
        </div>

        {/* ─── Main Layout: stacked on mobile, side-by-side on desktop ─── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 items-start">

          {/* ─── Preview (top on mobile, left on desktop) ─── */}
          <div className="w-full lg:col-span-5">
            <div className="lg:sticky lg:top-8">
              <RingLivePreview
                style={selectedStyle?.slug || "channel-ascent"}
                shape={selectedShape?.slug || "round"}
                carat={selectedCarat?.value?.toFixed(2) || "1.00"}
                metal={selectedMetal ? normalizeMetalForPreview(selectedMetal.color) : "white-gold"}
                setting={selectedSetting?.slug || "H1"}
              />

              {/* Selection Summary — hidden on mobile, shown on desktop */}
              <div className="hidden lg:block mt-4 bg-white rounded-2xl p-5 border border-[#F0EBE3] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="text-[10px] tracking-[0.2em] text-[#B0A090] uppercase mb-3 font-medium">Your Selection</div>
                <div className="space-y-2.5 text-[12px]">
                  <SummaryRow label="Style" value={selectedStyle?.name || "—"} />
                  <SummaryRow label="Shape" value={selectedShape?.name || "—"} />
                  <SummaryRow label="Carat" value={selectedCarat ? `${selectedCarat.value} ct` : "—"} />
                  <SummaryRow label="Metal" value={selectedMetal ? `${selectedMetal.purity} ${selectedMetal.color} Gold` : "—"} />
                  <SummaryRow label="Setting" value={selectedSetting?.name || "—"} />
                  <SummaryRow label="Diamond" value={selectedDiamond ? `${selectedDiamond.clarity} / ${selectedDiamond.color}` : "—"} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Controls (below preview on mobile, right on desktop) ─── */}
          <div className="w-full lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-[#F0EBE3] overflow-hidden">

              {/* Header */}
              <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-3 sm:pb-4 border-b border-[#F5F0E8]">
                <h2 className="text-base sm:text-lg font-semibold text-[#2C2418] tracking-tight">Customize Your Ring</h2>
                <p className="text-[10px] sm:text-[11px] text-[#A89880] mt-1 tracking-wide">Select each option to build your perfect ring</p>
              </div>

              <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">

                {/* ── RING STYLE ── */}
                <Section title="RING STYLE" subtitle={selectedStyle?.name}>
                  <Carousel id="style-scroll">
                    {Array.isArray(ringStyles) && ringStyles.map(opt => (
                      <motion.button
                        key={opt.id}
                        onClick={() => setStyleId(opt.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative flex flex-col items-center w-[100px] sm:w-[120px] shrink-0 rounded-2xl border-2 bg-white py-2.5 sm:py-3 px-2 transition-all duration-300 snap-center ${styleId === opt.id
                          ? "border-[#C4A265] shadow-[0_4px_20px_rgba(196,162,101,0.2)]"
                          : "border-transparent hover:border-[#E8DFD0] shadow-sm hover:shadow-md"
                          }`}
                      >
                        <div className="w-full h-10 sm:h-14 flex items-center justify-center">
                          <img src={opt.imageUrl} alt={opt.name} className="max-h-10 sm:max-h-14 object-contain" />
                        </div>
                        <span className={`mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] leading-tight font-medium text-center line-clamp-2 ${styleId === opt.id ? "text-[#2C2418]" : "text-[#8B7355]"
                          }`}>{opt.name}</span>
                        {styleId === opt.id && (
                          <motion.div layoutId="style-dot" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-[3px] bg-[#C4A265] rounded-full" />
                        )}
                      </motion.button>
                    ))}
                  </Carousel>
                </Section>

                {/* ── SHAPE ── */}
                <Section title="DIAMOND SHAPE" subtitle={selectedShape?.name}>
                  <div className="grid grid-cols-4 sm:flex gap-2 sm:gap-3">
                    {Array.isArray(shapes) && shapes.map(shape => (
                      <motion.button
                        key={shape.id}
                        onClick={() => setShapeId(shape.id)}
                        whileTap={{ scale: 0.96 }}
                        className={`flex flex-col items-center gap-1.5 sm:gap-2 sm:w-20 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${shapeId === shape.id
                          ? "border-[#C4A265] bg-[#FDFBF7] shadow-[0_4px_16px_rgba(196,162,101,0.15)]"
                          : "border-transparent bg-[#FAFAF8] hover:border-[#E8DFD0]"
                          }`}
                      >
                        <img src={shape.imageUrl} alt={shape.name} className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
                        <span className={`text-[9px] sm:text-[10px] font-medium ${shapeId === shape.id ? "text-[#2C2418]" : "text-[#8B7355]"}`}>
                          {shape.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </Section>

                {/* ── CARAT ── */}
                <Section title="CARAT WEIGHT" subtitle={selectedCarat ? `${selectedCarat.value} ct` : undefined}>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {Array.isArray(carats) && carats.map(c => (
                      <motion.button
                        key={c.id}
                        onClick={() => setCaratId(c.id)}
                        whileTap={{ scale: 0.96 }}
                        className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-medium border-2 transition-all duration-300 ${caratId === c.id
                          ? "bg-[#2C2418] text-white border-[#2C2418] shadow-lg"
                          : "bg-white text-[#6B5E4E] border-[#E8DFD0] hover:border-[#C4A265]"
                          }`}
                      >{c.value} ct</motion.button>
                    ))}
                  </div>
                </Section>

                {/* ── SETTING (Head) ── */}
                <Section title="SETTING STYLE" subtitle={selectedSetting?.name}>
                  <Carousel id="setting-scroll">
                    {Array.isArray(settings) && settings.map(s => (
                      <motion.button
                        key={s.id}
                        onClick={() => setSettingId(s.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative flex flex-col items-center w-[100px] sm:w-[120px] shrink-0 rounded-2xl border-2 bg-white py-2.5 sm:py-3 px-2 transition-all duration-300 snap-center ${settingId === s.id
                          ? "border-[#C4A265] shadow-[0_4px_20px_rgba(196,162,101,0.2)]"
                          : "border-transparent hover:border-[#E8DFD0] shadow-sm hover:shadow-md"
                          }`}
                      >
                        <div className="w-full h-10 sm:h-14 flex items-center justify-center">
                          <img src={s.imageUrl} alt={s.name} className="max-h-10 sm:max-h-14 object-contain" />
                        </div>
                        <span className={`mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] leading-tight font-medium text-center line-clamp-2 ${settingId === s.id ? "text-[#2C2418]" : "text-[#8B7355]"
                          }`}>{s.name}</span>
                        {settingId === s.id && (
                          <motion.div layoutId="setting-dot" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-[3px] bg-[#C4A265] rounded-full" />
                        )}
                      </motion.button>
                    ))}
                  </Carousel>
                </Section>

                {/* ── METAL ── */}
                <Section title="RING METAL" subtitle={selectedMetal ? `${selectedMetal.purity} ${selectedMetal.color} Gold` : undefined}>
                  <div className="flex gap-4 sm:gap-5 flex-wrap">
                    {Array.isArray(metals) && metals.map(m => {
                      const colorMap: Record<string, string> = { White: "#E8E4DF", Yellow: "#F5D76E", Rose: "#E8B4A0" };
                      return (
                        <motion.button
                          key={m.id}
                          onClick={() => setMetalId(m.id)}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center gap-1 transition-all duration-300 ${metalId === m.id ? "opacity-100" : "opacity-50 hover:opacity-80"
                            }`}
                        >
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-300 ${metalId === m.id
                            ? "border-[#C4A265] shadow-[0_0_0_3px_rgba(196,162,101,0.2)]"
                            : "border-[#E0D8CD]"
                            }`} style={{ backgroundColor: colorMap[m.color] || "#E8E4DF" }} />
                          <span className={`text-[9px] sm:text-[10px] font-semibold ${metalId === m.id ? "text-[#2C2418]" : "text-[#8B7355]"}`}>
                            {m.purity}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-[#A89880]">{m.color}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </Section>

                {/* ── DIAMOND QUALITY ── */}
                <Section title="DIAMOND QUALITY" subtitle={selectedDiamond ? `${selectedDiamond.clarity} / ${selectedDiamond.color}` : undefined}>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {Array.isArray(diamonds) && diamonds.map(d => (
                      <motion.button
                        key={d.id}
                        onClick={() => setDiamondId(d.id)}
                        whileTap={{ scale: 0.96 }}
                        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-medium border-2 transition-all duration-300 ${diamondId === d.id
                          ? "bg-[#2C2418] text-white border-[#2C2418] shadow-lg"
                          : "bg-white text-[#6B5E4E] border-[#E8DFD0] hover:border-[#C4A265]"
                          }`}
                      >{d.clarity} / {d.color}</motion.button>
                    ))}
                  </div>
                </Section>
              </div>

              {/* ─── Price Footer ─── */}
              <div className="border-t border-[#F0EBE3] bg-gradient-to-r from-[#FDFBF7] to-[#FAF8F5] px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.15em] text-[#A89880] uppercase mb-0.5 sm:mb-1">Estimated Total</div>
                    {priceLoading ? (
                      <div className="w-5 h-5 border-2 border-[#E8DFD0] border-t-[#C4A265] rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-[#2C2418] tracking-tight">
                          ₹{ringPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#A89880]">incl. taxes</span>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const details = {
                        price: ringPrice,
                        image: selectedStyle?.imageUrl,
                        selection: {
                          styleId,
                          shapeId,
                          caratId,
                          metalId,
                          settingId,
                          diamondId
                        },
                        properties: {
                          "_builder_session": Date.now().toString(),
                          "Style": selectedStyle?.name,
                          "Shape": selectedShape?.name,
                          "Carat": selectedCarat ? `${selectedCarat.value} ct` : undefined,
                          "Metal": selectedMetal ? `${selectedMetal.purity} ${selectedMetal.color}` : undefined,
                          "Setting": selectedSetting?.name,
                          "Diamond": selectedDiamond ? `${selectedDiamond.clarity}/${selectedDiamond.color}` : undefined,
                          "Total Price": `₹${ringPrice.toLocaleString("en-IN")}`
                        }
                      };
                      window.parent.postMessage({ type: 'RING_STUDIO_CONTINUE', details }, '*');
                    }}
                    className="px-6 sm:px-10 py-3 sm:py-3.5 bg-[#2C2418] text-white text-xs sm:text-sm font-semibold rounded-full shadow-[0_8px_24px_rgba(44,36,24,0.3)] hover:bg-[#1A1508] transition-colors tracking-wide whitespace-nowrap"
                  >
                    CONTINUE
                  </motion.button>
                </div>

                {/* Mobile summary (shown only on mobile) */}
                <div className="lg:hidden mt-4 pt-4 border-t border-[#F0EBE3]">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                    <SummaryRow label="Style" value={selectedStyle?.name || "—"} />
                    <SummaryRow label="Shape" value={selectedShape?.name || "—"} />
                    <SummaryRow label="Carat" value={selectedCarat ? `${selectedCarat.value} ct` : "—"} />
                    <SummaryRow label="Metal" value={selectedMetal ? `${selectedMetal.purity} ${selectedMetal.color}` : "—"} />
                    <SummaryRow label="Setting" value={selectedSetting?.name || "—"} />
                    <SummaryRow label="Diamond" value={selectedDiamond ? `${selectedDiamond.clarity}/${selectedDiamond.color}` : "—"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  COMPONENTS                                                     */
/* ═══════════════════════════════════════════════════════════════ */

function StepItem({ step, label, active }: { step: number; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-semibold transition-all ${active
        ? "bg-[#C4A265] text-white shadow-[0_2px_8px_rgba(196,162,101,0.3)]"
        : "bg-[#F0EBE3] text-[#A89880]"
        }`}>{step}</div>
      <span className={`text-[10px] sm:text-xs tracking-wide whitespace-nowrap ${active ? "text-[#2C2418] font-medium" : "text-[#A89880]"}`}>
        {label}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#A89880]">{label}</span>
      <span className="text-[#2C2418] font-medium text-right">{value}</span>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-3">
        <div className="w-1 h-3.5 sm:h-4 bg-gradient-to-b from-[#C4A265] to-[#E8DFD0] rounded-full" />
        <div>
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-[#6B5E4E] uppercase">{title}</div>
          {subtitle && <div className="text-[9px] sm:text-[10px] text-[#C4A265] font-medium mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Carousel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="relative group/carousel">
      <button
        onClick={() => { document.getElementById(id)?.scrollBy({ left: -240, behavior: "smooth" }); }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur border border-[#E8DFD0] shadow-lg w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#6B5E4E] hover:bg-[#C4A265] hover:text-white hover:border-[#C4A265] transition-all opacity-0 group-hover/carousel:opacity-100 text-sm"
      >‹</button>
      <div id={id} className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth px-2 sm:px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </div>
      <button
        onClick={() => { document.getElementById(id)?.scrollBy({ left: 240, behavior: "smooth" }); }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur border border-[#E8DFD0] shadow-lg w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#6B5E4E] hover:bg-[#C4A265] hover:text-white hover:border-[#C4A265] transition-all opacity-0 group-hover/carousel:opacity-100 text-sm"
      >›</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  HELPERS                                                        */
/* ═══════════════════════════════════════════════════════════════ */

function normalizeMetalForPreview(color: string): string {
  const lower = color.toLowerCase();
  if (lower.includes("yellow")) return "yellow-gold";
  if (lower.includes("rose")) return "rose-gold";
  return "white-gold";
}
