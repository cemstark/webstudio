import { expect, test } from "@playwright/test";

const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
] as const;

const pages = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/fiyatlandirma" },
  { name: "projects", path: "/projeler" },
  { name: "vela", path: "/projeler/vela-windsurfing" },
  { name: "contact", path: "/iletisim" },
] as const;

for (const viewport of viewports) {
  for (const entry of pages) {
    test(`${entry.name} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(entry.path);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `qa/screenshots/${viewport.name}/${entry.name}.png`, fullPage: true, animations: "disabled" });
    });
  }
}
