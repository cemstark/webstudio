import Link from "next/link";

type PageHeroProps = { eyebrow: string; title: string; description: string; priceSignal?: string; cta?: { label: string; href: string } };

export function PageHero({ eyebrow, title, description, priceSignal, cta }: PageHeroProps) {
  return (
    <section className="pageHero section" data-header-theme="light">
      <div className="container">
        <div className="pageHeroHeading">
          <p className="eyebrow">{eyebrow}</p>
          <p className="micro pageHeroIndex" aria-hidden="true">CWS / 2026</p>
        </div>
        {/* CSS-driven like the homepage headline: this is the LCP element on every inner
            route, so it must never wait for the motion runtime to download — and an
            above-the-fold `data-reveal` would hide it until an observer callback lands. */}
        <h1 className="display" data-intro-lines><span><span>{title}</span></span></h1>
        <div className="heroLower" data-intro-fade>
          <p className="lead">{description}</p>
          <div>
            {priceSignal && <p className="priceSignal">{priceSignal}</p>}
            {cta && <Link className="button" href={cta.href} prefetch={false}>{cta.label}<span aria-hidden="true">↗</span></Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
