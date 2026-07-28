# Proje Görsel Entegrasyonu QA Raporu

Tarih: 28 Temmuz 2026

## Eşlemeler

| Kaynak | Public varlık | Proje slug'ı | Sonuç |
| --- | --- | --- | --- |
| `cemwebstudio-portfolio-homepage.webp` | `/images/projects/cemwebstudio/cemwebstudio-cover.webp` | `cemwebstudio` | Placeholder kaldırıldı; kaynak byte-eşit kopyalandı. |
| `vela-windsurfing-web-design.webp` | `/images/projects/vela-windsurfing/vela-windsurfing-cover.webp` | `vela-windsurfing` | Gerçek ana sayfa, mevcut logo kapağından daha güçlü cover olarak seçildi. Eski WebP ve AVIF silinmedi. |
| `bluekim-bluemet-corporate-website.webp` | `/images/projects/bluekim/bluekim-cover.webp` | `bluekim` | Placeholder kaldırıldı; kaynak byte-eşit kopyalandı. |
| `aysaworks-interior-architecture-projects.webp` | `/images/projects/aysaworks/aysaworks-cover.webp` | `aysaworks` | Placeholder kaldırıldı; kaynak byte-eşit kopyalandı. |
| `drnekinoto-automotive-service-website.webp` | `/images/projects/drnekinoto-servis/drnekinoto-servis-cover.webp` | `drnekinoto-servis` | Placeholder kaldırıldı; kaynak byte-eşit kopyalandı. |
| `erp-business-management-dashboard.webp` | `/images/projects/erp-is-yonetim-paneli/erp-is-yonetim-paneli-cover.webp` | `erp-is-yonetim-paneli` | Ham dosya kopyalanmadı; anonimleştirilmiş türev üretildi ve ayrı arşiv projesi açıldı. |

## ERP kararı ve gizlilik

Repo içeriği, tüm mevcut commit geçmişi, README, QA belgeleri, testler ve asset adları `atlas-panel-script` ile `drn-servis-paneli` için tarandı. `drn-servis-paneli` yalnızca mobil uygulama hizmetiyle ilişkili bir placeholder, iki kayıt da ilk commit'ten beri doğrulanmamış içerik olarak bulundu. Ekrandaki cari, proje, ticari, faturalama, muhasebe, İK, belge, gündem, destek, araç ve POS modüllerini iki slug'dan birine bağlayan kanıt bulunmadı. Bu nedenle iki placeholder korundu ve `erp-is-yonetim-paneli` adlı ayrı, `archive` durumunda ve dış URL'siz kayıt oluşturuldu.

Ham 2498×1418 WebP public alana alınmadı. Sharp ile iki aşamalı nearest-neighbor raster işlemi uygulandı:

- Sağ üst kullanıcı/kimlik alanı (`x=2300–2498`, `y=0–82`) 22 piksel blok boyutuyla kalıcı piksellendi.
- Operasyon kayıtlarının bulunduğu alt alan (`y=350–1418`) 28 piksel blok boyutuyla kalıcı piksellendi.
- Türev tekrar WebP olarak encode edildi; kaynak pikseller anonimleştirilmiş bölgelerde bulunmuyor.
- Public türev özgün çözünürlükte açılarak kişi/müşteri adları, proje kodları, tarihler ve tutarların okunamadığı manuel olarak doğrulandı.

## Varlık ölçüleri

| Public varlık | Piksel | Boyut |
| --- | ---: | ---: |
| `cemwebstudio-cover.webp` | 2460×1402 | 82.944 B |
| `vela-windsurfing-cover.webp` | 2503×1408 | 183.430 B |
| `bluekim-cover.webp` | 2495×1371 | 94.650 B |
| `aysaworks-cover.webp` | 2498×1395 | 58.796 B |
| `drnekinoto-servis-cover.webp` | 2496×1396 | 122.880 B |
| `erp-is-yonetim-paneli-cover.webp` | 2498×1418 | 46.202 B |

Altı public dosyada RIFF/WEBP imzası, Sharp `webp` formatı, gerçek ölçüler ve lowercase/kebab-case adlandırma doğrulandı. Beş doğrudan eşlemenin SHA-256 karşılaştırması kaynak dosyalarla byte-eşit sonuç verdi. `public` altında `erp-business-management-dashboard.webp` bulunmuyor.

## Uygulama değişiklikleri

