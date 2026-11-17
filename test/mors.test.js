/* Mors mantığının birim testleri: node test/mors.test.js */
const M = require("../js/mors.js");
let gecen = 0, kalan = 0;
function ok(k, ad) { if (k) gecen++; else { kalan++; console.log("✗", ad); } }
const yakin = (a, b, tol) => Math.abs(a - b) <= tol;

// --- tablolar
ok(Object.keys(M.ITU).filter((k) => /[A-Z]/.test(k)).length === 26, "26 harf");
ok(Object.keys(M.ITU).filter((k) => /[0-9]/.test(k)).length === 10, "10 rakam");
const kodlar = Object.values(M.ITU);
ok(new Set(kodlar).size === kodlar.length, "ITU kodları benzersiz");
for (const [h, k] of Object.entries(M.TR)) ok(!Object.values(M.ITU).includes(k), "Türkçe harf ITU ile çakışmıyor: " + h);
ok(M.kodla("SOS") === "... --- ...", "SOS kodu");
ok(M.kodla("şükrü") === ".--.. ..-- -.- .-. ..--", "Türkçe harfler");
ok(M.kodla("ışık", { tr: false }) === ".. ... .. -.-", "Latin karşılıklar");
ok(M.kodla("iİıI") === ".. .. .. ..", "i/ı ayrımı yok");
ok(M.kodla("<SK>") === "...-.-", "usul işareti");
ok(M.harfler("CQ DE TA").filter((x) => x.kelimeBasi).length === 3, "kelime başları");

// --- zamanlama: PARIS = 50 birim (sondaki 7 birimlik kelime boşluğuyla)
ok(M.birimSay("PARIS") + 7 === 50, "PARIS 50 birim");
const z = M.zamanlama(20);
ok(yakin(z.birim, 0.06, 1e-9), "20 wpm → 60 ms");
ok(yakin(M.zamanlama(12).birim, 0.1, 1e-9), "12 wpm → 100 ms");
// Farnsworth: 18/5 wpm ile PARIS + kelime boşluğu tam 60/5 = 12 sn sürmeli
const ff = M.zamanlama(18, 5);
const c = M.cizelge("PARIS", { wpm: 18, fwpm: 5 });
ok(yakin(c.sure + ff.kelimeArasi, 12, 1e-6), "Farnsworth PARIS 5 wpm = 12 sn (" + (c.sure + ff.kelimeArasi).toFixed(3) + ")");
const c2 = M.cizelge("PARIS", { wpm: 20 });
ok(yakin(c2.sure + c2.z.kelimeArasi, 3, 1e-9), "PARIS 20 wpm = 3 sn");
ok(c2.isaretler.length === 14, "PARIS 14 işaret");

// --- çözme
function dene(metin, wpm, sapma, opts = {}) {
  const cz = M.cizelge(metin, { wpm, fwpm: opts.fwpm });
  let tohum = 7;
  const rnd = () => ((tohum = (tohum * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const s = M.sureListesi(cz).map(([a, d]) => [a, d * (1 + sapma * rnd())]);
  return M.coz(s, { wpm: opts.tahmin || wpm });
}
ok(dene("CQ CQ DE TA1XYZ K", 20, 0) === "CQ CQ DE TA1XYZ K", "kusursuz çözme");
ok(dene("THE QUICK BROWN FOX 73", 18, 0.2) === "THE QUICK BROWN FOX 73", "%20 sapmalı çözme");
ok(dene("PARIS PARIS", 25, 0.1, { tahmin: 12 }) === "PARIS PARIS", "yanlış başlangıç hızına uyum");
ok(dene("SINYALDEN SOHBETE", 15, 0.1, { fwpm: 8 }) === "SINYALDEN SOHBETE", "Farnsworth aralıklı çözme");
ok(dene("ÇÖĞÜŞ", 15, 0.05) === "ÇÖĞÜŞ", "Türkçe harf çözme");

// --- ses sinyalinden çözme: sentetik ton + gürültü
function sinyal(metin, wpm, f, sr, snrDb) {
  const cz = M.cizelge(metin, { wpm });
  const n = Math.ceil((cz.sure + 1) * sr);
  const x = new Float32Array(n);
  const rise = 0.005;
  cz.isaretler.forEach((m) => {
    const a = Math.floor((m.t + 0.3) * sr), b = Math.floor((m.t + 0.3 + m.d) * sr);
    for (let i = a; i < b; i++) {
      const tt = (i - a) / sr, kalanT = (b - i) / sr;
      const env = Math.min(1, tt / rise, kalanT / rise);
      x[i] += 0.3 * env * Math.sin((2 * Math.PI * f * i) / sr);
    }
  });
  // gürültü (SNR, tonun tepe gücüne göre değil, ortalama güce göre kabaca)
  const sigma = (0.3 / Math.SQRT2) / Math.pow(10, snrDb / 20);
  let tohum = 11;
  const gauss = () => { let u = 0, v = 0; tohum = (tohum * 16807) % 2147483647; u = tohum / 2147483647; tohum = (tohum * 16807) % 2147483647; v = tohum / 2147483647; return Math.sqrt(-2 * Math.log(u + 1e-12)) * Math.cos(2 * Math.PI * v); };
  for (let i = 0; i < n; i++) x[i] += sigma * gauss();
  return x;
}
function sesCoz(metin, wpm, f, snr, oto) {
  const sr = 16000;
  const cz = M.Cozucu({ wpm: 15 });
  const ta = M.TonAlgilayici(sr, { frekans: oto ? 600 : f, oto, onDegisim: (acik, d) => (acik ? cz.isaret(d) : cz.bosluk(d)) });
  const x = sinyal(metin, wpm, f, sr, snr);
  for (let i = 0; i < x.length; i += 512) ta.isle(x.subarray(i, i + 512));
  return { metin: cz.bitir(), f: ta.frekans };
}
let r = sesCoz("CQ TEST DE TA1XYZ", 20, 650, 20, false);
ok(r.metin === "CQ TEST DE TA1XYZ", "ses: temiz sinyal (" + r.metin + ")");
r = sesCoz("PARIS PARIS PARIS", 18, 600, 3, false);
ok(r.metin === "PARIS PARIS PARIS", "ses: 3 dB gürültülü sinyal (" + r.metin + ")");
r = sesCoz("VVV VVV DE TA2ABC TA2ABC K", 22, 820, 15, true);
ok(yakin(r.f, 820, 15), "ses: otomatik frekans bulma (" + r.f.toFixed(0) + " Hz)");
ok(r.metin.endsWith("TA2ABC K"), "ses: otomatik frekansla çözme (" + r.metin + ")");
// sessizlikte ya da yalnız gürültüde harf üretmemeli
{
  const sr = 16000, cz = M.Cozucu({ wpm: 15 });
  const ta = M.TonAlgilayici(sr, { frekans: 600, onDegisim: (a, d) => (a ? cz.isaret(d) : cz.bosluk(d)) });
  let t = 3; const x = new Float32Array(sr * 3);
  for (let i = 0; i < x.length; i++) { t = (t * 16807) % 2147483647; x[i] = 0.05 * (t / 2147483647 - 0.5); }
  ta.isle(x);
  ok(cz.bitir() === "", "ses: yalnız gürültüde harf yok");
}

// --- Koch sırası
ok(M.KOCH.length === 41 && new Set(M.KOCH).size === 41, "Koch sırası 41 benzersiz karakter");
ok(M.KOCH.every((h) => M.HEPSI[h]), "Koch karakterlerinin hepsinin kodu var");

console.log(`${gecen} geçti, ${kalan} kaldı`);
process.exit(kalan ? 1 : 0);
