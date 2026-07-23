export const site = {
  name: "cemwebstudio",
  owner: "Cem Yıldız",
  defaultUrl: "https://cemwebstudio.com",
  locale: "tr_TR",
  language: "tr",
  location: "İzmit, Kocaeli",
  description:
    "Cem Yıldız'ın web tasarım, SEO, mobil uygulama ve e-ticaret odaklı solo dijital stüdyosu.",
} as const;

export const navigation = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Projeler", href: "/projeler" },
  { label: "Fiyatlandırma", href: "/fiyatlandirma" },
  { label: "Hakkımda", href: "/hakkimda" },
] as const;

export const routes = [
  "/", "/hizmetler", "/hizmetler/web-tasarim", "/hizmetler/seo",
  "/hizmetler/mobil-uygulama", "/hizmetler/e-ticaret", "/fiyatlandirma",
  "/projeler", "/surec", "/hakkimda", "/iletisim", "/gizlilik", "/cerez-politikasi",
] as const;
