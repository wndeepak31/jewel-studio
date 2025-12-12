/**
 * ORGANIZE Traditional Solitaire (10003)
 */

const fs = require("fs");
const path = require("path");

const SOURCE = "public/assets/281125/images/10003";
const DEST = "public/studio/rings/traditional-solitaire/round/2.00";

// metal mapping
const metalMap = {
  P: "rose-gold",
  W: "white-gold",
  Y: "yellow-gold",
};

// view mapping
const viewMap = {
  P: "view1.jpg", // Front
  T: "view2.jpg", // Angle
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log("📂 Organizing 10003 – Traditional Solitaire\n");

const files = fs.readdirSync(SOURCE);

files.forEach((file) => {
  if (!file.match(/R_10003_RND_1/i)) {
    console.log("Skipping:", file);
    return;
  }

  const last = file.split("_")[3]; // example: "1-P-P-H2.png"
  if (!last) {
    console.log("❌ Invalid:", file);
    return;
  }

  const parts = last.split("-"); // ["1","P","P","H2.png"]

  const metalCode = parts[1]; // P / W / Y
  const viewCode = parts[2];  // P / T
  const setting = parts[3].replace(".png", "").replace(".jpg", ""); // H1–H6

  const metal = metalMap[metalCode];
  const view = viewMap[viewCode];

  if (!metal || !view || !setting) {
    console.log("❌ Pattern mismatch:", file);
    return;
  }

  const dstFolder = path.join(DEST, metal, setting);
  ensureDir(dstFolder);

  const srcPath = path.join(SOURCE, file);
  const dstPath = path.join(dstFolder, view);

  fs.renameSync(srcPath, dstPath);

  console.log(`✔ Moved: ${file} → ${dstPath}`);
});

console.log("\n🎉 DONE — Traditional Solitaire (10003) organized successfully!");
