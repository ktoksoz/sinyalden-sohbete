/* Ses: Web Audio ile mors tonu. Bütün sesler tarayıcıda üretilir; kayıt kullanılmaz.
   Snd.cal(metin, opts)      metni mors olarak çalar; dönüş {t0, sure, cz, stop(), bitti: Promise}
   Snd.calCizelge(cz, opts)  hazır bir çizelgeyi çalar
   Snd.yanTon()              elle anahtarlama için sürekli ton: .ac() / .kapa()
   Snd.gurultu(seviye)       beyaz gürültü (alıcı hışırtısı)
   Ses düzeyi ve sessiz alma localStorage'da hatırlanır. */
(function () {
  const { store } = L;
  let ctx = null, master = null, comp = null;
  let volume = store.get("ses", 0.7), muted = store.get("sessiz", false);
  const dinleyiciler = [];
  const aktifler = new Set();

  function kur() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: "interactive" });
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function unlock() {
    kur();
    if (ctx && ctx.state !== "running") ctx.resume().catch(() => {});
    document.getElementById("sound-hint")?.classList.remove("on");
  }
  // ilk dokunuşta sesi aç
  ["pointerdown", "keydown", "touchend"].forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
  function running() { return !!ctx && ctx.state === "running"; }
  function now() { return ctx ? ctx.currentTime : performance.now() / 1000; }

  function setVolume(v) { volume = v; store.set("ses", v); if (v > 0 && muted) setMuted(false); uygula(); bildir(); }
  function setMuted(m) { muted = m; store.set("sessiz", m); uygula(); bildir(); }
  function uygula() { if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02); }
  function bildir() { dinleyiciler.forEach((f) => f()); }

  /* Bir çizelgeyi tek bir osilatör ve kazanç zarfıyla çalar.
     opts: f (Hz), yukselme (sn; kenar yumuşatma, varsayılan 5 ms), gain, gecikme (sn), cikis (AudioNode) */
  function calCizelge(cz, opts = {}) {
    kur();
    if (!ctx) return sahte(cz, opts);
    unlock();
    const f = opts.f || L.prefs.ton;
    const rise = opts.yukselme != null ? opts.yukselme : 0.005;
    const t0 = ctx.currentTime + (opts.gecikme != null ? opts.gecikme : 0.08);
    const osc = ctx.createOscillator();
    osc.type = "sine"; osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0;
    const A = opts.gain != null ? opts.gain : 0.5;
    cz.isaretler.forEach((m) => {
      const a = t0 + m.t, b = a + m.d;
      const r = Math.min(rise, m.d / 2);
      if (r <= 0.0005) { g.gain.setValueAtTime(A, a); g.gain.setValueAtTime(0, b); return; }
      // yükseltilmiş kosinüse yakın: iki doğrusal rampa (5 ms'de fark duyulmaz)
      g.gain.setValueAtTime(0, a);
      g.gain.linearRampToValueAtTime(A, a + r);
      g.gain.setValueAtTime(A, b - r);
      g.gain.linearRampToValueAtTime(0, b);
    });
    osc.connect(g); g.connect(opts.cikis || master);
    osc.start(t0); osc.stop(t0 + cz.sure + 0.05);
    let coz;
    const bitti = new Promise((r) => (coz = r));
    const h = { t0, sure: cz.sure, cz, f, durdu: false, bitti, saat: () => ctx.currentTime - t0,
      stop() { if (h.durdu) return; h.durdu = true; try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.004); osc.stop(ctx.currentTime + 0.03); } catch (e) {} aktifler.delete(h); coz(false); } };
    osc.onended = () => { aktifler.delete(h); if (!h.durdu) { h.durdu = true; coz(true); } };
    aktifler.add(h);
    return h;
  }
  // Web Audio yoksa (ya da henüz açılmadıysa) zamanlamayı sessizce taklit et
  function sahte(cz, opts) {
    const t0 = performance.now() / 1000 + 0.08;
    let coz; const bitti = new Promise((r) => (coz = r));
    const id = setTimeout(() => { h.durdu = true; coz(true); }, (cz.sure + 0.1) * 1000);
    const h = { t0, sure: cz.sure, cz, sahte: true, bitti, saat: () => performance.now() / 1000 - t0, stop() { clearTimeout(id); h.durdu = true; coz(false); } };
    return h;
  }
  function cal(metin, opts = {}) {
    const o = L.hiz(opts);
    const cz = Mors.cizelge(metin, o);
    return calCizelge(cz, o);
  }
  function hepsiniDurdur() { [...aktifler].forEach((h) => h.stop()); }

  /* Elle anahtarlama için yan ton (sidetone): açık kaldıkça çalar */
  function yanTon(opts = {}) {
    kur(); unlock();
    if (!ctx) return { ac() {}, kapa() {}, kapat() {}, set f(v) {} };
    const osc = ctx.createOscillator();
    osc.frequency.value = opts.f || L.prefs.ton;
    const g = ctx.createGain(); g.gain.value = 0;
    osc.connect(g); g.connect(master); osc.start();
    const A = opts.gain || 0.45;
    return {
      ac() { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(A, ctx.currentTime, 0.0015); },
      kapa() { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.0015); },
      kapat() { try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.003); osc.stop(ctx.currentTime + 0.05); } catch (e) {} },
      set f(v) { osc.frequency.setTargetAtTime(v, ctx.currentTime, 0.01); },
    };
  }

  /* Beyaz gürültü kaynağı (döngüde). Dönüş {node (çıkış kazancı), seviye(v), kapat()} */
  let gurultuBuf = null;
  function gurultu(seviye = 0.1, cikis) {
    kur(); unlock();
    if (!ctx) return { seviye() {}, kapat() {} };
    if (!gurultuBuf) {
      gurultuBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = gurultuBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(); src.buffer = gurultuBuf; src.loop = true;
    const g = ctx.createGain(); g.gain.value = seviye;
    src.connect(g); g.connect(cikis || master); src.start();
    return { node: g, seviye(v) { g.gain.setTargetAtTime(v, ctx.currentTime, 0.03); }, kapat() { try { g.gain.setTargetAtTime(0, ctx.currentTime, 0.02); src.stop(ctx.currentTime + 0.1); } catch (e) {} } };
  }

  // Sekme gizlenince sesi durdur
  document.addEventListener("visibilitychange", () => { if (document.hidden) hepsiniDurdur(); });

  window.Snd = {
    get ctx() { return kur(); }, get master() { kur(); return master; },
    unlock, running, now, cal, calCizelge, yanTon, gurultu, hepsiniDurdur,
    get volume() { return volume; }, get muted() { return muted; }, setVolume, setMuted,
    onChange(f) { dinleyiciler.push(f); },
  };
})();
