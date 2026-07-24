import { ImageResponse } from "next/og";

export const alt = "cemwebstudio — Dijital ürün stüdyosu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", background: "#07080C", color: "white", padding: "68px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", right: -60, bottom: -210, width: 580, height: 580, display: "flex", border: "34px solid #2D62FF", borderRightColor: "transparent", borderRadius: "50%", transform: "rotate(-20deg)" }} />
      <div style={{ position: "absolute", right: 250, bottom: -100, width: 390, height: 390, display: "flex", border: "26px solid #F4F6FF", borderBottomColor: "transparent", borderRadius: "50%", transform: "rotate(28deg)", opacity: .92 }} />
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: "-1.5px" }}>cem<span style={{ color: "#2D62FF" }}>webstudio</span></div>
      <div style={{ display: "flex", maxWidth: 790, fontSize: 78, lineHeight: .94, letterSpacing: "-4px", fontWeight: 650 }}>Cesur fikirler. Çalışan dijital deneyimler.</div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#BFC3CF", fontSize: 23 }}><span>Web · SEO · Mobil · E-ticaret</span><span>İzmit, Kocaeli</span></div>
    </div>,
    size,
  );
}
