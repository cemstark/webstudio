# Spline Kaynak Optimizasyon Brief'i

Tarih: 26 Temmuz 2026

## Erişim ve yetki sınırı

Repo içinde düzenlenebilir `.spline` projesi veya kaynak export bulunmuyor. Uygulama yalnız kullanıcı tarafından sağlanan uzak production URL'sini kullanıyor:

`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`

README'deki lisans notuna göre bu binary'nin yeniden dağıtım/self-host hakkı bağımsız olarak doğrulanamadı. Bu nedenle uzak binary değiştirilmedi, repoya kopyalanmadı ve alternatif scene URL'si üretilmedi. Aşağıdaki işlemler Spline editöründe, kaynak projenin yetkili sahibi tarafından yapılmalıdır.

## Doğrulanmış başlangıç envanteri

| Ölçüm | Başlangıç |
| --- | ---: |
| Production scene cold transfer | 1.245.959 byte |
| Modelling WASM cold transfer | 190.282 byte |
| Scene objesi | 107 |
| Spline event kaydı | 14 |
| Spline variable | 0 |
| Runtime client chunk | yaklaşık 2,02 MB uncompressed |

Step-3 Lighthouse trace'inde full profil TBT'sinin baskın kaynağı Spline runtime/scene initialization'dır. Node 22 mobile SwiftShader baseline'ında runtime chunk üzerinde saniyeler süren script evaluation ve 300–2.800 ms aralığında long task'lar görüldü. Lite profilde aynı chunk, scene ve WASM hiç yüklenmediğinde TBT 16–32 ms aralığında kaldı. Bu ayrım kaynak sahne ve software renderer maliyetini açık biçimde izole eder.

## Spline editöründe yapılacaklar

1. 107 objeyi ad, görünürlük, mesh/material, polygon, texture, ışık, shadow, animation ve event bağı açısından dışa aktarın.
2. Kamera tarafından hiçbir chapter'da görülmeyen, başka mesh içinde kalan veya aynı yüzeyi tekrarlayan objeleri kaldırın. Silmeden önce 14 event hedefiyle çapraz kontrol yapın.
3. Aynı geometriyi kullanan tekrarları instancing'e çevirin. Birlikte hareket eden ve ayrı event hedefi olmayan statik parçaları kontrollü birleştirin.
4. Silueti ve yakın plan yüzleri koruyarak görünmeyen arka/alt yüzlerde polygon azaltın. Her azaltma turunu desktop hero, mobile hero ve final CTA kadrajında karşılaştırın.
5. Aynı görsel sonucu üreten tekrarlı materyalleri tek materyalde birleştirin. Gereksiz layer, blend, refraction, transmission ve çoklu outline katmanlarını kaldırın.
6. Texture'ları gerçek ekrandaki maksimum kaplama boyutuna göre küçültün; aynı texture kopyalarını tek asset'e bağlayın. Alpha gerekmeyen dosyalarda alpha kanalını kaldırın ve Spline'ın desteklediği sıkıştırılmış formatı kullanın.
7. Gerçek zamanlı ışık, shadow ve reflection sayısını çıkarın. Kadraja ölçülebilir katkısı olmayanları kapatın; mümkün olan ışığı baked görünümle değiştirin.
8. 14 event'in her birini gerçek kullanıcı akışında tetikleyin. Çalışmayan, erişilemeyen veya aynı davranışı yineleyen event'leri kaldırın. Event hedefi silinen objelerde dangling kayıt bırakmayın.
9. Sürekli animation loop gerektirmeyen durumları event/on-demand animasyona çevirin. Scene hareketsizken `renderOnDemand` ile frame üretiminin durduğunu doğrulayın.
10. Aynı scene içinde belgelenmiş, public bir mobile kalite yolu mümkünse texture/shadow/effect bütçesini düşürün; ayrı veya izinsiz yeni bir scene URL'si üretmeyin.

## Yeniden export hedefleri

- Scene cold transfer: ilk hedef en az %20 düşüş (yaklaşık 997 KB veya altı), stretch hedef 850 KB.
- Obje: görsel/event davranışını koruyarak 107'den ölçülebilir düşüş.
- Kullanılan event: yalnız doğrulanmış kullanıcı davranışları; dangling hedef sıfır.
- Hardware desktop: 55–60 FPS, p95 yaklaşık 20 ms veya altı.
- Mobile full SwiftShader ölçümü: runtime long task toplamında ve TBT'de ölçülebilir düşüş; hedef mobile full TBT 200 ms olsa da renderer/runtime sınırı ayrı raporlanmalı.
- Scene-ready: cold ve warm ayrı; kod tarafındaki scheduler'a ek olarak kaynak export gerilemesi yaratmamalı.

## Export sonrası doğrulama

1. Yetkili production URL güncellemesi için ayrı onay alın; mevcut sabiti sessizce değiştirmeyin.
2. Node 22 ile temiz `npm ci` ve production build alın.
3. Full/lite/none structural matriste full için tam 1 scene + 1 canvas, lite/none için 0 scene + 0 canvas doğrulayın.
4. Cold/warm üçer Lighthouse koşusunu mobile full, mobile lite, desktop full ve pricing mobile için çalıştırın.
5. Scene/WASM transferini, import/download/onLoad/ready timeline'ını ve en büyük long task'ları önceki export ile karşılaştırın.
6. 320×568, 390×844, 844×390, 768×1024, 1440×900 ve 1920×1080 kadrajlarında robotun siluet, ışık, materyal, final CTA ve metin çakışmasını görsel inceleyin.
7. 10 home → inner → home döngüsü, context loss, offline, timeout ve hidden/inactive `stop()` davranışlarını yeniden çalıştırın.
8. En az 60 saniye hardware scroll/idle soak ile FPS, p95, heap, canvas ve context loss değerlerini kaydedin.
