"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
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
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  /**
   * Roving tabindex means Tab reaches the strip but not the tabs inside it, so without
   * arrow keys a keyboard visitor could never open the second group — its prices would be
   * unreachable. Activation follows focus: the panels are already rendered, so there is
   * nothing to defer.
   */
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = groups.findIndex((group) => group.id === activeId);
    const last = groups.length - 1;
    const next = {
      ArrowRight: current + 1 > last ? 0 : current + 1,
      ArrowDown: current + 1 > last ? 0 : current + 1,
      ArrowLeft: current - 1 < 0 ? last : current - 1,
      ArrowUp: current - 1 < 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (next === undefined) return;
    event.preventDefault();
    const target = groups[next];
    setActiveId(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  return (
    <div className={styles.switcher} data-enhanced={enhanced}>
      {enhanced ? (
        <div className={styles.tabs} role="tablist" aria-label="Paket grupları" onKeyDown={onTabKeyDown}>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              ref={(node) => {
                if (node) tabRefs.current.set(group.id, node);
                else tabRefs.current.delete(group.id);
              }}
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
