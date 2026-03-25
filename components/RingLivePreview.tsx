"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  style: string;
  shape: string;
  carat: string;
  metal: string;
  setting: string;
};

export default function RingLivePreview({
  style,
  shape,
  carat,
  metal,
  setting,
}: Props) {
  const [view, setView] = useState(1);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<string, { view1: string; view2: string }>>(new Map());

  /* Build filesystem fallback path */
  const buildFallbackPath = (v: number, c: string = carat) =>
    `/studio/rings/${style}/${shape}/${c}/${metal}/${setting}/view${v}.jpg`;

  /* Load image: try API first, then filesystem */
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const comboKey = `${style}|${shape}|${carat}|${metal}|${setting}`;

    async function loadImage() {
      // Check cache first
      const cached = cache.current.get(comboKey);
      if (cached) {
        const src = view === 1 ? cached.view1 : cached.view2;
        if (src) {
          if (mounted) { setCurrentSrc(src); setLoading(false); }
          return;
        }
      }

      // Try API (Cloudinary images)
      try {
        const res = await fetch(
          `/api/ring-preview?style=${encodeURIComponent(style)}&shape=${encodeURIComponent(shape)}&carat=${encodeURIComponent(carat)}&metal=${encodeURIComponent(metal)}&setting=${encodeURIComponent(setting)}`
        );

        if (res.ok) {
          const data = await res.json();
          cache.current.set(comboKey, { view1: data.view1Url, view2: data.view2Url || data.view1Url });
          const src = view === 1 ? data.view1Url : (data.view2Url || data.view1Url);
          if (mounted) { setCurrentSrc(src); setLoading(false); }
          return;
        }
      } catch (e) {
        // API failed
      }

      // No uploaded image found — show blank preview
      if (mounted) { setCurrentSrc(""); setLoading(false); }
    }

    loadImage();

    return () => { mounted = false; };
  }, [style, shape, carat, metal, setting, view]);

  return (
    <motion.div
      className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 flex flex-col"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* ================= PREVIEW ================= */}
      <div className="relative w-full aspect-[4/5] rounded-2xl flex items-center justify-center overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          {currentSrc && (
            <motion.img
              key={currentSrc}
              src={currentSrc}
              alt="Ring Preview"
              className="absolute max-h-[80%] object-contain drop-shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              draggable={false}
            />
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => setView(1)}
          className={`px-4 py-1.5 rounded-full text-xs border transition-all ${view === 1
            ? "bg-black text-white border-black shadow-sm"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
            }`}
        >
          Front View
        </button>
        <button
          onClick={() => setView(2)}
          className={`px-4 py-1.5 rounded-full text-xs border transition-all ${view === 2
            ? "bg-black text-white border-black shadow-sm"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
            }`}
        >
          Angle View
        </button>
      </div>
    </motion.div>
  );
}
