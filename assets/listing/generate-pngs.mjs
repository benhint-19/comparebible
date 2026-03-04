import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const tasks = [
  // App icons
  { input: "icon.svg", output: "icon-1024.png", width: 1024, height: 1024 },
  { input: "icon.svg", output: "icon-512.png", width: 512, height: 512 },
  { input: "icon.svg", output: "icon-192.png", width: 192, height: 192 },
  { input: "icon.svg", output: "icon-180.png", width: 180, height: 180 },
  { input: "icon.svg", output: "icon-152.png", width: 152, height: 152 },
  { input: "icon.svg", output: "icon-120.png", width: 120, height: 120 },
  // Adaptive icon foreground (Android)
  { input: "icon-foreground.svg", output: "icon-foreground-432.png", width: 432, height: 432 },
  // Splash screen
  { input: "splash.svg", output: "splash-2732.png", width: 2732, height: 2732 },
  { input: "splash.svg", output: "splash-1284.png", width: 1284, height: 1284 },
  // Feature graphic (Google Play)
  { input: "feature-graphic.svg", output: "feature-graphic.png", width: 1024, height: 500 },
  // Logo wordmark
  { input: "logo-wordmark.svg", output: "logo-wordmark.png", width: 600, height: 200 },
];

for (const task of tasks) {
  const svg = readFileSync(join(__dirname, task.input));
  await sharp(svg, { density: 300 })
    .resize(task.width, task.height)
    .png()
    .toFile(join(__dirname, task.output));
  console.log(`  ${task.output}`);
}

console.log("Done!");
