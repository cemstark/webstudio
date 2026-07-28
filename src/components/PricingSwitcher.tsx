"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./PricingSwitcher.module.css";

const subscribeToNothing = () => () => {};
/** True only after hydration, so the server markup and the first client render match. */
const useIsHydrated = () => useSyncExternalStore(subscribeToNothing, () => true, () => false);

type PricingGroup = { id: string; label: string; heading: string; panel: ReactNode };

/**
 * Progressive enhancement for the package groups.
 *
 * The server renders every group open, so a visitor without JavaScript scrolls through
 * Web and E-ticaret in turn and sees all six prices. The tab strip only appears after
 * mount, which also keeps the server and first client render identical.
 */
export function PricingSwitcher({ groups }: { groups: readonly PricingGroup[] }) {
  const enhanced = useIsHydrated();
  const [activeId, setActiveId] = useState(groups[0]?.id);
  const baseId = useId();

  return (
    <div className={styles.switcher} data-enhanced={enhanced}>
      {enhanced ? (
        <div className={styles.tabs} role="tablist" aria-label="Paket grupları">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${group.id}`}
              aria-controls={`${baseId}-panel-${group.id}`}
              aria-selected={group.id === activeId}
              tabIndex={group.id === activeId ? 0 : -1}
              className={styles.tab}
              onClick={() => setActiveId(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.id}
          {...(enhanced
            ? { role: "tabpanel", "aria-labelledby": `${baseId}-tab-${group.id}` }
            : { "aria-label": group.label })}
          id={`${baseId}-panel-${group.id}`}
          className={styles.panel}
          hidden={enhanced && group.id !== activeId}
        >
          <h3 className={styles.panelHeading}>{group.heading}</h3>
          {group.panel}
        </section>
      ))}
    </div>
  );
}
