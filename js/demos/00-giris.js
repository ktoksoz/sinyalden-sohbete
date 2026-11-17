/* 0. Giriş: kapak.
   Başlık harf harf kurulur, her harfin altında kodu durur. Kapak açıkken başlık kendi kodunu "gönderir":
   şerit alttan akar, geçen harf pirinç rengine döner. Ses açıksa duyulur (sessizde yalnızca görüntü).
   Kutuya yazılan metin aynı şeritte çalınır. */
(function () {
  const BASLIK = "Sinyalden Sohbete";
  window.Demos.kapak = (stage, slide) => {
    const h1 = slide.querySelector("h1");
    // başlık: kelime → harf → kod
    const hfEls = [];
    BASLIK.split(" ").forEach((k) => {
      const kel = L.h("span.kelime");
      [...k].forEach((c) => {
        const kod = Mors.HEPSI[Mors.buyuk(c)];
        const el = L.h("span.hf", { "aria-hidden": "true" }, c, L.h("i", { html: L.kodSvg(kod, { birim: 6, yuk: 6 }) }));
        kel.append(el); hfEls.push(el);
      });
      h1.append(kel);
    });
    const perf = () => performance.now() / 1000;
    const kap = L.h("div.kapak-serit");
    stage.append(kap);
    const serit = Serit(kap, { saniye: L.narrow() ? 4 : 7, kafa: 0.5, saat: perf });
    serit.el.classList.add("buyuk");

    let aktif = false, timer = 0, hnd = null, izId = 0;
    const kutu = slide.querySelector("#kapak-metin");

    // bir metni gönder: sesli (Snd) ya da sessiz; şerit performance saatiyle çizilir
    function gonder(metin, { baslik = false, sesli = false } = {}) {
      clearTimeout(timer); cancelAnimationFrame(izId);
      hnd && hnd.stop(); hnd = null;
      const o = L.hiz({ wpm: Math.max(L.prefs.wpm, 16), fwpm: null });
      const cz = Mors.cizelge(metin, o);
      let t0;
      if (sesli && Snd.running() && !Snd.muted) {
        hnd = Snd.calCizelge(cz, o);
        t0 = perf() + (hnd.t0 - Snd.ctx.currentTime);
      } else t0 = perf() + 0.3;
      serit.cizelge(cz, t0);
      serit.baslat();
      // başlıktaki harfleri yak
      const izle = () => {
        if (!aktif) return;
        const t = perf() - t0;
        if (baslik) {
          let i = -1; cz.harfler.forEach((x, k) => { if (t >= x.t && t <= x.son + 0.05) i = k; });
          hfEls.forEach((e, k) => e.classList.toggle("on", k === i));
        }
        if (t < cz.sure + 0.3) izId = requestAnimationFrame(izle);
        else { hfEls.forEach((e) => e.classList.remove("on")); timer = setTimeout(() => gonder(BASLIK, { baslik: true }), 3500); }
      };
      izId = requestAnimationFrame(izle);
    }
    function dinle() {
      Snd.unlock();
      const m = kutu.value.trim() || BASLIK;
      // ses bağlamı açılırken kısa bir an bekle
      setTimeout(() => gonder(m, { baslik: m === BASLIK, sesli: true }), Snd.running() ? 0 : 120);
    }
    slide.querySelector("#kapak-dinle").addEventListener("click", dinle);
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); dinle(); } });

    return {
      enter() { aktif = true; timer = setTimeout(() => gonder(BASLIK, { baslik: true }), 600); },
      leave() { aktif = false; clearTimeout(timer); cancelAnimationFrame(izId); hnd && hnd.stop(); serit.durdur(); hfEls.forEach((e) => e.classList.remove("on")); },
      toggle() { dinle(); },
    };
  };
})();
