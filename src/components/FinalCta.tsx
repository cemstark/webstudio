import Link from "next/link";

export function FinalCta({ title = "Bir sonraki dijital ürününüzü birlikte netleştirelim." }: { title?: string }) {
  return (
    <section className="finalCta section">
      <div className="container finalCtaInner">
        <p className="eyebrow">YENİ PROJE</p>
        <h2>{title}</h2>
        <Link className="button buttonLight" href="/iletisim">Proje Başlat <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
