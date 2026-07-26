import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { firefox, webkit } from "playwright";

const port = 3214;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDirectory = "qa/screenshots/step-3/cross-browser-spline";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
});
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Production server did not become ready.");
}

async function inspectEngine(name, browserType) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const errors = [];
  const sceneRequests = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.url().includes("scene.splinecode")) sceneRequests.push(request.url()); });

  const evidence = { engine: name, errors, sceneRequests: 0, status: "unavailable" };
  try {
    await page.goto(`${baseUrl}/?qa-experience=full`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.locator('[data-experience-profile="full"]').waitFor({ timeout: 15_000 });
    await page.locator('[data-scene-status="ready"]').waitFor({ timeout: 30_000 });
    const canvas = page.locator("[data-spline-scene] canvas");
    await canvas.waitFor({ state: "visible", timeout: 8_000 });
    evidence.canvasCount = await canvas.count();
    evidence.profile = await page.locator("[data-experience-profile]").getAttribute("data-experience-profile");
    evidence.sceneStatus = await page.locator("[data-scene-status]").getAttribute("data-scene-status");
    evidence.renderer = await canvas.evaluate((element) => {
      const gl = element.getContext("webgl2") ?? element.getContext("webgl");
      const info = gl?.getExtension("WEBGL_debug_renderer_info");
      return gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "unavailable";
    });
    await mkdir(outputDirectory, { recursive: true });
    await page.screenshot({ path: `${outputDirectory}/${name}-hero.png` });
    await page.locator('[data-robot-stage="service-web"]:not([data-experience-profile])').scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    evidence.stageAfterScroll = await page.locator("[data-experience-profile]").getAttribute("data-robot-stage");
    evidence.status = evidence.canvasCount === 1 && evidence.stageAfterScroll === "service-web" ? "rendered" : "invalid";

    evidence.contextLossSupported = await canvas.evaluate((element) => {
      const gl = element.getContext("webgl2") ?? element.getContext("webgl");
      const extension = gl?.getExtension("WEBGL_lose_context");
      extension?.loseContext();
      return Boolean(extension);
    });
    if (evidence.contextLossSupported) {
      await page.locator('[data-experience-profile="none"]').waitFor({ timeout: 8_000 });
      evidence.contextLossFallback = true;
    }
  } catch (error) {
    evidence.failure = error instanceof Error ? error.message : String(error);
    evidence.profile = await page.locator("[data-experience-profile]").getAttribute("data-experience-profile").catch(() => null);
    evidence.sceneStatus = await page.locator("[data-scene-status]").getAttribute("data-scene-status").catch(() => null);
    evidence.canvasCount = await page.locator("canvas").count().catch(() => 0);
    await mkdir(outputDirectory, { recursive: true });
    await page.screenshot({ path: `${outputDirectory}/${name}-unavailable.png` }).catch(() => {});
  } finally {
    evidence.sceneRequests = sceneRequests.length;
    await context.close();
    await browser.close();
  }
  return evidence;
}

try {
  await waitUntilReady();
  const results = [];
  for (const [name, browserType] of [["firefox", firefox], ["webkit", webkit]]) {
    results.push(await inspectEngine(name, browserType));
  }
  await mkdir("qa/network/step-3", { recursive: true });
  await writeFile("qa/network/step-3/cross-browser-spline.json", `${JSON.stringify({ results }, null, 2)}\n`);
  console.table(results.map(({ engine, status, sceneRequests, canvasCount, renderer, sceneStatus }) => (
    { engine, status, sceneRequests, canvasCount, renderer, sceneStatus }
  )));
} finally {
  server.kill();
}
