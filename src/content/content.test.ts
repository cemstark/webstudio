import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commerceOffers, providerCostNote, webOffers } from "./pricing";
import { featuredProjects, getProject, projects } from "./projects";
import { contact } from "./site";

const verifiedProjectImages = {
  aysaworks: "/images/projects/aysaworks/aysaworks-cover.webp",
  bluekim: "/images/projects/bluekim/bluekim-cover.webp",
  cemwebstudio: "/images/projects/cemwebstudio/cemwebstudio-cover.webp",
  "drnekinoto-servis": "/images/projects/drnekinoto-servis/drnekinoto-servis-cover.webp",
  "vela-windsurfing": "/images/projects/vela-windsurfing/vela-windsurfing-cover.webp",
} as const;

describe("production content invariants", () => {
  it("keeps web package prices exact", () => { expect(webOffers.map((offer) => offer.price)).toEqual([7000, 15000, 30000]); });
  it("keeps commerce package prices exact", () => { expect(commerceOffers.map((offer) => offer.price)).toEqual([15000, 25000, 35000]); });
  it("keeps Vela Windsurfing first, featured and live", () => { const vela = getProject("vela-windsurfing"); expect(featuredProjects[0]?.slug).toBe("vela-windsurfing"); expect(vela?.featured).toBe(true); expect(vela?.status).toBe("live"); expect(vela?.url).toBe("https://velawindsurfing.com"); expect(vela?.image?.src).toContain("vela-windsurfing"); });
  it("maps each verified project to its public WebP and clears its missing-asset flag", () => {
    for (const [slug, imageSrc] of Object.entries(verifiedProjectImages)) {
      const project = getProject(slug);
      expect(project?.image?.src).toBe(imageSrc);
      expect(project?.missingAssets).not.toBe(true);
      expect(existsSync(join(process.cwd(), "public", imageSrc))).toBe(true);
    }
  });
  it("creates one separate ERP archive without assigning the source to either uncertain placeholder", () => {
    const erp = getProject("erp-is-yonetim-paneli");
    expect(erp).toMatchObject({ status: "archive", featured: false });
    expect(erp?.url).toBeUndefined();
    expect(erp?.image?.src).toBe("/images/projects/erp-is-yonetim-paneli/erp-is-yonetim-paneli-cover.webp");
    expect(getProject("atlas-panel-script")?.missingAssets).toBe(true);
    expect(getProject("drn-servis-paneli")?.missingAssets).toBe(true);
    expect(existsSync(join(process.cwd(), "public", "erp-business-management-dashboard.webp"))).toBe(false);
  });
  it("keeps project slugs unique", () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
  });
  it("describes third-party costs separately from the service fee", () => { expect(providerCostNote).toContain("hizmet bedelidir"); expect(providerCostNote).toContain("Alan adı"); expect(providerCostNote).toContain("hosting"); expect(providerCostNote).toContain("üçüncü taraf"); });
  it("keeps the published number, its dial target and the WhatsApp link in agreement", () => {
    expect(contact.phone).toBe("+90 530 411 50 22");
    expect(contact.phoneHref).toBe(contact.phone.replaceAll(" ", ""));
    expect(contact.email).toBe("info@cemwebstudio.com");
    expect(contact.whatsappUrl.startsWith(`https://wa.me/${contact.phoneHref.slice(1)}?text=`)).toBe(true);
  });
});
