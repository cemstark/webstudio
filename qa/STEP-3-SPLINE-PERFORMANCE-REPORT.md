# Adım 3 — Spline Production Performance Hardening Raporu

Tarih: 26 Temmuz 2026

Nihai karar: **FAIL**

Kod ve QA tarafındaki güvenli optimizasyonlar uygulandı; önceki fonksiyonel, lifecycle, responsive ve gerçek GPU kalite kapıları korunarak ölçülebilir iyileşme sağlandı. Bununla birlikte production Node 22 cold-cache medyanında mobile-full Performance/LCP/TBT, desktop-full Performance/TBT ve Spline yüklemeyen mobile-lite/pricing LCP hedefleri hâlâ geçmiyor. Bu nedenle test script'lerinin exit 0 vermesi PASS olarak yorumlanmadı.

## 1. Başlangıç commit'i, branch ve ortam

- Repo: `C:\Users\NAZLICAN\Desktop\webstudio`
- Branch: `main`
- Başlangıç commit'i: `8e14f9d test: complete Spline step 2 QA`
- Remote: `origin`, `https://github.com/cemstark/webstudio.git`
- Production doğrulama runtime'ı: Node `v22.23.1`, npm `11.11.0`
- Step-2 runtime'ı: Node `v25.8.0`, npm `11.11.0`
- OS: Windows; saat dilimi: Europe/Istanbul
- Lighthouse: production build + production server, cold ve warm ayrı, profil başına üçer koşu; 24 LHR JSON. İlk koşular için trace ve DevTools log'ları `qa/lighthouse/step-3/final/` altında üretildi. Bu dizin repo politikası gereği ignore edilir.
- Teslim commit'i ve remote hash'i push sonrasında teslim özetinde verilecektir; bir commit'in kendi hash'ini raporun içine güvenilir biçimde yazmak mümkün değildir.

Preflight'ta worktree temizdi. Step-2 raporu değiştirilmedi. Hedef projeye ait geçici QA server'ları PID/port eşleşmesiyle kapatıldı; toplu Node process sonlandırması yapılmadı.

## 2. Node 22 production paritesi

Portable, doğrulanmış Node 22 runtime'ı ile temiz `npm ci` ve production baseline alındı. Node 22 üzerinde lint, typecheck, 16/16 unit, 28 route build ve smoke başlangıçta PASS oldu; final regresyon da aynı runtime ile çalıştı.

Step-2 Node 25 ile Step-3 değişiklik öncesi Node 22 cold medyan karşılaştırması:

| Profil | Node 25 Step-2 Perf / LCP / TBT | Node 22 başlangıç Perf / LCP / TBT | Yorum |
| --- | ---: | ---: | --- |
| Mobile full | 45 / 6.376 / 3.549 ms | 40 / 14.383 / 4.222 ms | Full SwiftShader koşulu ciddi run-to-run oynaklık gösterdi; Node 22 production gerçeği olarak kullanıldı. |
| Mobile lite | 93 / 3.105 / 17 ms | 93 / 3.109 / 17 ms | Pratik olarak aynı. |
| Desktop full | 66 / 1.283 / 1.059 ms | 58 / 2.633 / 751 ms | LCP/score oynak, TBT yönü farklı; renderer maliyeti tek bir skorla açıklanamaz. |
| Pricing mobile | 94 / 2.944 / 30 ms | 94 / 2.943 / 30 ms | Pratik olarak aynı. |

Lite ve pricing paritesi Node farkının ortak render yolunu açıklamadığını gösterir. Full profildeki büyük değişkenlik Spline runtime + SwiftShader ana-thread yükünün ölçüm sıralamasını ve paint zamanını etkilediğini doğrular. Bütün final sayıları Node 22'ye aittir.

## 3. Step-2 baseline özeti

Step-2'nin koşullu PASS fonksiyonel sonucu, 60 FPS / 16,80 ms p95 gerçek GPU sahne akıcılığı, 107 obje, 14 event, 1.245.959 byte scene, 190.282 byte WASM, CLS 0, A11y/SEO 100 ve runtime audit 0 bulguları başlangıç hipotezi olarak alındı. Bu değerler güncel repo ve gerçek ölçümle yeniden doğrulanmadan final gerçek kabul edilmedi.

Node 22 değişiklik öncesi cold baseline medyanları:

