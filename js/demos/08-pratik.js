/* 8. Pratik: günlük plan (sayaçlı adımlar + ilerleme özeti) ve kapanış telgrafı.
   İlerleme 4. ve 5. bölüm araçlarının localStorage kayıtlarından okunur:
     koch.ders, koch.gecmis [{t, ders, d, wpm}], tek.ist {harf: {n, k, h, s}}, kelime.eniyi.<tür>, gonderme.enIyi, gonderme.gecmis */
(function () {
  const { h, seg, btn, ibtn, store, fmtNum } = L;
  const PLANLAR = {
    10: [["tek-harf", "Isınma: tek harf", 2], ["koch-alistirma", "Koch dersi", 6], ["gonderme-alistirma", "Gönderme", 2]],
    20: [["tek-harf", "Isınma: tek harf", 3], ["koch-alistirma", "Koch dersi", 10], ["kelimeler", "Kelimeler ve çağrı işaretleri", 4], ["gonderme-alistirma", "Gönderme", 3]],
    30: [["tek-harf", "Isınma: tek harf", 3], ["koch-alistirma", "Koch dersi", 12], ["kelimeler", "Kelimeler ve çağrı işaretleri", 5], ["gonderme-alistirma", "Gönderme", 5], ["qso", "Görüşme dinleme", 5]],
  };
  // plan sayacı slayttan bağımsız sürer
  const plan = { sure: null, adim: -1, kalan: 0, id: 0, dinleyici: null };
  function planTik() {
    plan.kalan -= 1;
    if (plan.kalan <= 0) {
      const adimlar = PLANLAR[plan.sure];
      plan.adim++;
      if (plan.adim >= adimlar.length) { L.toast("Günün planı bitti. Eline sağlık, 73!", 4000); planDur(); gunuIsaretle(); return; }
      plan.kalan = adimlar[plan.adim][2] * 60;
      L.toast("Sıradaki adım: " + adimlar[plan.adim][1], 3500);
    }
    plan.dinleyici && plan.dinleyici();
  }
  function planBasla(sure) { planDur(); plan.sure = sure; plan.adim = 0; plan.kalan = PLANLAR[sure][0][2] * 60; plan.id = setInterval(planTik, 1000); }
  function planDur() { clearInterval(plan.id); plan.id = 0; plan.adim = -1; plan.dinleyici && plan.dinleyici(); }
  const gunAnahtar = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  function gunuIsaretle() { const g = store.get("pratik.gunler", []); const k = gunAnahtar(Date.now()); if (!g.includes(k)) { g.push(k); store.set("pratik.gunler", g.slice(-400)); } }
  function seri() { // bugün ya da dünden geriye kesintisiz çalışılan gün sayısı
    const gunler = new Set(store.get("pratik.gunler", []));
    store.get("koch.gecmis", []).forEach((x) => gunler.add(gunAnahtar(x.t)));
    store.get("gonderme.gecmis", []).forEach((x) => gunler.add(gunAnahtar(x.t)));
    let n = 0; const d = new Date();
    if (!gunler.has(gunAnahtar(d))) d.setDate(d.getDate() - 1);
    while (gunler.has(gunAnahtar(d))) { n++; d.setDate(d.getDate() - 1); }
    return { n, toplam: gunler.size };
  }
  const dk = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  window.Demos.gunlukPlan = (stage) => {
    const sheet = h("div.sheet.pr-sheet");
    stage.append(sheet);
    let secili = store.get("pratik.sure", 10);
    const adimlar = h("ol.pr-adimlar");
    const basBtn = ibtn("play", "Planı başlat", () => (plan.id ? planDur() : planBasla(secili)), "primary");
    const sureSeg = seg([[10, "10 dk"], [20, "20 dk"], [30, "30 dk"]], secili, (k) => { secili = k; store.set("pratik.sure", k); if (plan.id) planDur(); ciz(); }, "Süre");
    const ozet = h("div.skor.pr-ozet");
    const zayif = h("p.readout");
    sheet.append(h("div.controls", sureSeg, basBtn), adimlar, h("h3.pr-bas", "İlerlemeniz"), ozet, zayif);
    function ciz() {
      const liste = PLANLAR[plan.id ? plan.sure : secili];
      adimlar.innerHTML = "";
      liste.forEach(([id, ad, d], i) => {
        const aktif = plan.id && i === plan.adim, bitti = plan.id && i < plan.adim;
        adimlar.append(h("li" + (aktif ? ".aktif" : bitti ? ".bitti" : ""),
          h("span.pr-ad", ad), h("span.pr-sure", aktif ? dk(plan.kalan) : d + " dk"), btn("Git", () => Deck.goId(id), "sm" + (aktif ? " primary" : " ghost"))));
      });
      basBtn.setIcon(plan.id ? "stop" : "play"); basBtn.setLabel(plan.id ? "Planı durdur" : "Planı başlat");
    }
    function ozetCiz() {
      ozet.innerHTML = "";
      const ders = store.get("koch.ders", 1);
      const kg = store.get("koch.gecmis", []);
      const son = kg.length ? kg[kg.length - 1] : null;
      const kHarf = Mors.KOCH.slice(0, Math.min(Mors.KOCH.length, ders + 1)).join(" ");
      const s = seri();
      const ge = store.get("gonderme.enIyi", null);
      const kel = Math.max(store.get("kelime.eniyi.cagri", 0), store.get("kelime.eniyi.kelime", 0), store.get("kelime.eniyi.karisik", 0));
      const o = (b, k) => h("div.olcum", h("b", b), h("small", k));
      ozet.append(
        o(`${ders + 1} harf`, "Koch dersi: " + kHarf),
        o(son ? L.yuzde(son.d) : "–", "son Koch doğruluğu"),
        o(String(s.n), s.n === 1 ? "günlük seri (gün)" : "günlük seri (gün)"),
        o(ge ? ge.w + " wpm" : "–", "en iyi gönderme (%90+)"),
        o(kel ? String(kel) : "–", "en iyi kelime puanı"));
      // en zayıf harfler: tek harf oyunu istatistikleri
      const ist = store.get("tek.ist", {});
      const z = Object.entries(ist).filter(([, x]) => x && x.n >= 3).map(([hf, x]) => [hf, (x.k || 0) / x.n]).sort((a, b) => a[1] - b[1]).slice(0, 5);
      zayif.textContent = z.length ? "En çok zorlandığınız harfler: " + z.map(([hf, r]) => `${hf} (${L.yuzde(r)})`).join(", ") + ". Isınmada bunlara ağırlık verin." : "Tek harf oyununu oynadıkça en çok zorlandığınız harfler burada görünecek.";
      if (!kg.length && !ge && !Object.keys(ist).length) zayif.textContent = "Henüz kayıt yok. Koch alıştırmasıyla başlayın; ilerlemeniz bu tarayıcıda saklanır.";
    }
    plan.dinleyici = () => { if (stage.isConnected) ciz(); };
    ciz(); ozetCiz();
    return { enter() { ciz(); ozetCiz(); }, toggle() { plan.id ? planDur() : planBasla(secili); } };
  };

  window.Demos.kapanis = (stage) => {
    const sheet = h("div.sheet.pr-sheet");
    stage.append(sheet);
    const tel = h("div.telgraf",
      h("div.telgraf-bas", h("b", "TELGRAF"), h("span", new Date().toLocaleDateString("tr-TR"))));
    const govde = h("div.telgraf-govde");
    tel.append(govde);
    sheet.append(tel);
    const calar = Serit.Calar(sheet, { metin: "TNX FER QSO 73 <SK>", ipucu: "Kapanış telgrafınız", saniye: 6,
      onCal: (hnd) => {
        govde.textContent = "";
        const hs = hnd.cz.harfler;
        let i = 0;
        const yaz = () => {
          if (hnd.durdu && i >= hs.length) return;
          const t = hnd.saat();
          while (i < hs.length && t >= hs[i].son) { govde.textContent += (i && hs[i].kelimeBasi ? " " : "") + hs[i].harf.replace(/[<>]/g, ""); i++; }
          if (i < hs.length && !hnd.durdu) requestAnimationFrame(yaz);
        };
        requestAnimationFrame(yaz);
        hnd.bitti.then((tam) => { if (!tam) return; while (i < hs.length) { govde.textContent += (i && hs[i].kelimeBasi ? " " : "") + hs[i].harf.replace(/[<>]/g, ""); i++; } });
      } });
    calar.serit.el.classList.add("buyuk");
    govde.append(h("span.telgraf-bos", "Kapanış telgrafınızı yazıp çalın; çözüldükçe buraya yazılır."));
    return { leave() { calar.leave(); }, toggle() { calar.toggle(); } };
  };
})();
