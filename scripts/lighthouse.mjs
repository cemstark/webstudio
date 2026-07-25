import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const port = 3212;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDirectory = "qa/lighthouse";
const runsPerProfile = 3;
const pages = [
  { name: "home-mobile-full", path: "/" },
  { name: "home-mobile-lite", path: "/?qa-experience=lite" },
  { name: "home-desktop-full", path: "/", preset: "desktop" },
  { name: "pricing-mobile", path: "/fiyatlandirma" },
];
const profileFilter = new Set((process.env.LIGHTHOUSE_PROFILES ?? "").split(",").filter(Boolean));
const selectedPages = profileFilter.size ? pages.filter((page) => profileFilter.has(page.name)) : pages;

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

function extractRun(report, page, run) {
  const requests = report.audits["network-requests"]?.details?.items ?? [];
  const scriptRequests = requests.filter((request) => request.resourceType === "Script");
  const sceneRequests = requests.filter((request) => request.url.includes("scene.splinecode"));
  const runtimeRequests = requests.filter((request) => /SplineRobotScene|splinetool/i.test(request.url));
  return {
    page: page.name,
    run,
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue),
    cls: Number(report.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    tbtMs: Math.round(report.audits["total-blocking-time"].numericValue),
    requestCount: requests.length,
    transferBytes: Math.round(report.audits["total-byte-weight"]?.numericValue ?? 0),
    scriptTransferBytes: scriptRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    sceneTransferBytes: sceneRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    sceneRequests: sceneRequests.length,
    runtimeTransferBytes: runtimeRequests.reduce((sum, request) => sum + (request.transferSize ?? 0), 0),
    longTasks: report.audits["long-tasks"]?.details?.items?.length ?? 0,
  };
}

async function runLighthouse(page, run) {
  const outputPath = `${outputDirectory}/${page.name}-run-${run}.json`;
  await rm(outputPath, { force: true });
  const chromeFlags = `--headless --no-sandbox --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist${page.chromeFlags ?? ""}`;
  const lighthouseArguments = [
    "node_modules/lighthouse/cli/index.js",
    `${baseUrl}${page.path}`,
    "--quiet",
    "--output=json",
    `--output-path=${outputPath}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    `--chrome-flags=${chromeFlags}`,
  ];
  if (page.preset) lighthouseArguments.push(`--preset=${page.preset}`);
  const processResult = spawn(process.execPath, lighthouseArguments, { stdio: "inherit" });

  const exitCode = await new Promise((resolve) => processResult.on("close", resolve));
  let reportText;
  try {
    reportText = await readFile(outputPath, "utf8");
  } catch {
    throw new Error(`Lighthouse failed for ${page.path} with exit code ${exitCode}.`);
  }
  if (exitCode !== 0) console.warn(`Lighthouse produced ${outputPath} but Chrome cleanup returned exit code ${exitCode}.`);
  return extractRun(JSON.parse(reportText), page, run);
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

function summarize(results) {
  return selectedPages.map((page) => {
    const pageRuns = results.filter((result) => result.page === page.name);
    return Object.fromEntries([
      ["page", page.name],
      ...Object.keys(pageRuns[0]).filter((key) => !["page", "run"].includes(key)).map((key) => [key, median(pageRuns.map((run) => run[key]))]),
    ]);
  });
}

try {
  await mkdir(outputDirectory, { recursive: true });
  await waitUntilReady();
  const results = [];
  for (const page of selectedPages) {
    for (let run = 1; run <= runsPerProfile; run += 1) results.push(await runLighthouse(page, run));
  }
  const medians = summarize(results);
  await writeFile(`${outputDirectory}/summary.json`, `${JSON.stringify({ runs: results, medians }, null, 2)}\n`);
  console.table(medians);
} finally {
  server.kill();
}
