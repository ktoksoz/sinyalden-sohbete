/* 7. Işıkla ve dokunarak: işaret lambası, titreşim ve "ışığı oku" oyunu.
   Işık hızı güvenlik için sınırlı: parlak kipte en fazla 6 wpm (saniyede ≤ 2,5 yanıp sönme), yumuşak kipte 12 wpm. */
(function () {
  const { h, seg, slider, btn, ibtn, store, fmtNum } = L;
  const KELIMELER = ["SOS", "TEA", "SEN", "ATA", "OK", "EV", "KAR", "SU", "ANT", "MORS", "IŞIK", "GEMİ", "DENİZ", "LAMBA", "73"];
  window.Demos.isikTitresim = (stage) => {
    const sheet = h("div.sheet.isik-sheet");
    stage.append(sheet);
    const azHareket = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let kip = store.get("isik.kip", "yumusak"), wpm = Math.min(store.get("isik.wpm", 5), kip === "parlak" ? 6 : 12), sesli = store.get("isik.ses", true);
    const lamba = h("div.lamba" + (kip === "parlak" ? ".parlak" : ""), { "aria-hidden": "true" }, h("div.lamba-cam"));
    const durum = h("p.readout", { "aria-live": "polite" }, "Lamba hazır.");
    const kutu = h("input.satir-giris", { type: "text", value: "SOS", maxlength: 40, spellcheck: "false", autocomplete: "off", "aria-label": "Lambayla gönderilecek mesaj" });
    const gonderBtn = ibtn("play", "Lambayla gönder", () => (calisiyor ? dur() : gonder(kutu.value)), "primary");
    const titBtn = btn("Titreşimle gönder", () => titret(kutu.value));
    const kipSeg = seg([["yumusak", "Yumuşak"], ["parlak", "Parlak"]], kip, (k) => { kip = k; store.set("isik.kip", k); lamba.classList.toggle("parlak", k === "parlak"); hizKur(); }, "Lamba kipi");
    const sesSeg = seg([[true, "Sesli"], [false, "Sessiz"]], sesli, (k) => { sesli = k; store.set("isik.ses", k); }, "Ses");
    let hizSl = null;
    const hizYer = h("span");
    function hizKur() {
      const max = kip === "parlak" ? 6 : 12;
      wpm = Math.min(wpm, max);
      hizSl = slider({ label: "Hız", min: 3, max, value: wpm, fmt: (v) => v + " wpm", oninput: (v) => { wpm = v; store.set("isik.wpm", v); } });
      hizYer.innerHTML = ""; hizYer.append(hizSl);
    }
    hizKur();
    // ışığı oku
    const okuKutu = h("input.satir-giris", { type: "text", maxlength: 12, spellcheck: "false", autocomplete: "off", placeholder: "Gördüğünüz kelime", "aria-label": "Lambada gördüğünüz kelime" });
    const okuSonuc = h("p.readout");
    let gizli = null;
    const okuBtn = btn("Işığı oku: yeni kelime", () => { gizli = L.sec(KELIMELER); okuKutu.value = ""; okuSonuc.textContent = "Lambayı izleyin…"; gonder(gizli, { gizli: true }); });
    okuKutu.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || !gizli) return;
      const c = Mors.buyuk(okuKutu.value.trim());
      okuSonuc.textContent = c === Mors.buyuk(gizli) ? `Doğru: ${gizli}. Gözünüzle çözdünüz!` : `Gönderilen: ${gizli} (${L.kodYaz(Mors.kodla(gizli))}). Bir daha deneyin.`;
      okuKutu.classList.toggle("dogru", c === Mors.buyuk(gizli)); okuKutu.classList.toggle("yanlis", c !== Mors.buyuk(gizli));
      gizli = null;
    });
    const titDestek = typeof navigator.vibrate === "function";
    sheet.append(lamba, durum,
      h("div.controls", kutu, gonderBtn),
      h("div.controls", kipSeg, hizYer, sesSeg),
      h("div.controls", titBtn, h("span.ctl-lab", titDestek ? "Telefonu elinizde tutun." : "Bu tarayıcı titreşimi desteklemiyor (iPhone'da Safari desteklemez).")),
      h("div.isik-oku", h("div.controls", okuBtn), h("div.controls", okuKutu, btn("Kontrol et", () => okuKutu.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })), "sm")), okuSonuc));
    if (!titDestek) titBtn.disabled = true;
    if (azHareket && kip === "parlak") { kip = "yumusak"; kipSeg.set("yumusak"); lamba.classList.remove("parlak"); hizKur(); }

    let calisiyor = false, rafId = 0, hnd = null;
    function gonder(metin, { gizli: g = false } = {}) {
      dur();
      const hs = Mors.harfler(metin, { tr: L.prefs.trHarf });
      if (!hs.length) { L.toast("Gönderilecek harf yok"); return; }
      const o = { wpm, fwpm: null, f: L.prefs.ton };
      const cz = Mors.cizelge(hs, o);
      let t0;
      if (sesli && !g) { hnd = Snd.calCizelge(cz, o); t0 = performance.now() / 1000 + (hnd.sahte ? 0.08 : hnd.t0 - Snd.ctx.currentTime); }
      else t0 = performance.now() / 1000 + 0.4;
      calisiyor = true; gonderBtn.setIcon("stop"); gonderBtn.setLabel("Durdur");
      const adim = () => {
        const t = performance.now() / 1000 - t0;
        let on = false;
        for (const m of cz.isaretler) { if (t >= m.t && t < m.t + m.d) { on = true; break; } if (m.t > t) break; }
        lamba.classList.toggle("on", on);
        if (!g) { let k = -1; cz.harfler.forEach((x, i) => { if (t >= x.t) k = i; }); durum.textContent = k >= 0 && t <= cz.sure ? "Gönderiliyor: " + cz.harfler.slice(0, k + 1).map((x) => x.harf).join("") : "Lamba hazır."; }
        if (t <= cz.sure + 0.05 && calisiyor) rafId = requestAnimationFrame(adim);
        else dur(g);
      };
      rafId = requestAnimationFrame(adim);
    }
    function dur(gizliydi) {
      cancelAnimationFrame(rafId);
      hnd && hnd.stop(); hnd = null;
      calisiyor = false; lamba.classList.remove("on");
      gonderBtn.setIcon("play"); gonderBtn.setLabel("Lambayla gönder");
      if (gizliydi) okuSonuc.textContent = "Ne gördünüz? Yazıp Enter'a basın.";
    }
    function titret(metin) {
      if (!titDestek) return;
      const cz = Mors.cizelge(metin, { wpm: Math.min(wpm, 10), tr: L.prefs.trHarf });
      if (!cz.isaretler.length) return;
      const desen = []; let t = 0;
      cz.isaretler.forEach((m) => { desen.push(Math.round((m.t - t) * 1000), Math.round(m.d * 1000)); t = m.t + m.d; });
      desen[0] = 0;
      navigator.vibrate(desen);
      durum.textContent = "Titreşiyor: " + L.kodYaz(Mors.kodla(metin));
    }
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); gonder(kutu.value); } });
    return {
      leave() { dur(); if (titDestek) navigator.vibrate(0); },
      toggle() { calisiyor ? dur() : gonder(kutu.value); },
    };
  };
})();
