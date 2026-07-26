# ESLint 10 Migration Brief'i

Tarih: 26 Temmuz 2026

Durum: **AYRI MAJOR MIGRATION GEREKLI — Step-3 kapsaminda upgrade uygulanmadi.**

## Dogrulanmis durum

Node `v22.23.1`, npm `11.11.0` ve guncel lockfile ile:

- `npm audit --omit=dev`: **PASS**, production dependency'lerinde 0 vulnerability.
- `npm audit`: **FAIL**, yalniz gelistirme arac zincirinde 9 high advisory.
- Advisory yolu `eslint@9.39.5` / `eslint-config-next@16.2.11` uzerinden `minimatch@3.1.5` ve `brace-expansion@1.1.16` paketlerine uzaniyor. Bu paketler uygulamanin production client/server bundle'ina girmiyor.
- `npm audit fix --dry-run` guvenli, non-breaking bir cozum sunmuyor. Tam otomatik oneri ESLint `10.8.0` major upgrade'i veya `eslint-config-next` icin hatali/geriye goturen bir major degisiklik oneriyor; `--force` kullanilmadi.
- ESLint `10.8.0` Node engine araligi Node 22.23.1'i destekliyor: `^20.19.0 || ^22.13.0 || >=24`.
- Buna ragmen izole uyumluluk kosusu basarisiz oldu:

  `npx --yes --package eslint@10.8.0 -- eslint .`

  Hata: `eslint-plugin-react` icindeki `react/display-name` kurali `contextOrFilename.getFilename is not a function` ile durdu. Dolayisiyla mevcut Next.js 16 lint plugin zinciri ESLint 10 ile bugun uyumlu degil.

## Neden Step-3'te degistirilmedi

Advisory production runtime'ina tasinmiyor ve runtime audit temiz. Mevcut lint zincirini ESLint 10'a zorlamak lint kapisini tamamen kirmakta; config veya kurallari devre disi birakmak ise advisory'yi gizleyip kalite kapsamini dusurecekti. Bu nedenle calisan ESLint 9 zinciri korundu.

## Kontrollu migration plani

1. `eslint-config-next`, `eslint-plugin-react`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y` ve `typescript-eslint` paketlerinin ESLint 10 uyumlu surumlerini resmi release notlari/peer dependency'leriyle birlikte dogrulayin.
2. Ayri bir branch'te yalniz lint dependency'lerini guncelleyin; `--force` veya audit exit code'u yutan script kullanmayin.
3. Flat config davranisini, Next.js core-web-vitals kurallarini ve repo ozel ignore/config kapsamlarini once/sonra karsilastirin.
4. `npm run lint` sonucunda dosya sayisi veya etkin kural sayisinin azalmadigini kanitlayin. Kural isimlerini sessizce kapatmayin.
5. Node 22 ile `npm ci`, lint, typecheck, unit, build, smoke, Chromium E2E, Firefox/WebKit ve Lighthouse matrisini yeniden calistirin.
6. `npm audit --omit=dev` ve tam `npm audit` sonucunu kaydedin. Hedef: runtime 0 ve development 0; yeni advisory veya lockfile churn varsa migration'i durdurun.
7. Migration'i lint zinciri PASS olmadan ve tam regresyon tamamlanmadan `main` branch'e tasimayin.

## Kabul kriterleri

- ESLint 10 kosusu exception vermeden tamamlanir.
- Next.js/React/a11y/import kurallari onceki kapsamla esdeger veya daha genistir.
- Runtime ve development audit 0 vulnerability verir.
- Uygulama test, build, gorsel ve performans kapilarinda regresyon yaratmaz.
