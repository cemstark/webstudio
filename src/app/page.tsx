import Image from "next/image";
import Link from "next/link";
import { ExperienceIntro } from "@/components/experience/ExperienceIntro";
import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { FaqList } from "@/components/FaqList";
import { ProcessSteps } from "@/components/ProcessSteps";
import { serviceInstruments, serviceStageBySlug } from "@/content/experience";
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

      <section className={styles.hero} data-robot-stage="hero" data-header-theme="dark">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={`${styles.kicker} micro`}>cem//guide · etkileşimli 3D deneyim</p>
            <h1 className={styles.heroTitle}>
              <span>Cesur fikirler.</span>
              <span>Çalışan dijital deneyimler.</span>
            </h1>
            <p className={styles.heroLead}>
              Web tasarım, SEO, mobil uygulama ve e-ticareti stratejiyle aynı üretim çizgisinde buluşturuyorum.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/iletisim" prefetch={false}>Projenizi konuşalım <span aria-hidden="true">↗</span></Link>
              <Link className={styles.secondaryCta} href="#secili-projeler">Çalışmaları keşfet <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
          <div className={styles.heroGuide} aria-hidden="true">
            <span>01</span><i /><p>Dijital üretim rehberi</p>
          </div>
          <p className={`${styles.pointerHint} micro`}>ROBOTU İNCELEMEK İÇİN HAREKET ETTİRİN</p>
          <p className={`${styles.scrollCue} micro`}>KEŞFETMEK İÇİN KAYDIR <span aria-hidden="true">↓</span></p>
        </div>
      </section>

      <section className={styles.manifesto} data-robot-stage="manifesto" data-header-theme="light">
        <div className="container">
          <p className="eyebrow" data-reveal>YAKLAŞIM</p>
          <p className={styles.manifestoText} data-reveal>
            Fikri yalnızca iyi görünen değil, iyi çalışan bir dijital sisteme dönüştürüyorum.
          </p>
          <div className={styles.manifestoNotes} data-reveal>
            <p>Strateji, tasarım, motion ve teknoloji aynı hedefe bakar.</p>
            <p>Doğrudan Cem ile çalışır; karar, tasarım ve geliştirme arasında kaybolmazsınız.</p>
          </div>
        </div>
      </section>

      <section className={styles.servicesLab} data-header-theme="light">
        <div className={`container ${styles.labIntro}`} data-reveal>
          <p className="eyebrow">HİZMET LABORATUVARI · 04 DİSİPLİN</p>
          <h2>Bir hedef. Dört üretim modu.</h2>
          <p>Kaydırdıkça odak değişir; içerik ve bağlantılar her zaman gerçek DOM akışında kalır.</p>
        </div>

        <div className={styles.serviceChapters}>
          {services.map((service, index) => (
            <article
              className={styles.serviceChapter}
              key={service.slug}
              data-robot-stage={serviceStageBySlug[service.slug]}
              data-service={service.slug}
            >
              <div className={`container ${styles.chapterInner}`}>
                <div className={styles.chapterCopy} data-reveal>
                  <p className={`${styles.chapterNumber} micro`}>0{index + 1} / 04</p>
                  <h3>{service.shortTitle}</h3>
                  <p className={styles.chapterPromise}>{service.promise}</p>
                  <p className={styles.chapterSummary}>{service.summary}</p>
                  <p className={styles.priceSignal}>{service.priceSignal}</p>
                  <Link className="textLink" href={`/hizmetler/${service.slug}`}>Kapsamı keşfet <span aria-hidden="true">↗</span></Link>
                </div>
                <div className={styles.serviceInstrument} data-instrument={service.slug} aria-hidden="true">
                  <span className={styles.instrumentIndex}>CW / 0{index + 1}</span>
                  <span className={styles.instrumentOrbit}><i /><i /><i /></span>
                  {serviceInstruments[service.slug].map((label, labelIndex) => (
                    <span className={styles.instrumentLabel} data-index={labelIndex} key={label}>{label}</span>
                  ))}
                </div>
                <span className={styles.mobileGuideMark} aria-hidden="true"><i />C/W</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="secili-projeler" className={styles.projects} data-robot-stage="projects" data-header-theme="dark">
        <div className="container">
          <div className={styles.projectsHeading} data-reveal>
            <p className="eyebrow">SEÇİLİ PROJE PORTALI</p>
            <h2>İş konuşsun.</h2>
            <Link className={styles.lightLink} href="/projeler">Tüm proje arşivi ↗</Link>
          </div>
          <article className={styles.featuredProject} data-reveal>
            <Link className={styles.velaVisual} href={`/projeler/${vela.slug}`} aria-label="Vela Windsurfing proje detayını gör">
              {vela.image ? <Image src={vela.image.src} alt={vela.image.alt} width={vela.image.width} height={vela.image.height} sizes="(min-width: 1100px) 72vw, (min-width: 700px) 86vw, 100vw" /> : null}
              <span>Projeyi gör ↗</span>
            </Link>
            <div className={styles.projectInfo}>
              <div><p className="micro">01 · {vela.year} · {vela.statusLabel}</p><h3>{vela.name}</h3></div>
              <div>
                <p>{vela.category}</p>
                <p>{vela.description}</p>
                <div className={styles.projectLinks}>
                  <Link href={`/projeler/${vela.slug}`}>Proje detayı ↗</Link>
                  {vela.url ? <a href={vela.url} target="_blank" rel="noopener noreferrer">Canlı site ↗</a> : null}
                </div>
              </div>
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

      <section className={styles.pricing} data-robot-stage="pricing" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">FİYAT KONTROL PANELİ</p>
            <h2>Kapsamı baştan görün.</h2>
            <p>Rakamlar hizmet bedelidir. İki ana üretim alanını okunaklı ve doğrudan karşılaştırın.</p>
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

      <section className={styles.process} data-robot-stage="process" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal><p className="eyebrow">ÜRETİM HATTI</p><h2>Dört adım. Tek sorumlu.</h2><p>Keşiften yayına kadar aynı karar çizgisi; doğrudan Cem ile çalışma.</p></div>
          <div className={styles.processLine} data-reveal><span aria-hidden="true" /><ProcessSteps /></div>
          <div className={styles.solo} data-reveal>
            <p className="micro">SOLO STÜDYO</p>
            <p>Projeyi konuştuğunuz kişi, onu tasarlar ve geliştirir.</p>
            <div><span>Doğrudan iletişim</span><span>Tek sorumluluk</span><span>Tutarlı kararlar</span></div>
            <Link className="textLink" href="/hakkimda">Cem ile tanışın ↗</Link>
          </div>
        </div>
      </section>

      <section className={styles.faq} data-robot-stage="faq" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal><p className="eyebrow">KISA SSS</p><h2>Başlamadan önce netleşsin.</h2></div>
          <div data-reveal><FaqList faqs={homeFaqs} includeSchema /></div>
        </div>
      </section>

      <section className={styles.final} data-robot-stage="final" data-header-theme="dark">
        <div className={`container ${styles.finalInner}`}>
          <p className="eyebrow">YENİ PROJE · cem//guide</p>
          <h2>Birlikte bir şey üretelim.</h2>
          <p>İlk adım, hedefinizi açıkça konuşmak.</p>
          <Link className={styles.finalLink} href="/iletisim">Projenizi başlatın <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}
