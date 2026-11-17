/* 3. Sinyalin fiziği */
L.slide(`
<section class="slide" data-chapter="3" data-demo="cw" id="cw">
  <div class="text">
    <h2>Taşıyıcıyı aç, kapa</h2>
    <p class="lead">Telsizde mors göndermek, bir radyo dalgasını anahtarla açıp kapamaktır. Dalga varsa ton duyulur, yoksa sessizlik. Bilginin tamamı bu varlık ve yokluktadır.</p>
    <p>Verici sabit frekanslı bir <strong>taşıyıcı</strong> üretir: örneğin 7,030 MHz'te, saniyede yedi milyondan fazla salınan bir dalga. Anahtar basılıyken dalga antene gider, bırakılınca kesilir. Telsizciler buna <strong>CW</strong> (İngilizce <em>continuous wave</em>, sürekli dalga) der. Adı, kıvılcımlı vericilerin sönümlenen dalgalarına karşı, "kesintisiz salınan" dalgadan gelir.</p>
    <p>Bu, var olan en basit sayısal modülasyondur: genlik ya tam ya sıfır. Alıcı yalnızca "şu anda bu frekansta bir şey var mı?" sorusunu yanıtlar. Bu basitlik CW'yi zayıf sinyalde güçlü yapar; birkaç slayt sonra nedenini göreceğiz.</p>
    <details class="more"><summary>Daha fazla: bir noktada kaç salınım var?</summary>
      <p>20 wpm hızda bir nokta 60 ms sürer. 7,030 MHz'lik taşıyıcı bu sürede 7.030.000 × 0,06 ≈ 421.800 kez salınır. Deneydeki dalga bu yüzden çok yavaşlatılmış ve seyreltilmiştir: gerçek salınımları ekrana sığdırmak mümkün değil.</p>
      <p>Radyo dalgasının antenden nasıl yayıldığını <a href="https://egitim.koraytoksoz.com/anten/" target="_blank" rel="noopener">Kablodan Boşluğa</a>, alıcının bu dalgayı nasıl sayılara çevirdiğini <a href="https://egitim.koraytoksoz.com/sdr/" target="_blank" rel="noopener">Dalgadan Sayıya</a> eğitiminde bulabilirsiniz.</p>
    </details>
    <p class="try">Bir kelime yazıp çalın. Üstteki çizgi anahtarın durumunu, alttaki dalga antene giden taşıyıcıyı gösterir. "Yavaş çekim" seçeneğinde zaman yavaşlar ve salınımlar tek tek görünür (bu sırada ses çıkmaz).</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ana fikir: CW'de bilgi genlikte değil, varlık/yoklukta. Alıcının işi tek bir soru.</li>
    <li>"Continuous wave" adı tarihsel: 1910'ların kıvılcım vericileri sönümlü (damped) dalga üretiyordu; ark ve tüp vericiler sürekli dalga üretti.</li>
    <li>Ekrandaki dalga gerçeği temsil eder, ölçeği değil: gerçekte bir noktada yüz binlerce salınım var.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="3" data-demo="tik" id="tik">
  <div class="text">
    <h2>Anahtar tıkı</h2>
    <p class="lead">Sinyali bıçak gibi keskin açıp kapamak, beklenmedik bir yan etki doğurur: ton tıkırdar ve sinyal, frekans ekseninde olması gerekenden çok daha geniş yer kaplar.</p>
    <p>Bir dalgayı aniden başlatmak, spektrumda geniş bir frekans yelpazesine enerji serpmek demektir. Komşu frekansta dinleyen biri sizin sinyalinizi bir ton olarak değil, <strong>tık tık</strong> diye duyar. Buna <strong>anahtar tıkı</strong> (key click) denir.</p>
    <p>Çözümü basit: sinyalin kenarlarını birkaç milisaniyede yumuşakça yükseltip indirmek. Bu yükselme süresi kısaldıkça tık sertleşir ve spektrum genişler; uzadıkça sinyal daralır ama çok uzarsa hızlı gönderimde noktalar yuvarlanıp birbirine karışır. Telsizlerde genellikle 4–6 ms dolayında bir değer seçilir; bu sitedeki bütün sesler 5 ms ile çalınır.</p>
    <details class="more"><summary>Daha fazla: bir CW sinyalinin "gerekli" bant genişliği</summary>
      <p>ITU'nun bant genişliği tavsiyesine (ITU-R SM.1138) göre telgraf sinyalinin gerekli genişliği kabaca <span class="mono">B × K</span>'dır: B saniyedeki işaret hızı (baud), K sönümlemeli (fading) hatlar için 5. 25 wpm'lik bir gönderimde B = 20 baud, gerekli genişlik 100 Hz: emisyon tanımı <span class="mono">100HA1A</span>. Yani düzgün bir CW sinyali yüz hertz civarına sığar.</p>
    </details>
    <p class="try">Yükselme süresini 0 ms'ye çekip "Dinle"ye basın, sonra 5 ms'de tekrar dinleyin. Spektrumda pirinç rengi alan sinyalin −40 dB'ye kadar kapladığı genişliği gösterir.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Spektrum deneyin içinde hesaplanır: anahtarlanmış bir 600 Hz tonu üretilir, FFT ile güç spektrumu çizilir.</li>
    <li>0 ms'de kulaklıkta tıkırtı belirgin; 5 ms'de kaybolur. Aynı ilke vericide: tık, komşu kanallara yayılan girişimdir.</li>
    <li>ITU-R SM.1138-2, Ek 1: A1A için Bn = BK, örnek 25 wpm → 100HA1A.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="3" data-demo="darBant" id="dar-bant">
  <div class="text">
    <h2>Gürültünün içinden</h2>
    <p class="lead">CW, telsizcilerin "başka hiçbir şeyin geçmediği yerde mors geçer" dediği yayın biçimidir. Sırrı sinyalin darlığında.</p>
    <p>Alıcıya her zaman bir hışırtı gelir: atmosferden, uzaydan, kendi devrelerinden. Bu <strong>gürültü</strong> bütün frekanslara yayılmıştır; bir süzgeç ne kadar geniş bir bandı geçirirse o kadar çok gürültü geçirir. Konuşma (SSB) yaklaşık 2,4 kHz'lik bir kanal ister. CW sinyali ise birkaç on hertze sığar.</p>
    <p>Alıcının süzgecini sinyalin genişliğine indirdiğinizde sinyal aynı kalır, gürültü azalır. Beyaz gürültüde kazanç kabaca <span class="mono">10·log<sub>10</sub>(B<sub>1</sub>/B<sub>2</sub>)</span> desibeldir: 2,4 kHz'ten 250 Hz'e inmek yaklaşık 10 dB, yani gürültü gücünü onda birine indirmek demektir.</p>
    <p>İşin bir yarısını da kulak yapar: dikkatini tek bir tona vermeyi bilen deneyimli bir dinleyici, gürültünün içindeki tonu sanılandan çok daha kolay ayırır.</p>
    <details class="more"><summary>Daha fazla: neden süzgeç sonsuz daraltılmıyor?</summary>
      <p>Çok dar süzgeç (ör. 50 Hz) zil gibi çınlar: noktaların kenarları yayılır, hızlı gönderim okunmaz olur. Ayrıca istasyonu ayarlamak zorlaşır; tonu biraz kaçırırsanız süzgecin dışında kalır. Telsizlerde CW için 250–500 Hz yaygındır.</p>
      <p>Sayısal alıcıda süzgecin nasıl yapıldığını <a href="https://egitim.koraytoksoz.com/sdr/" target="_blank" rel="noopener">Dalgadan Sayıya</a> eğitiminde deneyebilirsiniz.</p>
    </details>
    <p class="try">"Çal"a basın: gürültünün içinde zayıf bir mors sinyali tekrar eder. Süzgeç genişliğini 3 kHz'ten 100 Hz'e doğru daraltın ve sinyalin nasıl öne çıktığını dinleyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Bu deneyin kulaklıkla yapılması iyi olur; hoparlörde düşük frekanslı gürültü kaybolur.</li>
    <li>Gösterilen kazanç kuramsaldır (beyaz gürültü, sinyal tamamen süzgecin içinde). Tarayıcıdaki süzgeç iki katlı bir bant geçirendir; kenarları ideal değildir.</li>
    <li>Topluluğa: önce geniş bantta herkes "duyuyor musunuz?" diye sorun, sonra daraltın.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="3" data-demo="bfo" id="bfo">
  <div class="text">
    <h2>Ton nereden geliyor?</h2>
    <p class="lead">Radyo dalgası duyulmaz; alıcının kulaklığından gelen tatlı "dıt dıt" tonunu aslında alıcının kendisi üretir.</p>
    <p>Anahtarlanan taşıyıcı tek bir frekanstır; bir AM radyoyla dinleseniz yalnızca hışırtının kesilip açıldığını duyarsınız. Bunu tona çevirmek için alıcı kendi içinde ikinci bir sinyal üretir: <strong>BFO</strong> (beat frequency oscillator, vuru osilatörü). İki frekans karıştırılınca farkları duyulur hâle gelir: 7.030.000 Hz'lik sinyal ile 7.029.400 Hz'lik BFO, 600 Hz'lik bir ton verir.</p>
    <p>Bu yüzden CW tonunun perdesi bir zevk meselesidir: alıcıyı biraz kaydırmak tonu tizleştirir ya da pesleştirir. Çoğu telsizci 500–800 Hz arasını sever. İki frekans tam üst üste gelince fark sıfırlanır ve ton kaybolur: buna <strong>sıfır vuru</strong> (zero beat) denir.</p>
    <details class="more"><summary>Daha fazla: iki gitar telini akort etmek gibi</summary>
      <p>Birbirine çok yakın iki ses birlikte çalınınca gürlük yavaşça kabarıp söner; bu "vuru"nun hızı iki frekansın farkıdır. Gitaristler telleri bu vuruyu yavaşlatarak akort eder. Alıcıdaki karıştırıcı aynı şeyi radyo frekansında yapar ve farkı ses frekansına indirir; toplam frekans ise süzgeçle atılır.</p>
    </details>
    <p class="try">BFO kaydırıcısını oynatın: dalgalar arasındaki fark büyüdükçe birleşik dalganın kabarıp sönmesi hızlanır ve ton tizleşir. Sıfıra getirince ton kaybolur.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Çizimde iki dalganın frekansları ölçeklenmiştir; vurunun hızı farkla orantılıdır.</li>
    <li>Gerçek alıcılarda karışım genellikle ara frekansta (IF) yapılır; ilke aynıdır.</li>
    <li>Pratik bilgi: CW'de karşı istasyona "sıfır vuru" ile, yani onun frekansına tam oturarak cevap verilir; telsizler bunun için yan tonu ve gösterge sunar.</li>
  </ul></aside>
</section>
`);
