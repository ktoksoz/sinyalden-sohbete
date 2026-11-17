/* Mors mantığı: kod tabloları, metin → zaman çizelgesi, zamanlama (PARIS, Farnsworth),
   süre listesinden çözme (uyarlanan nokta uzunluğu) ve ses sinyalinden ton algılama (Goertzel).
   Saf JavaScript: tarayıcıda window.Mors, Node'da module.exports (test/ klasörü). */
(function (root) {
  // ITU-R M.1677-1 (2009): harfler, rakamlar ve noktalama
  const ITU = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
    "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
    ".": ".-.-.-", ",": "--..--", ":": "---...", "?": "..--..", "'": ".----.", "-": "-....-",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", '"': ".-..-.", "=": "-...-", "+": ".-.-.", "@": ".--.-.",
  };
  // Türkçeye özgü harfler (ITU dışı; Türkiye'de ve Almanca/Esperanto ile ortak kullanılan biçimler)
  const TR = { "Ç": "-.-..", "Ğ": "--.-.", "Ö": "---.", "Ş": ".--..", "Ü": "..--" };
  // Usul işaretleri (prosign): harf arası boşluk olmadan bitişik gönderilir. Metinde <AR> diye yazılır.
  const USUL = {
    AR: ".-.-.", // mesaj sonu
    SK: "...-.-", // görüşme sonu
    BT: "-...-", // ayraç (paragraf); = ile aynı
    KN: "-.--.", // yalnız çağrılan istasyon cevap versin; ( ile aynı
    AS: ".-...", // bekle
    SOS: "...---...", // tehlike
    HH: "........", // hata
    KA: "-.-.-", // başlangıç
    VE: "...-.", // anlaşıldı (SN)
  };
  const HEPSI = Object.assign({}, ITU, TR);
  const TERS = {};
  for (const [k, v] of Object.entries(ITU)) TERS[v] = k;
  for (const [k, v] of Object.entries(TR)) if (!TERS[v]) TERS[v] = k;
  for (const [k, v] of Object.entries(USUL)) if (!TERS[v]) TERS[v] = "<" + k + ">";

  // Türkçe büyük harf: i → İ → I (Morsta noktalı/noktasız ayrımı yok)
  function buyuk(s) {
    return String(s).toLocaleUpperCase("tr").replace(/İ/g, "I").replace(/Â/g, "A").replace(/Î/g, "I").replace(/Û/g, "U");
  }

  /* Metni işaretlere ayır: [{harf, kod, kelimeBasi}] ; tanınmayan karakterler atlanır.
     opts.tr === false ise Türkçe harfler Latin karşılıklarıyla gönderilir (telsizde yaygın: Ç→C, Ş→S…) */
  const LATIN = { "Ç": "C", "Ğ": "G", "Ö": "O", "Ş": "S", "Ü": "U" };
  function harfler(metin, opts = {}) {
    const out = [];
    const s = buyuk(metin);
    let kelimeBasi = true;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (/\s/.test(c)) { kelimeBasi = true; continue; }
      if (c === "<") {
        const j = s.indexOf(">", i);
        if (j > i) {
          const ad = s.slice(i + 1, j);
          if (USUL[ad]) { out.push({ harf: "<" + ad + ">", kod: USUL[ad], kelimeBasi, usul: true }); kelimeBasi = false; i = j; continue; }
        }
      }
      let h = c;
      if (opts.tr === false && LATIN[h]) h = LATIN[h];
      const kod = HEPSI[h];
      if (!kod) continue;
      out.push({ harf: h, kod, kelimeBasi });
      kelimeBasi = false;
    }
    if (out.length) out[0].kelimeBasi = true;
    return out;
  }
  const kodla = (metin, opts) => harfler(metin, opts).map((x) => x.kod).join(" ");

  /* Zamanlama.
     PARIS standardı: "PARIS " kelimesi tam 50 birimdir; wpm kelime/dakika → birim = 1200/wpm ms.
     Farnsworth (ARRL): harfler c wpm hızında, ama harf ve kelime arası boşluklar uzatılarak etkin hız s wpm.
       ta = (60c − 37,2s) / (c·s) saniye (dakikadaki toplam ek boşluk payı / kelime başı)
       harf arası = 3·ta/19, kelime arası = 7·ta/19 */
  function zamanlama(wpm = 20, fwpm = null) {
    const u = 1.2 / wpm; // saniye
    let harfArasi = 3 * u, kelimeArasi = 7 * u;
    if (fwpm && fwpm < wpm) {
      const ta = (60 * wpm - 37.2 * fwpm) / (wpm * fwpm);
      harfArasi = (3 * ta) / 19;
      kelimeArasi = (7 * ta) / 19;
    }
    return { birim: u, nokta: u, cizgi: 3 * u, icBosluk: u, harfArasi, kelimeArasi };
  }

  /* Metin → zaman çizelgesi. Dönüş: { isaretler: [{t, d, tip:'.'|'-', hi}], harfler: [{t, son, harf, kod}], sure }
     t saniye cinsinden, 0'dan başlar. hi: harfin dizideki sırası. */
  function cizelge(metin, opts = {}) {
    const z = zamanlama(opts.wpm || 20, opts.fwpm || null);
    const hs = Array.isArray(metin) ? metin : harfler(metin, opts);
    const isaretler = [], hl = [];
    let t = 0;
    hs.forEach((h, hi) => {
      if (hi > 0) t += h.kelimeBasi ? z.kelimeArasi : z.harfArasi;
      const bas = t;
      [...h.kod].forEach((e, k) => {
        if (k > 0) t += z.icBosluk;
        const d = e === "." ? z.nokta : z.cizgi;
        isaretler.push({ t, d, tip: e, hi });
        t += d;
      });
      hl.push({ t: bas, son: t, harf: h.harf, kod: h.kod, kelimeBasi: h.kelimeBasi });
    });
    return { isaretler, harfler: hl, sure: t, z };
  }
  // Bir metnin birim cinsinden uzunluğu (sonundaki kelime boşluğu dahil değil)
  function birimSay(metin) {
    const c = cizelge(metin, { wpm: 1.2 }); // birim = 1 sn
    return Math.round(c.sure);
  }

  /* Süre listesinden çözme (elle anahtarlama ve ses çözücü için).
     Akış biçiminde: isaret(sure) bir "ton açık" süresi, bosluk(sure) bir "ton kapalı" süresi.
     Nokta uzunluğu tahmini uyarlanır: kısa işaretler noktayı, uzun işaretler çizgi/3'ü günceller.
     Sınırlar: işaret < 2 nokta → nokta; boşluk < 2 nokta → harf içi, < 5 nokta → harf arası, daha uzunu kelime arası. */
  /* İki küme ayırıcı: sıralı süreleri log ölçeğinde en iyi bölen noktayı bulur.
     Dönüş {kisa, uzun, oran} (ortalamalar) ya da tek küme ise null. */
  function ikiKume(dizi, minOran) {
    if (dizi.length < 2) return null;
    const v = dizi.map(Math.log).sort((a, b) => a - b);
    let en = -1, enSkor = -Infinity;
    for (let i = 1; i < v.length; i++) {
      const sol = v.slice(0, i), sag = v.slice(i);
      const ms = sol.reduce((a, b) => a + b, 0) / sol.length, mg = sag.reduce((a, b) => a + b, 0) / sag.length;
      const skor = (mg - ms) * Math.sqrt(sol.length * sag.length);
      if (skor > enSkor) { enSkor = skor; en = i; }
    }
    const ort = (x) => Math.exp(x.reduce((a, b) => a + b, 0) / x.length);
    const kisa = ort(v.slice(0, en)), uzun = ort(v.slice(en));
    return uzun / kisa >= minOran ? { kisa, uzun, oran: uzun / kisa } : null;
  }
  function Cozucu(opts = {}) {
    let nokta = opts.nokta || 1.2 / (opts.wpm || 15);
    let kod = "";
    const dinleyici = opts.onHarf || (() => {});
    const olaylar = [];
    const isaretG = opts.gecmis ? opts.gecmis.isaret.slice() : [];
    const boslukG = opts.gecmis ? opts.gecmis.bosluk.slice() : [];
    let kelimeEsik = null;
    let metin = "";
    function guncelle() {
      const k = ikiKume(isaretG, 2);
      if (k) nokta = (k.kisa + k.uzun / 3) / 2;
      else if (isaretG.length) {
        // tek tür işaret: noktaya mı çizgiye mi yakın?
        const m = Math.exp(isaretG.reduce((a, b) => a + Math.log(b), 0) / isaretG.length);
        nokta = m < 2 * nokta ? 0.5 * nokta + 0.5 * m : 0.5 * nokta + 0.5 * (m / 3);
      }
      nokta = Math.min(0.4, Math.max(0.02, nokta));
      const kb = ikiKume(boslukG.filter((d) => d >= 2 * nokta), 1.6);
      kelimeEsik = kb ? Math.max(4 * nokta, Math.sqrt(kb.kisa * kb.uzun)) : null;
    }
    if (isaretG.length) guncelle();
    function harfiBitir(kelimeSonu) {
      if (kod) {
        const h = TERS[kod] || "�";
        metin += h;
        olaylar.push({ harf: h, kod });
        dinleyici(h, kod);
        kod = "";
      }
      if (kelimeSonu && metin && !metin.endsWith(" ")) { metin += " "; dinleyici(" ", ""); }
    }
    const esikIsaret = () => { const k = ikiKume(isaretG, 2); return k ? Math.sqrt(k.kisa * k.uzun) : 2 * nokta; };
    const kelimeMi = (d) => d >= (kelimeEsik || 5 * nokta);
    return {
      isaret(d) {
        if (d < 0.012) return; // 12 ms'den kısa: parazit (100 wpm'in noktası bile 12 ms)
        isaretG.push(d); if (isaretG.length > 24) isaretG.shift();
        guncelle();
        kod += d < esikIsaret() ? "." : "-";
        if (kod.length > 9) harfiBitir(false);
      },
      bosluk(d) {
        boslukG.push(d); if (boslukG.length > 24) boslukG.shift();
        if (d < 2 * nokta) return;
        guncelle();
        harfiBitir(kelimeMi(d));
      },
      // ton uzun süre gelmediyse: bekleyen harfi bitir (canlı çözmede kullanılır)
      sessizlik(d) {
        if (kod && d >= 3 * nokta) harfiBitir(false);
        if (!kod && d >= Math.max(7 * nokta, kelimeEsik || 0) && metin && !metin.endsWith(" ")) { metin += " "; dinleyici(" ", ""); }
      },
      bitir() { harfiBitir(false); return metin.trim(); },
      get metin() { return metin; },
      get kod() { return kod; },
      get nokta() { return nokta; },
      get wpm() { return 1.2 / nokta; },
      get gecmis() { return { isaret: isaretG.slice(), bosluk: boslukG.slice() }; },
      olaylar,
    };
  }
  // Toplu çözme: [[acik, sure], ...]. İki geçiş: önce hız ve boşluk kümeleri öğrenilir, sonra çözülür.
  function coz(sureler, opts = {}) {
    const on = Cozucu(opts);
    sureler.forEach(([acik, d]) => (acik ? on.isaret(d) : on.bosluk(d)));
    const g = on.gecmis;
    const c = Cozucu(Object.assign({}, opts, { nokta: on.nokta, gecmis: { isaret: sureler.filter((x) => x[0]).map((x) => x[1]).slice(-60), bosluk: sureler.filter((x) => !x[0]).map((x) => x[1]).slice(-60) } }));
    void g;
    sureler.forEach(([acik, d]) => (acik ? c.isaret(d) : c.bosluk(d)));
    return c.bitir();
  }
  // Çizelgeyi süre listesine çevir (test ve gösterim için)
  function sureListesi(c) {
    const out = [];
    let t = 0;
    c.isaretler.forEach((m) => {
      if (m.t > t + 1e-9) out.push([false, m.t - t]);
      out.push([true, m.d]);
      t = m.t + m.d;
    });
    return out;
  }

  /* Ses sinyalinden ton algılama: Goertzel ile tek frekansta güç, blok blok.
     TonAlgilayici(sr, {frekans, blok}) → .isle(Float32Array) her blok için {t, guc, acik} olayları üretir;
     açık/kapalı geçişlerini süre olarak onDegisim(acik, sure) ile bildirir.
     Eşik uyarlanır: gürültü tabanı ve tepe izlenir, eşik ikisinin geometrik ortasına yakın; histerezis var. */
  const HANN = new Map();
  function hann(n) {
    if (!HANN.has(n)) { const w = new Float32Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)); HANN.set(n, w); }
    return HANN.get(n);
  }
  function goertzel(x, bas, n, k) {
    // k: normalleştirilmiş açısal frekans (2πf/sr). Hann penceresi: yan loblar düşsün
    const c = 2 * Math.cos(k), w = hann(n);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < n; i++) {
      const s0 = x[bas + i] * w[i] + c * s1 - s2;
      s2 = s1; s1 = s0;
    }
    return (s1 * s1 + s2 * s2 - c * s1 * s2) / (n * n);
  }
  function TonAlgilayici(sr, opts = {}) {
    let f = opts.frekans || 600;
    const blok = opts.blok || Math.round(sr * 0.004); // 4 ms adım
    const pencere = opts.pencere || Math.round(sr * 0.012); // 12 ms pencere ≈ 80 Hz bant
    const buf = new Float32Array(pencere + blok * 64);
    let dolu = 0, t = 0;
    let taban = 1e-7, tepe = 1e-5, acik = false, sonGecis = 0, bekleyen = 0, ilkBlok = true;
    const onDegisim = opts.onDegisim || (() => {});
    const onBlok = opts.onBlok || null;
    const otoFrekans = opts.oto !== false;
    // otomatik frekans: 350–1100 Hz arasında en güçlü tonu ara
    const tara = [];
    for (let ff = 350; ff <= 1100; ff += 10) tara.push(ff);
    const enerji = new Float32Array(tara.length);
    let taramaSay = 0;
    function isle(x) {
      // gelen örnekleri tampona ekle, her blok adımında bir pencere değerlendir
      let i = 0;
      while (i < x.length) {
        const n = Math.min(x.length - i, buf.length - dolu);
        buf.set(x.subarray(i, i + n), dolu);
        dolu += n; i += n;
        while (dolu >= pencere) {
          const g = goertzel(buf, 0, pencere, (2 * Math.PI * f) / sr);
          if (otoFrekans && ++taramaSay % 5 === 0) {
            // her 5 blokta bir tara (işlemciyi yormasın); 250 blokta (~1 sn) bir karar ver
            for (let k = 0; k < tara.length; k += 1) enerji[k] = enerji[k] * 0.97 + goertzelHizli(buf, pencere, tara[k], sr);
            if (taramaSay % 250 === 0) {
              let en = 0; for (let k = 1; k < tara.length; k++) if (enerji[k] > enerji[en]) en = k;
              // komşu kutularla parabol uydurma: kesin frekans
              const a = enerji[en - 1] || 0, b = enerji[en], c2 = enerji[en + 1] || 0;
              const p = (a - c2) / (2 * (a - 2 * b + c2) || 1);
              const yeni = tara[en] + Math.max(-0.5, Math.min(0.5, p)) * 10;
              if (Math.abs(yeni - f) > 15) f = yeni;
            }
          }
          karar(g);
          buf.copyWithin(0, blok, dolu);
          dolu -= blok;
          t += blok / sr;
        }
      }
    }
    function goertzelHizli(b, n, ff, s) { return goertzel(b, 0, n, (2 * Math.PI * ff) / s); }
    function karar(g) {
      const db = 10 * Math.log10(g + 1e-12);
      if (ilkBlok) { taban = Math.max(g, 1e-10); tepe = taban * 4; ilkBlok = false; }
      // taban yavaş yükselir, hızlı düşer; tepe hızlı yükselir, yavaş düşer
      // taban yalnızca ton kapalıyken yükselir (sinyal tabanı kirletmesin)
      // taban: ton kapalıyken gürültünün ortalama gücü (tek tük tepeler sınırlanarak)
      if (!acik) taban = taban * 0.98 + Math.min(g, taban * 4) * 0.02;
      taban = Math.max(taban, 1e-10);
      if (g > tepe) tepe = tepe * 0.5 + g * 0.5; else tepe = tepe * 0.9995 + g * 0.0005;
      if (tepe < taban * 4) tepe = taban * 4;
      const ust = Math.sqrt(taban * tepe) * 1.4, alt = Math.sqrt(taban * tepe) * 0.7;
      const yeni = acik ? g > Math.max(alt, taban * 4) : g > Math.max(ust, taban * 10);
      // sinyal/gürültü yetersizse (tepe tabanın 30 katından azsa) açılma; ilk 0,2 sn ısınma
      const yeterli = tepe > taban * 30 && t > 0.2;
      const istek = yeni && yeterli;
      // titreşim süzgeci: durum ancak iki ardışık blok aynı şeyi söylerse değişir
      if (istek !== acik) bekleyen++; else bekleyen = 0;
      onBlok && onBlok({ t, db, acik: bekleyen >= 2 ? istek : acik, f });
      if (bekleyen >= 2) {
        const gt = t - blok / sr; // geçiş bir blok önce başladı
        onDegisim(acik, gt - sonGecis);
        acik = istek; sonGecis = gt; bekleyen = 0;
      }
    }
    return {
      isle,
      get frekans() { return f; },
      set frekans(v) { f = v; },
      get acik() { return acik; },
      get t() { return t; },
      get sonGecis() { return sonGecis; },
    };
  }

  /* Koch sırası (LCWO.net ve G4FON'un kullandığı yaygın sıra) */
  const KOCH = "KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X".split("");

  /* Harf sıklığı (İngilizce, yüzde; Lewand 2000) — Mors kodlarının kısalığıyla karşılaştırmak için */
  const SIKLIK_EN = { E: 12.7, T: 9.06, A: 8.17, O: 7.51, I: 6.97, N: 6.75, S: 6.33, H: 6.09, R: 5.99, D: 4.25, L: 4.03, C: 2.78, U: 2.76, M: 2.41, W: 2.36, F: 2.23, G: 2.02, Y: 1.97, P: 1.93, B: 1.49, V: 0.98, K: 0.77, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07 };

  // Bir kodun birim uzunluğu (harf içi boşluklar dahil)
  const kodBirim = (kod) => [...kod].reduce((a, e) => a + (e === "." ? 1 : 3), 0) + Math.max(0, kod.length - 1);

  const Mors = { ITU, TR, USUL, HEPSI, TERS, LATIN, KOCH, SIKLIK_EN, buyuk, harfler, kodla, zamanlama, cizelge, birimSay,
    Cozucu, coz, sureListesi, goertzel, TonAlgilayici, kodBirim };
  if (typeof module !== "undefined" && module.exports) module.exports = Mors;
  else root.Mors = Mors;
})(typeof window !== "undefined" ? window : globalThis);
