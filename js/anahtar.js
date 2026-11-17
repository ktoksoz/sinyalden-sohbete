/* Anahtarlama: düz anahtar ve iambik (çift kollu) anahtar.
   Anahtar({tip, mod, wpm, serit, onHarf, onIsaret})
     tip "duz":    .bas() / .birak()  — sinyal basılı kaldığı sürece açıktır; zamanlamayı siz yaparsınız
     tip "iambik": .kol(".", basili) / .kol("-", basili) — elektronik anahtar noktaları ve çizgileri kusursuz
                   zamanlamayla üretir; iki kol birlikte sıkılırsa nokta-çizgi sırayla gelir (iambik).
                   Mod A: kollar bırakılınca hemen durur. Mod B: sıkma sırasında bırakılırsa bir öğe daha ekler.
   Basılan işaretler yan tonla duyulur, şeride basılır ve Mors.Cozucu ile canlı çözülür.
   .kayit: [{a, b}] işaretlerin zamanları (sn, performance saati) — zamanlama çözümlemesi için */
(function () {
  window.Anahtar = function (opts = {}) {
    const o = Object.assign({ tip: "duz", mod: "B", wpm: L.prefs.wpm }, opts);
    const saat = () => performance.now() / 1000;
    let ton = null;
    let cozucu = yeniCozucu();
    let acikT = null, kapaliT = saat(), kayit = [];
    let sessizId = 0, kapali = false;

    function yeniCozucu() {
      return Mors.Cozucu({ wpm: o.wpm, onHarf: (h) => o.onHarf && o.onHarf(h, cozucu) });
    }
    function tonu() { if (!ton) ton = Snd.yanTon(); return ton; }
    // serit Snd saatine göre çizer; anahtar performance saatiyle ölçer: farkı her seferinde hesapla
    const seritT = () => Snd.now();

    function sinyalAc() {
      if (acikT != null) return;
      const t = saat();
      clearTimeout(sessizId);
      if (kapaliT != null) cozucu.bosluk(t - kapaliT);
      acikT = t;
      tonu().ac();
      o.serit && o.serit.ac(seritT());
      o.onIsaret && o.onIsaret(true);
    }
    function sinyalKapa() {
      if (acikT == null) return;
      const t = saat();
      const d = t - acikT;
      kayit.push({ a: acikT, b: t });
      if (kayit.length > 400) kayit.shift();
      acikT = null; kapaliT = t;
      tonu().kapa();
      o.serit && o.serit.kapa(seritT());
      cozucu.isaret(d);
      o.onIsaret && o.onIsaret(false, d);
      sessizBekle();
    }
    // boşluk uzayınca bekleyen harfi bitir (harf ve kelime sonu)
    function sessizBekle() {
      clearTimeout(sessizId);
      const kontrol = () => {
        if (acikT != null || kapali) return;
        const d = saat() - kapaliT;
        cozucu.sessizlik(d);
        if (d < 8 * cozucu.nokta + 0.2) sessizId = setTimeout(kontrol, 30);
      };
      sessizId = setTimeout(kontrol, 30);
    }

    /* --- iambik anahtar --- */
    const kol = { ".": false, "-": false };
    const hafiza = { ".": false, "-": false };
    let gonderiyor = null, sonOge = null, zamanlayici = 0, sikildi = false;
    const birim = () => 1.2 / o.wpm;
    function sonraki() {
      let oge = null;
      const ters = sonOge === "." ? "-" : ".";
      const istek = (e) => kol[e] || (o.mod === "B" ? hafiza[e] : false);
      if (sonOge && istek(ters)) oge = ters;
      else if (sonOge && istek(sonOge)) oge = sonOge;
      else if (istek(".")) oge = ".";
      else if (istek("-")) oge = "-";
      hafiza["."] = hafiza["-"] = false;
      if (!oge) { gonderiyor = null; sonOge = null; return; }
      gonderiyor = oge; sonOge = oge;
      sikildi = kol["."] && kol["-"];
      sinyalAc();
      const d = (oge === "." ? 1 : 3) * birim();
      zamanlayici = setTimeout(() => {
        sinyalKapa();
        // Mod B: öğe sırasında iki kol da sıkılmışsa, bırakılmış olsalar bile karşı öğe bir kez daha gelir
        if (o.mod === "B" && sikildi && !kol["."] && !kol["-"]) hafiza[oge === "." ? "-" : "."] = true;
        zamanlayici = setTimeout(sonraki, birim() * 1000);
      }, d * 1000);
    }
    function kolBas(e, basili) {
      if (o.tip !== "iambik") return;
      kol[e] = basili;
      if (basili) {
        if (gonderiyor) { if (e !== gonderiyor) hafiza[e] = true; if (kol["."] && kol["-"]) sikildi = true; }
        else if (!zamanlayici || gonderiyor === null) { clearTimeout(zamanlayici); zamanlayici = 0; sonraki(); }
      }
    }

    const api = {
      bas() { if (o.tip === "duz") sinyalAc(); },
      birak() { if (o.tip === "duz") sinyalKapa(); },
      kol: kolBas,
      sifirla() {
        clearTimeout(sessizId); clearTimeout(zamanlayici); zamanlayici = 0;
        if (acikT != null) sinyalKapa();
        kol["."] = kol["-"] = false; hafiza["."] = hafiza["-"] = false; gonderiyor = null; sonOge = null;
        cozucu = yeniCozucu(); kayit = []; kapaliT = null;
      },
      kapat() { kapali = true; api.sifirla(); if (ton) { ton.kapat(); ton = null; } kapali = false; },
      set wpm(v) { o.wpm = v; }, get wpm() { return o.wpm; },
      set mod(v) { o.mod = v; }, set tip(v) { api.sifirla(); o.tip = v; },
      get cozucu() { return cozucu; },
      get kayit() { return kayit; },
      get metin() { return cozucu.metin + (cozucu.kod ? "…" : ""); },
    };
    return api;
  };

  /* Zamanlama çözümlemesi: kayıttaki işaretleri nokta ve çizgiye ayırıp oranları hesaplar.
     Dönüş {nokta, cizgi, oran, icBosluk, wpm, sayi} (sn) ya da yetersiz veri için null */
  window.Anahtar.cozumle = function (kayit, noktaTahmini) {
    if (kayit.length < 3) return null;
    const sureler = kayit.map((k) => k.b - k.a);
    const esik = 2 * (noktaTahmini || Math.min(...sureler));
    const n = sureler.filter((d) => d < esik), c = sureler.filter((d) => d >= esik);
    const ort = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const ic = [];
    for (let i = 1; i < kayit.length; i++) { const g = kayit[i].a - kayit[i - 1].b; if (g < esik) ic.push(g); }
    const nokta = n.length ? ort(n) : null, cizgi = c.length ? ort(c) : null;
    return { nokta, cizgi, oran: nokta && cizgi ? cizgi / nokta : null, icBosluk: ic.length ? ort(ic) : null, wpm: nokta ? 1.2 / nokta : null, sayi: sureler.length,
      sapma: nokta && n.length > 1 ? Math.sqrt(ort(n.map((d) => (d - nokta) ** 2))) / nokta : null };
  };
})();
