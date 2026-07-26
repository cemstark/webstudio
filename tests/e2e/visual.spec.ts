import { devices, expect, test, type BrowserContext, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test.describe.configure({ timeout: 600_000 });

const mobileViewports = [
  { name: "320x568", width: 320, height: 568 },
  { name: "360x800", width: 360, height: 800 },
  { name: "375x667", width: 375, height: 667 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "844x390", width: 844, height: 390 },
  { name: "932x430", width: 932, height: 430 },
  { name: "1024x768", width: 1024, height: 768 },
] as const;

const desktopViewports = [
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;
const outputRoot = "qa/screenshots/step-3/after";

const viewportFilter = new Set((process.env.QA_VIEWPORTS ?? "").split(",").filter(Boolean));
const selectedMobileViewports = viewportFilter.size
  ? mobileViewports.filter((viewport) => viewportFilter.has(viewport.name))
  : mobileViewports;

const stages = [
  ["manifesto", "manifesto"],
  ["service-web", "service-01-web-tasarim"],
  ["service-seo", "service-02-seo"],
  ["service-mobile", "service-03-mobil-uygulama"],
  ["service-commerce", "service-04-e-ticaret"],
  ["projects", "vela-proje-portali"],
  ["pricing", "fiyatlandirma"],
  ["process", "surec"],
  ["faq", "sss"],
  ["final", "final-cta"],
] as const;

async function captureViewport(page: Page, path: string) {
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.replace(/\.png$/, ".jpg"), animations: "disabled", quality: 82, type: "jpeg" });
}

async function positionStage(page: Page, stage: string, block: "start" | "center") {
  const section = page.locator(`[data-robot-stage="${stage}"]:not([data-experience-profile])`);
  await section.evaluate((element, requestedBlock) => {
    const rect = element.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const offset = requestedBlock === "center" ? (rect.height - window.innerHeight) / 2 : 1;
    window.scrollTo(0, Math.max(0, absoluteTop + offset));
    window.dispatchEvent(new Event("scroll"));
  }, block);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-robot-stage", stage);
  const splineScene = page.locator("[data-spline-scene]");
  if (await splineScene.count()) {
    const activeStages = new Set(["hero", "service-web", "service-seo", "service-mobile", "service-commerce", "final"]);
    await expect(splineScene).toHaveAttribute("data-spline-active", activeStages.has(stage) ? "true" : "false");
  }
}

async function captureStory(page: Page, directory: string, includeServiceMids = true) {
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.evaluate(() => window.scrollTo(0, 0));
  await captureViewport(page, `${directory}/hero.png`);
  for (const [stage, filename] of stages) {
    await positionStage(page, stage, "start");
    await captureViewport(page, `${directory}/${filename}-start.png`);
    if (includeServiceMids && stage.startsWith("service-")) {
      await positionStage(page, stage, "center");
      await captureViewport(page, `${directory}/${filename}-mid.png`);
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await captureViewport(page, `${directory}/menu-open.png`);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site menüsü" })).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
}

async function waitForProductionScene(page: Page) {
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "full", { timeout: 15_000 });
  await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "ready", { timeout: 30_000 });
  await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
}

test("real production Spline mobile and tablet visual matrix", async ({ browser }) => {
  const first = mobileViewports[3];
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    reducedMotion: "no-preference",
    viewport: { width: first.width, height: first.height },
  });
  const sceneRequests: string[] = [];
  context.on("request", (request) => {
    if (request.url().includes("/scene.splinecode")) sceneRequests.push(request.url());
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForProductionScene(page);

  for (const viewport of selectedMobileViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await captureStory(page, `${outputRoot}/mobile-full/${viewport.name}`);
    await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
  }
  expect(sceneRequests).toHaveLength(1);
  await context.close();
});

