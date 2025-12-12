// organize-all-styles.js
// Node 14+ recommended. Run: node organize-all-styles.js
// Make a backup of your source images before running.

const fs = require("fs");
const path = require("path");

// ========== CONFIG ==========

// Input folder where raw images are currently stored (adjust as needed)
const INPUT_ROOT = path.resolve(__dirname, "INPUT_IMAGES"); // change to your folder
// Example you showed earlier: D:\Next-Js\ring-studio-setup\public\assets\281125\images\200
// set INPUT_ROOT to that path if you like

// Output base: where organized /studio/rings/ structure will be created
const OUTPUT_BASE = path.resolve(__dirname, "public", "studio", "rings");

// MODEL -> STYLE mapping (final mapping you confirmed)
const MODEL_TO_STYLE = {
  "20001": "channel-ascent",
  "30001": "graduated-prong-ascent-melee",
  "30003": "graduated-prong-ascent-star",
  "70010": "split-shank",
  "50001": "tapered-baguette",
  "10003": "traditional-solitaire",
  "10023": "traditional-band-solitaire",
};

// shape code map found in raw filenames -> folder names
const SHAPE_MAP = {
  RND: "round",
  OVL: "oval",
  PRN: "princess",
  EMD: "emerald",
  // add more if needed
};

// metal token map (observed convention)
const METAL_MAP = {
  P: "rose-gold", // P used for rose in your examples
  W: "white-gold",
  Y: "yellow-gold",
};

// view token -> filename
const VIEW_MAP = {
  P: "view1.jpg", // "P" (probably 'picture' or 'primary') => front view
  T: "view2.jpg", // "T" => tilt / angle view
};

// swap H1 <-> H2 rule
function swapH(h) {
  if (!h) return h;
  if (h.toUpperCase() === "H1") return "H2";
  if (h.toUpperCase() === "H2") return "H1";
  return h.toUpperCase();
}

// carat index -> carat string
function caratFromToken(token) {
  if (!token) return "1.00";
  // Accept tokens like '1', '2', '25', '3', '35', '4'
  if (token === "1") return "1.00";
  if (token === "2") return "2.00";
  if (token === "25" || token === "2_5" || token === "2.5") return "2.50";
  if (token === "3") return "3.00";
  if (token === "35" || token === "3_5" || token === "3.5") return "3.50";
  if (token === "4") return "4.00";
  // fallback: try to coerce numeric
  const n = Number(token);
  if (!isNaN(n)) return n.toFixed(2);
  return "1.00";
}

