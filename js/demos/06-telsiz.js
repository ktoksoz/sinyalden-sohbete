/* 6. Telsizde mors: deneyler
   - amatorTelsiz: kısa dalga bantları (IARU 1. Bölge CW bölümleri, yaklaşık), seçilen bantta CQ yapan bir istasyon,
                   hışırtı ve alıcı ayarı (BFO): ayar kaydıkça ton değişir, süzgeçten çıkınca sinyal kaybolur
   - qKodlari:     Q kodları, kısaltmalar ve usul işaretleri kartları (dinle + anlam)
   - rst:          güç, gürültü ve ton kalitesiyle sinyal kur; rapor hesapla ya da "rapor ver" sınavı
   - qso:          satır satır örnek görüşme; iki istasyon iki tonda, çalan harf yanar
   - cozucu:       mikrofondan mors çözücü (Goertzel + uyarlanan çözücü); mikrofonsuz deneme */
(function () {
  const { h, C, fmtNum, store, seg, slider, btn, ibtn, rgba } = L;

  /* Ayarlanabilir sinyal çalar: osilatör frekansı ve düzeyi çalarken değiştirilebilir; uğultu (hum) ve cıvıltı (chirp).
     Dönüş {t0, sure, cz, saat(), bitti, stop(), frekans(f), duzey(g)} */
  function calSinyal(cz, o = {}) {
    const ctx = Snd.ctx; if (!ctx) return null;
    Snd.unlock();
    const t0 = ctx.currentTime + (o.gecikme != null ? o.gecikme : 0.1);
    const osc = ctx.createOscillator(); osc.frequency.value = o.f || 600;
    const env = ctx.createGain(); env.gain.value = 0;
    const hum = ctx.createGain();
    const duz = ctx.createGain(); duz.gain.value = o.gain != null ? o.gain : 0.4;
    osc.connect(env); env.connect(hum); hum.connect(duz); duz.connect(o.cikis || Snd.master);
    let lfo = null;
    const derin = o.hum || 0;
    if (derin > 0) {
      hum.gain.value = 1 - derin / 2;
      lfo = ctx.createOscillator(); lfo.frequency.value = 100;
      const lg = ctx.createGain(); lg.gain.value = derin / 2;
      lfo.connect(lg); lg.connect(hum.gain); lfo.start(t0); lfo.stop(t0 + cz.sure + 0.2);
    }
    const f = o.f || 600;
    cz.isaretler.forEach((m) => {
      const a = t0 + m.t, b = a + m.d, r = Math.min(0.005, m.d / 2);
      env.gain.setValueAtTime(0, a); env.gain.linearRampToValueAtTime(1, a + r);
      env.gain.setValueAtTime(1, b - r); env.gain.linearRampToValueAtTime(0, b);
      if (o.chirp) { osc.frequency.setValueAtTime(f - o.chirp, a); osc.frequency.setTargetAtTime(f, a, 0.012); }
    });
    osc.start(t0); osc.stop(t0 + cz.sure + 0.1);
    let coz; const bitti = new Promise((r) => (coz = r));
    const hnd = { t0, sure: cz.sure, cz, durdu: false, bitti, saat: () => ctx.currentTime - t0,
      stop() { if (hnd.durdu) return; hnd.durdu = true; try { duz.gain.setTargetAtTime(0, ctx.currentTime, 0.01); osc.stop(ctx.currentTime + 0.05); lfo && lfo.stop(ctx.currentTime + 0.05); } catch (e) {} coz(false); },
      frekans(v) { if (!o.chirp) osc.frequency.setTargetAtTime(v, ctx.currentTime, 0.02); },
      duzey(v) { duz.gain.setTargetAtTime(v, ctx.currentTime, 0.03); } };
    osc.onended = () => { if (!hnd.durdu) { hnd.durdu = true; coz(true); } };
    return hnd;
  }
  // Alıcı sesi: dar bant süzgecinden geçen hışırtı + sinyal
  function alici(merkez = 650, q = 2.2) {
    const ctx = Snd.ctx; if (!ctx) return null;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = merkez; bp.Q.value = q;
    const kaz = ctx.createGain(); kaz.gain.value = 2.2; // süzgeç gücü düşürür: dengele
    bp.connect(kaz); kaz.connect(Snd.master);
    return { giris: bp, kapat() { try { kaz.gain.setTargetAtTime(0, ctx.currentTime, 0.02); setTimeout(() => { bp.disconnect(); kaz.disconnect(); }, 300); } catch (e) {} } };
  }
  const HARF = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const ONEK = ["TA1", "TA2", "TA3", "TB2", "TC3", "DL1", "G4", "F5", "OH2", "JA1", "K1", "W6", "VE3", "I2", "EA4", "SP9", "OK1", "YO3", "4X1", "LZ2"];
  const cagri = () => L.sec(ONEK) + Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => L.sec([...HARF])).join("");

  /* ================= Amatör telsiz: bantlar ================= */
  // IARU 1. Bölge bant planına göre CW bölümleri (kHz; yaklaşık) ve QRP buluşma frekansları
  const BANTLAR = [
    { ad: "160 m", a: 1810, b: 1838, band: [1810, 2000], qrp: 1836, hisirti: 0.22 },
    { ad: "80 m", a: 3500, b: 3570, band: [3500, 3800], qrp: 3560, hisirti: 0.19 },
    { ad: "40 m", a: 7000, b: 7040, band: [7000, 7200], qrp: 7030, hisirti: 0.15 },
    { ad: "30 m", a: 10100, b: 10130, band: [10100, 10150], qrp: 10116, hisirti: 0.12 },
    { ad: "20 m", a: 14000, b: 14070, band: [14000, 14350], qrp: 14060, hisirti: 0.1 },
    { ad: "17 m", a: 18068, b: 18095, band: [18068, 18168], qrp: 18086, hisirti: 0.09 },
    { ad: "15 m", a: 21000, b: 21070, band: [21000, 21450], qrp: 21060, hisirti: 0.08 },
    { ad: "12 m", a: 24890, b: 24915, band: [24890, 24990], qrp: 24906, hisirti: 0.08 },
    { ad: "10 m", a: 28000, b: 28070, band: [28000, 29700], qrp: 28060, hisirti: 0.07 },
  ];
  window.Demos.amatorTelsiz = (stage) => {
    const sheet = h("div.sheet.tel-sheet");
    stage.append(sheet);
    let secili = store.get("telsiz.bant", 2), ayar = 0, aktif = false, hnd = null, gur = null, rx = null, dongu = 0, istasyon = null;
    const bantlar = h("div.bant-liste", { role: "group", "aria-label": "Bant seç" });
    const kadran = h("div.kadran", h("canvas", { "aria-hidden": "true" }));
    const bilgi = h("p.readout");
    const seritKap = h("div");
    const ayarSl = slider({ label: "Ayar", min: -1200, max: 1200, step: 10, value: 0, fmt: (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + fmtNum(Math.abs(v)) + " Hz", oninput: (v) => { ayar = v; uygula(); kadranCiz(); } });
    const calBtn = ibtn("play", "Dinle", () => (aktif ? durdur() : basla()), "primary");
    BANTLAR.forEach((b, i) => bantlar.append(h("button.bant-btn" + (i === secili ? ".on" : ""), { type: "button", onclick: () => sec(i) }, b.ad)));
    sheet.append(bantlar, kadran, bilgi, h("div.controls", calBtn, ayarSl), seritKap);
    const serit = Serit(seritKap, { saniye: 6 });
    serit.el.classList.add("kucuk");
    const st = L.canvas(kadran.querySelector("canvas"), () => kadranCiz());
    function sec(i) {
      secili = i; store.set("telsiz.bant", i);
      [...bantlar.children].forEach((b, k) => b.classList.toggle("on", k === i));
      istasyon = null;
      kadranCiz();
      if (aktif) { durdur(); basla(); }
    }
    function yeniIstasyon() {
      const b = BANTLAR[secili];
      const f = b.a + 5 + Math.random() * (b.b - b.a - 10);
      istasyon = { f: Math.round(f * 10) / 10, cagri: cagri(), wpm: 16 + Math.floor(Math.random() * 10) };
    }
    const ton = () => 650 + ayar; // alıcıda duyulan ton: istasyon ile alıcı ayarı arasındaki fark
    function seviye() { const off = Math.abs(ton() - 650); return 0.5 * Math.exp(-Math.pow(off / 420, 2)); }
    function uygula() { if (hnd && !hnd.durdu) { hnd.frekans(Math.max(60, ton())); hnd.duzey(seviye()); } bilgiYaz(); }
    function bilgiYaz() {
      const b = BANTLAR[secili];
      if (!istasyon) { bilgi.innerHTML = `<b>${b.ad}</b>: CW bölümü yaklaşık ${fmtNum(b.a)}–${fmtNum(b.b)} kHz, QRP ${fmtNum(b.qrp)} kHz.`; return; }
      const alF = istasyon.f - (ayar / 1000) + 0.65; // gösterim: alıcının taşıyıcı frekansı yerine istasyonun frekansı
      void alF;
      bilgi.innerHTML = `<b>${b.ad}</b> · istasyon ${fmtNum(istasyon.f, 1)} kHz · duyulan ton <b>${fmtNum(Math.max(0, ton()))} Hz</b>` + (seviye() < 0.05 ? " · süzgecin dışında" : "");
    }
    function basla() {
      Snd.unlock();
      aktif = true; calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      if (!istasyon) yeniIstasyon();
      rx = alici(650, 2.2);
      gur = Snd.gurultu(BANTLAR[secili].hisirti, rx && rx.giris);
      serit.baslat();
      tur();
    }
    function tur() {
      if (!aktif) return;
      const metin = `CQ CQ CQ DE ${istasyon.cagri} ${istasyon.cagri} K`;
      const cz = Mors.cizelge(metin, { wpm: istasyon.wpm });
      hnd = calSinyal(cz, { f: Math.max(60, ton()), gain: seviye(), cikis: rx && rx.giris });
      if (!hnd) return;
      serit.cizelge(cz, hnd.t0);
      bilgiYaz();
      hnd.bitti.then((tam) => { if (tam && aktif) dongu = setTimeout(tur, 1800); });
    }
    function durdur() {
      aktif = false; clearTimeout(dongu);
      hnd && hnd.stop(); hnd = null;
      gur && gur.kapat(); gur = null;
      rx && rx.kapat(); rx = null;
      calBtn.setIcon("play"); calBtn.setLabel("Dinle");
      setTimeout(() => { if (!aktif) serit.durdur(); }, 300);
    }
    function kadranCiz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const b = BANTLAR[secili];
      const [A, B] = b.band;
      const pad = 16, x = (f) => pad + ((f - A) / (B - A)) * (w - 2 * pad);
      // bant şeridi
      ctx.fillStyle = C.kagit; ctx.fillRect(pad, H * 0.3, w - 2 * pad, H * 0.34);
      ctx.fillStyle = rgba(C.pirinc, 0.35); ctx.fillRect(x(b.a), H * 0.3, Math.max(3, x(b.b) - x(b.a)), H * 0.34);
      L.text(ctx, "CW", x(b.a) + 4, H * 0.3 + 14, { size: 11, color: C.pirinc, weight: 700 });
      // ölçek
      ctx.fillStyle = C.ink2;
      const adim = (B - A) > 1000 ? 200 : (B - A) > 250 ? 50 : (B - A) > 120 ? 20 : 10;
      for (let f = Math.ceil(A / adim) * adim; f <= B; f += adim) {
        const xx = Math.round(x(f)) + 0.5;
        ctx.fillRect(xx, H * 0.64, 1, 6);
        L.text(ctx, fmtNum(f), xx, H * 0.64 + 18, { size: 10, color: C.muted, align: "center" });
      }
      L.text(ctx, b.ad + " bandı (kHz)", pad, H * 0.22, { size: 12, color: C.ink, weight: 700 });
      // QRP
      ctx.fillStyle = C.mavi; ctx.fillRect(Math.round(x(b.qrp)), H * 0.3, 1.5, H * 0.34);
      L.text(ctx, "QRP", x(b.qrp) + 3, H * 0.3 + H * 0.34 - 4, { size: 10, color: C.mavi, weight: 700 });
      // istasyon ve alıcı
      if (istasyon) {
        ctx.fillStyle = C.pirinc;
        ctx.beginPath(); ctx.arc(x(istasyon.f), H * 0.47, 5, 0, Math.PI * 2); ctx.fill();
        const rxF = istasyon.f - ayar / 1000;
        ctx.fillStyle = C.ink; ctx.fillRect(Math.round(x(rxF)) - 1, H * 0.24, 2, H * 0.46);
      }
    }
    bilgiYaz();
    window.addEventListener("themechange", kadranCiz);
    return {
      enter() { kadranCiz(); },
      leave() { durdur(); },
      toggle() { aktif ? durdur() : basla(); },
    };
  };

  /* ================= Q kodları ================= */
  const KARTLAR = {
    q: [
      ["QTH", "Konum", "QTH? Neredesiniz? · QTH ANKARA: Ankara'dayım."],
      ["QRS", "Yavaşlayın", "QRS? Yavaşlayayım mı? · PSE QRS: lütfen daha yavaş gönderin."],
      ["QRQ", "Hızlanın", "Daha hızlı gönderin."],
      ["QRM", "İnsan kaynaklı parazit", "Başka istasyonların ya da cihazların paraziti var."],
      ["QRN", "Doğal parazit", "Atmosferik parazit: şimşek, statik hışırtı."],
      ["QSB", "Sinyal dalgalanıyor", "Sinyaliniz güçlenip zayıflıyor (fading)."],
      ["QSL", "Alındı, onaylıyorum", "Mesajınızı aldım. QSL kartı: görüşmeyi onaylayan kartpostal."],
      ["QSY", "Frekans değiştirin", "QSY 7025: 7025 kHz'e geçelim."],
      ["QRZ", "Beni kim çağırıyor?", "Çağrıyı duydum ama çağrı işaretini alamadım."],
      ["QRP", "Düşük güç", "Gücümü azaltayım mı? Ayrıca 5 W ve altı düşük güçle çalışmanın adı."],
      ["QRT", "Yayını kesiyorum", "İstasyonu kapatıyorum."],
    ],
    k: [
      ["CQ", "Genel çağrı", "Herhangi bir istasyon cevap versin: CQ CQ DE TA0XYZ K."],
      ["DE", "-den", "TA0XYZ DE DL0ABC: TA0XYZ'ye, DL0ABC'den."],
      ["K", "Buyurun", "Gönderim bitti, cevap verebilirsiniz."],
      ["RST", "Sinyal raporu", "Okunabilirlik, güç, ton: UR RST 579."],
      ["5NN", "599", "Kısaltılmış rakamlarla 599: N = 9, T = 0."],
      ["TU", "Teşekkürler", "Kısa teşekkür; yarışmalarda çok kullanılır. Uzun hâli TNX."],
      ["73", "En iyi dileklerimle", "Vedalaşma. Tek başına yeter: \"73s\" demeye gerek yok."],
      ["GM", "Günaydın", "GA: iyi günler (good afternoon), GE: iyi akşamlar."],
      ["GE", "İyi akşamlar", "GM günaydın, GA iyi günler, GE iyi akşamlar."],
      ["OP", "Operatör", "OP AYSE: telsizi kullanan kişi Ayşe."],
      ["RIG", "Telsiz cihazı", "RIG 100W: cihazım 100 vat."],
      ["ANT", "Anten", "ANT DIPOLE: antenim dipol."],
      ["WX", "Hava durumu", "WX SUNNY 20C: güneşli, 20 derece."],
      ["PSE", "Lütfen", "PSE QRS: lütfen yavaşlayın."],
      ["FB", "Çok iyi", "İngilizce \"fine business\": harika, çok iyi."],
      ["R", "Alındı", "Söylediklerinizi eksiksiz aldım (roger)."],
      ["HW", "Nasıl alıyorsunuz?", "HW? Beni nasıl alıyorsunuz? (how copy?)"],
    ],
    u: [
      ["<AR>", "Mesaj sonu", "AR bitişik: mesajım bitti."],
      ["<SK>", "Görüşme sonu", "SK bitişik: görüşmeyi bitiriyorum."],
      ["<BT>", "Ayraç", "BT bitişik (= işaretiyle aynı): yeni konu, paragraf."],
      ["<KN>", "Yalnız siz", "KN bitişik: yalnızca çağırdığım istasyon cevap versin."],
      ["<AS>", "Bekleyin", "AS bitişik: biraz bekleyin."],
      ["K", "Buyurun", "Herkes cevap verebilir."],
    ],
  };
  window.Demos.qKodlari = (stage) => {
    const sheet = h("div.sheet.tel-sheet");
    stage.append(sheet);
    let tur = "q", calan = null;
    const izgara = h("div.qk-izgara");
    const detay = h("div.qk-detay", h("p.readout", "Bir karta dokunun."));
    const seritKap = h("div");
    const turSeg = seg([["q", "Q kodları"], ["k", "Kısaltmalar"], ["u", "Usul işaretleri"]], tur, (k) => { tur = k; kur(); }, "Tür");
    sheet.append(h("div.controls", turSeg), izgara, detay, seritKap);
    const serit = Serit(seritKap, { saniye: 4 });
    serit.el.classList.add("kucuk");
    function kur() {
      izgara.innerHTML = "";
      KARTLAR[tur].forEach(([kod, ad, acik]) => {
        const kodlar = Mors.harfler(kod).map((x) => x.kod).join(" ");
        const b = h("button.harf-hucre.qk", { type: "button", onclick: () => cal(b, kod, ad, acik) },
          h("b", kod.replace(/[<>]/g, "")), h("span", { html: Mors.harfler(kod).map((x) => L.kodSvg(x.kod, { birim: 3, yuk: 3 })).join(" ") }), h("small", ad));
        b.title = L.kodYaz(kodlar);
        izgara.append(b);
      });
    }
    function cal(b, kod, ad, acik) {
      [...izgara.children].forEach((x) => x.classList.toggle("on", x === b));
      detay.innerHTML = "";
      detay.append(h("p", h("b", kod.replace(/[<>]/g, "") + ": " + ad), " — ", acik), h("p.kod", L.kodYaz(Mors.harfler(kod).map((x) => x.kod).join("   "))));
      calan && calan.stop();
      calan = Snd.cal(kod, { fwpm: null });
      serit.cizelge(calan.cz, calan.t0); serit.baslat();
    }
    kur();
    return { leave() { calan && calan.stop(); serit.durdur(); } };
  };

  /* ================= RST ================= */
  function rHesap(sDb, nSev) { // sinyal/gürültü (dB) → okunabilirlik
    const snr = sDb - 20 * Math.log10(nSev / 0.1);
    return snr > 6 ? 5 : snr > 0 ? 4 : snr > -6 ? 3 : snr > -11 ? 2 : 1;
  }
  window.Demos.rst = (stage) => {
    const sheet = h("div.sheet.tel-sheet");
    stage.append(sheet);
    let S = 7, N = 0.1, T = 9, hnd = null, gur = null, rx = null, sinav = null;
    const sSl = slider({ label: "Güç (S)", min: 1, max: 9, value: S, fmt: (v) => "S" + v, oninput: (v) => { S = v; yaz(); } });
    const nSl = slider({ label: "Gürültü", min: 0, max: 10, value: 3, fmt: (v) => ["yok", "çok az", "az", "az", "orta", "orta", "çok", "çok", "yoğun", "yoğun", "fırtına"][v], oninput: (v) => { N = 0.03 + v * 0.045; yaz(); } });
    const tSl = slider({ label: "Ton (T)", min: 1, max: 9, value: T, fmt: (v) => "T" + v, oninput: (v) => { T = v; yaz(); } });
    N = 0.03 + 3 * 0.045;
    const rapor = h("div.rst-rapor");
    const aciklama = h("p.readout");
    const calBtn = ibtn("play", "Dinle", () => (hnd ? durdur() : cal(sinav || undefined)), "primary");
    const seritKap = h("div");
    const sinavKap = h("div.rst-sinav");
    sheet.append(h("div.rst-kurulum", sSl, nSl, tSl), h("div.controls", calBtn, btn("Rapor ver (sınav)", () => sinavBasla())), rapor, aciklama, sinavKap, seritKap);
    const serit = Serit(seritKap, { saniye: 5 });
    serit.el.classList.add("kucuk");
    const sDb = (s) => (s - 9) * 3; // deneyde S birimi 3 dB
    const kazanc = (s) => 0.45 * Math.pow(10, sDb(s) / 20);
    function yaz() {
      if (sinav) return;
      const R = rHesap(sDb(S) + 20, N);
      rapor.innerHTML = "";
      rapor.append(h("span", h("b", String(R)), h("small", "okunabilirlik")), h("span", h("b", String(S)), h("small", "güç")), h("span", h("b", String(T)), h("small", "ton")));
      aciklama.textContent = `Bu sinyale vereceğiniz rapor: ${R}${S}${T}. ` + (R >= 5 ? "Kusursuz okunuyor." : R === 4 ? "Neredeyse güçlük çekmeden okunuyor." : R === 3 ? "Güçlükle okunuyor." : R === 2 ? "Ancak arada bir kelime seçiliyor." : "Okunamıyor.") + (T <= 6 ? " Ton uğultulu ve cıvıltılı." : "");
    }
    function cal(ayar) {
      durdur();
      const a = ayar || { S, N, T };
      rx = alici(650, 1.6);
      gur = Snd.gurultu(a.N, rx && rx.giris);
      const cz = Mors.cizelge(`VVV DE ${cagri()} ${L.sec(["TEST", "CQ", "QRL?"])}`, { wpm: 18 });
      hnd = calSinyal(cz, { f: 650, gain: kazanc(a.S), cikis: rx && rx.giris, hum: a.T >= 9 ? 0 : Math.min(0.95, (9 - a.T) / 7), chirp: a.T <= 6 ? (7 - a.T) * 18 : 0 });
      if (!hnd) return;
      if (!sinav) serit.cizelge(cz, hnd.t0); else serit.cizelge({ isaretler: [], harfler: [] }, hnd.t0);
      serit.baslat();
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      hnd.bitti.then(() => setTimeout(() => { if (hnd && hnd.durdu) durdur(); }, 200));
    }
    function durdur() {
      hnd && hnd.stop(); hnd = null; gur && gur.kapat(); gur = null; rx && rx.kapat(); rx = null;
      calBtn.setIcon("play"); calBtn.setLabel("Dinle");
    }
    function sinavBasla() {
      const sS = 2 + Math.floor(Math.random() * 8), sN = 0.03 + Math.floor(Math.random() * 9) * 0.045, sT = L.sec([9, 9, 8, 7, 5, 3]);
      sinav = { S: sS, N: sN, T: sT, R: rHesap(sDb(sS) + 20, sN) };
      rapor.innerHTML = ""; aciklama.textContent = "Rastgele bir sinyal çalıyor. Dinleyin ve raporu seçin.";
      const sec = { R: 5, S: 5, T: 9 };
      const sR = seg([1, 2, 3, 4, 5].map((v) => [v, String(v)]), 5, (v) => (sec.R = v), "Okunabilirlik");
      const sSg = seg([1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => [v, String(v)]), 5, (v) => (sec.S = v), "Güç");
      const sTg = seg([1, 3, 5, 7, 8, 9].map((v) => [v, String(v)]), 9, (v) => (sec.T = v), "Ton");
      sinavKap.innerHTML = "";
      sinavKap.append(h("div.row", h("span.ctl-lab", "R"), sR), h("div.row", h("span.ctl-lab", "S"), sSg), h("div.row", h("span.ctl-lab", "T"), sTg),
        h("div.controls", btn("Yeniden dinle", () => cal(sinav), "sm"), btn("Raporumu gönder", () => {
          const d = sinav;
          const puan = (sec.R === d.R ? 1 : 0) + (Math.abs(sec.S - d.S) <= 1 ? 1 : 0) + (Math.abs(sec.T - d.T) <= 1 ? 1 : 0);
          aciklama.textContent = `Sizin raporunuz ${sec.R}${sec.S}${sec.T}, deneyin hesabı ${d.R}${d.S}${d.T}. ` + (puan === 3 ? "Çok iyi kulak!" : puan === 2 ? "Yakın; bir rakamda farklı." : "Bir daha dinleyin: önce okunabilirliğe karar verin, sonra güce.");
          sSl.set(d.S); S = d.S; tSl.set(d.T); T = d.T; N = d.N; nSl.set(Math.round((d.N - 0.03) / 0.045));
          sinav = null; sinavKap.innerHTML = ""; durdur();
          setTimeout(yaz, 0);
        }, "sm primary"), btn("Vazgeç", () => { sinav = null; sinavKap.innerHTML = ""; durdur(); yaz(); }, "sm ghost")));
      cal(sinav);
    }
    yaz();
    return { leave() { durdur(); serit.durdur(); }, toggle() { hnd ? durdur() : cal(sinav || undefined); } };
  };

  /* ================= QSO ================= */
  const QSO = [
    { kim: "A", metin: "CQ CQ CQ DE TA0XYZ TA0XYZ K", acik: "Ayşe genel çağrı yapıyor: \"Herkese, TA0XYZ'den. Buyurun.\"" },
    { kim: "B", metin: "TA0XYZ DE DL0ABC DL0ABC K", acik: "Hans cevap veriyor: önce karşı tarafın, sonra kendi çağrı işareti." },
    { kim: "A", metin: "DL0ABC DE TA0XYZ GM TNX FER CALL <BT> UR RST 579 579 <BT> NAME AYSE AYSE <BT> QTH IZMIR IZMIR <BT> HW? DL0ABC DE TA0XYZ <KN>", acik: "Günaydın, çağrınız için teşekkürler. Raporunuz 579. Adım Ayşe, İzmir'deyim. Nasıl alıyorsunuz? KN: yalnızca siz cevap verin." },
    { kim: "B", metin: "TA0XYZ DE DL0ABC R TNX AYSE <BT> UR RST 599 5NN <BT> NAME HANS HANS <BT> QTH BERLIN BERLIN <BT> RIG 100W ANT DIPOLE <BT> TA0XYZ DE DL0ABC <KN>", acik: "Hepsini aldım (R), teşekkürler Ayşe. Raporunuz 599. Adım Hans, Berlin'deyim. Cihazım 100 vat, antenim dipol." },
    { kim: "A", metin: "DL0ABC DE TA0XYZ R FB HANS <BT> WX SUNNY 20C <BT> TNX QSO 73 GL <SK> DL0ABC DE TA0XYZ", acik: "Aldım, harika Hans. Burada hava güneşli, 20 derece. Görüşme için teşekkürler, en iyi dileklerimle, iyi şanslar. SK: görüşmeyi bitiriyorum." },
    { kim: "B", metin: "TNX AYSE 73 <SK> TA0XYZ DE DL0ABC E E", acik: "Teşekkürler Ayşe, 73. Sondaki iki kısa dit (E E) telsizcilerin el sallamasıdır." },
  ];
  window.Demos.qso = (stage) => {
    const sheet = h("div.sheet.tel-sheet");
    stage.append(sheet);
    let hiz = store.get("qso.hiz", "ayar"), hnd = null, cal_ = -1, hepsi = false, izId = 0, sira = 0;
    const seritKap = h("div");
    const liste = h("div.qso-liste");
    const hepsiBtn = ibtn("play", "Hepsini çal", () => (hepsi ? durdur() : hepsiniCal()), "primary");
    const hizSeg = seg([["ayar", "Ayardaki hız"], ["gercek", "Gerçek hızda (22 wpm)"]], hiz, (k) => { hiz = k; store.set("qso.hiz", k); }, "Hız");
    sheet.append(h("div.controls", hepsiBtn, hizSeg), seritKap, liste);
    const serit = Serit(seritKap, { saniye: 6 });
    serit.el.classList.add("kucuk");
    const satirlar = QSO.map((s, i) => {
      const hs = Mors.harfler(s.metin);
      const metinEl = h("p.qso-metin");
      const spans = [];
      hs.forEach((x, k) => {
        if (k && x.kelimeBasi) metinEl.append(" ");
        const sp = h("span" + (x.usul ? ".usul" : ""), x.harf.replace(/[<>]/g, ""));
        spans.push(sp); metinEl.append(sp);
      });
      const dinle = ibtn("play", "Dinle", () => (cal_ === i && hnd ? durdur() : calSatir(i)), "sm");
      const el = h("div.qso-satir.qso-" + s.kim, h("div.qso-bas", h("b", s.kim === "A" ? "TA0XYZ · Ayşe" : "DL0ABC · Hans"), h("span.spacer"), dinle), metinEl,
        h("details.more", h("summary", "Ne diyor?"), h("p", s.acik)));
      liste.append(el);
      return { el, spans, dinle, hs };
    });
    function calSatir(i) {
      durdurSes();
      cal_ = i;
      const s = QSO[i], st = satirlar[i];
      const o = hiz === "gercek" ? { wpm: 22, fwpm: null } : {};
      hnd = Snd.cal(s.metin, Object.assign({ f: s.kim === "A" ? 600 : 720 }, o));
      serit.cizelge(hnd.cz, hnd.t0); serit.baslat();
      satirlar.forEach((x, k) => { x.el.classList.toggle("calan", k === i); x.dinle.setIcon(k === i ? "stop" : "play"); x.dinle.setLabel(k === i ? "Durdur" : "Dinle"); });
      if (!L.narrow()) st.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const h0 = hnd;
      const izle = () => {
        if (hnd !== h0) return;
        const t = h0.saat();
        let a = -1; h0.cz.harfler.forEach((x, k) => { if (t >= x.t - 0.01) a = k; });
        st.spans.forEach((sp, k) => { sp.classList.toggle("on", k === a && t <= h0.cz.harfler[k].son + 0.02); sp.classList.toggle("gecti", k < a); });
        if (!h0.durdu) izId = requestAnimationFrame(izle);
      };
      izId = requestAnimationFrame(izle);
      h0.bitti.then((tam) => {
        if (hnd !== h0) return;
        st.spans.forEach((sp) => { sp.classList.remove("on"); sp.classList.add("gecti"); });
        satirSifirla();
        if (tam && hepsi && i + 1 < QSO.length) sira = setTimeout(() => calSatir(i + 1), 1200);
        else if (hepsi) durdur();
      });
    }
    function satirSifirla() { satirlar.forEach((x) => { x.el.classList.remove("calan"); x.dinle.setIcon("play"); x.dinle.setLabel("Dinle"); }); }
    function durdurSes() { clearTimeout(sira); cancelAnimationFrame(izId); const x = hnd; hnd = null; x && x.stop(); cal_ = -1; satirSifirla(); }
    function hepsiniCal() { hepsi = true; hepsiBtn.setIcon("stop"); hepsiBtn.setLabel("Durdur"); satirlar.forEach((x) => x.spans.forEach((sp) => sp.classList.remove("gecti", "on"))); calSatir(0); }
    function durdur() { hepsi = false; durdurSes(); hepsiBtn.setIcon("play"); hepsiBtn.setLabel("Hepsini çal"); }
    return { leave() { durdur(); serit.durdur(); }, toggle() { hepsi ? durdur() : hepsiniCal(); } };
  };

  /* ================= Mikrofonla çözücü ================= */
  window.Demos.cozucu = (stage, slide) => {
    const sheet = h("div.sheet.tel-sheet");
    stage.append(sheet);
    let akis = null, kaynak = null, isleyici = null, sifir = null, ta = null, cz = null, durum = "kapali", sesId = 0, deneme = null;
    const micBtn = ibtn("mic", "Mikrofonu aç", () => (durum === "kapali" ? micAc() : kapat()), "primary");
    const denBtn = btn("Mikrofonsuz dene", () => (durum === "kapali" ? denemeAc() : null));
    const oto = { v: true };
    const tonSeg = seg([[true, "Tonu kendisi bulsun"], [false, "Ton: ayardaki"]], true, (k) => { oto.v = k; }, "Ton arama");
    const hata = h("p.note-msg.warn", { hidden: true });
    const seviye = h("div.cz-seviye", h("i"));
    const frek = h("span.readout", "Ton: –");
    const hizEl = h("span.readout", "Hız: –");
    const seritKap = h("div");
    const cozulen = h("div.cozulen", { "data-bos": "Çözülen metin burada belirecek", "aria-live": "polite" });
    sheet.append(h("div.controls", micBtn, denBtn, tonSeg), hata, h("div.controls.cz-olcum", h("span.ctl-lab", "Düzey"), seviye, frek, hizEl), seritKap, cozulen,
      h("div.controls", btn("Temizle", () => { cozulen.textContent = ""; serit.temizle(); if (cz) cz = yeniCozucu(); }, "sm ghost"), h("span.spacer"), h("span.gizlilik", "Ses bu cihazdan çıkmaz, kaydedilmez.")));
    const serit = Serit(seritKap, { saniye: 6 });
    function hataYaz(m) { hata.hidden = !m; hata.textContent = m || ""; }
    function yeniCozucu() { return Mors.Cozucu({ wpm: 18, onHarf: () => yaz() }); }
    function yaz() { cozulen.textContent = cz.metin; if (cz.kod) cozulen.append(h("span.bekleyen", L.kodYaz(cz.kod))); }
    // ortak işlem hattı: kaynak düğüm → ScriptProcessor → TonAlgilayici → Cozucu
    function hatKur(src) {
      const ctx = Snd.ctx;
      cz = yeniCozucu();
      let sonAcik = false;
      ta = Mors.TonAlgilayici(ctx.sampleRate, {
        frekans: L.prefs.ton, oto: oto.v,
        onDegisim: (acik, d) => { acik ? cz.isaret(d) : cz.bosluk(d); yaz(); },
        onBlok: (b) => {
          if (b.acik !== sonAcik) { sonAcik = b.acik; b.acik ? serit.ac() : serit.kapa(); }
          sonDb = b.db;
        },
      });
      let sonDb = -120;
      isleyici = ctx.createScriptProcessor(2048, 1, 1);
      isleyici.onaudioprocess = (e) => { ta.isle(e.inputBuffer.getChannelData(0)); };
      sifir = ctx.createGain(); sifir.gain.value = 0;
      src.connect(isleyici); isleyici.connect(sifir); sifir.connect(ctx.destination);
      serit.temizle(); serit.baslat();
      clearInterval(sesId);
      sesId = setInterval(() => {
        if (!ta) return;
        if (!ta.acik) { cz.sessizlik(ta.t - ta.sonGecis); yaz(); }
        const g = L.clamp((sonDb + 90) / 70, 0, 1);
        seviye.firstChild.style.width = (g * 100).toFixed(0) + "%";
        seviye.classList.toggle("acik", ta.acik);
        frek.textContent = "Ton: " + fmtNum(ta.frekans) + " Hz";
        hizEl.textContent = cz.olaylar.length > 2 ? "Hız: ~" + fmtNum(cz.wpm) + " wpm" : "Hız: –";
      }, 60);
    }
    async function micAc() {
      hataYaz("");
      Snd.unlock();
      if (location.protocol === "file:" || !window.isSecureContext) { hataYaz("Mikrofon yalnızca güvenli bağlantıda açılır. Sayfayı dosyadan açtınız: https://egitim.koraytoksoz.com/mors/ adresinden ya da yerel bir sunucudan açın. Bu arada “Mikrofonsuz dene”yi kullanabilirsiniz."); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { hataYaz("Bu tarayıcı mikrofona erişimi desteklemiyor."); return; }
      durum = "aciliyor"; micBtn.setLabel("İzin bekleniyor…");
      try {
        akis = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      } catch (e) {
        durum = "kapali"; micBtn.setLabel("Mikrofonu aç");
        hataYaz(e && e.name === "NotAllowedError" ? "Mikrofon izni verilmedi. Adres çubuğundaki kilit simgesinden bu site için mikrofona izin verip yeniden deneyin." : e && e.name === "NotFoundError" ? "Bu cihazda mikrofon bulunamadı." : "Mikrofon açılamadı: " + (e && e.message ? e.message : e));
        return;
      }
      if (durum !== "aciliyor") { akis.getTracks().forEach((t) => t.stop()); akis = null; return; }
      kaynak = Snd.ctx.createMediaStreamSource(akis);
      hatKur(kaynak);
      durum = "mic"; micBtn.setIcon("stop"); micBtn.setLabel("Mikrofonu kapat"); denBtn.disabled = true;
      document.body.classList.add("mic-on");
    }
    function denemeAc() {
      Snd.unlock();
      const ctx = Snd.ctx; if (!ctx) return;
      hataYaz("");
      const sr = ctx.sampleRate;
      const metin = "CQ DE TA0XYZ K";
      const zc = Mors.cizelge(metin, { wpm: 18 });
      const f = 560 + Math.round(Math.random() * 300);
      const n = Math.ceil((zc.sure + 1.2) * sr);
      const buf = ctx.createBuffer(1, n, sr);
      const x = buf.getChannelData(0);
      zc.isaretler.forEach((m) => {
        const a = Math.floor((m.t + 0.5) * sr), b = Math.floor((m.t + 0.5 + m.d) * sr);
        for (let i = a; i < b; i++) { const env = Math.min(1, (i - a) / (0.005 * sr), (b - i) / (0.005 * sr)); x[i] += 0.25 * env * Math.sin((2 * Math.PI * f * i) / sr); }
      });
      for (let i = 0; i < n; i++) x[i] += (Math.random() * 2 - 1) * 0.06;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const dinlet = ctx.createGain(); dinlet.gain.value = 0.6;
      src.connect(dinlet); dinlet.connect(Snd.master);
      hatKur(src);
      src.start();
      deneme = src;
      durum = "deneme"; micBtn.disabled = true; denBtn.textContent = "Deneme çalıyor…"; denBtn.disabled = true;
      src.onended = () => { if (durum === "deneme") setTimeout(() => { if (durum === "deneme") { cz && cz.sessizlik(5); yaz(); kapat(); } }, 600); };
    }
    function kapat() {
      clearInterval(sesId);
      if (akis) akis.getTracks().forEach((t) => t.stop());
      akis = null;
      try { kaynak && kaynak.disconnect(); } catch (e) {}
      try { deneme && (deneme.onended = null, deneme.stop()); } catch (e) {}
      try { isleyici && (isleyici.onaudioprocess = null, isleyici.disconnect()); } catch (e) {}
      try { sifir && sifir.disconnect(); } catch (e) {}
      kaynak = isleyici = sifir = deneme = null;
      if (ta && ta.acik) serit.kapa();
      ta = null;
      durum = "kapali";
      micBtn.disabled = false; micBtn.setIcon("mic"); micBtn.setLabel("Mikrofonu aç");
      denBtn.disabled = false; denBtn.textContent = "Mikrofonsuz dene";
      seviye.firstChild.style.width = "0%"; seviye.classList.remove("acik");
      document.body.classList.remove("mic-on");
      setTimeout(() => { if (durum === "kapali") serit.durdur(); }, 400);
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden && durum !== "kapali") kapat(); });
    return { leave() { kapat(); }, toggle() { durum === "kapali" ? micAc() : kapat(); } };
  };
})();
