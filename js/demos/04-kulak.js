/* 4. Kulakla öğrenmek: deneyler ve çalışma araçları
   - sesKalibi:     bir harfi 5 ve 20 wpm'de dinle; heceler; iki hız aynı zaman ölçeğinde
   - koch:          Koch sırası, ders numaraları, kendi dersini seç
   - farnsworth:    harf hızı / etkin hız; aynı ölçekte iki statik şerit
   - kochAlistirma: ANA ARAÇ — beşli gruplar, yazma, hizalamalı değerlendirme, geçmiş
   - tekHarf:       anında tanıma oyunu, tepki süresi, uyarlanan ağırlık, harf tablosu
   - turkceHarfler: Ç Ğ Ö Ş Ü, rakamlar, noktalama; "dinle ve bul"
   - kelimeler:     çağrı işaretleri ve sık telsiz kelimeleri */
(function () {
  const { h, C, FONT, rgba, fmtNum, store } = L;

  /* --- ortak yardımcılar --- */
  // "di-di-dah-dit": iç noktalar "di", sondaki nokta "dit", çizgi "dah"
  const hece = (kod) => [...kod].map((e, i) => (e === "-" ? "dah" : i === kod.length - 1 ? "dit" : "di")).join("-");
  function hucre(harf, alt, onclick) {
    const kod = Mors.HEPSI[harf] || "";
    const b = h("button.harf-hucre", { type: "button", onclick, "aria-label": `${harf}: ${L.kodYaz(kod)}` },
      h("b", harf), h("span.kh", { html: L.kodSvg(kod, { birim: 5, yuk: 5 }) }), alt ? h("small.hucre-alt", alt) : null);
    b.dataset.harf = harf;
    return b;
  }
  const calTek = (c, ek = {}) => Snd.cal(c, Object.assign({ fwpm: null }, ek));
  /* Hizalama (düzenleme uzaklığı + geri izleme).
     Dönüş: [{s, y, tip}] tip: "ok" | "deg" (yanlış harf) | "eksik" (yazılmamış) | "fazla" (fazladan yazılmış) */
  function hizala(a, b) {
    const n = a.length, m = b.length;
    const d = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = 0; i <= n; i++) d[i][0] = i;
    for (let j = 0; j <= m; j++) d[0][j] = j;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const out = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { out.push({ s: a[i - 1], y: b[j - 1], tip: a[i - 1] === b[j - 1] ? "ok" : "deg" }); i--; j--; }
      else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { out.push({ s: a[i - 1], y: null, tip: "eksik" }); i--; }
      else { out.push({ s: null, y: b[j - 1], tip: "fazla" }); j--; }
    }
    return out.reverse();
  }
  // hizalamayı iki satır olarak göster: gönderilen / yazılan
  function farkGoster(ops) {
    const ust = h("span.fark-ust"), alt = h("span.fark-alt");
    ops.forEach((o) => {
      ust.append(h("span.fk." + (o.tip === "ok" ? "ok" : o.tip === "fazla" ? "bos" : "hata"), o.s ?? "·"));
      alt.append(h("span.fk." + (o.tip === "ok" ? "ok" : o.tip === "eksik" ? "bos" : "hata"), o.y ?? "_"));
    });
    return h("span.fark", ust, alt);
  }
  const temizle = (s) => Mors.buyuk(s).replace(/[^A-Z0-9ÇĞÖŞÜ.,?'\/()":=+@-]/g, "");

  /* ================= sesKalibi ================= */
  window.Demos.sesKalibi = (stage) => {
    const HARFLER = ["F", "L", "Q", "Y", "C", "B", "P", "5"];
    let harf = "F", hnd = null, calan = null, id = 0;
    const secim = L.seg(HARFLER.map((x) => [x, x]), harf, (x) => { harf = x; goster(); calTek(harf, { wpm: 20 }); }, "Harf");
    const buyuk = h("div.sk-harf");
    const heceEl = h("div.sk-hece");
    const b5 = L.ibtn("play", "5 wpm", () => cal(5));
    const b20 = L.ibtn("play", "20 wpm", () => cal(20), "primary");
    const kap = h("div.sheet.sk-kap"); const cv = h("canvas"); kap.append(cv);
    stage.append(h("div.controls", secim), h("div.sk-ust", buyuk, h("div", heceEl, h("div.controls", b5, b20))), kap);
    const st = L.canvas(cv, () => ciz());
    function goster() {
      const kod = Mors.HEPSI[harf];
      buyuk.textContent = harf;
      heceEl.innerHTML = "";
      heceEl.append(h("span.kod", hece(kod)));
      ciz();
    }
    function cal(w) {
      hnd && hnd.stop();
      hnd = calTek(harf, { wpm: w });
      calan = w;
      const adim = () => { ciz(); if (hnd && !hnd.durdu) id = requestAnimationFrame(adim); else { calan = null; ciz(); } };
      cancelAnimationFrame(id); id = requestAnimationFrame(adim);
    }
    function ciz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const c5 = Mors.cizelge(harf, { wpm: 5 }), c20 = Mors.cizelge(harf, { wpm: 20 });
      const sol = 70, sag = w - 16;
      const x = (t) => sol + (t / c5.sure) * (sag - sol);
      const satir = (cz, y, ad, wpm) => {
        L.text(ctx, ad, 8, y + 6, { size: 13, color: C.ink, weight: 700, font: FONT.mono });
        L.text(ctx, fmtNum(cz.sure, 2).replace(",00", "") + " sn", 8, y + 24, { size: 11, color: C.muted });
        const tNow = calan === wpm && hnd ? hnd.saat() : -1;
        cz.isaretler.forEach((m) => {
          const sesli = tNow >= m.t && tNow <= m.t + m.d;
          ctx.fillStyle = sesli ? C.pirinc2 : C.pirinc;
          const xa = x(m.t), ww = Math.max(3, x(m.t + m.d) - xa), hh = 18;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(xa, y - hh / 2, ww, hh, Math.min(9, ww / 2)) : ctx.rect(xa, y - hh / 2, ww, hh); ctx.fill();
        });
        if (tNow >= 0) { ctx.fillStyle = C.ink; ctx.fillRect(x(Math.min(tNow, cz.sure)), y - 16, 2, 32); }
      };
      satir(c5, H * 0.33, "5 wpm", 5);
      satir(c20, H * 0.72, "20 wpm", 20);
    }
    goster();
    window.addEventListener("themechange", () => ciz());
    return { enter() { ciz(); }, leave() { hnd && hnd.stop(); cancelAnimationFrame(id); }, toggle() { cal(20); } };
  };

  /* ================= koch ================= */
  // Ders n: Koch sırasının ilk n+1 karakteri (1. ders K ve M)
  const dersNo = (i) => Math.max(1, i);
  const dersHarfleri = (d) => Mors.KOCH.slice(0, Math.min(Mors.KOCH.length, d + 1));
  const dersOku = () => L.clamp(store.get("koch.ders", 1), 1, Mors.KOCH.length - 1);

  window.Demos.koch = (stage) => {
    let ders = dersOku();
    const izgara = h("div.harf-izgara.koch-izgara");
    const cells = Mors.KOCH.map((c, i) => {
      const b = hucre(c, dersNo(i) + ". ders", () => { calTek(c); });
      izgara.append(b); return b;
    });
    const dersEl = h("b.koch-ders");
    const eksi = L.btn("−", () => ayarla(ders - 1), "sm"), arti = L.btn("+", () => ayarla(ders + 1), "sm");
    eksi.setAttribute("aria-label", "Bir ders geri"); arti.setAttribute("aria-label", "Bir ders ileri");
    const git = L.btn("Bu dersle alıştırmaya geç", () => { store.set("koch.ders", ders); Deck.goId("koch-alistirma"); }, "primary");
    stage.append(h("div.controls", h("span.ctl-lab", "Dersim"), eksi, dersEl, arti, h("span.spacer"), git), h("div.scroll", izgara));
    function ayarla(d) {
      ders = L.clamp(d, 1, Mors.KOCH.length - 1);
      dersEl.textContent = `${ders}. ders · ${ders + 1} karakter`;
      cells.forEach((b, i) => { b.classList.toggle("kapali", i > ders); b.classList.toggle("on", i === ders); });
    }
    ayarla(ders);
    return { enter() { ayarla(dersOku()); }, leave() {}, toggle() { calTek(Mors.KOCH[ders]); } };
  };

  /* ================= farnsworth ================= */
  window.Demos.farnsworth = (stage) => {
    let c = Math.max(L.prefs.wpm, 12), s = Math.min(L.prefs.fwpm, c);
    const kutu = h("input.satir-giris", { type: "text", value: "PARIS PARIS", maxlength: 30, spellcheck: "false", "aria-label": "Metin" });
    const fs = L.slider({ label: "Etkin hız", min: 4, max: 35, value: s, fmt: (v) => v + " wpm", oninput: (v) => { s = Math.min(v, c); if (v > c) fs.set(c); ciz(); } });
    const cs = L.slider({ label: "Harf hızı", min: 5, max: 35, value: c, fmt: (v) => v + " wpm", oninput: (v) => { c = v; if (s > c) { s = c; fs.set(c); } ciz(); } });
    const s1Kap = h("div.fw-blok"), s2Kap = h("div.fw-blok");
    const l1 = h("p.fw-lab"), l2 = h("p.fw-lab");
    const b1 = L.ibtn("play", "Standart", () => cal(0), ""), b2 = L.ibtn("play", "Farnsworth", () => cal(1), "primary");
    s1Kap.append(h("div.controls", l1, h("span.spacer"), b1)); s2Kap.append(h("div.controls", l2, h("span.spacer"), b2));
    const sr1 = Serit(s1Kap, { kip: "statik", birimIzgara: false });
    const sr2 = Serit(s2Kap, { kip: "statik" });
    const tablo = h("div.fw-tablo");
    stage.append(h("div.controls", kutu), h("div.controls", cs, fs), s1Kap, s2Kap, tablo);
    let hnd = null, izDur = null, cz1, cz2;
    function ciz() {
      const m = kutu.value.trim() || "PARIS";
      cz1 = Mors.cizelge(m, { wpm: s }); cz2 = Mors.cizelge(m, { wpm: c, fwpm: s < c ? s : null });
      const ust = Math.max(cz1.sure, cz2.sure);
      sr1.temizle(); sr2.temizle();
      sr1.cizelge(Object.assign({}, cz1, { sure: ust }), 0);
      sr2.cizelge(Object.assign({}, cz2, { sure: ust }), 0);
      l1.innerHTML = ""; l1.append(h("b", "Standart: "), `her şey ${s} wpm`);
      l2.innerHTML = ""; l2.append(h("b", "Farnsworth: "), `harfler ${c} wpm, etkin ${s} wpm`);
      const z1 = cz1.z, z2 = cz2.z, ms = (v) => fmtNum(v * 1000) + " ms";
      tablo.innerHTML = "";
      const t = h("table.data", h("tr", h("th", ""), h("th", "nokta"), h("th", "çizgi"), h("th", "harf arası"), h("th", "kelime arası"), h("th", "kelime başına")));
      t.append(h("tr", h("td", "Standart"), h("td", ms(z1.nokta)), h("td", ms(z1.cizgi)), h("td", ms(z1.harfArasi)), h("td", ms(z1.kelimeArasi)), h("td", fmtNum((cz1.sure + z1.kelimeArasi) / Math.max(1, cz1.harfler.filter((x) => x.kelimeBasi).length), 2) + " sn")));
      t.append(h("tr", h("td", "Farnsworth"), h("td", ms(z2.nokta)), h("td", ms(z2.cizgi)), h("td", ms(z2.harfArasi)), h("td", ms(z2.kelimeArasi)), h("td", fmtNum((cz2.sure + z2.kelimeArasi) / Math.max(1, cz2.harfler.filter((x) => x.kelimeBasi).length), 2) + " sn")));
      tablo.append(t);
    }
    function cal(i) {
      dur();
      const cz = i ? cz2 : cz1;
      hnd = Snd.calCizelge(cz, { f: L.prefs.ton });
      const sr = i ? sr2 : sr1;
      // statik şeritte imleç: ortak ölçek kullanıldığı için zaman doğrudan geçer
      izDur = Serit.izle(sr, hnd);
    }
    function dur() { hnd && hnd.stop(); hnd = null; izDur && izDur(); izDur = null; }
    kutu.addEventListener("input", ciz);
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); cal(1); } });
    ciz();
    return { enter() { ciz(); }, leave() { dur(); }, toggle() { cal(1); } };
  };

  /* ================= kochAlistirma ================= */
  window.Demos.kochAlistirma = (stage) => {
    let ders = dersOku(), grupSay = store.get("koch.grup", 10);
    let gruplar = [], hnd = null, durum = "hazir", izId = 0;
    const dersEl = h("b.koch-ders");
    const harfEl = h("span.ka-harfler");
    const eksi = L.btn("−", () => dersAyarla(ders - 1), "sm"), arti = L.btn("+", () => dersAyarla(ders + 1), "sm");
    eksi.setAttribute("aria-label", "Bir ders geri"); arti.setAttribute("aria-label", "Bir ders ileri");
    const grupSeg = L.seg([[5, "5 grup"], [10, "10"], [15, "15"], [20, "20"]], grupSay, (v) => { grupSay = v; store.set("koch.grup", v); }, "Grup sayısı");
    const basla = L.ibtn("play", "Başla", () => (durum === "caliyor" ? dur() : baslat()), "primary");
    const hizEl = h("span.ka-hiz");
    const ayar = L.btn("Hız", () => window.AyarPanel && window.AyarPanel.toggle(true), "sm ghost");
    const durumEl = h("p.ka-durum");
    const kutu = h("input.satir-giris.ka-kutu", { type: "text", placeholder: "Duyduğunuzu yazın", spellcheck: "false", autocomplete: "off", autocapitalize: "characters", "aria-label": "Duyduğunuz harfler" });
    const degerlendir = L.btn("Değerlendir", () => sonuc(), "sm");
    const seritKap = h("div");
    const sonucEl = h("div.ka-sonuc");
    const gecmisEl = h("div.ka-gecmis");
    stage.append(
      h("div.controls", h("span.ctl-lab", "Ders"), eksi, dersEl, arti, harfEl),
      h("div.controls", basla, grupSeg, h("span.spacer"), hizEl, ayar),
      seritKap, durumEl, h("div.controls", kutu, degerlendir), sonucEl, gecmisEl);
    const serit = Serit(seritKap, { saniye: 4, harfYok: true, gelecekGizli: true });
    serit.el.classList.add("kucuk");

    function hizYaz() { const p = L.prefs; hizEl.textContent = p.fwpm < p.wpm ? `${p.wpm}/${p.fwpm} wpm` : `${p.wpm} wpm`; }
    function dersAyarla(d) {
      if (durum === "caliyor") return;
      ders = L.clamp(d, 1, Mors.KOCH.length - 1);
      store.set("koch.ders", ders);
      dersEl.textContent = `${ders}. ders`;
      harfEl.innerHTML = "";
      dersHarfleri(ders).forEach((c, i, a) => harfEl.append(h("span.ka-chip" + (i === a.length - 1 && ders > 1 ? ".yeni" : ""), c)));
    }
    function uret() {
      const set = dersHarfleri(ders), yeni = set[set.length - 1];
      const g = [];
      for (let i = 0; i < grupSay; i++) {
        let s = "";
        for (let k = 0; k < 5; k++) s += ders > 1 && Math.random() < 0.25 ? yeni : L.sec(set);
        g.push(s);
      }
      return g;
    }
    function baslat() {
      Snd.unlock();
      dur(true);
      gruplar = uret();
      kutu.value = ""; kutu.classList.remove("dogru", "yanlis");
      sonucEl.innerHTML = "";
      serit.temizle();
      hnd = Snd.cal(gruplar.join(" "));
      serit.cizelge(hnd.cz, hnd.t0); serit.baslat();
      durum = "caliyor";
      basla.setIcon("stop"); basla.setLabel("Durdur");
      kutu.focus();
      const izle = () => {
        if (durum !== "caliyor" || !hnd) return;
        const t = hnd.saat();
        const gi = hnd.cz.harfler.filter((x) => x.kelimeBasi && x.t <= t).length;
        durumEl.textContent = `Çalıyor: ${Math.max(1, gi)}. grup / ${gruplar.length}`;
        izId = requestAnimationFrame(izle);
      };
      izle();
      hnd.bitti.then((tam) => {
        if (!tam || durum !== "caliyor") return;
        durum = "bitti"; cancelAnimationFrame(izId);
        basla.setIcon("tekrar"); basla.setLabel("Yeni tur");
        durumEl.textContent = "Tur bitti. Yazmayı tamamlayın ve Enter'a basın.";
        setTimeout(() => serit.durdur(), 1500);
      });
    }
    function dur(sessiz) {
      cancelAnimationFrame(izId);
      // yarıda kesilen turda yalnızca duyulmaya başlanmış gruplar değerlendirilir
      if (durum === "caliyor" && hnd && gruplar.length) {
        const t = hnd.saat();
        const gi = hnd.cz.harfler.filter((x) => x.kelimeBasi && x.t <= t).length;
        gruplar = gruplar.slice(0, Math.max(1, gi));
      }
      hnd && hnd.stop(); hnd = null;
      serit.durdur();
      if (durum === "caliyor" && !sessiz) { durum = "bitti"; durumEl.textContent = "Durduruldu. Yazdıklarınızı Enter ile değerlendirebilirsiniz."; }
      basla.setIcon("play"); basla.setLabel("Başla");
    }
    function sonuc() {
      if (!gruplar.length) { L.toast("Önce bir tur başlatın"); return; }
      if (durum === "caliyor") { dur(); }
      // tur yarıda kesildiyse yalnızca çalınan gruplar sayılsın
      const yazilan = temizle(kutu.value.replace(/\s+/g, " ")).length ? Mors.buyuk(kutu.value).trim().split(/\s+/).map(temizle).filter(Boolean) : [];
      const gonderilen = gruplar;
      const a = gonderilen.join(""), b = yazilan.join("");
      const ops = hizala(a, b);
      const dogru = ops.filter((o) => o.tip === "ok").length;
      // fazladan yazılan harfler de hata sayılır
      const fazla = ops.filter((o) => o.tip === "fazla").length;
      const oran = a.length ? dogru / (a.length + fazla) : 0;
      // grup grup gösterim: gönderilen her grubun op aralığını bul
      sonucEl.innerHTML = "";
      const satirlar = h("div.ka-gruplar");
      let si = 0, buf = [];
      const sinirlar = []; let say = 0; gonderilen.forEach((g) => { say += g.length; sinirlar.push(say); });
      let gi = 0;
      ops.forEach((o) => {
        buf.push(o);
        if (o.s != null) si++;
        if (si === sinirlar[gi]) { satirlar.append(farkGoster(buf)); buf = []; gi++; }
      });
      if (buf.length) satirlar.append(farkGoster(buf));
      // kaçırılan harfler
      const kacan = {};
      ops.forEach((o) => { if (o.s != null && o.tip !== "ok") kacan[o.s] = (kacan[o.s] || 0) + 1; });
      const kacanStr = Object.entries(kacan).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ×${v}`).join("  ");
      const yuz = Math.round(oran * 100);
      const ol = h("div.olcumler",
        h("div.olcum" + (oran >= 0.9 ? ".iyi" : ""), h("b", "%" + yuz), h("small", "doğruluk")),
        h("div.olcum", h("b", `${dogru}/${a.length}`), h("small", "doğru harf")),
        kacanStr ? h("div.olcum", h("b.kod", kacanStr), h("small", "kaçırılanlar")) : null);
      sonucEl.append(ol, satirlar);
      if (oran >= 0.9 && ders < Mors.KOCH.length - 1) {
        const yeni = Mors.KOCH[ders + 1];
        sonucEl.append(h("p.note-msg", `Harika: %90'ın üstündesiniz. Sıradaki harf `, h("b.kod", yeni), ` (${hece(Mors.HEPSI[yeni])}).`, " ",
          L.btn(`${ders + 1}. derse geç`, () => { dersAyarla(ders + 1); calTek(yeni); sonucEl.innerHTML = ""; }, "sm primary"), " ", L.btn("Dinle", () => calTek(yeni), "sm")));
      } else if (oran < 0.6 && ders > 1) {
        sonucEl.append(h("p.note-msg", "Bu ders bugün zorladı. Bir tur daha deneyin ya da bir ders geri dönün; ertesi gün çoğu zaman daha kolay gelir."));
      } else if (oran < 0.9) {
        sonucEl.append(h("p.note-msg", `%90'a ${90 - yuz} puan kaldı. En çok kaçırdığınız harfi tek harf oyununda çalışabilirsiniz.`));
      }
      // geçmiş
      const g = store.get("koch.gecmis", []);
      g.push({ t: Date.now(), ders, d: Math.round(oran * 1000) / 1000, wpm: L.prefs.wpm, fwpm: L.prefs.fwpm, n: a.length });
      store.set("koch.gecmis", g.slice(-80));
      gruplar = [];
      durum = "hazir";
      basla.setIcon("play"); basla.setLabel("Başla");
      durumEl.textContent = "";
      gecmisCiz();
    }
    function gecmisCiz() {
      const g = store.get("koch.gecmis", []).slice(-20);
      gecmisEl.innerHTML = "";
      if (!g.length) { gecmisEl.append(h("p.ka-bos", "Geçmiş burada görünecek: her turun dersi ve doğruluğu.")); return; }
      const cizgi = h("div.ka-cubuklar");
      g.forEach((x) => {
        const tarih = new Date(x.t);
        const bar = h("div.ka-cubuk" + (x.d >= 0.9 ? ".iyi" : ""), { style: { "--y": Math.round(x.d * 100) + "%" }, title: `${tarih.toLocaleDateString("tr-TR")} · ${x.ders}. ders · %${Math.round(x.d * 100)}` },
          h("i"), h("small", String(x.ders)));
        cizgi.append(bar);
      });
      gecmisEl.append(h("div.ka-gecmis-ust", h("span.ctl-lab", "Son turlar (çubuğun altında ders numarası; çizgi %90)"),
        L.btn("Sıfırla", () => { if (confirm("Koch geçmişi silinsin mi?")) { store.del("koch.gecmis"); gecmisCiz(); } }, "sm ghost")), cizgi);
    }
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sonuc(); } });
    window.addEventListener("prefchange", hizYaz);
    dersAyarla(ders); hizYaz(); gecmisCiz();
    return {
      enter() { dersAyarla(dersOku()); hizYaz(); },
      leave() { if (durum === "caliyor") { dur(true); gruplar = []; durum = "hazir"; durumEl.textContent = ""; } },
      toggle() { durum === "caliyor" ? dur() : baslat(); },
    };
  };

  /* ================= tekHarf ================= */
  window.Demos.tekHarf = (stage) => {
    const KUMELER = {
      koch: () => dersHarfleri(dersOku()),
      harf: () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
      rakam: () => "1234567890".split(""),
      hepsi: () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,?/=".split(""),
    };
    let kume = store.get("tek.kume", "harf");
    let ist = store.get("tek.ist", {});
    let oyun = false, soru = null, tSon = null, hnd = null, bekle = 0, zaman = 0, son = null;
    let oturum = { n: 0, d: 0, seri: 0, rt: [] };
    const seg = L.seg([["koch", "Koch dersim"], ["harf", "A–Z"], ["rakam", "Rakamlar"], ["hepsi", "Hepsi"]], kume, (k) => { kume = k; store.set("tek.kume", k); izgaraKur(); }, "Harf kümesi");
    const basla = L.ibtn("play", "Başla", () => (oyun ? bitir() : baslat()), "primary");
    const kutu = h("input.satir-giris.th-kutu", { type: "text", maxlength: 2, placeholder: "?", spellcheck: "false", autocomplete: "off", autocapitalize: "characters", "aria-label": "Duyduğunuz harf" });
    const geri = h("div.th-geri");
    const olc = h("div.olcumler");
    const izgara = h("div.harf-izgara.th-izgara");
    const sifirla = L.btn("Sıfırla", () => { if (confirm("Harf istatistikleri silinsin mi?")) { ist = {}; store.set("tek.ist", ist); izgaraKur(); } }, "sm ghost");
    stage.append(h("div.controls", seg), h("div.controls", basla, kutu, geri), olc, h("div.th-tablo-ust", h("span.ctl-lab", "Harfleriniz: renk doğruluğu, sayı ortalama tepki süresi"), sifirla), h("div.scroll", izgara));

    function istOku(c) { return ist[c] || (ist[c] = { n: 0, h: 0, s: 0, k: 0 }); }
    function agirlik(c) {
      const x = ist[c];
      if (!x || !x.n) return 3;
      const hata = (x.h + 0.5) / (x.n + 1);
      const ort = x.k ? x.s / x.k : 1.5;
      return 0.6 + 5 * hata + Math.max(0, ort - 0.45) * 2;
    }
    function sec() {
      const set = KUMELER[kume]();
      const ws = set.map((c) => (c === son && set.length > 1 ? 0 : agirlik(c)));
      let r = Math.random() * ws.reduce((a, b) => a + b, 0);
      for (let i = 0; i < set.length; i++) { r -= ws[i]; if (r <= 0) return set[i]; }
      return set[set.length - 1];
    }
    function izgaraKur() {
      izgara.innerHTML = "";
      KUMELER[kume]().forEach((c) => {
        const x = ist[c];
        const alt = x && x.n ? `%${Math.round((1 - x.h / x.n) * 100)} · ${x.k ? fmtNum(x.s / x.k, 1) + " sn" : "–"}` : "yeni";
        const b = hucre(c, alt, () => { if (!oyun) calTek(c); });
        if (x && x.n) {
          const dogru = 1 - x.h / x.n;
          b.style.setProperty("--skor", dogru);
          b.classList.add(dogru >= 0.9 && x.k && x.s / x.k < 0.8 ? "th-iyi" : dogru < 0.7 ? "th-zayif" : "th-orta");
        }
        izgara.append(b);
      });
    }
    function olcYaz() {
      const ort = oturum.rt.length ? oturum.rt.reduce((a, b) => a + b, 0) / oturum.rt.length : null;
      olc.innerHTML = "";
      olc.append(
        h("div.olcum", h("b", oturum.n ? "%" + Math.round((oturum.d / oturum.n) * 100) : "–"), h("small", `doğru (${oturum.d}/${oturum.n})`)),
        h("div.olcum", h("b", ort != null ? fmtNum(ort, 2) + " sn" : "–"), h("small", "ortalama tepki")),
        h("div.olcum", h("b", String(oturum.seri)), h("small", "üst üste doğru")));
    }
    function sor() {
      clearTimeout(bekle); clearTimeout(zaman);
      soru = sec(); son = soru; tSon = null;
      kutu.value = ""; kutu.classList.remove("dogru", "yanlis");
      geri.textContent = "";
      hnd && hnd.stop();
      hnd = calTek(soru);
      const benim = hnd;
      hnd.bitti.then(() => { if (hnd === benim) { tSon = performance.now() / 1000; zaman = setTimeout(() => { if (oyun && soru) yanit(null); }, 6000); } });
      kutu.focus();
    }
    function yanit(c) {
      if (!soru) return;
      clearTimeout(zaman);
      const x = istOku(soru);
      x.n++; oturum.n++;
      if (c === soru) {
        const rt = tSon == null ? 0 : Math.max(0, performance.now() / 1000 - tSon);
        x.k++; x.s += rt; oturum.d++; oturum.seri++; oturum.rt.push(rt);
        kutu.classList.add("dogru");
        geri.innerHTML = ""; geri.append(h("span.th-ok", `${soru} ✓ ${fmtNum(rt, 2)} sn`));
        soru = null;
        bekle = setTimeout(sor, 450);
      } else {
        x.h++; oturum.seri = 0;
        kutu.classList.add("yanlis");
        const dogru = soru;
        geri.innerHTML = "";
        geri.append(h("span.th-hata", c ? `${c} değil: ` : "Süre doldu: "), h("b", dogru), " ", h("span.kod", hece(Mors.HEPSI[dogru])));
        soru = null;
        bekle = setTimeout(() => { hnd = calTek(dogru); hnd.bitti.then(() => { if (oyun) bekle = setTimeout(sor, 900); }); }, 350);
      }
      store.set("tek.ist", ist);
      olcYaz(); izgaraKur();
    }
    kutu.addEventListener("input", () => {
      if (!oyun || !soru) { kutu.value = ""; return; }
      const v = Mors.buyuk(kutu.value.slice(-1));
      if (!v.trim()) { kutu.value = ""; return; }
      yanit(v);
    });
    function baslat() {
      Snd.unlock();
      oyun = true; oturum = { n: 0, d: 0, seri: 0, rt: [] };
      basla.setIcon("stop"); basla.setLabel("Bitir");
      olcYaz();
      setTimeout(sor, 200);
    }
    function bitir() {
      oyun = false; soru = null;
      clearTimeout(bekle); clearTimeout(zaman);
      hnd && hnd.stop(); hnd = null;
      basla.setIcon("play"); basla.setLabel("Başla");
      kutu.value = ""; kutu.classList.remove("dogru", "yanlis");
      if (oturum.n) geri.textContent = `Oturum: ${oturum.n} harften ${oturum.d} doğru.`;
    }
    izgaraKur(); olcYaz();
    return { enter() { ist = store.get("tek.ist", {}); izgaraKur(); }, leave() { bitir(); }, toggle() { oyun ? bitir() : baslat(); } };
  };

  /* ================= turkceHarfler ================= */
  window.Demos.turkceHarfler = (stage) => {
    const TR = Object.keys(Mors.TR);
    const RAKAM = "1234567890".split("");
    const NOKTA = [".", ",", "?", "'", "/", "(", ")", ":", "=", "+", "-", '"', "@"];
    const ADLAR = { ".": "nokta", ",": "virgül", "?": "soru", "'": "kesme", "/": "eğik çizgi", "(": "parantez aç", ")": "parantez kapa", ":": "iki nokta", "=": "ayraç (BT)", "+": "artı (AR)", "-": "tire", '"': "tırnak", "@": "et (@)" };
    let soru = null, puan = 0, toplam = 0, hnd = null, bekle = 0;
    const tum = [];
    function grup(baslik, dizi, alt) {
      const iz = h("div.harf-izgara.tr-izgara");
      dizi.forEach((c) => { const b = hucre(c, alt(c), () => tikla(c, b)); tum.push(b); iz.append(b); });
      return h("div.tr-grup", h("h3.tr-baslik", baslik), iz);
    }
    const skor = h("span.tr-skor");
    const quizBtn = L.ibtn("play", "Dinle ve bul", () => (soru ? tekrar() : yeniSoru()), "primary");
    const durBtn = L.btn("Bitir", () => bitir(), "sm ghost");
    durBtn.hidden = true;
    stage.append(h("div.controls", quizBtn, durBtn, skor),
      h("div.scroll.tr-scroll",
        grup("Türkçe harfler", TR, (c) => "telsizde " + Mors.LATIN[c]),
        grup("Rakamlar", RAKAM, () => null),
        grup("Noktalama", NOKTA, (c) => ADLAR[c])));
    function isaretle(b, sinif) { b.classList.add(sinif); setTimeout(() => b.classList.remove(sinif), 900); }
    function tikla(c, b) {
      if (!soru) { hnd && hnd.stop(); hnd = calTek(c); return; }
      toplam++;
      if (c === soru) { puan++; isaretle(b, "tr-dogru"); soru = null; bekle = setTimeout(yeniSoru, 700); }
      else {
        isaretle(b, "tr-yanlis");
        const d = tum.find((x) => x.dataset.harf === soru); d && isaretle(d, "tr-dogru");
        const s = soru; soru = null;
        bekle = setTimeout(() => { hnd = calTek(s); hnd.bitti.then(() => { bekle = setTimeout(yeniSoru, 800); }); }, 300);
      }
      skorYaz();
    }
    function skorYaz() { skor.textContent = toplam ? `${puan} / ${toplam} doğru` : ""; }
    function yeniSoru() {
      clearTimeout(bekle);
      soru = L.sec([...TR, ...RAKAM, ...NOKTA]);
      durBtn.hidden = false;
      quizBtn.setIcon("tekrar"); quizBtn.setLabel("Tekrar çal");
      tekrar();
    }
    function tekrar() { hnd && hnd.stop(); if (soru) hnd = calTek(soru); }
    function bitir() {
      clearTimeout(bekle); soru = null; hnd && hnd.stop();
      durBtn.hidden = true; quizBtn.setIcon("play"); quizBtn.setLabel("Dinle ve bul");
    }
    return { enter() {}, leave() { bitir(); }, toggle() { soru ? tekrar() : yeniSoru(); } };
  };

  /* ================= kelimeler ================= */
  const KELIMELER = {
    CQ: "genel çağrı: herkese", DE: "\"-den\": CQ DE TA1… = TA1…'den herkese", K: "buyurun, cevap verin", "5NN": "599'un kısaltması: kusursuz rapor",
    RST: "sinyal raporu", TU: "teşekkürler", "73": "en iyi dilekler (vedalaşma)", NAME: "adım", QTH: "konumum", RIG: "telsizim", ANT: "antenim",
    WX: "hava durumu", UR: "senin", FB: "harika (fine business)", GM: "günaydın", GE: "iyi akşamlar", PSE: "lütfen", AGN: "tekrar",
    QSL: "aldım, anlaşıldı", QRZ: "beni kim çağırıyor?", HR: "burada", ES: "ve", OP: "operatör", TNX: "teşekkürler", BK: "araya giriyorum / sıra sende",
    QRS: "yavaşla", QRQ: "hızlan", CUL: "görüşürüz", "599": "okunabilirlik 5, güç 9, ton 9", R: "aldım", HW: "nasıl (aldın)?", QRL: "frekans dolu mu?",
  };
  const ONEK = [["TA", 6], ["DL", 1], ["G", 1], ["I", 1], ["K", 1], ["W", 1], ["JA", 1], ["F", 1], ["EA", 1], ["OH", 0.5], ["SP", 0.5], ["UA", 0.5], ["YO", 0.5], ["SV", 0.5], ["VE", 0.5]];
  const HARF = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function cagri() {
    let r = Math.random() * ONEK.reduce((a, b) => a + b[1], 0), on = "TA";
    for (const [p, w] of ONEK) { r -= w; if (r <= 0) { on = p; break; } }
    const rakam = on === "TA" ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10);
    const n = on.length === 1 ? 2 + Math.floor(Math.random() * 2) : on === "TA" ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
    let s = ""; for (let i = 0; i < n; i++) s += HARF[Math.floor(Math.random() * 26)];
    return on + rakam + s;
  }
  window.Demos.kelimeler = (stage) => {
    let tur = store.get("kelime.tur", "cagri");
    let soru = null, dinleme = 0, puan = 0, sira = 0, dogruSay = 0, hnd = null, bekle = 0, aktif = false;
    const TUR_UZ = 10;
    const seg = L.seg([["cagri", "Çağrı işaretleri"], ["kelime", "Telsiz kelimeleri"], ["karisik", "Karışık"]], tur, (k) => { tur = k; store.set("kelime.tur", k); if (aktif) bitir(); }, "Tür");
    const basla = L.ibtn("play", "Başla", () => (aktif ? bitir() : baslat()), "primary");
    const tekrarBtn = L.ibtn("tekrar", "Tekrar dinle", () => tekrar(), "");
    tekrarBtn.disabled = true;
    const kutu = h("input.satir-giris", { type: "text", placeholder: "Duyduğunuzu yazın, Enter", spellcheck: "false", autocomplete: "off", autocapitalize: "characters", maxlength: 16, "aria-label": "Duyduğunuz kelime ya da çağrı işareti" });
    const geri = h("div.kl-geri");
    const olc = h("div.olcumler");
    const liste = h("div.kl-liste");
    stage.append(h("div.controls", seg), h("div.controls", basla, tekrarBtn, h("span.spacer"), h("span.kl-sira")), h("div.controls", kutu), geri, olc, liste);
    const siraEl = stage.querySelector(".kl-sira");
    function olcYaz() {
      const en = store.get("kelime.eniyi." + tur, 0);
      olc.innerHTML = "";
      olc.append(
        h("div.olcum", h("b", String(puan)), h("small", "puan (tur başına en çok " + TUR_UZ * 10 + ")")),
        h("div.olcum", h("b", `${dogruSay}/${sira}`), h("small", "doğru")),
        h("div.olcum", h("b", String(en)), h("small", "en iyi tur")));
      siraEl.textContent = aktif ? `${Math.min(sira + 1, TUR_UZ)}. / ${TUR_UZ}` : "";
    }
    function uret() {
      const t = tur === "karisik" ? (Math.random() < 0.5 ? "cagri" : "kelime") : tur;
      return t === "cagri" ? cagri() : L.sec(Object.keys(KELIMELER));
    }
    function sor() {
      soru = uret(); dinleme = 0;
      kutu.value = ""; kutu.classList.remove("dogru", "yanlis");
      tekrar();
      kutu.focus(); olcYaz();
    }
    function tekrar() {
      if (!soru) return;
      dinleme++;
      hnd && hnd.stop();
      hnd = Snd.cal(soru, { tr: false });
    }
    function yanit() {
      if (!soru) return;
      const y = temizle(kutu.value);
      if (!y) { tekrar(); return; }
      const ok = y === soru;
      sira++;
      const p = ok ? (dinleme <= 1 ? 10 : dinleme === 2 ? 7 : 5) : 0;
      puan += p; if (ok) dogruSay++;
      kutu.classList.add(ok ? "dogru" : "yanlis");
      geri.innerHTML = "";
      geri.append(farkGoster(hizala(soru, y)), h("span.kl-not", ok ? ` +${p}` : " ", KELIMELER[soru] ? h("em", " " + KELIMELER[soru]) : soru.match(/^[A-Z]+\d/) ? h("em", " rastgele çağrı işareti") : ""));
      liste.prepend(h("div.kl-satir" + (ok ? ".ok" : ""), h("b.kod", soru), y !== soru ? h("span", " yazılan: " + (y || "–")) : null));
      while (liste.children.length > 6) liste.lastChild.remove();
      soru = null;
      if (sira >= TUR_UZ) { bekle = setTimeout(turSonu, 900); }
      else bekle = setTimeout(sor, ok ? 900 : 1800);
      olcYaz();
    }
    function turSonu() {
      const k = "kelime.eniyi." + tur;
      const yeni = puan > store.get(k, 0);
      if (yeni) store.set(k, puan);
      geri.innerHTML = "";
      geri.append(h("p.note-msg", `Tur bitti: ${TUR_UZ} sorudan ${dogruSay} doğru, ${puan} puan.${yeni ? " Yeni rekor!" : ""}`));
      bitir(true);
    }
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (aktif) (soru ? yanit() : null); else baslat(); } });
    function baslat() {
      Snd.unlock();
      aktif = true; puan = 0; sira = 0; dogruSay = 0;
      liste.innerHTML = ""; geri.innerHTML = "";
      basla.setIcon("stop"); basla.setLabel("Bitir"); tekrarBtn.disabled = false;
      setTimeout(sor, 150);
    }
    function bitir(sessiz) {
      aktif = false; soru = null; clearTimeout(bekle); hnd && hnd.stop();
      basla.setIcon("play"); basla.setLabel("Başla"); tekrarBtn.disabled = true;
      if (!sessiz) geri.innerHTML = "";
      olcYaz();
    }
    olcYaz();
    return { enter() { olcYaz(); }, leave() { bitir(true); }, toggle() { aktif ? tekrar() : baslat(); } };
  };
})();
