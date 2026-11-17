# Sinyalden Sohbete

**Canlı site: https://egitim.koraytoksoz.com/mors/**

Mors alfabesini tablodan ezberleyerek değil, kulakla öğreten; telgrafın tarihinden sinyalin fiziğine, anahtarla göndermekten telsizde bir görüşmeye uzanan Türkçe, etkileşimli bir eğitim. Hazırlayan: **Koray Toksöz**

*An interactive Turkish course for learning Morse code by ear: timing, history, CW physics, Koch/Farnsworth training, keying and amateur-radio QSOs. Code: MIT · Content: CC BY 4.0*

## İçerik

| Bölüm | Slaytlar ve deneyler |
|---|---|
| 0. Giriş | Kapak: başlık kendi kodunu gönderir; yazdığınız metni mors olarak dinleyin |
| 1. Nokta ve çizgi | Birim zamanlaması (1-3-1-3-7) · alfabenin tamamı · mors ağacı · harf sıklığı ve kod uzunluğu · hız ve PARIS |
| 2. Telgrafın tarihi | Ulak, optik telgraf ve elektrikli telgraf yarışı · Amerikan ve uluslararası mors · Gerke'nin değişiklikleri · Osmanlı'da telgraf ve telgrafname · SOS ve CQD |
| 3. Sinyalin fiziği | Taşıyıcıyı aç-kapa (CW) · anahtar tıkı ve spektrum · gürültüde dar süzgeç · BFO ve fark tonu |
| 4. Kulakla öğrenmek | Ses kalıbı · Koch yöntemi · Farnsworth · **Koch alıştırması** · **anında tanıma** · Türkçe harfler, rakamlar, noktalama · **çağrı işaretleri ve sık kelimeler** |
| 5. Göndermek | Düz anahtar ve zamanlama çözümlemesi · iambik anahtar (mod A/B) · **gönderme alıştırması** |
| 6. Telsizde mors | Amatör telsiz ve CW bantları · Q kodları ve kısaltmalar · RST raporu · örnek bir görüşme · **mikrofonla çözücü** |
| 7. Işıkla ve dokunarak | İşaret lambası, titreşim, göz kırpması |
| 8. Pratik | **Günlük çalışma planı** ve ilerleme · kapanış |

Kalın yazılanlar her gün dönülecek çalışma araçlarıdır; ilerleme yalnızca tarayıcıda (`localStorage`, `mors.` önekli) saklanır. Bütün sesler tarayıcıda Web Audio ile üretilir; sesli anlatım yoktur. Mikrofon yalnızca çözücü slaytında, düğmeye basınca açılır; ses hiçbir yere gönderilmez.

## Çalıştırma

Derleme adımı yok. `index.html` dosyasını açın ya da yerel sunucuyla çalıştırın (mikrofon için gerekli):

```
python3 tools/serve.py 8821
```

## Kısayollar

| Tuş | İş |
|---|---|
| ← → | önceki / sonraki slayt |
| Boşluk | slayttaki deneyi başlat/durdur; anahtarlama slaytlarında düz anahtar |
| Z X (ya da . /) | iambik anahtarın nokta ve çizgi kolları |
| N | sunucu notları |
| T | açıklama metnini gizle (sunum) |
| O | tüm slaytlar |
| F | tam ekran |
| M | sesi kapat |

## Yapı

```
index.html            sayfa; slaytlar js/content/ dosyalarından kurulur
css/style.css         görsel sistem ("telgrafhane"), css/d/ bölüm stilleri
js/lib.js             ortak yardımcılar, tercihler, localStorage
js/mors.js            kod tabloları, zamanlama (PARIS, Farnsworth), çözücü, Goertzel ton algılayıcı (Node'da da çalışır)
js/audio.js           mors tonu, yan ton, gürültü (Web Audio)
js/serit.js           telgraf şeridi bileşeni ve çalar
js/anahtar.js         düz ve iambik anahtar, canlı çözme, zamanlama çözümlemesi
js/app.js             slayt motoru; js/panels.js ses ve hız ayarları; js/glossary.js terim balonları
js/content/, js/demos/  bölüm bölüm slayt metinleri ve deneyler
test/mors.test.js     birim testleri: node test/mors.test.js
tools/shots.js        bütün slaytların ekran görüntüsü ve konsol denetimi (playwright-core)
tools/deploy.sh       yayın
docs/                 kontrol listesi ve bölüm kaynak notları
```

## Yayınlama

```
tools/deploy.sh      # → ~/egitim.koraytoksoz.com/mors/ (sürüm etiketini yeniler, tools/ test/ docs/ gönderilmez, --delete yok)
```

## Kaynaklar ve ileri okuma

Bölüm bölüm ayrıntılı notlar `docs/kaynaklar.md` dosyasında; emin olunamayan noktalar `docs/kontrol-listesi.md`'de.

- ITU-R M.1677-1 (2009). *International Morse code*. https://www.itu.int/rec/R-REC-M.1677-1-200910-I/
- ITU-R SM.1138-2 (2008). *Determination of necessary bandwidths*. https://www.itu.int/rec/R-REC-SM.1138/en
- Koch, L. (1936). *Arbeitspsychologische Untersuchung der Tätigkeit bei der Aufnahme von Morsezeichen*. TH Braunschweig. Taranmış kopya: https://longislandcwclub.org/wp-content/uploads/2022/11/KOCH-1936.pdf
- Bloom, J. (KE3Z). *A Standard for Morse Timing Using the Farnsworth Technique*. ARRL. https://uoxyc.github.io/morse/kodbok/fs_fansworth_x9004008.pdf
- Pierpont, W. G. (N0HFF). *The Art and Skill of Radio-Telegraphy*. https://www.qsl.net/ng3p/haminfo/pierpont/c29.htm
- IARU Region 1, *HF Band Plan*. https://www.iaru-r1.org/on-the-air/band-plans/
- "Morse code", "American Morse code", "Prosigns for Morse code", "Q code", "R-S-T system", Wikipedia (İngilizce); "Mors alfabesi", Vikipedi.
- MorseCode.World, *American Morse Code*. https://morsecode.world/american/morse.html
- Lewand, R. E. (2000). *Cryptological Mathematics*. MAA (İngilizce harf sıklıkları).

İleri okuma:

- Tom Standage, *The Victorian Internet* (1998): elektrikli telgrafın toplumsal tarihi.
- William G. Pierpont, *The Art and Skill of Radio-Telegraphy* (yukarıdaki bağlantıda ücretsiz).
- LCWO.net: çevrimiçi Koch kursu. https://lcwo.net/
- Bu sitenin kardeşleri: [Dalgadan Sayıya](https://egitim.koraytoksoz.com/sdr/) (yazılım tanımlı radyo), [Kablodan Boşluğa](https://egitim.koraytoksoz.com/anten/) (antenler).

## Lisans

| Ne | Lisans |
|---|---|
| Kod (`js/`, `css/`, `tools/`, `test/`, `index.html` içindeki kod) | MIT |
| İçerik (slayt metinleri, notlar, sözlük, alıştırma metinleri, `docs/`) | CC BY 4.0 |
| Creative Commons simgeleri | Creative Commons, [kullanım koşulları](https://creativecommons.org/policies) |
| Big Shoulders Display, Instrument Sans, Martian Mono | SIL OFL 1.1 |

Ayrıntılar `LICENSE` dosyasında. Önerilen atıf:

> Koray Toksöz, *Sinyalden Sohbete*, https://egitim.koraytoksoz.com/mors/, CC BY 4.0
