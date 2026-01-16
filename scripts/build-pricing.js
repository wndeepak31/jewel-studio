const fs = require("fs");
const path = require("path");

const PRICING_DIR = path.join(__dirname, "../pricing");
const OUTPUT_FILE = path.join(PRICING_DIR, "pricing.json");

function readCSV(file) {
  const content = fs.readFileSync(path.join(PRICING_DIR, file), "utf8");
  const [header, ...rows] = content.trim().split("\n");
  const keys = header.split(",");

  return rows.map(row => {
    const values = row.split(",");
    const obj = {};
    keys.forEach((k, i) => {
      obj[k] = values[i];
    });
    return obj;
  });
}

function toNumber(val) {
  return Number(val);
}

// Load CSVs
const shanks = readCSV("shanks.csv");
const heads = readCSV("heads.csv");
const diamonds = readCSV("diamonds.csv");
const carats = readCSV("carat_multipliers.csv");
const metals = readCSV("metal_purity.csv");

// Build JSON structure
const pricing = {
  shanks: {},
  heads: {},
  diamonds: {},
  carats: {},
  metals: {}
};

// Shanks
shanks.forEach(s => {
  pricing.shanks[s.shank_id] = {
    name: s.display_name,
    basePrice: toNumber(s.base_price),
    baseWeight: toNumber(s.base_weight_g)
  };
});

// Heads
heads.forEach(h => {
  pricing.heads[h.head_id] = {
    name: h.display_name,
    basePrice: toNumber(h.base_price),
    baseWeight: toNumber(h.base_weight_g)
  };
});

// Diamonds
diamonds.forEach(d => {
  if (!pricing.diamonds[d.shape]) {
    pricing.diamonds[d.shape] = {};
  }
  pricing.diamonds[d.shape][d.carat] = toNumber(d.price);
});

// Carat multipliers
carats.forEach(c => {
  pricing.carats[c.carat] = {
    headMultiplier: toNumber(c.head_multiplier),
    shankMultiplier: toNumber(c.shank_multiplier)
  };
});

// Metals
metals.forEach(m => {
  pricing.metals[m.metal_id] = {
    name: m.display_name,
    purity: toNumber(m.purity_factor)
  };
});

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pricing, null, 2));

console.log("✅ pricing.json generated successfully");