// Ensure output directory exists
function ensureDirSync(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Recursively scan folder and return files list
function walkSync(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...walkSync(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

// Parse filename and return an object or null if invalid
function parseFilename(filename) {
  // We'll parse basename (without dirs)
  const base = path.basename(filename);
  // Examples:
  // R_20001_RND_1-P-P-H1.png
  // R_10003_EMD_1-P-T-H2.jpg
  // Expect pattern: R_{model}_{shape}_{carat}-{metalToken}-{viewToken}-{Hcode}.{ext}
  // We'll be tolerant if there are extra dashes.

  // split on '-' first
  const parts = base.split("-");
  if (parts.length < 3) return null;

  const first = parts[0]; // R_20001_RND_1
  const rest = parts.slice(1); // [ 'P', 'P', 'H1.png' ]

  const firstMatch = first.match(/^R_(\d+)_([A-Z]+)_([0-9._]+)$/i);
  if (!firstMatch) return null;
  const modelId = firstMatch[1];
  const shapeCode = firstMatch[2].toUpperCase();
  const caratTokenRaw = firstMatch[3];

  // metal token: usually first of rest
  const metalToken = (rest[0] || "").replace(/\..*$/, "").toUpperCase();

  // view token: second of rest
  const viewToken = (rest[1] || "").replace(/\..*$/, "").toUpperCase();

  // H code: the part that includes H1/H2/H3... might have extension
  // We will look for the first token in rest that contains /^H\d/i (case-insensitive)
  const hPart = rest.find((r) => /H\d+/i.test(r));
  if (!hPart) return null;
  const hMatch = hPart.match(/(H\d+)/i);
  const rawH = hMatch ? hMatch[1].toUpperCase() : null;

  // extension (take from basename)
  const ext = path.extname(base).toLowerCase();

  return {
    base,
    ext,
    modelId,
    shapeCode,
    caratTokenRaw,
    metalToken,
    viewToken,
    rawH,
  };
}

// =================================================
// MAIN
// =================================================

console.log("�📂 Starting SHAPE ORGANIZE (ALL STYLES) — scanning:", INPUT_ROOT);

const allFiles = walkSync(INPUT_ROOT);
console.log("Found", allFiles.length, "files (including non-images).");

let processed = 0;
let moved = 0;
let skipped = 0;
let errors = 0;
const invalids = [];

for (const file of allFiles) {
  const parsed = parseFilename(file);
  if (!parsed) {
    invalids.push(file);
    skipped++;
    continue;
  }

  processed++;

  const {
    base,
    ext,
    modelId,
    shapeCode,
    caratTokenRaw,
    metalToken,
    viewToken,
    rawH,
  } = parsed;

  // model -> style
  const style = MODEL_TO_STYLE[modelId];
  if (!style) {
    console.warn(`❌ Unknown modelId ${modelId} for file ${base} — skipping`);
    skipped++;
    continue;
  }

  // shape mapping
  const shape = SHAPE_MAP[shapeCode];
  if (!shape) {
    console.warn(`❌ Unknown shape code ${shapeCode} for file ${base} — skipping`);
    skipped++;
    continue;
  }

  // carat determination
  let carat = caratFromToken(String(caratTokenRaw));
  // If shape is NOT round, force 1.00 (as per your requirement)
  if (shape !== "round") carat = "1.00";

  // metal mapping (use first metalToken)
  const metal = METAL_MAP[metalToken] || METAL_MAP["P"] || "rose-gold";

  // view mapping
  const viewFileName = VIEW_MAP[viewToken] || "view1.jpg"; // default to view1

  // H swap
  const H = rawH ? swapH(rawH) : "H1";

  // Build destination path
  const destDir = path.join(OUTPUT_BASE, style, shape, carat, metal, H);
  ensureDirSync(destDir);

  const destPath = path.join(destDir, viewFileName);

  // If destination exists, skip to avoid overwrite (log reason)
  if (fs.existsSync(destPath)) {
    console.log(`⏩ SKIP (exists): ${destPath}`);
    skipped++;
    continue;
  }

  try {
    // Move file (rename). If cross-device / rename fails, fallback to copy+unlink
    try {
      fs.renameSync(file, destPath);
    } catch (renameErr) {
      // fallback to copy and remove
      fs.copyFileSync(file, destPath);
      fs.unlinkSync(file);
    }

    console.log(`✔ Moved: ${base} → ${path.relative(process.cwd(), destPath)}`);
    moved++;
  } catch (e) {
    console.error("❌ ERROR moving file:", base, e.message);
    errors++;
  }
}

// Summary
console.log("\n�🎉 DONE");
console.log("Processed files:", processed);
console.log("Moved files   :", moved);
console.log("Skipped files :", skipped);
console.log("Errors        :", errors);
if (invalids.length) {
  console.log("\n⚠️  Files that couldn't be parsed (invalid name pattern):");
  invalids.slice(0, 20).forEach((f) => console.log(" -", path.relative(process.cwd(), f)));
  if (invalids.length > 20) console.log(" ... and", invalids.length - 20, "more");
}

console.log("\nOutput root:", OUTPUT_BASE);
console.log("If something looks wrong, check the console logs above and verify your INPUT_ROOT path.");
