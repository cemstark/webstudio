# Adım 1B — Spline Robot Mobil/Tablet Uyarlama Raporu

Tarih: 25 Temmuz 2026

Başlangıç commit’i: `4277289 feat: transform homepage with interactive Spline robot story`

Branch: `main`

Ortam: Windows, Node `v25.8.0`, npm `11.11.0` (repo production standardı Node 22.x)

## 1. Başlangıç durumu ve kök neden

Başlangıç worktree temizdi. `src/lib/webgl.ts`, full profili `pointer:fine` ve en az 900 px genişliğe bağladığı; `ExperienceShell` yalnız full profilinde Spline’ı mount ettiği için gerçek sahne touch telefonlarda hiç yüklenmiyordu. 900 px TypeScript eşiği ile 999 px CSS eşiği ayrıca tabletlerde çelişik state üretiyordu. Mobil hizmet enstrümanları gizlenmiş, robot da hizmet/proje/fiyat/süreç/SSS bölümlerinde `opacity:0` yapılmıştı.

Başlangıç kanıtı:

- Desktop full: profil `full`, 1 canvas, 1 scene isteği, 29 resource isteği.
- Mobile lite: profil `lite`, 0 canvas, 0 scene isteği, 24 resource isteği.
- Baseline Lighthouse home mobile-lite: Performance 94, A11y 96, Best Practices 81, SEO 100; LCP 3.054 ms, CLS 0, TBT 22 ms.
- Baseline görselleri: `qa/step-1b/baseline/after/{390x844,768x1024,1440x900,1920x1080}/` (lokal QA artefaktı, Git dışında).

## 2. Capability ve profil mimarisi

Render tier ile input türü ayrıldı. `fine/coarse/hover`, yalnız etkileşim yönlendirmesini belirliyor; scene yükleme kararı vermiyor. Profil hydration sırasında `none` başlıyor ve client capability kontrolünden sonra deterministik olarak seçiliyor. Orientation/viewport değişimi profil seçimini yeniden çalıştırmadığı için ikinci instance veya profile flip-flop oluşmuyor.

| Yol | Koşul | Spline runtime/scene | Görsel sonuç |
| --- | --- | --- | --- |
| Full | motion normal, Save-Data kapalı, WebGL çalışıyor, açık düşük kapasite yok, session failure yok | 1 lazy runtime, 1 scene, 1 canvas | Gerçek Spline robot; touch telefon/tablet dahil |
| Lite | `<4 GB` bildirilen bellek, `<=2` logical CPU veya 2G/slow-2G | 0 | CSS robot + hizmete özel HTML/CSS enstrümanları + final rehber |
| None | reduced-motion, Save-Data, WebGL yok/context loss, scene abort/404/500/offline veya session failure | 0 | Server-rendered statik robot/fallback, tüm metin ve CTA’lar |

Safari’de `deviceMemory` bulunmaması düşük kapasite kabul edilmiyor. User-agent profiling yok. İçerik breakpoint’i CSS’te 960 px olarak tekleştirildi; 899/900/959/960/961 geçişleri E2E ile kontrol edildi. Scene, kritik HTML paint’ini engellemeden ilk anlamlı input veya 900 ms idle penceresinde başlıyor. Timeout 12 saniye; hata aynı session içinde hatırlanıyor ve retry döngüsü yok. Yerel performans QA’sı için `?qa-experience=lite` yalnız `localhost` ve `127.0.0.1` üzerinde çalışır.

## 3. Mobil storyboard

- Hero: 320/390 px portrait’te H1, açıklama, birincil CTA ve gerçek robot yüz/gövdesi aynı ilk viewport’ta; coarse-pointer için hatalı “hareket ettirin” metni gizli. `svh`/`dvh` ve safe-area alt boşluğu var.
- Manifesto: robot düşük opaklıklı devam sinyali olarak geri çekiliyor; içerik DOM’da ve motion/JS olmadan görünür.
- Dört hizmet: 01/04–04/04 bilgileri korunarak grid/frame, tarama halkası, telefon akışı ve ürün/ödeme düğümü için ayrı HTML/CSS enstrümanları eklendi. Mobil görsel slot 16–24 svh bandında; ikinci WebGL yok.
- Vela: ilk proje; görsel öncelikli, mobile crop kontrol edildi; “Proje detayı” ve `https://velawindsurfing.com` canlı bağlantısı 44 px touch hedefleriyle görünür.
- Fiyat: iki dikey panel, tabular rakamlar, bütün değişmez fiyatlar ve dış sağlayıcı maliyet notu; karşılaştırma CTA’sı mobilde tam genişlik ve 48 px.
- Süreç: tek kolon statik zaman çizgisi. SSS: semantik `details/summary`, en az 48 px. Final: sağ-alt robot kadrajı, metin koruma gradient’i, 48 px CTA ve safe-area.

