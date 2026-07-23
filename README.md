# cemwebstudio

Cem Yıldız tarafından yürütülen solo dijital stüdyo için Next.js App Router, React ve strict TypeScript tabanlı çok sayfalı web uygulaması.

## Yerel geliştirme

Gereksinim: Node.js 22.x ve npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Kalite kapısı:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical, sitemap ve Open Graph URL tabanı.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Hostinger SMTP bağlantısı.
- `CONTACT_TO_EMAIL`: brief e-postalarının ulaşacağı adres.

SMTP değişkenleri eksikse iletişim API'si kontrollü olarak `503` döndürür; secret değerleri repoya eklenmemelidir.

## Hostinger Node.js Web App dağıtımı

1. hPanel → **Websites → Add Website → Node.js Web App / Deploy Web App** yolunu açın.
2. GitHub repository olarak `cemstark/webstudio`, dal olarak `main` bağlayın.
3. Framework: **Next.js**; install: `npm ci`; build: `npm run build`; start: `npm run start`; output: `.next`.
4. `.env.example` içindeki tüm değerleri Hostinger **Environment Variables** alanına gerçek değerleriyle ekleyin.
5. İlk deploy loglarını kontrol edin. Geçici domain üzerinde ana rotaları ve iletişim formunu test edin; ardından gerçek domaini bağlayın.

Her push otomatik deploy tetikleyebileceği için `main` push'undan önce production build yerelde doğrulanmalıdır.

## İçerik ve varlık notları

- Fiyatların tek kaynağı `src/content/pricing.ts` dosyasıdır.
- Vela Windsurfing için canlı sitenin gerçek Open Graph yayın görseli WebP/AVIF olarak saklanır. Bu çalışma oturumunda in-app browser bulunmadığından ayrı masaüstü/mobil ekran görüntüsü alınamadı.
- AysaWorks, BlueKim, DRNEKİNOTO SERVİS, cemwebstudio, ATLAS PANEL SCRIPT ve DRN Servis Paneli için doğrulanmış vaka metni ve proje görselleri sağlanmalıdır. Rastgele veya sahte varlık eklenmemiştir.

## Rotalar

Ana sayfa, hizmet merkezi ve dört hizmet detayı, fiyatlandırma, proje listesi ve dinamik vaka sayfaları, süreç, hakkımda, iletişim, gizlilik ve çerez politikası gerçek App Router rotalarıdır. Boş blog rotası veya navigasyon bağlantısı yoktur.
