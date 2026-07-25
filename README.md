# cemwebstudio

Cem Yıldız tarafından yürütülen solo dijital stüdyo için Next.js 16 App Router, React 19 ve strict TypeScript tabanlı çok sayfalı portfolyo uygulaması.

## Robot deneyimi mimarisi

Ana sayfa, semantik ve server-rendered içeriğin üzerinde çalışan küçük client adalarıyla zenginleştirilir. H1, hizmetler, fiyatlar, Vela projesi, süreç, SSS ve CTA metinleri canvas dışında gerçek HTML olarak kalır.

- `ExperienceShell`, `full` / `lite` / `none` profilini, lazy import durumunu, görünürlüğü, scene timeout’unu ve fallback geçişini yönetir.
- `SplineRobotScene`, yalnız Spline adapter’ıdır. `Application` typed ref’iyle resmî `play()` / `stop()` yaşam döngüsünü ve varsayılan açık `renderOnDemand` davranışını kullanır.
- `RobotStoryController`, stable `data-robot-stage` chapter’larını viewport merkezinden izler. Scroll başına React render’ı üretmez; tek `requestAnimationFrame`, `ResizeObserver`, DOM dataset’i ve CSS custom property kullanır.
- `RobotFallback`, Spline sahnesinden kopyalanmış bir görsel değildir. CSS ile üretilmiş özgün, markalı bir teknoloji siluetidir; ilk HTML’de alanı ayırır ve scene hatasında görünür kalır.
- Spline scene URL’sinin tek kaynağı `src/content/experience.ts` dosyasındaki `SPLINE_ROBOT_SCENE_URL` sabitidir.

Robot, chatbot veya yapay zekâ asistanı olarak sunulmaz; `cem//guide` stüdyonun etkileşimli 3D görsel rehberidir.

## Spline kaynağı ve bağımlılıklar

Kullanılan robot sahnesi kullanıcı tarafından sağlanmış üçüncü taraf Spline production kaynağıdır:

`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`

Sahnenin yeniden dağıtım/self-host lisans hakkı bağımsız olarak doğrulanamadığı için `.splinecode` repoya kopyalanmamış, remote production URL korunmuştur. Bu seçim dış ağ/CORS erişimine bağımlılık getirir; timeout, error boundary ve CSS fallback bu sınırı karşılar. Spline attribution/watermark kaldırılmamıştır.

- `@splinetool/react-spline`: React client adapter’ı ve scene yaşam döngüsü.
- `@splinetool/runtime`: typed `Application`, WebGL runtime ve on-demand render.
- `@playwright/test`: production browser smoke, fallback, erişilebilir etkileşim ve responsive görsel QA.

Eski `three`, `@react-three/fiber` ve `@types/three` bağımlılıkları kaldırılmıştır. Ana sayfada tek Spline instance/canvas vardır; iç rotalar Spline scene isteği yapmaz. Framer Motion, GSAP, Lenis, Tailwind, shadcn, Spotlight ve ikinci bir WebGL runtime eklenmemiştir.

## Full / Lite / None

- `full`: geniş viewport, fine pointer, reduced-motion/Save-Data kapalı, yeterli cihaz belleği ve başarılı WebGL testi. Kritik DOM boyandıktan sonra ilk kullanıcı niyeti veya kısa idle penceresinde tek Spline instance yüklenir. Scroll chapter’ları wrapper konumu, ölçeği, görünürlüğü ve CSS arayüzünü dönüştürür.
- `lite`: touch/coarse pointer veya dar ekran. Remote scene/runtime yüklenmez; native scroll, CSS robot hero/final kompozisyonu ve hizmetlerde hafif C/W işareti kullanılır.
- `none`: reduced-motion, Save-Data, WebGL/context veya scene yükleme hatası. Spline isteği/canvas yoktur; intro, scrub ve büyük hareketler kapalıdır, bütün içerik görünürdür.

Sekme görünür değilken ve robotun gerekmediği chapter’larda desteklenen resmî `stop()` yöntemiyle render durdurulur. Scene başarısız olursa aynı oturumda sonsuz yeniden yükleme yapılmaz. Vela görseli Spline dokusuna taşınmaz; `next/image`, sabit oran ve responsive `sizes` ile sunulur.

## Yerel geliştirme ve kalite kapısı

Gereksinim: Node.js 22.x ve npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run test:e2e
npm run qa:screenshots
npm run qa:lighthouse
npm audit
```

Playwright Chromium ilk kullanımda gerekiyorsa:

```bash
npx playwright install chromium
```

Robot dönüşümü için responsive QA çıktıları `qa/robot-transformation/after/<viewport>/` altında üretilir. Suite 390×844, 768×1024, 1440×900 ve 1920×1080 boyutlarında hero, dört hizmet, Vela, fiyat, süreç, final CTA, açık menü, reduced-motion ve engellenmiş Spline fallback karelerini üretir. Dizin Git tarafından izlenmez. Lighthouse JSON raporları `qa/lighthouse/` altında tutulur.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical, sitemap ve Open Graph URL tabanı.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Hostinger SMTP bağlantısı.
- `CONTACT_TO_EMAIL`: brief e-postalarının ulaşacağı adres.

SMTP değişkenleri eksikse iletişim API’si kontrollü olarak `503` döndürür. Secret değerleri repoya veya istemci bundle’ına eklenmemelidir.

## Hostinger Node.js Web App dağıtımı

1. hPanel → **Websites → Add Website → Node.js Web App / Deploy Web App** yolunu açın.
2. GitHub repository olarak `cemstark/webstudio`, dal olarak `main` bağlayın.
3. Framework: **Next.js**; install: `npm ci`; build: `npm run build`; start: `npm run start`; output: `.next`.
4. Node.js sürümünü **22.x** seçin.
5. `.env.example` değerlerini Hostinger **Environment Variables** alanına gerçek değerleriyle ekleyin.
6. Deploy loglarını, ana rotaları, remote Spline erişimini/fallback’i ve yapılandırılmış SMTP ile iletişim formunu geçici domain üzerinde doğrulayın.

Yeni zorunlu environment variable yoktur. `main` push’u otomatik deploy tetikleyebileceğinden production build, smoke ve E2E push öncesinde çalıştırılmalıdır.

## İçerik gerçekleri

- Fiyatların tek kaynağı `src/content/pricing.ts` dosyasıdır.
- Vela Windsurfing ilk öne çıkan gerçek projedir; canlı URL ve gerçek yayın görseli korunur.
- Eksik arşiv projeleri doğrulanmış vaka metni/görseli gelene kadar procedural kapak ve “İçerik hazırlanıyor” durumuyla sunulur; sonuç veya metrik uydurulmaz.
- App Router rotaları, SSG proje slug’ları, metadata/JSON-LD, sitemap/robots/manifest, güvenlik header’ları ve iletişim API korumaları ana sayfa deneyiminden bağımsız kalır.
