// Interaction smoke test: does the studio actually respond?
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

const step = async (label, fn) => {
  try {
    await fn();
    console.log("ok   ", label);
  } catch (e) {
    console.log("FAIL ", label, "—", e.message.split("\n")[0]);
  }
  await page.waitForTimeout(250);
};

await page.goto(base + "/studio", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

const beat = () => page.locator("text=/^beat/").first().innerText();

await step("play then pause", async () => {
  await page.getByRole("button", { name: /^Play$/ }).click();
  await page.waitForTimeout(900);
  const t = await beat();
  await page.getByRole("button", { name: /^Pause$/ }).click();
  if (!/beat [1-9]/.test(t) && !/beat 0\.[3-9]/.test(t)) throw new Error("playhead did not advance: " + t);
});

await step("select a keyframe on the timeline", async () => {
  const diamonds = page.locator("svg g.kf");
  const n = await diamonds.count();
  if (n < 5) throw new Error("expected keyframe diamonds, found " + n);
  await diamonds.nth(2).click();
});

await step("stance slider moves a bone", async () => {
  await page.getByRole("button", { name: "R forearm", exact: true }).click();
  const slider = page.locator('[data-slot="slider"]').first();
  const box = await slider.boundingBox();
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
});

await step("stance palette stamps a pose", async () => {
  await page.getByRole("button", { name: "Arabesque", exact: true }).click();
});

await step("chance operation rewrites the phrase", async () => {
  const before = await page.locator("svg g.kf").count();
  await page.getByRole("button", { name: /^Phrase$/ }).click();
  await page.waitForTimeout(400);
  const after = await page.locator("svg g.kf").count();
  if (after === 0) throw new Error("no keyframes after chance phrase");
  console.log("       keyframes", before, "→", after);
});

await step("add a keyframe with the K key", async () => {
  await page.keyboard.press("ArrowRight");
  const before = await page.locator("svg g.kf").count();
  await page.keyboard.press("k");
  await page.waitForTimeout(300);
  const after = await page.locator("svg g.kf").count();
  if (after < before) throw new Error("keyframe count dropped");
});

await step("camera preset redraws", async () => {
  await page.getByRole("button", { name: "Plan", exact: true }).click();
  await page.waitForTimeout(300);
  const readout = await page.locator("text=/pitch/").first().innerText();
  if (!/pitch 78/.test(readout)) throw new Error("camera not applied: " + readout);
});

await step("labanotation tab edits a limb", async () => {
  await page.getByRole("tab", { name: /Labanotation/ }).click();
  await page.waitForTimeout(400);
  await page.locator("rect[style*='cursor: pointer']").first().click();
  await page.getByRole("button", { name: "→", exact: true }).click();
});

await step("benesh tab drags a sign", async () => {
  await page.getByRole("tab", { name: /Benesh/ }).click();
  await page.waitForTimeout(400);
  const sign = page.locator('g[style*="cursor: grab"]').first();
  const b = await sign.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 40, b.y - 30, { steps: 8 });
  await page.mouse.up();
});

await step("eshkol-wachman tab steps a cell", async () => {
  await page.getByRole("tab", { name: /Eshkol/ }).click();
  await page.waitForTimeout(500);
  const cell = page.locator("g[style*='cursor: pointer']").first();
  await cell.scrollIntoViewIfNeeded();
  await cell.click({ position: { x: 6, y: 6 } });
  const readBefore = await page.locator("g[style*='cursor: pointer'] text").first().textContent();
  await page.locator('button:below(:text("Vertical"))').first().click();
  await page.waitForTimeout(300);
  const readAfter = await page.locator("g[style*='cursor: pointer'] text").first().textContent();
  if (readBefore === readAfter) throw new Error("cell value did not change: " + readBefore);
  console.log("       cell", readBefore, "→", readAfter);
});

await step("score survives a reload", async () => {
  await page.getByRole("tab", { name: /Timeline/ }).click();
  await page.waitForTimeout(300);
  const before = await page.locator("svg g.kf").count();
  const stored = await page.evaluate(() => localStorage.getItem("danceforms-score-v2")?.length ?? 0);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const after = await page.locator("svg g.kf").count();
  if (!stored) throw new Error("nothing written to local storage");
  if (after !== before) throw new Error(`keyframes ${before} → ${after} after reload`);
});

await step("parameters page still interactive", async () => {
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Cast chance/ }).click();
  await page.getByRole("tab", { name: /Eshkol/ }).click();
  await page.getByRole("button", { name: "Numbers" }).click();
  await page.waitForTimeout(400);
});

console.log("\nconsole errors:", errors.length ? JSON.stringify(errors.slice(0, 6), null, 2) : "none");
await browser.close();