| Profil | Perf | LCP | TBT | İstek | Transfer | Scene |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile full | 40 | 14.383 ms | 4.222 ms | 42 | 2.446.800 B | 1 |
| Mobile lite | 93 | 3.109 ms | 17 ms | 30 | 417.780 B | 0 |
| Desktop full | 58 | 2.633 ms | 751 ms | 42 | 2.449.028 B | 1 |
| Pricing mobile | 94 | 2.943 ms | 30 ms | 29 | 394.676 B | 0 |

## 4. LCP element'i ve kök neden analizi

Mobile-full ve mobile-lite LCP element'i hero H1'in ikinci satırı olan `Çalışan dijital deneyimler.` metnidir. Pricing LCP element'i `Bütçeyi saklamayan, kapsamı uydurmayan fiyatlandırma.` H1'idir. Fallback/poster ve canvas hiçbir final run'da LCP element'i olmadı.

Kök neden zinciri:

1. Ana sayfa H1 ikinci satırı `.9s titleIn` animasyonuyla opacity/translate başlangıç stilinden geliyordu. Pricing `PageHero` da `reveal/delay` başlangıç opacity/translate stilini kullanıyordu. Bu stiller H1'in LCP adaylığını geç paint'e taşıyordu.
2. Mobile-full'de Spline runtime evaluation animasyonun tamamlanacağı ana-thread aralığıyla çakışınca H1'in son paint'i çok geç kalıyordu. Node 22 baseline'ındaki 14.383 ms medyan ve Step-2'deki 13.141 ms outlier bu çakışmanın sonucu; canvasın yeni LCP olması değildi.
3. H1/PageHero başlangıç animasyonları kaldırıldı. Final mobile-full cold LCP run'ları 2.950 / 2.802 / 2.963 ms oldu; önceki 8 saniyeyi aşan dağılım yerine 161 ms aralıkta kaldı. LCP yine HTML H1'dir.
4. Fallback opacity'den canvas opacity'ye compositor-friendly geçiş korunurken structural observer son LCP'nin H1 olduğunu doğruladı. Canvas ready geçişi yeni LCP üretmedi ve CLS bütün run'larda 0 kaldı.
5. Font deneyi ayrıca izole edildi. Geist sans `swap` korundu; `optional` LCP'yi iyileştirmedi. Kullanılmayan Geist Mono kaldırılarak iki font request'i ve yaklaşık 39 KB cold transfer elendi. Font tamamen kaldırılmadı; marka tipografisi korunuyor.
6. Next.js `experimental.inlineCss` cold mobile-lite'ı Perf 94 / LCP 2.952 / TBT 32 / 300.323 B düzeyinden Perf 88 / LCP 3.410 / TBT 111 / 418.595 B düzeyine geriletti; deney geri alındı.
7. Ağda Spline, LCP için gerekli değildir. Yeni scheduler sahne import'unu HTML/H1/CTA hydration sonrasına bırakır. H1, açıklama, CTA ve fallback server HTML/FCP'de kalır.

Local hardware structural probe'da H1 FCP/LCP yaklaşık 128–316 ms'de görünürken robot daha sonra hazır oldu. Bu, robotu gizleyen skor hilesi değil; kritik HTML ile isteğe bağlı WebGL runtime'ını gerçek ürün politikasında ayırmadır.

## 5. TBT long-task analizi

Final mobile-full cold üç koşuda Spline client chunk'ının en büyük task'ı 1.290 / 1.158 / 1.160 ms; medyan script evaluation 4.970 ms oldu. Aynı profil TBT'si 2.525 / 2.543 / 2.611 ms'dir. Desktop-full cold medyanında script evaluation 1.159 ms ve TBT 424 ms'dir.

Karşı kanıt mobile-lite'tır: Spline chunk/scene/WASM yokken cold TBT 30 / 45 / 34 ms ve medyan script evaluation 208 ms kaldı. Dolayısıyla full TBT'nin baskın nedeni React hydration, MotionObserver veya genel CSS değil, yaklaşık 2,02 MB uncompressed Spline runtime chunk'ının SwiftShader koşulundaki evaluation/initialization maliyetidir.

