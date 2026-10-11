// Rasterises public/icons/icon.svg into the PNG sizes iOS and Android want.
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const svg = await readFile(new URL("../public/icons/icon.svg", import.meta.url));
const out = (n) => fileURLToPath(new URL(`../public/icons/${n}`, import.meta.url));

for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  await sharp(svg).resize(size, size).png().toFile(out(name));
}
// Maskable: shrink the artwork into the safe zone on a flat cream field.
const inner = await sharp(svg).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#f6efe3" } })
  .composite([{ input: inner, gravity: "center" }]).png().toFile(out("icon-maskable-512.png"));
console.log("icons written");
