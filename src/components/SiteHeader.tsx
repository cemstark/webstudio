"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/site";

const menuLinks = [
  ...navigation,
  { label: "Süreç", href: "/surec" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [homeTheme, setHomeTheme] = useState<"light" | "dark">("dark");
  const pathname = usePathname();
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const theme = pathname === "/" ? homeTheme : "light";

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = document.querySelectorAll<HTMLElement>("[data-header-theme]");
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const next = visible?.target.getAttribute("data-header-theme");
      if (next === "light" || next === "dark") setHomeTheme(next);
    }, { rootMargin: "-12% 0px -76%", threshold: [0, 0.2, 0.8] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const opener = openerRef.current;
    const main = document.querySelector<HTMLElement>("main");
    const footer = document.querySelector<HTMLElement>("footer");
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? []);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const focusFrame = window.requestAnimationFrame(() => focusable()[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      opener?.focus();
    };
  }, [open]);

  return (
    <header className="siteHeader" data-theme={open ? "dark" : theme}>
      <div className="headerInner">
        <Link className="brand" href="/" prefetch={false} aria-label="cemwebstudio ana sayfa" onClick={() => setOpen(false)}>
          cem<span>webstudio</span>
        </Link>
        <div className="headerActions">
          <Link className="headerProjectLink" href="/iletisim" prefetch={false}>Proje Başlat <span aria-hidden="true">↗</span></Link>
          <button
            ref={openerRef}
            className="menuButton"
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setOpen((value) => !value)}
          >
            <span>{open ? "Kapat" : "Menü"}</span>
            <span className="menuGlyph" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <div id="site-menu" ref={dialogRef} className="menuOverlay" role="dialog" aria-modal="true" aria-label="Site menüsü" hidden={!open}>
        <nav aria-label="Ana navigasyon" className="menuNavigation">
          {menuLinks.map((item, index) => {
            const current = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)}>
                <span className="micro">0{index + 1}</span>
                <span>{item.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </nav>
        <div className="menuAside">
          <p className="micro">DÖRT ODAK</p>
          <p>Web tasarım · SEO · Mobil uygulama · E-ticaret</p>
          <p className="menuNote">Strateji, tasarım ve geliştirme için doğrudan Cem ile çalışın.</p>
        </div>
      </div>
    </header>
  );
}
