import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const sceneUrlFragment = "prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";
const allRoutes = [
  "/",
  "/hizmetler",
  "/hizmetler/web-tasarim",
  "/hizmetler/seo",
  "/hizmetler/mobil-uygulama",
  "/hizmetler/e-ticaret",
  "/fiyatlandirma",
  "/projeler",
  "/projeler/vela-windsurfing",
  "/surec",
  "/hakkimda",
  "/iletisim",
  "/gizlilik",
  "/cerez-politikasi",
] as const;

async function activateFullProfile(page: Page) {
  await page.mouse.wheel(0, 1);
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "full");
}

async function createDesktopPage(context: BrowserContext) {
  const page = await context.newPage();
  await page.goto("/");
  return page;
}

test("menu traps focus, closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menüyü aç" });
  await menuButton.click();
  const dialog = page.getByRole("dialog", { name: "Site menüsü" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test("internal navigation and browser back never leave the route curtain stuck", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page.getByRole("dialog", { name: "Site menüsü" }).locator('a[href="/projeler"]').click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Yayına çıkan");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cesur fikirler");
  await expect.poll(
    () => page.locator(".routeTransition").evaluate((element) => element.getBoundingClientRect().height),
    { timeout: 5_000 },
  ).toBeLessThan(1);
});

test("reduced motion renders the complete hero without requesting Spline", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  const page = await createDesktopPage(context);
  await page.waitForTimeout(4_500);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Projenizi konuşalım/ })).toBeVisible();
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(requests.some((url) => url.includes(sceneUrlFragment))).toBe(false);
  await context.close();
});

test("WebGL capability failure keeps the branded fallback and CTAs", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  const page = await createDesktopPage(context);
  await page.mouse.wheel(0, 1);
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await expect(page.getByRole("link", { name: /Projenizi konuşalım/ })).toBeVisible();
  await context.close();
});

test("blocked remote scene leaves a useful fallback instead of an empty canvas", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route("**/scene.splinecode", (route) => route.abort("failed"));
  const page = await createDesktopPage(context);
  await activateFullProfile(page);
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Projenizi konuşalım/ })).toBeVisible();
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none", { timeout: 15_000 });
  await context.close();
});

test("full profile loads one remote scene and one robot canvas", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const sceneRequests: string[] = [];
  context.on("request", (request) => {
    if (request.url().includes(sceneUrlFragment)) sceneRequests.push(request.url());
  });
  const page = await createDesktopPage(context);
  await activateFullProfile(page);
  await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "ready", { timeout: 20_000 });
  await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
  expect(sceneRequests).toHaveLength(1);
  await context.close();
});

test("repeated home and inner-route navigation never accumulates canvases", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await activateFullProfile(page);
  await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1, { timeout: 20_000 });
  for (let index = 0; index < 6; index += 1) {
    await page.goto("/projeler");
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.goto("/");
    await expect(page.locator("[data-experience-profile] canvas")).toHaveCount(0);
  }
});

test("inner routes never request the Spline scene", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  const page = await context.newPage();
  for (const route of ["/hizmetler", "/projeler", "/fiyatlandirma", "/iletisim"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(requests.some((url) => url.includes(sceneUrlFragment))).toBe(false);
  await context.close();
});

test("robot chapter state follows downward and upward scroll", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await createDesktopPage(context);
  const host = page.locator("[data-experience-profile]");
  const stages = ["hero", "service-web", "service-seo", "service-mobile", "service-commerce", "projects", "pricing", "process", "final"];
  for (const stage of stages) {
    await page.locator(`[data-robot-stage="${stage}"]:not([data-experience-profile])`).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(host).toHaveAttribute("data-robot-stage", stage);
  }
  for (const stage of stages.slice().reverse()) {
    await page.locator(`[data-robot-stage="${stage}"]:not([data-experience-profile])`).evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(host).toHaveAttribute("data-robot-stage", stage);
  }
  await context.close();
});

test("all product routes render and key pages stay free of app errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of allRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`homepage has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport });
    const page = await createDesktopPage(context);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });
}
