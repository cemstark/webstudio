import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { PricingCards } from "@/components/PricingCards";
import { SectionHeading } from "@/components/SectionHeading";
import { commerceFaqs } from "@/content/faqs";
import { commerceOffers, providerCostNote, quoteOffers, webOffers } from "@/content/pricing";
import { getSiteUrl, JsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Fiyatlandırma", "Web sitesi, blog ve e-ticaret hizmet bedellerini karşılaştırın; SEO ve mobil uygulama için kapsama göre teklif alın.", "/fiyatlandirma");

const catalogSchema = {
  "@context": "https://schema.org", "@type": "OfferCatalog", name: "cemwebstudio fiyatlandırma",
  url: new URL("/fiyatlandirma", getSiteUrl()).toString(),
  itemListElement: [
    ...webOffers.map((offer) => ({ "@type": "Offer", name: `Web Sitesi / Blog — ${offer.name}`, price: offer.price, priceCurrency: "TRY", description: `${offer.name} hizmet bedeli. Üçüncü taraf maliyetleri dahil değildir.`, itemOffered: { "@type": "Service", name: "Web Sitesi ve Blog" } })),
    ...commerceOffers.map((offer) => ({ "@type": "Offer", name: `E-ticaret — ${offer.name}`, price: offer.price, priceCurrency: "TRY", description: `${offer.name} hizmet bedeli. Üçüncü taraf maliyetleri dahil değildir.`, itemOffered: { "@type": "Service", name: "E-ticaret" } })),
  ],
};

export default function PricingPage() {
  return (
    <><JsonLd data={catalogSchema} /><PageHero eyebrow="FİYATLANDIRMA" title="Bütçeyi saklamayan, kapsamı uydurmayan fiyatlandırma." description="Web ve e-ticaret için başlangıç çerçevesini görün. Netleştirilmemiş entegrasyon, süre veya teslimatları paketlere eklemiyoruz." cta={{ label: "Brief Paylaş", href: "/iletisim" }} />
    <section id="web" className="section"><div className="container"><SectionHeading eyebrow="WEB SİTESİ / BLOG" title="Üç yaklaşım, tek kaynak fiyat." description={providerCostNote} /><PricingCards offers={webOffers} service="web-tasarim" /></div></section>
    <section id="eticaret" className="section sectionSurface"><div className="container"><SectionHeading eyebrow="E-TİCARET" title="Satış hedefinize uygun bir başlangıç seçin." description="Ürün sayısı, ödeme, kargo, ERP/muhasebe, üyelik ve çoklu dil/para birimi kapsamı proje brief’ine göre kesinleşir." /><PricingCards offers={commerceOffers} service="e-ticaret" /></div></section>
    <section id="teklif" className="section"><div className="container"><SectionHeading eyebrow="SEO & MOBİL" title="Hazır fiyat değil, doğru kapsam." /><div className="quoteGrid">{Object.values(quoteOffers).map((offer) => <article className="quoteCard" key={offer.code} data-stagger><p className="micro">{offer.code}</p><h3>{offer.name}</h3><p className="price">{offer.priceLabel}</p><p>{offer.audience}</p><ul className="checkList">{offer.approach.map((item) => <li key={item}>{item}</li>)}</ul><p className="providerNote">{providerCostNote}</p><Link className="textLink" href="/iletisim">Teklif İsteyin <span aria-hidden="true">↗</span></Link></article>)}</div></div></section>
    <section className="section sectionSurface"><div className="container"><SectionHeading eyebrow="E-TİCARET MALİYETLERİ" title="Sağlayıcı maliyeti, hizmet bedeli değildir." /><FaqList faqs={commerceFaqs} includeSchema /></div></section><FinalCta /></>
  );
}
