import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ timeout: 180_000 });

const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;

const stages = [
  ["service-web", "service-01-web-tasarim"],
  ["service-seo", "service-02-seo"],
  ["service-mobile", "service-03-mobil-uygulama"],
  ["service-commerce", "service-04-e-ticaret"],
  ["projects", "vela-proje-portali"],
  ["pricing", "fiyatlandirma"],
  ["process", "surec"],
  ["final", "final-cta"],
] as const;

async function captureViewport(page: Page, path: string) {
  await page.waitForTimeout(280);
  await page.screenshot({ path, animations: "disabled" });
}

for (const viewport of viewports) {
  test(`robot story visual QA at ${viewport.name}`, async ({ browser }) => {
    const directory = `qa/robot-transformation/after/${viewport.name}`;
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await page.goto("/");
    if (viewport.width >= 1000) {
      await page.mouse.wheel(0, 1);
      await expect(page.locator("[data-scene-status]")).toHaveAttribute("data-scene-status", "ready", { timeout: 20_000 });
      await page.waitForTimeout(750);
    }
    await captureViewport(page, `${directory}/hero.png`);

    for (const [stage, filename] of stages) {
      await page.locator(`[data-robot-stage="${stage}"]:not([data-experience-profile])`).evaluate((element) => element.scrollIntoView({ block: "start" }));
      await expect(page.locator("[data-experience-profile]")).toHaveAttribute("data-robot-stage", stage);
      await captureViewport(page, `${directory}/${filename}.png`);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await captureViewport(page, `${directory}/menu-open.png`);
    await context.close();

    const reducedContext = await browser.newContext({ reducedMotion: "reduce", viewport: { width: viewport.width, height: viewport.height } });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto("/");
    await expect(reducedPage.locator("[data-experience-profile]")).toHaveAttribute("data-experience-profile", "none");
    await captureViewport(reducedPage, `${directory}/reduced-motion.png`);
    await reducedContext.close();

    const blockedContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    await blockedContext.route("**/scene.splinecode", (route) => route.abort("failed"));
    const blockedPage = await blockedContext.newPage();
    await blockedPage.goto("/");
    if (viewport.width >= 1000) await blockedPage.mouse.wheel(0, 1);
    await expect(blockedPage.locator("[data-robot-fallback]")).toBeVisible();
    await captureViewport(blockedPage, `${directory}/spline-blocked-fallback.png`);
    await blockedContext.close();
  });
}
