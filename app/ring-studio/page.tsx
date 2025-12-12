"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RingLivePreview from "./../../components/RingLivePreview";


type Option = {
  id: string;
  label: string;
  subLabel?: string;
  image?: string;
  disabled?: boolean;
};

const STYLE_TABS = ["Most Popular"];

const STYLE_OPTIONS: Option[] = [
  {
    id: "channel-ascent",
    label: "Channel Ascent",
    image: "/studio/shank/channel-ascent.png",
  },
  {
    id: "graduated-prong-ascent-melee",
    label: "Graduated Prong Ascent - Melee",
    image: "/studio/shank/graduated-prong-ascent-melee.png",
  },
  {
    id: "graduated-prong-ascent-star",
    label: "Graduated Prong Ascent - Star",
    image: "/studio/shank/graduated-prong-ascent-star.png",
  },
  {
    id: "split-shank",
    label: "Split Shank",
    image: "/studio/shank/split-shank.png",
  },
  {
    id: "tapered-baguette",
    label: "Tapered Baguette",
    image: "/studio/shank/tapered-baguette.png",
  },
  {
    id: "traditional-solitaire",
    label: "Traditional Solitaire",
    image: "/studio/shank/traditional-solitaire.png",
  },
  {
    id: "traditional-band-solitaire",
    label: "Traditional Band Solitaire",
    image: "/studio/shank/traditional-band-solitaire.png",
  },
];

const SHAPES: Option[] = [
  { id: "round", label: "Round", image: "/studio/shapes/round.png" },
  { id: "oval", label: "Oval", image: "/studio/shapes/oval.png" },
  { id: "princess", label: "Princess", image: "/studio/shapes/princess.png" },
  { id: "emerald", label: "Emerald", image: "/studio/shapes/emerald.png" },
  // { id: "pear", label: "Pear", image: "/studio/shapes/pear.png" },
];

const CARATS: Option[] = [
  { id: "1.00", label: "1.00 ct" },
  { id: "2.00", label: "2.00 ct" },
  { id: "2.50", label: "2.50 ct" },
  { id: "3.00", label: "3.00 ct" },
  { id: "3.50", label: "3.50 ct" },
  { id: "4.00", label: "4.00 ct" },
];

const SETTINGS: Option[] = [
  {
    id: "classic-4prong",
    label: "Classic 4 Prong",
    image: "/studio/setting/classic-4prong.png",
  },
  {
    id: "classic-4prong-classic",
    label: "Classic 4 Prong – Classic",
    image: "/studio/setting/classic-4prong-classic.png",
  },
  {
    id: "classic-4prong-royal-club",
    label: "Classic 4 Prong – Royal Club",
    image: "/studio/setting/classic-4prong-royal-club.png",
  },
  {
    id: "classic-4prong-cathedral",
    label: "Classic 4 Prong – Cathedral",
    image: "/studio/setting/classic-4prong-cathedral.png",
  },
  {
    id: "classic-6prong-hidden-halo",
    label: "Classic 6 Prong – Hidden Halo",
    image: "/studio/setting/classic-6prong-hidden-halo.png",
  },
  {
    id: "classic-4prong-variant",
    label: "Classic 4 Prong – Variant",
    image: "/studio/setting/classic-4prong-2.png",
  },
];

const METALS: Option[] = [
  {
    id: "14k-yg",
    label: "14K",
    subLabel: "Yellow",
    image: "/studio/metals/14K_Yellow_Gold.svg",
  },
  {
    id: "14k-rg",
    label: "14K",
    subLabel: "Rose",
    image: "/studio/metals/14K_Rose_Gold.svg",
  },
  {
    id: "14k-wg",
    label: "14K",
    subLabel: "White",
    image: "/studio/metals/14K_White_Gold.svg",
  },
  {
    id: "18k-yg",
    label: "18K",
    subLabel: "Yellow",
    image: "/studio/metals/18K_Yellow_Gold.svg",
  },
  {
    id: "18k-rg",
    label: "18K",
    subLabel: "Rose",
    image: "/studio/metals/18K_Rose_Gold.svg",
  },
  {
    id: "18k-wg",
    label: "18K",
    subLabel: "White",
    image: "/studio/metals/18K_White_Gold.svg",
  },
];