test("real production Spline desktop regression matrix", async ({ browser }) => {
  const context = await browser.newContext({ viewport: desktopViewports[0] });
  const sceneRequests: string[] = [];
  context.on("request", (request) => {
    if (request.url().includes("/scene.splinecode")) sceneRequests.push(request.url());
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForProductionScene(page);

  for (const viewport of desktopViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await captureStory(page, `${outputRoot}/desktop-full/${viewport.name}`, false);
    await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
  }
  expect(sceneRequests).toHaveLength(1);
  await context.close();
});

async function captureFallbackMode(context: BrowserContext, mode: string, viewport: { name: string; width: number; height: number }) {
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  const directory = `${outputRoot}/${mode}/${viewport.name}`;
  await captureViewport(page, `${directory}/hero.png`);
  for (const [stage, filename] of [["service-web", "service-01-web-tasarim"], ["final", "final-cta"]] as const) {
    await positionStage(page, stage, stage === "final" ? "start" : "center");
    await captureViewport(page, `${directory}/${filename}.png`);
  }
  await page.close();
}

for (const viewport of [mobileViewports[3], mobileViewports[5], desktopViewports[0]]) {
  test(`lite, reduced and blocked visual comparison at ${viewport.name}`, async ({ browser }) => {
    const baseOptions = { ...devices["iPhone 13"], viewport: { width: viewport.width, height: viewport.height } };

    const liteContext = await browser.newContext({ ...baseOptions, reducedMotion: "no-preference" });
    await liteContext.addInitScript(() => Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: 2 }));
    await captureFallbackMode(liteContext, "mobile-lite", viewport);
    await liteContext.close();

    const reducedContext = await browser.newContext({ ...baseOptions, reducedMotion: "reduce" });
    await captureFallbackMode(reducedContext, "motion-disabled", viewport);
    await reducedContext.close();

    const blockedContext = await browser.newContext({ ...baseOptions, reducedMotion: "no-preference" });
    await blockedContext.route("**/scene.splinecode", (route) => route.abort("failed"));
    const blockedPage = await blockedContext.newPage();
    await blockedPage.goto("/");
    await expect(blockedPage.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none", { timeout: 15_000 });
    await captureViewport(blockedPage, `${outputRoot}/scene-blocked/${viewport.name}/hero.png`);
    await blockedContext.close();
  });
}

test("inner pricing route visual has no Spline network or canvas", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const splineRequests: string[] = [];
  context.on("request", (request) => {
    if (/SplineRobotScene|splinetool|spline\.design|scene\.splinecode/i.test(request.url())) splineRequests.push(request.url());
  });
  const page = await context.newPage();
  await page.goto("/fiyatlandirma");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.screenshot({ path: `${outputRoot}/inner/fiyatlandirma-1440x900.jpg`, fullPage: true, quality: 82, type: "jpeg" });
  expect(splineRequests).toEqual([]);
  await context.close();
});