## 4. Touch, lifecycle ve tek instance kanıtı

- Robot katmanında `touch-action: pan-y pinch-zoom`; canvas içerik/CTA pointer event’lerini touch modunda almıyor.
- CDP gerçek touch event dizisiyle robot üzerinden dikey swipe sonrasında `scrollY > 20`; hero CTA aynı canvas açıkken `/iletisim` rotasına geçti.
- Portrait → landscape → breakpoint sınırları → portrait: canvas sayısı 1, scene isteği 1.
- Scene yüklenirken orientation değişimi: istek 1, canvas 1.
- 6 adet home → inner route döngüsünde home’da 1, iç rotada 0 canvas; mount başına beklenen toplam 6 scene, birikme yok.
- Sekme/aktif chapter yaşam döngüsü `Application.play()/stop()` ile bağlı. Robotun görünmediği proje/fiyat/SSS bölümlerinde render duruyor. `webglcontextlost`, abort ve unmount cleanup testleri geçti.
- Production remote scene görsel smoke testinde mobil matrix boyunca scene isteği 1 ve canvas 1 assertion’ı geçti.

Scene HEAD boyutu 1.349.622 byte; Lighthouse sıkıştırılmış transfer medyanı 1.245.943 byte. Full profilde toplam script transferi 825.397 byte, lite profilde 232.488 byte; Spline eşleşen runtime chunk transferi 190.281 byte. Full toplam transfer 2.445.821 byte/41 istek, lite 417.597 byte/30 istek.

## 5. Viewport ve görsel QA

Touch/mobile UA, `isMobile:true`, `hasTouch:true`, coarse pointer ve iPhone 13 DPR/UA context’i ile kontrol edilen viewport’lar:

- Portrait: 320×568, 360×800, 375×667, 390×844, 430×932, 768×1024, 820×1180.
- Landscape: 844×390, 932×430, 1024×768.
- Desktop: 1440×900, 1920×1080.
- Ek yollar: 200% reflow, reduced-motion, lite, blocked scene, açık mobil menü.

Tur 1 tüm matrisi bölüm bölüm üretti. Tur 2, kritik 320×568, 390×844 ve 844×390 kadrajlarında refinement sonrası tekrar yapıldı. Son kanonik `qa:screenshots` koşusu 390×844, 844×390, 1440×900, 1920×1080 ile üç fallback modunu tekrar üretti ve 5/5 geçti.

After yolları:

- `qa/screenshots/step-1b/after/mobile-full/<viewport>/`
- `qa/screenshots/step-1b/after/desktop-full/<viewport>/`
- `qa/screenshots/step-1b/after/mobile-lite/<viewport>/`
- `qa/screenshots/step-1b/after/motion-disabled/<viewport>/`
- `qa/screenshots/step-1b/after/scene-blocked/<viewport>/`

10 hedef viewport’ta horizontal overflow farkı `<=1 px`; 200% reflow testi de geçti. Son manuel karşılaştırmada 390 portrait hero/final ve 844 landscape hero/final metin–robot–CTA çakışması göstermedi. 1440/1920 robot kadrajı, hizmet geçişleri ve içerik sırası korundu.

## 6. Hata/fallback matrisi

Deterministik route interception ve browser capability testleriyle reduced-motion, Save-Data, düşük bellek, WebGL yok, context loss, offline, scene abort, 404, 500, scene yüklenirken orientation ve scene yüklenirken iç rotaya çıkış test edildi. Her yolda H1/fallback/CTA görünür; teknik hata metni, sonsuz spinner, hydration exception veya console error yok. Reduced/Save-Data/WebGL/lite yollarında Spline asset isteği ve canvas sıfır.

Slow-2G/2G kararı unit test ile lite olarak doğrulandı. CORS/bağlantı reddi, tarayıcı seviyesinde abort yoluyla aynı deterministik session-failure davranışını kullanıyor.

## 7. Production Lighthouse — üç koşu medyanları

Production build, Lighthouse mobile throttling ve headless SwiftShader kullanıldı. `home-mobile-full` normal `/`; `home-mobile-lite` localhost-only `/?qa-experience=lite` ile zorlandı.

