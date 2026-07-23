export type PricedOffer = {
  code: string;
  name: "Başlangıç" | "Orta" | "Premium";
  price: number;
  currency: "TRY";
  audience: string;
  approach: readonly string[];
};

export type QuoteOffer = {
  code: string;
  name: string;
  priceLabel: "Kapsama göre teklif";
  audience: string;
  approach: readonly string[];
};

export const providerCostNote =
  "Gösterilen tutar hizmet bedelidir. Alan adı, hosting, premium tema/eklenti lisansları ve projeye bağlı üçüncü taraf sağlayıcı maliyetleri ayrıca hesaplanır ve teklife eklenir.";

export const webOffers = [
  { code: "WEB-START", name: "Başlangıç", price: 7000, currency: "TRY", audience: "Hızlı ve ekonomik biçimde yayına çıkmak isteyen içerik odaklı siteler ve bloglar.", approach: ["WordPress tabanlı", "Hazır tema kullanımı"] },
  { code: "WEB-MID", name: "Orta", price: 15000, currency: "TRY", audience: "Kendine özgü bir dijital yüz ve dengeli hareket isteyen markalar.", approach: ["Custom uygulama", "Özel tasarım", "Az ve ölçülü animasyon"] },
  { code: "WEB-PREMIUM", name: "Premium", price: 30000, currency: "TRY", audience: "Marka hissini güçlü bir deneyimle anlatmak isteyen işletmeler.", approach: ["Custom uygulama", "Özel tasarım", "Markaya uygun, performans ve erişilebilirliği koruyan daha yoğun animasyon"] },
] as const satisfies readonly PricedOffer[];

export const commerceOffers = [
  { code: "SHOP-START", name: "Başlangıç", price: 15000, currency: "TRY", audience: "Hazır tema yaklaşımıyla satışa başlamak isteyen işletmeler.", approach: ["WordPress + WooCommerce tabanlı", "Hazır tema yaklaşımı"] },
  { code: "SHOP-MID", name: "Orta", price: 25000, currency: "TRY", audience: "Mağazasını markasına göre şekillendirmek isteyen işletmeler.", approach: ["Custom / özel tasarım", "Az ve ölçülü animasyon"] },
  { code: "SHOP-PREMIUM", name: "Premium", price: 35000, currency: "TRY", audience: "Ürün keşfini özgün bir marka deneyimine dönüştürmek isteyen işletmeler.", approach: ["Custom / özel tasarım", "Markaya uygun daha yoğun animasyon", "Ürün keşfi, sepet ve checkout performansını koruyan hareket sistemi"] },
] as const satisfies readonly PricedOffer[];

export const quoteOffers = {
  seo: { code: "SEO-CUSTOM", name: "SEO Çalışması", priceLabel: "Kapsama göre teklif", audience: "Arama görünürlüğünü sağlam bir teknik ve içerik temeliyle büyütmek isteyen markalar.", approach: ["Audit", "Teknik SEO", "İçerik ve anahtar kelime", "Aylık çalışma seçenekleri"] },
  mobile: { code: "APP-CUSTOM", name: "Mobil Uygulama", priceLabel: "Kapsama göre teklif", audience: "Fikrini doğrulanabilir bir mobil ürüne dönüştürmek isteyen ekipler.", approach: ["Keşif", "UX/UI", "Prototip", "MVP ve geliştirme kapsamı"] },
} as const satisfies Record<string, QuoteOffer>;

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0, currencyDisplay: "code" })
    .format(price).replace("TRY", "TL").trim();
