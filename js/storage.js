/* =========================================================
   storage.js — lagring i localStorage, export/import
   ========================================================= */

"use strict";

var STORAGE_KEY = "pt-data-v1";

function tomData() {
  return {
    version: 1,
    installningar: {
      startdatum: idagStr(),
      fas: 1,
      gangsteg: 1
    },
    /* morgonkoll: { datum, regioner: { kna: 0-10, ... }, kommentar } */
    morgonkoll: [],
    /* pass: { id, datum, rubrik, poster: [{ ovningId, set, reps, vikt, sek, min, smarta, kommentar }], kansla, kommentar } */
    pass: []
  };
}

/* Normaliserar data av okänd form (sparad eller importerad) till ett
   säkert format – saknade/feltypade fält får standardvärden. */
function normaliseraData(data) {
  var ren = tomData();
  if (!data || typeof data !== "object") return ren;

  var inst = data.installningar && typeof data.installningar === "object" ? data.installningar : {};
  if (typeof inst.startdatum === "string" && /^\d{4}-\d{2}-\d{2}$/.test(inst.startdatum)) {
    ren.installningar.startdatum = inst.startdatum;
  }
  var fas = Number(inst.fas);
  if (fas >= 1 && fas <= FASER.length) ren.installningar.fas = Math.round(fas);
  var steg = Number(inst.gangsteg);
  if (steg >= 1 && steg <= GANGPROGRAM.length) ren.installningar.gangsteg = Math.round(steg);

  if (Array.isArray(data.morgonkoll)) {
    ren.morgonkoll = data.morgonkoll.filter(function (k) {
      return k && typeof k === "object" && typeof k.datum === "string" &&
        k.regioner && typeof k.regioner === "object";
    }).map(function (k) {
      var regioner = {};
      Object.keys(k.regioner).forEach(function (r) {
        if (REGIONER[r]) regioner[r] = Math.max(0, Math.min(10, Number(k.regioner[r]) || 0));
      });
      return { datum: k.datum, regioner: regioner, kommentar: typeof k.kommentar === "string" ? k.kommentar : "" };
    });
  }

  if (Array.isArray(data.pass)) {
    ren.pass = data.pass.filter(function (p) {
      return p && typeof p === "object" && typeof p.datum === "string" && Array.isArray(p.poster);
    }).map(function (p, i) {
      return {
        id: typeof p.id === "string" ? p.id : "import" + i,
        datum: p.datum,
        rubrik: typeof p.rubrik === "string" ? p.rubrik : "",
        kommentar: typeof p.kommentar === "string" ? p.kommentar : "",
        poster: p.poster.filter(function (post) {
          return post && typeof post === "object" && typeof post.ovningId === "string";
        }).map(function (post) {
          var renPost = { ovningId: post.ovningId, smarta: Math.max(0, Math.min(10, Number(post.smarta) || 0)) };
          ["set", "reps", "vikt", "sek", "min", "gangsteg"].forEach(function (f) {
            if (post[f] !== undefined) renPost[f] = Math.max(0, Number(post[f]) || 0);
          });
          if (typeof post.kommentar === "string") renPost.kommentar = post.kommentar;
          return renPost;
        })
      };
    });
  }

  return ren;
}

function laddaData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return tomData();
    return normaliseraData(JSON.parse(raw));
  } catch (e) {
    console.error("Kunde inte läsa sparad data:", e);
    return tomData();
  }
}

function sparaData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Kunde inte spara:", e);
    alert("Kunde inte spara – lagringen kan vara full eller blockerad.");
    return false;
  }
}

/* ---------- Datumhjälpare ---------- */
function idagStr() {
  return datumStr(new Date());
}

function datumStr(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var dag = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dag;
}

function parseDatum(s) {
  var delar = s.split("-");
  return new Date(Number(delar[0]), Number(delar[1]) - 1, Number(delar[2]));
}

/* Måndag som veckostart. Returnerar 'YYYY-MM-DD' för måndagen i samma vecka. */
function veckostart(datumStrIn) {
  var d = parseDatum(datumStrIn);
  var dag = (d.getDay() + 6) % 7; /* mån=0 ... sön=6 */
  d.setDate(d.getDate() - dag);
  return datumStr(d);
}

function dagarMellan(a, b) {
  return Math.round((parseDatum(b) - parseDatum(a)) / 86400000);
}

var VECKODAGAR = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

function veckodagsIndex(datumStrIn) {
  return (parseDatum(datumStrIn).getDay() + 6) % 7; /* mån=0 */
}

function finDatum(datumStrIn) {
  var d = parseDatum(datumStrIn);
  var man = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return d.getDate() + " " + man[d.getMonth()] + " " + d.getFullYear();
}

/* ---------- Export / import ---------- */
function exporteraData(data) {
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "pt-data-" + idagStr() + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importeraData(fil, klar) {
  var lasare = new FileReader();
  lasare.onload = function () {
    try {
      var data = JSON.parse(lasare.result);
      if (!data || data.version !== 1 || !Array.isArray(data.pass)) {
        alert("Filen ser inte ut som en export från den här sidan.");
        return;
      }
      klar(normaliseraData(data));
    } catch (e) {
      alert("Kunde inte läsa filen: " + e.message);
    }
  };
  lasare.readAsText(fil);
}

/* ---------- Sammanfattning att klistra in i en Claude-chatt ---------- */
function claudeSammanfattning(data) {
  var rader = [];
  rader.push("Sammanfattning av min träning (från min PT-sida), " + idagStr() + ":");
  rader.push("Fas: " + data.installningar.fas + ". Gångprogram: steg " + data.installningar.gangsteg + ".");
  rader.push("");

  var fyraVeckorSedan = new Date();
  fyraVeckorSedan.setDate(fyraVeckorSedan.getDate() - 28);
  var grans = datumStr(fyraVeckorSedan);

  var senaste = data.pass
    .filter(function (p) { return p.datum >= grans; })
    .sort(function (a, b) { return a.datum < b.datum ? -1 : 1; });

  rader.push("Pass senaste 4 veckorna: " + senaste.length + " st.");
  senaste.forEach(function (p) {
    var poster = p.poster.map(function (post) {
      var o = getOvning(post.ovningId);
      var namn = o ? o.namn : post.ovningId;
      var dos = [];
      if (post.set) dos.push(post.set + " set");
      if (post.reps) dos.push(post.reps + " reps");
      if (post.vikt) dos.push(post.vikt + " kg");
      if (post.sek) dos.push(post.sek + " sek");
      if (post.min) dos.push(post.min + " min");
      return namn + " (" + dos.join(", ") + ", smärta " + post.smarta + "/10)";
    });
    rader.push("- " + p.datum + " " + (p.rubrik || "Pass") + ": " + poster.join("; "));
  });

  var koll = data.morgonkoll.filter(function (k) { return k.datum >= grans; });
  if (koll.length) {
    rader.push("");
    rader.push("Morgonkoll (dagar med känningar, 0–10):");
    koll.forEach(function (k) {
      var delar = [];
      Object.keys(k.regioner || {}).forEach(function (r) {
        if (k.regioner[r] > 0) delar.push((REGIONER[r] ? REGIONER[r].namn : r) + " " + k.regioner[r]);
      });
      if (delar.length) rader.push("- " + k.datum + ": " + delar.join(", ") + (k.kommentar ? " (" + k.kommentar + ")" : ""));
    });
  }

  rader.push("");
  rader.push("Vad tycker du om min stegring, och vad borde jag ändra kommande vecka?");
  return rader.join("\n");
}
