/* =========================================================
   charts.js — små SVG-diagram (stapel + linje) med tooltip.
   Färger och mått följer sidans designsystem (CSS-variabler).
   ========================================================= */

"use strict";

var SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(namn, attr) {
  var el = document.createElementNS(SVG_NS, namn);
  Object.keys(attr || {}).forEach(function (k) { el.setAttribute(k, attr[k]); });
  return el;
}

/* Snygga y-axelsteg: 1/2/5 × 10^k */
function fintSteg(max) {
  if (max <= 0) return 1;
  var ratt = max / 4;
  var tio = Math.pow(10, Math.floor(Math.log10(ratt)));
  var kandidater = [1, 2, 5, 10];
  for (var i = 0; i < kandidater.length; i++) {
    if (kandidater[i] * tio >= ratt) return kandidater[i] * tio;
  }
  return 10 * tio;
}

function formateraVarde(v) {
  if (Math.abs(v - Math.round(v)) < 0.001) return String(Math.round(v));
  return v.toFixed(1).replace(".", ",");
}

/* Gemensam grund: yta, skalor, gridlines, tooltip-div */
function diagramGrund(container, serie, opts) {
  container.innerHTML = "";
  var harData = serie.some(function (p) { return p.varde !== null && p.varde !== undefined; });
  if (!serie.length || !harData) {
    var tomt = document.createElement("p");
    tomt.className = "diagram-tomt";
    tomt.textContent = "Ingen data ännu – logga några pass så växer diagrammet fram här.";
    container.appendChild(tomt);
    return null;
  }

  var bredd = Math.max(container.clientWidth || 320, 280);
  var hojd = 200;
  var marg = { topp: 12, hoger: 12, botten: 28, vanster: 34 };

  var maxV = 0;
  serie.forEach(function (p) { if (p.varde !== null && p.varde > maxV) maxV = p.varde; });
  var steg = fintSteg(opts && opts.maxVarde ? opts.maxVarde : maxV);
  var toppV = (opts && opts.maxVarde) ? opts.maxVarde : Math.max(steg, Math.ceil(maxV / steg) * steg);

  var plotB = bredd - marg.vanster - marg.hoger;
  var plotH = hojd - marg.topp - marg.botten;

  /* width 100 % + height auto ger likformig skalning – tooltip-läget kan
     då räknas om med EN faktor även efter fönsterändring. */
  var svg = svgEl("svg", {
    viewBox: "0 0 " + bredd + " " + hojd,
    style: "width:100%;height:auto;display:block",
    role: "img",
    "aria-label": (opts && opts.ariaEtikett) || "Diagram"
  });

  /* Gridlines + y-etiketter */
  for (var v = 0; v <= toppV + 0.001; v += steg) {
    var y = marg.topp + plotH - (v / toppV) * plotH;
    svg.appendChild(svgEl("line", {
      x1: marg.vanster, x2: bredd - marg.hoger, y1: y, y2: y,
      "class": v === 0 ? "diagram-baslinje" : "diagram-grid"
    }));
    var text = svgEl("text", { x: marg.vanster - 6, y: y + 3, "class": "diagram-tick", "text-anchor": "end" });
    text.textContent = formateraVarde(v);
    svg.appendChild(text);
  }

  container.appendChild(svg);

  var tooltip = document.createElement("div");
  tooltip.className = "diagram-tooltip";
  tooltip.hidden = true;
  container.appendChild(tooltip);

  return {
    svg: svg, tooltip: tooltip, bredd: bredd, hojd: hojd, marg: marg,
    plotB: plotB, plotH: plotH, toppV: toppV,
    yFor: function (varde) { return marg.topp + plotH - (Math.min(varde, toppV) / toppV) * plotH; }
  };
}

function visaTooltip(grund, container, x, y, rubrik, vardeText) {
  grund.tooltip.innerHTML = "";
  var r = document.createElement("div");
  r.className = "diagram-tooltip-rubrik";
  r.textContent = rubrik;
  var v = document.createElement("div");
  v.textContent = vardeText;
  grund.tooltip.appendChild(r);
  grund.tooltip.appendChild(v);
  grund.tooltip.hidden = false;

  /* Likformig skalning (height:auto) → samma faktor för x och y */
  var skala = grund.svg.getBoundingClientRect().width / grund.bredd;
  var px = x * skala;
  var py = y * skala;
  grund.tooltip.style.left = Math.min(Math.max(px, 40), container.clientWidth - 60) + "px";
  grund.tooltip.style.top = Math.max(py - 8, 0) + "px";
}

function gomTooltip(grund) {
  grund.tooltip.hidden = true;
}

