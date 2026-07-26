# Adım 2 — Spline Üretim QA Raporu

Tarih: 26 Temmuz 2026

Başlangıç commit’i: `0dedea1 feat: adapt Spline robot story for mobile`

Branch: `main`

Ortam: Windows, Node `v25.8.0`, npm `11.11.0` (repo production standardı Node 22.x)

## 1. Sonuç

Spline Step-2 fonksiyonel, responsive, fallback, lifecycle ve çapraz tarayıcı kontrolleri geçti. Donanım hızlandırmalı gerçek sahne 60,00 FPS ortalama ve 16,80 ms p95 frame süresi verdi; 10 client-side home/inner rota döngüsünde canvas veya global listener birikimi görülmedi. Görsel matriste 218 after karesi üretildi ve kanonik `qa:screenshots` koşusu 7/7 geçti.

Teslim kararı koşullu PASS’tir. Gerçek Spline açık mobil/desktop headless Lighthouse performansı hedefi karşılamıyor; ayrıca `npm audit` yalnız geliştirme araç zincirindeki 9 high advisory nedeniyle kırmızı. Runtime bağımlılık taraması temizdir.

## 2. Step-2 hardening kapsamı

- WebGL capability artık `hardware`, `software` ve `none` olarak ayrılıyor. SwiftShader, llvmpipe ve açık software renderer değerleri gerçek sahne yerine `lite` profile yönlendiriliyor.
- Yalnız localhost üzerinde çalışan `?qa-experience=full|lite` override’ları Lighthouse ve gerçek sahne QA’sını deterministik hale getiriyor. Reduced-motion, Save-Data ve session failure önceliği korunuyor.
- Spline canvas `webglcontextlost` listener’ı önceki canvas’tan ayrılıyor; unmount sırasında listener kaldırılıyor, application durduruluyor ve referanslar temizleniyor.
- Route değişimlerinde `MotionObserver` yeni sayfanın reveal hedeflerini tekrar bağlıyor; hedef olmayan sayfada `motionReady` eklenmiyor.
- Final CTA’ya metin/robot çakışmasında kontrastı koruyan, pointer etkileşimini engellemeyen gradient katmanı eklendi.
- Firefox ve WebKit için Spline’sız temel içerik, menü, klavye FAQ ve reflow smoke matrisi eklendi.

## 3. Gerçek Spline, network ve frame cadence kanıtı

`chromium-hardware` koşusu NVIDIA GeForce RTX 4080 Laptop GPU üzerinde gerçek production scene ve Spline runtime ile alındı.

| Ölçüm | Sonuç |
| --- | ---: |
| Ortalama FPS | 60,00 |
| Ortalama frame | 16,67 ms |
| p95 frame | 16,80 ms |
| Scene cold transfer | 1.245.959 byte |
| WASM cold transfer | 190.282 byte |
| Scene envanteri | 107 obje |
| Spline event kaydı | 14 |
| Spline variable | 0 |

İlk yüklemede scene ve WASM 200 ile transfer edildi. Reload sonrasında aynı iki varlık disk cache’den 200 ve 0 encoded byte ile geldi. Scene envanteri, frame cadence ve cold/warm network sinyalleri `qa/network/step-2/spline-runtime-evidence-chromium-hardware.json` içinde kalıcı kanıt olarak tutuldu.

## 4. Lifecycle ve hata matrisi

10 client-side home → proje/fiyat → home döngüsünde her home mount’unda tek canvas kaldı. Beklenen 11 scene isteği oluştu: ilk mount ve 10 geri dönüş. Inner route’larda canvas sıfırdı.

- Global listener snapshot sabit: `pointermove: 2`, `resize: 1`, `scroll: 1`, `visibilitychange: 0`.
- Garbage collection sonrası ilk/son JS heap farkı 1.603.348 byte; 8 MiB bütçenin altında.
- Scene loading sırasında rota/orientation değişimi, context loss, abort, connection refusal, access denial, 404, 500 ve offline yolları fallback’e geçti; aynı session’da retry birikmedi.
- Yavaş scene cevabında ilk-paint fallback, H1 ve CTA görünür kaldı.
- Reduced-motion, Save-Data, düşük bellek, WebGL yok ve software renderer yollarında Spline isteği/canvas sıfırlandı.
- JavaScript kapalıyken ana hikâye, fiyatlar, Vela linki, CTA ve server-rendered robot görünür kaldı.

## 5. Responsive ve görsel QA

Touch matrisi: 320×568, 360×800, 375×667, 390×844, 430×932, 768×1024, 820×1180, 844×390, 932×430 ve 1024×768. Fine-pointer matrisi: 1366×768, 1440×900 ve 1920×1080. Ek yollar: lite, reduced-motion, blocked scene, açık menü, 200% reflow ve forced-colors.

