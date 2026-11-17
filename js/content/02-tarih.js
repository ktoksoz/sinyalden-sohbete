/* 2. Telgrafın tarihi */
L.slide(`
<section class="slide" data-chapter="2" data-demo="telgraftanOnce" id="telgraftan-once">
  <div class="text">
    <h2>Telgraftan önce</h2>
    <p class="lead">Elektrikten önce bir haber, onu taşıyan atın hızıyla yol alırdı. İlk büyük sıçrama elektrikle değil, kulelerle geldi.</p>
    <p>Claude Chappe ve kardeşlerinin kurduğu <strong>optik telgraf</strong>, tepelere dizilmiş kulelerden oluşuyordu. Her kulenin tepesinde hareketli kollar vardı; kolların konumu bir işaretti. Görevli, dürbünle bir önceki kuleye bakar, gördüğü işareti kendi kulesinde tekrarlardı. Paris–Lille hattı 1794'te çalışmaya başladı.</p>
    <p>Sistem hızlıydı ama kısıtlıydı: gece ve siste çalışmaz, her kulede birkaç görevli ister, mesajlar bir kod kitabına göre gönderilirdi. Fransa'da yarım yüzyıl boyunca devletin haber ağı oldu.</p>
    <p>1830'ların sonunda İngiltere'de Cooke ile Wheatstone'un, Amerika'da Morse ile Vail'in <strong>elektrikli telgraf</strong>ı ortaya çıktı. Artık işaret teldeki akımla, neredeyse anında gidiyordu; yavaş olan yalnızca onu gönderen eldi.</p>
    <p class="try">Mesafeyi ve mesajın uzunluğunu değiştirin, "Yarıştır" ile üç yolu karşılaştırın. Süreler kaba bir modelden gelir; varsayımlar deneyin altında yazıyor.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Varsayımlar: atlı ulak menzil istasyonlarında at değiştirerek ortalama 15 km/sa; optik telgrafta kuleler 12 km arayla, her kulede bir işaretin görülüp tekrarlanması 20 sn, kod kitabıyla kelime başına 2 işaret; elektrikli telgrafta elle 15 wpm, uzun hatlarda her 400 km'de mesaj yeniden gönderilir (aktarma), aktarma başına 1 dk.</li>
    <li>Gerçek değerler hatta, havaya ve döneme göre çok değişirdi. Amaç büyüklük sırasını göstermek: saatler → dakikalar.</li>
    <li>Paris–Lille arası kuş uçuşu yaklaşık 200 km.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="2" data-demo="morseVail" id="morse-vail">
  <div class="text">
    <h2>Morse, Vail ve ilk kod</h2>
    <p class="lead">Samuel Morse bir ressamdı. Elektrikle uzağa yazı yazma fikri 1832'de bir gemi yolculuğunda aklına düştü; onu çalışır hâle getirmek ise yıllar ve ortaklar istedi.</p>
    <p>1837'de Alfred Vail ekibe katıldı. Vail hem makineyi geliştirdi hem de kodun bugün bildiğimiz noktalı-çizgili biçimine büyük katkı yaptı; ikisinin payı tarihçiler arasında hâlâ tartışılır. Ocak 1838'de New Jersey'de, Vail ailesinin Speedwell dökümhanesinde yaklaşık 3 km'lik telle ilk gösterimi yaptılar.</p>
    <p>Kongre'den alınan parayla Washington ile Baltimore arasına bir hat çekildi. <strong>24 Mayıs 1844</strong>'te Morse, Washington'dan ilk resmî mesajı gönderdi: <em>"What hath God wrought"</em> ("Tanrı neler yarattı"). Vail Baltimore'da aldı ve geri gönderdi.</p>
    <h3>Amerikan morsu</h3>
    <p>Bu ilk kod bugünkünden farklıydı. Üç uzunlukta çizgisi vardı (L harfi uzun bir çizgi, 0 daha da uzun) ve bazı harflerin <em>içinde</em> boşluk vardı: C <span class="kod">·· ·</span>, O <span class="kod">· ·</span>, R <span class="kod">· ··</span>. Kâğıt şeride basıldığında okunuyordu; ama telgrafçılar kısa sürede şeride bakmayı bırakıp tıkırtıyı kulakla okumaya başladı.</p>
    <p class="try">Bir kelime yazın ya da 1844 mesajını bırakın. İki şerit aynı ölçekte: üstte Amerikan morsu, altta bugünkü uluslararası mors. Harf içindeki boşluklara ve çizgi uzunluklarına dikkat edin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Amerikan morsunun zamanlaması için tek bir standart yoktu. Burada morsecode.world'ün yorumu kullanıldı: nokta 1, çizgi 2, L 4, 0 5 birim; harf içi boşluk 1, harf içindeki uzun boşluk 1,5, harf arası 2, kelime arası 3 birim.</li>
    <li>Amerikan morsu kablolu telgrafta (özellikle Kuzey Amerika demiryollarında) 20. yüzyılın ortalarına kadar kullanıldı; telsizde ise uluslararası kod yerleşti.</li>
    <li>"What hath God wrought" Kitab-ı Mukaddes'ten (Çölde Sayım 23:23) bir sözdür; cümleyi Patent Dairesi başkanının kızı Annie Ellsworth seçmişti.</li>
    <li>Gösterim tarihi kaynaklarda 6 ya da 11 Ocak 1838 olarak geçer.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="2" data-demo="uluslararasi" id="uluslararasi">
  <div class="text">
    <h2>Bir kod, bütün dünya</h2>
    <p class="lead">Telgraf Avrupa'ya geçince bir sorun çıktı: her ülkenin kodu başkaydı ve hat sınıra gelince mesajın elle yazılıp yeniden gönderilmesi gerekiyordu.</p>
    <p>1848'de Hamburg'da Friedrich Clemens Gerke, Amerikan kodunu sadeleştirdi. Harf içindeki boşlukları ve farklı uzunluktaki çizgileri kaldırdı; geriye yalnızca iki öğe kaldı: nokta ve çizgi. Ayrıca Almancadaki ünlüler için kodlar ekledi. Bu kod 1851'de Alman ve Avusturya telgraf birliğinde kabul edildi.</p>
    <p>17 Mayıs 1865'te Paris'te yirmi devlet Uluslararası Telgraf Sözleşmesi'ni imzaladı ve <strong>Uluslararası Telgraf Birliği</strong> kuruldu. Gerke'nin kodu, küçük değişikliklerle, ortak kod oldu. Bu birlik bugün de çalışıyor: adı artık Uluslararası Telekomünikasyon Birliği, kısaca ITU. Osmanlı Devleti de 1865'te imzacılar arasındaydı.</p>
    <p>Avrupa'da "kıta kodu" (Continental code) denen bu biçim, bugün "uluslararası mors" dediğimiz koddur.</p>
    <p class="try">Pirinç renkli hücreler 1848'den sonra değişen harflerdir. Birine dokunun: önce Amerikan, sonra uluslararası biçim çalar.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Gerke'nin değişikliği yalnızca boşlukları kaldırmak değildi; birçok harfin kodu tümüyle değişti (ör. O, P, Q, X, Y, Z, bütün rakamlar).</li>
    <li>Değişmeyen harflerde bile çizgi uzunluğu farklı: Amerikan morsunda çizgi 2 birim, uluslararası morsta 3 birim.</li>
    <li>ITU 1865'te kurulduğu için dünyanın en eski uluslararası örgütlerinden biridir; 1947'den beri Birleşmiş Milletler'in uzman kuruluşudur.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="2" data-demo="osmanli" id="osmanli">
  <div class="text">
    <h2>Osmanlı'da telgraf</h2>
    <p class="lead">Telgraf Osmanlı topraklarına bir savaşla geldi: Kırım Savaşı'nda müttefik ordular cephe ile başkentler arasında hızlı haberleşmeye ihtiyaç duyuyordu.</p>
    <p>İlk hatlar 1855'te askerî amaçla kuruldu. İstanbul–Edirne–Şumnu hattı 1855 yazının sonunda tamamlandı; ilk telgrafın tarihi kaynaklarda Ağustos ve Eylül 1855 arasında farklı günlerle verilir. Sonraki yıllarda ağ Anadolu'nun içlerine ve imparatorluğun öbür uçlarına doğru genişledi.</p>
    <p>Telgraf Arap harfleriyle yazılan Osmanlı Türkçesi için de kullanılabilsin diye bu harflere göre bir mors kodu düzenlendi. Kaynaklar, ilk Türkçe telgrafın 1856'da Telgrafçı Mustafa Efendi'nin çabasıyla Edirne'den İstanbul'a çekildiğini aktarır.</p>
    <h3>Telgraf üslubu</h3>
    <p>Telgraf kelime başına ücretliydi. Bu yüzden insanlar gereksiz her kelimeyi atan, kısa ve kuru bir dil geliştirdi: "Yarın geliyorum, karşılayın." Bu dile bugün de "telgraf üslubu" diyoruz.</p>
    <p class="try">Bir telgraf yazın. "Telgraf üslubuna çevir" gereksiz kelimeleri atar; kelime sayısının ve gönderme süresinin nasıl düştüğünü görün, sonra şeritten gönderin.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Tarihler için kaynaklar farklılık gösteriyor (19 Ağustos, 6/14/15 Eylül 1855); bu yüzden metinde ay düzeyinde bırakıldı. Kontrol listesinde.</li>
    <li>Osmanlı Türkçesi mors kodunun ayrıntıları (kimin düzenlediği, hangi tarihte) burada bilerek verilmedi; bir tarihçiye danışılacak.</li>
    <li>Deneydeki "telgraf üslubu" basit bir kural listesidir: bağlaçlar, nezaket sözleri ve noktalama atılır. Gerçek telgrafçılar ve müşteriler çok daha yaratıcıydı.</li>
  </ul></aside>
</section>
`);

