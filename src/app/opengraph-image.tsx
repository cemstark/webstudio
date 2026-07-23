import { ImageResponse } from "next/og";

export const alt = "cemwebstudio — Dijital ürün stüdyosu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0A0A0D", color: "white", padding: "72px", fontFamily: "Arial, sans-serif" }}><div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>cem<span style={{ color: "#2D62FF" }}>webstudio</span></div><div style={{ display: "flex", maxWidth: 930, fontSize: 76, lineHeight: 1.02, letterSpacing: "-3px", fontWeight: 650 }}>Fikrinizi çalışan bir dijital ürüne dönüştürün.</div><div style={{ display: "flex", justifyContent: "space-between", color: "#BFC3CF", fontSize: 24 }}><span>Web · SEO · Mobil · E-ticaret</span><span>İzmit, Kocaeli</span></div></div>, size);
}
