/**
 * CHANNEL ASCENT — EMERALD (ONLY MODEL R_20001_EMD_1)
 * H1 ↔ H2 swap
 */

const fs = require("fs");
const path = require("path");

// ✅ ONLY THIS SOURCE FOLDER
const SOURCE = "public/assets/Emerald 1ct/R_20001_EMD_1";

// ✅ ONLY THIS DESTINATION
const DEST = "public/studio/rings/channel-ascent/emerald/1.00";

// ✅ Only these metals are allowed
const metalMap = {
  P: "rose-gold",
  W: "white-gold",
  Y: "yellow-gold",
};

// ✅ View codes
const viewMap = {
  P: "view1.jpg",
  T: "view2.jpg",
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log("📂 ORGANIZING — EMERALD CHANNEL ASCENT (ONLY R_20001_EMD_1)\n");

fs.readdirSync(SOURCE).forEach((entry) => {
  const full = path.join(SOURCE, entry);

  // Only image files
  if (!entry.match(/\.(jpg|jpeg|png)$/i)) return;

  // File example:
  // R_20001_EMD_1-P-T-H1.jpg
  const parts = entry.split("-");
  if (parts.length < 4) return;

  const metalCode = parts[1]; // P/W/Y
  const viewCode = parts[2]; // P/T
  let setting = parts[3].replace(/\.(jpg|jpeg|png)$/i, ""); // H1–H6

  // 🔁 SWAP H1 ↔ H2
  if (setting === "H1") setting = "H2";
  else if (setting === "H2") setting = "H1";

  const metal = metalMap[metalCode];
  const view = viewMap[viewCode];

  if (!metal || !view) return;

  const dstFolder = path.join(DEST, metal, setting);
  const dstPath = path.join(dstFolder, view);

  ensureDir(dstFolder);

  if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);

  fs.copyFileSync(full, dstPath);

  console.log(`✔ ${entry}  →  ${dstPath}`);
});

console.log("\n🎉 DONE — ONLY R_20001_EMD_1 MOVED. NOTHING ELSE USED.\n");
