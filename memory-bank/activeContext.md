# Active Context

Ana sayfa dolduruldu: tüm yararlı linkler + ozcankutlu.com blog haberleri.

## Son kararlar

- Yararlı linkler ana sayfada kategori/chip olarak gösteriliyor
- Güncel haberler `externalNewsUrl` ayarından çekiliyor (varsayılan: ozcankutlu.com/tr/blog)
- Saatlik revalidate
- İlk yönetici: kullanıcı yokken `/admin/kurulum` (web); seed isteğe bağlı
- Ana sayfa hero + üst menü/alt bilgi CTA metinleri Admin > Ayarlar'dan
- Blog / hizmet formlarında kaydetmeden önce “SEO kontrolü yap” (metin tabanlı, Blob yok)
- SEO puanı anlam AI’sı değil; uzunluk + anlamsız tuşlama + yazım şüphesi (hece/tuş; sözlük değil)
- Blog SEO: başlık/özet/içerik/SEO alanlarında gibberish + yazım uyarısı
- Haber slaytı: yatay carousel (track + translate); ozcankutlu.com API; Admin’den aç/kapa
- Blog görüntülenme: Post.viewCount; istemci beacon `/api/blog/view`; Admin blog listesinde görünür (GA değil)
- GA4: Admin > Ayarlar’da Measurement ID (G-XXXX); doluysa site layout gtag yükler; rapor analytics.google.com
- Hero evrak yığını: Setting.heroDocs JSON; Admin > Ayarlar’dan 3 belge başlık/satır/mühür
