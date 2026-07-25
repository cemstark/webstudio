import { expect, test } from "@playwright/test";

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

test("reduced motion keeps hero content visible and disables WebGL", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
  await expect(page.locator("canvas")).toHaveCount(0);
  await context.close();
});

test("WebGL capability failure falls back without hiding CTAs", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = ((type: string) => {
      if (type === "webgl" || type === "webgl2") return null;
      return null;
    }) as typeof HTMLCanvasElement.prototype.getContext;
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.mouse.wheel(0, 1);
  await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
  await expect(page.getByRole("link", { name: /Projenizi konuşalım/ })).toBeVisible();
  await context.close();
});

test("full profile renders and scroll transforms the WebGL signature", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const experience = page.locator("[data-experience-profile]");
  await page.mouse.wheel(0, 1);
  await expect(experience).toHaveAttribute("data-experience-profile", "full");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(1200);
  const heroFrame = await canvas.screenshot({ path: "qa/screenshots/1440x900/webgl-hero.png" });
  await page.locator('[data-experience-stage="projects"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
  const projectFrame = await canvas.screenshot({ path: "qa/screenshots/1440x900/webgl-projects.png" });
  expect(heroFrame.equals(projectFrame)).toBe(false);
});

test("critical routes render without console errors or missing assets", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  const routes = ["/", "/fiyatlandirma", "/projeler", "/projeler/vela-windsurfing", "/iletisim"];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
