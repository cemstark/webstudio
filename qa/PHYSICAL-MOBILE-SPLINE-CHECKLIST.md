# Fiziksel Mobil Spline Kontrol Listesi

Tarih: 26 Temmuz 2026

Durum: **PENDING — fiziksel iPhone/Pixel cihazı ve cihaz telemetry erişimi bu Codex oturumunda yoktur.** Emülasyon veya desktop touch viewport sonucu fiziksel cihaz sonucu olarak kabul edilmemelidir.

## Test bilgileri

- Production URL / commit: ______________________________
- Test eden kişi: ______________________________
- Tarih/saat: ______________________________
- iPhone modeli / iOS / Safari: ______________________________
- Pixel modeli / Android / Chrome: ______________________________
- Ağ (Wi-Fi / throttled / 4G): ______________________________
- Pil yüzdesi ve başlangıç sıcaklık durumu: ______________________________

## Her cihazda uygulanacak matris

Her maddeyi önce cold cache, sonra warm cache ile portrait ve landscape yönlerinde çalıştırın.

- [ ] Ana sayfa ilk HTML'de H1, açıklama, iki CTA ve markalı fallback görünür; boş alan/spinner yok.
- [ ] Uygun cihaz politikasında profile `full` olur, yalnız 1 scene isteği ve 1 canvas oluşur.
- [ ] Reduced Motion açıkken scene/canvas 0 ve statik deneyim kullanılabilir.
- [ ] Save-Data/Data Saver açıkken scene/canvas 0 ve içerik eksiksiz.
- [ ] Robot-ready süresi navigation başlangıcından kaydedildi: cold ______ ms / warm ______ ms.
- [ ] İlk kullanıcı niyetinden robot-ready'ye süre kaydedildi: ______ ms.
- [ ] Fallback → canvas geçişinde flash, sert kadraj değişimi, metin çakışması veya CLS yok.
- [ ] Robot hazır olmadan hizmetler bölümüne scroll edilirse doğru chapter state'inde açılır.
- [ ] 60 saniye hero → hizmetler → Vela → fiyat → final scroll/idle tamamlandı.
- [ ] Touch scroll doğal; scroll-jacking, zoom engeli veya takılı kalan pointer katmanı yok.
- [ ] Menü aç/kapat/Escape eşdeğeri, FAQ, CTA, Vela ve fiyat bağlantıları çalışıyor.
- [ ] Portrait ↔ landscape değişiminde duplicate canvas/request veya remount fırtınası yok.
- [ ] Background'a alıp 10 saniye sonra dönünce scene doğru durur/devam eder; ikinci canvas oluşmaz.
- [ ] Ağ offline yapıldığında fallback'e geçer; aynı session'da sonsuz retry yok.
- [ ] 60 saniye sonunda görünür frame drop/jank notu: ______________________________
- [ ] Thermal uyarı veya belirgin yavaşlama: Yok / Var — ayrıntı: ______________________________
- [ ] Browser console/page error: Yok / Var — ayrıntı: ______________________________

## Kullanıcı onayı

- iPhone kararı: [ ] PASS [ ] FAIL [ ] TEST EDİLMEDİ
- Pixel kararı: [ ] PASS [ ] FAIL [ ] TEST EDİLMEDİ
- Onaylayan: ______________________________
- Tarih: ______________________________
- Notlar / ekran kaydı bağlantıları: ______________________________
