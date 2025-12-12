"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RingLivePreview({
  style,
  carat,
  metal,
  setting,
}: any) {
  const [view, setView] = useState(1);
  const [imgSrc, setImgSrc] = useState("");

  // IMPORTANT: shape is NOT part of actual folder structure
  const buildPath = (v: number) =>
    `/studio/rings/${style}/round/${carat}/${metal}/${setting}/view${v}.jpg`;

  useEffect(() => {
    const newPath = buildPath(view);
    console.log("Loading:", newPath);
    setImgSrc(newPath);
  }, [style, carat, metal, setting, view]);

  return (
    <motion.div
      className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 flex flex-col"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* top bar */}
      <div className="flex justify-between mb-3 text-xs">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full shadow-sm">
          📷 TRY IT ON
        </button>

        <button
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800"
          onClick={() => setView(1)}
        >
          ⟳ Reset
        </button>
      </div>

      {/* IMAGE PREVIEW */}
      <motion.div
        className="w-full aspect-[4/5] rounded-2xl bg-[radial-gradient(circle_at_20%_0,#ffffff,#f1e9dd)] flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.01 }}
      >
        <img
          key={imgSrc}
          src={imgSrc}
          className="max-h-[80%] object-contain drop-shadow-xl transition-opacity duration-300"
          onError={(e) => {
            console.log("IMG NOT FOUND:", imgSrc);
          }}
        />
      </motion.div>

      {/* VIEW BUTTONS */}
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => setView(1)}
          className={`px-4 py-1.5 rounded-full text-xs border ${
            view === 1
              ? "bg-black text-white border-black"
              : "text-gray-700 bg-white border-gray-300"
          }`}
        >
          Front View
        </button>

        <button
          onClick={() => setView(2)}
          className={`px-4 py-1.5 rounded-full text-xs border ${
            view === 2
              ? "bg-black text-white border-black"
              : "text-gray-700 bg-white border-gray-300"
          }`}
        >
          Angle View
        </button>
      </div>
    </motion.div>
  );
}
