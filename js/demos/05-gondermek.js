/* 5. Göndermek: deneyler
   - duzAnahtar:        pirinç düz anahtar (düğme + Boşluk), akan şerit, canlı çözme, zamanlama ölçümleri
   - iambik:            iki kollu anahtar (Z/X, ./), mod A/B, hız; kollar ve sinyal için canlı zaman çizelgesi
   - gondermeAlistirma: hedef metni gönder, harf harf karşılaştır, doğruluk ve en iyi sonuç (localStorage) */
(function () {
  const { h, C, FONT, fmtNum, store, seg, slider, btn, rgba } = L;

  // Düğmeyi anahtar gibi bağla: basılı tutuldukça bas(), bırakınca birak()
  function dugmeBagla(el, bas, birak) {
    let aktif = false;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); Snd.unlock(); try { el.setPointerCapture(e.pointerId); } catch (er) {} if (!aktif) { aktif = true; el.classList.add("basili"); bas(); } });
    const bit = () => { if (aktif) { aktif = false; el.classList.remove("basili"); birak(); } };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => el.addEventListener(ev, bit));
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    return bit;
  }
  // Çözülen metni göster: bekleyen kod pirinç renginde
  function cozulenYaz(el, an) {
    el.textContent = an.cozucu.metin;
    if (an.cozucu.kod) el.append(h("span.bekleyen", L.kodYaz(an.cozucu.kod)));
  }
  const olcum = (etiket) => { const b = h("b", "–"); const el = h("div.olcum", b, h("small", etiket)); el.yaz = (v, cls) => { b.textContent = v; el.className = "olcum" + (cls ? " " + cls : ""); }; return el; };
  // Düzenleme uzaklığı hizalaması: hedefin her harfi için doğru mu?
  function hizala(hedef, gelen) {
    const a = [...hedef], b = [...gelen];
    const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    // geri izleme
    const durum = new Array(a.length).fill(false);
    let i = a.length, j = b.length;
    while (i > 0 && j > 0) {
      if (d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { durum[i - 1] = a[i - 1] === b[j - 1]; i--; j--; }
      else if (d[i][j] === d[i - 1][j] + 1) { i--; }
      else j--;
    }
    return { mesafe: d[a.length][b.length], durum };
  }
  window.MorsHizala = hizala;

  /* ================= Düz anahtar ================= */
  window.Demos.duzAnahtar = (stage) => {
    const sheet = h("div.sheet.gon-sheet");
    stage.append(sheet);
    const seritKap = h("div");
    const cozulen = h("div.cozulen", { "data-bos": "Gönderdikleriniz burada çözülecek", "aria-live": "polite" });
    const tus = h("button.anahtar-btn", { type: "button", "aria-label": "Anahtar: basılı tutun" }, "BAS");
    const o = { nokta: olcum("nokta"), oran: olcum("çizgi / nokta (ideal 3)"), ic: olcum("harf içi boşluk / nokta (ideal 1)"), wpm: olcum("yaklaşık hız"), duz: olcum("düzenlilik") };
    const ipucu = h("p.note-msg", "Basılı tutun: kısa bas nokta, uzun bas çizgi.");
    sheet.append(seritKap, cozulen,
      h("div.gon-orta", tus, h("div.skor.gon-olcum", o.nokta, o.oran, o.ic, o.wpm, o.duz)),
      ipucu,
      h("div.controls", btn("Temizle", () => temizle(), "sm ghost"), h("span.spacer"), h("span.ctl-lab", "Klavye: Boşluk")));
    const serit = Serit(seritKap, { saniye: 6 });
    let an = yeni();
    function yeni() {
      return Anahtar({ tip: "duz", serit, wpm: 15,
        onHarf: () => cozulenYaz(cozulen, an),
        onIsaret: (acik) => { cozulenYaz(cozulen, an); if (!acik) analiz(); } });
    }
    function analiz() {
      const r = Anahtar.cozumle(an.kayit, an.cozucu.nokta);
      if (!r) return;
      o.nokta.yaz(r.nokta ? fmtNum(r.nokta * 1000) + " ms" : "–");
      o.oran.yaz(r.oran ? fmtNum(r.oran, 1) : "–", r.oran ? (Math.abs(r.oran - 3) < 0.6 ? "iyi" : "uyari") : "");
      o.ic.yaz(r.icBosluk && r.nokta ? fmtNum(r.icBosluk / r.nokta, 1) : "–", r.icBosluk && r.nokta ? (Math.abs(r.icBosluk / r.nokta - 1) < 0.5 ? "iyi" : "uyari") : "");
      o.wpm.yaz(r.wpm ? fmtNum(r.wpm) + " wpm" : "–");
      o.duz.yaz(r.sapma != null ? (r.sapma < 0.15 ? "çok iyi" : r.sapma < 0.3 ? "iyi" : "dağınık") : "–", r.sapma != null ? (r.sapma < 0.3 ? "iyi" : "uyari") : "");
      let m = "Güzel gidiyor. Oranı koruyarak devam edin.";
      if (r.oran && r.oran < 2.4) m = "Çizgiler kısa kalıyor: çizgiyi noktanın üç katı tutun, “dit” ile “daaah” arasındaki farkı abartın.";
      else if (r.oran && r.oran > 3.8) m = "Çizgiler uzun: çizgiyi biraz kısaltın, gönderiş daha akıcı duyulur.";
      else if (r.icBosluk && r.nokta && r.icBosluk / r.nokta > 1.8) m = "Harfin içindeki boşluklar uzun: harfi tek bir ritim gibi, duraksamadan gönderin.";
      else if (r.sapma != null && r.sapma > 0.3) m = "Noktaların uzunluğu değişiyor: daha yavaş ama eşit gönderin; hız sonra gelir.";
      ipucu.textContent = m;
    }
    function temizle() { an.sifirla(); serit.temizle(); cozulen.textContent = ""; Object.values(o).forEach((x) => x.yaz("–")); ipucu.textContent = "Basılı tutun: kısa bas nokta, uzun bas çizgi."; }
    dugmeBagla(tus, () => an.bas(), () => an.birak());
    return {
      enter() { serit.baslat(); },
      leave() { an.kapat(); tus.classList.remove("basili"); serit.durdur(); },
      tus(e, basili) {
        if (e.code !== "Space" && e.key !== " ") return false;
        if (e.repeat) return true;
        if (basili) { Snd.unlock(); tus.classList.add("basili"); an.bas(); } else { tus.classList.remove("basili"); an.birak(); }
        return true;
      },
    };
  };

  /* ================= İambik ================= */
  window.Demos.iambik = (stage) => {
    const sheet = h("div.sheet.gon-sheet");
    stage.append(sheet);
    const prefsMod = store.get("iambik.mod", "B");
    let wpm = store.get("iambik.wpm", 16);
    const cizim = h("div.iam-cizim", h("canvas", { "aria-hidden": "true" }));
    const seritKap = h("div");
    const cozulen = h("div.cozulen", { "data-bos": "Gönderdikleriniz burada çözülecek", "aria-live": "polite" });
    const kNokta = h("button.kol-btn", { type: "button", "aria-label": "Nokta kolu" }, h("span", "NOKTA", h("small", "Z  ya da  .")));
    const kCizgi = h("button.kol-btn", { type: "button", "aria-label": "Çizgi kolu" }, h("span", "ÇİZGİ", h("small", "X  ya da  /")));
    const modSeg = seg([["A", "Mod A"], ["B", "Mod B"]], prefsMod, (k) => { an.mod = k; store.set("iambik.mod", k); }, "Anahtar modu");
    const hizSl = slider({ label: "Hız", min: 8, max: 35, value: wpm, fmt: (v) => v + " wpm", oninput: (v) => { wpm = v; an.wpm = v; store.set("iambik.wpm", v); } });
    const goster = btn("Sıkışı göster", () => sikis());
    const not = h("p.note-msg", "“Sıkışı göster”: çizgi kolu basılır, hemen ardından nokta kolu; ikisi üçüncü öğenin ortasında bırakılır.");
    sheet.append(h("div.controls", modSeg, hizSl, h("span.spacer"), goster), cizim, seritKap, cozulen, h("div.kollar", kNokta, kCizgi), not,
      h("div.controls", btn("Temizle", () => temizle(), "sm ghost")));
    const serit = Serit(seritKap, { saniye: 5 });
    serit.el.classList.add("kucuk");
    const perf = () => performance.now() / 1000;
    // zaman çizelgesi verisi: kollar ve sinyal aralıkları
    const iz = { ".": [], "-": [], s: [] };
    const acikAralik = { ".": null, "-": null, s: null };
    function izAc(k) { if (!acikAralik[k]) { acikAralik[k] = { a: perf(), b: null }; iz[k].push(acikAralik[k]); if (iz[k].length > 200) iz[k].shift(); } }
    function izKapa(k) { if (acikAralik[k]) { acikAralik[k].b = perf(); acikAralik[k] = null; } }
    let an = yeni();
    function yeni() {
      return Anahtar({ tip: "iambik", mod: modSeg ? store.get("iambik.mod", "B") : "B", wpm, serit,
        onHarf: () => cozulenYaz(cozulen, an),
        onIsaret: (acik) => { acik ? izAc("s") : izKapa("s"); cozulenYaz(cozulen, an); } });
    }
    function kol(e, basili) {
      (e === "." ? kNokta : kCizgi).classList.toggle("basili", basili);
      basili ? izAc(e) : izKapa(e);
      an.kol(e, basili);
    }
    dugmeBagla(kNokta, () => kol(".", true), () => kol(".", false));
    dugmeBagla(kCizgi, () => kol("-", true), () => kol("-", false));
    let sikisZ = [];
    function sikis() {
      Snd.unlock();
      sikisZ.forEach(clearTimeout); sikisZ = [];
      const u = 1.2 / wpm * 1000;
      const plan = [[0, "-", true], [0.4 * u, ".", true], [7.5 * u, "-", false], [7.5 * u, ".", false]];
      plan.forEach(([t, e, b]) => sikisZ.push(setTimeout(() => kol(e, b), t + 60)));
      const mod = an === null ? "B" : (store.get("iambik.mod", "B"));
      not.textContent = mod === "B" ? "Mod B: kollar üçüncü öğede (çizgi) bırakıldı; anahtar bir nokta daha ekledi → C (−·−·)." : "Mod A: kollar üçüncü öğede (çizgi) bırakıldı; anahtar o öğeyi bitirip sustu → K (−·−).";
    }
    function temizle() { sikisZ.forEach(clearTimeout); an.sifirla(); serit.temizle(); cozulen.textContent = ""; iz["."].length = iz["-"].length = iz.s.length = 0; Object.keys(acikAralik).forEach((k) => (acikAralik[k] = null)); kNokta.classList.remove("basili"); kCizgi.classList.remove("basili"); }

    // canlı zaman çizelgesi (üç satır)
    const cv = cizim.querySelector("canvas");
    const st = L.canvas(cv, () => ciz());
    const dongu = L.loop(() => ciz());
    function ciz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const now = perf(), span = 4, sol = 92, pps = (w - sol - 10) / span;
      const x = (t) => sol + (t - (now - span)) * pps;
      const satirlar = [[".", "nokta kolu", C.ink2], ["-", "çizgi kolu", C.ink2], ["s", "sinyal", C.pirinc]];
      const rh = H / 3;
      satirlar.forEach(([k, ad, renk], i) => {
        const y = i * rh;
        L.text(ctx, ad, 4, y + rh / 2, { size: 12, color: C.muted, base: "middle", weight: 600 });
        ctx.fillStyle = rgba(C.ink, 0.06); ctx.fillRect(sol, y + rh / 2 - 1, w - sol - 10, 2);
        ctx.fillStyle = renk;
        iz[k].forEach((a) => {
          const b = a.b == null ? now : a.b;
          if (b < now - span) return;
          const xa = Math.max(sol, x(a.a)), xb = x(b);
          ctx.fillRect(xa, y + rh * 0.25, Math.max(2, xb - xa), rh * 0.5);
        });
      });
    }
    window.addEventListener("prefchange", () => {});
    const KEY = { KeyZ: ".", Period: ".", KeyX: "-", Slash: "-" };
    return {
      enter() { an.mod = store.get("iambik.mod", "B"); serit.baslat(); dongu.start(); },
      leave() { sikisZ.forEach(clearTimeout); an.kapat(); kNokta.classList.remove("basili"); kCizgi.classList.remove("basili"); serit.durdur(); dongu.stop(); },
      toggle() { sikis(); },
      tus(e, basili) {
        const k = KEY[e.code] || (e.key === "." ? "." : e.key === "/" ? "-" : e.key === "z" || e.key === "Z" ? "." : e.key === "x" || e.key === "X" ? "-" : null);
        if (!k) return false;
        if (e.repeat) return true;
        Snd.unlock(); kol(k, basili);
        return true;
      },
    };
  };

  /* ================= Gönderme alıştırması ================= */
  const KELIMELER = ["CQ", "DE", "TEST", "RST", "NAME", "QTH", "73", "TU", "FB", "OP", "ANT", "RIG", "WX", "PSE", "SELAM", "TELGRAF", "SINYAL", "MORS", "ANAHTAR", "KULAK", "RADYO", "DALGA", "ISTANBUL", "ANKARA", "IZMIR", "SES", "ODA", "KOD", "SOHBET", "NOKTA"];
  const ONEK = ["TA1", "TA2", "TA3", "TA4", "TA7", "TB2", "TC3", "DL1", "G4", "F5", "OH2", "JA1", "K1", "W6", "VE3", "I2", "EA4", "SP9", "OK1", "YO3"];
  const CUMLELER = ["CQ CQ DE TA2ABC K", "TNX FER CALL", "UR RST 599 5NN", "NAME IS ALI", "QTH ANKARA", "RIG 100W ANT DIPOLE", "WX SUNNY", "73 ES GL", "PSE QRS", "HW CPY"];
  const harf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const cagri = () => L.sec(ONEK) + Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => L.sec([...harf])).join("");
  function hedefUret(tur) {
    if (tur === "kelime") { const a = L.sec(KELIMELER); let b = L.sec(KELIMELER); while (b === a) b = L.sec(KELIMELER); return a + " " + b; }
    if (tur === "cagri") return cagri();
    return L.sec(CUMLELER);
  }
  window.Demos.gondermeAlistirma = (stage) => {
    const sheet = h("div.sheet.gon-sheet");
    stage.append(sheet);
    let tur = store.get("gonderme.tur", "kelime"), tip = store.get("gonderme.tip", "duz");
    let hedef = hedefUret(tur), bitti = false, baslaT = null;
    const hedefEl = h("div.gon-hedef", { "aria-live": "polite" });
    const cozulen = h("div.cozulen", { "data-bos": "Gönderdikleriniz burada çözülecek" });
    const sonuc = h("div.skor");
    const enIyiEl = h("p.kaynak");
    const seritKap = h("div");
    const tusDuz = h("button.anahtar-btn", { type: "button", "aria-label": "Düz anahtar: basılı tutun" }, "BAS");
    const kN = h("button.kol-btn", { type: "button", "aria-label": "Nokta kolu" }, h("span", "NOKTA", h("small", "Z")));
    const kC = h("button.kol-btn", { type: "button", "aria-label": "Çizgi kolu" }, h("span", "ÇİZGİ", h("small", "X")));
    const tuslar = h("div.gon-tuslar");
    const turSeg = seg([["kelime", "Kelimeler"], ["cagri", "Çağrı işaretleri"], ["cumle", "Telsiz cümleleri"]], tur, (k) => { tur = k; store.set("gonderme.tur", k); yeniHedef(); }, "Metin türü");
    const tipSeg = seg([["duz", "Düz anahtar"], ["iambik", "İki kollu"]], tip, (k) => { tip = k; store.set("gonderme.tip", k); an.tip = k; tuslariKur(); sifirla(); }, "Anahtar türü");
    sheet.append(h("div.controls", turSeg, tipSeg), hedefEl, seritKap, cozulen, tuslar, sonuc,
      h("div.controls", btn("Bitir", () => degerlendir(), "sm"), btn("Yeni metin", () => yeniHedef(), "sm primary"), btn("Hedefi dinle", () => Snd.cal(hedef), "sm ghost"), h("span.spacer"), enIyiEl));
    const serit = Serit(seritKap, { saniye: 5 });
    serit.el.classList.add("kucuk");
    let an = Anahtar({ tip, serit, wpm: L.prefs.wpm, mod: store.get("iambik.mod", "B"),
      onHarf: () => { cozulenYaz(cozulen, an); kontrol(); },
      onIsaret: (acik) => { if (acik && baslaT == null) baslaT = performance.now() / 1000; cozulenYaz(cozulen, an); } });
    function tuslariKur() { tuslar.innerHTML = ""; tuslar.append(tip === "duz" ? tusDuz : h("div.kollar", kN, kC)); }
    dugmeBagla(tusDuz, () => an.bas(), () => an.birak());
    dugmeBagla(kN, () => an.kol(".", true), () => an.kol(".", false));
    dugmeBagla(kC, () => an.kol("-", true), () => an.kol("-", false));
    tuslariKur();
    function hedefCiz(durum) {
      hedefEl.innerHTML = "";
      let k = 0;
      [...hedef].forEach((c) => {
        if (c === " ") { hedefEl.append(h("span.bosluk", " ")); return; }
        const d = durum ? durum[k] : null; k++;
        hedefEl.append(h("span" + (d === true ? ".dogru" : d === false ? ".yanlis" : ""), c));
      });
    }
    const sade = (s) => s.replace(/\s+/g, "");
    function kontrol() {
      if (bitti) return;
      // hedefteki harf sayısına ulaşıldı ve kelime boşluğu geldiyse değerlendir
      if (sade(an.cozucu.metin).length >= sade(hedef).length && an.cozucu.metin.endsWith(" ")) degerlendir();
    }
    let otoId = 0;
    function oto() { // sessizlikte de değerlendirmeyi yakala
      clearInterval(otoId);
      otoId = setInterval(() => { if (!bitti && sade(an.cozucu.metin).length >= sade(hedef).length && !an.cozucu.kod) degerlendir(); }, 400);
    }
    function degerlendir() {
      if (bitti) return;
      const gelen = an.cozucu.metin.trim();
      if (!sade(gelen)) { L.toast("Önce metni gönderin"); return; }
      bitti = true;
      const r = hizala(sade(hedef), sade(gelen));
      const n = sade(hedef).length;
      const dog = Math.max(0, 1 - r.mesafe / n);
      hedefCiz(r.durum);
      const sure = baslaT != null ? performance.now() / 1000 - baslaT : null;
      const wpmTah = an.cozucu.wpm;
      sonuc.innerHTML = "";
      const o1 = h("div.olcum" + (dog >= 0.9 ? ".iyi" : ".uyari"), h("b", L.yuzde(dog)), h("small", "doğruluk"));
      const o2 = h("div.olcum", h("b", fmtNum(wpmTah) + " wpm"), h("small", "harf hızınız (yaklaşık)"));
      const o3 = h("div.olcum", h("b", r.mesafe === 0 ? "kusursuz" : r.mesafe + " hata"), h("small", "eksik, fazla ya da yanlış harf"));
      sonuc.append(o1, o2, o3);
      const kayit = store.get("gonderme.gecmis", []);
      kayit.push({ t: Date.now(), d: Math.round(dog * 100), w: Math.round(wpmTah), tur });
      store.set("gonderme.gecmis", kayit.slice(-100));
      const en = store.get("gonderme.enIyi", null);
      if (dog >= 0.9 && (!en || wpmTah > en.w)) { store.set("gonderme.enIyi", { w: Math.round(wpmTah), d: Math.round(dog * 100), t: Date.now() }); L.toast("Yeni en iyi: %90 üstü doğrulukla " + fmtNum(wpmTah) + " wpm"); }
      enIyiYaz();
      void sure;
    }
    function enIyiYaz() { const en = store.get("gonderme.enIyi", null); enIyiEl.textContent = en ? `En iyi: ${en.w} wpm, %${en.d} doğruluk` : "Henüz kayıt yok"; }
    function sifirla() { bitti = false; baslaT = null; an.sifirla(); serit.temizle(); cozulen.textContent = ""; sonuc.innerHTML = ""; hedefCiz(null); }
    function yeniHedef() { hedef = hedefUret(tur); sifirla(); }
    hedefCiz(null); enIyiYaz();
    const KEY = { KeyZ: ".", Period: ".", KeyX: "-", Slash: "-" };
    return {
      enter() { an.mod = store.get("iambik.mod", "B"); an.wpm = tip === "iambik" ? store.get("iambik.wpm", 16) : L.prefs.wpm; serit.baslat(); oto(); },
      leave() { an.kapat(); clearInterval(otoId); serit.durdur(); tusDuz.classList.remove("basili"); kN.classList.remove("basili"); kC.classList.remove("basili"); },
      tus(e, basili) {
        if (tip === "duz") {
          if (e.code !== "Space" && e.key !== " ") return false;
          if (e.repeat) return true;
          if (bitti && basili) yeniHedef();
          Snd.unlock(); tusDuz.classList.toggle("basili", basili); basili ? an.bas() : an.birak();
          return true;
        }
        const k = KEY[e.code];
        if (!k) return false;
        if (e.repeat) return true;
        if (bitti && basili) yeniHedef();
        Snd.unlock(); (k === "." ? kN : kC).classList.toggle("basili", basili); an.kol(k, basili);
        return true;
      },
    };
  };
})();
