/** -----------------------------------------
   FINAL SHAPE ORGANIZER (WORKS WITH YOUR FILES)
   Deepak – this script is tuned EXACTLY for
   your file names + folder structure.
------------------------------------------ */

const fs = require("fs");
const path = require("path");

// INPUT ROOT (your folders like R_10003_EMD_1)
const INPUT = path.join(__dirname, "INPUT_SHAPES");

// OUTPUT ROOT
const OUTPUT = path.join(__dirname, "public/studio/rings");

// SHAPE CODE MAP
const SHAPES = {
  EMD: "emerald",
  OVL: "oval",
  PRN: "princess",
};

// METAL CODE MAP
const METALS = {
  Y: "yellow-gold",
  W: "white-gold",
  P: "rose-gold",
};

// VIEW TYPE (P = front → view1, T = angle → view2)
const VIEW = {
  P: "view1.jpg",
  T: "view2.jpg",
};

// --------------------------------------------
// PROCESS ONE FOLDER
// --------------------------------------------
function processShapeFolder(folderName) {
  console.log(`\n📂 PROCESSING → ${folderName}`);

  const folderPath = path.join(INPUT, folderName);
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    if (!file.toLowerCase().endsWith(".jpg")) return;

    /**
     * Example filename:
     * R_70010_PRN_1-Y-T-H1.jpg
     *
     * Split →
     * ["R", "70010", "PRN", "1-Y-T-H1.jpg"]
     */
    const parts = file.split("_");

    const styleNum = parts[1];         // 70010
    const shapeCode = parts[2];        // PRN
    const rest = parts[3];             // 1-Y-T-H1.jpg

    const shape = SHAPES[shapeCode];
    if (!shape) {
      console.log(`❌ Unsupported shape code → ${shapeCode}`);
      return;
    }

    const segments = rest.split("-");
    const carat = segments[0];         // "1"
    const metalCode = segments[1];     // "Y"
    const viewCode = segments[2];      // "T"
    const setting = segments[3].replace(".jpg", ""); // "H1"

    const metal = METALS[metalCode];
    if (!metal) {
      console.log(`❌ Unknown metal → ${metalCode}`);
      return;
    }

    const viewFile = VIEW[viewCode];
    if (!viewFile) {
      console.log(`❌ Unknown view → ${viewCode}`);
      return;
    }

    // ---------------------------
    // FINAL OUTPUT PATH
    // ---------------------------
    const targetDir = path.join(
      OUTPUT,
      styleNum,
      shape,
      `${carat}.00`,
      metal,
      setting
    );

    fs.mkdirSync(targetDir, { recursive: true });

    const destPath = path.join(targetDir, viewFile);
    const srcPath = path.join(folderPath, file);

    fs.copyFileSync(srcPath, destPath);

    console.log(`✔ Copied: ${file} → ${destPath}`);
  });
}

// --------------------------------------------
// MAIN
// --------------------------------------------
console.log("\n🚀 STARTING SHAPE ORGANIZE");

fs.readdirSync(INPUT).forEach((folder) => {
  const full = path.join(INPUT, folder);
  if (fs.lstatSync(full).isDirectory()) {
    processShapeFolder(folder);
  }
});

console.log("\n🎉 DONE — All shapes processed with BOTH VIEWS!");
