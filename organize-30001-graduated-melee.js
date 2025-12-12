/**
 * ORGANIZE Graduated Prong Ascent - Melee (30001)
 */

const fs = require("fs");
const path = require("path");

const SOURCE = "public/assets/281125/images/30001";
const DEST = "public/studio/rings/graduated-prong-ascent-melee/round/2.00";

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

console.log("📂 Organizing 30001 – Graduated Prong Ascent – Melee\n");

const files = fs.readdirSync(SOURCE);

files.forEach((file) => {
  if (!file.match(/R_30001_RND_1/i)) {
    console.log("Skipping:", file);
    return;
  }

  // last section looks like: "1-P-P-H1.png"
  const last = file.split("_")[3];

  if (!last) {
    console.log("❌ Skipping invalid:", file);
    return;
  }

  const partsDash = last.split("-"); // ["1", "P", "P", "H1.png"]

  const metalCode = partsDash[1]; // P / W / Y
  const viewCode = partsDash[2];  // P / T
  const setting = partsDash[3].replace(".png", ""); // H1

  const metal = metalMap[metalCode];
  const view = viewMap[viewCode];

  if (!metal || !view || !setting) {
    console.log("❌ Invalid pattern:", file);
    return;
  }

  const destFolder = path.join(DEST, metal, setting);
  ensureDir(destFolder);

  const srcPath = path.join(SOURCE, file);
  const destPath = path.join(destFolder, view);

  fs.renameSync(srcPath, destPath);

  console.log(`✔ Moved: ${file} → ${destPath}`);
});

console.log("\n🎉 DONE — 30001 organized successfully!");
