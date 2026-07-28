import Link from "next/link";

export function FinalCta({ title = "Bir sonraki dijital ürününüzü birlikte netleştirelim." }: { title?: string }) {
  return (
    <section className="finalCta section">
      <div className="container finalCtaInner">
        <p className="eyebrow">YENİ PROJE</p>
        {/* The one scroll-triggered heading per route, matching the homepage's close. */}
        <h2 data-mask-lines><span><span>{title}</span></span></h2>
        <Link className="button buttonLight" href="/iletisim">Proje Başlat <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
