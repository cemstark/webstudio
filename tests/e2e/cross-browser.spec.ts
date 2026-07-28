import { expect, test } from "@playwright/test";

function isSplineAsset(url: string) {
  return /SplineRobotScene|splinetool|spline\.design|scene\.splinecode/i.test(url);
}

test("home fallback and core content work without Spline", async ({ page }) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-robot-fallback]")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  const firstProject = page.locator("#secili-projeler article").first();
  await expect(firstProject).toContainText("Vela Windsurfing");
  await expect(firstProject.locator('a[href="https://velawindsurfing.com"]')).toBeVisible();
  // The commerce packages sit behind their own tab once the switcher hydrates.
  await page.getByRole("tab", { name: "E-ticaret" }).click();
  await expect(page.getByRole("tabpanel").getByText("TL 35.000", { exact: true })).toBeVisible();
  expect(requests.filter(isSplineAsset)).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile menu, FAQ keyboard and reflow remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menüyü aç" });
  await menuButton.click();
  await expect(page.getByRole("dialog", { name: "Site menüsü" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();

  const details = page.locator('section[data-robot-stage="faq"] details').nth(1);
  await details.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