| Profil | Perf | A11y | BP | SEO | LCP | CLS | TBT | Scene |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile full | 62 | 100 | 81 | 100 | 3.108 ms | 0 | 2.697 ms | 1 |
| Mobile lite | 93 | 100 | 81 | 100 | 3.102 ms | 0 | 18 ms | 0 |
| Desktop full | 73 | 100 | 81 | 100 | 677 ms | 0 | 650 ms | 1 |
| Pricing mobile | 94 | 100 | 81 | 100 | 2.944 ms | 0 | 34 ms | 0 |

BP 81’in tek yerel nedeni HTTP üzerinde çalışan `is-on-https` audit’idir; production HTTPS sonucu bu lokal koşuyla ölçülmedi. Mobile-lite Performance >=90, A11y/SEO ve CLS/TBT hedefleri geçti; LCP 2,5 saniye hedefini geçemedi. Mobile-full gerçek scene açıkken Performance 85, LCP ve TBT hedeflerini karşılamadı. Bu sonuç saklanmadı: supplied Spline runtime/scene’in yazılım WebGL ana-thread maliyeti 9 long task ve yaklaşık 2,7 saniye TBT üretiyor. Başlangıç desktop Lighthouse 100 skoru sahne 12 saniyelik idle nedeniyle audit içinde yüklenmeden alınmıştı; yeni 900 ms ürün gereksinimi scene maliyetini ölçüme dahil ediyor. Fiziksel cihaz GPU profili alınmadan bu risk kapanmış sayılmamalı.

## 8. Regresyon ve komut sonuçları

- `npm ci`: PASS; 9 high audit advisory bildirildi.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS — 2 dosya, 14 test.
- `npm run build`: PASS — 28 static/dynamic route üretimi.
- `npm run test:smoke`: PASS — rotalar, 404, Zod/SMTP/minimum süre/rate-limit durumları.
- `npm run test:e2e`: PASS — 31/31.
- `npm run qa:screenshots`: PASS — son tur 5/5; tüm matrix önceki Tur 1 koşularında üretildi.
- `npm run qa:lighthouse`: PASS — profiller üçer koşu; bazı Windows Chrome temp dizin temizlemelerinde EPERM uyarısı oldu fakat JSON raporlar üretildi ve script sonuçları doğruladı.
- `npm audit --audit-level=high`: FAIL — ESLint toolchain altında `brace-expansion/minimatch` zincirinde 9 high advisory; önerilen otomatik çözüm ESLint 10 breaking upgrade gerektiriyor, `--force` uygulanmadı.
- `git diff --check`: PASS.

Rotalar, SSG proje slug’ları, canonical/metadata/JSON-LD, sitemap/robots/manifest, iletişim formu güvenlik durumları ve Hostinger `npm ci → build → start` akışı smoke/build ile korundu. Fiyatların kaynağı değiştirilmedi; Vela ilk proje ve canlı URL doğru.

## 9. LAN doğrulaması

Aktif özel Wi-Fi IPv4 adresi çalışma anında adaptörden dinamik bulundu. Development server `0.0.0.0:3000` üzerinde çalıştırıldı ve bilgisayardan `http://<aktif-Wi-Fi-IPv4>:3000` için HTTP 200 alındı; test sonunda yalnız bu server PID’i kapatıldı ve port 3000 tekrar boş bırakıldı. Adres kaynak koda veya Git geçmişine hard-code edilmedi; çalışma anındaki tam URL teslim mesajında verilir. Telefondaki `localhost:3000` bilgisayarı göstermez. Windows Firewall/router ayarı değiştirilmedi. Codex fiziksel telefon ekranını kontrol etmedi; gerçek telefon kullanıcı teyidi bekliyor. Canlı domain, deploy edilmeden bu yerel commit’i göstermez.

## 10. Kalan gerçek riskler

1. Mobile-full headless Lighthouse Performance/LCP/TBT bütçesi karşılanmıyor; fiziksel iPhone/Pixel GPU ve thermal/heap profiliyle XHigh turunda ölçülmeli. Scene sadeleştirmesi Spline kaynak dosyasına erişim gerektirebilir.
2. Mobile-lite ve fiyat rotası LCP medyanı 2,5 saniye hedefinin yaklaşık 0,45–0,60 saniye üzerinde.
3. Fiziksel telefon erişimi LAN üzerinden bilgisayarda HTTP 200’e kadar doğrulandı; ekran/touch sonucu kullanıcı tarafından henüz teyit edilmedi.
4. `npm audit` ESLint dependency zincirindeki 9 high advisory nedeniyle kırmızı; breaking major upgrade ayrı ve kontrollü bir iş olmalı.
5. Uzun süreli fiziksel cihaz thermal/heap testi yapılmadı; otomatik lifecycle/route/context cleanup testleri geçti fakat bir dakikalık gerçek GPU soak fiziksel donanım bekliyor.
