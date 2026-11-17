/* 1. Nokta ve çizgi */
L.slide(`
<section class="slide" data-chapter="1" data-demo="zamanBirimi" id="zaman-birimi">
  <div class="text">
    <h2>Her şey bir birimle ölçülür</h2>
    <p class="lead">Mors alfabesinde yalnızca iki şey vardır: ses ve sessizlik. Hangi harfin gönderildiğini, bunların ne kadar sürdüğü belirler.</p>
    <p>Ölçü, <strong>nokta</strong>nın süresidir; buna bir <strong>birim</strong> denir. Geri kalan her şey bu birimin katıdır:</p>
    <ul class="birim-liste">
      <li><span class="kod">·</span> nokta: <strong>1 birim</strong> ses</li>
      <li><span class="kod">−</span> çizgi: <strong>3 birim</strong> ses</li>
      <li><span class="kod"></span>bir harfin işaretleri arası: <strong>1 birim</strong> sessizlik</li>
      <li><span class="kod"></span>harfler arası: <strong>3 birim</strong> sessizlik</li>
      <li><span class="kod"></span>kelimeler arası: <strong>7 birim</strong> sessizlik</li>
    </ul>
    <p>Kâğıtta "nokta" ve "çizgi" diye yazsak da kulak bunları <em>kısa</em> ve <em>uzun</em> olarak duyar. Telsizciler bu yüzden nokta için "dit", çizgi için "dah" der: A harfi "di-dah"tır.</p>
    <details class="more"><summary>Daha fazla: oranlar neden 1–3–7?</summary>
      <p>Bu oranlar ITU'nun mors tavsiyesinde (ITU-R M.1677-1) tanımlıdır. Çizginin üç nokta, harf arasının üç birim olması kulağın kısa ile uzunu, harf içi ile harf arasını karıştırmayacağı kadar ayrık; ama zamanı boşa harcamayacak kadar sıkı bir seçimdir. Elle gönderen insanlar bu oranlara hiçbir zaman tam uymaz; iyi bir alıcı kulak hıza ve kişiye uyum sağlar.</p>
    </details>
    <p class="try">Kutuya bir kelime yazın. Şeritteki ince çizgiler birimleri gösterir; her işaretin ve boşluğun kaç birim tuttuğunu sayın, sonra "Çal" ile imlecin şeritte ilerleyişini izleyin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>"PARIS" kelimesi tam 50 birimdir (sondaki 7 birimlik kelime boşluğuyla). Hız ölçüsü buna dayanır; ilerideki hız slaytında yeniden göreceğiz.</li>
    <li>Topluluğa: herkes masaya parmağıyla "di-dah" vursun. Ritim, kâğıttaki noktadan çok daha akılda kalıcıdır.</li>
    <li>Kaynak: ITU-R M.1677-1 (10/2009), International Morse code, bölüm 2 (aralıklar ve işaretlerin uzunluğu).</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="alfabe" id="alfabe">
  <div class="text">
    <h2>Alfabenin tamamı</h2>
    <p class="lead">Uluslararası mors alfabesi 26 harf, 10 rakam ve bir avuç noktalama işaretinden oluşur. Hepsine dokunup dinleyebilirsiniz.</p>
    <p>Tabloyu ezberlemeye çalışmayın; bu eğitimin en önemli dersi bu. Tabloya bakarak öğrenilen mors, kafada "nokta-çizgi-nokta" diye çevrilen, yavaş bir çeviridir. Burada yalnızca alfabenin <em>biçimini</em> görün: rakamların hepsi beş işaretlidir, sık harfler kısa, seyrek harfler uzundur.</p>
    <h3>Türkçe harfler</h3>
    <p>Ç, Ğ, Ö, Ş ve Ü uluslararası tabloda yoktur. Türkiye'de bunlar için Almanca ve Esperanto ile ortak kodlar kullanılır. Telsizde ise çoğu zaman C, G, O, S, U diye gönderilir; karşı taraf hangi dili konuşursa konuşsun anlasın diye.</p>
    <h3>Usul işaretleri</h3>
    <p>AR, SK, KN gibi işaretler iki harfin arada boşluk bırakılmadan, tek bir harf gibi gönderilmesidir. Yazarken üstlerine çizgi çekilir: <span class="kod">A̅R̅</span>. Telsiz bölümünde hepsini kullanacağız.</p>
    <p class="try">Bir sekme seçip harflere dokunun. Boşluk tuşu seçili harfi yeniden çalar.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Rakamlar düzenli: 1 bir nokta dört çizgi, 5 beş nokta, 6 bir çizgi dört nokta… 0 beş çizgi. Bu düzen, rakamları öğrenmeyi kolaylaştırır.</li>
    <li>Türkçe harflerin kodları ITU tablosunda değildir; burada Türkiye'de yaygın kullanılan biçimler verildi. Kontrol listesine eklendi.</li>
    <li>"!" işareti ITU tablosunda yoktur (Amerika'da kullanılan −·−·−− biçimi yaygındır ama standart değildir); bu yüzden listede yok.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="agac" id="agac">
  <div class="text">
    <h2>Mors ağacı</h2>
    <p class="lead">Her harf, bir ağacın tepesinden başlayıp nokta duyunca bir yana, çizgi duyunca öbür yana sapan bir yoldur.</p>
    <p>Tepeden başlayın. İlk işaret nokta ise <strong>E</strong>'ye, çizgi ise <strong>T</strong>'ye inersiniz. Oradan bir nokta daha: E'den <strong>I</strong>'ya, T'den <strong>N</strong>'ye. Dört adımda bütün harfler biter.</p>
    <p>Ağaç iki şeyi bir arada gösterir: kısa yolların (üst katların) en sık harflere verildiğini ve bir harfi duyarken aklın aslında bir yol izlediğini. Hızlandıkça bu yol kaybolur; harf, tek bir ses kalıbı olarak tanınır.</p>
    <details class="more"><summary>Daha fazla: boş dallar</summary>
      <p>Dördüncü katta harfi olmayan dallar vardır. Bazı diller bunları kendi harflerine verir: Almancada <span class="kod">·−·−</span> Ä'dır; Türkiye'de kullanılan <span class="kod">··−−</span> Ü ve <span class="kod">−−−·</span> Ö de bu boş dallardandır. Ağaçta bu harfler soluk renkte gösterildi.</p>
    </details>
    <p class="try">Bir harfe dokunun: harf çalarken yol ağaçta adım adım yanar. "Rastgele harf" ile önce dinleyin, yolu izleyerek harfi bulmaya çalışın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Ağaç bir öğrenme yöntemi olarak değil, alfabenin yapısını göstermek için burada. Ağacı akılda izleyerek okumak, tablodan okumak gibi yavaştır.</li>
    <li>Sorulursa: ağacın beşinci katında rakamlar ve noktalama vardır; ekrana sığsın diye dört katta kesildi.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="siklik" id="siklik">
  <div class="text">
    <h2>E neden tek bir nokta?</h2>
    <p class="lead">İngilizcede en sık harf E'dir, sonra T gelir. Morsta da en kısa iki kod onlarındır. Bu bir rastlantı değil.</p>
    <p>Kod, harflerin ne kadar sık kullanıldığına göre dağıtılmıştır: sık harfe kısa kod, seyrek harfe uzun kod. Böylece ortalama bir mesaj daha çabuk gönderilir. Bu fikir, yüz yıl sonra bilgisayarlarda dosya sıkıştırmanın temeli olacaktı.</p>
    <p>Anlatılan hikâyeye göre Alfred Vail sıklıkları kendi saymadı: bir gazete matbaasındaki harf kasalarında her harftan kaç tane dökme harf bulunduğuna baktı. Hikâye yaygındır ama ayrıntıları kaynaktan kaynağa değişir; <span class="tartismali">kesin değil</span>.</p>
    <h3>Peki Türkçe için?</h3>
    <p>Kod İngilizceye göre yapılmıştır. Türkçede A, E, İ, N, R, L çok sıktır; Ü, Ş, Ç gibi harflerin kodu ise uzundur. Deneyde kendi metninizle ölçün: aynı kodları Türkçe sıklığa göre yeniden dağıtsaydık ne kazanırdık?</p>
    <p class="try">Kutudaki metni değiştirin ya da kendi metninizi yapıştırın. Harf başına ortalama birim ile "Türkçeye göre dağıtılmış" kodun ortalamasını karşılaştırın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Morsta İ ile ı arasında fark yoktur; ikisi de I (··) olarak sayılır.</li>
    <li>İngilizce sıklıklar Lewand (2000) tablosundan. Kod uzunluğu, harf içi boşluklar dahil birim sayısıdır (E = 1, T = 3, Q = 13).</li>
    <li>"Türkçeye göre" kod, var olan kodların harflere yeniden dağıtılmasıdır: en sık harfe en kısa kod. Bu, aynı kod kümesiyle ulaşılabilecek en kısa ortalamadır; gerçek bir öneri değil, bir düşünce deneyi.</li>
    <li>Vail ve matbaa hikâyesi: Wikipedia "Morse code" maddesi Vail'in sıklığı Morristown'daki bir gazetenin harf kasalarından "tahmin ettiğini" yazar. Morse'un ve Vail'in katkılarının paylaşımı tarihçiler arasında tartışmalıdır.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="1" data-demo="hiz" id="hiz">
  <div class="text">
    <h2>Hız: PARIS kelimesi</h2>
    <p class="lead">Mors hızı dakikadaki kelime sayısıyla, <strong>wpm</strong> ile ölçülür. Ama kelimeler farklı uzunlukta; hangi kelime?</p>
    <p>Anlaşma şudur: ölçü kelimesi <strong>PARIS</strong>'tir. Sonundaki kelime boşluğuyla birlikte tam <strong>50 birim</strong> sürer. Dakikada 20 PARIS göndermek 20 wpm demektir; bu da 1000 birim eder, bir birim 60 milisaniyedir.</p>
    <p>Kısa kural: <strong>bir birim = 1200 ÷ wpm milisaniye</strong>. 12 wpm'de nokta 100 ms, 24 wpm'de 50 ms.</p>
    <h3>Hangi hız ne demek?</h3>
    <ul>
      <li><strong>5 wpm:</strong> işaretler sayılabilir; yeni başlayanın tablo hızı.</li>
      <li><strong>13 wpm:</strong> işaretler sayılamayacak kadar hızlanır; harf bir ses kalıbı olarak duyulmaya başlar.</li>
      <li><strong>20 wpm:</strong> rahat bir telsiz görüşmesi.</li>
      <li><strong>30 wpm ve üstü:</strong> deneyimli operatörler; kelimeler bütün olarak duyulur.</li>
    </ul>
    <p>ABD'de amatör telsiz sınavlarında uzun yıllar 5, 13 ve 20 wpm basamakları vardı; 2000'de 5 wpm'e indirildi, 2007'de mors sınavı tümüyle kaldırıldı.</p>
    <p class="try">Kaydırıcıyla hızı değiştirip PARIS'i dinleyin. 5 ile 30 wpm arasında aynı kelimenin nasıl bambaşka bir sese dönüştüğüne dikkat edin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Bazı programlar "CODEX" kelimesini (60 birim) ölçü alır; o hesapla hızlar biraz farklı çıkar. Bu sitede PARIS kullanılıyor.</li>
    <li>Bu sitedeki varsayılan harf hızı 20 wpm; yavaşlatılmış etkin hız (Farnsworth) 4. bölümde.</li>
    <li>FCC: 2000'deki yeniden yapılanmada 13 ve 20 wpm sınavları kaldırıldı, 5 wpm kaldı; 23 Şubat 2007'de mors şartı tümüyle kalktı.</li>
  </ul></aside>
</section>
`);
