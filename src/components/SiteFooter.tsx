import Link from "next/link";
import { navigation, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="container footerGrid">
        <div>
          <Link className="brand footerBrand" href="/">cem<span>webstudio</span></Link>
          <p>Cesur fikirleri çalışan, bulunabilir ve hatırlanır dijital ürünlere dönüştüren solo stüdyo.</p>
        </div>
        <nav aria-label="Alt navigasyon">
          <p className="micro">KEŞFET</p>
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/surec">Süreç</Link>
          <Link href="/iletisim">İletişim</Link>
        </nav>
        <div>
          <p className="micro">STÜDYO</p>
          <p>{site.owner}</p>
          <p>{site.location}</p>
          <Link href="/iletisim">İletişim formu</Link>
        </div>
      </div>
      <div className="container footerBottom">
        <span>© {new Date().getFullYear()} cemwebstudio</span>
        <span><Link href="/gizlilik">Gizlilik</Link> · <Link href="/cerez-politikasi">Çerez Politikası</Link></span>
      </div>
    </footer>
  );
}
