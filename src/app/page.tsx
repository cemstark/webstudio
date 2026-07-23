import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { FinalCta } from "@/components/FinalCta";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { homeFaqs } from "@/content/faqs";
import { featuredProjects } from "@/content/projects";
import { commerceOffers, formatPrice, webOffers } from "@/content/pricing";
import { services } from "@/content/services";
import { JsonLd } from "@/lib/seo";

const homeServicesSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "cemwebstudio hizmetleri",
  itemListElement: services.map((service) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: service.shortTitle, description: service.summary },
  })),
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeServicesSchema} />
      <section className="pageHero section">
        <div className="container">
          <p className="eyebrow reveal">SOLO DİJİTAL STÜDYO · İZMİT</p>
          <h1 className="display reveal delayOne">Fikrinizi çalışan bir dijital ürüne dönüştürün.</h1>
          <div className="heroLower reveal delayTwo">
            <p className="lead">Web sitesi, SEO, mobil uygulama ve e-ticaret projelerinde stratejiden yayına kadar doğrudan Cem ile çalışın.</p>
            <div>
              <Link className="button" href="/iletisim">Proje Başlat <span aria-hidden="true">↗</span></Link>
              <Link className="textLink" href="/projeler">Projeleri Gör <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="HİZMETLER" title="İhtiyacınız kadar teknoloji, hedefiniz kadar netlik." description="Jargonla değil, kullanıcı ve iş sonucu üzerinden konuşan dört odak alanı." />
          <div className="cardGrid">
            {services.map((service, index) => (
              <article className="serviceCard" key={service.slug}>
                <div><p className="micro">0{index + 1}</p><h3>{service.shortTitle}</h3></div>
                <div><p>{service.summary}</p><Link className="textLink" href={`/hizmetler/${service.slug}`}>Hizmeti Gör <span aria-hidden="true">↗</span></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionSurface">
        <div className="container">
          <SectionHeading eyebrow="SEÇİLİ PROJELER" title="Yayına çıkan işler, saklanmayan süreçler." description="Yeni Vela Windsurfing projesi ve içerikleri tamamlandıkça genişleyecek proje arşivi." />
          <ProjectGrid items={featuredProjects} priorityFirst />
          <div style={{ marginTop: "3rem" }}><Link className="textLink" href="/projeler">Tüm Projeler <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div><p className="eyebrow">BAŞLANGIÇ SİNYALİ</p><h2>Önce bütçe çerçevesini görün.</h2></div>
          <div className="stack">
            <div className="quoteCard"><p className="micro">WEB SİTESİ / BLOG</p><p className="price"><span>Başlangıç hizmet bedeli</span>{formatPrice(webOffers[0].price)}</p></div>
            <div className="quoteCard"><p className="micro">E-TİCARET</p><p className="price"><span>Başlangıç hizmet bedeli</span>{formatPrice(commerceOffers[0].price)}</p></div>
            <p>Alan adı, hosting, lisanslar ve projeye bağlı üçüncü taraf maliyetleri ayrıca hesaplanır.</p>
            <Link className="textLink" href="/fiyatlandirma">Paketleri Karşılaştır <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="section sectionSurface">
        <div className="container"><SectionHeading eyebrow="SÜREÇ" title="Dört adım. Tek sorumlu. Açık kararlar." /><ProcessSteps /></div>
      </section>

      <section className="section">
        <div className="container split">
          <div><p className="eyebrow">SOLO STÜDYO</p><p className="largeStatement">Strateji, tasarım ve geliştirme aynı masada.</p></div>
          <div className="stack"><p className="lead">Arada hesap yöneticisi ya da kopuk ekipler yok. İhtiyacı konuştuğunuz kişi işi tasarlar ve geliştirir.</p><ul className="numberList"><li>Doğrudan iletişim</li><li>Tek ve görünür sorumluluk</li><li>Daha hızlı, tutarlı kararlar</li></ul><Link className="textLink" href="/hakkimda">Cem ile Tanışın <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="section sectionSurface">
        <div className="container"><SectionHeading eyebrow="KISA SSS" title="Başlamadan önce netleşsin." /><FaqList faqs={homeFaqs} includeSchema /></div>
      </section>
      <FinalCta />
    </>
  );
}
