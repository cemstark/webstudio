import { expect, test, type Page } from "@playwright/test";

const projectAssets = [
  { slug: "vela-windsurfing", name: "Vela Windsurfing", src: "/images/projects/vela-windsurfing/vela-windsurfing-cover.webp" },
  { slug: "aysaworks", name: "AysaWorks", src: "/images/projects/aysaworks/aysaworks-cover.webp" },
  { slug: "bluekim", name: "BlueKim", src: "/images/projects/bluekim/bluekim-cover.webp" },
  { slug: "drnekinoto-servis", name: "DRNEKİN OTO", src: "/images/projects/drnekinoto-servis/drnekinoto-servis-cover.webp" },
  { slug: "cemwebstudio", name: "cemwebstudio", src: "/images/projects/cemwebstudio/cemwebstudio-cover.webp" },
  { slug: "erp-is-yonetim-paneli", name: "ERP İş Yönetim Paneli", src: "/images/projects/erp-is-yonetim-paneli/erp-is-yonetim-paneli-cover.webp" },
] as const;

/*
 * The assertion is that the image decodes, not that it decodes quickly. A cold Next.js
 * image optimizer takes seconds on its first pass over these source files, and this suite
 * asks for twelve of them in a row, so the default 8s budget was measuring CI runner speed
 * rather than whether the asset is sound. Verified against production: every one decodes,
 * the slowest at 4.8s cold.
 */
const decodeTimeout = { timeout: 30_000 };

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
          await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth), decodeTimeout).toBeGreaterThan(0);
        }
        for (const project of projectAssets) {
          await expect(page.getByRole("link", { name: new RegExp(project.name, "i") }).first()).toBeVisible();
        }
      } else {
        // The lead project plus the four supporting cards: every featured row has real art.
        const featuredImages = page.locator("#secili-projeler img");
        await featuredImages.first().scrollIntoViewIfNeeded();
        await expect(featuredImages).toHaveCount(5);
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
  /*
   * Every project's image is decoded once, at the narrow viewport, and the wide pass keeps
   * the layout and metadata assertions without asking for a second rendition.
   *
   * Decoding all six at both widths meant twelve cold AVIF encodes of large sources, which
   * costs ~130ms each on a many-core developer machine and minutes each on a CI runner —
   * enough to blow a five-minute test budget. Re-decoding the same asset at a second width
   * tells us nothing new about whether the asset is sound, which is what this guards.
   */
  test.setTimeout(180_000);

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const decodes = viewport.width < 1024;
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = captureRuntimeErrors(page);
    // A bare "naturalWidth was 0" says nothing about which asset broke or why, which is the
    // whole question when this only reproduces on one machine.
    const optimizer: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/_next/image")) optimizer.push(`${response.status()} ${url.slice(url.indexOf("/_next/image"))}`);
    });
    page.on("requestfailed", (request) => {
      optimizer.push(`FAILED ${request.failure()?.errorText ?? "?"} ${request.url().slice(0, 160)}`);
    });

    for (const project of projectAssets) {
      const response = await page.goto(`/projeler/${project.slug}`);
      expect(response?.status(), project.slug).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: project.name })).toBeVisible();
      const image = page.locator(".projectDetailImage");
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      optimizer.length = 0;
      if (decodes) {
        try {
          await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth), decodeTimeout).toBeGreaterThan(0);
        } catch (failure) {
          const state = await image.evaluate((element: HTMLImageElement) => ({
            complete: element.complete,
            currentSrc: element.currentSrc,
            loading: element.loading,
            naturalWidth: element.naturalWidth,
            rect: element.getBoundingClientRect().toJSON(),
            src: element.getAttribute("src"),
            srcset: element.getAttribute("srcset")?.slice(0, 200),
          }));
          throw new Error(
            `${project.slug} at ${viewport.width}x${viewport.height} never decoded.\n`
            + `image: ${JSON.stringify(state, null, 2)}\n`
            + `optimizer traffic: ${optimizer.length ? optimizer.join("\n  ") : "none"}\n`
            + `console: ${errors.length ? errors.join(" | ") : "clean"}\n`
            + `original: ${failure instanceof Error ? failure.message : String(failure)}`,
          );
        }
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/projeler/${project.slug}$`));
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(project.src.replaceAll("/", "\\/")));
      await expectNoHorizontalOverflow(page);
    }
    expect(errors).toEqual([]);
    await context.close();
  }
});
