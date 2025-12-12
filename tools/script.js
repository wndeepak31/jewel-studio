/**
 * tools/processAllStylesWithViews.js
 *
 * - Processes assets in: public/assets/<Shape 1 ct>/<ModelFolder>/
 * - Only for shapes: Oval, Emerald, Princess
 * - Produces folders:
 *     public/studio/rings/<STYLE>/<shape>/1.00/<metal>/<Hn>/{view1.jpg, view2.jpg}
 * - P => perspective => view1.jpg
 * - T => top         => view2.jpg
 * - Runs for ALL STYLES EXCEPT channel-ascent
 *
 * Heuristics:
 * - Shape codes: OVL, EMR, PRS (skip round)
 * - Angle: H1..H6 detected with regex /H[1-6]/
 * - View detection: token 'P' (perspective) or 'T' (top) in filename tokens
 * - Metal detection: prefer explicit letters R/W/Y (rose/white/yellow). If none found,
 *   fallback to legacy mapping where 'P' may have been used for rose (kept for backwards compat).
 *
 * Run:
 *   node tools/processAllStylesWithViews.js
 */

const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "../public/assets");
const OUTPUT = path.join(__dirname, "../public/studio/rings");

// Styles to generate (exclude channel-ascent)
const STYLES = [
  "graduated-prong-ascent-melee",
  "graduated-prong-ascent-star",
  "split-shank",
  "tapered-baguette",
  "traditional-solitaire",
  "traditional-band-solitaire",
];

// shape map from filename token to our folder name
const shapeMap = { OVL: "oval", EMR: "emerald", PRS: "princess" };

// Preferred metal letter detection. If metadata doesn't have these, fallbackMap is used.
const metalLetters = {
  R: "rose-gold",
  W: "white-gold",
  Y: "yellow-gold",
  // allow lowercase just in case
  r: "rose-gold",
  w: "white-gold",
  y: "yellow-gold",
};

// fallback legacy mapping (keeps compatibility if filenames used P/W/Y earlier)
const fallbackMetalMap = {
  P: "rose-gold", // legacy mapping used previously in your files
  W: "white-gold",
  Y: "yellow-gold",
  p: "rose-gold",
};

// carat used for these assets
const CARAT = "1.00";

// create directory if not exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// parse filename tokens into useful metadata
function parseFilename(filename) {
  // remove extension
  const name = filename.replace(/\.[^.]+$/, "");
  // split by - and _
  const tokens = name.split(/[-_]/);

  // find shape token like OVL/EMR/PRS (somewhere in tokens)
  const shapeToken = tokens.find((t) => /^[A-Z]{3}$/.test(t) && ["OVL", "EMR", "PRS", "RND"].includes(t));
  const shape = shapeToken ? shapeMap[shapeToken] : null;

  // find angle token H1..H6
  const angleToken = tokens.find((t) => /^H[1-6]$/i.test(t));
  const angle = angleToken ? angleToken.toUpperCase() : null;

  // detect view token => 'P' or 'T' appears in tokens (look for standalone 'P' or 'T')
  // also allow tokens like 'P1' or 'T1' (take just the char)
  let view = null;
  for (const t of tokens.slice(1)) {
    if (/^P$/i.test(t)) { view = "P"; break; }
    if (/^T$/i.test(t)) { view = "T"; break; }
    // if token like 'P-P' or single letters, we'll split later; try first char
    if (/^[PT]{1,2}$/i.test(t)) {
      if (t.toUpperCase().includes("P")) { view = "P"; break; }
      if (t.toUpperCase().includes("T")) { view = "T"; break; }
    }
  }

  // detect metal: check tokens for R/W/Y first
  let metal = null;
  for (const t of tokens) {
    if (metalLetters[t]) { metal = metalLetters[t]; break; }
    if (metalLetters[t.toUpperCase()]) { metal = metalLetters[t.toUpperCase()]; break; }
  }
  // fallback: if none, check legacy fallback map (P/W/Y)
  if (!metal) {
    for (const t of tokens) {
      if (fallbackMetalMap[t]) { metal = fallbackMetalMap[t]; break; }
      if (fallbackMetalMap[t.toUpperCase()]) { metal = fallbackMetalMap[t.toUpperCase()]; break; }
    }
  }

  return { shape, angle, view, metal, tokens, rawName: name };
}

// Copy/assign file to its destination (view1 or view2)
function placeFileForAllStyles(parsed, srcPath, filename) {
  const { shape, angle, view, metal } = parsed;
  if (!shape || !angle || !view) {
    console.log("SKIP (missing meta):", filename, JSON.stringify({ shape, angle, view, metal }));
    return;
  }

  // decide view file name
  const destViewName = view === "P" ? "view1.jpg" : view === "T" ? "view2.jpg" : null;
  if (!destViewName) {
    console.log("Unknown view token, skipping:", filename);
    return;
  }

  // use detected metal or fallback to rose if nothing found (safer default)
  const finalMetal = metal || "rose-gold";

  STYLES.forEach((style) => {
    const destDir = path.join(OUTPUT, style, shape, CARAT, finalMetal, angle);
    ensureDir(destDir);

    // Avoid overwriting view1/view2 if they already exist with different source unless you want to
    const destFile = path.join(destDir, destViewName);

    try {
      fs.copyFileSync(srcPath, destFile);
      console.log(`Placed ${destViewName}: ${style}/${shape}/${CARAT}/${finalMetal}/${angle} <= ${filename}`);
    } catch (err) {
      console.error("Error copying", srcPath, "->", destFile, err.message);
    }
  });
}

// main
function start() {
  const shapeFolders = fs.readdirSync(ASSETS);
  shapeFolders.forEach((shapeFolder) => {
    const lower = shapeFolder.toLowerCase();
    if (!lower.includes("oval") && !lower.includes("emerald") && !lower.includes("princess")) {
      // skip round and other non-target folders
      return;
    }

    const shapePath = path.join(ASSETS, shapeFolder);
    if (!fs.lstatSync(shapePath).isDirectory()) return;

    const modelFolders = fs.readdirSync(shapePath);
    modelFolders.forEach((modelFolder) => {
      const modelPath = path.join(shapePath, modelFolder);
      if (!fs.lstatSync(modelPath).isDirectory()) return;

      const files = fs.readdirSync(modelPath);
      files.forEach((file) => {
        if (!/\.(jpg|jpeg|png)$/i.test(file)) return;

        const parsed = parseFilename(file);
        const src = path.join(modelPath, file);
        // If filename looks like it contains both P and T as different tokens (rare), we will still handle each file separately.
        placeFileForAllStyles(parsed, src, file);
      });
    });
  });

  console.log("DONE processing all shapes (except round) for all styles (except channel-ascent).");
}

start();
