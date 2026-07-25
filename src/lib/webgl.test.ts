import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectBaselineExperienceProfile,
  detectExperienceInputMode,
  detectExperienceProfile,
  rememberSceneFailure,
} from "./webgl";

type BrowserFixture = {
  coarse?: boolean;
  deviceMemory?: number;
  effectiveType?: string;
  hardwareConcurrency?: number;
  hover?: boolean;
  reducedMotion?: boolean;
  saveData?: boolean;
  webgl?: boolean;
};

function installBrowserFixture(fixture: BrowserFixture = {}) {
  const storage = new Map<string, string>();
  const matchMedia = vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion")
      ? Boolean(fixture.reducedMotion)
      : query.includes("pointer: coarse")
        ? Boolean(fixture.coarse)
        : query.includes("hover: hover")
          ? fixture.hover !== false
          : false,
  }));
  const context = fixture.webgl === false ? null : {
    getExtension: () => ({ loseContext: vi.fn() }),
  };

  vi.stubGlobal("navigator", {
    connection: { effectiveType: fixture.effectiveType ?? "4g", saveData: fixture.saveData },
    deviceMemory: fixture.deviceMemory,
    hardwareConcurrency: fixture.hardwareConcurrency ?? 8,
  });
  vi.stubGlobal("window", {
    location: { hostname: "example.com", search: "" },
    matchMedia,
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  vi.stubGlobal("document", {
    createElement: () => ({ getContext: () => context }),
  });
}

describe("experience capability policy", () => {
  beforeEach(() => installBrowserFixture());
  afterEach(() => vi.unstubAllGlobals());

  it("keeps a capable coarse-pointer phone eligible for the real scene", () => {
    installBrowserFixture({ coarse: true, hover: false });
    expect(detectBaselineExperienceProfile()).toBe("candidate");
    expect(detectExperienceInputMode()).toBe("touch");
    expect(detectExperienceProfile()).toBe("full");
  });

  it("does not treat missing deviceMemory as low capacity", () => {
    installBrowserFixture({ deviceMemory: undefined });
    expect(detectBaselineExperienceProfile()).toBe("candidate");
  });

  it.each([
    [{ deviceMemory: 2 }, "lite"],
    [{ hardwareConcurrency: 2 }, "lite"],
    [{ effectiveType: "2g" }, "lite"],
    [{ saveData: true }, "none"],
    [{ reducedMotion: true }, "none"],
  ] as const)("maps an explicit constraint to %s", (fixture, expected) => {
    installBrowserFixture(fixture);
    expect(detectBaselineExperienceProfile()).toBe(expected);
  });

  it("uses none when a safe WebGL context cannot be created", () => {
    installBrowserFixture({ webgl: false });
    expect(detectExperienceProfile()).toBe("none");
  });

  it("supports a localhost-only lite override for repeatable performance QA", () => {
    installBrowserFixture();
    Object.assign(window.location, { hostname: "localhost", search: "?qa-experience=lite" });
    expect(detectBaselineExperienceProfile()).toBe("lite");
  });

  it("remembers a scene failure for the rest of the tab session", () => {
    rememberSceneFailure();
    expect(detectBaselineExperienceProfile()).toBe("none");
  });
});