test("real scene inventory, warm-cache signals and active frame cadence", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  await context.addInitScript(() => {
    window.addEventListener("cem:spline-inventory", ((event: CustomEvent) => {
      Object.defineProperty(window, "__CEM_SPLINE_INVENTORY__", { configurable: true, value: event.detail, writable: true });
    }) as EventListener);
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  const network = new Map<string, { encodedDataLength?: number; fromDiskCache?: boolean; status?: number; url: string }>();
  client.on("Network.responseReceived", (event) => {
    if (!/scene\.splinecode|process\.wasm/i.test(event.response.url)) return;
    network.set(event.requestId, {
      fromDiskCache: event.response.fromDiskCache,
      status: event.response.status,
      url: event.response.url,
    });
  });
  client.on("Network.loadingFinished", (event) => {
    const entry = network.get(event.requestId);
    if (entry) entry.encodedDataLength = event.encodedDataLength;
  });

  await page.goto("/?qa-spline-inventory=1", { waitUntil: "domcontentloaded" });
  await waitForProductionScene(page);
  const inventory = await expect.poll(() => page.evaluate(() => (
    (window as typeof window & { __CEM_SPLINE_INVENTORY__?: unknown }).__CEM_SPLINE_INVENTORY__
  ))).not.toBeUndefined();
  void inventory;
  const inventoryData = await page.evaluate(() => (
    (window as typeof window & { __CEM_SPLINE_INVENTORY__?: unknown }).__CEM_SPLINE_INVENTORY__
  ));
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForProductionScene(page);

  const frameCadence = await page.evaluate(async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-spline-scene] canvas");
    const context = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
    const rendererInfo = context?.getExtension("WEBGL_debug_renderer_info");
    const renderer = context && rendererInfo
      ? String(context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : "unavailable";
    const samples: number[] = [];
    let previous = performance.now();
    await new Promise<void>((resolve) => {
      const sample = (time: number) => {
        samples.push(time - previous);
        previous = time;
        if (samples.length >= 180) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    const ordered = samples.slice(1).sort((left, right) => left - right);
    const p95Ms = ordered[Math.floor(ordered.length * 0.95)];
    const averageMs = ordered.reduce((sum, value) => sum + value, 0) / ordered.length;
    return { averageFps: 1_000 / averageMs, averageMs, p95Ms, renderer };
  });

  const networkData = [...network.values()];
  await mkdir("qa/network/step-3", { recursive: true });
  await writeFile(`qa/network/step-3/spline-runtime-evidence-${testInfo.project.name}.json`, `${JSON.stringify({ frameCadence, inventory: inventoryData, network: networkData }, null, 2)}\n`);
  console.info(`[qa-spline-runtime] ${JSON.stringify({ frameCadence, network: networkData })}`);
  expect((inventoryData as { objects?: unknown[] } | undefined)?.objects?.length ?? 0).toBeGreaterThan(0);
  expect(networkData.filter((entry) => entry.url.includes("scene.splinecode"))).toHaveLength(2);
  await context.close();
});

test("60-second hardware scroll and idle soak stays within frame and heap budgets", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send("HeapProfiler.enable");

  await page.goto("/?qa-spline-inventory=1", { waitUntil: "domcontentloaded" });
  await waitForProductionScene(page);
  await client.send("HeapProfiler.collectGarbage");
  const heapBefore = await client.send("Runtime.getHeapUsage");

  const soak = await page.evaluate(async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-spline-scene] canvas");
    if (!canvas) throw new Error("Spline canvas missing before soak.");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const rendererInfo = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = gl && rendererInfo
      ? String(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : "unavailable";
    const stageNames = ["hero", "service-web", "service-seo", "service-mobile", "service-commerce", "projects", "pricing", "final"];
    const stages = stageNames.map((stage) => document.querySelector<HTMLElement>(
      `[data-robot-stage="${stage}"]:not([data-experience-profile])`,
    )).filter((element): element is HTMLElement => Boolean(element));
    const samples: number[] = [];
    let contextLosses = 0;
    const onContextLoss = () => { contextLosses += 1; };
    canvas.addEventListener("webglcontextlost", onContextLoss);
    const startedAt = performance.now();
    let previousFrame = startedAt;
    let nextStageAt = startedAt;
    let stageIndex = 0;

    await new Promise<void>((resolve) => {
      const sample = (time: number) => {
        samples.push(time - previousFrame);
        previousFrame = time;
        if (time >= nextStageAt && stages.length) {
          const stage = stages[stageIndex % stages.length];
          const rect = stage.getBoundingClientRect();
          window.scrollTo(0, Math.max(0, window.scrollY + rect.top));
          window.dispatchEvent(new Event("scroll"));
          stageIndex += 1;
          nextStageAt += 5_000;
        }
        if (time - startedAt >= 60_000) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    canvas.removeEventListener("webglcontextlost", onContextLoss);
    const ordered = samples.slice(1).sort((left, right) => left - right);
    const averageMs = ordered.reduce((sum, value) => sum + value, 0) / ordered.length;
    return {
      averageFps: 1_000 / averageMs,
      averageMs,
      canvasCount: document.querySelectorAll("[data-spline-scene] canvas").length,
      contextLosses,
      p95Ms: ordered[Math.floor(ordered.length * 0.95)],
      renderer,
      sampleCount: ordered.length,
      stageChanges: stageIndex,
    };
  });

  await client.send("HeapProfiler.collectGarbage");
  const heapAfter = await client.send("Runtime.getHeapUsage");
  const evidence = {
    ...soak,
    heapAfterBytes: heapAfter.usedSize,
    heapBeforeBytes: heapBefore.usedSize,
    heapDeltaBytes: heapAfter.usedSize - heapBefore.usedSize,
  };
  await mkdir("qa/network/step-3", { recursive: true });
  await writeFile(`qa/network/step-3/hardware-soak-${testInfo.project.name}.json`, `${JSON.stringify(evidence, null, 2)}\n`);
  console.info(`[qa-spline-soak] ${JSON.stringify(evidence)}`);

  expect(soak.canvasCount).toBe(1);
  expect(soak.contextLosses).toBe(0);
  expect(soak.averageFps).toBeGreaterThanOrEqual(55);
  expect(soak.p95Ms).toBeLessThanOrEqual(22);
  expect(evidence.heapDeltaBytes).toBeLessThan(8 * 1024 * 1024);
  await context.close();
});
