import Link from "next/link";

type PageHeroProps = { eyebrow: string; title: string; description: string; priceSignal?: string; cta?: { label: string; href: string } };

export function PageHero({ eyebrow, title, description, priceSignal, cta }: PageHeroProps) {
  return (
    <section className="pageHero section" data-header-theme="light">
      <div className="container">
        <div className="pageHeroHeading">
          <p className="eyebrow reveal">{eyebrow}</p>
          <p className="micro pageHeroIndex" aria-hidden="true">CWS / 2026</p>
        </div>
        <h1 className="display reveal delayOne">{title}</h1>
        <div className="heroLower reveal delayTwo">
          <p className="lead">{description}</p>
          <div>
            {priceSignal && <p className="priceSignal">{priceSignal}</p>}
            {cta && <Link className="button" href={cta.href}>{cta.label}<span aria-hidden="true">↗</span></Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
