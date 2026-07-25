import { devices, expect, test, type Browser, type BrowserContext, type Page, type Route } from "@playwright/test";

const sceneUrlFragment = "prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";
const mobileDevice = devices["iPhone 13"];
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

const targetViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 844, height: 390 },
  { width: 932, height: 430 },
  { width: 1024, height: 768 },
] as const;

function isSplineAsset(url: string) {
  return /SplineRobotScene|splinetool|spline\.design|scene\.splinecode/i.test(url);
}

async function addSplineMock(context: BrowserContext) {
  await context.addInitScript(() => {
    window.__CEM_SPLINE_TEST_MOCK__ = true;
  });
}

async function createMockedMobile(
  browser: Browser,
  routeHandler: Parameters<BrowserContext["route"]>[1] = (route) => route.fulfill({
    body: "{}",
    contentType: "application/json",
    status: 200,
  }),
) {
  const context = await browser.newContext({ ...mobileDevice, reducedMotion: "no-preference" });
  await addSplineMock(context);
  await context.route("**/scene.splinecode", routeHandler);
  return context;
}

async function expectFullScene(page: Page) {
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "full");
  await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "ready");
  await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
}

async function expectNoSpline(page: Page, requests: string[], profile: "lite" | "none") {
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", profile);
  await page.waitForTimeout(2_200);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  expect(requests.filter(isSplineAsset)).toEqual([]);
}

test("capable touch mobile loads one scene, one canvas and crossfades the fallback", async ({ browser }) => {
  const context = await createMockedMobile(browser);
  const sceneRequests: string[] = [];
  const errors: string[] = [];
  context.on("request", (request) => {
    if (request.url().includes(sceneUrlFragment)) sceneRequests.push(request.url());
  });
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expectFullScene(page);
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-input-mode", "touch");
  await expect(page.locator("[data-robot-fallback]")).toHaveCSS("opacity", "0");
  await expect(page.locator("[data-spline-scene]")).toHaveCSS("opacity", "1");
  expect(sceneRequests).toHaveLength(1);
  expect(errors).toEqual([]);
  await context.close();
});

test("vertical touch swipe over the robot scrolls naturally and the hero CTA remains clickable", async ({ browser }) => {
  const context = await createMockedMobile(browser);
  const page = await context.newPage();
  await page.goto("/");
  await expectFullScene(page);
  const robot = page.locator("[data-spline-scene]");
  const box = await robot.boundingBox();
  expect(box).not.toBeNull();
  const client = await context.newCDPSession(page);
  const x = Math.round((box?.x ?? 0) + (box?.width ?? 1) * 0.72);
  const startY = Math.round((box?.y ?? 0) + (box?.height ?? 1) * 0.8);
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: startY }] });
  for (const delta of [50, 100, 150, 210]) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: startY - delta }] });
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(20);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('section[data-robot-stage="hero"] a[href="/iletisim"]').click();
  await expect(page).toHaveURL(/\/iletisim$/);
  await context.close();
});

test("portrait-landscape-portrait keeps one canvas and one scene request", async ({ browser }) => {
  const sceneRequests: string[] = [];
  const context = await createMockedMobile(browser);
  context.on("request", (request) => {
    if (request.url().includes(sceneUrlFragment)) sceneRequests.push(request.url());
  });
  const page = await context.newPage();
  await page.goto("/");
  await expectFullScene(page);
  for (const viewport of [
    { width: 844, height: 390 },
    { width: 899, height: 700 },
    { width: 900, height: 700 },
    { width: 959, height: 700 },
    { width: 960, height: 700 },
    { width: 961, height: 700 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("[data-spline-scene] canvas")).toHaveCount(1);
  }
  expect(sceneRequests).toHaveLength(1);
  await context.close();
});

test("orientation during scene loading does not duplicate the request or canvas", async ({ browser }) => {
  let sceneRequests = 0;
  const context = await createMockedMobile(browser, async (route) => {
    sceneRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({ body: "{}", contentType: "application/json", status: 200 });
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "loading");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFullScene(page);
  expect(sceneRequests).toBe(1);
  await context.close();
});

test("six home-inner route cycles never accumulate canvas instances", async ({ browser }) => {
  let sceneRequests = 0;
  const context = await createMockedMobile(browser, (route) => {
    sceneRequests += 1;
    return route.fulfill({ body: "{}", contentType: "application/json", status: 200 });
  });
  const page = await context.newPage();
  for (let index = 0; index < 6; index += 1) {
    await page.goto("/");
    await expectFullScene(page);
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.goto("/projeler");
    await expect(page.locator("canvas")).toHaveCount(0);
  }
  expect(sceneRequests).toBe(6);
  await context.close();
});

for (const scenario of [
  { name: "reduced motion", expected: "none" as const, init: () => undefined, options: { reducedMotion: "reduce" as const } },
  { name: "Save-Data", expected: "none" as const, init: () => Object.defineProperty(navigator, "connection", { configurable: true, value: { effectiveType: "4g", saveData: true } }), options: {} },
  { name: "low memory", expected: "lite" as const, init: () => Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: 2 }), options: {} },
]) {
  test(`${scenario.name} makes zero Spline requests and zero canvas`, async ({ browser }) => {
    const context = await browser.newContext({ ...mobileDevice, ...scenario.options });
    await addSplineMock(context);
    await context.addInitScript(scenario.init);
    const requests: string[] = [];
    context.on("request", (request) => requests.push(request.url()));
    const page = await context.newPage();
    await page.goto("/");
    await expectNoSpline(page, requests, scenario.expected);
    await context.close();
  });
}

