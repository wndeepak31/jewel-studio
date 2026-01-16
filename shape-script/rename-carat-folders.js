const fs = require("fs");
const path = require("path");

// Base folder where your ring images are stored
const BASE = path.join(__dirname, "public/studio/rings");

console.log("🔍 Scanning:", BASE);

function renameCaratFolders(stylePath) {
  const shapes = fs.readdirSync(stylePath);

  shapes.forEach(shape => {
    const shapePath = path.join(stylePath, shape);
    if (!fs.statSync(shapePath).isDirectory()) return;

    const caratFolders = fs.readdirSync(shapePath);

    caratFolders.forEach(carat => {
      if (carat === "4.00") {
        const oldPath = path.join(shapePath, "4.00");
        const newPath = path.join(shapePath, "1.00");

        console.log(`🔁 Renaming ${oldPath} → ${newPath}`);

        try {
          fs.renameSync(oldPath, newPath);
          console.log("✅ Done");
        } catch (err) {
          console.error("❌ Error renaming:", err);
        }
      }
    });
  });
}

// MAIN
const styles = fs.readdirSync(BASE);

styles.forEach(style => {
  const stylePath = path.join(BASE, style);
  if (fs.statSync(stylePath).isDirectory()) {
    console.log(`📂 Processing style: ${style}`);
    renameCaratFolders(stylePath);
  }
});

console.log("🎉 Completed renaming all 4.00 → 1.00 folders!");
