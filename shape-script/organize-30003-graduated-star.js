/**
 * ORGANIZE Graduated Prong Ascent - STAR (30003)
 * Deepak — this matches your filenames exactly!
 */

const fs = require("fs");
const path = require("path");

const SOURCE = "public/assets/281125/images/30003";
const DEST = "public/studio/rings/graduated-prong-ascent-star/round/2.00";

// metal mapping
const metalMap = {
  P: "rose-gold",
  W: "white-gold",
  Y: "yellow-gold",
};

// view mapping
const viewMap = {
  P: "view1.jpg", // First pose
  T: "view2.jpg", // Second pose
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log("📂 Organizing 30003 – Graduated Prong Ascent – Star\n");

const files = fs.readdirSync(SOURCE);

files.forEach((file) => {
  // Only match correct base pattern
  if (!file.match(/R_30003_RND_1/i)) {
    console.log("Skipping:", file);
    return;
  }

  // last chunk example: "1-P-P-H1.jpg"
  const last = file.split("_")[3];
  if (!last) {
    console.log("❌ Invalid filename:", file);
    return;
  }

  const partsDash = last.split("-"); // ["1", "P", "P", "H1.jpg"]

  const metalCode = partsDash[1]; // P / W / Y
  const viewCode = partsDash[2];  // P / T
  const setting = partsDash[3].replace(".jpg", "").replace(".png", ""); // H1

  const metal = metalMap[metalCode];
  const view = viewMap[viewCode];

  if (!metal || !view || !setting) {
    console.log("❌ Pattern mismatch:", file);
    return;
  }

  const destFolder = path.join(DEST, metal, setting);
  ensureDir(destFolder);

  const srcPath = path.join(SOURCE, file);
  const destPath = path.join(destFolder, view);

  fs.renameSync(srcPath, destPath);

  console.log(`✔ Moved: ${file} → ${destPath}`);
});

console.log("\n🎉 DONE — 30003 STAR variant sorted successfully!");
