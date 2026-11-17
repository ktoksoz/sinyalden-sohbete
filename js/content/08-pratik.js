/* 8. Pratik */
L.slide(`
<section class="slide" data-chapter="8" data-demo="gunlukPlan" id="gunluk-plan" data-tool>
  <div class="text">
    <h2>Günlük çalışma</h2>
    <p class="lead">Mors bir kas ve kulak becerisidir: haftada bir uzun oturum yerine her gün kısa bir çalışma çok daha hızlı ilerletir.</p>
    <p>Günde 10–20 dakika yeter. Yorulunca bırakın; yorgun kulak hatayı alışkanlığa çevirir. Koch dersinde %90'ı geçmek bazı günler kolay, bazı günler imkânsız gelir; bu normaldir. Ertesi gün aynı dersten devam edin.</p>
    <h3>Bir planın parçaları</h3>
    <ul>
      <li><strong>Isınma:</strong> tek harf oyunuyla birkaç dakika; zayıf harfler kendiliğinden daha sık gelir.</li>
      <li><strong>Koch dersi:</strong> günün asıl işi. %90'ı geçince bir sonraki harfe geçin.</li>
      <li><strong>Kelimeler ve çağrı işaretleri:</strong> harfleri tek tek değil, bütün olarak duymaya alışmak.</li>
      <li><strong>Gönderme:</strong> birkaç dakika anahtarla; kulakla öğrendiğiniz ritmi elinizle tekrar edin.</li>
      <li><strong>Gerçek dinleme:</strong> ilerledikçe örnek görüşmeyi ve gerçek telsiz yayınlarını dinleyin.</li>
    </ul>
    <p class="try">Bir süre seçin ve "Planı başlat"a basın: her adımın süresi sayılır, "Git" düğmesi ilgili alıştırmaya götürür. İlerlemeniz bu tarayıcıda saklanır.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Bütün ilerleme yalnızca bu tarayıcının yerel belleğinde (localStorage) durur; başka cihaza taşınmaz, hiçbir yere gönderilmez.</li>
    <li>Plan sayacı slayttan çıkınca da sürer: alıştırmaya gidip geri dönebilirsiniz; adım bitince kısa bir bildirim çıkar.</li>
    <li>Topluluk için öneri: haftada bir buluşup birlikte bir Koch dersi yapın, aradaki günlerde herkes kendi 10 dakikasını çalışsın.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="8" data-demo="kapanis" id="kapanis">
  <div class="text">
    <h2>73</h2>
    <p class="lead">Bir noktayla bir çizginin ritminden başladık; telgraf tellerinden, gemi telsizlerinden geçip bugünün kısa dalgasına ulaştık. Gerisi her gün birkaç dakikalık dinlemeyle gelir.</p>
    <p>Bu sitede öğrendikleriniz:</p>
    <ul>
      <li>Mors bir zaman kodudur: nokta, çizgi ve üç ayrı boşluk.</li>
      <li>Tablodan değil, kulakla öğrenilir: harf hızlı, aralar geniş (Koch ve Farnsworth).</li>
      <li>CW dar bir bantta, düşük güçle çok uzağa ulaşır; bu yüzden telsizciler onu hâlâ sever.</li>
      <li>Açılıp kapanan her şey morsu taşıyabilir: ses, ışık, titreşim, bir göz kırpması.</li>
    </ul>
    <h3>Buradan nereye?</h3>
    <ul>
      <li><a href="https://egitim.koraytoksoz.com/sdr/" target="_blank" rel="noopener">Dalgadan Sayıya</a>: bir radyo alıcısının içinde neler olduğunu, yazılım tanımlı radyoyla.</li>
      <li><a href="https://egitim.koraytoksoz.com/anten/" target="_blank" rel="noopener">Kablodan Boşluğa</a>: sinyali boşluğa salan anten ve iletim hatları.</li>
      <li><a href="https://egitim.koraytoksoz.com/elektronik/" target="_blank" rel="noopener">Elektrondan Bilgisayara</a>: kendi anahtarınızı ve osilatörünüzü kurmak için elektroniğin temelleri.</li>
      <li>Bir amatör telsiz derneğine uğrayın: ilk görüşmenizi bir telsizcinin yanında yapmak en güzel başlangıçtır.</li>
    </ul>
    <p class="try">Kendi kapanış telgrafınızı yazıp gönderin.</p>
    <div class="cover-meta">
      <a class="all-link" href="https://egitim.koraytoksoz.com/">← Bütün eğitimler</a>
      GHLINK
      <a class="lic" href="https://creativecommons.org/licenses/by/4.0/deed.tr" target="_blank" rel="license noopener" title="İçerik: Creative Commons Atıf 4.0">
        <img src="img/cc-cc.svg" alt="Creative Commons" width="18" height="18"><img src="img/cc-by.svg" alt="Atıf" width="18" height="18">
        <span>İçerik CC BY 4.0 · Kod MIT</span>
      </a>
    </div>
    <p class="license">© 2026 Koray Toksöz. Bütün sesler tarayıcıda üretilir. Yazı tipleri: Big Shoulders Display, Instrument Sans, Martian Mono (SIL OFL 1.1).</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>73: "en iyi dileklerimle". Telsizciler veda ederken söyler; buradan da size 73.</li>
    <li>Topluluğa: herkes kendi kapanış telgrafını göndersin; en kısa ve en anlamlısını seçin.</li>
    <li>Bu site bir telsiz kursunun ya da sınav hazırlığının yerini tutmaz; kulağı eğitmek ve her gün çalışmak için bir araçtır.</li>
  </ul></aside>
</section>
`.replace("GHLINK", (function () {
  // kapaktaki GitHub bağlantısını aynen kullan
  const kap = document.querySelector("#kapak .gh-link");
  return kap ? kap.outerHTML : '<a class="gh-link" href="https://github.com/ktoksoz/sinyalden-sohbete" target="_blank" rel="noopener"><span>Kaynak kodu GitHub\'da</span></a>';
})()));