`qa:screenshots` 7/7 geçti ve `qa/screenshots/step-2/after/` altında 218 JPEG üretti:

- Mobile full: 160
- Desktop full: 36
- Mobile lite: 9
- Reduced-motion: 9
- Scene blocked: 3
- İç fiyatlandırma rotası: 1

320 px hero, 390 px hizmet başlangıcı, 844×390 açık menü ve 1440 px final CTA baseline/after olarak ayrıca görsel incelendi. Yatay taşma, metin kırpılması, CTA kaybı veya kontrast regresyonu görülmedi. Final CTA gradient’i robot üzerindeki başlık ve açıklamanın okunurluğunu artırdı.

## 6. Production Lighthouse — üç koşu medyanları

Production build, Lighthouse mobile throttling ve headless SwiftShader kullanıldı. Full profiller localhost-only `?qa-experience=full`, lite profil `?qa-experience=lite` ile zorlandı. Her profil için üç JSON ve toplam 12 run üretildi.

| Profil | Perf | A11y | BP | SEO | LCP | CLS | TBT | İstek | Transfer | Scene |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile full | 45 | 100 | 81 | 100 | 6.376 ms | 0 | 3.549 ms | 42 | 2.447.124 B | 1 |
| Mobile lite | 93 | 100 | 81 | 100 | 3.105 ms | 0 | 17 ms | 30 | 417.743 B | 0 |
| Desktop full | 66 | 100 | 81 | 100 | 1.283 ms | 0 | 1.059 ms | 42 | 2.448.954 B | 1 |
| Pricing mobile | 94 | 100 | 81 | 100 | 2.944 ms | 0 | 30 ms | 29 | 394.640 B | 0 |

Baseline medyanlarına göre mobile-lite ve pricing sonuçları sabit kaldı. Mobile-full Performance 62 → 45, LCP 3.095 → 6.376 ms ve TBT 2.719 → 3.549 ms; desktop-full Performance 74 → 66, LCP 674 → 1.283 ms ve TBT 624 → 1.059 ms oldu. Full profillerdeki düşüş gerçek scene’in headless software WebGL ana-thread maliyetini yeniden teyit ediyor. Mobile-full üçüncü koşuda ayrıca 13.141 ms LCP outlier’ı oluştu; medyan tabloya taşınmadı.

BP 81’in puan kaybettiren tek audit’i local HTTP nedeniyle `is-on-https`; A11y ve SEO tüm koşularda 100, CLS tüm koşularda 0. Windows Chrome temp dizini cleanup aşamasında bazı EPERM uyarıları verdi; 12 rapor ve `summary.json` eksiksiz üretildi, script exit 0 ile kapandı ve aktif process bırakmadı.

## 7. Komut sonuçları

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS — 2 dosya, 16/16 test.
- `npm run build`: PASS — 28 static/dynamic route.
- `npm run test:smoke`: PASS — route ve iletişim API 200/400/404/429/503 matrisi.
- `npm run test:e2e`: PASS — Chromium 42/42.
- `npm run test:cross-browser`: PASS — Firefox/WebKit 4/4.
- `npm run qa:screenshots`: PASS — `chromium-hardware` 7/7.
- `npm run qa:lighthouse`: PASS — 4 profil × 3 koşu, 12/12 JSON.
- `npm audit`: FAIL — ESLint 9 araç zincirinde `brace-expansion/minimatch` üzerinden 9 high advisory.
- `npm audit --omit=dev`: PASS — 0 production vulnerability.
- `npm audit fix --dry-run`: Güvenli değişiklik yok; tam otomatik çözüm ESLint 10 breaking upgrade gerektiriyor. `--force` uygulanmadı.
- `git diff --check`: PASS.

## 8. Kalan riskler

1. Mobile-full ve desktop-full headless Lighthouse performans bütçeleri geçmiyor. Scene geometry/material/animation sadeleştirmesi Spline kaynak dosyasında ayrı optimizasyon işi olarak ele alınmalı.
2. Donanım frame cadence kanıtı masaüstü RTX 4080’e ait. Fiziksel iPhone/Pixel üzerinde thermal, heap ve uzun süreli GPU soak testi yapılmadı.
3. Firefox/WebKit’te core fallback ve erişilebilirlik smoke’u geçti; gerçek production Spline render’ı bu iki engine’de otomatik görsel karşılaştırmaya alınmadı.
4. `npm audit` geliştirme bağımlılıklarında 9 high nedeniyle kırmızı. ESLint 10 ve uyumlu Next lint zinciri ayrı, kontrollü bir major upgrade olmalı.
5. QA Node 25.8.0 ile çalıştı; production standardı Node 22.x. CI/hosting tarafında Node 22 doğrulaması korunmalı.
