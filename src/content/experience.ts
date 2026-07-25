import type { ServiceSlug } from "./services";

export const SPLINE_ROBOT_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export const robotStages = [
  "hero",
  "manifesto",
  "service-web",
  "service-seo",
  "service-mobile",
  "service-commerce",
  "projects",
  "pricing",
  "process",
  "faq",
  "final",
] as const;

export type RobotStage = (typeof robotStages)[number];

export const serviceStageBySlug = {
  "web-tasarim": "service-web",
  seo: "service-seo",
  "mobil-uygulama": "service-mobile",
  "e-ticaret": "service-commerce",
} as const satisfies Record<ServiceSlug, RobotStage>;

export const serviceInstruments = {
  "web-tasarim": ["İçerik mimarisi", "Responsive sistem", "Özel geliştirme"],
  seo: ["Teknik temel", "Arama niyeti", "Ölçülebilir yön"],
  "mobil-uygulama": ["Keşif", "UX / UI", "Prototip · MVP"],
  "e-ticaret": ["Ürün keşfi", "Sepet", "Ödeme · entegrasyon"],
} as const satisfies Record<ServiceSlug, readonly [string, string, string]>;
