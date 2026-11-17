/* Slayt motoru: gezinme, delikli şerit biçimli ilerleme çubuğu, notlar, genel bakış, demo yaşam döngüsü.
   Şan eğitimindeki app.js'ten uyarlandı.
   Kısayollar: ← → gezinme · Boşluk o slayttaki deneyi başlat/durdur (anahtarlama slaytlarında anahtar) ·
   N notlar · T metin · O tüm slaytlar · F tam ekran · M ses
   Demo nesnesi: {enter, leave, toggle, tus(e, basili) → true ise olay demoda kalır} */
(function () {
  const { h } = L;
  const CHAPTERS = [
    "Giriş",
    "Nokta ve çizgi",
    "Telgrafın tarihi",
    "Sinyalin fiziği",
    "Kulakla öğrenmek",
    "Göndermek",
    "Telsizde mors",
    "Işıkla ve dokunarak",
    "Pratik",
  ];

  const slides = [...document.querySelectorAll(".slide")];
  const deck = document.getElementById("deck");
  const notesEl = document.getElementById("notes");
  const overview = document.getElementById("overview");
  const progress = document.getElementById("progress");
  const counter = document.querySelector("#bar .counter");
  const chapterName = document.querySelector("#bar .chapter-name");
  const instances = new Map();
  let cur = -1;
  const seen = new Set();

  // Slayt kimlikleri ve bölüm etiketleri
  slides.forEach((s, i) => {
    if (!s.id) s.id = "s" + (i + 1);
    const ch = +s.dataset.chapter || 0;
    const text = s.querySelector(".text");
    if (text && ch > 0 && !text.querySelector(".chapter-tag")) text.prepend(h("p.chapter-tag", h("b", String(ch)), CHAPTERS[ch]));
  });

  // İlerleme çubuğu delikli bir şerit: her slayt bir delik, bulunulan slayt bir çizgi (dah), bölümler arası boşluk.
  const dots = [];
  CHAPTERS.forEach((name, ci) => {
    const members = slides.map((s, i) => [s, i]).filter(([s]) => (+s.dataset.chapter || 0) === ci);
    if (!members.length) return;
    const grp = h("div.ch", { style: { "--n": members.length }, title: name });
    members.forEach(([s, i]) => {
      const d = h("button.dot", { type: "button", "aria-label": `${i + 1}. slayt: ${title(s)}`, title: title(s), onclick: () => go(i) });
      dots[i] = d; grp.append(d);
    });
    progress.append(grp);
  });

  function title(s) { return s.dataset.title || (s.querySelector("h1,h2") || {}).textContent || ""; }

  // Genel bakış
  function buildOverview() {
    const body = h("div");
    body.append(h("h2", "Tüm slaytlar"));
    CHAPTERS.forEach((name, ci) => {
      const items = slides.map((s, i) => [s, i]).filter(([s]) => (+s.dataset.chapter || 0) === ci);
      if (!items.length) return;
      body.append(h("div.ov-ch",
        h("h3", (ci ? ci + ". " : "") + name),
        h("div.ov-list", items.map(([s, i]) =>
          h("button.ov-item" + (s.dataset.tool != null ? ".tool" : ""), { type: "button", "data-i": i, onclick: () => { toggleOverview(false); go(i); } },
            h("span", String(i + 1)), title(s))))));
    });
    body.append(h("p.keys", { html:
      "Kısayollar: <kbd>→</kbd> ileri · <kbd>←</kbd> geri · <kbd>Boşluk</kbd> slayttaki deneyi başlat/durdur (anahtarlama slaytlarında anahtar) · " +
      "<kbd>N</kbd> sunucu notları · <kbd>T</kbd> metni gizle (sunum) · <kbd>M</kbd> sesi kapat · <kbd>O</kbd> bu ekran · <kbd>F</kbd> tam ekran. " +
      "Mikrofon yalnızca çözücü slaytında, düğmeye bastığınızda açılır ve slayttan çıkınca kapanır." }));
    overview.append(body);
  }
  buildOverview();

  function toggleOverview(force) {
    const open = force ?? !overview.classList.contains("open");
    overview.classList.toggle("open", open);
    overview.querySelectorAll(".ov-item").forEach((b) => b.classList.toggle("cur", +b.dataset.i === cur));
    document.getElementById("btn-overview").classList.toggle("on", open);
    if (open) (overview.querySelector(".ov-item.cur") || overview.querySelector(".ov-item")).focus();
  }

  function renderNotes() {
    const s = slides[cur];
    const n = s.querySelector("aside.notes");
    notesEl.innerHTML = "";
    notesEl.append(h("h4", `Sunucu notu · ${cur + 1}/${slides.length}`));
    if (n) notesEl.insertAdjacentHTML("beforeend", n.innerHTML);
    else notesEl.append(h("p", "Bu slayt için not yok."));
  }

  function instance(i) {
    const s = slides[i];
    if (!s) return null;
    const name = s.dataset.demo;
    if (!name) return null;
    if (!instances.has(i)) {
      const fn = window.Demos[name];
      if (!fn) { console.warn("Demo bulunamadı:", name); instances.set(i, null); return null; }
      try { instances.set(i, fn(s.querySelector(".stage") || s, s) || {}); }
      catch (e) { console.error(name, e); instances.set(i, null); }
    }
    return instances.get(i);
  }

  function go(i, fromHash) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    const prev = cur;
    if (prev >= 0) { const inst = instances.get(prev); try { inst && inst.leave && inst.leave(); } catch (e) { console.error(e); } }
    Snd.hepsiniDurdur();
    cur = i;
    slides.forEach((s, k) => {
      s.classList.toggle("active", k === i);
      s.classList.toggle("before", k < i);
      s.setAttribute("aria-hidden", k === i ? "false" : "true");
      if ("inert" in s) s.inert = k !== i;
    });
    seen.add(i);
    dots.forEach((d, k) => { if (!d) return; d.classList.toggle("cur", k === i); d.classList.toggle("seen", seen.has(k) && k !== i); });
    const ch = +slides[i].dataset.chapter || 0;
    chapterName.innerHTML = "";
    chapterName.append(ch ? h("b", `${ch}. `) : "", CHAPTERS[ch]);
    counter.textContent = `${i + 1} / ${slides.length}`;
    if (!fromHash) history.replaceState(null, "", "#" + slides[i].id);
    renderNotes();
    window.dispatchEvent(new CustomEvent("slidechange", { detail: { index: i, id: slides[i].id, last: i === slides.length - 1 } }));
    const inst = instance(i);
    inst && inst.enter && requestAnimationFrame(() => inst.enter());
    // sonraki slaytın demosunu önceden hazırla
    setTimeout(() => instance(i + 1), 400);
    if (window.innerWidth <= 860) window.scrollTo(0, 0);
    document.body.dataset.slide = slides[i].id;
  }

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);
  document.getElementById("btn-next").addEventListener("click", next);
  document.getElementById("btn-prev").addEventListener("click", prev);
  document.getElementById("btn-overview").addEventListener("click", () => toggleOverview());
  const btnNotes = document.getElementById("btn-notes");
  function toggleNotes() { notesEl.classList.toggle("open"); btnNotes.classList.toggle("on", notesEl.classList.contains("open")); }
  btnNotes.addEventListener("click", toggleNotes);
  const btnText = document.getElementById("btn-text");
  function toggleText() { document.body.classList.toggle("text-hidden"); btnText.classList.toggle("on", document.body.classList.contains("text-hidden")); }
  btnText.addEventListener("click", toggleText);

  // demo kendi tuşlarını isterse (anahtarlama) önce ona sor
  function demoTus(e, basili) {
    const inst = instances.get(cur);
    if (!inst || !inst.tus || overview.classList.contains("open")) return false;
    const t = e.target;
    if (t.matches && t.matches("input[type=text], input[type=number], textarea, select")) return false;
    if (inst.tus(e, basili)) { e.preventDefault(); return true; }
    return false;
  }
  document.addEventListener("keyup", (e) => { demoTus(e, false); });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (demoTus(e, true)) return;
    const t = e.target;
    const typing = t.matches && t.matches("input[type=text], input[type=number], textarea, [contenteditable], select");
    const onRange = t.matches && t.matches("input[type=range]");
    const onBoard = t.closest && t.closest(".no-arrows");
    if (typing) return;
    if (overview.classList.contains("open")) {
      if (e.key === "Escape" || e.key === "o" || e.key === "O") { toggleOverview(false); e.preventDefault(); }
      return;
    }
    switch (e.key) {
      case "ArrowRight": case "PageDown":
        if (onRange || onBoard) return; next(); e.preventDefault(); break;
      case "ArrowLeft": case "PageUp":
        if (onRange || onBoard) return; prev(); e.preventDefault(); break;
      case " ": {
        // boşluk: o slayttaki deneyi başlatır ya da durdurur
        if (t.matches && t.matches("summary, a")) return;
        e.preventDefault(); Snd.unlock();
        const inst = instances.get(cur);
        if (inst && inst.toggle) inst.toggle();
        else L.toast("Bu slaytta boşlukla başlayan bir deney yok");
        break;
      }
      case "Home": go(0); break;
      case "End": go(slides.length - 1); break;
      case "n": case "N": toggleNotes(); break;
      case "o": case "O": toggleOverview(); break;
      case "t": case "T": toggleText(); break;
      case "m": case "M": Snd.setMuted(!Snd.muted); break;
      case "f": case "F":
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
    }
  });
  // boşluk tuşuyla odaktaki düğmeye "tıklanmasın"
  document.addEventListener("keyup", (e) => { if (e.key === " " && e.target.matches && e.target.matches("button")) e.preventDefault(); });

  // Mobilde yatay kaydırma ile gezinme (deney alanı dışında)
  let tx = 0, ty = 0, tOk = false;
  deck.addEventListener("touchstart", (e) => {
    tOk = !e.target.closest(".stage, input, .seg, button, svg, canvas");
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  deck.addEventListener("touchend", (e) => {
    if (!tOk) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? next : prev)();
  }, { passive: true });

  function fromHash() {
    const id = location.hash.slice(1);
    const i = slides.findIndex((s) => s.id === id);
    go(i >= 0 ? i : 0, true);
  }
  window.Deck = { go, next, prev, goId(id) { const i = slides.findIndex((s) => s.id === id); if (i >= 0) go(i); }, get current() { return cur; }, get id() { return slides[cur].id; }, get count() { return slides.length; } };
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();

/* Alt çubuktaki ses düzeyi: sessize alma düğmesi ve kaydırıcı */
(function () {
  const btn = document.getElementById("btn-mute");
  const range = document.getElementById("vol");
  function render() {
    const m = Snd.muted || Snd.volume === 0;
    btn.classList.toggle("off", m);
    btn.setAttribute("aria-label", m ? "Sesi aç (M)" : "Sesi kapat (M)");
    btn.title = btn.getAttribute("aria-label");
    range.value = Snd.muted ? 0 : Snd.volume;
  }
  btn.addEventListener("click", () => { Snd.unlock(); Snd.setMuted(!Snd.muted); });
  range.addEventListener("input", () => { Snd.unlock(); Snd.setVolume(+range.value); if (+range.value === 0) Snd.setMuted(true); });
  Snd.onChange(render);
  render();
})();
