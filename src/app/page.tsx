import Image from "next/image";
import Link from "next/link";
import { ExperienceIntro } from "@/components/experience/ExperienceIntro";
import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { FaqList } from "@/components/FaqList";
import { ProcessSteps } from "@/components/ProcessSteps";
import { homeFaqs } from "@/content/faqs";
import { featuredProjects } from "@/content/projects";
import { commerceOffers, formatPrice, providerCostNote, webOffers } from "@/content/pricing";
import { services } from "@/content/services";
import { JsonLd } from "@/lib/seo";
import styles from "./home.module.css";

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
  const vela = featuredProjects[0];
  const archiveProjects = featuredProjects.slice(1);

  return (
    <div className={styles.home} data-home-experience>
      <JsonLd data={homeServicesSchema} />
      <ExperienceIntro />
      <ExperienceShell />
      <div className={styles.scrollRail} aria-hidden="true"><span /></div>

      <section className={styles.hero} data-experience-stage="hero" data-header-theme="dark">
        <div className={`container ${styles.heroInner}`}>
          <p className={`${styles.kicker} micro`}>SOLO DİJİTAL STÜDYO · İZMİT</p>
          <h1 className={styles.heroTitle}>
            <span>Cesur fikirler.</span>
            <span>Çalışan dijital</span>
            <span>deneyimler.</span>
          </h1>
          <div className={styles.heroBottom}>
            <p>Strateji, tasarım, motion ve geliştirmeyi aynı masada buluşturan web deneyimleri.</p>
            <Link className={styles.roundLink} href="/iletisim"><span>Projenizi</span><span>konuşalım ↗</span></Link>
          </div>
          <p className={`${styles.scrollCue} micro`}>KEŞFETMEK İÇİN KAYDIR <span aria-hidden="true">↓</span></p>
        </div>
      </section>

      <section className={styles.manifesto} data-experience-stage="manifesto" data-header-theme="light">
        <div className="container">
          <p className="eyebrow" data-reveal>YAKLAŞIM</p>
          <p className={styles.manifestoText} data-reveal>
            Cesur fikirleri; net strateji, güçlü görsel dil ve sağlam teknolojiyle çalışan dijital ürünlere dönüştürüyorum.
          </p>
          <div className={styles.manifestoNotes} data-reveal>
            <p>Tek bir estetik kalıba değil, markanızın hedeflerine göre şekillenen özgün deneyimler.</p>
            <p>Tasarım ve geliştirme aynı karar çizgisinde ilerler; hız, erişilebilirlik ve işlev hareketin gerisinde kalmaz.</p>
          </div>
        </div>
      </section>

      <section className={styles.services} data-experience-stage="services" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">DÖRT DİSİPLİN</p>
            <h2>Tek bir dijital sistem.</h2>
            <p>İhtiyacınız kadar teknoloji, hedefiniz kadar netlik.</p>
          </div>
          <div className={styles.serviceChapters}>
            {services.map((service, index) => (
              <article className={styles.serviceChapter} key={service.slug} data-reveal>
                <p className="micro">0{index + 1}</p>
                <div>
                  <h3>{service.shortTitle}</h3>
                  <p>{service.summary}</p>
                </div>
                <div className={styles.chapterAction}>
                  <p>{service.priceSignal}</p>
                  <Link className="textLink" href={`/hizmetler/${service.slug}`}>Kapsamı keşfet <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.projects} data-experience-stage="projects" data-header-theme="dark">
        <div className="container">
          <div className={styles.projectsHeading} data-reveal>
            <p className="eyebrow">SEÇİLİ PROJELER</p>
            <h2>İş konuşsun.</h2>
            <Link className={styles.lightLink} href="/projeler">Tüm proje arşivi ↗</Link>
          </div>
          <article className={styles.featuredProject} data-reveal>
            <Link className={styles.velaVisual} href={`/projeler/${vela.slug}`} aria-label="Vela Windsurfing proje detayını gör">
              {vela.image ? <Image src={vela.image.src} alt={vela.image.alt} width={vela.image.width} height={vela.image.height} sizes="(min-width: 900px) 88vw, 100vw" priority /> : null}
              <span>Projeyi gör ↗</span>
            </Link>
            <div className={styles.projectInfo}>
              <div><p className="micro">01 · {vela.year} · {vela.statusLabel}</p><h3>{vela.name}</h3></div>
              <div><p>{vela.category}</p><p>{vela.description}</p>{vela.url ? <a href={vela.url} target="_blank" rel="noopener noreferrer">Canlı site ↗</a> : null}</div>
            </div>
          </article>
          <div className={styles.archiveGrid}>
            {archiveProjects.map((project, index) => (
              <article className={styles.archiveCard} key={project.slug} data-reveal>
                <Link href={`/projeler/${project.slug}`} className={styles.archiveVisual}>
                  <span className="micro">0{index + 2} · ARŞİV</span>
                  <strong>{project.name}</strong>
                  <small>İçerik hazırlanıyor</small>
                </Link>
                <p>{project.category}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.pricing} data-experience-stage="pricing" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">FİYAT SİNYALİ</p>
            <h2>Önce çerçeveyi görün.</h2>
            <p>Fiyatlar hizmet bedelidir. Kapsam büyüdükçe neyin değiştiğini açıkça karşılaştırın.</p>
          </div>
          <div className={styles.priceSignals}>
            <article data-reveal>
              <p className="micro">WEB SİTESİ / BLOG</p>
              <h3>{formatPrice(webOffers[0].price)}<span>’den başlayan hizmet bedeli</span></h3>
              <ol>{webOffers.map((offer) => <li key={offer.code}><span>{offer.name}</span><strong>{formatPrice(offer.price)}</strong></li>)}</ol>
            </article>
            <article data-reveal>
              <p className="micro">E-TİCARET</p>
              <h3>{formatPrice(commerceOffers[0].price)}<span>’den başlayan hizmet bedeli</span></h3>
              <ol>{commerceOffers.map((offer) => <li key={offer.code}><span>{offer.name}</span><strong>{formatPrice(offer.price)}</strong></li>)}</ol>
            </article>
          </div>
          <div className={styles.pricingFoot} data-reveal>
            <p>{providerCostNote}</p>
            <Link className="button" href="/fiyatlandirma">Paketleri karşılaştır <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.process} data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal><p className="eyebrow">SÜREÇ</p><h2>Dört adım. Tek sorumlu.</h2><p>Belirsizliği azaltan, kararları görünür kılan bir üretim ritmi.</p></div>
          <div data-reveal><ProcessSteps /></div>
          <div className={styles.solo} data-reveal>
            <p className="micro">SOLO STÜDYO</p>
            <p>Projeyi konuştuğunuz kişi, onu tasarlar ve geliştirir.</p>
            <div><span>Doğrudan iletişim</span><span>Tek sorumluluk</span><span>Tutarlı kararlar</span></div>
            <Link className="textLink" href="/hakkimda">Cem ile tanışın ↗</Link>
          </div>
        </div>
      </section>

      <section className={styles.faq} data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal><p className="eyebrow">KISA SSS</p><h2>Başlamadan önce netleşsin.</h2></div>
          <div data-reveal><FaqList faqs={homeFaqs} includeSchema /></div>
        </div>
      </section>

      <section className={styles.final} data-experience-stage="final" data-header-theme="dark">
        <div className={`container ${styles.finalInner}`}>
          <p className="eyebrow">YENİ PROJE</p>
          <h2>Birlikte bir şey üretelim.</h2>
          <p>İlk adım, hedefinizi açıkça konuşmak.</p>
          <Link className={styles.finalLink} href="/iletisim">Projenizi başlatın <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}