Runtime import ayrı chunk'ta kaldı; profile activation öncesinde evaluation yapılmıyor. Story controller'ın bölüm başına ResizeObserver'ları kaldırıldı, scroll/resize işi tek RAF batch'inde tutuldu. Scheduler/listener cleanup'ları route sonrası callback bırakmıyor. Üçüncü taraf runtime bağımsız bir `WebAssembly.compile/instantiate` performance mark'ı sunmadığı için compile süresi tek başına güvenilir biçimde ayrılamadı; trace'te WASM request'i ile Spline `onLoad` arasındaki initialization penceresinin içinde kalıyor. Bu sınırlama hedefi geçti gibi gösterilmedi.

## 6. Spline import/download/WASM/ready zaman çizelgesi

Node 22 production, 390×844, RTX 4080 hardware probe; profil başına üç cold + üç warm ölçüm `qa/network/step-3/robot-ready-timeline.json` içindedir.

| Yol | Cold medyan | Warm medyan |
| --- | ---: | ---: |
| Idle navigation → profile full | 1.057 ms | 1.053 ms |
| Idle FCP → robot-ready | 1.980 ms | 1.236 ms |
| Idle navigation → robot-ready | 2.108 ms | 1.368 ms |
| 300 ms sonrası wheel intent → robot-ready | 1.172 ms | 321 ms |
| Intent yolunda FCP → robot-ready | 1.403 ms | 528 ms |

Idle cold run'ları navigation→ready 6.849,7 / 2.100 / 2.107,8 ms'dir; ilk koşu scene download outlier'ı olarak saklandı, silinmedi. Bu run'da scene isteği 1.210–4.916 ms arasında tamamlandı. Diğer cold scene download pencereleri 604 ve 614 ms'dir. Her ölçümde tam 1 scene request ve 1 canvas vardır.

Warm cache'te scene ve WASM request kayıtları yine birer adettir fakat encoded transfer 0'dır. Import cold yaklaşık 128–135 ms, warm yaklaşık 111–118 ms; mount sonrası remote scene parse/runtime initialization robot-ready zamanının kalan kısmını oluşturur.

## 7. Kod değişiklikleri ve ölçülen etkileri

- Hero/PageHero LCP metinlerinden opacity/translate reveal başlangıcı kaldırıldı: mobile-full LCP 14.383 → 2.950 ms, desktop-full 2.633 → 631 ms; pricing 2.943 → 2.790 ms. Ana görsel kompozisyon ve CLS 0 korundu.
- Full profile activation, ilk intent veya 900 ms + idle callback sonrasına taşındı; localhost `qa-experience=full` de aynı production scheduler yolunu kullanıyor. Full yapısal assertion hâlâ 1 scene/1 canvas.
- Spline import/mount/onLoad/ready ve profile/intent performance mark'ları eklendi; route cleanup sırasında geç microtask/state update engellendi.
- Header/hero kritik olmayan Next Link prefetch'leri ve aşağıdaki Vela görselinin `priority` yüklemesi kaldırıldı. Mobile-lite istek 30 → 22, transfer 417.780 → 300.338 B; pricing istek 29 → 16, transfer 394.676 → 257.275 B oldu.
- Kullanılmayan Geist Mono kaldırıldı; monospace token sistem font stack'ine bağlandı. İki font request'i ve yaklaşık 39 KB cold transfer elendi.
- Robot story controller'ın bölüm başına ResizeObserver'ları kaldırıldı; scroll/resize ölçümü mevcut tek RAF batch'inde kaldı.
- Lighthouse script'i cold/warm üçer run, medyan + outlier, trace/devtools, LCP element/subpart, long task, main-thread, bootup, transfer ve full/lite structural assertion üretecek şekilde sertleştirildi.
- Gerçek Firefox/WebKit Spline script'i ve 60 saniyelik hardware soak testi eklendi.

Final cold önce/sonra:

| Profil | Perf | LCP | TBT | İstek | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile full | 40 → 64 | 14.383 → 2.950 ms | 4.222 → 2.543 ms | 42 → 34 | 2.446.800 → 2.328.966 B |
| Mobile lite | 93 → 94 | 3.109 → 2.948 ms | 17 → 34 ms | 30 → 22 | 417.780 → 300.327 B |
| Desktop full | 58 → 81 | 2.633 → 631 ms | 751 → 424 ms | 42 → 34 | 2.449.028 → 2.329.359 B |
| Pricing mobile | 94 → 95 | 2.943 → 2.790 ms | 30 → 35 ms | 29 → 16 | 394.676 → 257.273 B |

