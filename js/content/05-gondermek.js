/* 5. Göndermek */
L.slide(`
<section class="slide" data-chapter="5" data-demo="duzAnahtar" id="duz-anahtar">
  <div class="text">
    <h2>Düz anahtar</h2>
    <p class="lead">İlk telgrafçıların elindeki alet: bastıkça devre kapanır, ton çalar; bırakınca susar. Noktanın ve çizginin uzunluğunu, aradaki boşlukları tümüyle sizin eliniz belirler.</p>
    <p>Kulakla öğrendiğiniz ritmi şimdi elinizle üretin. Önce yavaş ama <strong>oranlı</strong> gönderin: çizgi noktanın üç katı, harfin içindeki boşluk bir nokta, harfler arası üç nokta. Hızı sonra artırırsınız; oranı bozuk bir gönderişi hızlandırmak yalnızca okunmasını zorlaştırır.</p>
    <p>Bu deney gönderdiğinizi canlı çözer. Çözücü hızınıza kendiliğinden uyar; ölçümler noktanın ortalama uzunluğunu, çizgi/nokta oranını ve ne kadar düzenli gönderdiğinizi gösterir.</p>
    <h3>Elin duruşu</h3>
    <ul>
      <li>Anahtarı parmak uçlarıyla, bilekten ve önkoldan gelen küçük bir hareketle çalın; kolu sıkmayın.</li>
      <li>Kısa harflerle başlayın: E, T, I, M, S, O. Sonra adınızı gönderin.</li>
      <li>Oran 3'ün çok altındaysa çizgiler nokta gibi duyulur; çok üstündeyse gönderiş "sürüklenir".</li>
    </ul>
    <details class="more"><summary>Daha fazla: elin imzası</summary>
      <p>Düz anahtarla gönderen her telgrafçının kendine özgü bir ritmi olur; eski telgrafçılar buna "el" (İngilizce <em>fist</em>) derdi. Deneyimli dinleyiciler tanıdık bir istasyonu tek bir harfinden tanıyabiliyordu. İkinci Dünya Savaşı'nda dinleme istasyonlarının telsizcileri bu yolla tek tek ayırt etmeye çalıştığı anlatılır.</p>
      <p>Uzun süre düz anahtar kullananlarda bileği yoran bir rahatsızlık (telgrafçı krampı) görülürdü. Bu yüzden 1900'lerin başında yana hareket eden "bug" anahtarlar, sonra elektronik anahtarlar yaygınlaştı.</p>
    </details>
    <p class="try">Pirinç düğmeye basılı tutun ya da <kbd>Boşluk</kbd> tuşunu kullanın. Önce <span class="kod">· · ·  − − −  · · ·</span> (SOS) gönderin; sonra adınızı.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Boşluk tuşu bu slaytta anahtardır; slayttaki başka bir "başlat" işlevi yok.</li>
    <li>Çözücü ilk birkaç işarette hızı kestirmeye çalışır; ilk harf yanlış çıkarsa "Temizle" deyip yeniden başlayın.</li>
    <li>Topluluğa: herkes adını göndersin, yanındaki çözülen metni okusun. Oranı en düzgün olan kazanır.</li>
    <li>Telefonda düğmeye dokunarak da çalışır; dokunma gecikmesi yüzünden ölçümler biraz dağınık çıkabilir.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="5" data-demo="iambik" id="iambik">
  <div class="text">
    <h2>İki kollu anahtar</h2>
    <p class="lead">Bugün telsizcilerin çoğu iki kollu bir anahtar ve elektronik bir "keyer" kullanır. Bir kol nokta, öteki çizgi üretir; uzunlukları ve aralarındaki boşluğu makine kusursuz tutar.</p>
    <p>Kolu basılı tuttukça aynı öğe yinelenir: nokta kolunu tutarsanız <span class="kod">·····</span>, çizgi kolunu tutarsanız <span class="kod">−−−−−</span>. İkisini birden sıkarsanız öğeler sırayla gelir: <span class="kod">·−·−</span> ya da <span class="kod">−·−·</span>. Buna <strong>iambik</strong> gönderme denir. C harfi (<span class="kod">−·−·</span>) tek bir sıkışla çıkar: önce çizgi kolu, hemen ardından nokta kolu, sonra ikisini birden bırakmak.</p>
    <h3>Mod A ve mod B</h3>
    <p>İki kol birlikte bırakıldığında ne olacağı iki türlüdür. <strong>Mod A</strong>'da o an çalan öğe biter ve anahtar susar. <strong>Mod B</strong>'de anahtar bir öğe daha, karşı öğeyi ekler. Aynı el hareketi mod A'da K (<span class="kod">−·−</span>), mod B'de C (<span class="kod">−·−·</span>) verebilir. Hangisini seçtiğiniz bir alışkanlık meselesidir; önemli olan birini seçip ona alışmak.</p>
    <details class="more"><summary>Daha fazla: neden "iambik"?</summary>
      <p>Adı şiirdeki iambus ölçüsünden gelir: kısa-uzun hece dizisi. İki kollu anahtarlar 1950'lerin sonunda ortaya çıktı; sıkışla gönderme hareketi azaltır, ama iyi gönderebilmek için hangi anda bırakacağınızı bilmek gerekir.</p>
    </details>
    <p class="try">Nokta kolu: <kbd>Z</kbd> ya da <kbd>.</kbd> · Çizgi kolu: <kbd>X</kbd> ya da <kbd>/</kbd>. "Sıkışı göster" ile aynı hareketin iki modda ne verdiğini görün; zaman çizelgesinde kolları ve çıkan sinyali izleyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Zaman çizelgesinin üç satırı: nokta kolu, çizgi kolu, anahtarın gönderdiği sinyal. Sıkışta kolların üst üste bindiğini, sinyalinse sırayla geldiğini gösterin.</li>
    <li>Klavyede iki tuşu aynı anda basılı tutmak bazı klavyelerde sorun çıkarabilir (tuş çakışması); Z ve X çoğu klavyede sorunsuzdur.</li>
    <li>Telefonda iki başparmakla iki düğmeyi kullanın.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="5" data-demo="gondermeAlistirma" id="gonderme-alistirma" data-tool>
  <div class="text">
    <h2>Gönderme alıştırması</h2>
    <p class="lead">Ekrandaki metni gönderin; çözücü ne okuduğunu yazar ve harf harf karşılaştırır. Bir makine sizi okuyabiliyorsa, bir insan da rahatça okur.</p>
    <p>Kısa kelimelerle başlayın, sonra çağrı işaretlerine ve telsiz cümlelerine geçin. Hızı değil, <strong>doğruluğu</strong> izleyin. Kelimeler arasına yedi noktalık bir boşluk bırakmayı unutmayın; harfleri birbirine yapıştırmak en sık yapılan hatadır.</p>
    <h3>Puan nasıl hesaplanır?</h3>
    <p>Hedef metin ile çözülen metin karşılaştırılır: eksik, fazla ya da yanlış her harf bir hata sayılır (düzenleme uzaklığı). Doğruluk, hatasız harflerin oranıdır. En iyi sonuçlarınız bu tarayıcıda saklanır.</p>
    <p class="try">Bir tür ve anahtar seçin, metni gönderin. Bitince kendiliğinden değerlendirilir; erken bitirmek için "Bitir"e basın. <kbd>Boşluk</kbd> düz anahtar; iki kolluda <kbd>Z</kbd>/<kbd>X</kbd>.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Değerlendirme, gönderilen harf sayısı hedefe ulaşınca ve bir kelime boşluğu kadar susulunca kendiliğinden yapılır.</li>
    <li>Çağrı işaretleri rastgele üretilir; gerçek bir istasyona denk gelebilir, yalnızca alıştırma içindir.</li>
    <li>Topluluğa: iki kişi eşleşsin; biri gönderir, öteki kulakla çözüp kâğıda yazar. Sonra makinenin çözdüğüyle karşılaştırın.</li>
  </ul></aside>
</section>
`);
