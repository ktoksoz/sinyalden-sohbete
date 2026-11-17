/* 1. Nokta ve çizgi: deneyler
   - zamanBirimi: birim ızgaralı statik şerit; yazılan metnin işaret/boşluk birimleri sayılır, imleçle çalınır
   - alfabe:      ITU harfleri, rakamlar, noktalama, Türkçe harfler, usul işaretleri; dokun-dinle
   - agac:        mors ağacı (SVG); harf çalarken yol adım adım yanar
   - siklik:      İngilizce sıklık ↔ kod uzunluğu grafiği; Türkçe metinle ortalama birim hesabı
   - hiz:         wpm kaydırıcısı, PARIS; birim süresi ve dört hızın karşılaştırması */
(function () {
  const { h, fmtNum, kodSvg, kodYaz } = L;
  const SVGNS = "http://www.w3.org/2000/svg";
  const sv = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };

  /* Statik şeritte çal: imleç ve harf vurgusu yürür. Dönüş: {stop} */
  function statikCal(serit, cz, o, onHarf) {
    const hnd = Snd.calCizelge(cz, o);
    const bitir = Serit.izle(serit, hnd, onHarf);
    return { hnd, stop() { hnd.stop(); bitir(); } };
  }

  /* ================= Zaman birimi ================= */
  window.Demos.zamanBirimi = (stage) => {
    const kutu = h("input.satir-giris", { type: "text", value: "PARIS", maxlength: 24, spellcheck: "false", autocomplete: "off", "aria-label": "Birimleri sayılacak metin" });
    const calBtn = L.ibtn("play", "Çal", () => (cal ? durdur() : calistir()), "primary");
    const sayac = h("div.skor.birim-sayac");
    const sheet = h("div.sheet.zb-sheet");
    stage.append(h("div.controls", kutu, calBtn), sheet, sayac);
    const serit = Serit(sheet, { kip: "statik", birimIzgara: true });
    serit.el.classList.add("buyuk");
    let cal = null, cz = null;

    function kur() {
      durdur();
      cz = Mors.cizelge(kutu.value || "PARIS", { wpm: L.prefs.wpm, tr: L.prefs.trHarf });
      serit.temizle();
      if (!cz.isaretler.length) { sayac.replaceChildren(h("p.note-msg", "Harf ya da rakam yazın.")); return; }
      serit.cizelge(cz, 0);
      // birim sayımı
      const u = cz.z.birim;
      let ses = 0, ic = 0, harfA = 0, kelA = 0;
      cz.isaretler.forEach((m, i) => {
        ses += Math.round(m.d / u);
        const s = cz.isaretler[i + 1];
        if (!s) return;
        const g = Math.round((s.t - m.t - m.d) / u);
        if (s.hi === m.hi) ic += g; else if (cz.harfler[s.hi].kelimeBasi) kelA += g; else harfA += g;
      });
      const top = ses + ic + harfA + kelA;
      const olc = (b, s) => h("div.olcum", h("b", fmtNum(b)), h("small", s));
      sayac.replaceChildren(olc(ses, "birim ses"), olc(ic, "harf içi boşluk"), olc(harfA, "harf arası"), olc(kelA, "kelime arası"),
        olc(top, `toplam birim · ${L.prefs.wpm} wpm'de ${fmtNum(top * u * 1000)} ms`));
    }
    function calistir() {
      if (!cz || !cz.isaretler.length) return;
      cal = statikCal(serit, cz, L.hiz({ fwpm: null }));
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      cal.hnd.bitti.then(() => { if (cal) durdur(); });
    }
    function durdur() { if (cal) { const c = cal; cal = null; c.stop(); } calBtn.setIcon("play"); calBtn.setLabel("Çal"); }
    kutu.addEventListener("input", kur);
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); calistir(); } });
    window.addEventListener("prefchange", () => kur());
    kur();
    return { leave: durdur, toggle() { cal ? durdur() : calistir(); } };
  };

  /* ================= Alfabe ================= */
  const GRUPLAR = {
    harf: { ad: "Harfler", liste: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
    rakam: { ad: "Rakamlar", liste: "1234567890".split("") },
    nokta: { ad: "Noktalama", liste: ".,?'/()-:=+\"@".split("") },
    tr: { ad: "Türkçe", liste: ["Ç", "Ğ", "Ö", "Ş", "Ü"] },
    usul: { ad: "Usul işaretleri", liste: ["AR", "SK", "BT", "KN", "AS", "KA", "VE", "HH", "SOS"] },
  };
  const ACIKLAMA = {
    ".": "nokta", ",": "virgül", "?": "soru işareti", "'": "kesme işareti", "/": "eğik çizgi", "(": "parantez aç", ")": "parantez kapa",
    "-": "kısa çizgi", ":": "iki nokta", "=": "ayraç (BT ile aynı)", "+": "artı (AR ile aynı)", '"': "tırnak", "@": "et işareti (2004'te eklendi)",
    AR: "mesaj sonu", SK: "görüşme sonu", BT: "ayraç, yeni paragraf", KN: "yalnız çağrılan cevap versin", AS: "bekle", KA: "başlangıç",
    VE: "anlaşıldı", HH: "hata (sekiz nokta)", SOS: "tehlike",
    "Ç": "Türkiye'de; Esperanto Ĉ ile aynı", "Ğ": "Türkiye'de; Esperanto Ĝ ile aynı", "Ö": "Türkiye'de; Almanca Ö ile aynı", "Ş": "Türkiye'de; İzlandaca Þ ile aynı", "Ü": "Türkiye'de; Almanca Ü ile aynı",
  };
  window.Demos.alfabe = (stage) => {
    let grup = "harf", secili = null, cal = null;
    const sekme = L.seg(Object.entries(GRUPLAR).map(([k, g]) => [k, g.ad]), grup, (k) => { grup = k; ciz(); }, "Alfabe bölümü");
    const buyuk = h("div.alf-secili");
    const izgara = h("div.harf-izgara.alf-izgara");
    stage.append(h("div.controls", sekme), buyuk, h("div.scroll.alf-kaydir", izgara));

    const kodOf = (x) => (grup === "usul" ? Mors.USUL[x] : Mors.HEPSI[x]);
    const metinOf = (x) => (grup === "usul" ? "<" + x + ">" : x);
    function goster(x) {
      const kod = kodOf(x);
      const birim = Mors.kodBirim(kod);
      buyuk.replaceChildren(
        h("b.alf-harf", grup === "usul" ? h("span.ustcizgi", x) : x),
        h("div.alf-bilgi",
          h("span.kod.alf-kod", kodYaz(kod)),
          h("span.alf-svg", { html: kodSvg(kod, { birim: 10, yuk: 10 }) }),
          h("small", `${birim} birim${ACIKLAMA[x] ? " · " + ACIKLAMA[x] : ""}`)));
    }
    function ciz() {
      izgara.replaceChildren();
      GRUPLAR[grup].liste.forEach((x) => {
        const kod = kodOf(x);
        const b = h("button.harf-hucre", { type: "button", "aria-label": `${x}: ${kodYaz(kod)}`, onclick: () => sec(x, b) },
          h("b", grup === "usul" ? h("span.ustcizgi", x) : x), h("span", { html: kodSvg(kod, { birim: 6, yuk: 6 }) }));
        b.dataset.x = x;
        izgara.append(b);
      });
      const ilk = GRUPLAR[grup].liste[0];
      secili = ilk; goster(ilk); isaretle();
    }
    function isaretle() { izgara.querySelectorAll(".harf-hucre").forEach((b) => b.classList.toggle("on", b.dataset.x === secili)); }
    function sec(x) { secili = x; goster(x); isaretle(); calistir(); }
    function calistir() {
      cal && cal.stop();
      if (!secili) return;
      cal = Snd.cal(metinOf(secili), { tr: true, fwpm: null });
    }
    ciz();
    return { leave() { cal && cal.stop(); }, toggle: calistir };
  };

  /* ================= Mors ağacı ================= */
  window.Demos.agac = (stage) => {
    const W = 800, H = 330, KAT = 4;
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, class: "agac-svg", role: "img", "aria-label": "Mors ağacı: noktada sola, çizgide sağa" });
    const kap = h("div.sheet.agac-kap");
    const bilgi = h("div.agac-bilgi");
    const rastgeleBtn = L.btn("Rastgele harf", () => rastgele(), "primary");
    const gosterBtn = L.btn("Harfi göster", () => { if (bekleyen) { vurgula(bekleyen, bekleyen.length); yaz(bekleyen, true); bekleyen = null; } });
    stage.append(h("div.controls", rastgeleBtn, gosterBtn, h("span.spacer"), h("span.legend", h("span", h("span.kod", "·"), " sola"), h("span", h("span.kod", "−"), " sağa"))), kap, bilgi);
    kap.append(svg);
    const dugum = new Map(); // kod → {g, x, y, kenar}
    const y = (k) => 30 + k * ((H - 60) / KAT);
    function kur(kod, x0, x1) {
      const k = kod.length;
      const x = (x0 + x1) / 2;
      const harf = kod ? Mors.TERS[kod] : "";
      const tr = harf && !Mors.ITU[harf];
      const g = sv("g", { class: "agac-d" + (tr ? " tr" : "") + (kod && !harf ? " bos" : "") + (kod ? "" : " kok") });
      if (kod) {
        const ust = dugum.get(kod.slice(0, -1));
        const kenar = sv("line", { x1: ust.x, y1: ust.y, x2: x, y2: y(k), class: "agac-k" + (kod.endsWith("-") ? " dah" : "") });
        svg.prepend(kenar);
        dugum.set(kod, { g, x, y: y(k), kenar });
      } else dugum.set("", { g, x, y: y(0) });
      const r = kod ? 17 : 9;
      g.append(sv("circle", { cx: x, cy: y(k), r }));
      if (harf) {
        const t = sv("text", { x, y: y(k) + 1, "dominant-baseline": "middle", "text-anchor": "middle" }); t.textContent = harf; g.append(t);
        g.setAttribute("tabindex", 0); g.setAttribute("role", "button"); g.setAttribute("aria-label", `${harf}: ${kodYaz(kod)}`);
        g.addEventListener("click", () => cal(kod));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); cal(kod); } });
      }
      svg.append(g);
      if (k < KAT) { kur(kod + ".", x0, x); kur(kod + "-", x, x1); }
    }
    // düğümler kenarlardan sonra eklensin diye önce kenarları çiz: kur() kenarı prepend ediyor
    kur("", 0, W);
    // kök sabit: kodsuz düğümün kenarı yok
    let hnd = null, raf = 0, bekleyen = null;
    function vurgula(kod, n) {
      dugum.forEach((d, k) => {
        const yolda = k.length <= n && kod.startsWith(k) && k.length > 0;
        d.g.classList.toggle("yol", yolda);
        d.g.classList.toggle("son", yolda && k.length === n && n === kod.length);
        d.kenar && d.kenar.classList.toggle("yol", yolda);
      });
    }
    function yaz(kod, harfGoster) {
      const harf = Mors.TERS[kod];
      bilgi.replaceChildren(h("span.kod.agac-kod", kodYaz(kod)), harfGoster ? h("b.agac-harf", harf) : h("span.agac-soru", "Hangi harf? Yolu izleyin."));
    }
    function cal(kod, gizli = false) {
      dur();
      vurgula(kod, 0);
      yaz(kod, !gizli);
      const cz = Mors.cizelge(Mors.TERS[kod], L.hiz({ tr: true, fwpm: null, wpm: Math.min(L.prefs.wpm, 15) }));
      hnd = Snd.calCizelge(cz, L.hiz({ wpm: Math.min(L.prefs.wpm, 15) }));
      const adim = () => {
        const t = hnd.saat();
        let n = 0; cz.isaretler.forEach((m) => { if (t >= m.t) n++; });
        vurgula(kod, n);
        if (!hnd.durdu && t < cz.sure + 0.05) raf = requestAnimationFrame(adim);
        else if (gizli) vurgula(kod, kod.length);
      };
      raf = requestAnimationFrame(adim);
    }
    function rastgele() {
      const kodlar = [...dugum.keys()].filter((k) => k && Mors.ITU[Mors.TERS[k]]);
      const kod = L.sec(kodlar);
      bekleyen = kod;
      cal(kod, true);
    }
    function dur() { cancelAnimationFrame(raf); hnd && hnd.stop(); hnd = null; }
    bilgi.append(h("span.agac-soru", "Bir harfe dokunun ya da rastgele bir harf dinleyin."));
    return { leave() { dur(); vurgula("", 0); }, toggle: rastgele };
  };

  /* ================= Sıklık ================= */
  const ORNEK_TR = "Telgraf yüz yıldan uzun bir süre boyunca uzak şehirleri birbirine bağladı. Bir istasyondaki memur anahtara bastıkça, yüzlerce kilometre ötedeki alıcıda kısa ve uzun sesler duyulurdu. Kelime başına para ödendiği için mesajlar kısa yazılırdı: geliyorum, merak etmeyin, mektup yazacağım. Bugün aynı işaretler amatör telsizcilerin elinde yaşıyor; dünyanın öbür ucundaki biriyle birkaç watt güçle konuşmak hâlâ mümkün.";
  window.Demos.siklik = (stage) => {
    const grafik = h("div.sheet.siklik-grafik");
    const cv = h("canvas", { "aria-label": "İngilizce harf sıklığı ve mors kodu uzunluğu", role: "img" });
    grafik.append(cv);
    const alan = h("textarea.siklik-metin", { rows: 4, spellcheck: "false", "aria-label": "Türkçe metin" });
    alan.value = ORNEK_TR;
    const sonuc = h("div.skor");
    const tablo = h("div.siklik-tablo");
    stage.append(grafik, h("div.sheet.siklik-tr", alan, sonuc, tablo));

    const st = L.canvas(cv, () => ciz());
    function ciz() {
      const { ctx, w, h: H } = st;
      if (!w) return;
      const C = L.C;
      ctx.clearRect(0, 0, w, H);
      const harfler = Object.entries(Mors.SIKLIK_EN).sort((a, b) => b[1] - a[1]);
      const pad = 10, bw = (w - 2 * pad) / harfler.length;
      const ortaY = H * 0.5;
      L.text(ctx, "İngilizcede sıklık", pad, 14, { size: 11, color: C.muted, weight: 600 });
      L.text(ctx, "mors kodunun uzunluğu (birim)", pad, H - 4, { size: 11, color: C.muted, weight: 600 });
      harfler.forEach(([hf, f], i) => {
        const x = pad + i * bw;
        const fh = (f / 13) * (ortaY - 30);
        ctx.fillStyle = C.ink2;
        ctx.fillRect(x + bw * 0.18, ortaY - 12 - fh, bw * 0.64, fh);
        L.text(ctx, hf, x + bw / 2, ortaY, { size: Math.min(13, bw * 0.7), color: C.ink, align: "center", base: "middle", weight: 700, font: L.FONT.mono });
        const u = Mors.kodBirim(Mors.ITU[hf]);
        const uh = (u / 13) * (H - ortaY - 30);
        ctx.fillStyle = C.pirinc;
        ctx.fillRect(x + bw * 0.18, ortaY + 12, bw * 0.64, uh);
      });
    }
    window.addEventListener("themechange", ciz);

    function hesapla() {
      const say = {};
      let n = 0;
      for (const c of Mors.buyuk(alan.value)) if (/[A-ZÇĞÖŞÜ]/.test(c)) { say[c] = (say[c] || 0) + 1; n++; }
      if (!n) { sonuc.replaceChildren(h("p.note-msg", "Metinde harf yok.")); tablo.replaceChildren(); return; }
      const sirali = Object.entries(say).sort((a, b) => b[1] - a[1]);
      // gerçek kodlarla ortalama
      const gercek = sirali.reduce((a, [c, k]) => a + k * Mors.kodBirim(Mors.HEPSI[c]), 0) / n;
      // aynı kod kümesinin sıklığa göre yeniden dağıtımı: en sık harfe en kısa kod
      const kume = [...Object.values(Mors.ITU).filter((k, i) => /[A-Z]/.test(Object.keys(Mors.ITU)[i])), ...Object.values(Mors.TR)]
        .sort((a, b) => Mors.kodBirim(a) - Mors.kodBirim(b) || a.length - b.length);
      const yeni = {};
      sirali.forEach(([c], i) => (yeni[c] = kume[i]));
      const eniyi = sirali.reduce((a, [c, k]) => a + k * Mors.kodBirim(yeni[c]), 0) / n;
      const olc = (b, s, cls = "") => h("div.olcum" + cls, h("b", b), h("small", s));
      sonuc.replaceChildren(
        olc(fmtNum(n), "harf"),
        olc(fmtNum(gercek, 2), "birim/harf, bugünkü kodla"),
        olc(fmtNum(eniyi, 2), "birim/harf, Türkçeye göre dağıtılsa", ".tam"),
        olc("%" + fmtNum((1 - eniyi / gercek) * 100, 0), "daha kısa"));
      tablo.replaceChildren(h("table.data",
        h("thead", h("tr", h("th", "Harf"), h("th", "Pay"), h("th", "Bugünkü kod"), h("th", "Türkçeye göre"))),
        h("tbody", sirali.slice(0, 10).map(([c, k]) => h("tr",
          h("td", h("b.kod", c)), h("td", "%" + fmtNum((k / n) * 100, 1)),
          h("td", { html: kodSvg(Mors.HEPSI[c], { birim: 5, yuk: 5 }) + ` <small>${Mors.kodBirim(Mors.HEPSI[c])}</small>` }),
          h("td", { html: kodSvg(yeni[c], { birim: 5, yuk: 5 }) + ` <small>${Mors.kodBirim(yeni[c])}</small>` }))))));
    }
    alan.addEventListener("input", hesapla);
    hesapla();
    let cal = null;
    return { leave() { cal && cal.stop(); }, toggle() { cal && cal.stop(); cal = Snd.cal("ETAOIN", { fwpm: null }); } };
  };

  /* ================= Hız ================= */
  window.Demos.hiz = (stage) => {
    let wpm = L.prefs.wpm, cal = null;
    const sl = L.slider({ label: "Hız", min: 5, max: 40, value: wpm, fmt: (v) => v + " wpm", oninput: (v) => { wpm = v; guncelle(); } });
    const hazir = L.seg([[5, "5"], [13, "13"], [20, "20"], [30, "30"]], null, (k) => { wpm = k; sl.set(k); guncelle(); calistir(); }, "Hazır hızlar");
    const calBtn = L.ibtn("play", "PARIS'i çal", () => (cal ? durdur() : calistir()), "primary");
    const olcumler = h("div.skor");
    const sheet = h("div.sheet.hiz-sheet");
    const kiyas = h("div.hiz-kiyas");
    stage.append(h("div.controls", sl, hazir), h("div.controls", calBtn), sheet, olcumler, kiyas);
    const serit = Serit(sheet, { kip: "statik", birimIzgara: true });
    let cz = null;
    function guncelle() {
      durdur();
      hazir.set([5, 13, 20, 30].includes(wpm) ? wpm : null);
      cz = Mors.cizelge("PARIS", { wpm });
      serit.temizle(); serit.cizelge(cz, 0);
      const u = 1.2 / wpm;
      const olc = (b, s) => h("div.olcum", h("b", b), h("small", s));
      olcumler.replaceChildren(olc(fmtNum(u * 1000) + " ms", "bir birim (nokta)"), olc(fmtNum(3 * u * 1000) + " ms", "çizgi"),
        olc(fmtNum(50 * u, 2) + " sn", "PARIS + kelime boşluğu"), olc(fmtNum(wpm * 5), "harf/dakika (yaklaşık)"));
      // dört hızın karşılaştırması: aynı kelimenin süresi
      const enUzun = 50 * 1.2 / 5;
      kiyas.replaceChildren(...[5, 13, 20, 30, wpm].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b).map((v) => {
        const s = 50 * 1.2 / v;
        return h("div.hiz-satir" + (v === wpm ? ".on" : ""), h("span.hiz-ad", v + " wpm"), h("span.hiz-cubuk", h("i", { style: { width: (s / enUzun) * 100 + "%" } })), h("span.hiz-sn", fmtNum(s, 1) + " sn"));
      }));
    }
    function calistir() {
      durdur();
      cal = statikCal(serit, cz, { wpm, f: L.prefs.ton });
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      cal.hnd.bitti.then(() => { if (cal) durdur(); });
    }
    function durdur() { if (cal) { const c = cal; cal = null; c.stop(); } calBtn.setIcon("play"); calBtn.setLabel("PARIS'i çal"); }
    guncelle();
    return { leave: durdur, toggle() { cal ? durdur() : calistir(); } };
  };
})();