test("WebGL failure makes zero Spline requests and preserves the fallback/CTA", async ({ browser }) => {
  const context = await browser.newContext({ ...mobileDevice, reducedMotion: "no-preference" });
  await addSplineMock(context);
  await context.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  const page = await context.newPage();
  await page.goto("/");
  await expectNoSpline(page, requests, "none");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('section[data-robot-stage="hero"] a[href="/iletisim"]').first()).toBeVisible();
  await context.close();
});

for (const failure of [
  { name: "abort", handler: (route: Route) => route.abort("failed") },
  { name: "404", handler: (route: Route) => route.fulfill({ status: 404 }) },
  { name: "500", handler: (route: Route) => route.fulfill({ status: 500 }) },
]) {
  test(`scene ${failure.name} falls back and suppresses retries in the same session`, async ({ browser }) => {
    let requests = 0;
    const context = await createMockedMobile(browser, (route) => {
      requests += 1;
      return failure.handler(route);
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
    await expect(page.locator("[data-robot-fallback]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.reload();
    await page.waitForTimeout(2_000);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(requests).toBe(1);
    await context.close();
  });
}

test("offline during deferred scene loading leaves useful HTML and fallback", async ({ browser }) => {
  const context = await browser.newContext({ ...mobileDevice, reducedMotion: "no-preference" });
  await addSplineMock(context);
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await context.setOffline(true);
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none", { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await context.close();
});

test("WebGL context loss switches to the persistent fallback", async ({ browser }) => {
  const context = await createMockedMobile(browser);
  const page = await context.newPage();
  await page.goto("/");
  await expectFullScene(page);
  await page.locator("[data-spline-scene] canvas").dispatchEvent("webglcontextlost");
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await context.close();
});

test("leaving home while the scene is loading cleans up the canvas", async ({ browser }) => {
  const context = await createMockedMobile(browser, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (!route.request().isNavigationRequest()) {
      await route.fulfill({ body: "{}", contentType: "application/json", status: 200 }).catch(() => undefined);
    }
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "loading");
  await page.goto("/projeler");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await context.close();
});

test("inner routes never request the Spline scene or runtime", async ({ browser }) => {
  const context = await browser.newContext({ ...mobileDevice });
  await addSplineMock(context);
  const requests: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  const page = await context.newPage();
  for (const route of ["/hizmetler", "/projeler", "/fiyatlandirma", "/iletisim"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(requests.filter(isSplineAsset)).toEqual([]);
  await context.close();
});

test("mobile menu traps focus, closes with Escape and restores focus", async ({ browser }) => {
  const context = await browser.newContext({ ...mobileDevice, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menüyü aç" });
  await menuButton.click();
  const dialog = page.getByRole("dialog", { name: "Site menüsü" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
  await context.close();
});

test("all product routes render without console or page errors", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of allRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
  await context.close();
});

test("Vela remains first and all fixed prices remain correct", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const firstProject = page.locator("#secili-projeler article").first();
  await expect(firstProject).toContainText("Vela Windsurfing");
  await expect(firstProject.locator('a[href="https://velawindsurfing.com"]')).toBeVisible();
  for (const price of ["TL 7.000", "TL 15.000", "TL 30.000", "TL 25.000", "TL 35.000"]) {
    await expect(page.getByText(price, { exact: true }).first()).toBeVisible();
  }
});

test("mobile primary actions and content controls meet touch target sizes", async ({ browser }) => {
  const context = await browser.newContext({ ...mobileDevice, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const selectors = [
    'section[data-robot-stage="hero"] a[href="/iletisim"]',
    '#secili-projeler a[href="/projeler/vela-windsurfing"]',
    '#secili-projeler a[href="https://velawindsurfing.com"]',
    '#fiyatlandirma a[href="/fiyatlandirma"]',
    'section[data-robot-stage="final"] a[href="/iletisim"]',
    '#sss summary',
  ];
  for (const selector of selectors) {
    const targets = page.locator(selector);
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.height ?? 0, selector).toBeGreaterThanOrEqual(44);
    }
  }
  await context.close();
});

for (const viewport of targetViewports) {
  test(`touch layout has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ ...mobileDevice, reducedMotion: "reduce", viewport });
    const page = await context.newPage();
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });
}

test("200 percent reflow keeps content inside the viewport", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 640, height: 1136 } });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