- `src/content/projects.ts`: Altı görsel kaydı, dürüst açıklamalar/alt metinler, gerçek ölçüler ve proje bazlı object-position değerleri eklendi; beş doğrulanmış kayıttan `missingAssets` kaldırıldı. Vela ilk ve featured kaldı.
- `src/app/page.tsx` ve `src/app/home.module.css`: Ana sayfadaki AysaWorks/BlueKim procedural placeholder'ları gerçek responsive görsellere dönüştürüldü. Mobil Vela oranı 16:9 yapılarak logo ve ana içerik korunurken aşırı crop engellendi. Reduced-motion davranışı korundu.
- `src/components/ProjectGrid.tsx` ve `src/app/globals.css`: Kartlarda gerçek kullanım genişliklerine uygun `sizes`, sabit oran ve proje bazlı crop kullanıldı. Tüm kartları preload eden eski `priorityFirst` kaldırıldı; aşağıdaki görseller varsayılan lazy-loading'de kaldı.
- `src/app/projeler/[slug]/page.tsx` ve `src/lib/seo.tsx`: Gereksiz detay preload'u kaldırıldı; proje cover'ı Open Graph ve Twitter metadata'sına eklendi. Structured data mevcut merkezi kaynaktan beslenmeye devam ediyor.
- `scripts/smoke.mjs`, `src/content/content.test.ts`, `tests/e2e/project-assets.spec.ts`, `package.json`: Slug/asset/ERP gizlilik regresyonları, tüm proje rotaları, 200 yanıtları, SEO metadata, konsol, responsive overflow ve cross-browser kontrolleri eklendi.

## Kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 19/19 |
| `npm run build` | PASS — 29 statik çıktı; 8 proje slug'ı SSG |
| `npm run test:smoke` | PASS — tüm proje rotaları ve mevcut API/404 kontrolleri |
| `npm run test:e2e` | PASS — Chromium 50/50 |
| `npm run test:cross-browser` | PASS — Firefox/WebKit 20/20 |
| `npm run qa:lighthouse` | PASS (ölçüm scripti) — tüm profillerde A11y 100, SEO 100, CLS 0 |
| `git diff --check` | PASS |
| WebP imza/ölçü/ad/SHA-256 kontrolü | PASS |
| Ham ERP public sızıntı kontrolü | PASS |

## Responsive görsel QA

- 390×844: Ana sayfa ve `/projeler` tek kolon, taşmasız. Vela 16:9 kadrajda logo/başlık/sörfçü bağlamını koruyor. AysaWorks, BlueKim, DRNEKİN OTO ve cemwebstudio markaları kart içinde; ERP üst modül çubuğu ve anonim panel yapısı anlaşılır.
- 768×1024: Editorial grid ve büyük/küçük kart ritmi korunuyor. Altı gerçek görsel yükleniyor; metin veya kart taşması yok.
- 1440×900: Vela geniş cover olarak okunaklı. AysaWorks ve BlueKim ana sayfa seçili işler alanında gerçek görselle yer alıyor. Proje listesinde altı WebP ve iki doğrulanmamış placeholder doğru sırada; ERP lazy-load sonrası 200 yanıtla render oluyor.
- Altı değişen proje detayı 390×844 ve 1440×900'de açıldı; görseller yüklendi, canonical/OG image eşleşti ve yatay taşma oluşmadı.
- Chromium, Firefox ve WebKit konsollarında hydration, `next/image` oran, preload veya runtime error uyarısı bulunmadı.

## Lighthouse karşılaştırması

Önceki Step 3 final cold medyanlarıyla güncel cold medyanları:

| Profil | Önceki Perf / LCP / TBT | Güncel Perf / LCP / TBT | CLS |
| --- | ---: | ---: | ---: |
| Mobile full | 64 / 2.950 ms / 2.543 ms | 63 / 3.037 ms / 3.823 ms | 0 |
| Mobile lite | 94 / 2.948 ms / 34 ms | 94 / 2.961 ms / 47 ms | 0 |
| Desktop full | 81 / 631 ms / 424 ms | 76 / 636 ms / 570 ms | 0 |
| Pricing mobile | 95 / 2.790 ms / 35 ms | 95 / 2.792 ms / 37 ms | 0 |

LCP öğesi bütün ana sayfa profillerinde `Çalışan dijital deneyimler.` metnidir; proje görselleri LCP adayı veya ilk viewport transferi olmadı. İstek sayıları önceki finalle aynı kaldı. Full profil TBT değişkenliği üçüncü taraf Spline/SwiftShader değerlendirmesinde sürüyor; görsel entegrasyonunun CLS veya LCP öğesi regresyonu gözlenmedi.

## Kalan riskler

- `atlas-panel-script` ve `drn-servis-paneli` için doğrulanmış görsel/içerik hâlâ yok; placeholder ve `missingAssets` bilinçli olarak korunuyor.
- Vela dışındaki arşiv kayıtlarına doğrulanmış canlı URL eklenmedi.
- Full Spline profilinin headless TBT maliyeti mevcut performans riski olarak devam ediyor.
- In-app Browser bu oturumda bağlı değildi (`available browsers: []`); görsel ve konsol QA repo Playwright Chromium/Firefox/WebKit altyapısıyla yapıldı. Fiziksel cihaz testi bu kapsamda yapılmadı.