Lite/pricing TBT'deki küçük artış hedefin çok altındadır fakat gizlenmedi. LCP bu iki Spline'sız profilde hâlâ 2.500 ms bütçesini geçiyor.

## 8. Spline kaynak erişim durumu

Repo içinde düzenlenebilir `.spline` kaynak projesi yoktur; yalnız uzak production `scene.splinecode` URL'si bulunur. Lisans/self-host/değiştirme yetkisi doğrulanamadığı için binary hack'lenmedi, kopyalanmadı ve scene URL'si değiştirilmedi.

Yetkili kaynak sahibi için obje/material/texture/light/event envanteri, en az %20 scene transfer azaltma hedefi ve yeniden export doğrulama matrisi `qa/SPLINE-SOURCE-OPTIMIZATION-BRIEF.md` içinde teslim edildi.

## 9. Scene öncesi/sonrası boyut ve envanter

| Ölçüm | Step-2 | Step-3 | Karar |
| --- | ---: | ---: | --- |
| Scene cold transfer | 1.245.959 B | 1.245.964 B hardware / 1.245.593 B LH medyan | Kaynak değişmedi; küçük fark transfer ölçüm/header muhasebesidir, optimizasyon kazancı sayılmadı. |
| Modelling WASM cold transfer | 190.282 B | 190.282 B hardware / 189.875 B LH medyan | Kaynak sürümü aynı; değişmedi. |
| Obje | 107 | 107 | Değişmedi. |
| Event | 14 | 14 | Değişmedi. |
| Variable | 0 | 0 | Değişmedi. |

## 10. Full/lite/none profil matrisi

| Koşul | Sonuç | Scene / canvas |
| --- | --- | ---: |
| Gerçek hardware WebGL, uygun politika | `candidate` → intent/idle sonrası `full` | 1 / 1 |
| SwiftShader/llvmpipe/software renderer | `lite` | 0 / 0 |
| Reduced motion | `none` | 0 / 0 |
| Save-Data | `none` | 0 / 0 |
| Düşük bellek | `none` | 0 / 0 |
| WebGL yok / context loss / session failure | fallback `none` | 0 / 0 |

Dar viewport/coarse pointer tek başına düşük donanım sayılmıyor. Safari'de `deviceMemory` yokluğu otomatik none üretmiyor. Probe context bırakılıyor. QA override yalnız loopback origin'de etkin; canonical/SEO alternatif üretmiyor. Orientation/profile değişimlerinde duplicate request/canvas oluşmadı.

## 11. Cold/warm Lighthouse üç koşu ve medyanları

Üçlü değerler run sırasındadır. Bütün profil/koşullarda A11y 100, SEO 100, Best Practices 81 ve CLS 0'dır.

| Profil/cache | Perf üçlü → medyan | LCP üçlü → medyan | TBT üçlü → medyan | FCP medyan |
| --- | ---: | ---: | ---: | ---: |
| Mobile full cold | 63/65/64 → 64 | 2.950/2.802/2.963 → 2.950 ms | 2.525/2.543/2.611 → 2.543 ms | 1.533 ms |
| Mobile full warm | 71/71/71 → 71 | 1.250/1.286/1.306 → 1.286 ms | 2.781/2.448/2.863 → 2.781 ms | 1.230 ms |
| Mobile lite cold | 94/94/94 → 94 | 2.943/2.959/2.948 → 2.948 ms | 30/45/34 → 34 ms | 1.533 ms |
| Mobile lite warm | 100/100/100 → 100 | 1.258/1.269/1.250 → 1.258 ms | 0/0/0 → 0 ms | 1.231 ms |
| Desktop full cold | 75/81/81 → 81 | 630/633/631 → 631 ms | 590/424/421 → 424 ms | 432 ms |
| Desktop full warm | 77/80/79 → 79 | 351/350/350 → 350 ms | 537/476/493 → 493 ms | 350 ms |
| Pricing mobile cold | 95/95/95 → 95 | 2.790/2.790/2.807 → 2.790 ms | 31/35/52 → 35 ms | 1.533 ms |
| Pricing mobile warm | 100/100/100 → 100 | 1.230/1.231/1.230 → 1.230 ms | 0/0/0 → 0 ms | 1.230 ms |

