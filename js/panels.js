/* Alt çubuktaki ayarlar paneli: ton frekansı, harf hızı, etkin hız (Farnsworth), Türkçe harfler. */
(function () {
  const { h, prefs, setPref, seg, slider, fmtNum } = L;
  const panels = [];
  function panel(id, title, btnId) {
    const body = h("div");
    const el = h("div.panel#" + id, { role: "dialog", "aria-label": title },
      h("h4", title, h("span.spacer"), h("button.close", { type: "button", "aria-label": "Kapat", onclick: () => toggle(false) }, "×")), body);
    document.body.append(el);
    const btn = document.getElementById(btnId);
    function toggle(force) {
      const open = force ?? !el.classList.contains("open");
      el.classList.toggle("open", open);
      btn && btn.classList.toggle("on", open);
    }
    btn && btn.addEventListener("click", () => toggle());
    const api = { el, body, toggle };
    panels.push(api);
    return api;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") panels.forEach((p) => p.toggle(false)); });
  document.addEventListener("pointerdown", (e) => { if (!e.target.closest(".panel, #bar")) panels.forEach((p) => p.toggle(false)); });

  const sp = panel("settings-panel", "Ses ve hız", "btn-settings");
  const ozet = h("p.ayar-ozet");
  function ozetYaz() {
    const z = Mors.zamanlama(prefs.wpm, prefs.fwpm < prefs.wpm ? prefs.fwpm : null);
    ozet.textContent = `Nokta ${fmtNum(z.nokta * 1000)} ms, çizgi ${fmtNum(z.cizgi * 1000)} ms, harf arası ${fmtNum(z.harfArasi * 1000)} ms, kelime arası ${fmtNum(z.kelimeArasi * 1000)} ms.`;
  }
  const fSl = slider({ label: "Etkin hız", min: 4, max: 40, value: Math.min(prefs.fwpm, prefs.wpm), fmt: (v) => v + " wpm", oninput: (v) => { setPref("fwpm", Math.min(v, prefs.wpm)); ozetYaz(); } });
  const wSl = slider({ label: "Harf hızı", min: 5, max: 40, value: prefs.wpm, fmt: (v) => v + " wpm", oninput: (v) => {
    setPref("wpm", v);
    if (prefs.fwpm > v) { setPref("fwpm", v); fSl.set(v); }
    ozetYaz();
  } });
  const tSl = slider({ label: "Ton", min: 400, max: 1000, step: 10, value: prefs.ton, fmt: (v) => v + " Hz", oninput: (v) => setPref("ton", v) });
  sp.body.append(
    h("p", "Bütün sitede geçerli. Harf hızı noktaların ve çizgilerin uzunluğunu belirler; etkin hız harflerin arasına konan boşlukla dakikada kaç kelime geçtiğini (Farnsworth). Yeni başlayanlara 18–20 wpm harf hızı ve 8–10 wpm etkin hız önerilir."),
    h("div.row", wSl), h("div.row", fSl), h("div.row", tSl),
    ozet,
    h("div.row", h("span", "Türkçe harfler"), seg([[true, "Ç Ğ Ö Ş Ü kodlarıyla"], [false, "C G O S U olarak"]], prefs.trHarf, (k) => setPref("trHarf", k), "Türkçe harfler")),
    h("div.row", L.btn("Dinle: PARIS", () => Snd.cal("PARIS"), "sm"), L.btn("Varsayılana dön", () => {
      setPref("wpm", 20); setPref("fwpm", 10); setPref("ton", 600); setPref("trHarf", true);
      wSl.set(20); fSl.set(10); tSl.set(600); ozetYaz();
    }, "sm ghost")));
  ozetYaz();
  window.addEventListener("prefchange", (e) => { if (e.detail.k === "wpm") wSl.set(prefs.wpm); if (e.detail.k === "fwpm") fSl.set(prefs.fwpm); ozetYaz(); });
  window.AyarPanel = sp;
})();
