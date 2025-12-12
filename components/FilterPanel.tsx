"use client";

import { useState } from "react";

export default function FilterPanel() {
  const [style, setStyle] = useState("Floating Marquise");
  const [shape, setShape] = useState("Round");
  const [carat, setCarat] = useState("2.00");
  const [setting, setSetting] = useState("Classic Prong");
  const [metal, setMetal] = useState("14K");
  const [band, setBand] = useState(false);

  return (
    <div className="w-full bg-white shadow-sm p-4 border rounded-lg">
      {/* TITLE */}
      <div className="font-semibold text-xl mb-4">Ring Style & Design</div>

      {/* FILTER GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* STYLE */}
        <div>
          <div className="text-sm font-medium mb-2">Style</div>
          <select
            className="w-full border p-2 rounded"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option>Floating Marquise</option>
            <option>Tapered Baguette</option>
            <option>Demi Eternity</option>
          </select>
        </div>

        {/* SHAPE */}
        <div>
          <div className="text-sm font-medium mb-2">Shape</div>
          <select
            className="w-full border p-2 rounded"
            value={shape}
            onChange={(e) => setShape(e.target.value)}
          >
            <option>Round</option>
            <option>Oval</option>
            <option>Emerald</option>
            <option>Pear</option>
          </select>
        </div>

        {/* CARAT */}
        <div>
          <div className="text-sm font-medium mb-2">Carat</div>
          <select
            className="w-full border p-2 rounded"
            value={carat}
            onChange={(e) => setCarat(e.target.value)}
          >
            <option>2.00</option>
            <option>2.50</option>
            <option>3.00</option>
            <option>3.50</option>
            <option>4.00</option>
          </select>
        </div>

        {/* SETTING */}
        <div>
          <div className="text-sm font-medium mb-2">Setting</div>
          <select
            className="w-full border p-2 rounded"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          >
            <option>Classic Prong</option>
            <option>Hidden Halo</option>
            <option>Single Halo</option>
            <option>Classic 6 Prong</option>
          </select>
        </div>

        {/* METAL */}
        <div>
          <div className="text-sm font-medium mb-2">Ring Metal</div>
          <select
            className="w-full border p-2 rounded"
            value={metal}
            onChange={(e) => setMetal(e.target.value)}
          >
            <option>14K</option>
            <option>18K</option>
            <option>Platinum</option>
          </select>
        </div>

        {/* MATCHING BAND */}
        <div className="flex items-center gap-3 mt-5">
          <input
            type="checkbox"
            checked={band}
            onChange={() => setBand(!band)}
          />
          <label>Matching Band</label>
        </div>
      </div>

      {/* NEXT BUTTON */}
      <div className="mt-6 flex justify-end">
        <button className="bg-black text-white px-6 py-2 rounded-lg">
          NEXT →
        </button>
      </div>
    </div>
  );
}