Structural probe her full run'da 1 scene + 1 canvas, lite/pricing'de 0 + 0 doğruladı. Lighthouse'ın rapor üretmesi PASS; performans bütçeleri ise ayrı değerlendirilip FAIL oldu.

## 12. Headless software WebGL ile gerçek hardware ayrımı

Üç veri düzlemi birbirine karıştırılmadı:

- Gerçek ürün açılışı: hardware mobile viewport'ta HTML H1 yaklaşık 128–316 ms; idle robot-ready cold medyan 2.108 ms, warm 1.368 ms; intent sonrası cold 1.172 ms, warm 321 ms.
- Headless software WebGL: mobile-full cold Perf 64 / LCP 2.950 / TBT 2.543 ms; desktop-full cold Perf 81 / LCP 631 / TBT 424 ms. TBT Spline runtime/SwiftShader evaluation'dan geliyor.
- Gerçek hardware sahne akıcılığı: 60,002 FPS / 16,666 ms average / 16,70 ms p95; bu açılış LCP kanıtı değildir.

Warm full TBT'nin düşmemesi, ağ transferinin 0 olmasına rağmen runtime evaluation/scene initialization'ın her navigation'da yeniden çalıştığını gösterir. Hardware FPS'nin 60 olması bu açılış maliyetini geçersiz kılmaz.

## 13. FPS, p95, heap ve soak sonucu

RTX 4080 Laptop GPU, ANGLE/D3D11 üzerinde hero → hizmetler → Vela → fiyat → final arasında 60 saniye scroll/idle soak:

| Ölçüm | Sonuç |
| --- | ---: |
| Süre / sample | 60 saniye / 3.601 frame |
| Stage değişimi | 13 |
| Ortalama FPS | 60,002 |
| Ortalama frame | 16,666 ms |
| p95 frame | 16,70 ms |
| Canvas | 1 |
| Context loss | 0 |
| GC heap önce / sonra | 12.462.876 / 13.854.924 B |
| Heap delta | 1.392.048 B |

Lifecycle 10 home → inner → home E2E döngüsünde GC heap delta 1.480.088 B'dir; 8 MiB bütçesinin altında. Listener snapshot sabit: pointermove 2, resize 1, scroll 1, visibilitychange 0. Inner route'larda canvas 0; her home mount'unda canvas 1 ve mevcut mimariye uygun toplam 11 scene request doğrulandı.

## 14. Fiziksel cihaz sonucu

Fiziksel iPhone/Pixel ekranı veya telemetry erişimi yoktu. Emülasyon fiziksel cihaz PASS'i olarak sunulmadı. Cold/warm, portrait/landscape, Wi-Fi/4G, 60 saniye thermal/scroll, background/foreground, touch/CTA ve kullanıcı onayı alanları `qa/PHYSICAL-MOBILE-SPLINE-CHECKLIST.md` içinde **PENDING** teslim edildi.

## 15. Firefox/WebKit gerçek Spline sonucu

Yeni gerçek production scene koşusu iki engine'de de tamamlandı:

| Engine | Scene / canvas | Renderer | Scroll stage | Error | Context-loss fallback |
| --- | ---: | --- | --- | ---: | --- |
| Firefox | 1 / 1 | ANGLE, NVIDIA GTX 980 veya benzeri | `service-web` | 0 | PASS |
| WebKit | 1 / 1 | Apple GPU | `service-web` | 0 | PASS |

Her ikisinde hero screenshot üretildi, robot ready/görünür oldu ve context loss sonrası güvenli fallback doğrulandı. Kanıt: `qa/network/step-3/cross-browser-spline.json`; screenshot'lar ignore edilen `qa/screenshots/step-3/cross-browser-spline/` yolundadır.

## 16. ESLint advisory kararı

- `npm audit --omit=dev`: PASS, 0 production vulnerability.
- `npm audit`: FAIL, yalnız dev zincirinde 9 high.
- Zincir: ESLint 9.39.5 / eslint-config-next 16.2.11 → minimatch 3.1.5 / brace-expansion 1.1.16 ve bağlı lint plugin'leri.
- `npm audit fix --dry-run`: güvenli non-breaking çözüm yok; `--force` kullanılmadı.
- Node22 üzerinde izole `npx --package eslint@10.8.0 -- eslint .` testi FAIL: `eslint-plugin-react` `react/display-name` kuralında `contextOrFilename.getFilename is not a function`.

