/* Sözlük: metindeki terimlerin üzerine gelince açılan tanım balonları. Şan eğitiminden uyarlandı.
   Her terim slayt başına yalnızca ilk geçtiği yerde işaretlenir. */
(function () {
  const trw = (q) => "https://tr.wikipedia.org/w/index.php?search=" + encodeURIComponent(q);
  const enw = (t) => "https://en.wikipedia.org/wiki/" + t;

  // k: aranacak kökler (küçük harf, Türkçe ekler otomatik kapsanır), t: başlık, d: tanım, u: bağlantı
  const TERMS = [
    { k: ["mors alfabesi", "mors kodu"], t: "Mors alfabesi", d: "Harfleri, rakamları ve noktalama işaretlerini kısa (nokta) ve uzun (çizgi) sinyallerin dizisiyle gösteren kodlama. Bugün kullanılan uluslararası biçim 1848'de Friedrich Gerke'nin düzenlemesine dayanır; ITU-R M.1677 tavsiyesiyle tanımlanır.", u: trw("Mors alfabesi") },
    { k: ["wpm"], exact: true, t: "WPM (kelime/dakika)", d: "Mors hızı birimi: dakikada gönderilen kelime sayısı. Ölçü kelimesi \"PARIS\" boşluğuyla birlikte tam 50 birim sürer; bu yüzden bir birim (nokta) 1200/wpm milisaniyedir.", u: enw("Words_per_minute#Morse_code") },
    { k: ["farnsworth"], t: "Farnsworth yöntemi", d: "Harflerin kendi hızında gönderilip harfler ve kelimeler arasına fazladan boşluk konması. Harfin ses kalıbı bozulmaz, öğrenene düşünme payı kalır. Adını Donald R. \"Russ\" Farnsworth'ten (W6TTB) alır.", u: enw("Morse_code#Farnsworth_speed") },
    { k: ["koch"], t: "Koch yöntemi", d: "Alman psikolog Ludwig Koch'un 1930'larda önerdiği öğrenme yolu: baştan hedef hızda ama yalnızca iki harfle başlanır; doğruluk %90'ı geçince yeni bir harf eklenir.", u: enw("Morse_code#Koch_method") },
    { k: ["cw"], exact: true, t: "CW (sürekli dalga)", d: "İngilizce continuous wave. Taşıyıcı dalganın anahtarla açılıp kapatılmasıyla yapılan yayın; telsizcilerin mors yayınına verdiği ad.", u: enw("Continuous_wave") },
    { k: ["taşıyıcı"], t: "Taşıyıcı", d: "Bilgiyi taşıması için verici tarafından üretilen sabit frekanslı radyo dalgası. CW'de bilgi yalnızca taşıyıcının var olup olmamasıdır.", u: trw("Taşıyıcı dalga") },
    { k: ["bant genişliği"], t: "Bant genişliği", d: "Bir sinyalin frekans ekseninde kapladığı yer ya da bir süzgecin geçirdiği frekans aralığı. Dar süzgeç daha az gürültü geçirir.", u: trw("Bant genişliği") },
    { k: ["bfo"], exact: true, t: "BFO (vuru osilatörü)", d: "Beat frequency oscillator. Alıcıda CW taşıyıcısına yakın bir frekans üretip onunla karıştırarak duyulabilir bir fark tonu (ör. 600 Hz) oluşturan osilatör.", u: enw("Beat_frequency_oscillator") },
    { k: ["anahtar tıkı", "tık"], exact: true, t: "Anahtar tıkı (key click)", d: "Sinyalin çok sert açılıp kapanmasıyla oluşan, spektrumda geniş yer kaplayan tıkırtı. Kenarlar birkaç milisaniyede yumuşatılarak önlenir.", u: enw("Key_click") },
    { k: ["iambik"], t: "İambik anahtar", d: "Bir kolu noktaları, öteki kolu çizgileri üreten çift kollu anahtar. İki kol birlikte sıkılınca nokta-çizgi sırayla gelir; adını şiirdeki kısa-uzun hece ölçüsünden (iambus) alır.", u: enw("Telegraph_key#Iambic_keyer") },
    { k: ["q kodu", "q kodları"], t: "Q kodları", d: "Q ile başlayan üç harfli kısaltmalar (QTH: konum, QRS: yavaşla…). 1909'da gemi telsizcileri için düzenlendi; dil bilmeden anlaşmaya yarar.", u: trw("Q kodu") },
    { k: ["rst"], exact: true, t: "RST raporu", d: "Karşı istasyona sinyalinin nasıl alındığını bildiren üç rakam: okunabilirlik (1–5), güç (1–9), ton kalitesi (1–9). \"599\" kusursuz demektir.", u: enw("R-S-T_system") },
    { k: ["çağrı işareti"], t: "Çağrı işareti", d: "Her telsiz istasyonuna verilen benzersiz ad. Ön eki ülkeyi gösterir: Türkiye'ye TA–TC blokları ayrılmıştır.", u: trw("Çağrı işareti") },
    { k: ["qso"], exact: true, t: "QSO", d: "İki telsiz istasyonu arasındaki görüşme. Q kodundan gelir: \"…ile görüşebilir misiniz?\"", u: enw("QSO") },
    { k: ["prosign", "usul işareti"], t: "Usul işareti (prosign)", d: "İki harfin aralarında boşluk bırakılmadan tek bir işaret gibi gönderilmesiyle oluşan kontrol işaretleri: AR mesaj sonu, SK görüşme sonu, BT ayraç, KN yalnız sen…", u: enw("Prosigns_for_Morse_code") },
    { k: ["gmdss"], exact: true, t: "GMDSS", d: "Küresel Deniz Tehlike ve Güvenlik Sistemi. 1 Şubat 1999'da tam yürürlüğe girdi; gemilerde mors ile tehlike dinleme zorunluluğu böylece sona erdi.", u: enw("Global_Maritime_Distress_and_Safety_System") },
    { k: ["goertzel"], exact: true, t: "Goertzel algoritması", d: "Bir sinyalde tek bir frekansın ne kadar güçlü olduğunu az işlemle hesaplayan yöntem (Gerald Goertzel, 1958). Tuşlu telefon seslerini çözmekte de kullanılır.", u: enw("Goertzel_algorithm") },
    { k: ["telgraf"], t: "Telgraf", d: "Yunanca \"uzağa yazan\". Mesajı uzağa işaretlerle ileten sistem; önce optik (semafor), 1830'lardan sonra elektrikli.", u: trw("Telgraf") },
    { k: ["semafor"], t: "Semafor (optik telgraf)", d: "Kuleler üzerindeki hareketli kolların konumlarıyla mesaj ileten sistem. Claude Chappe'nin Fransa'daki ağı 1794'te çalışmaya başladı.", u: trw("Semafor") },
    { k: ["frekans"], t: "Frekans", d: "Saniyedeki titreşim sayısı; birimi hertz (Hz).", u: trw("Frekans") },
    { k: ["spektrum"], t: "Spektrum", d: "Bir sinyaldeki enerjinin frekanslara göre dağılımı.", u: trw("Spektrum") },
  ];

  // her kök için: kelime başında başlayan, ardından Türkçe ekler gelebilen düzenli ifade
  const L_ = "a-zçğıöşüâîûA-ZÇĞİÖŞÜÂÎÛ";
  // karşılaştırma için: Türkçe küçük harf + ı/i ayrımını kaldır (MYCIN → mycin, ama uzunluk değişmez)
  const lower = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  TERMS.forEach((term) => {
    // exact: ek almaz (ör. "yin" kelimesi "yine"nin içinde eşleşmesin)
    term.re = term.k.map((k) => new RegExp(`(^|[^${L_}])(${lower(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${term.exact ? `(?![${L_}])` : (term.not ? `(?!${term.not})` : "") + `[${L_}'’]*`})`));
  });
  const SKIP = "h1, h2, h3, .chapter-tag, .num, summary, a, .term, .try, button, .license, .cover-meta, .mono, .kod, kbd, .lead-c";

  function markSlide(root) {
    const sid = root.closest(".slide").id;
    // yalnızca belirli slaytlarda anlamlı olan terimleri (ör. "sıcaklık") diğerlerinde atla
    const done = new Set(TERMS.map((t, i) => ((t.only && !t.only.includes(sid)) || (t.except && t.except.includes(sid)) ? i : -1)).filter((i) => i >= 0));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let text = node.nodeValue;
      let parts = null;
      // düğümde geçen ilk uygun terimi bul, böl, tekrarla
      for (;;) {
        let best = null;
        const low = lower(text);
        TERMS.forEach((term, ti) => {
          if (done.has(ti)) return;
          term.re.forEach((re) => {
            const m = re.exec(low);
            if (m && (!best || m.index + m[1].length < best.i)) best = { i: m.index + m[1].length, len: m[2].length, ti };
          });
        });
        if (!best) break;
        done.add(best.ti);
        parts = parts || [];
        parts.push(text.slice(0, best.i));
        const span = document.createElement("span");
        span.className = "term"; span.tabIndex = 0; span.dataset.ti = best.ti;
        span.textContent = text.slice(best.i, best.i + best.len);
        parts.push(span);
        text = text.slice(best.i + best.len);
      }
      if (parts) { parts.push(text); node.replaceWith(...parts); }
    });
  }
  document.querySelectorAll(".slide .text, .slide .cover-text").forEach(markSlide);

  /* --- balon --- */
  const pop = document.createElement("div");
  pop.id = "gloss"; pop.setAttribute("role", "tooltip");
  document.body.append(pop);
  let cur = null, hideT = 0;
  function show(el) {
    clearTimeout(hideT);
    if (cur === el && pop.classList.contains("open")) return;
    cur = el;
    const t = TERMS[+el.dataset.ti];
    pop.innerHTML = "";
    const h4 = document.createElement("h4"); h4.textContent = t.t;
    const p = document.createElement("p"); p.textContent = t.d;
    const a = document.createElement("a");
    a.href = t.u; a.target = "_blank"; a.rel = "noopener";
    a.textContent = t.u.includes("tr.wikipedia") ? "Vikipedi'de oku ↗" : "Wikipedia'da oku (İngilizce) ↗";
    pop.append(h4, p, a);
    pop.classList.add("open");
    const r = el.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 12);
    let y = r.top - ph - 10;
    pop.classList.toggle("below", y < 8);
    if (y < 8) y = r.bottom + 10;
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  function hide(delay = 180) {
    clearTimeout(hideT);
    hideT = setTimeout(() => { pop.classList.remove("open"); cur = null; }, delay);
  }
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest && e.target.closest(".term");
    if (el) show(el);
    else if (e.target.closest && e.target.closest("#gloss")) clearTimeout(hideT);
    else if (cur) hide();
  });
  document.addEventListener("focusin", (e) => { if (e.target.classList && e.target.classList.contains("term")) show(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target.classList && e.target.classList.contains("term")) hide(250); });
  // dokunmatik: dokununca aç/kapa
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".term");
    if (el) { e.preventDefault(); cur === el && pop.classList.contains("open") ? hide(0) : show(el); }
    else if (!e.target.closest("#gloss")) hide(0);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(0); });
  document.getElementById("deck").addEventListener("scroll", () => hide(0), true);
})();
