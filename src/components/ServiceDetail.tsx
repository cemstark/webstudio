import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { FinalCta } from "@/components/FinalCta";
import { PageHero } from "@/components/PageHero";
import { PricingCards } from "@/components/PricingCards";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { commerceFaqs, homeFaqs, type Faq } from "@/content/faqs";
import { projects } from "@/content/projects";
import { commerceOffers, providerCostNote, quoteOffers, webOffers } from "@/content/pricing";
import type { Service } from "@/content/services";
import { breadcrumbSchema, getSiteUrl, JsonLd } from "@/lib/seo";

const serviceFaqs = (service: Service): readonly Faq[] => service.slug === "e-ticaret" ? commerceFaqs : [
  { question: `${service.shortTitle} projesinin kapsamı nasıl belirlenir?`, answer: "Hedef, mevcut durum ve gerekli çıktılar brief ile netleştirilir. Teklif yalnızca doğrulanan ihtiyaçları kapsar." },
  ...homeFaqs.slice(0, 2),
];

export function ServiceDetail({ service }: { service: Service }) {
  const relatedProjects = projects.filter((project) => service.projectSlugs.includes(project.slug));
  const pricedOffers = service.slug === "web-tasarim" ? webOffers : service.slug === "e-ticaret" ? commerceOffers : undefined;
  const quoteOffer = service.slug === "seo" ? quoteOffers.seo : service.slug === "mobil-uygulama" ? quoteOffers.mobile : undefined;
  const faqs = serviceFaqs(service);
  const schema = {
    "@context": "https://schema.org", "@type": "Service", name: service.shortTitle,
    description: service.summary, provider: { "@type": "ProfessionalService", name: "cemwebstudio", url: getSiteUrl().toString() },
    offers: pricedOffers ? pricedOffers.map((offer) => ({ "@type": "Offer", priceCurrency: "TRY", price: offer.price, description: `${offer.name} paketinin hizmet bedelidir; üçüncü taraf maliyetlerini içermez.` })) : { "@type": "Offer", description: "Kapsama göre teklif" },
  };
  const breadcrumb = breadcrumbSchema([{ name: "Ana Sayfa", path: "/" }, { name: "Hizmetler", path: "/hizmetler" }, { name: service.shortTitle, path: `/hizmetler/${service.slug}` }]);

  return (
    <>
      <JsonLd data={schema} />
      <JsonLd data={breadcrumb} />
      <PageHero eyebrow={service.eyebrow} title={service.title} description={service.promise} priceSignal={service.priceSignal} cta={{ label: "Brief Paylaş", href: `/iletisim?service=${service.slug}` }} />
      <section className="section"><div className="container split"><div><p className="eyebrow">KİMLER İÇİN?</p><h2>Doğru probleme odaklanan kapsam.</h2></div><div><ul className="numberList">{service.audience.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section className="section sectionSurface"><div className="container"><SectionHeading eyebrow="KAPSAM" title="İhtiyacı görünür çıktılara çevirin." description={service.summary} /><div className="cardGrid">{service.deliverables.map((item, index) => <article className="serviceCard" key={item}><div><p className="micro">0{index + 1}</p><h3>{item}</h3></div></article>)}</div></div></section>
      <section className="section"><div className="container"><SectionHeading eyebrow="ÇALIŞMA SÜRECİ" title="Her kararın nedenini bilin." /><ProcessSteps /></div></section>
      <section className="section sectionSurface"><div className="container"><SectionHeading eyebrow="FİYAT" title={pricedOffers ? "Başlangıçtan premium deneyime." : "Kapsam netleşsin, teklif ona göre oluşsun."} />{pricedOffers && <PricingCards offers={pricedOffers} service={service.slug} />}{quoteOffer && <div className="quoteGrid"><article className="quoteCard"><p className="micro">{quoteOffer.code}</p><h3>{quoteOffer.name}</h3><p className="price">{quoteOffer.priceLabel}</p><p>{quoteOffer.audience}</p><ul className="checkList">{quoteOffer.approach.map((item) => <li key={item}>{item}</li>)}</ul><p className="providerNote">{providerCostNote}</p><Link className="textLink" href={`/iletisim?service=${service.slug}`}>Teklif İsteyin <span aria-hidden="true">↗</span></Link></article></div>}</div></section>
      {relatedProjects.length > 0 && <section className="section"><div className="container"><SectionHeading eyebrow="İLGİLİ PROJELER" title="Benzer ihtiyaçlara yakın işler." /><ProjectGrid items={relatedProjects} /></div></section>}
      <section className="section"><div className="container"><SectionHeading eyebrow="SSS" title="Kapsamı açık konuşalım." /><FaqList faqs={faqs} includeSchema /></div></section>
      <FinalCta title={`${service.shortTitle} projenizin ilk kararını birlikte verelim.`} />
    </>
  );
}
