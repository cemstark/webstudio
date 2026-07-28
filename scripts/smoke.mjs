import { spawn } from "node:child_process";

const port = 3210;
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/", "/hizmetler", "/hizmetler/web-tasarim", "/hizmetler/seo",
  "/hizmetler/mobil-uygulama", "/hizmetler/e-ticaret", "/fiyatlandirma",
  "/projeler", "/projeler/vela-windsurfing", "/projeler/aysaworks",
  "/projeler/bluekim", "/projeler/drnekinoto-servis", "/projeler/cemwebstudio",
  "/projeler/erp-is-yonetim-paneli", "/projeler/atlas-panel-script",
  "/projeler/drn-servis-paneli", "/surec", "/hakkimda",
  "/iletisim", "/gizlilik", "/cerez-politikasi", "/sitemap.xml", "/robots.txt",
];

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { const response = await fetch(baseUrl); if (response.ok) return; } catch {}
    await delay(250);
  }
  throw new Error("Production server did not become ready.");
}

try {
  await waitUntilReady();
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    console.log(`${response.status} ${route}`);
  }

  const unknownProject = await fetch(`${baseUrl}/projeler/bilinmeyen-proje`);
  if (unknownProject.status !== 404) throw new Error(`Unknown project returned ${unknownProject.status}`);
  console.log("404 /projeler/bilinmeyen-proje");

  const invalidResponse = await fetch(`${baseUrl}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "x" }) });
  if (invalidResponse.status !== 400) throw new Error(`Invalid contact payload returned ${invalidResponse.status}`);
  console.log("400 /api/contact invalid");

  const smtpResponse = await fetch(`${baseUrl}/api/contact`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Test User", email: "test@example.com", phone: "", company: "", service: "web-tasarim", package: "Başlangıç", budget: "7.000–15.000 TL", targetDate: "", summary: "Bu yalnızca SMTP yapılandırma davranışını doğrulayan test briefidir.", privacy: true, website: "", startedAt: Date.now() - 5000 }) });
  if (smtpResponse.status !== 503) throw new Error(`Unconfigured SMTP returned ${smtpResponse.status}`);
  console.log("503 /api/contact smtp-missing");

  const tooFastResponse = await fetch(`${baseUrl}/api/contact`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.10" }, body: JSON.stringify({ name: "Test User", email: "test@example.com", phone: "", company: "", service: "web-tasarim", package: "Başlangıç", budget: "7.000–15.000 TL", targetDate: "", summary: "Bu yalnızca minimum gönderim süresini doğrulayan test briefidir.", privacy: true, website: "", startedAt: Date.now() }) });
  if (tooFastResponse.status !== 400) throw new Error(`Too-fast contact payload returned ${tooFastResponse.status}`);
  console.log("400 /api/contact minimum-submit-time");

  let rateLimitStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(`${baseUrl}/api/contact`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.20" }, body: JSON.stringify({ name: "x" }) });
    rateLimitStatus = response.status;
  }
  if (rateLimitStatus !== 429) throw new Error(`Sixth contact attempt returned ${rateLimitStatus}`);
  console.log("429 /api/contact rate-limit");
} finally {
  server.kill();
}
