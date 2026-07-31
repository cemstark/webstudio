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

/**
 * Single source for every reachable channel. The hero, the footer and the contact API's
 * fallback recipient all read from here, so a changed number is one edit rather than four.
 */
export const contact = {
  /** Human formatting for the visible label. */
  phone: "+90 530 411 50 22",
  /** E.164 without spaces — what `tel:` and wa.me both need. */
  phoneHref: "+905304115022",
  email: "info@cemwebstudio.com",
  whatsappUrl:
    "https://wa.me/905304115022?text=" +
    encodeURIComponent("Merhaba, cemwebstudio üzerinden yazıyorum. Bir proje hakkında konuşmak istiyorum."),
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
