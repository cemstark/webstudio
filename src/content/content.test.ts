import { describe, expect, it } from "vitest";
import { commerceOffers, webOffers } from "./pricing";
import { getProject } from "./projects";

describe("production content invariants", () => {
  it("keeps web package prices exact", () => { expect(webOffers.map((offer) => offer.price)).toEqual([7000, 15000, 30000]); });
  it("keeps commerce package prices exact", () => { expect(commerceOffers.map((offer) => offer.price)).toEqual([15000, 25000, 35000]); });
  it("keeps Vela Windsurfing featured and live", () => { const vela = getProject("vela-windsurfing"); expect(vela?.featured).toBe(true); expect(vela?.status).toBe("live"); expect(vela?.url).toBe("https://velawindsurfing.com"); });
});
