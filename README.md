# cemwebstudio

Cem Yıldız tarafından yürütülen solo dijital stüdyo için Next.js 16 App Router, React 19 ve strict TypeScript tabanlı çok sayfalı portfolyo uygulaması.

## Deneyim mimarisi

Ana sayfa, semantik ve server-rendered içeriğin üzerinde çalışan küçük client adalarıyla zenginleştirilir:

- `ExperienceShell`, reduced-motion, Save-Data, pointer, viewport, cihaz belleği ve gerçek WebGL context testinden merkezi bir `full` / `lite` / `none` profili üretir.
- `SignatureCanvas` yalnızca `full` profilinde, ilk kullanıcı niyeti veya boşta kalma sonrasında dinamik import edilir. `three` ve `@react-three/fiber` ile dış model veya texture kullanmadan dört procedural C–W yörünge parçası üretir.
- Sahne hedefleri `src/lib/motion.ts` içinde tek yerde tanımlıdır. Scroll konumu parçaları monogram, dört disiplin, proje portalı ve final imzası arasında dönüştürür.
- `lite` ve `none` profilleri CSS imza kompozisyonuna düşer. İçerik ve CTA’lar canvas’tan bağımsız DOM öğeleridir.
- İç sayfalar Three.js chunk’ını yüklemez; Server Component yapısı, metadata ve structured data korunur.

`three`, procedural WebGL sahnesi için; `@react-three/fiber`, React yaşam döngüsüyle güvenli kaynak yönetimi için kullanılır. `@playwright/test`, production browser smoke, erişilebilir etkileşim ve responsive görsel QA içindir. GSAP, Lenis, Drei, post-processing ve harici 3D model eklenmemiştir.

## Progressive enhancement

- `full`: geniş viewport, fine pointer, reduced-motion/Save-Data kapalı ve başarılı WebGL testi; R3F sahnesi ve hafif pointer tepkisi çalışır.
- `lite`: touch/coarse pointer veya dar ekran; native scroll ve statik CSS imza kompozisyonu kullanılır.
- `none`: reduced-motion, Save-Data veya WebGL hatası; preloader, parallax, route wipe ve canvas devre dışıdır.

Sekme arka plandayken veya deneyim viewport dışındayken render döngüsü durur. DPR 1–1.5 ile sınırlıdır. WebGL context kaybında sahne CSS fallback’e geçer. Vela görseli AVIF/WebP olarak saklanır ve `next/image` ile sabit oran/sizes bilgisi üzerinden sunulur.

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
npm run test:smoke
npm run test:e2e
npm run qa:lighthouse
```

Playwright Chromium ilk kullanımda gerekiyorsa:

```bash
npx playwright install chromium
```

Responsive QA ekran görüntüleri üretmek için production build sonrasında:

```bash
npm run qa:screenshots
```

Ekran görüntüleri `qa/screenshots/<viewport>/`, Lighthouse JSON raporları `qa/lighthouse/` altına yazılır ve Git tarafından izlenmez. Lighthouse komutu production server’ı geçici olarak başlatır ve ana sayfa ile fiyatlandırmayı ölçer.

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
5. `.env.example` içindeki değerleri Hostinger **Environment Variables** alanına gerçek değerleriyle ekleyin.
6. Deploy loglarını, ana rotaları ve yapılandırılmış SMTP ile iletişim formunu geçici domain üzerinde doğrulayın; ardından gerçek domaini bağlayın.

Her `main` push’u otomatik deploy tetikleyebileceğinden production build ve smoke test push öncesinde yerelde çalıştırılmalıdır.

## İçerik ve varlık notları

- Fiyatların tek kaynağı `src/content/pricing.ts` dosyasıdır.
- Vela Windsurfing ilk öne çıkan gerçek projedir; canlı URL ve gerçek yayın görseli korunur.
- AysaWorks, BlueKim, DRNEKİNOTO SERVİS, cemwebstudio, ATLAS PANEL SCRIPT ve DRN Servis Paneli için doğrulanmış vaka metni ve proje görselleri sağlanana kadar arşiv/procedural kapak kullanılır; sonuç veya metrik uydurulmaz.
- Ana sayfa, hizmet merkezi ve dört hizmet detayı, fiyatlandırma, proje listesi ve statik üretilen dinamik vaka sayfaları, süreç, hakkımda, iletişim, gizlilik ve çerez politikası gerçek App Router rotalarıdır.
