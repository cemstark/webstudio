import type { ServiceSlug } from "./services";

export const SPLINE_ROBOT_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * The robot's story, in scroll order.
 *
 * It steps aside for the two sections that have to carry the visit — the work
 * showcase and the package prices — and comes back to full presence for the
 * closing call to action.
 */
export const robotStages = [
  "hero",
  "projects",
  "services",
  "pricing",
  "process",
  "faq",
  "final",
] as const;

export type RobotStage = (typeof robotStages)[number];

export const serviceInstruments = {
  "web-tasarim": ["İçerik mimarisi", "Responsive sistem", "Özel geliştirme"],
  seo: ["Teknik temel", "Arama niyeti", "Ölçülebilir yön"],
  "mobil-uygulama": ["Keşif", "UX / UI", "Prototip · MVP"],
  "e-ticaret": ["Ürün keşfi", "Sepet", "Ödeme · entegrasyon"],
} as const satisfies Record<ServiceSlug, readonly [string, string, string]>;
