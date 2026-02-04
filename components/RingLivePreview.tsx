"use client";

import { useEffect, useState } from "react";
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

  // Currently visible image
  const [currentSrc, setCurrentSrc] = useState<string>("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const finalCarat = carat;

  /* Build image path */
  const buildPath = (v: number, c: string = finalCarat) =>
    `/studio/rings/${style}/${shape}/${c}/${metal}/${setting}/view${v}.jpg`;

  /* Load image smoothly */
  useEffect(() => {
    let mounted = true;

    const selectedPath = buildPath(view);

    setLoading(true);

    const img = new Image();
    img.src = selectedPath;

    img.onload = () => {
      if (!mounted) return;

      setCurrentSrc(selectedPath);
      setLoading(false);
    };

    img.onerror = () => {
      // Fallback to 1.00 ct
      const fallbackPath = buildPath(view, "1.00");

      const fallbackImg = new Image();
      fallbackImg.src = fallbackPath;

      fallbackImg.onload = () => {
        if (!mounted) return;

        setCurrentSrc(fallbackPath);
        setLoading(false);
      };
    };

    return () => {
      mounted = false;
    };
  }, [style, shape, carat, metal, setting, view]);

  /* Preload both views (performance boost) */
  useEffect(() => {
    [1, 2].forEach((v) => {
      const img = new Image();
      img.src = buildPath(v);
    });
  }, [style, shape, carat, metal, setting]);

  return (
    <motion.div
      className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 flex flex-col"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* ================= PREVIEW ================= */}

      <div className="relative w-full aspect-[4/5] rounded-2xl flex items-center justify-center overflow-hidden bg-white">

        {/* Image Layer */}
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
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm animate-pulse" />
        )}
      </div>

      {/* ================= CONTROLS ================= */}

      <div className="flex justify-center gap-3 mt-4">

        {/* Front View */}
        <button
          onClick={() => setView(1)}
          className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
            view === 1
              ? "bg-black text-white border-black shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >
          Front View
        </button>

        {/* Angle View */}
        <button
          onClick={() => setView(2)}
          className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
            view === 2
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
