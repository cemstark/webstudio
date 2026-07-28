"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./MobileActionBar.module.css";

const REVEAL_AT = 0.25;

/**
 * Touch-only shortcut bar. It stays out of the way until the reader is a quarter of the
 * way down, then keeps the two decisions that matter — budget and contact — one tap away.
 * Hidden entirely on pointer devices, where the header already carries the same links.
 */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollable > 0 && window.scrollY / scrollable > REVEAL_AT);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.bar} data-visible={visible} aria-hidden={!visible}>
      <Link className={styles.secondary} href="#paketler" tabIndex={visible ? undefined : -1}>
        Paketler
      </Link>
      <Link className={styles.primary} href="/iletisim" prefetch={false} tabIndex={visible ? undefined : -1}>
        İletişim <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
