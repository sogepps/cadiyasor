# Cadıya Sor — Cevaplar Kitabı 2.0

Cadıya bir soru sor, kaderini üç yoldan birinden oku. Expo (React Native) ile baştan yazıldı,
75 dilde, internetsiz çalışır. Play paketi `com.Soge.CadiyaSor`.

## Neler var

| Bölüm | Ne yapar |
|---|---|
| Kazan | Parmağınla ovala; iksir kaynar, küre yükselir, parşömen cevabı getirir. İksir cevabın rengine döner. |
| Büyü Kitabı | Kitabı basılı tut, sayfalar hışırdasın; bırakınca cevap sayfası açılır (sayfa numarasıyla). |
| Kristal Küre | Telefonu salla ya da sisi parmağınla döndür; evet / hayır / belirsiz cevap kürede belirir. |
| Günün Kehaneti | Günde bir kart: gerçek ay evresi, şanslı sayı, renk ve saat, üst üste gün serisi. |
| Kehanet Defteri | Tüm okumalar, favoriler; dil değişince cevaplar da o dile döner. |
| Paylaş | Cevap, gece temalı bir kart görseli olarak paylaşılır. |

Aynı gün yazılı olarak aynı soruyu sorarsan cadı hatırlar ve aynı cevabı verir. Cevaplar kurulum
başına rastgele bir tuzla belirlenir, yani her telefonun kaderi farklıdır.

## Klasörler

```
App.tsx                 fontlar, sağlayıcılar, navigasyon
src/screens             Home, Cauldron, Book, Ball, Journal
src/components          gece gökyüzü, ay (gerçek evre), cadı, kazan, parşömen, kart, ayarlar…
src/oracle              cevap seçimi, ay evresi, günlük kehanet, paylaşım
src/content             75 dilin cevap/kehanet/soru dosyaları (üretilmiş)
src/i18n                dil listesi, arayüz sözlükleri (üretilmiş), RTL
src/ads                 geçiş reklamı (3 kehanette bir, en az 60 sn arayla) ve UMP onayı
tools/art               özgün SVG çizimler → PNG (node tools/art/render.cjs)
tools/audio             sentezlenmiş sesler ve müzik (node tools/audio/synth.mjs)
tools/tx                çeviri kaynağı, doğrulayıcı ve üretici
tools/store             ekran görüntüsü, mağaza görselleri ve Play API yükleyici
```

Bütün görseller ve sesler bu projede üretildi; üçüncü taraf görsel ya da ses yok.

## Derleme (yerel, EAS yok)

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease     # test APK
cd android && ./gradlew bundleRelease       # Play için AAB
```

İmza anahtarı `E:\Soge\cadi.keystore` (alias `soge`); şifreler depo dışında,
`~/.gradle/gradle.properties` içindeki `CADIYASOR_UPLOAD_*` özelliklerinde. Tanımlı değilse
derleme debug anahtarıyla imzalanır.

## Çeviri

`tools/tx/src/catalog.json` İngilizce/Türkçe kaynaktır. Her dilin çıktısı
`tools/tx/out/<dil>/` altındadır; `node tools/tx/validate.cjs <dil> all` ile doğrulanır,
`node tools/tx/generate.cjs` ile uygulamaya alınır.

## Mağaza

```bash
EXPO_PUBLIC_SHOTS=1 ./gradlew assembleRelease   # ekran görüntüsü derlemesi (reklamsız, sabit sahneler)
node tools/store/capture.cjs                    # 6 sahne × 75 dil
node tools/store/compose.cjs                    # Masaüstü/CadiyaSor-GooglePlay
node tools/store/play-upload.cjs --details --listings --bundle <aab> --notes tools/store/release-notes.json
```
