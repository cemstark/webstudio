import Link from "next/link";
import type { PricedOffer } from "@/content/pricing";
import { formatPrice, providerCostNote } from "@/content/pricing";

export function PricingCards({ offers, service }: { offers: readonly PricedOffer[]; service: string }) {
  return (
    <div className="pricingGrid">
      {offers.map((offer, index) => (
        <article className={`pricingCard ${index === 1 ? "featuredOffer" : ""}`} key={offer.code}>
          <div>
            <p className="micro">{offer.code}</p>
            <h3>{offer.name}</h3>
            <p className="price"><span>Hizmet bedeli</span>{formatPrice(offer.price)}</p>
            <p>{offer.audience}</p>
            <ul className="checkList">{offer.approach.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <p className="providerNote">{providerCostNote}</p>
            <Link className="textLink" href={`/iletisim?service=${service}&package=${encodeURIComponent(offer.name)}`}>Bu Paketle Başla <span aria-hidden="true">↗</span></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
