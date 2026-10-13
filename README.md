## Şehirlere elle fotoğraf ekleme

1. Fotoğrafları şehir klasörüne koyun. Örneğin Gaziantep için `public/city-photos/27/`.
2. `src/assets/cities.json` içinde şehrin `photosPath` alanını klasöre ayarlayın. Örneğin: `"photosPath": "city-photos/27/"`. Klasörün altındaki JPG, PNG, WebP, GIF ve AVIF dosyaları otomatik bulunur.
3. Değişiklikleri GitHub'a gönderip GitHub Pages deploy'unun tamamlanmasını bekleyin. Şehri açınca klasördeki fotoğraflar galeride görünür.

Fotoğraf yolları `public/` klasörüne göre yazılır; başına `/` koymayın. Fotoğraflar depoda ve GitHub Pages sitesinde herkese açık olacağından özel görseller eklemeyin.
