/* Ortak yardımcılar: renkler, tercihler, tuval, döngüler, DOM, kontroller.
   Şan ve gitar eğitimlerindeki lib.js'ten uyarlandı. */
(function () {
  /* Renkler css/style.css'teki değişkenlerden okunur (karanlık tema için).
       pirinc  sinyal (ton açık), anahtarın pirinci     kagit  telgraf şeridi
       dogru / yanlis  alıştırmalarda doğru ve yanlış      ink    mürekkep */
  const C = {};
  const VARS = {
    bg: "--bg", bg2: "--bg-2", kagit: "--kagit", kagit2: "--kagit-2", delik: "--delik",
    ink: "--ink", ink2: "--ink-2", muted: "--muted", line: "--line", line2: "--line-2",
    pirinc: "--pirinc", pirinc2: "--pirinc-2", dogru: "--dogru", yanlis: "--yanlis", mavi: "--mavi",
  };
  function readTokens() {
    const cs = getComputedStyle(document.documentElement);
    for (const [k, v] of Object.entries(VARS)) C[k] = cs.getPropertyValue(v).trim() || C[k] || "#888";
  }
  readTokens();
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  mq && mq.addEventListener && mq.addEventListener("change", () => { readTokens(); window.dispatchEvent(new Event("themechange")); });

  const FONT = {
    display: '"Big Shoulders Display", "Big Shoulders", system-ui, sans-serif',
    body: '"Instrument Sans", system-ui, sans-serif',
    mono: '"Martian Mono", ui-monospace, monospace',
  };

  /* Tarayıcıda saklanan küçük veriler; anahtarlar "mors." önekli (aynı alan adında başka eğitimler de var). */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("mors." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("mors." + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("mors." + k); } catch (e) {} },
  };

  /* Tercihler: bütün sitede geçerli; değişince "prefchange" olayı */
  const prefs = {
    ton: store.get("ton", 600),        // ton frekansı (Hz)
    wpm: store.get("wpm", 20),         // harf hızı (kelime/dakika)
    fwpm: store.get("fwpm", 10),       // etkin hız (Farnsworth); wpm'e eşitse Farnsworth yok
    trHarf: store.get("trHarf", true), // Türkçe harfleri kendi kodlarıyla gönder (yoksa C, G, O, S, U)
  };
  function setPref(k, v) {
    prefs[k] = v; store.set(k, v);
    window.dispatchEvent(new CustomEvent("prefchange", { detail: { k, v } }));
  }
  // tercihlerden çalma ayarları
  const hiz = (ek = {}) => Object.assign({ wpm: prefs.wpm, fwpm: prefs.fwpm < prefs.wpm ? prefs.fwpm : null, tr: prefs.trHarf, f: prefs.ton }, ek);

  function hexToRgb(h) {
    if (h.startsWith("rgb")) return h.match(/[\d.]+/g).slice(0, 3).map(Number);
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function mix(h1, h2, t) {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  }

  /* Yüksek çözünürlüklü, kendini yeniden boyutlandıran tuval.
     İlk onResize geri çağrısı mikro göreve ertelenir: çağıran kod dönüş değerini değişkene atamış olsun. */
  function canvas(el, onResize) {
    const ctx = el.getContext("2d");
    const state = { ctx, w: 0, h: 0, dpr: 1 };
    let ready = false;
    function fit() {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.w = r.width; state.h = r.height; state.dpr = dpr;
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ready && onResize && onResize(state);
    }
    fit();
    ready = true;
    new ResizeObserver(fit).observe(el);
    queueMicrotask(() => { if (state.w && onResize) onResize(state); });
    state.fit = fit;
    return state;
  }

  /* requestAnimationFrame döngüsü */
  function loop(fn) {
    let id = 0, last = 0, running = false;
    function tick(t) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      fn(dt, t / 1000);
      id = requestAnimationFrame(tick);
    }
    return {
      start() { if (!running) { running = true; last = 0; id = requestAnimationFrame(tick); } },
      stop() { running = false; cancelAnimationFrame(id); },
      get running() { return running; },
    };
  }

  /* Küçük DOM yardımcısı: h("div.cls#id", {attrs}, ...children) */
  function h(spec, attrs, ...kids) {
    const m = spec.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement(m[1] || "div");
    (m[2].match(/[.#][\w-]+/g) || []).forEach((p) => { if (p[0] === ".") el.classList.add(p.slice(1)); else el.id = p.slice(1); });
    if (attrs && (typeof attrs !== "object" || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; }
      else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((k) => k != null && k !== false && el.append(k.nodeType ? k : document.createTextNode(k)));
    return el;
  }

  function slider({ label, min, max, step = 1, value, fmt = (v) => String(v), oninput, cls }) {
    const val = h("span.val", fmt(value));
    const input = h("input", { type: "range", min, max, step, value, "aria-label": label });
    if (cls) input.classList.add(cls);
    input.addEventListener("input", () => { val.textContent = fmt(+input.value); oninput(+input.value); });
    const wrap = h("label.sl", h("span.sl-lab", label), input, val);
    wrap.set = (v) => { input.value = v; val.textContent = fmt(+input.value); };
    wrap.input = input;
    return wrap;
  }
  function seg(options, value, onchange, label) {
    const wrap = h("div.seg", { role: "group", "aria-label": label || null });
    const btns = options.map(([k, lab, title]) => {
      const b = h("button", { type: "button", title: title || null }, lab);
      b.addEventListener("click", () => { set(k); onchange(k); });
      wrap.append(b); return [k, b];
    });
    function set(k) { btns.forEach(([kk, b]) => { b.classList.toggle("on", kk === k); b.setAttribute("aria-pressed", kk === k); }); }
    set(value);
    wrap.set = set;
    return wrap;
  }
  const btn = (label, onclick, cls = "") => h("button.btn" + (cls ? "." + cls.split(" ").join(".") : ""), { type: "button", onclick }, label);
  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    tekrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>',
  };
  const ibtn = (icon, label, onclick, cls = "") => {
    const b = h("button.btn" + (cls ? "." + cls.split(" ").join(".") : ""), { type: "button", onclick });
    b.innerHTML = ICON[icon] + "<span></span>";
    b.lastChild.textContent = label;
    b.setLabel = (t) => { b.lastChild.textContent = t; };
    b.setIcon = (i) => { b.firstChild.outerHTML = ICON[i]; };
    return b;
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // sayıları Türkçe biçimde yaz; 10.000'in altında binlik ayırıcı yok
  const fmtNum = (v, d = 0) => v.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: Math.abs(v) >= 10000 });
  const fmtHz = (f) => (f >= 1e6 ? fmtNum(f / 1e6, 3) + " MHz" : f >= 1000 ? fmtNum(f / 1000, 2) + " kHz" : fmtNum(f, 0) + " Hz");
  const fmtMs = (s) => fmtNum(s * 1000, 0) + " ms";
  const yuzde = (v, d = 0) => "%" + fmtNum(v * 100, d);

  function text(ctx, str, x, y, { size = 13, color = C.ink2, align = "left", base = "alphabetic", weight = 500, font = FONT.body } = {}) {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillText(str, x, y);
  }

  // Kodu ekranda göstermek için: nokta · çizgi —  (metinde "·−" karakterleriyle)
  const kodYaz = (kod) => kod.replace(/\./g, "·").replace(/-/g, "−");
  // Kodu küçük bir SVG şerit olarak çiz (tablolar, kartlar)
  function kodSvg(kod, { birim = 6, yuk = 6, renk = "currentColor" } = {}) {
    let x = 0; const parca = [];
    [...kod].forEach((e, i) => {
      if (i) x += birim;
      const w = e === "." ? birim : 3 * birim;
      parca.push(`<rect x="${x}" y="0" width="${w}" height="${yuk}" rx="${yuk / 2}" fill="${renk}"/>`);
      x += w;
    });
    return `<svg class="kod-svg" viewBox="0 0 ${Math.max(x, 1)} ${yuk}" width="${x}" height="${yuk}" aria-label="${kodYaz(kod)}" role="img">${parca.join("")}</svg>`;
  }

  const narrow = () => window.matchMedia("(max-width: 860px)").matches;
  const slide = (html) => document.getElementById("deck").insertAdjacentHTML("beforeend", html);

  let toastEl = null, toastT = 0;
  function toast(msg, ms = 2600) {
    if (!toastEl) { toastEl = h("div.toast", { role: "status" }); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), ms);
  }
  // Rastgele seçim
  const sec = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];

  window.L = { slide, C, readTokens, FONT, store, prefs, setPref, hiz, rgba, mix, canvas, loop, h, slider, seg, btn, ibtn, ICON,
    clamp, lerp, fmtNum, fmtHz, fmtMs, yuzde, text, kodYaz, kodSvg, narrow, toast, sec };
  window.Demos = window.Demos || {};
})();
