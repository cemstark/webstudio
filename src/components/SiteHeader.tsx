"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="siteHeader">
      <div className="container headerInner">
        <Link className="brand" href="/" aria-label="cemwebstudio ana sayfa">
          cem<span>webstudio</span>
        </Link>
        <nav className="desktopNav" aria-label="Ana navigasyon">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>{item.label}</Link>
          ))}
        </nav>
        <Link className="button buttonSmall desktopCta" href="/iletisim">Proje Başlat <span aria-hidden="true">↗</span></Link>
        <button className="menuButton" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="srOnly">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
          <span aria-hidden="true">{open ? "Kapat" : "Menü"}</span>
        </button>
      </div>
      <div id="mobile-navigation" className={`mobileNav ${open ? "isOpen" : ""}`} hidden={!open}>
        <nav className="container" aria-label="Mobil navigasyon">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<span aria-hidden="true">↗</span></Link>)}
          <Link className="button" href="/iletisim" onClick={() => setOpen(false)}>Proje Başlat</Link>
        </nav>
      </div>
    </header>
  );
}
