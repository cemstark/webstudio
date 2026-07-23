export type Faq = { question: string; answer: string };
export const homeFaqs = [
  { question: "Projeye nasıl başlıyoruz?", answer: "Kısa brief formundan hedefi ve kapsamı paylaşırsınız. Ardından ihtiyaçları netleştirip uygun yaklaşımı ve teklifi birlikte belirleriz." },
  { question: "Solo stüdyo ile çalışmanın farkı nedir?", answer: "Proje boyunca doğrudan Cem ile iletişim kurarsınız. Tasarım ve geliştirme kararları tek sorumluda birleştiği için bilgi kaybı ve gereksiz devir azalır." },
  { question: "Gösterilen fiyatlara üçüncü taraf maliyetleri dahil mi?", answer: "Hayır. Gösterilen tutarlar hizmet bedelidir; alan adı, hosting, lisans ve projeye bağlı sağlayıcı maliyetleri ayrıca hesaplanır." },
] as const satisfies readonly Faq[];
export const commerceFaqs = [
  { question: "E-ticaret paketinin kapsamı nasıl kesinleşir?", answer: "Ürün sayısı, ödeme, kargo, ERP veya muhasebe, üyelik, çoklu dil ve para birimi gibi ihtiyaçlar brief sonrasında değerlendirilir ve teklif kapsamına yazılır." },
  { question: "Hangi maliyetler ayrıca hesaplanır?", answer: "Ödeme sağlayıcısı kurulum veya komisyonları, kargo ve ERP/muhasebe entegrasyonları, SMS/e-posta servisleri, premium eklentiler, özel font, stok görsel, lisanslı içerik ve dış API/SaaS abonelikleri sağlayıcıya ve kullanıma göre ayrıca hesaplanır." },
] as const satisfies readonly Faq[];