const MATCHING_BANDS = ["0", "1", "2"];

export default function RingStudioPage() {
  const [activeTab, setActiveTab] = useState("Most Popular");
  const [styleId, setStyleId] = useState("channel-ascent");
  const [shapeId, setShapeId] = useState("oval");
  const [caratId, setCaratId] = useState("4.00");
  const [settingId, setSettingId] = useState("classic-6prong-hidden-halo");
  const [metalId, setMetalId] = useState("14k-yg");
  const [bandCount, setBandCount] = useState("1");

  const ringPrice = 1255;
  const bandPrice = bandCount === "0" ? 0 : 890;
  const total = ringPrice + bandPrice;

  const selectedStyle = STYLE_OPTIONS.find((s) => s.id === styleId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f1ea] to-[#faf7f3]">
      <div className="max-w-[1440px] mx-auto pt-8 pb-12 px-6">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-3">
          Home &nbsp;|&nbsp;{" "}
          <span className="underline underline-offset-2">
            Design Your Lab Grown Diamond Ring
          </span>
        </div>

        {/* Step header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex-1 flex items-center justify-between text-sm">
            <StepItem step={1} label="Choose a Setting" active />
            <StepDivider />
            <StepItem step={2} label="Choose a Diamond" />
            <StepDivider />
            <StepItem step={3} label="Completed Ring (Select Size)" />
          </div>
        </motion.div>

        {/* Main layout */}
        <motion.div
          className="grid grid-cols-12 gap-6 items-start"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* LEFT: Sticky Preview */}
          <div className="col-span-5 pr-2">
            <div className="sticky top-24">
              {/* <RingLivePreview
                style={styleId}
                shape={shapeId}
                carat={caratId}
                metal={normalizeMetal(metalId)}
                setting={normalizeSetting(settingId)}
              /> */}

              <RingLivePreview
                style={styleId}
                shape={shapeId}
                carat={caratId}
                metal={normalizeMetal(metalId)}
                setting={normalizeSetting(settingId)}
              />


            </div>
          </div>

          {/* RIGHT: Controls */}
          <div className="col-span-7">
            <motion.div
              className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.16)] border border-white/70 p-5"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              {/* Tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 text-sm">
                  {STYLE_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200 ${
                        activeTab === tab
                          ? "border-gray-900 text-gray-900 bg-gray-900/5 shadow-sm"
                          : "border-transparent text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ArrowButton />
                  <ArrowButton direction="right" />
                </div>
              </div>

              {/* STYLE */}
              <Section title="RING STYLE & DESIGN">
                <Carousel id="style-scroll">
                  {STYLE_OPTIONS.map((opt) => (
                    <StyleCard
                      key={opt.id}
                      option={opt}
                      selected={styleId === opt.id}
                      onSelect={() => setStyleId(opt.id)}
                    />
                  ))}
                </Carousel>
              </Section>

              {/* SHAPE */}
              <Section title="SHAPE">
                <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {SHAPES.map((shape) => (
                    <ShapeCard
                      key={shape.id}
                      option={shape}
                      selected={shapeId === shape.id}
                      onSelect={() => setShapeId(shape.id)}
                    />
                  ))}
                </div>
              </Section>

              {/* CARAT */}
              <Section title="CARAT">
                <div className="flex gap-3 flex-wrap">
                  {CARATS.map((c) => (
                    <PillButton
                      key={c.id}
                      label={c.label}
                      selected={caratId === c.id}
                      onClick={() => setCaratId(c.id)}
                    />
                  ))}
                </div>
              </Section>

              {/* SETTING */}
              <Section title="SETTING">
                <Carousel id="setting-scroll">
                  {SETTINGS.map((s) => (
                    <SettingPill
                      key={s.id}
                      option={s}
                      selected={settingId === s.id}
                      onSelect={() => !s.disabled && setSettingId(s.id)}
                    />
                  ))}
                </Carousel>
              </Section>

              {/* METALS */}
              <Section title="RING METAL">
                <div className="flex gap-4 flex-wrap">
                  {METALS.map((m) => (
                    <MetalSwatch
                      key={m.id}
                      option={m}
                      selected={metalId === m.id}
                      onSelect={() => setMetalId(m.id)}
                    />
                  ))}
                </div>
              </Section>

              {/* PRICE + BAND */}
              <div className="mt-7 border-t pt-6 grid grid-cols-12 items-center gap-6">
                {/* Matching band */}
                <div className="col-span-6">
                  <div className="text-xs font-semibold tracking-[0.12em] text-gray-500 mb-3">
                    MATCHING BAND
                  </div>
                  <div className="inline-flex border border-gray-300 rounded-full overflow-hidden text-sm bg-gray-50">
                    {MATCHING_BANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBandCount(b)}
                        className={`px-4 py-1.5 border-r last:border-r-0 transition-colors ${
                          bandCount === b
                            ? "bg-gray-900 text-white"
                            : "bg-transparent text-gray-700 hover:bg-white"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price block */}
                <div className="col-span-6 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Engagement Ring :</span>
                      <span className="font-semibold">
                        ${ringPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Band :</span>
                      <span className="font-semibold">
                        {bandPrice === 0
                          ? "$0.00"
                          : `$${bandPrice.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 mt-2 border-t pt-2">
                      <span className="font-semibold">TOTAL :</span>
                      <span className="font-semibold">
                        ${total.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-1">
                      Diamond price will be added on the next step.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97, y: 0 }}
                    className="ml-6 px-9 py-2.5 bg-black text-white text-sm rounded-full shadow-sm hover:bg-gray-900"
                  >
                    NEXT
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StepItem({ step, label, active }: any) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-colors ${
            active
              ? "bg-black text-white border-black"
              : "border-gray-300 text-gray-500 bg-white"
          }`}
        >
          {step}
        </div>
        <span
          className={`text-xs tracking-wide ${
            active ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function StepDivider() {
  return <div className="flex-1 h-px bg-gray-300 mx-2" />;
}

function ArrowButton({ direction = "left" }: any) {
  const arrow = direction === "left" ? "−" : "＋";
  return (
    <button className="w-7 h-7 rounded-full border border-gray-300 text-[10px] flex items-center justify-center hover:bg-gray-100 bg-white">
      {arrow}
    </button>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#b99f7e]" />
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-700">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- CAROUSEL WRAPPER ---------- */

function Carousel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* fade left */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10 rounded-l-xl" />

      {/* left arrow */}
      <button
        onClick={() => scrollLeft(id)}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-xs"
      >
        ←
      </button>

      {/* scroll area */}
      <div
        id={id}
        className="flex gap-4 overflow-x-auto scroll-smooth px-10 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >
        {children}
      </div>

      {/* right arrow */}
      <button
        onClick={() => scrollRight(id)}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/90 border border-gray-200 shadow-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-xs"
      >
        →
      </button>

      {/* fade right */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10 rounded-r-xl" />
    </div>
  );
}

/* ---------- CARDS ---------- */

function StyleCard({ option, selected, onSelect }: any) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98, y: 0 }}
      className={`group relative flex flex-col items-center text-center
        w-32 h-32 shrink-0 rounded-xl border bg-white
        py-3 px-2 transition-colors duration-200
        ${
          selected
            ? "border-gray-900 shadow-md"
            : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
        }`}
      style={{ scrollSnapAlign: "center" }}
    >
      <div className="w-full h-12 flex items-center justify-center overflow-hidden">
        <img
          src={option.image}
          alt={option.label}
          className="max-h-14 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span
        className={`mt-2 text-[10.5px] leading-snug font-semibold ${
          selected ? "text-gray-900" : "text-gray-600"
        }`}
      >
        {option.label}
      </span>
    </motion.button>
  );
}

function ShapeCard({ option, selected, onSelect }: any) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`w-24 border rounded-xl p-3 text-center text-xs flex-shrink-0 transition-all ${
        selected
          ? "border-gray-900 bg-white shadow-md"
          : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
      }`}
    >
      <div className="w-full flex items-center justify-center mb-2">
        {option.image ? (
          <img
            src={option.image}
            alt={option.label}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-gray-300" />
        )}
      </div>
      <div className="text-gray-800">{option.label}</div>
    </motion.button>
  );
}

