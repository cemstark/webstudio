import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { contactSchema, serviceOptions } from "@/lib/contact";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const MIN_SUBMIT_MS = 2500;
const attempts = new Map<string, number[]>();

function isRateLimited(ip: string, now: number) {
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

function smtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) return null;
  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) return null;
  return { host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS }, to: CONTACT_TO_EMAIL };
}

export async function POST(request: Request) {
  const now = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip, now)) return NextResponse.json({ message: "Çok fazla deneme yapıldı. Lütfen biraz sonra yeniden deneyin." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 }); }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Lütfen işaretli alanları kontrol edin.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (now - parsed.data.startedAt < MIN_SUBMIT_MS) return NextResponse.json({ message: "Form çok hızlı gönderildi. Lütfen yeniden deneyin." }, { status: 400 });

  const config = smtpConfig();
  if (!config) return NextResponse.json({ message: "E-posta servisi henüz yapılandırılmadı. Lütfen doğrudan e-posta ile iletişim kurun." }, { status: 503 });
  const serviceLabel = serviceOptions.find((item) => item.value === parsed.data.service)?.label ?? parsed.data.service;
  const lines = [
    `Ad: ${parsed.data.name}`, `E-posta: ${parsed.data.email}`, `Telefon: ${parsed.data.phone || "—"}`, `Şirket / Marka: ${parsed.data.company || "—"}`,
    `Hizmet: ${serviceLabel}`, `Paket: ${parsed.data.package || "—"}`, `Bütçe: ${parsed.data.budget}`, `Hedef tarih: ${parsed.data.targetDate || "—"}`, "", "Proje özeti:", parsed.data.summary,
  ];
  try {
    const transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure: config.secure, auth: config.auth });
    await transporter.sendMail({ from: `cemwebstudio web formu <${config.auth.user}>`, to: config.to, replyTo: parsed.data.email, subject: `Yeni proje briefi — ${serviceLabel}`, text: lines.join("\n") });
    return NextResponse.json({ message: "Briefiniz alındı. Cem en kısa sürede e-posta ile dönüş yapacak." });
  } catch (error) {
    console.error("Contact mail delivery failed", error instanceof Error ? error.message : "Unknown SMTP error");
    return NextResponse.json({ message: "Brief şu anda gönderilemedi. Lütfen daha sonra yeniden deneyin." }, { status: 502 });
  }
}