Dolayısıyla ESLint 10 major upgrade'i uygulanmadı; çalışan lint kapsamı korunarak kontrollü plan `qa/ESLINT-10-MIGRATION-BRIEF.md` içine yazıldı. Advisory runtime bundle'a girmez; production audit 0 bunu ayrıca doğrular.

## 17. Responsive ve görsel regresyon

`qa:screenshots` Chromium hardware üzerinde 8/8 PASS ve 218 screenshot üretti. 320×568 mobile-full hero, 390×844 hizmet başlangıcı, 844×390 açık menü, 768×1024 tablet, 1440×900 desktop hero/final CTA, 1920×1080 desktop, mobile-lite, reduced-motion, blocked scene fallback, 200% reflow, forced-colors ve pricing mobile yolları kapsandı.

HTML/UI screenshot karşılaştırması + canvas structural assertion + robot kadraj incelemesinde H1/CTA ilk paint'te görünür, fallback/canvas kadrajı uyumlu, final CTA gradient'i korunmuş, yatay taşma/metin-robot çakışması yok, menü/FAQ/CTA çalışır ve robot layer linkleri engellemez durumda kaldı. Hareketli canvas için sahte pixel-perfect eşik kullanılmadı.

## 18. Komutların gerçek sonuçları

Node 22 final zinciri:

- `npm ci`: PASS — 497 paket.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS — 2 dosya, 16/16.
- `npm run build`: PASS — 28 route.
- `npm run test:smoke`: PASS — route/API 200/400/404/429/503 matrisi.
- `npm run test:e2e`: PASS — Chromium 42/42.
- `npm run test:cross-browser`: PASS — Firefox/WebKit core 4/4.
- `npm run qa:spline-cross-browser`: PASS — gerçek scene iki engine'de 1 request/1 canvas.
- `npm run qa:screenshots`: PASS — 8/8, 218 screenshot.
- `npm run qa:lighthouse`: rapor üretimi PASS — 4 profil × cold/warm × 3 = 24/24 JSON; performans hedef kararı FAIL.
- `npm audit --omit=dev`: PASS — 0 vulnerability.
- `npm audit`: FAIL — dev-only 9 high.
- ESLint 10 compatibility probe: FAIL — plugin API uyumsuzluğu.
- `git diff --check`: PASS.

## 19. Kalan riskler

1. Mobile-full cold Perf 64 / LCP 2.950 / TBT 2.543 ms; 85 / 2.500 / 200 hedeflerini geçmiyor. Baskın kalan maliyet üçüncü taraf runtime + SwiftShader ve düzenlenemeyen source scene'dir.
2. Desktop-full cold Perf 81 / TBT 424 ms hedef dışı; gerçek hardware sürekli render akıcılığı hedefi ise geçiyor.
3. Spline yüklemeyen mobile-lite cold LCP 2.948 ms ve pricing cold LCP 2.790 ms; ortak cold font/CSS/render yolu 2.500 ms hedefini geçemedi. Inline CSS ve font optional deneyleri gerilettiği için geri alındı.
4. Fiziksel iPhone/Pixel thermal/heap/touch doğrulaması PENDING'dir.
5. Editable Spline kaynağı ve lisans/yetki olmadığından geometry/material/event optimizasyonu uygulanamadı.
6. Local HTTP Best Practices 81'dir; production HTTPS 95+ bu oturumda ölçülmedi.
7. Development audit 9 high; ESLint 10 mevcut React lint plugin'iyle uyumsuzdur.
8. Third-party Spline runtime public ölçüm noktası sunmadığından WASM compile ve instantiate süresi trace'teki genel initialization penceresinden güvenilir biçimde ayrılamadı.

## 20. Nihai karar

**FAIL.** Önceki ürün deneyimi ve kalite kapıları regressionsız korundu; LCP outlier kök nedeni giderildi, cold transfer/istek sayısı azaltıldı, Node 22 metodolojisi cold/warm trace ve structural assertions ile sertleştirildi, gerçek GPU 60 FPS/p95 16,70 ms ve lifecycle heap bütçesi geçti. Ancak Definition of Done'daki cold mobile-lite/pricing LCP ile full Performance/TBT hedefleri geçmedi. Fiziksel cihaz pending'i ve Spline source erişimsizliği de açık risk olarak kaldı. Commit/push yapılması bu performans FAIL kararını değiştirmez.