function PillButton({ label, selected, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2 rounded-full text-xs border transition-all ${
        selected
          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
      }`}
    >
      {label}
    </motion.button>
  );
}

function SettingPill({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = option.disabled;
  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled}
      whileHover={!disabled ? { y: -3, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98, y: 0 } : {}}
      className={`group relative flex flex-col items-center text-center
        w-32 h-32 shrink-0 rounded-xl border bg-white
        py-3 px-2 transition-colors duration-200
        ${
          disabled
            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
            : selected
            ? "border-gray-900 shadow-md"
            : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
        }`}
      style={{ scrollSnapAlign: "center" }}
    >
      {option.image && (
        <div className="w-full h-12 flex items-center justify-center overflow-hidden">
          <img
            src={option.image}
            alt={option.label}
            className="max-h-14 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div
        className={`mt-2 text-[10.5px] leading-snug font-semibold ${
          selected ? "text-gray-900" : "text-gray-600"
        }`}
      >
        {option.label}
      </div>
    </motion.button>
  );
}

function MetalSwatch({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`flex flex-col items-center gap-1 text-[10px] ${
        selected ? "text-gray-900" : "text-gray-500"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full border flex items-center justify-center bg-white ${
          selected ? "border-gray-900 shadow-sm" : "border-gray-300"
        }`}
      >
        <img
          src={option.image}
          alt={option.label}
          className="w-5 h-5 object-contain"
        />
      </div>
      <span className="font-semibold">{option.label}</span>
      <span>{option.subLabel}</span>
    </motion.button>
  );
}

/* ---------- PREVIEW PANEL ---------- */

function PreviewPanel({ selectedStyle }: any) {
  return (
    <motion.div
      className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 flex flex-col"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* top */}
      <div className="flex justify-between mb-3 text-xs">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full shadow-sm">
          <span>📷</span>
          <span>TRY IT ON</span>
        </button>
        <button className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-800">
          ⟳ <span>Reset</span>
        </button>
      </div>

      {/* preview box */}
      <motion.div
        className="w-full aspect-[4/5] rounded-2xl bg-[radial-gradient(circle_at_20%_0,#ffffff,#f1e9dd)] flex items-center justify-center overflow-hidden relative"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* soft glow behind ring */}
        <div className="absolute w-40 h-40 rounded-full bg-white/60 blur-3" />
        <img
          src="/studio/preview-main.png"
          alt="Ring Preview"
          className="relative max-h-[80%] max-w-[80%] object-contain drop-shadow-xl"
        />
      </motion.div>

      {/* bottom label */}
      <div className="text-center mt-4 text-xs">
        <div className="font-semibold text-gray-900">
          3.71 ct. {selectedStyle?.label ?? "Channel Ascent"}
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          Live preview updated with your selection.
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- SCROLL HELPERS ---------- */

function scrollLeft(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: -300, behavior: "smooth" });
}

function scrollRight(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: 300, behavior: "smooth" });
}

function normalizeMetal(id: string) {
  if (id.includes("yg")) return "yellow-gold";
  if (id.includes("rg")) return "rose-gold";
  if (id.includes("wg")) return "white-gold";
  return "white-gold";
}

function normalizeSetting(id: string) {
  // Map your UI setting IDs to H1-H6
  const map: any = {
    "classic-4prong": "H1",
    "classic-4prong-classic": "H2",
    "classic-4prong-variant": "H3",
    "classic-4prong-cathedral": "H4",
    "classic-4prong-royal-club": "H5",
    "classic-6prong-hidden-halo": "H6",
  };
  return map[id] || "H1";
}

function normalizeCarat(shapeId: string, caratId: string) {
  // Shapes other than round ONLY have 1.00 ct images
  if (shapeId !== "round") return "1.00";
  return caratId;
}
