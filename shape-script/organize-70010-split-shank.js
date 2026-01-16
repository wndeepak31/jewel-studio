/**
 * ORGANIZE Split Shank (70010)
 * Deepak — this fully supports your file naming system.
 */

const fs = require("fs");
const path = require("path");

const SOURCE = "public/assets/281125/images/70010";
const DEST = "public/studio/rings/split-shank/round/2.00";

// metal mapping
const metalMap = {
  P: "rose-gold",
  W: "white-gold",
  Y: "yellow-gold",
};

// view mapping
const viewMap = {
  P: "view1.jpg", // Front pose
  T: "view2.jpg", // Angle pose
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log("📂 Organizing 70010 – Split Shank\n");

const files = fs.readdirSync(SOURCE);

files.forEach((file) => {
  // Only match files belonging to this style
  if (!file.match(/R_70010_RND_1/i)) {
    console.log("Skipping:", file);
    return;
  }

  // last part: "1-P-P-H1.png"
  const last = file.split("_")[3];
  if (!last) {
    console.log("❌ Invalid filename:", file);
    return;
  }

  const parts = last.split("-"); // ["1","P","P","H1.png"]

  const metalCode = parts[1]; // P/W/Y
  const viewCode = parts[2];  // P/T
  const setting = parts[3].replace(".png", "").replace(".jpg", ""); // H1

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

console.log("\n🎉 DONE — Split Shank (70010) organized successfully!");
