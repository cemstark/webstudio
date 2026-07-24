import { spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";

const port = 3212;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDirectory = "qa/lighthouse";
const pages = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/fiyatlandirma" },
  { name: "home-desktop", path: "/", preset: "desktop" },
];

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

async function runLighthouse(page) {
  const outputPath = `${outputDirectory}/${page.name}.json`;
  await rm(outputPath, { force: true });
  const lighthouseArguments = [
    "node_modules/lighthouse/cli/index.js",
    `${baseUrl}${page.path}`,
    "--quiet",
    "--output=json",
    `--output-path=${outputPath}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags=--headless --no-sandbox --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist",
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
  const report = JSON.parse(reportText);
  return {
    page: page.name,
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
    lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue),
    cls: Number(report.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    tbtMs: Math.round(report.audits["total-blocking-time"].numericValue),
  };
}

try {
  await mkdir(outputDirectory, { recursive: true });
  await waitUntilReady();
  const results = [];
  for (const page of pages) results.push(await runLighthouse(page));
  console.table(results);
} finally {
  server.kill();
}
