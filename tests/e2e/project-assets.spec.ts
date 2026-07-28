import { expect, test, type Page } from "@playwright/test";

const projectAssets = [
  { slug: "vela-windsurfing", name: "Vela Windsurfing", src: "/images/projects/vela-windsurfing/vela-windsurfing-cover.webp" },
  { slug: "aysaworks", name: "AysaWorks", src: "/images/projects/aysaworks/aysaworks-cover.webp" },
  { slug: "bluekim", name: "BlueKim", src: "/images/projects/bluekim/bluekim-cover.webp" },
  { slug: "drnekinoto-servis", name: "DRNEKİN OTO", src: "/images/projects/drnekinoto-servis/drnekinoto-servis-cover.webp" },
  { slug: "cemwebstudio", name: "cemwebstudio", src: "/images/projects/cemwebstudio/cemwebstudio-cover.webp" },
  { slug: "erp-is-yonetim-paneli", name: "ERP İş Yönetim Paneli", src: "/images/projects/erp-is-yonetim-paneli/erp-is-yonetim-paneli-cover.webp" },
] as const;

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || /next.image|hydration|preload/i.test(message.text())) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(fitsViewport).toBe(true);
}

test("all public project assets return WebP responses", async ({ request }) => {
  for (const project of projectAssets) {
    const response = await request.get(project.src);
    expect(response.status(), project.src).toBe(200);
    expect(response.headers()["content-type"], project.src).toContain("image/webp");
  }
  const rawErp = await request.get("/images/projects/erp-business-management-dashboard.webp");
  expect(rawErp.status()).toBe(404);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const) {
  for (const route of ["/", "/projeler"] as const) {
    test(`${route} renders project imagery at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      const errors = captureRuntimeErrors(page);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      if (route === "/projeler") {
        const projectImages = page.locator(".projectCard img");
        await expect(projectImages).toHaveCount(projectAssets.length);
        for (let index = 0; index < await projectImages.count(); index += 1) {
          const image = projectImages.nth(index);
          await image.scrollIntoViewIfNeeded();
          await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
        }
        for (const project of projectAssets) {
          await expect(page.getByRole("link", { name: new RegExp(project.name, "i") }).first()).toBeVisible();
        }
      } else {
        const featuredImages = page.locator("#secili-projeler img");
        await featuredImages.first().scrollIntoViewIfNeeded();
        await expect(featuredImages).toHaveCount(3);
      }
      await page.screenshot({
        fullPage: true,
        path: `qa/screenshots/project-assets/${testInfo.project.name}/${viewport.width}x${viewport.height}/${route === "/" ? "home" : "projects"}.png`,
      });
      expect(errors).toEqual([]);
    });
  }
}

test("every changed project detail is responsive and exposes matching SEO metadata", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = captureRuntimeErrors(page);
    for (const project of projectAssets) {
      const response = await page.goto(`/projeler/${project.slug}`);
      expect(response?.status(), project.slug).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: project.name })).toBeVisible();
      const image = page.locator(".projectDetailImage");
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/projeler/${project.slug}$`));
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(project.src.replaceAll("/", "\\/")));
      await expectNoHorizontalOverflow(page);
    }
    expect(errors).toEqual([]);
    await context.close();
  }
});