L.slide(`
<section class="slide" data-chapter="2" data-demo="sos" id="sos">
  <div class="text">
    <h2>SOS</h2>
    <p class="lead">Telsiz gemilere girince denizde yardım çağırmanın yolu değişti. Ama önce herkesin aynı çağrıyı tanıması gerekiyordu.</p>
    <p>Marconi şirketi 1904'te kendi telsizcileri için <strong>CQD</strong>'yi tehlike çağrısı yaptı: CQ "bütün istasyonlar", D ise "distress" (tehlike). 1906'da Berlin'deki uluslararası telsiz konferansı yeni bir işaret kabul etti: <strong>SOS</strong>. Kural 1 Temmuz 1908'de yürürlüğe girdi.</p>
    <p>SOS'un bir anlamı yoktur; "Save Our Souls" sonradan uydurulmuş bir açılımdır. Seçilmesinin nedeni sesidir: üç kısa, üç uzun, üç kısa. Gürültünün içinde bile karıştırılmaz. Üstelik harfler arasında boşluk bırakılmadan, tek bir işaret gibi gönderilir.</p>
    <p>Nisan 1912'de Titanic'in telsizcisi Jack Phillips önce CQD gönderdi, ardından SOS'u da kullandı. Mors, 1 Şubat 1999'da Küresel Deniz Tehlike ve Güvenlik Sistemi (GMDSS) tümüyle yürürlüğe girene kadar denizde tehlike haberleşmesinin temeliydi.</p>
    <p class="try">Üç şerit aynı ölçekte. SOS'un tek işaret olarak gönderilişini harflerle gönderilişiyle ve eski CQD ile karşılaştırın.</p>
  </div>
  <div class="stage"></div>
  <aside class="notes"><ul>
    <li>Berlin Uluslararası Telsiz Telgraf Sözleşmesi 3 Kasım 1906'da imzalandı; tehlike işareti SOS düzenlemelerde "··· −−− ···" olarak tanımlandı.</li>
    <li>SOS gerçekte üç harf değil, bir usul işaretidir: S ile O ve O ile S arasında harf boşluğu yoktur. Yazarken üstüne çizgi çekilir.</li>
    <li>Sesli telsizde karşılığı "Mayday"dir (Fransızca m'aidez, "bana yardım edin").</li>
    <li>Gerçek bir tehlike olmadıkça SOS ya da Mayday göndermek suçtur; alıştırmayı yalnızca kulaklıkla, yayın yapmadan yapın.</li>
  </ul></aside>
</section>
`);
