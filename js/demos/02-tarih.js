/* 2. Telgrafın tarihi: deneyler
   - telgraftanOnce: atlı ulak / optik telgraf / elektrikli telgraf süre karşılaştırması (kaba model), logaritmik yarış
   - morseVail:      Amerikan morsu ile uluslararası mors aynı ölçekte iki statik şeritte
   - uluslararasi:   1848'den sonra değişen harfler ızgarası; dokununca iki biçim art arda çalar
   - osmanli:        telgrafname: kelime sayısı, "telgraf üslubu", şeritten gönderme
   - sos:            <SOS> usul işareti, harf harf S O S ve CQD aynı ölçekte */
(function () {
  const { h, fmtNum, kodSvg, kodYaz } = L;

  /* ---------- Amerikan morsu (morsecode.world yorumu) ----------
     Öğeler: . nokta (1), - çizgi (2), L uzun çizgi (4), 0 çok uzun çizgi (5), boşluk = harf içi uzun boşluk (1,5) */
  const AM = {
    A: ".-", B: "-...", C: ".. .", D: "-..", E: ".", F: ".-.", G: "--.", H: "....", I: "..", J: "-.-.", K: "-.-", L: "L", M: "--",
    N: "-.", O: ". .", P: ".....", Q: "..-.", R: ". ..", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: ".-..", Y: ".. ..", Z: "... .",
    "1": ".--.", "2": "..-..", "3": "...-.", "4": "....-", "5": "---", "6": "......", "7": "--..", "8": "-....", "9": "-..-", "0": "0", "&": ". ...",
  };
  const AM_SURE = { ".": 1, "-": 2, L: 4, "0": 5 };
  function amCizelge(metin, wpm) {
    const u = 1.2 / wpm;
    const isaretler = [], harfler = [];
    let t = 0, ilk = true, kelimeBasi = true;
    for (const c of Mors.buyuk(metin)) {
      if (/\s/.test(c)) { kelimeBasi = true; continue; }
      const kod = AM[c];
      if (!kod) continue;
      if (!ilk) t += (kelimeBasi ? 3 : 2) * u;
      const bas = t, hi = harfler.length;
      let onceki = null;
      for (const e of kod) {
        if (e === " ") { t += 1.5 * u; onceki = null; continue; }
        if (onceki) t += u;
        const d = AM_SURE[e] * u;
        isaretler.push({ t, d, tip: e === "." ? "." : "-", hi });
        t += d; onceki = e;
      }
      harfler.push({ t: bas, son: t, harf: c, kod, kelimeBasi });
      ilk = false; kelimeBasi = false;
    }
    return { isaretler, harfler, sure: t, z: { birim: u } };
  }
  // Amerikan kodunu ekranda göster: uzun çizgiler ve iç boşluk
  const amYaz = (kod) => kod.replace(/\./g, "·").replace(/-/g, "−").replace("L", "━━").replace("0", "━━━").replace(" ", "  ");
  function amSvg(kod, birim = 6, yuk = 6) {
    let x = 0, onceki = null; const p = [];
    for (const e of kod) {
      if (e === " ") { x += 1.5 * birim; onceki = null; continue; }
      if (onceki) x += birim;
      const w = AM_SURE[e] * birim;
      p.push(`<rect x="${x}" y="0" width="${w}" height="${yuk}" rx="${yuk / 2}" fill="currentColor"/>`);
      x += w; onceki = e;
    }
    return `<svg class="kod-svg" viewBox="0 0 ${x} ${yuk}" width="${x}" height="${yuk}" role="img" aria-label="${amYaz(kod)}">${p.join("")}</svg>`;
  }
  // Çizelgeyi verilen süreye uzat: birden çok statik şerit aynı ölçekte çizilsin
  const uzat = (cz, sure) => Object.assign({}, cz, { sure: Math.max(cz.sure, sure) });
  function statikCal(serit, cz, o) {
    const hnd = Snd.calCizelge(cz, o);
    const bitir = Serit.izle(serit, hnd);
    return { hnd, stop() { hnd.stop(); bitir(); } };
  }

  /* ================= Telgraftan önce ================= */
  window.Demos.telgraftanOnce = (stage) => {
    let km = 200, kelime = 20;
    const slKm = L.slider({ label: "Mesafe", min: 50, max: 1500, step: 10, value: km, fmt: (v) => fmtNum(v) + " km", oninput: (v) => { km = v; hesapla(); } });
    const slK = L.slider({ label: "Mesaj", min: 5, max: 60, value: kelime, fmt: (v) => v + " kelime", oninput: (v) => { kelime = v; hesapla(); } });
    const yarisBtn = L.ibtn("play", "Yarıştır", () => (raf ? dur() : yaris()), "primary");
    const saat = h("div.olcum.yaris-saat", h("b", "0 sn"), h("small", "geçen süre"));
    const satirlar = h("div.yaris");
    const varsayim = h("p.kaynak.yaris-not");
    stage.append(h("div.controls", slKm, slK), h("div.controls", yarisBtn, saat), h("div.sheet.yaris-sheet", satirlar), varsayim);
    const YOL = [
      { ad: "Atlı ulak", alt: "menzillerde at değiştirerek", sure: () => (km / 15) * 3600 },
      { ad: "Optik telgraf", alt: "kuleden kuleye, yalnız gündüz", sure: () => Math.ceil(km / 12) * 20 + kelime * 2 * 20 },
      { ad: "Elektrikli telgraf", alt: "elle 15 wpm, 400 km'de bir aktarma", sure: () => { const akt = Math.ceil(km / 400); return akt * (kelime * 60 / 15) + (akt - 1) * 60; } },
    ];
    const els = YOL.map((y) => {
      const cubuk = h("i"), deger = h("span.yaris-sure"), durum = h("span.yaris-durum");
      const el = h("div.yaris-satir", h("div.yaris-ad", h("b", y.ad), h("small", y.alt)), h("div.yaris-cubuk", cubuk), deger, durum);
      satirlar.append(el);
      return { el, cubuk, deger, durum };
    });
    const sureYaz = (s) => (s < 60 ? fmtNum(s, 0) + " sn" : s < 3600 ? fmtNum(s / 60, s < 600 ? 1 : 0) + " dk" : s < 86400 ? fmtNum(s / 3600, 1) + " sa" : fmtNum(s / 86400, 1) + " gün");
    // logaritmik ölçek: 10 sn … 10 gün
    const LO = Math.log(10), HI = Math.log(10 * 86400);
    const oran = (s) => L.clamp((Math.log(Math.max(s, 10)) - LO) / (HI - LO), 0, 1);
    let sureler = [];
    function hesapla() {
      dur();
      sureler = YOL.map((y) => y.sure());
      els.forEach((e, i) => { e.cubuk.style.width = oran(sureler[i]) * 100 + "%"; e.deger.textContent = sureYaz(sureler[i]); e.durum.textContent = ""; e.el.classList.remove("vardi"); });
      saat.querySelector("b").textContent = "—";
      const hiz = sureler[0] / sureler[2];
      varsayim.textContent = `Ölçek logaritmik: her çizgi on kat. Bu mesafede elektrikli telgraf atlı ulaktan yaklaşık ${fmtNum(hiz, 0)} kat hızlı.`;
    }
    let raf = 0;
    function yaris() {
      dur();
      const T = 7, bas = performance.now();
      const enCok = Math.max(...sureler);
      yarisBtn.setIcon("stop"); yarisBtn.setLabel("Durdur");
      els.forEach((e) => { e.cubuk.style.width = "0%"; e.el.classList.remove("vardi"); e.durum.textContent = ""; });
      const adim = () => {
        const f = Math.min(1, (performance.now() - bas) / 1000 / T);
        // benzetim saati de logaritmik ilerler: 1 sn'den en uzun süreye
        const sim = Math.exp(Math.log(1) + f * Math.log(enCok * 1.05));
        saat.querySelector("b").textContent = sureYaz(sim);
        els.forEach((e, i) => {
          e.cubuk.style.width = oran(Math.min(sim, sureler[i])) * 100 + "%";
          if (sim >= sureler[i] && !e.el.classList.contains("vardi")) { e.el.classList.add("vardi"); e.durum.textContent = "vardı"; Snd.cal("R", { wpm: 25, fwpm: null }); }
        });
        if (f < 1) raf = requestAnimationFrame(adim); else { raf = 0; yarisBtn.setIcon("play"); yarisBtn.setLabel("Yarıştır"); }
      };
      raf = requestAnimationFrame(adim);
    }
    function dur() { cancelAnimationFrame(raf); raf = 0; yarisBtn.setIcon("play"); yarisBtn.setLabel("Yarıştır"); }
    hesapla();
    return { leave() { dur(); hesapla(); }, toggle() { raf ? dur() : yaris(); } };
  };

  /* ================= Morse ve Vail: iki kod ================= */
  window.Demos.morseVail = (stage) => {
    const kutu = h("input.satir-giris", { type: "text", value: "What hath God wrought", maxlength: 30, spellcheck: "false", autocomplete: "off", "aria-label": "Karşılaştırılacak metin" });
    const s1 = h("div.sheet.iki-serit"), s2 = h("div.sheet.iki-serit");
    const b1 = L.ibtn("play", "Amerikan", () => calistir(0)), b2 = L.ibtn("play", "Uluslararası", () => calistir(1));
    const ozet = h("div.skor");
    stage.append(h("div.controls", kutu),
      h("div.serit-baslik", h("b", "1844: Amerikan morsu"), b1), s1,
      h("div.serit-baslik", h("b", "Bugün: uluslararası mors"), b2), s2, ozet);
    const ser = [Serit(s1, { kip: "statik" }), Serit(s2, { kip: "statik" })];
    let czler = [], cal = null;
    function kur() {
      dur();
      const wpm = Math.min(L.prefs.wpm, 15);
      // yalnızca iki kodda da bulunan karakterler
      const metin = [...Mors.buyuk(kutu.value)].filter((c) => /\s/.test(c) || (AM[c] && Mors.ITU[c])).join("");
      const a = amCizelge(metin, wpm), b = Mors.cizelge(metin, { wpm });
      const m = Math.max(a.sure, b.sure);
      czler = [uzat(a, m), uzat(b, m)];
      ser.forEach((s, i) => { s.temizle(); if (czler[i].isaretler.length) s.cizelge(czler[i], 0); });
      const olc = (v, t) => h("div.olcum", h("b", v), h("small", t));
      ozet.replaceChildren(olc(fmtNum(a.sure / (1.2 / wpm), 0), "birim, Amerikan"), olc(fmtNum(b.sure / (1.2 / wpm), 0), "birim, uluslararası"),
        olc(fmtNum(wpm) + " wpm", "çalma hızı"));
    }
    function calistir(i) {
      dur();
      if (!czler[i] || !czler[i].isaretler.length) return;
      const wpm = Math.min(L.prefs.wpm, 15);
      cal = statikCal(ser[i], czler[i], { wpm, f: L.prefs.ton });
      (i ? b2 : b1).setIcon("stop");
      cal.hnd.bitti.then(() => { if (cal) dur(); });
    }
    function dur() { if (cal) { const c = cal; cal = null; c.stop(); } b1.setIcon("play"); b2.setIcon("play"); }
    kutu.addEventListener("input", kur);
    let sira = 0;
    kur();
    return { leave: dur, toggle() { if (cal) dur(); else { calistir(sira); sira = 1 - sira; } } };
  };

  /* ================= Uluslararası: değişen harfler ================= */
  window.Demos.uluslararasi = (stage) => {
    let filtre = "hepsi", cal = null;
    const liste = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"];
    const ayni = (c) => AM[c] === Mors.ITU[c];
    const degisen = liste.filter((c) => !ayni(c));
    const sayi = h("div.skor",
      h("div.olcum.tiz", h("b", String(degisen.length)), h("small", "karakter değişti")),
      h("div.olcum", h("b", String(liste.length - degisen.length)), h("small", "biçimi aynı kaldı (çizgi yine uzadı)")));
    const sekme = L.seg([["hepsi", "Hepsi"], ["degisen", "Yalnız değişenler"]], filtre, (k) => { filtre = k; ciz(); }, "Filtre");
    const secili = h("div.ul-secili");
    const izgara = h("div.harf-izgara.ul-izgara");
    stage.append(h("div.controls", sekme), sayi, secili, h("div.scroll.ul-kaydir", izgara));
    function ciz() {
      izgara.replaceChildren(...liste.filter((c) => filtre === "hepsi" || !ayni(c)).map((c) => {
        const b = h("button.harf-hucre.ul-hucre" + (ayni(c) ? "" : ".degisti"), { type: "button", onclick: () => sec(c), "aria-label": `${c}: Amerikan ${amYaz(AM[c])}, uluslararası ${kodYaz(Mors.ITU[c])}` },
          h("b", c),
          h("span.ul-am", { html: amSvg(AM[c], 3, 4) }),
          h("span.ul-itu", { html: kodSvg(Mors.ITU[c], { birim: 3, yuk: 4 }) }));
        return b;
      }));
    }
    function sec(c) {
      izgara.querySelectorAll(".harf-hucre").forEach((b) => b.classList.toggle("on", b.querySelector("b").textContent === c));
      secili.replaceChildren(h("b.ul-harf", c),
        h("div.ul-satirlar",
          h("div", h("small", "Amerikan"), h("span.kod", amYaz(AM[c]))),
          h("div", h("small", "Uluslararası"), h("span.kod", kodYaz(Mors.ITU[c])))));
      cal && cal.stop();
      const wpm = Math.min(L.prefs.wpm, 15), u = 1.2 / wpm;
      // önce Amerikan, kısa bir ara, sonra uluslararası: tek çizelgede
      const a = amCizelge(c, wpm), b = Mors.cizelge(c, { wpm });
      const ara = a.sure + 6 * u;
      const birlesik = { isaretler: a.isaretler.concat(b.isaretler.map((m) => Object.assign({}, m, { t: m.t + ara }))), harfler: [], sure: ara + b.sure };
      cal = Snd.calCizelge(birlesik, { f: L.prefs.ton });
    }
    ciz();
    sec("C");
    return { leave() { cal && cal.stop(); }, toggle() { sec(L.sec(degisen)); } };
  };

  /* ================= Osmanlı: telgrafname ================= */
  const ATILACAK = new Set(["ve", "ile", "bir", "çok", "lütfen", "için", "de", "da", "ki", "acaba", "şimdi", "hemen", "artık", "gerçekten", "sevgili", "canım", "bütün", "size", "sana", "bunu", "şunu", "olarak", "kadar", "daha", "en", "gibi", "hem", "ama", "fakat", "çünkü", "eğer", "işte", "yani", "biraz", "tabii", "elbette", "rica", "ederim", "ediyorum", "sizlere", "bize"]);
  window.Demos.osmanli = (stage) => {
    const ORNEK = "Sevgili annemciğim, yarın akşam trenle Edirne'den geliyorum. Lütfen istasyona gelip beni karşılayın, çünkü çok fazla eşyam var. Hepinize çok selamlar, Ahmet.";
    const alan = h("textarea.telgraf-metin", { rows: 4, spellcheck: "false", "aria-label": "Telgraf metni" });
    alan.value = ORNEK;
    const sayac = h("div.skor");
    const kisaltBtn = L.btn("Telgraf üslubuna çevir", () => { alan.value = kisalt(alan.value); guncelle(); });
    const geriBtn = L.btn("Örneğe dön", () => { alan.value = ORNEK; guncelle(); }, "ghost");
    const form = h("div.sheet.telgrafname",
      h("div.tn-ust", h("b", "TELGRAFNAME"), h("small", "Kelime başına ücretlidir")),
      alan, sayac, h("div.controls", kisaltBtn, geriBtn));
    stage.append(form);
    const calar = Serit.Calar(stage, { duzenle: false, saniye: L.narrow() ? 4 : 6 });
    let ilkSayi = null;
    function kelimeler(m) { return m.split(/\s+/).map((k) => k.replace(/[.,;:!?"'’()]/g, "")).filter(Boolean); }
    function kisalt(m) {
      return kelimeler(m).filter((k) => !ATILACAK.has(k.toLocaleLowerCase("tr"))).map((k) => k.replace(/['’].*$/, "")).join(" ");
    }
    function guncelle() {
      const k = kelimeler(alan.value);
      if (ilkSayi == null) ilkSayi = k.length;
      const cz = Mors.cizelge(alan.value, L.hiz());
      const olc = (b, s, cls = "") => h("div.olcum" + cls, h("b", b), h("small", s));
      sayac.replaceChildren(olc(String(k.length), "kelime"),
        olc(fmtNum(cz.sure, 0) + " sn", `göndermesi (${L.prefs.wpm}/${Math.min(L.prefs.fwpm, L.prefs.wpm)} wpm)`),
        olc(k.length < ilkSayi ? "%" + fmtNum((1 - k.length / ilkSayi) * 100, 0) : "—", "ücretten tasarruf", ".tam"));
      calar.kutu.value = alan.value;
    }
    alan.addEventListener("input", guncelle);
    guncelle();
    return { leave() { calar.leave(); }, toggle() { calar.toggle(); } };
  };

  /* ================= SOS ================= */
  window.Demos.sos = (stage) => {
    const SATIR = [
      { metin: "<SOS>", ad: "SOS, tek işaret", alt: "harf boşluğu yok: bugünkü tehlike işareti" },
      { metin: "S O S", ad: "S O S, üç harf", alt: "harfler arasında 3 birim" },
      { metin: "CQD", ad: "CQD", alt: "1904–1908 arası Marconi telsizcilerinin çağrısı" },
    ];
    const wpm = Math.min(L.prefs.wpm, 18);
    const czler = SATIR.map((s) => {
      // "S O S" harf harf: kelime boşluğu değil, harf boşluğu istiyoruz
      const hs = s.metin === "S O S" ? Mors.harfler("SOS") : Mors.harfler(s.metin);
      const cz = Mors.cizelge(hs, { wpm });
      cz.harfler.forEach((x) => (x.harf = x.harf.replace(/[<>]/g, "")));
      return cz;
    });
    const enUzun = Math.max(...czler.map((c) => c.sure));
    let cal = null, aktif = -1;
    const seritler = [], btnler = [];
    SATIR.forEach((s, i) => {
      const b = L.ibtn("play", "Çal", () => (aktif === i ? dur() : calistir(i)));
      const kap = h("div.sheet.iki-serit");
      stage.append(h("div.serit-baslik", h("div", h("b", s.ad), h("small", s.alt)), b), kap);
      const ser = Serit(kap, { kip: "statik", birimIzgara: true });
      ser.cizelge(uzat(czler[i], enUzun), 0);
      seritler.push(ser); btnler.push(b);
    });
    stage.append(h("p.kaynak", `Üç şerit aynı ölçekte (${wpm} wpm). İnce çizgiler birimleri gösterir.`));
    function calistir(i) {
      dur();
      aktif = i;
      cal = statikCal(seritler[i], uzat(czler[i], czler[i].sure), { wpm, f: L.prefs.ton });
      btnler[i].setIcon("stop"); btnler[i].setLabel("Durdur");
      cal.hnd.bitti.then(() => { if (aktif === i) dur(); });
    }
    function dur() { if (cal) { const c = cal; cal = null; c.stop(); } aktif = -1; btnler.forEach((b) => { b.setIcon("play"); b.setLabel("Çal"); }); }
    return { leave: dur, toggle() { aktif >= 0 ? dur() : calistir(0); } };
  };
})();
