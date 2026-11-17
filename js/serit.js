/* Telgraf şeridi: sitenin imza bileşeni.
   Delikli bir kâğıt şerit; sinyal açıkken şeride pirinç renkli bir iz basılır, çözülen harfler altına yazılır.
   İki kip:
     akis   şerit okuma kafasının altından akar (canlı çalma, elle anahtarlama, mikrofon)
     statik bütün çizelge şeride sığdırılır; isteğe bağlı birim ızgarası ve oynatma imleci
   Serit(kap, {kip, saniye, kafa, saat, birimIzgara, yukseklik, harfYok})
     .cizelge(cz, t0)        çizelgedeki işaretleri ve harfleri ekle (t0: saat cinsinden başlangıç)
     .ac(t) / .kapa(t)       canlı işaret başlat / bitir
     .harf(t, harf, durum)   harf etiketi ekle (durum: "dogru" | "yanlis" | null)
     .imlec(t)               statik kipte oynatma imleci (çizelge zamanı, sn; null: gizle)
     .temizle() .baslat() .durdur() .ciz() */
(function () {
  const { h, C, FONT, rgba } = L;

  window.Serit = function (kap, opts = {}) {
    const o = Object.assign({ kip: "akis", saniye: 5, kafa: 0.72, saat: () => Snd.now(), birimIzgara: false, harfYok: false, gelecekGizli: false }, opts);
    const el = h("div.serit" + (o.kip === "statik" ? ".statik" : ""));
    const cv = h("canvas", { "aria-hidden": "true" });
    el.append(cv);
    kap.append(el);
    let isaretler = [], harfler = [], acik = null, imlecT = null, statikCz = null, aralik = [0, 1];
    let vurgu = -1; // statik kipte vurgulanan harf
    const st = L.canvas(cv, () => ciz());
    const dongu = L.loop(() => ciz());

    function cizelge(cz, t0 = 0) {
      cz.isaretler.forEach((m) => isaretler.push({ a: t0 + m.t, b: t0 + m.t + m.d, tip: m.tip }));
      if (!o.harfYok) cz.harfler.forEach((x) => harfler.push({ t: t0 + x.t, son: t0 + x.son, harf: x.harf, kod: x.kod }));
      if (o.kip === "statik") { statikCz = cz; aralik = [t0, t0 + Math.max(cz.sure, 0.001)]; }
      sinirla();
      ciz();
    }
    function sinirla() { if (isaretler.length > 600) isaretler = isaretler.slice(-400); if (harfler.length > 300) harfler = harfler.slice(-200); }
    function ac(t = o.saat()) { if (!acik) { acik = { a: t, b: null }; isaretler.push(acik); sinirla(); } }
    function kapa(t = o.saat()) { if (acik) { acik.b = t; acik = null; } }
    function harf(t, harfStr, durum = null, son = null) { harfler.push({ t, son: son ?? t, harf: harfStr, durum }); sinirla(); }

    function ciz() {
      const { ctx, w, h: H } = st;
      if (!w) return;
      ctx.clearRect(0, 0, w, H);
      const now = o.saat();
      // şeridin yerleşimi
      const sy = Math.round(H * 0.1), sh = Math.round(H * 0.8);
      const markY = sy + sh * 0.2, markH = Math.max(6, sh * 0.26);
      const delikY = sy + sh * 0.6;
      const harfY = sy + sh * 0.86;
      let x;
      if (o.kip === "akis") {
        const pps = w / o.saniye, kx = w * o.kafa;
        x = (t) => kx + (t - now) * pps;
      } else {
        const pad = 14;
        x = (t) => pad + ((t - aralik[0]) / (aralik[1] - aralik[0])) * (w - 2 * pad);
      }
      // kâğıt
      ctx.fillStyle = C.kagit;
      ctx.fillRect(0, sy, w, sh);
      // şeridin kenarları: kâğıt rengindeki zeminlerde (.sheet) de seçilsin
      ctx.fillStyle = rgba(C.ink, 0.22);
      ctx.fillRect(0, sy, w, 1); ctx.fillRect(0, sy + sh - 1, w, 1);
      ctx.fillStyle = rgba(C.ink, 0.06);
      ctx.fillRect(0, sy + sh, w, 3);
      // ilerleme delikleri: şeritle birlikte akar
      const aralikPx = 13;
      const kayma = o.kip === "akis" ? ((-(now * w) / o.saniye) % aralikPx + aralikPx) % aralikPx : 6;
      ctx.fillStyle = C.delik;
      for (let px = kayma; px < w; px += aralikPx) { ctx.beginPath(); ctx.arc(px, delikY, Math.min(2.6, sh * 0.04), 0, Math.PI * 2); ctx.fill(); }
      // birim ızgarası (statik)
      if (o.birimIzgara && statikCz) {
        const u = statikCz.z.birim;
        const n = Math.round((aralik[1] - aralik[0]) / u);
        const pxu = (x(aralik[0] + u) - x(aralik[0]));
        if (pxu > 3) {
          ctx.strokeStyle = rgba(C.ink, pxu > 8 ? 0.13 : 0.07); ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i <= n; i++) { const xx = Math.round(x(aralik[0] + i * u)) + 0.5; ctx.moveTo(xx, sy + 4); ctx.lineTo(xx, markY + markH + 6); }
          ctx.stroke();
        }
      }
      // işaretler
      isaretler.forEach((m) => {
        if (o.gelecekGizli && o.kip === "akis" && m.a > now) return; // henüz çalınmamış işaret görünmesin
        const b = m.b == null ? now : (o.gelecekGizli && o.kip === "akis" ? Math.min(m.b, now) : m.b);
        const xa = x(m.a), xb = x(b);
        if (xb < -10 || xa > w + 10) return;
        const sesli = o.kip === "akis" ? m.a <= now && b >= now : imlecT != null && imlecT + aralik[0] >= m.a && imlecT + aralik[0] <= b;
        ctx.fillStyle = sesli || m.b == null ? C.pirinc2 : C.pirinc;
        const ww = Math.max(2, xb - xa);
        rr(ctx, xa, markY, ww, markH, Math.min(markH / 2, ww / 2));
        ctx.fill();
        if (sesli) { ctx.fillStyle = rgba(C.pirinc2, 0.25); rr(ctx, xa - 3, markY - 3, ww + 6, markH + 6, markH / 2 + 3); ctx.fill(); }
      });
      // harfler
      const fs = Math.max(11, Math.min(18, sh * 0.2));
      harfler.forEach((x0, i) => {
        const xa = x(x0.t), xb = x(x0.son);
        if (xb < -30 || xa > w + 30) return;
        const renk = x0.durum === "dogru" ? C.dogru : x0.durum === "yanlis" ? C.yanlis : C.ink;
        const cx = (xa + xb) / 2;
        if (o.kip === "statik" && i === vurgu) { ctx.fillStyle = rgba(C.pirinc, 0.18); ctx.fillRect(xa - 4, sy + 2, xb - xa + 8, sh - 4); }
        L.text(ctx, x0.harf, cx, harfY, { size: fs, color: renk, align: "center", base: "middle", weight: 700, font: FONT.mono });
      });
      // okuma kafası / imleç
      let kx = null;
      if (o.kip === "akis") kx = w * o.kafa;
      else if (imlecT != null) kx = x(aralik[0] + imlecT);
      if (kx != null) {
        ctx.fillStyle = C.ink;
        ctx.fillRect(Math.round(kx) - 1, sy - 6, 2, sh + 12);
        ctx.beginPath(); ctx.moveTo(kx - 6, sy - 8); ctx.lineTo(kx + 6, sy - 8); ctx.lineTo(kx, sy - 1); ctx.closePath(); ctx.fill();
      }
      // akışta kafanın sağı henüz gelmemiş şerit: hafif soluk
      if (o.kip === "akis") { ctx.fillStyle = rgba(C.bg, 0.35); ctx.fillRect(w * o.kafa + 1, sy, w, sh); }
    }
    function rr(ctx, x, y, w, hh, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + hh - r); ctx.arcTo(x + w, y + hh, x + w - r, y + hh, r);
      ctx.lineTo(x + r, y + hh); ctx.arcTo(x, y + hh, x, y + hh - r, r);
      ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
    }
    window.addEventListener("themechange", () => ciz());
    return {
      el, cizelge, ac, kapa, harf, ciz,
      imlec(t) { imlecT = t; ciz(); },
      vurgula(i) { vurgu = i; ciz(); },
      temizle() { isaretler = []; harfler = []; acik = null; imlecT = null; vurgu = -1; ciz(); },
      baslat() { dongu.start(); }, durdur() { dongu.stop(); ciz(); },
      set saniye(v) { o.saniye = v; }, get saniye() { return o.saniye; },
      get harfler() { return harfler; },
      x2t(px) { // statik kipte piksel → çizelge zamanı
        const pad = 14; return ((px - pad) / (st.w - 2 * pad)) * (aralik[1] - aralik[0]);
      },
    };
  };

  /* Çalar: metin kutusu + Çal/Durdur + akan şerit. Birçok deneyin ortak parçası.
     Serit.Calar(kap, {metin, ipucu, duzenle, saniye, onHarf, sinif}) → {el, serit, cal(metin), durdur(), kutu, toggle, leave} */
  window.Serit.Calar = function (kap, opts = {}) {
    const o = Object.assign({ metin: "", ipucu: "Bir şey yazın", duzenle: true, saniye: 5, sinif: "" }, opts);
    const el = h("div.calar");
    const kutu = h("input.satir-giris", { type: "text", value: o.metin, placeholder: o.ipucu, "aria-label": "Çalınacak metin", maxlength: 120, spellcheck: "false", autocomplete: "off" });
    if (!o.duzenle) kutu.hidden = true;
    const calBtn = L.ibtn("play", "Çal", () => (cal_ ? durdur() : cal()), "primary");
    el.append(h("div.controls", kutu, calBtn));
    kap.append(el);
    const serit = window.Serit(el, { saniye: o.saniye });
    if (o.sinif) serit.el.classList.add(...o.sinif.split(" "));
    let cal_ = null;
    kutu.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); cal(); } });
    function cal(metin) {
      durdur();
      const m = metin != null ? metin : kutu.value;
      if (!Mors.harfler(m).length) { L.toast("Çalınacak harf yok: harf ya da rakam yazın"); return null; }
      const hnd = Snd.cal(m);
      cal_ = hnd;
      serit.cizelge(hnd.cz, hnd.t0);
      serit.baslat();
      calBtn.setIcon("stop"); calBtn.setLabel("Durdur");
      hnd.bitti.then(() => { if (cal_ === hnd) { cal_ = null; calBtn.setIcon("play"); calBtn.setLabel("Çal"); setTimeout(() => { if (!cal_) serit.durdur(); }, 2500); } });
      o.onCal && o.onCal(hnd);
      return hnd;
    }
    function durdur() { if (cal_) { cal_.stop(); cal_ = null; } calBtn.setIcon("play"); calBtn.setLabel("Çal"); }
    return { el, serit, kutu, cal, durdur, toggle() { cal_ ? durdur() : cal(); }, leave() { durdur(); serit.durdur(); }, get caliyor() { return !!cal_; } };
  };

  /* Çalarken statik şeridin imlecini ve harf vurgusunu yürüt. Dönüş: durdurma fonksiyonu */
  window.Serit.izle = function (serit, handle, onHarf) {
    let id = 0, son = -1;
    function adim() {
      const t = handle.saat();
      serit.imlec(Math.max(0, t));
      const hs = handle.cz.harfler;
      let i = -1; for (let k = 0; k < hs.length; k++) if (t >= hs[k].t) i = k;
      if (i !== son) { son = i; serit.vurgula(i); onHarf && onHarf(i); }
      if (!handle.durdu && t <= handle.sure + 0.05) id = requestAnimationFrame(adim);
      else { serit.imlec(null); serit.vurgula(-1); onHarf && onHarf(-1); }
    }
    id = requestAnimationFrame(adim);
    return () => { cancelAnimationFrame(id); serit.imlec(null); serit.vurgula(-1); };
  };
})();
