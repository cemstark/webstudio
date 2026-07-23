"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { serviceOptions } from "@/lib/contact";

type FormStatus = { kind: "idle" | "loading" | "success" | "error"; message: string; errors?: Record<string, string[]> };
const budgets = ["7.000–15.000 TL", "15.000–30.000 TL", "30.000–50.000 TL", "50.000 TL üzeri", "Henüz net değil"];

export function ContactForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") ?? "";
  const defaultPackage = searchParams.get("package") ?? "";
  const startedAt = useRef(0);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle", message: "" });

  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "loading", message: "Brief gönderiliyor…" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, privacy: data.get("privacy") === "on", startedAt: startedAt.current }) });
      const result = await response.json() as { message?: string; errors?: Record<string, string[]> };
      if (!response.ok) { setStatus({ kind: "error", message: result.message ?? "Brief gönderilemedi.", errors: result.errors }); return; }
      form.reset();
      setStatus({ kind: "success", message: result.message ?? "Briefiniz alındı." });
    } catch {
      setStatus({ kind: "error", message: "Bağlantı kurulamadı. Lütfen daha sonra yeniden deneyin." });
    }
  }

  const errorFor = (field: string) => status.errors?.[field]?.[0];
  return (
    <form className="contactForm" onSubmit={handleSubmit} noValidate>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Web sitesi</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <div className="fieldGrid">
        <div className="field"><label htmlFor="name">Adınız *</label><input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(errorFor("name"))} aria-describedby={errorFor("name") ? "name-error" : undefined} />{errorFor("name") && <p id="name-error" className="fieldError">{errorFor("name")}</p>}</div>
        <div className="field"><label htmlFor="email">E-posta *</label><input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errorFor("email"))} aria-describedby={errorFor("email") ? "email-error" : undefined} />{errorFor("email") && <p id="email-error" className="fieldError">{errorFor("email")}</p>}</div>
        <div className="field"><label htmlFor="phone">Telefon <span>(opsiyonel)</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
        <div className="field"><label htmlFor="company">Şirket / Marka <span>(opsiyonel)</span></label><input id="company" name="company" autoComplete="organization" /></div>
        <div className="field"><label htmlFor="service">Hizmet *</label><select id="service" name="service" required defaultValue={serviceOptions.some((item) => item.value === defaultService) ? defaultService : ""} aria-invalid={Boolean(errorFor("service"))} aria-describedby={errorFor("service") ? "service-error" : undefined}><option value="" disabled>Seçin</option>{serviceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{errorFor("service") && <p id="service-error" className="fieldError">{errorFor("service")}</p>}</div>
        <div className="field"><label htmlFor="package">İlgilenilen paket <span>(opsiyonel)</span></label><select id="package" name="package" defaultValue={defaultPackage}><option value="">Henüz net değil</option><option>Başlangıç</option><option>Orta</option><option>Premium</option><option>Kapsama göre teklif</option></select></div>
        <div className="field"><label htmlFor="budget">Bütçe aralığı *</label><select id="budget" name="budget" required defaultValue="" aria-invalid={Boolean(errorFor("budget"))} aria-describedby={errorFor("budget") ? "budget-error" : undefined}><option value="" disabled>Seçin</option>{budgets.map((budget) => <option key={budget}>{budget}</option>)}</select>{errorFor("budget") && <p id="budget-error" className="fieldError">{errorFor("budget")}</p>}</div>
        <div className="field"><label htmlFor="targetDate">Hedef tarih <span>(opsiyonel)</span></label><input id="targetDate" name="targetDate" placeholder="Örn. Eylül 2026" /></div>
      </div>
      <div className="field"><label htmlFor="summary">Proje özeti *</label><textarea id="summary" name="summary" rows={7} required placeholder="Hedefiniz, mevcut durum ve aklınızdaki kapsam…" aria-invalid={Boolean(errorFor("summary"))} aria-describedby={errorFor("summary") ? "summary-error" : "summary-help"} /><p id="summary-help" className="fieldHelp">En az 20 karakter.</p>{errorFor("summary") && <p id="summary-error" className="fieldError">{errorFor("summary")}</p>}</div>
      <div className="consent"><input id="privacy" name="privacy" type="checkbox" required aria-invalid={Boolean(errorFor("privacy"))} aria-describedby={errorFor("privacy") ? "privacy-error" : undefined} /><label htmlFor="privacy"><Link href="/gizlilik" target="_blank">Gizlilik metnini</Link> okudum; bilgilerimin proje talebime yanıt vermek için işlenmesini onaylıyorum. *</label></div>{errorFor("privacy") && <p id="privacy-error" className="fieldError">{errorFor("privacy")}</p>}
      <div className="formActions"><button className="button" type="submit" disabled={status.kind === "loading"}>{status.kind === "loading" ? "Gönderiliyor…" : "Briefi Gönder"}</button><p className={`formStatus ${status.kind}`} role="status" aria-live="polite">{status.message}</p></div>
    </form>
  );
}
