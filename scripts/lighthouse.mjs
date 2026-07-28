import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { launch as launchChrome } from "chrome-launcher";
import { chromium } from "playwright";

const port = 3212;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDirectory = process.env.LIGHTHOUSE_OUTPUT_DIRECTORY ?? "qa/lighthouse/step-3/final";
const runsPerProfile = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const cacheModes = (process.env.LIGHTHOUSE_CACHE_MODES ?? "cold,warm").split(",").filter(Boolean);
/*
 * `full` says whether the scene is expected to load during the run.
 *
 * A capable phone now arrives at a poster and is offered the scene rather than being given
 * it, so the mobile profile measures the page as a phone actually receives it: no WebGL
 * download unless the visitor asks. Desktop still loads it on idle, and keeps the budget.
 * `mobile` mirrors Lighthouse's own touch emulation onto the structural-evidence page, so
 * both halves of the run look at the same device.
 */
const pages = [
  { name: "home-mobile-poster", path: "/?qa-experience=full", full: false, mobile: true, expectOffer: true },
  { name: "home-mobile-lite", path: "/?qa-experience=lite", mobile: true },
  { name: "home-desktop-full", path: "/?qa-experience=full", preset: "desktop", full: true },
  { name: "pricing-mobile", path: "/fiyatlandirma", mobile: true },
];
const profileFilter = new Set((process.env.LIGHTHOUSE_PROFILES ?? "").split(",").filter(Boolean));
const selectedPages = profileFilter.size ? pages.filter((page) => profileFilter.has(page.name)) : pages;

if (!Number.isInteger(runsPerProfile) || runsPerProfile < 1) throw new Error("LIGHTHOUSE_RUNS must be a positive integer.");
if (cacheModes.some((mode) => !["cold", "warm"].includes(mode))) throw new Error("LIGHTHOUSE_CACHE_MODES must contain only cold and warm.");

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { const response = await fetch(baseUrl); if (response.ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Production server did not become ready.");
}

function lcpDetails(report) {
  const items = report.audits["lcp-breakdown-insight"]?.details?.items ?? [];
  const element = items.find((item) => item.type === "node");
  const breakdown = items.find((item) => item.type === "table")?.items ?? [];
  return {
    elementLabel: element?.nodeLabel ?? null,
    elementSelector: element?.selector ?? null,
    subparts: Object.fromEntries(breakdown.map((part) => [part.subpart, Math.round(part.duration)])),
  };
}

function extractRun(report, page, run, cacheMode) {
  const requests = report.audits["network-requests"]?.details?.items ?? [];
  const scriptRequests = requests.filter((request) => request.resourceType === "Script");
  const sceneRequests = requests.filter((request) => request.url.includes("scene.splinecode"));
  const wasmRequests = requests.filter((request) => /\.wasm(?:$|\?)/i.test(request.url));
  const longTasks = report.audits["long-tasks"]?.details?.items ?? [];
  const mainThread = report.audits["mainthread-work-breakdown"]?.details?.items ?? [];
  const bootup = report.audits["bootup-time"]?.details?.items ?? [];
  const lcp = lcpDetails(report);
  return {
    page: page.name,
    cacheMode,
    run,
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    fcpMs: Math.round(report.audits["first-contentful-paint"].numericValue),
    lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue),
    lcpElement: lcp.elementLabel,
    lcpSelector: lcp.elementSelector,
    lcpSubparts: lcp.subparts,
    cls: Number(report.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    tbtMs: Math.round(report.audits["total-blocking-time"].numericValue),
    requestCount: requests.length,
    transferBytes: Math.round(report.audits["total-byte-weight"]?.numericValue ?? 0),
    scriptTransferBytes: scriptRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    sceneTransferBytes: sceneRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    sceneRequests: sceneRequests.length,
    wasmTransferBytes: wasmRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    wasmRequests: wasmRequests.length,
    injectedRequests: requests.filter((request) => /gc\.kis|kaspersky/i.test(request.url)).length,
    longTaskCount: longTasks.length,
    longTasks: longTasks.slice(0, 8).map((task) => ({
      durationMs: Math.round(task.duration),
      startMs: Math.round(task.startTime),
      url: task.url,
    })),
    mainThread: Object.fromEntries(mainThread.map((item) => [item.group, Math.round(item.duration)])),
    bootup: bootup.slice(0, 8).map((item) => ({
      parseMs: Math.round(item.scriptParseCompile),
      scriptingMs: Math.round(item.scripting),
      totalMs: Math.round(item.total),
      url: item.url,
    })),
  };
}

async function runLighthouse(page, run, cacheMode, chromePort) {
  const outputPath = `${outputDirectory}/${page.name}-${cacheMode}-run-${run}.json`;
  await rm(outputPath, { force: true });
  const lighthouseArguments = [
    "node_modules/lighthouse/cli/index.js",
    `${baseUrl}${page.path}`,
    "--quiet",
    "--output=json",
    `--output-path=${outputPath}`,
    `--port=${chromePort}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--blocked-url-patterns=*gc.kis*",
  ];
  if (cacheMode === "warm") lighthouseArguments.push("--disable-storage-reset");
  if (run === 1) lighthouseArguments.push("--save-assets");
  if (page.preset) lighthouseArguments.push(`--preset=${page.preset}`);
  const processResult = spawn(process.execPath, lighthouseArguments, { stdio: "inherit" });

  const exitCode = await new Promise((resolve) => processResult.on("close", resolve));
  let reportText;
  try {
    reportText = await readFile(outputPath, "utf8");
  } catch {
    throw new Error(`Lighthouse failed for ${page.path} with exit code ${exitCode}.`);
  }
  if (exitCode !== 0) console.warn(`Lighthouse produced ${outputPath} but exited with ${exitCode}.`);
  return extractRun(JSON.parse(reportText), page, run, cacheMode);
}

async function waitForSceneState(page, definition) {
  if (definition.full) {
    await page.locator('[data-experience-profile="full"]').waitFor({ timeout: 15_000 });
    await page.locator('[data-scene-status="ready"]').waitFor({ timeout: 30_000 });
  } else {
    await page.waitForTimeout(1_200);
  }
}

/** Puts a CDP-driven page on the same device Lighthouse emulates for this profile. */
async function applyDeviceEmulation(context, page, definition) {
  if (!definition.mobile) return;
  const client = await context.newCDPSession(page);
  await client.send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true });
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
}

async function warmCache(context, definition) {
  const page = await context.newPage();
  await applyDeviceEmulation(context, page, definition);
  await page.goto(`${baseUrl}${definition.path}`, { waitUntil: "domcontentloaded" });
  await waitForSceneState(page, definition);
  await page.close();
}

async function collectStructuralEvidence(context, definition, cacheMode, run) {
  const page = await context.newPage();
  await applyDeviceEmulation(context, page, definition);
  const sceneRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("scene.splinecode")) sceneRequests.push(request.url());
  });
  await page.addInitScript(() => {
    window.__CEM_QA_LCP__ = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__CEM_QA_LCP__.push({
          element: entry.element?.textContent?.trim() || entry.element?.tagName || null,
          renderTime: entry.renderTime,
          size: entry.size,
          startTime: entry.startTime,
        });
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(`${baseUrl}${definition.path}`, { waitUntil: "domcontentloaded" });
  if (definition.full && run === 1) await page.dispatchEvent("body", "pointerdown");
  await waitForSceneState(page, definition);
  await page.waitForTimeout(definition.full ? 600 : 100);
  const evidence = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    return {
      canvasCount: document.querySelectorAll("canvas").length,
      domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
      fallbackOpacity: document.querySelector("[data-robot-fallback]")
        ? getComputedStyle(document.querySelector("[data-robot-fallback]")).opacity
        : null,
      firstContentfulPaintMs: paint.find((entry) => entry.name === "first-contentful-paint")?.startTime ?? null,
      lcpEntries: window.__CEM_QA_LCP__,
      marks: performance.getEntriesByType("mark")
        .filter((entry) => entry.name.startsWith("cem:"))
        .map((entry) => ({ name: entry.name, startTime: entry.startTime })),
      profile: document.querySelector("[data-experience-profile]")?.getAttribute("data-experience-profile") ?? null,
      sceneOffered: [...document.querySelectorAll("button")].some((button) => button.textContent?.includes("3D")),
      sceneStatus: document.querySelector("[data-scene-status]")?.getAttribute("data-scene-status") ?? null,
      splineOpacity: document.querySelector("[data-spline-scene]")
        ? getComputedStyle(document.querySelector("[data-spline-scene]")).opacity
        : null,
      splineResources: performance.getEntriesByType("resource")
        .filter((entry) => /scene\.splinecode|\.wasm(?:$|\?)/i.test(entry.name))
        .map((entry) => ({
          durationMs: entry.duration,
          encodedBodySize: entry.encodedBodySize,
          name: entry.name,
          startTime: entry.startTime,
          transferSize: entry.transferSize,
        })),
    };
  });
  evidence.sceneRequests = sceneRequests.length;
  evidence.cacheMode = cacheMode;
  evidence.run = run;
  evidence.page = definition.name;

  const expectedSceneRequests = definition.full ? 1 : 0;
  const expectedCanvases = definition.full ? 1 : 0;
  if (evidence.sceneRequests !== expectedSceneRequests || evidence.canvasCount !== expectedCanvases) {
    throw new Error(`${definition.name} ${cacheMode} run ${run} structural assertion failed: ${evidence.sceneRequests} scene requests, ${evidence.canvasCount} canvases.`);
  }
  // Zero scene requests has to mean "offered and declined", not "the layer never rendered".
  if (definition.expectOffer && !evidence.sceneOffered) {
    throw new Error(`${definition.name} ${cacheMode} run ${run} rendered no scene offer, so the empty scene budget is not the poster.`);
  }
  await page.close();
  return evidence;
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

function summarize(results) {
  return selectedPages.flatMap((page) => cacheModes.map((cacheMode) => {
    const pageRuns = results.filter((result) => result.page === page.name && result.cacheMode === cacheMode);
    const numericKeys = [
      "performance", "accessibility", "bestPractices", "seo", "fcpMs", "lcpMs", "cls", "tbtMs",
      "requestCount", "transferBytes", "scriptTransferBytes", "sceneTransferBytes", "sceneRequests",
      "wasmTransferBytes", "wasmRequests", "injectedRequests", "longTaskCount",
    ];
    return {
      page: page.name,
      cacheMode,
      ...Object.fromEntries(numericKeys.map((key) => [key, median(pageRuns.map((entry) => entry[key]))])),
      lcpElement: pageRuns[Math.floor(pageRuns.length / 2)].lcpElement,
    };
  }));
}

try {
  await mkdir(outputDirectory, { recursive: true });
  await waitUntilReady();
  const results = [];
  const structuralEvidence = [];
  for (const page of selectedPages) {
    const chrome = await launchChrome({
      chromeFlags: ["--headless", "--no-sandbox", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
      logLevel: "silent",
    });
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);
    const [context] = browser.contexts();
    try {
      for (const cacheMode of cacheModes) {
        for (let run = 1; run <= runsPerProfile; run += 1) {
          if (cacheMode === "warm") await warmCache(context, page);
          const result = await runLighthouse(page, run, cacheMode, chrome.port);
          const structural = await collectStructuralEvidence(context, page, cacheMode, run);
          if (result.sceneRequests !== (page.full ? 1 : 0)) {
            throw new Error(`${page.name} ${cacheMode} run ${run} Lighthouse captured ${result.sceneRequests} scene requests.`);
          }
          results.push(result);
          structuralEvidence.push(structural);
        }
      }
    } finally {
      await browser.close();
      try { chrome.kill(); } catch {}
    }
  }
  const medians = summarize(results);
  await writeFile(`${outputDirectory}/summary.json`, `${JSON.stringify({ runs: results, medians, structuralEvidence }, null, 2)}\n`);
  console.table(medians);
} finally {
  server.kill();
}
