import { z } from "zod";

export const serviceOptions = [
  { value: "web-tasarim", label: "Web sitesi / Blog" },
  { value: "seo", label: "SEO" },
  { value: "mobil-uygulama", label: "Mobil uygulama" },
  { value: "e-ticaret", label: "E-ticaret" },
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı yazın.").max(100),
  email: z.email("Geçerli bir e-posta adresi yazın."),
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  service: z.enum(serviceOptions.map((option) => option.value) as [string, ...string[]], { error: "Bir hizmet seçin." }),
  package: z.string().trim().max(80).optional().default(""),
  budget: z.string().trim().min(1, "Bütçe aralığını seçin.").max(80),
  targetDate: z.string().trim().max(80).optional().default(""),
  summary: z.string().trim().min(20, "Projenizi en az 20 karakterle anlatın.").max(5000),
  privacy: z.literal(true, { error: "Gizlilik onayı gerekli." }),
  website: z.string().max(0, "Geçersiz gönderim."),
  startedAt: z.number().int().positive(),
});

export type ContactPayload = z.infer<typeof contactSchema>;
