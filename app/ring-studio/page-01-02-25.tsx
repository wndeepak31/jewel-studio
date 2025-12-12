"use client";

import { useState } from "react";

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
  { id: "cushion", label: "Cushion", image: "/studio/shapes/cushion.png" },
  { id: "emerald", label: "Emerald", image: "/studio/shapes/emerald.png" },
  { id: "pear", label: "Pear", image: "/studio/shapes/pear.png" },
];

const CARATS: Option[] = [
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
  { id: "14k-yg", label: "14K", subLabel: "Yellow", image: "/studio/metal-14k-yg.png" },
  { id: "14k-rg", label: "14K", subLabel: "Rose", image: "/studio/metal-14k-rg.png" },
  { id: "18k-wg", label: "18K", subLabel: "White", image: "/studio/metal-18k-wg.png" },
  { id: "18k-yg", label: "18K", subLabel: "Yellow", image: "/studio/metal-18k-yg.png" },
  { id: "18k-rg", label: "18K", subLabel: "Rose", image: "/studio/metal-18k-rg.png" },
];

const MATCHING_BANDS = ["0", "1", "2"];

export default function RingStudioPage() {
  const [activeTab, setActiveTab] = useState("Most Popular");
  const [styleId, setStyleId] = useState("floating-marquise");
  const [shapeId, setShapeId] = useState("round");
  const [caratId, setCaratId] = useState("3.00");
  const [settingId, setSettingId] = useState("classic-prong");
  const [metalId, setMetalId] = useState("14k-yg");
  const [bandCount, setBandCount] = useState("1");

  const ringPrice = 1255;
  const bandPrice = bandCount === "0" ? 0 : 890;
  const total = ringPrice + bandPrice;

  const selectedStyle = STYLE_OPTIONS.find((s) => s.id === styleId);

  return (
    <div className="min-h-screen bg-[#f6f4f1]">
      <div className="max-w-6xl mx-auto pt-10 pb-16">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-3">
          Home &nbsp;|&nbsp; Design Your Lab Grown Diamond Ring
        </div>

        {/* Step header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 flex items-center justify-between text-sm">
            <StepItem step={1} label="Choose a Setting" active />
            <StepDivider />
            <StepItem step={2} label="Choose a Diamond" />
            <StepDivider />
            <StepItem step={3} label="Completed Ring (Select Size)" />
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: Large preview */}
          <div className="col-span-5">
            <PreviewPanel selectedStyle={selectedStyle} />
          </div>

          {/* RIGHT: Control panel */}
          <div className="col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              {/* Tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 text-sm">
                  {STYLE_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-md border text-xs font-medium ${
                        activeTab === tab
                          ? "border-gray-900 text-gray-900 bg-white shadow-sm"
                          : "border-transparent text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <ArrowButton />
                  <ArrowButton direction="right" />
                </div>
              </div>

              {/* RING STYLE & DESIGN */}
              <Section title="RING STYLE & DESIGN">
                <div className="flex gap-4 overflow-x-auto pb-1">
                  {STYLE_OPTIONS.map((opt) => (
                    <StyleCard
                      key={opt.id}
                      option={opt}
                      selected={styleId === opt.id}
                      onSelect={() => setStyleId(opt.id)}
                    />
                  ))}
                </div>
              </Section>

              {/* SHAPE */}
              <Section title="SHAPE">
                <div className="flex gap-3 overflow-x-auto pb-1">
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
                <div className="flex gap-3">
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
                <div className="flex gap-3">
                  {SETTINGS.map((s) => (
                    <SettingPill
                      key={s.id}
                      option={s}
                      selected={settingId === s.id}
                      onSelect={() => !s.disabled && setSettingId(s.id)}
                    />
                  ))}
                </div>
              </Section>

              {/* RING METAL */}
              <Section title="RING METAL">
                <div className="flex gap-4">
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

              {/* MATCHING BAND + PRICE */}
              <div className="mt-6 border-t pt-6 grid grid-cols-12 items-center gap-6">
                {/* Matching band left */}
                <div className="col-span-6">
                  <div className="text-xs font-semibold tracking-[0.12em] text-gray-500 mb-3">
                    MATCHING BAND
                  </div>
                  <div className="inline-flex border rounded-md overflow-hidden text-sm">
                    {MATCHING_BANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBandCount(b)}
                        className={`px-4 py-1 border-r last:border-r-0 ${
                          bandCount === b
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price + next on right */}
                <div className="col-span-6 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="flex justify-between gap-4">
                      <span>Engagement Ring :</span>
                      <span className="font-semibold">
                        ${ringPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Band :</span>
                      <span className="font-semibold">
                        {bandPrice === 0
                          ? "$0.00"
                          : `$${bandPrice.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 mt-1 border-t pt-1">
                      <span className="font-semibold">TOTAL :</span>
                      <span className="font-semibold">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Diamond Price will be added on the next step.
                    </p>
                  </div>

                  <button className="ml-6 px-8 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-900">
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StepItem({
  step,
  label,
  active,
}: {
  step: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
            active ? "bg-black text-white border-black" : "border-gray-300 text-gray-500"
          }`}
        >
          {step}
        </div>
        <span className={`text-xs ${active ? "text-gray-900" : "text-gray-500"}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

function StepDivider() {
  return <div className="flex-1 h-px bg-gray-300 mx-2" />;
}

function ArrowButton({ direction = "left" }: { direction?: "left" | "right" }) {
  const arrow = direction === "left" ? "←" : "→";
  return (
    <button className="w-7 h-7 rounded-full border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-100">
      {arrow}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        <div className="text-xs font-semibold tracking-[0.15em] text-gray-700">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function StyleCard({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-40 border rounded-lg p-3 text-center text-xs flex-shrink-0 transition-all ${
        selected
          ? "border-gray-900 shadow-sm bg-white"
          : "border-gray-200 bg-white hover:border-gray-400"
      }`}
    >
      <div className="w-full h-20 flex items-center justify-center mb-2">
        {option.image ? (
          <img
            src={option.image}
            alt={option.label}
            className="max-h-16 object-contain"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-full" />
        )}
      </div>
      <div className="font-medium text-gray-800">{option.label}</div>
    </button>
  );
}

function ShapeCard({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-24 border rounded-lg p-3 text-center text-xs flex-shrink-0 ${
        selected ? "border-gray-900 bg-white shadow-sm" : "border-gray-200 bg-white"
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
    </button>
  );
}

function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-xs border ${
        selected
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
      }`}
    >
      {label}
    </button>
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
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-xs border min-w-[120px] ${
        disabled
          ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
          : selected
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
      }`}
    >
      {option.label}
    </button>
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
    <button
      onClick={onSelect}
      className={`flex flex-col items-center gap-1 text-[10px] ${
        selected ? "text-gray-900" : "text-gray-500"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border ${
          selected ? "border-gray-900" : "border-gray-300"
        }`}
        style={{ background: "linear-gradient(135deg,#f7e0b2,#f3c27c)" }} // placeholder metal color
      />
      <span className="font-semibold">{option.label}</span>
      <span>{option.subLabel}</span>
    </button>
  );
}

function PreviewPanel({ selectedStyle }: { selectedStyle?: Option }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full">
      {/* top buttons */}
      <div className="flex justify-between mb-3 text-xs">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md">
          <span>📷</span>
          <span>TRY IT ON</span>
        </button>
        <button className="flex items-center gap-1 text-gray-500 text-xs">
          ⟳ <span>Reset</span>
        </button>
      </div>

      {/* image */}
      <div className="flex-1 flex items-center justify-center bg-[#f6f6f6] rounded-lg mb-3">
        <img
          src="/studio/preview-main.png"
          alt="Ring Preview"
          className="max-h-[260px] object-contain"
        />
      </div>

      {/* promo + text */}
      <div className="flex justify-between items-center text-xs mt-1">
        <div className="text-center w-full">
          <div className="font-semibold">
            3.71 ct. {selectedStyle?.label ?? "Floating Marquise"}
          </div>
        </div>
      </div>
    </div>
  );
}
