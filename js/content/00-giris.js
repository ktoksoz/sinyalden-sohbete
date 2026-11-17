/* 0. Giriş: kapak */
L.slide(`
<section class="slide cover" data-chapter="0" data-demo="kapak" data-title="Kapak" id="kapak">
  <div class="stage"></div>
  <div class="cover-text">
    <h1 class="kapak-baslik" aria-label="Sinyalden Sohbete"></h1>
    <p class="lead-c">Mors alfabesini tablodan ezberleyerek değil, kulakla öğrenin. Noktanın ve çizginin ritminden telgrafın tarihine, sinyalin fiziğinden anahtarla göndermeye ve telsizde bir görüşmeye kadar; her slaytta dinleyip deneyerek.</p>
    <p class="byline">Koray Toksöz</p>
    <div class="cover-actions">
      <button class="btn primary big" type="button" onclick="Snd.unlock(); Deck.next()">Başla</button>
      <button class="btn big" type="button" onclick="Snd.unlock(); Deck.goId('koch-alistirma')">Doğrudan alıştırmaya geç</button>
    </div>
    <div class="kapak-yaz">
      <input class="satir-giris" type="text" id="kapak-metin" placeholder="Adınızı yazın, mors olarak dinleyin" maxlength="40" spellcheck="false" autocomplete="off" aria-label="Mors olarak dinlenecek metin">
      <button class="btn" type="button" id="kapak-dinle">Dinle</button>
    </div>
  </div>
  <div class="cover-bottom">
    <div class="cover-meta">
      <a class="all-link" href="https://egitim.koraytoksoz.com/">← Bütün eğitimler</a>
      <a class="gh-link" href="https://github.com/ktoksoz/sinyalden-sohbete" target="_blank" rel="noopener"><svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg><span>Kaynak kodu GitHub'da</span></a>
      <a class="lic" href="https://creativecommons.org/licenses/by/4.0/deed.tr" target="_blank" rel="license noopener" title="İçerik: Creative Commons Atıf 4.0">
        <img src="img/cc-cc.svg" alt="Creative Commons" width="18" height="18"><img src="img/cc-by.svg" alt="Atıf" width="18" height="18">
        <span>İçerik CC BY 4.0 · Kod MIT</span>
      </a>
    </div>
  </div>
  <aside class="notes"><ul>
    <li>Kapakta başlık kendi kodunu "gönderiyor": her harf şeritten geçerken yanar. Ses kapalıysa yalnızca görüntü akar; bir yere dokununca ses açılır.</li>
    <li>Bir katılımcının adını kutuya yazıp dinletin: herkes kendi adının ritmini ilk dakikada duymuş olur.</li>
    <li>Yol haritası: nokta ve çizgi → telgrafın tarihi → sinyalin fiziği → kulakla öğrenmek (ana bölüm) → göndermek → telsizde mors → ışık ve titreşim → günlük pratik.</li>
    <li>Kısayollar: ← → gezinme, Boşluk slayttaki deney, N notlar, T metni gizle, O tüm slaytlar, F tam ekran, M ses. Hız ve ton alt çubuktaki ayar düğmesinde.</li>
  </ul></aside>
</section>
`);
