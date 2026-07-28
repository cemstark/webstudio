import Image from "next/image";
import Link from "next/link";
import { ExperienceIntro } from "@/components/experience/ExperienceIntro";
import { ExperienceShell } from "@/components/experience/ExperienceShell";
import { FaqList } from "@/components/FaqList";
import { MobileActionBar } from "@/components/MobileActionBar";
import { ProcessSteps } from "@/components/ProcessSteps";
import { PricingSwitcher } from "@/components/PricingSwitcher";
import { serviceInstruments } from "@/content/experience";
import { homeFaqs } from "@/content/faqs";
import { featuredProjects, projects } from "@/content/projects";
import { commerceOffers, formatPrice, providerCostNote, quoteOffers, webOffers, type PricedOffer } from "@/content/pricing";
import { services } from "@/content/services";
import { site } from "@/content/site";
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

/** The trust strip counts real rows rather than repeating a hand-written number. */
const evidencedProjectCount = projects.filter((project) => !project.missingAssets).length;
const liveProjectCount = projects.filter((project) => project.status === "live").length;

function PackageCards({ offers, service }: { offers: readonly PricedOffer[]; service: string }) {
  return (
    <div className={styles.packageGrid}>
      {offers.map((offer, index) => (
        <article
          className={`${styles.packageCard} ${index === 1 ? styles.packageCardFeatured : ""}`}
          key={offer.code}
          data-stagger
        >
          <p className={`${styles.packageName} micro`}>{offer.name}</p>
          <p className={styles.packagePrice}>{formatPrice(offer.price)}</p>
          <p className={styles.packagePriceLabel}>hizmet bedeli</p>
          <p className={styles.packageAudience}>{offer.audience}</p>
          <ul className={styles.packageList}>
            {offer.approach.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <Link
            className={styles.packageCta}
            href={`/iletisim?service=${service}&package=${encodeURIComponent(offer.name)}`}
          >
            Bu paketi konuşalım <span aria-hidden="true">↗</span>
          </Link>
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  const [vela, ...showcase] = featuredProjects;

  return (
    <div className={styles.home} data-home-experience>
      <JsonLd data={homeServicesSchema} />
      <ExperienceIntro />
      <ExperienceShell />
      <MobileActionBar />
      <div className={styles.scrollRail} aria-hidden="true"><span /></div>

      {/* 01 — Hero: what this studio does, then straight to the proof. */}
      <section className={styles.hero} data-robot-stage="hero" data-header-theme="dark">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={`${styles.kicker} micro`}>cemwebstudio · {site.location}</p>
            {/* CSS-driven so the largest text paints without waiting for the motion runtime. */}
            <h1 className={styles.heroTitle} data-intro-lines>
              <span><span>Web, e-ticaret,</span></span>
              <span><span>mobil uygulama.</span></span>
              <span><span>Tek elden.</span></span>
            </h1>
            <p className={styles.heroLead}>
              Tasarımı da geliştirmeyi de doğrudan Cem yapar. Aracı yok, devir yok, tek sorumlu var.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="#secili-projeler">
                Yaptığım işler <span aria-hidden="true">↓</span>
              </Link>
              <Link className={styles.secondaryCta} href="/iletisim" prefetch={false}>
                Projenizi konuşalım <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <Link className={styles.budgetLink} href="#paketler">
              Paketler ve bütçe <span aria-hidden="true">↓</span>
            </Link>

            <ul className={styles.trustStrip}>
              <li><strong>{evidencedProjectCount}</strong> proje</li>
              <li><strong>{liveProjectCount}</strong> yayında</li>
              <li>Doğrudan Cem ile çalışma</li>
              <li>{site.location}</li>
            </ul>
          </div>
          <p className={`${styles.pointerHint} micro`}>ROBOTU İNCELEMEK İÇİN HAREKET ETTİRİN</p>
        </div>
      </section>

      {/* 02 — The work. First thing after the promise, because it is the proof. */}
      <section id="secili-projeler" className={styles.projects} data-robot-stage="projects" data-header-theme="dark">
        <div className="container">
          <div className={styles.projectsHeading} data-reveal>
            <p className="eyebrow">YAPILAN İŞLER</p>
            <h2>İş konuşsun.</h2>
            <Link className={styles.lightLink} href="/projeler">Tüm proje arşivi <span aria-hidden="true">↗</span></Link>
          </div>

          <article className={styles.heroProject} data-reveal>
            <Link className={styles.heroProjectVisual} href={`/projeler/${vela.slug}`} aria-label={`${vela.name} proje detayını gör`}>
              {vela.image ? (
                <Image
                  src={vela.image.src}
                  alt={vela.image.alt}
                  width={vela.image.width}
                  height={vela.image.height}
                  priority
                  sizes="(min-width: 1344px) 1216px, (min-width: 700px) 92vw, calc(100vw - 2.5rem)"
                  style={{ objectPosition: vela.image.position }}
                />
              ) : null}
              <span className={styles.heroProjectBadge}>{vela.statusLabel}</span>
            </Link>
            <div className={styles.heroProjectInfo}>
              <div>
                <p className="micro">{vela.year} · {vela.category}</p>
                <h3>{vela.name}</h3>
              </div>
              <div>
                <p>{vela.description}</p>
                <div className={styles.projectLinks}>
                  {vela.url ? <a href={vela.url} target="_blank" rel="noopener noreferrer">Canlı site <span aria-hidden="true">↗</span></a> : null}
                  <Link href={`/projeler/${vela.slug}`}>Proje detayı <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </div>
          </article>

          <div className={styles.showcaseGrid}>
            {showcase.map((project, index) => (
              <article className={styles.showcaseCard} key={project.slug} data-parallax={index % 2 === 0 ? "0.6" : "1"}>
                <Link href={`/projeler/${project.slug}`} className={styles.showcaseVisual}>
                  {project.image ? (
                    <Image
                      src={project.image.src}
                      alt={project.image.alt}
                      width={project.image.width}
                      height={project.image.height}
                      sizes="(min-width: 1344px) 600px, (min-width: 700px) 46vw, calc(100vw - 2.5rem)"
                      style={{ objectPosition: project.image.position }}
                    />
                  ) : null}
                  <span className={styles.showcaseArrow} aria-hidden="true">↗</span>
                </Link>
                <div className={styles.showcaseMeta}>
                  <h3>{project.name}</h3>
                  <p>{project.category} · {project.year ?? project.statusLabel}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — Services, compressed from four full-height scenes into one section. */}
      <section id="hizmetler" className={styles.services} data-robot-stage="services" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">NE YAPIYORUM</p>
            <h2>Dört üretim modu.</h2>
            <p>Strateji, tasarım ve geliştirme aynı elde ilerler; kapsam baştan konuşulur.</p>
          </div>
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <article className={styles.serviceCard} key={service.slug} data-service={service.slug} data-stagger>
                <div className={styles.serviceInstrument} aria-hidden="true">
                  <span className={styles.instrumentOrbit}><i /><i /><i /></span>
                </div>
                <h3>{service.shortTitle}</h3>
                <p className={styles.servicePromise}>{service.promise}</p>
                <ul className={styles.serviceTags}>
                  {serviceInstruments[service.slug].map((label) => <li key={label}>{label}</li>)}
                </ul>
                <p className={styles.servicePrice}>{service.priceSignal}</p>
                <Link className="textLink" href={`/hizmetler/${service.slug}`}>
                  Kapsamı keşfet <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Budget. The visitor should not have to ask for a quote to know the range. */}
      <section id="paketler" className={styles.pricing} data-robot-stage="pricing" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">PAKETLER VE BÜTÇE</p>
            <h2>Bütçeyi baştan görün.</h2>
            <p>Rakamlar hizmet bedelidir ve teklif istemeden burada durur.</p>
          </div>

          <PricingSwitcher
            groups={[
              {
                id: "web",
                label: "Web Sitesi & Blog",
                heading: "Web Sitesi ve Blog paketleri",
                panel: <PackageCards offers={webOffers} service="web-tasarim" />,
              },
              {
                id: "eticaret",
                label: "E-ticaret",
                heading: "E-ticaret paketleri",
                panel: <PackageCards offers={commerceOffers} service="e-ticaret" />,
              },
            ]}
          />

          <div className={styles.quoteGrid}>
            {Object.values(quoteOffers).map((offer) => (
              <article className={styles.quoteCard} key={offer.code} data-reveal>
                <h3>{offer.name}</h3>
                <p className={styles.quoteLabel}>{offer.priceLabel}</p>
                <p>{offer.audience}</p>
              </article>
            ))}
          </div>

          <div className={styles.pricingFoot} data-reveal>
            <p className={styles.providerNote}>{providerCostNote}</p>
            <Link className="button" href="/fiyatlandirma">
              Paketleri detaylı karşılaştır <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 05 — Process, held to one screen. */}
      <section className={styles.process} data-robot-stage="process" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">NASIL ÇALIŞIYORUZ</p>
            <h2>Dört adım. Tek sorumlu.</h2>
            <p>Keşiften yayına kadar aynı karar çizgisi.</p>
          </div>
          <div className={styles.processLine} data-progress-line>
            <span aria-hidden="true" />
            <ProcessSteps />
          </div>
          <p className={styles.soloNote} data-reveal>
            Projeyi konuştuğunuz kişi, onu tasarlar ve geliştirir.
            {" "}
            <Link className="textLink" href="/hakkimda">Cem ile tanışın <span aria-hidden="true">↗</span></Link>
          </p>
        </div>
      </section>

      {/* 06 — Short FAQ, schema preserved. */}
      <section className={styles.faq} data-robot-stage="faq" data-header-theme="light">
        <div className="container">
          <div className={styles.sectionIntro} data-reveal>
            <p className="eyebrow">KISA SSS</p>
            <h2>Başlamadan önce netleşsin.</h2>
          </div>
          <div data-reveal><FaqList faqs={homeFaqs} includeSchema /></div>
        </div>
      </section>

      {/* 07 — Close. The robot returns to full presence. */}
      <section className={styles.final} data-robot-stage="final" data-header-theme="dark">
        <div className={`container ${styles.finalInner}`}>
          <p className="eyebrow">YENİ PROJE</p>
          <h2 data-mask-lines><span><span>Birlikte bir şey</span></span><span><span>üretelim.</span></span></h2>
          <p className={styles.finalLead}>İlk adım, hedefinizi açıkça konuşmak.</p>
          <div className={styles.finalActions}>
            <Link className={styles.finalCta} href="/iletisim">
              Projenizi başlatın <span aria-hidden="true">↗</span>
            </Link>
            {/* No public email or WhatsApp exists in site.ts, so the form stays the only channel. */}
            <p className={styles.finalAlt}>{site.owner} · {site.location}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
