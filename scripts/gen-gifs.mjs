// Generates the animated profile GIFs (terminal intro and tool orbit, dark and light).
// Each scene in gif-scenes.html exposes render(t) and DURATION, so frames are rendered at exact
// times and the loop is seamless. Needs Playwright (Chromium) and ffmpeg on PATH.
// Usage: node scripts/gen-gifs.mjs assets
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const out = process.argv[2] ?? "assets";
const page = pathToFileURL(join(import.meta.dirname, "gif-scenes.html")).href;
// [scene, output name, capture fps, gif fps, palette colours]
const JOBS = [["intro", "intro", 15, 15, 96], ["orbit", "stack", 15, 12, 64]];

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 840, height: 300 } });
for (const [scene, name, fps, gifFps, colors] of JOBS) {
  for (const theme of ["dark", "light"]) {
    const dir = mkdtempSync(join(tmpdir(), "gif-"));
    await tab.goto(`${page}?scene=${scene}&theme=${theme}`);
    const frames = Math.round((await tab.evaluate(() => window.DURATION)) * fps);
    for (let i = 0; i < frames; i++) {
      await tab.evaluate((t) => window.render(t), i / fps);
      await tab.screenshot({ path: join(dir, `f${String(i).padStart(4, "0")}.png`) });
    }
    const filter = `fps=${gifFps},split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(fps), "-i", join(dir, "f%04d.png"), "-filter_complex", filter, "-loop", "0", join(out, `${name}-${theme}.gif`)]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`${name}-${theme}.gif: ${frames} frames`);
  }
}
await browser.close();
