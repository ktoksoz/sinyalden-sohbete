/* 3. Sinyalin fiziği: deneyler
   - cw:     anahtar durumu + taşıyıcı dalga (osiloskop gibi), gerçek hız ya da yavaş çekim
   - tik:    yükselme süresi → anahtarlanmış tonun FFT spektrumu ve −40 dB genişliği; dinle
   - darBant: gürültüde zayıf mors + iki katlı bant geçiren süzgeç; kuramsal SNR kazancı
   - bfo:    sinyal ile BFO'nun karışımı: vuru zarfı ve fark tonu */
(function () {
  const { h, C, FONT, rgba, fmtNum } = L;

  /* --- FFT (radix-2, yerinde) --- */
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k];
          const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
          const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi;
          re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  // kenar yumuşatmalı zarf (audio.js'deki gibi doğrusal rampa)
  function zarf(cz, t, r) {
    for (const m of cz.isaretler) {
      if (t < m.t || t > m.t + m.d) continue;
      if (r <= 0.0005) return 1;
      const rr = Math.min(r, m.d / 2);
      return Math.min(1, (t - m.t) / rr, (m.t + m.d - t) / rr);
    }
    return 0;
  }

  /* ================= cw ================= */
  window.Demos.cw = (stage) => {
    const kap = h("div.sheet.cw-kap");
    const cv = h("canvas");
    kap.append(cv);
    const kutu = h("input.satir-giris", { type: "text", value: "CQ", maxlength: 20, spellcheck: "false", "aria-label": "Gönderilecek metin" });
    let hiz = 1;
    const sg = L.seg([[1, "Gerçek hız"], [0.08, "Yavaş çekim"]], hiz, (v) => { hiz = v; if (oynuyor) baslat(); }, "Hız");
    const calBtn = L.ibtn("play", "Gönder", () => (oynuyor ? durdur() : baslat()), "primary");
    const bilgi = h("p.cw-bilgi");
    stage.append(h("div.controls", kutu, calBtn), h("div.controls", sg), kap, bilgi);
    const st = L.canvas(cv, () => ciz());
    let cz = Mors.cizelge("CQ", L.hiz({ fwpm: null })), t0 = 0, hnd = null, oynuyor = false, son = Math.min(cz.sure, 1.0);
    const dongu = L.loop(() => ciz());
    const perf = () => performance.now() / 1000;
    function zaman() { return oynuyor ? (perf() - t0) * hiz : son; }
    function baslat() {
      durdur(true);
      const o = L.hiz({ fwpm: null });
      cz = Mors.cizelge(kutu.value || "CQ", o);
      if (!cz.isaretler.length) { L.toast("Harf ya da rakam yazın"); return; }
      t0 = perf() + 0.1;
      if (hiz === 1) { hnd = Snd.calCizelge(cz, o); t0 = perf() + (hnd.t0 - Snd.now()); }
      oynuyor = true; dongu.start();
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      const nokta = cz.z.nokta;
      bilgi.textContent = `Bir nokta ${fmtNum(nokta * 1000)} ms. 7,030 MHz'te bu sürede taşıyıcı ${fmtNum(7.03e6 * nokta)} kez salınır.`;
    }
    function durdur(sessiz) {
      if (hnd) { hnd.stop(); hnd = null; }
      if (oynuyor) son = zaman();
      oynuyor = false; dongu.stop();
      calBtn.setIcon("play"); calBtn.setLabel("Gönder");
      if (!sessiz) ciz();
    }
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); baslat(); } });
    function ciz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const t = zaman();
      if (cz && oynuyor && t > cz.sure + 0.4 * (hiz === 1 ? 1 : 0.2)) { durdur(); }
      // pencere: gerçek hızda 1,2 sn, yavaş çekimde 0,12 sn
      const pen = hiz === 1 ? 1.2 : 0.12;
      const sol = 64, sag = w - 14;
      const xOf = (tt) => sol + ((tt - (t - pen * 0.8)) / pen) * (sag - sol);
      const y1 = H * 0.24, y2 = H * 0.68, amp = H * 0.2;
      L.text(ctx, "anahtar", 8, y1 - 18, { size: 11, color: C.muted, weight: 600 });
      L.text(ctx, "anten", 8, y2 - amp - 6, { size: 11, color: C.muted, weight: 600 });
      // eksenler
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sol, y1); ctx.lineTo(sag, y1); ctx.moveTo(sol, y2); ctx.lineTo(sag, y2); ctx.stroke();
      if (!cz) { L.text(ctx, "Gönder'e basın", w / 2, H / 2, { size: 15, color: C.muted, align: "center" }); return; }
      // anahtar durumu
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
      const N = Math.max(200, Math.floor(sag - sol));
      for (let i = 0; i <= N; i++) {
        const x = sol + (i / N) * (sag - sol);
        const tt = t - pen * 0.8 + (i / N) * pen;
        const v = tt <= t ? zarf(cz, tt, 0) : 0;
        const y = y1 - v * 22;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      // taşıyıcı: görsel frekans (gerçek hızda nokta başına ~6 salınım, yavaş çekimde ~3)
      const f = hiz === 1 ? 6 / cz.z.nokta : 2.5 / (cz.z.nokta * 0.1);
      ctx.strokeStyle = C.pirinc; ctx.lineWidth = 1.6; ctx.beginPath();
      const M = Math.floor((sag - sol) * 1.5);
      for (let i = 0; i <= M; i++) {
        const tt = t - pen * 0.8 + (i / M) * pen;
        const x = sol + (i / M) * (sag - sol);
        const v = tt <= t ? zarf(cz, tt, 0.005) : 0;
        const y = y2 - v * amp * Math.sin(2 * Math.PI * f * tt);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      // şimdi çizgisi
      const xn = xOf(t);
      ctx.fillStyle = rgba(C.ink, 0.5); ctx.fillRect(xn, y1 - 34, 1.5, y2 + amp + 10 - (y1 - 34));
      // harf etiketleri
      cz.harfler.forEach((x0) => {
        if (x0.t > t) return;
        const xa = xOf(x0.t), xb = xOf(x0.son);
        if (xb < sol || xa > sag) return;
        L.text(ctx, x0.harf, (xa + xb) / 2, H - 10, { size: 14, color: C.ink, align: "center", weight: 700, font: FONT.mono });
      });
    }
    window.addEventListener("themechange", () => ciz());
    return { enter() { ciz(); }, leave() { durdur(true); }, toggle() { oynuyor ? durdur() : baslat(); } };
  };

  /* ================= tik ================= */
  window.Demos.tik = (stage) => {
    let r = 0.005;
    const sr = 8000, N = 16384, f0 = 600;
    const kap = h("div.sheet.tik-kap"); const cv = h("canvas"); kap.append(cv);
    const dalgaKap = h("div.sheet.tik-dalga"); const cv2 = h("canvas"); dalgaKap.append(cv2);
    const okuma = h("div.olcumler");
    const sl = L.slider({ label: "Yükselme süresi", min: 0, max: 15, step: 0.5, value: 5, fmt: (v) => fmtNum(v, 1) + " ms", oninput: (v) => { r = v / 1000; hesapla(); } });
    const dinle = L.ibtn("play", "Dinle", () => cal(), "primary");
    stage.append(h("div.controls", sl, dinle), okuma, kap, dalgaKap);
    const st = L.canvas(cv, () => ciz()), st2 = L.canvas(cv2, () => ciz2());
    const cz = Mors.cizelge("T", { wpm: 20 }); // tek bir çizgi: düzgün, tarak dişsiz bir spektrum
    let spek = null, genislik = 0;
    let hnd = null;
    function hesapla() {
      const re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        const t = i / sr;
        re[i] = zarf(cz, t - 0.9, r) * Math.sin(2 * Math.PI * f0 * t);
      }
      fft(re, im);
      const bins = N / 2;
      spek = new Float32Array(bins);
      let mx = 1e-20;
      for (let k = 0; k < bins; k++) { spek[k] = re[k] * re[k] + im[k] * im[k]; if (spek[k] > mx) mx = spek[k]; }
      // yumuşatılmış dB
      const db = new Float32Array(bins);
      for (let k = 0; k < bins; k++) {
        let s = 0, n = 0;
        for (let j = -6; j <= 6; j++) { const q = spek[k + j]; if (q != null) { s += q; n++; } }
        db[k] = 10 * Math.log10(s / n / mx + 1e-12);
      }
      spek = db;
      // −40 dB genişliği
      const hz = (k) => (k * sr) / N;
      let lo = Math.round((f0 * N) / sr), hi = lo;
      for (let k = 0; k < bins; k++) if (db[k] > -40) { lo = Math.min(lo, k); hi = Math.max(hi, k); }
      genislik = hz(hi) - hz(lo);
      okuma.innerHTML = "";
      okuma.append(
        h("div.olcum", h("b", fmtNum(genislik) + " Hz"), h("small", "−40 dB'deki genişlik")),
        h("div.olcum", h("b", r === 0 ? "sert" : fmtNum(r * 1000, 1) + " ms"), h("small", r < 0.002 ? "tık duyulur" : r > 0.01 ? "yumuşak; hızda yuvarlanır" : "temiz kenar")));
      ciz(); ciz2();
    }
    function ciz() {
      const { ctx, w, h: H } = st; if (!w || !spek) return;
      ctx.clearRect(0, 0, w, H);
      const sol = 40, sag = w - 10, ust = 14, alt = H - 26;
      const fLo = 0, fHi = 1200;
      const x = (f) => sol + ((f - fLo) / (fHi - fLo)) * (sag - sol);
      const y = (db) => ust + (Math.min(0, Math.max(-80, db)) / -80) * (alt - ust);
      // ızgara
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      for (let d = 0; d >= -80; d -= 20) { ctx.beginPath(); ctx.moveTo(sol, y(d)); ctx.lineTo(sag, y(d)); ctx.stroke(); L.text(ctx, d + " dB", sol - 4, y(d) + 4, { size: 10, color: C.muted, align: "right" }); }
      for (let f = 0; f <= 1200; f += 200) L.text(ctx, f + " Hz", x(f), H - 8, { size: 10, color: C.muted, align: "center" });
      // −40 dB bandı
      const bins = spek.length;
      let lo = -1, hi = -1;
      for (let k = 0; k < bins; k++) { const f = (k * sr) / N; if (f > fHi) break; if (spek[k] > -40) { if (lo < 0) lo = f; hi = f; } }
      if (lo >= 0) { ctx.fillStyle = rgba(C.pirinc2, 0.22); ctx.fillRect(x(lo), ust, x(hi) - x(lo), alt - ust); }
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.pirinc; ctx.beginPath(); ctx.moveTo(sol, y(-40)); ctx.lineTo(sag, y(-40)); ctx.stroke(); ctx.setLineDash([]);
      // spektrum
      ctx.beginPath(); ctx.moveTo(x(0), alt);
      for (let k = 0; k < bins; k++) { const f = (k * sr) / N; if (f > fHi) break; ctx.lineTo(x(f), y(spek[k])); }
      ctx.lineTo(x(fHi), alt); ctx.closePath();
      ctx.fillStyle = rgba(C.ink, 0.1); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    }
    function ciz2() {
      const { ctx, w, h: H } = st2; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      // tek bir noktanın başlangıcı, 30 ms'lik pencere
      const m = cz.isaretler[0];
      const ta = m.t - 0.004, tb = m.t + 0.026; // ilk çizginin başı
      ctx.strokeStyle = C.pirinc; ctx.lineWidth = 1.4; ctx.beginPath();
      const n = Math.floor(w);
      for (let i = 0; i <= n; i++) {
        const t = ta + (i / n) * (tb - ta);
        const v = zarf(cz, t, r) * Math.sin(2 * Math.PI * f0 * t);
        const yy = H / 2 - v * (H * 0.38);
        i ? ctx.lineTo(i, yy) : ctx.moveTo(i, yy);
      }
      ctx.stroke();
      L.text(ctx, "bir noktanın başlangıcı (30 ms)", 8, 14, { size: 11, color: C.muted, weight: 600 });
    }
    function cal() {
      hnd && hnd.stop();
      hnd = Snd.calCizelge(Mors.cizelge("EEEE TEST", { wpm: 22 }), { yukselme: r, f: f0 });
    }
    hesapla();
    window.addEventListener("themechange", () => { ciz(); ciz2(); });
    return { enter() { ciz(); ciz2(); }, leave() { hnd && hnd.stop(); }, toggle: cal };
  };

  /* ================= dar bant ================= */
  window.Demos.darBant = (stage) => {
    let B = 3000, sinyalDb = -12;
    const f0 = () => L.prefs.ton;
    const kap = h("div.sheet.db-kap"); const cv = h("canvas"); kap.append(cv);
    const okuma = h("div.olcumler");
    const logB = (v) => Math.round(Math.exp(Math.log(50) + (v / 100) * (Math.log(3000) - Math.log(50))) / 10) * 10 || 50;
    const sl = L.slider({ label: "Süzgeç genişliği", min: 0, max: 100, step: 1, value: 100, fmt: (v) => L.fmtHz(logB(v)), oninput: (v) => { B = Math.max(50, logB(v)); uygula(); } });
    const sl2 = L.slider({ label: "Sinyal gücü", min: -24, max: 0, step: 1, value: sinyalDb, fmt: (v) => v + " dB", oninput: (v) => { sinyalDb = v; uygula(); } });
    const calBtn = L.ibtn("play", "Çal", () => (calisiyor ? durdur() : baslat()), "primary");
    stage.append(h("div.controls", calBtn, sl), h("div.controls", sl2), okuma, kap);
    const st = L.canvas(cv, () => ciz());
    let calisiyor = false, graf = null, hnd = null, timer = 0;
    function kur() {
      const ctx = Snd.ctx; if (!ctx) return null;
      const giris = ctx.createGain();
      const sinyal = ctx.createGain();
      const s1 = ctx.createBiquadFilter(), s2 = ctx.createBiquadFilter();
      [s1, s2].forEach((s) => { s.type = "bandpass"; });
      const cikis = ctx.createGain();
      sinyal.connect(giris);
      giris.connect(s1); s1.connect(s2); s2.connect(cikis); cikis.connect(Snd.master);
      const gur = Snd.gurultu(0.25, giris);
      return { ctx, giris, sinyal, s1, s2, cikis, gur };
    }
    function uygula() {
      if (graf) {
        // iki katlı süzgecin −3 dB genişliği tek katlınınkinin ~%64'ü: Q'yu buna göre ayarla
        const Q = f0() / (B / 0.64);
        [graf.s1, graf.s2].forEach((s) => { s.frequency.setTargetAtTime(f0(), graf.ctx.currentTime, 0.02); s.Q.setTargetAtTime(Math.max(0.05, Q), graf.ctx.currentTime, 0.03); });
        graf.sinyal.gain.setTargetAtTime(Math.pow(10, sinyalDb / 20) * 0.5, graf.ctx.currentTime, 0.03);
        // dar süzgeçte gürültü sessizleşir; toplam gürlük çok düşmesin diye hafif telafi
        graf.cikis.gain.setTargetAtTime(Math.min(4, Math.pow(3000 / B, 0.25)), graf.ctx.currentTime, 0.05);
      }
      const kazanc = 10 * Math.log10(3000 / B);
      const snr = sinyalDb + 6 + kazanc; // ölçek: 3 kHz'lik bantta 0 dB sinyal ≈ +6 dB SNR (yaklaşık, gösterim için)
      okuma.innerHTML = "";
      okuma.append(
        h("div.olcum", h("b", "+" + fmtNum(kazanc, 1) + " dB"), h("small", "3 kHz'e göre kazanç")),
        h("div.olcum", h("b", L.fmtHz(B)), h("small", "süzgeç genişliği")),
        h("div.olcum", h("b", snr > 6 ? "rahat" : snr > -3 ? "zor" : "gürültüde"), h("small", "sinyalin durumu")));
      ciz();
    }
    function tekrar() {
      if (!calisiyor || !graf) return;
      const o = L.hiz({ fwpm: null, wpm: 16 });
      hnd = Snd.calCizelge(Mors.cizelge("CQ CQ DE TA1XYZ", o), Object.assign({}, o, { cikis: graf.sinyal, gain: 1 }));
      hnd.bitti.then((tam) => { if (tam && calisiyor) timer = setTimeout(tekrar, 900); });
    }
    function baslat() {
      Snd.unlock();
      graf = kur(); if (!graf) return;
      calisiyor = true; uygula(); tekrar();
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
    }
    function durdur() {
      calisiyor = false; clearTimeout(timer);
      hnd && hnd.stop(); hnd = null;
      if (graf) { graf.gur.kapat(); const g = graf; setTimeout(() => { try { g.cikis.disconnect(); } catch (e) {} }, 200); graf = null; }
      calBtn.setIcon("play"); calBtn.setLabel("Çal");
    }
    function ciz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const sol = 16, sag = w - 16, alt = H - 26, ust = 16;
      const fHi = 3200;
      const x = (f) => sol + (f / fHi) * (sag - sol);
      // gürültü tabanı
      const tabanY = alt - (alt - ust) * 0.32;
      ctx.fillStyle = rgba(C.ink, 0.12);
      ctx.beginPath(); ctx.moveTo(sol, alt);
      for (let px = sol; px <= sag; px += 3) ctx.lineTo(px, tabanY + Math.sin(px * 1.7) * 3 + Math.sin(px * 0.37) * 2);
      ctx.lineTo(sag, alt); ctx.closePath(); ctx.fill();
      // süzgeç geçirgen bölgesi
      const lo = Math.max(0, f0() - B / 2), hi = f0() + B / 2;
      ctx.fillStyle = rgba(C.pirinc2, 0.12); ctx.fillRect(x(lo), ust, x(hi) - x(lo), alt - ust);
      ctx.strokeStyle = C.pirinc; ctx.lineWidth = 1.5; ctx.strokeRect(x(lo) + 0.5, ust + 0.5, x(hi) - x(lo) - 1, alt - ust - 1);
      // geçen gürültü: koyu
      ctx.save(); ctx.beginPath(); ctx.rect(x(lo), ust, x(hi) - x(lo), alt - ust); ctx.clip();
      ctx.fillStyle = rgba(C.ink, 0.26);
      ctx.beginPath(); ctx.moveTo(sol, alt);
      for (let px = sol; px <= sag; px += 3) ctx.lineTo(px, tabanY + Math.sin(px * 1.7) * 3 + Math.sin(px * 0.37) * 2);
      ctx.lineTo(sag, alt); ctx.closePath(); ctx.fill(); ctx.restore();
      // sinyal çizgisi
      const sy = alt - (alt - ust) * (0.32 + 0.6 * ((sinyalDb + 24) / 24) * 0.9 + 0.05);
      ctx.strokeStyle = C.pirinc; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x(f0()), alt); ctx.lineTo(x(f0()), sy); ctx.stroke();
      L.text(ctx, "sinyal", x(f0()) + 6, sy + 4, { size: 11, color: C.pirinc, weight: 700 });
      L.text(ctx, "gürültü", sag - 4, tabanY - 8, { size: 11, color: C.muted, align: "right", weight: 600 });
      for (let f = 0; f <= 3000; f += 500) L.text(ctx, f === 0 ? "0" : fmtNum(f / 1000, 1) + " kHz", x(f), H - 8, { size: 10, color: C.muted, align: "center" });
    }
    uygula();
    window.addEventListener("themechange", () => ciz());
    window.addEventListener("prefchange", () => uygula());
    return { enter() { ciz(); }, leave() { durdur(); }, toggle() { calisiyor ? durdur() : baslat(); } };
  };

  /* ================= bfo ================= */
  window.Demos.bfo = (stage) => {
    let df = 600;
    const kap = h("div.sheet.bfo-kap"); const cv = h("canvas"); kap.append(cv);
    const okuma = h("div.olcumler");
    const sl = L.slider({ label: "BFO kayması", min: -1200, max: 1200, step: 10, value: -600, fmt: (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmtNum(Math.abs(v)) + " Hz", oninput: (v) => { df = Math.abs(v); bfoF = v; guncelle(); } });
    let bfoF = -600;
    const dinleBtn = L.ibtn("play", "Sürekli ton", () => (osc ? sus() : dinle()), "primary");
    const morsBtn = L.btn("Mors çal", () => { sus(); if (df < 30) { L.toast("Sıfır vuru: duyulacak ton yok"); return; } Snd.cal("CQ TEST", { f: df }); });
    stage.append(h("div.controls", sl), h("div.controls", dinleBtn, morsBtn), okuma, kap);
    const st = L.canvas(cv, () => ciz());
    let osc = null, g = null, faz = 0;
    const dongu = L.loop((dt) => { faz += dt; ciz(); });
    function guncelle() {
      okuma.innerHTML = "";
      const sinyal = 7030000, bfo = sinyal + bfoF;
      okuma.append(
        h("div.olcum", h("b", fmtNum(sinyal / 1e6, 6).replace(/0+$/, "") + " MHz"), h("small", "gelen sinyal")),
        h("div.olcum", h("b", fmtNum(bfo / 1e6, 6) + " MHz"), h("small", "BFO")),
        h("div.olcum" + (df < 30 ? ".sifir" : ""), h("b", df < 30 ? "sıfır vuru" : fmtNum(df) + " Hz"), h("small", "duyulan ton")));
      if (osc) osc.frequency.setTargetAtTime(Math.max(df, 1), Snd.ctx.currentTime, 0.02);
      if (g) g.gain.setTargetAtTime(df < 30 ? 0 : 0.3, Snd.ctx.currentTime, 0.02);
      ciz();
    }
    function dinle() {
      Snd.unlock(); const ctx = Snd.ctx; if (!ctx) return;
      osc = ctx.createOscillator(); g = ctx.createGain(); g.gain.value = 0;
      osc.frequency.value = Math.max(df, 1); osc.connect(g); g.connect(Snd.master); osc.start();
      g.gain.setTargetAtTime(df < 30 ? 0 : 0.3, ctx.currentTime, 0.02);
      dinleBtn.setIcon("stop"); dinleBtn.setLabel("Sustur");
    }
    function sus() {
      if (osc) { const o = osc, gg = g; gg.gain.setTargetAtTime(0, Snd.ctx.currentTime, 0.02); setTimeout(() => { try { o.stop(); } catch (e) {} }, 150); }
      osc = null; g = null; dinleBtn.setIcon("play"); dinleBtn.setLabel("Sürekli ton");
    }
    function ciz() {
      const { ctx, w, h: H } = st; if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const sol = 8, sag = w - 8;
      const rows = [H * 0.16, H * 0.4, H * 0.75];
      const amp = H * 0.08;
      // görsel ölçek: taşıyıcı ekranda ~40 salınım, fark ekranda df/120 vuru
      const fA = 40, fB = 40 + (bfoF / 1200) * 8 * Math.sign(1);
      const kay = faz * 0.15;
      const n = Math.floor(sag - sol);
      const iz = (fn, y0, a, renk, lw) => {
        ctx.strokeStyle = renk; ctx.lineWidth = lw; ctx.beginPath();
        for (let i = 0; i <= n; i++) { const u = i / n + kay; const v = fn(u); const yy = y0 - v * a; i ? ctx.lineTo(sol + i, yy) : ctx.moveTo(sol + i, yy); }
        ctx.stroke();
      };
      L.text(ctx, "gelen sinyal", sol, rows[0] - amp - 6, { size: 11, color: C.muted, weight: 600 });
      iz((u) => Math.sin(2 * Math.PI * fA * u), rows[0], amp, C.ink2, 1.2);
      L.text(ctx, "alıcının BFO'su", sol, rows[1] - amp - 6, { size: 11, color: C.muted, weight: 600 });
      iz((u) => Math.sin(2 * Math.PI * fB * u), rows[1], amp, C.mavi, 1.2);
      L.text(ctx, "karışım: kabarıp sönme hızı = duyulan ton", sol, rows[2] - amp * 2.2 - 6, { size: 11, color: C.muted, weight: 600 });
      iz((u) => (Math.sin(2 * Math.PI * fA * u) + Math.sin(2 * Math.PI * fB * u)) / 2, rows[2], amp * 2, C.pirinc, 1.2);
      // zarf
      ctx.strokeStyle = rgba(C.pirinc, 0.6); ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
      [1, -1].forEach((sgn) => {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) { const u = i / n + kay; const v = Math.abs(Math.cos(Math.PI * (fA - fB) * u)); const yy = rows[2] - sgn * v * amp * 2; i ? ctx.lineTo(sol + i, yy) : ctx.moveTo(sol + i, yy); }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    guncelle();
    window.addEventListener("themechange", () => ciz());
    return { enter() { dongu.start(); }, leave() { dongu.stop(); sus(); }, toggle() { osc ? sus() : dinle(); } };
  };
})();