/* ---------- Stapeldiagram (en serie) ---------- */
function ritaStapeldiagram(container, serie, opts) {
  opts = opts || {};
  var grund = diagramGrund(container, serie, opts);
  if (!grund) return;

  var n = serie.length;
  var band = grund.plotB / n;
  var stapelB = Math.min(24, Math.max(band * 0.6, 6));

  serie.forEach(function (p, i) {
    var xMitt = grund.marg.vanster + band * i + band / 2;
    var x = xMitt - stapelB / 2;
    var saknas = p.varde === null || p.varde === undefined;
    var y = grund.yFor(saknas ? 0 : p.varde);
    var basY = grund.yFor(0);
    var h = saknas ? 0 : Math.max(basY - y, 0);

    if (h > 0) {
      var r = Math.min(4, h);
      /* Rundat datataänd (toppen), rak baslinje */
      var d = "M" + x + "," + basY +
        " L" + x + "," + (y + r) +
        " Q" + x + "," + y + " " + (x + r) + "," + y +
        " L" + (x + stapelB - r) + "," + y +
        " Q" + (x + stapelB) + "," + y + " " + (x + stapelB) + "," + (y + r) +
        " L" + (x + stapelB) + "," + basY + " Z";
      grund.svg.appendChild(svgEl("path", { d: d, "class": "diagram-stapel" }));
    }

    /* Etikett under stapeln (glesa ut vid många staplar) */
    var visaEtikett = n <= 8 || i % Math.ceil(n / 8) === 0;
    if (visaEtikett) {
      var text = svgEl("text", {
        x: xMitt, y: grund.hojd - 10, "class": "diagram-tick", "text-anchor": "middle"
      });
      text.textContent = p.etikett;
      grund.svg.appendChild(text);
    }

    /* Träffyta för tooltip (hela bandet) */
    var traff = svgEl("rect", {
      x: grund.marg.vanster + band * i, y: grund.marg.topp,
      width: band, height: grund.plotH, fill: "transparent"
    });
    if (!saknas) {
      traff.addEventListener("mouseenter", function () {
        visaTooltip(grund, container, xMitt, y, p.etikett, formateraVarde(p.varde) + (opts.enhet ? " " + opts.enhet : ""));
      });
      traff.addEventListener("mouseleave", function () { gomTooltip(grund); });
    }
    grund.svg.appendChild(traff);
  });
}

/* ---------- Linjediagram (en serie; null = lucka i linjen) ---------- */
function ritaLinjediagram(container, serie, opts) {
  opts = opts || {};
  var grund = diagramGrund(container, serie, opts);
  if (!grund) return;

  var n = serie.length;
  var stegX = n > 1 ? grund.plotB / (n - 1) : 0;

  function xFor(i) {
    return n > 1 ? grund.marg.vanster + stegX * i : grund.marg.vanster + grund.plotB / 2;
  }

  /* Linjen – bryts vid null så att uppehåll syns som luckor. Punkter
     märkta prognos ritas som en streckad fortsättning från sista
     verkliga punkten. */
  if (n > 1) {
    var dUtfall = "", dPrognos = "";
    var forra = null; /* { x, y, prognos } för förra ritade punkten */
    serie.forEach(function (p, i) {
      if (p.varde === null || p.varde === undefined) { forra = null; return; }
      var x = xFor(i), y = grund.yFor(p.varde);
      if (!p.prognos) {
        dUtfall += (forra && !forra.prognos ? " L" : " M") + x + "," + y;
      } else if (forra && !forra.prognos) {
        /* övergången: prognosen börjar i sista verkliga punkten */
        dPrognos += " M" + forra.x + "," + forra.y + " L" + x + "," + y;
      } else {
        dPrognos += (forra ? " L" : " M") + x + "," + y;
      }
      forra = { x: x, y: y, prognos: !!p.prognos };
    });
    if (dUtfall) grund.svg.appendChild(svgEl("path", { d: dUtfall.trim(), "class": "diagram-linje" }));
    if (dPrognos) grund.svg.appendChild(svgEl("path", { d: dPrognos.trim(), "class": "diagram-linje prognos" }));
  }

  /* Punkter med yt-ring + träffytor */
  serie.forEach(function (p, i) {
    var cx = xFor(i);
    var saknas = p.varde === null || p.varde === undefined;

    var visaEtikett = n <= 8 || i % Math.ceil(n / 8) === 0;
    if (visaEtikett) {
      var text = svgEl("text", { x: cx, y: grund.hojd - 10, "class": "diagram-tick", "text-anchor": "middle" });
      text.textContent = p.etikett;
      grund.svg.appendChild(text);
    }

    if (saknas) return;

    var cy = grund.yFor(p.varde);
    grund.svg.appendChild(svgEl("circle", {
      cx: cx, cy: cy, r: 4,
      "class": "diagram-punkt" + (p.prognos ? " prognos" : "")
    }));

    var halvband = n > 1 ? stegX / 2 : grund.plotB / 2;
    var traff = svgEl("rect", {
      x: cx - halvband, y: grund.marg.topp, width: halvband * 2, height: grund.plotH, fill: "transparent"
    });
    traff.addEventListener("mouseenter", function () {
      visaTooltip(grund, container, cx, cy,
        p.etikett + (p.prognos ? " (prognos)" : ""),
        formateraVarde(p.varde) + (opts.enhet ? " " + opts.enhet : ""));
    });
    traff.addEventListener("mouseleave", function () { gomTooltip(grund); });
    grund.svg.appendChild(traff);
  });
}

/* ---------- Tabellvy (tillgänglighet) ---------- */
function ritaTabell(container, serie, opts) {
  opts = opts || {};
  container.innerHTML = "";
  if (!serie.length) return;
  var tabell = document.createElement("table");
  tabell.className = "diagram-tabell";
  var huvud = document.createElement("tr");
  var th1 = document.createElement("th");
  th1.textContent = opts.etikettRubrik || "Vecka";
  var th2 = document.createElement("th");
  th2.textContent = opts.vardeRubrik || "Värde";
  huvud.appendChild(th1);
  huvud.appendChild(th2);
  tabell.appendChild(huvud);
  serie.forEach(function (p) {
    var rad = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.textContent = p.etikett + (p.prognos ? " (prognos)" : "");
    var td2 = document.createElement("td");
    td2.textContent = (p.varde === null || p.varde === undefined)
      ? "–"
      : formateraVarde(p.varde) + (opts.enhet ? " " + opts.enhet : "");
    rad.appendChild(td1);
    rad.appendChild(td2);
    tabell.appendChild(rad);
  });
  container.appendChild(tabell);
}
