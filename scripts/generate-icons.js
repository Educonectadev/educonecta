const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const svg = fs.readFileSync(path.join(__dirname, "..", "public", "icons", "icon.svg"))

async function run() {
  const sizes = [
    { size: 192, out: "icon-192.png" },
    { size: 512, out: "icon-512.png" },
    { size: 180, out: "apple-touch-icon.png" },
    { size: 32, out: "favicon-32x32.png" },
    { size: 16, out: "favicon-16x16.png" },
  ]
  for (const { size, out } of sizes) {
    const outPath = path.join(__dirname, "..", "public", "icons", out)
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log("wrote", out, size)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })