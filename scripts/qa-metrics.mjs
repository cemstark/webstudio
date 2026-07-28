import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { chromium, devices } from "playwright";

const port = Number(process.env.QA_METRICS_PORT ?? 3213);
const baseUrl = `http://127.0.0.1:${port}`;
const outputPath = process.env.QA_METRICS_OUTPUT ?? "qa/metrics/summary.json";
const label = process.env.QA_METRICS_LABEL ?? "current";
const routes = (process.env.QA_METRICS_ROUTES ?? "/").split(",").filter(Boolean);

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { const response = await fetch(baseUrl); if (response.ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Production server did not become ready.");
}

/** Scroll length and horizontal overflow per viewport, measured with motion disabled. */
async function measureLayout(browser, route) {
  const measurements = [];
  for (const viewport of viewports) {
    const isMobile = viewport.width < 1024;
    const context = await browser.newContext({
      ...(isMobile ? devices["iPhone 13"] : {}),
      reducedMotion: "reduce",
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const result = await page.evaluate(() => {
      const root = document.documentElement;
      const bodyStyle = getComputedStyle(document.body);
      return {
        scrollHeight: root.scrollHeight,
        clientHeight: root.clientHeight,
        horizontalOverflow: root.scrollWidth - root.clientWidth,
        bodyFontSizePx: Number.parseFloat(bodyStyle.fontSize),
      };
    });
    measurements.push({
      ...viewport,
      ...result,
      screens: Number((result.scrollHeight / result.clientHeight).toFixed(2)),
    });
    await context.close();
  }
  return measurements;
}

/** First-load script weight. Transfer bytes are the compressed wire size the budget is written against. */
async function measureScriptWeight(browser, route, reducedMotion = "reduce") {
  const context = await browser.newContext({ ...devices["iPhone 13"], reducedMotion });
  const page = await context.newPage();
  const scripts = [];
  page.on("response", async (response) => {
    const request = response.request();
    if (request.resourceType() !== "script") return;
    try {
      const body = await response.body();
      scripts.push({
        url: request.url(),
        rawBytes: body.length,
        // The wire size depends on the host's compression config, so gzip locally for a stable budget number.
        transferBytes: gzipSync(body, { level: 9 }).length,
      });
    } catch {}
  });
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  // The motion runtime loads on demand, so give the deferred chunks time to arrive.
  await page.waitForTimeout(2_500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1_500);
  await context.close();

  const isSpline = (url) => /spline|runtime\.|process\.|opentype|draco/i.test(url);
  const sum = (list, key) => list.reduce((total, script) => total + script[key], 0);
  const splineScripts = scripts.filter((script) => isSpline(script.url));
  const appScripts = scripts.filter((script) => !isSpline(script.url));
  return {
    requestCount: scripts.length,
    totalTransferBytes: sum(scripts, "transferBytes"),
    splineTransferBytes: sum(splineScripts, "transferBytes"),
    appTransferBytes: sum(appScripts, "transferBytes"),
    appRawBytes: sum(appScripts, "rawBytes"),
    scripts: scripts
      .map(({ transferBytes, rawBytes, url }) => ({ transferBytes, rawBytes, url: url.replace(baseUrl, "") }))
      .sort((a, b) => b.transferBytes - a.transferBytes),
  };
}

try {
  await waitUntilReady();
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
  const report = { label, generatedAt: new Date().toISOString(), routes: {} };
  for (const route of routes) {
    const reducedMotionWeight = await measureScriptWeight(browser, route, "reduce");
    const fullMotionWeight = await measureScriptWeight(browser, route, "no-preference");
    report.routes[route] = {
      layout: await measureLayout(browser, route),
      scriptWeight: reducedMotionWeight,
      scriptWeightWithMotion: fullMotionWeight,
      // What the animation stack actually costs a visitor who has motion enabled.
      motionRuntimeTransferBytes: fullMotionWeight.appTransferBytes - reducedMotionWeight.appTransferBytes,
    };
  }
  await browser.close();
  await mkdir(outputPath.replace(/\/[^/]+$/, ""), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  for (const route of routes) {
    console.info(`\n[${label}] ${route}`);
    console.table(report.routes[route].layout.map(({ name, scrollHeight, clientHeight, screens, horizontalOverflow, bodyFontSizePx }) => ({
      name, scrollHeight, clientHeight, screens, horizontalOverflow, bodyFontSizePx,
    })));
    const { requestCount, appTransferBytes } = report.routes[route].scriptWeight;
    const { motionRuntimeTransferBytes, scriptWeightWithMotion } = report.routes[route];
    console.info(
      `firstLoad: scripts=${requestCount} appTransferKB=${(appTransferBytes / 1024).toFixed(1)} (reduced-motion, Spline excluded)`,
    );
    console.info(
      `withMotion: scripts=${scriptWeightWithMotion.requestCount} appTransferKB=${(scriptWeightWithMotion.appTransferBytes / 1024).toFixed(1)}`
      + ` → gsap+lenis netKB=${(motionRuntimeTransferBytes / 1024).toFixed(1)}`,
    );
  }
} finally {
  server.kill();
}
