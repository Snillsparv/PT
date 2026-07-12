/* =========================================================
   app.js — vyer, formulär och interaktion.
   ========================================================= */

"use strict";

var DATA = laddaData();

var LAGE = {
  flik: "idag",
  loggPoster: [],      /* poster som håller på att loggas */
  loggRubrik: "",
  senasteFeedback: []  /* feedback från senast sparade pass */
};

/* ---------- DOM-hjälpare ---------- */
function el(tagg, attr, barn) {
  var e = document.createElement(tagg);
  if (attr) {
    Object.keys(attr).forEach(function (k) {
      if (k === "class") e.className = attr[k];
      else if (k === "text") e.textContent = attr[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attr[k]);
      else e.setAttribute(k, attr[k]);
    });
  }
  (barn || []).forEach(function (b) {
    if (b === null || b === undefined) return;
    if (typeof b === "string") e.appendChild(document.createTextNode(b));
    else e.appendChild(b);
  });
  return e;
}

function toms(nod) { while (nod.firstChild) nod.removeChild(nod.firstChild); }

/* ---------- Meddelanderendering ---------- */
var NIVA_ETIKETT = { ok: "✓ Grönt", info: "ℹ Info", varning: "⚠ Gult", stopp: "⛔ Rött" };

function meddElement(m) {
  return el("div", { class: "medd medd-" + m.niva }, [
    el("span", { class: "medd-etikett", text: NIVA_ETIKETT[m.niva] + ": " }),
    m.text,
    m.varfor ? el("span", { class: "varfor", text: "Varför? " + m.varfor }) : null
  ]);
}

/* ---------- Smärtfärg ---------- */
function smartaKlass(v) {
  if (v <= SMARTA_GRONT_MAX) return "smarta-gron";
  if (v <= SMARTA_GULT_MAX) return "smarta-gul";
  return "smarta-rod";
}

/* ---------- Flikar ---------- */
var FLIKAR = [
  { id: "idag", namn: "Idag", ikon: "☀️" },
  { id: "logga", namn: "Logga", ikon: "✏️" },
  { id: "program", namn: "Program", ikon: "🗓️" },
  { id: "ovningar", namn: "Övningar", ikon: "💪" },
  { id: "historik", namn: "Historik", ikon: "📈" },
  { id: "profil", namn: "Profil", ikon: "🩺" }
];

function bytFlik(flikId) {
  LAGE.flik = flikId;
  document.querySelectorAll("nav.flikar button").forEach(function (b) {
    b.classList.toggle("aktiv", b.dataset.flik === flikId);
  });
  document.querySelectorAll("section.vy").forEach(function (s) {
    s.classList.toggle("aktiv", s.id === "vy-" + flikId);
  });
  renderaFlik(flikId);
  window.scrollTo(0, 0);
}

function renderaFlik(flikId) {
  if (flikId === "idag") renderaIdag();
  if (flikId === "logga") renderaLogga();
  if (flikId === "program") renderaProgram();
  if (flikId === "ovningar") renderaOvningar();
  if (flikId === "historik") renderaHistorik();
  if (flikId === "profil") renderaProfil();
}

/* =========================================================
   VY: IDAG
   ========================================================= */
function renderaIdag() {
  var vy = document.getElementById("vy-idag");
  toms(vy);

  var plan = dagensPass(DATA);
  var idag = idagStr();

  /* Dagens pass */
  var passKort = el("div", { class: "kort" }, [
    el("h2", { text: VECKODAGAR[veckodagsIndex(idag)] + " " + finDatum(idag) }),
    el("p", { class: "dampad", text: plan.fas.namn + " · Dagens fokus: " + plan.rubrik })
  ]);

  if (plan.ovningar.length) {
    var lista = el("ul", { class: "passlista" });
    plan.ovningar.forEach(function (o) {
      var dosStr = dosText(o);
      if (o.id === "gang") {
        var gs = gangStatus(DATA);
        dosStr = "steg " + gs.steg + ": " + gs.info.beskrivning;
      }
      lista.appendChild(el("li", null, [
        el("span", { text: o.namn }),
        el("span", { class: "dos", text: dosStr })
      ]));
    });
    passKort.appendChild(lista);
    passKort.appendChild(el("div", { class: "knapprad" }, [
      el("button", {
        class: "primar", text: "Logga dagens pass",
        onclick: function () { forbestamLogg(plan); }
      })
    ]));
  } else {
    passKort.appendChild(el("p", { text: "Vilodag! Vila är träning för dina senor – njut av den med gott samvete." }));
  }

  plan.justeringar.forEach(function (m) { passKort.appendChild(meddElement(m)); });
  vy.appendChild(passKort);

  /* Morgonkoll */
  vy.appendChild(morgonkollKort());

  /* Veckans läge */
  var analys = veckoAnalys(DATA);
  if (analys.length) {
    var lage = el("div", { class: "kort" }, [el("h2", { text: "Veckans läge" })]);
    analys.forEach(function (m) { lage.appendChild(meddElement(m)); });
    vy.appendChild(lage);
  }

  /* Senaste feedback (från nyss sparat pass) */
  if (LAGE.senasteFeedback.length) {
    var fb = el("div", { class: "kort" }, [el("h2", { text: "Feedback på senaste passet" })]);
    LAGE.senasteFeedback.forEach(function (m) { fb.appendChild(meddElement(m)); });
    vy.appendChild(fb);
  }

  /* Kom igång-hjälp */
  if (!DATA.pass.length) {
    vy.appendChild(el("div", { class: "kort" }, [
      el("h2", { text: "Välkommen! Så här funkar det" }),
      el("p", { text: "1. Kolla in fliken Program – där finns din plan, fas för fas, och gångprogrammet." }),
      el("p", { text: "2. Varje dag visar den här sidan ett förslag på pass. Gör det som känns rimligt – mindre är alltid okej." }),
      el("p", { text: "3. Logga det du gjorde under fliken Logga och ange hur det kändes (0–10). Det är smärtsiffrorna som styr när du ska stegra – sidan säger till när det är dags." }),
      el("p", { text: "4. Fyll gärna i morgonkollen varje dag – då anpassas dagens förslag efter hur kroppen mår." }),
      el("p", { class: "dampad", text: "All data sparas bara i din webbläsare. Ta en export då och då under fliken Historik." })
    ]));
  }
}

function morgonkollKort() {
  var koll = dagensMorgonkoll(DATA);
  var kort = el("div", { class: "kort" }, [el("h2", { text: "Morgonkoll" })]);

  if (koll && !koll._redigerar) {
    var delar = [];
    Object.keys(koll.regioner || {}).forEach(function (r) {
      if (Number(koll.regioner[r]) > 0) delar.push(REGIONER[r].namn + " " + koll.regioner[r] + "/10");
    });
    kort.appendChild(el("p", {
      text: delar.length ? "Dagens läge: " + delar.join(", ") + "." : "Dagens läge: allt känns bra! 🎉"
    }));
    kort.appendChild(el("div", { class: "knapprad" }, [
      el("button", {
        class: "mini", text: "Ändra",
        onclick: function () { koll._redigerar = true; renderaIdag(); }
      })
    ]));
    return kort;
  }

  kort.appendChild(el("p", { class: "dampad", text: "Hur känns kroppen i dag? 0 = inget alls, 10 = värsta tänkbara." }));

  var varden = {};
  Object.keys(REGIONER).forEach(function (r) {
    if (!REGIONER[r].checkin) return;
    varden[r] = koll && koll.regioner ? Number(koll.regioner[r]) || 0 : 0;

    var vardeRuta = el("span", { class: "smarta-varde " + smartaKlass(varden[r]), text: varden[r] + "/10" });
    var slider = el("input", {
      type: "range", min: "0", max: "10", step: "1", value: String(varden[r]),
      "aria-label": REGIONER[r].namn,
      oninput: function (e) {
        varden[r] = Number(e.target.value);
        vardeRuta.textContent = varden[r] + "/10";
        vardeRuta.className = "smarta-varde " + smartaKlass(varden[r]);
      }
    });
    kort.appendChild(el("div", { class: "kollrad" }, [
      el("span", { class: "region-namn", text: REGIONER[r].namn }),
      slider,
      vardeRuta
    ]));
  });

  kort.appendChild(el("div", { class: "knapprad" }, [
    el("button", {
      class: "primar", text: "Spara morgonkoll",
      onclick: function () {
        var idag = idagStr();
        DATA.morgonkoll = DATA.morgonkoll.filter(function (k) { return k.datum !== idag; });
        DATA.morgonkoll.push({ datum: idag, regioner: varden, kommentar: "" });
        sparaData(DATA);
        renderaIdag();
      }
    })
  ]));

  return kort;
}

/* =========================================================
   VY: LOGGA
   ========================================================= */
function forbestamLogg(plan) {
  LAGE.loggPoster = plan.ovningar.map(function (o) { return nyPost(o.id); });
  LAGE.loggRubrik = plan.rubrik;
  bytFlik("logga");
}

function nyPost(ovningId) {
  var o = getOvning(ovningId);
  var post = { ovningId: ovningId, smarta: 0, kommentar: "" };
  if (o.dos.min) {
    post.min = o.dos.min;
    if (ovningId === "gang") {
      var gs = gangStatus(DATA);
      post.min = gs.info.totalMin;
    }
  } else {
    post.set = o.dos.set;
    if (o.dos.sek) post.sek = o.dos.sek;
    if (o.dos.reps) post.reps = o.dos.reps;
    if (o.typ === "styrka") post.vikt = 0;
  }
  return post;
}

function renderaLogga() {
  var vy = document.getElementById("vy-logga");
  toms(vy);

  var kort = el("div", { class: "kort" }, [el("h2", { text: "Logga ett pass" })]);

  /* Datum + rubrik */
  var datumInput = el("input", { type: "date", value: idagStr(), max: idagStr() });
  var rubrikInput = el("input", { type: "text", value: LAGE.loggRubrik, placeholder: "t.ex. Underkropp A" });
  kort.appendChild(el("label", { text: "Datum" }));
  kort.appendChild(datumInput);
  kort.appendChild(el("label", { text: "Rubrik (valfritt)" }));
  kort.appendChild(rubrikInput);

  /* Lägg till övning */
  var valj = el("select", { "aria-label": "Välj övning" });
  valj.appendChild(el("option", { value: "", text: "+ Lägg till övning …" }));
  var grupper = ovningarPerRegion();
  Object.keys(REGIONER).forEach(function (r) {
    if (!grupper[r]) return;
    var grupp = el("optgroup", { label: REGIONER[r].namn });
    grupper[r].forEach(function (o) {
      grupp.appendChild(el("option", { value: o.id, text: o.namn + " (nivå " + o.niva + ")" }));
    });
    valj.appendChild(grupp);
  });
  valj.addEventListener("change", function () {
    if (!valj.value) return;
    LAGE.loggPoster.push(nyPost(valj.value));
    valj.value = "";
    renderaLogga();
  });
  kort.appendChild(el("label", { text: "Övningar" }));
  kort.appendChild(valj);

  /* Poster */
  LAGE.loggPoster.forEach(function (post, index) {
    kort.appendChild(postFormular(post, index));
  });

  /* Spara */
  if (LAGE.loggPoster.length) {
    kort.appendChild(el("div", { class: "knapprad" }, [
      el("button", {
        class: "primar", text: "Spara passet",
        onclick: function () { sparaPass(datumInput.value, rubrikInput.value); }
      }),
      el("button", {
        class: "sekundar", text: "Rensa",
        onclick: function () { LAGE.loggPoster = []; LAGE.loggRubrik = ""; renderaLogga(); }
      })
    ]));
  } else {
    kort.appendChild(el("p", { class: "dampad", text: "Lägg till övningarna du gjorde (eller gå via Idag-fliken så fylls dagens pass i automatiskt)." }));
  }

  vy.appendChild(kort);

  /* Feedback från senaste sparningen */
  if (LAGE.senasteFeedback.length) {
    var fb = el("div", { class: "kort" }, [el("h2", { text: "Feedback på passet" })]);
    LAGE.senasteFeedback.forEach(function (m) { fb.appendChild(meddElement(m)); });
    vy.appendChild(fb);
  }
}

function postFormular(post, index) {
  var o = getOvning(post.ovningId);
  var ruta = el("div", { class: "ovning-kort" });

  var rubrikRad = el("div", { class: "post-rad" }, [
    el("strong", { text: o.namn }),
    el("button", {
      class: "mini", text: "Ta bort",
      onclick: function () { LAGE.loggPoster.splice(index, 1); renderaLogga(); }
    })
  ]);
  ruta.appendChild(rubrikRad);

  var falt = el("div", { class: "falt-rad" });

  function nummerFalt(egenskap, etikett, steg) {
    var wrapper = el("div", null, [el("label", { text: etikett })]);
    wrapper.appendChild(el("input", {
      type: "number", min: "0", step: steg || "1", value: String(post[egenskap] || 0),
      inputmode: "decimal",
      oninput: function (e) { post[egenskap] = Number(e.target.value) || 0; }
    }));
    return wrapper;
  }

  if (post.min !== undefined) {
    falt.appendChild(nummerFalt("min", "Minuter"));
  } else {
    falt.appendChild(nummerFalt("set", "Set"));
    if (post.sek !== undefined) falt.appendChild(nummerFalt("sek", "Sek/håll"));
    if (post.reps !== undefined) falt.appendChild(nummerFalt("reps", "Reps"));
    if (post.vikt !== undefined) falt.appendChild(nummerFalt("vikt", "Vikt (kg)", "0.5"));
  }
  ruta.appendChild(falt);

  /* Smärta */
  var vardeRuta = el("span", { class: "smarta-varde " + smartaKlass(post.smarta), text: post.smarta + "/10" });
  var slider = el("input", {
    type: "range", min: "0", max: "10", step: "1", value: String(post.smarta),
    "aria-label": "Smärta under " + o.namn,
    oninput: function (e) {
      post.smarta = Number(e.target.value);
      vardeRuta.textContent = post.smarta + "/10";
      vardeRuta.className = "smarta-varde " + smartaKlass(post.smarta);
    }
  });
  ruta.appendChild(el("label", { text: "Smärta under övningen (0–10)" }));
  ruta.appendChild(el("div", { class: "smarta-rad" }, [slider, vardeRuta]));

  return ruta;
}

function sparaPass(datum, rubrik) {
  if (!datum) { alert("Välj ett datum."); return; }

  var pass = {
    id: "p" + Date.now() + Math.floor(Math.random() * 1000),
    datum: datum,
    rubrik: rubrik || "",
    poster: LAGE.loggPoster,
    kommentar: ""
  };

  DATA.pass.push(pass);

  /* Gångprogrammet: uppgradera steget automatiskt efter tre gröna */
  var gangPost = pass.poster.find(function (p) { return p.ovningId === "gang"; });
  var gangMedd = null;
  if (gangPost) {
    var gs = gangStatus(DATA);
    if (gs.redoForNasta) {
      DATA.installningar.gangsteg = Math.min(DATA.installningar.gangsteg + 1, GANGPROGRAM.length);
      var nytt = GANGPROGRAM[DATA.installningar.gangsteg - 1];
      gangMedd = {
        niva: "ok",
        text: "Tre gröna gångpass i rad – gångprogrammet höjs till steg " + nytt.steg + ": " + nytt.beskrivning + " 🎉",
        varfor: "Gångprogrammets regel: tre gröna pass på samma steg → nästa steg."
      };
    }
  }

  LAGE.senasteFeedback = analyseraPass(pass, DATA);
  if (gangMedd) LAGE.senasteFeedback.push(gangMedd);

  sparaData(DATA);
  LAGE.loggPoster = [];
  LAGE.loggRubrik = "";
  renderaLogga();
}

/* =========================================================
   VY: PROGRAM
   ========================================================= */
function renderaProgram() {
  var vy = document.getElementById("vy-program");
  toms(vy);

  var aktuellFas = DATA.installningar.fas;

  /* Gångprogrammet */
  var gs = gangStatus(DATA);
  var gangKort = el("div", { class: "kort" }, [
    el("h2", { text: "Gångprogrammet – vägen till vanliga promenader" }),
    el("p", { class: "dampad", text: GANGREGLER })
  ]);

  var stegRad = el("div", { class: "gangsteg" });
  GANGPROGRAM.forEach(function (s) {
    var klass = "";
    if (s.steg < gs.steg) klass = "klar";
    if (s.steg === gs.steg) klass = "nu";
    stegRad.appendChild(el("span", { class: klass, text: String(s.steg), title: s.beskrivning }));
  });
  gangKort.appendChild(stegRad);
  gangKort.appendChild(el("p", null, [
    el("strong", { text: "Nuvarande steg " + gs.steg + ": " }),
    gs.info.beskrivning
  ]));
  if (gs.redoForNasta) {
    gangKort.appendChild(meddElement({
      niva: "ok",
      text: "Tre gröna gångpass i rad – du är redo för steg " + (gs.steg + 1) + "!",
      varfor: "Tre gröna pass på samma steg är regeln för att gå vidare."
    }));
  }
  gangKort.appendChild(el("div", { class: "knapprad" }, [
    el("button", {
      class: "sekundar", text: "Gå upp ett steg",
      onclick: function () {
        DATA.installningar.gangsteg = Math.min(DATA.installningar.gangsteg + 1, GANGPROGRAM.length);
        sparaData(DATA); renderaProgram();
      }
    }),
    el("button", {
      class: "sekundar", text: "Gå ner ett steg",
      onclick: function () {
        DATA.installningar.gangsteg = Math.max(DATA.installningar.gangsteg - 1, 1);
        sparaData(DATA); renderaProgram();
      }
    })
  ]));
  vy.appendChild(gangKort);

  /* Faserna */
  FASER.forEach(function (fas) {
    var arAktuell = fas.nr === aktuellFas;
    var kort = el("div", { class: "kort fas-kort" + (arAktuell ? " aktiv-fas" : "") }, [
      el("h2", { text: fas.namn + (arAktuell ? " (din nuvarande fas)" : "") }),
      el("p", { class: "dampad", text: "Längd: " + fas.langd }),
      el("p", { text: fas.fokus }),
      el("p", null, [el("strong", { text: "För att gå vidare: " }), fas.kravForNasta])
    ]);

    var schema = el("details", { class: "expander" }, [
      el("summary", { text: "Visa veckoschema" })
    ]);
    fas.vecka.forEach(function (dag) {
      var dagDiv = el("div", null, [el("h3", { text: dag.dag + " – " + dag.rubrik })]);
      if (!dag.ovningar.length) {
        dagDiv.appendChild(el("p", { class: "dampad", text: "Vila." }));
      } else {
        var lista = el("ul", { class: "passlista" });
        dag.ovningar.forEach(function (id) {
          var o = getOvning(id);
          if (!o) return;
          lista.appendChild(el("li", null, [
            el("span", { text: o.namn }),
            el("span", { class: "dos", text: dosText(o) })
          ]));
        });
        dagDiv.appendChild(lista);
      }
      schema.appendChild(dagDiv);
    });
    kort.appendChild(schema);

    if (!arAktuell) {
      kort.appendChild(el("div", { class: "knapprad" }, [
        el("button", {
          class: "sekundar", text: "Byt till den här fasen",
          onclick: function () {
            DATA.installningar.fas = fas.nr;
            sparaData(DATA);
            renderaProgram();
          }
        })
      ]));
    }
    vy.appendChild(kort);
  });

  /* Principer */
  var principKort = el("div", { class: "kort" }, [el("h2", { text: "Träningsprinciperna (läs då och då!)" })]);
  PRINCIPER.forEach(function (p) {
    principKort.appendChild(el("h3", { text: p.rubrik }));
    principKort.appendChild(el("p", { class: "dampad", text: p.text }));
  });
  vy.appendChild(principKort);
}

/* =========================================================
   VY: ÖVNINGAR
   ========================================================= */
var TYP_NAMN = { iso: "Isometrisk", styrka: "Styrka", rorlighet: "Rörlighet", kondition: "Kondition" };

function renderaOvningar() {
  var vy = document.getElementById("vy-ovningar");
  toms(vy);

  var kort = el("div", { class: "kort" }, [
    el("h2", { text: "Övningsbibliotek" }),
    el("p", { class: "dampad", text: "Alla övningar är utvalda och doserade efter din historik. Nivå 1 hör till fas 1, och så vidare. Varje övning förklarar varför den är trygg just för dig." })
  ]);

  var filter = el("select", { "aria-label": "Filtrera på område" });
  filter.appendChild(el("option", { value: "", text: "Alla områden" }));
  Object.keys(REGIONER).forEach(function (r) {
    filter.appendChild(el("option", { value: r, text: REGIONER[r].namn }));
  });
  filter.addEventListener("change", function () { visaLista(filter.value); });
  kort.appendChild(filter);

  var listContainer = el("div");
  kort.appendChild(listContainer);

  function visaLista(region) {
    toms(listContainer);
    OVNINGAR.forEach(function (o) {
      if (region && o.region !== region) return;
      var detaljer = el("details", { class: "ovning-kort" }, [
        el("summary", null, [
          o.namn + " ",
          el("span", { class: "tagg", text: REGIONER[o.region].namn }),
          el("span", { class: "tagg", text: TYP_NAMN[o.typ] }),
          el("span", { class: "tagg tagg-niva", text: "Nivå " + o.niva })
        ]),
        el("p", null, [el("strong", { text: "Så gör du: " }), o.beskrivning]),
        el("p", null, [el("strong", { text: "Startdos: " }), dosText(o) + (o.utrustning ? " · Utrustning: " + o.utrustning : "")]),
        el("p", null, [el("strong", { text: "Därför är den bra för dig: " }), o.darfor]),
        el("p", null, [el("strong", { text: "Se upp med: " }), o.seUpp])
      ]);
      if (o.next) {
        var nasta = getOvning(o.next);
        detaljer.appendChild(el("p", { class: "liten", text: "Nästa steg i kedjan: " + nasta.namn }));
      }
      listContainer.appendChild(detaljer);
    });
  }

  visaLista("");
  vy.appendChild(kort);
}

/* =========================================================
   VY: HISTORIK
   ========================================================= */
function renderaHistorik() {
  var vy = document.getElementById("vy-historik");
  toms(vy);

  /* Statistik */
  var statKort = el("div", { class: "kort" }, [el("h2", { text: "Din träning i siffror" })]);
  var dennaVeckaStart = veckostart(idagStr());
  var passDennaVecka = DATA.pass.filter(function (p) { return veckostart(p.datum) === dennaVeckaStart; }).length;
  var statRad = el("div", { class: "statrad" }, [
    statRuta("Pass totalt", String(DATA.pass.length)),
    statRuta("Pass denna vecka", String(passDennaVecka)),
    statRuta("Gångprogram", "steg " + DATA.installningar.gangsteg + " av " + GANGPROGRAM.length),
    statRuta("Fas", String(DATA.installningar.fas) + " av 3")
  ]);
  statKort.appendChild(statRad);
  vy.appendChild(statKort);

  /* Diagram */
  vy.appendChild(diagramKort(
    "Belastning per vecka",
    "Summa belastningspoäng (set för styrka, halva för isometriskt, minuter/10 för kondition). Jämn, långsamt stigande kurva är målet – inte toppar.",
    veckoBelastningsSerie(),
    "stapel",
    { enhet: "poäng", etikettRubrik: "Vecka", vardeRubrik: "Belastning" }
  ));

  vy.appendChild(diagramKort(
    "Genomsnittlig smärta per vecka",
    "Snitt av alla smärtskattningar (0–10) under veckans pass. Under 2 är grön zon.",
    veckoSmartaSerie(),
    "linje",
    { enhet: "/10", maxVarde: 10, etikettRubrik: "Vecka", vardeRubrik: "Smärta" }
  ));

  vy.appendChild(diagramKort(
    "Gångminuter per vecka",
    "Totala promenadminuter per vecka – den viktigaste kurvan för ditt mål att kunna gå som vanligt.",
    veckoGangSerie(),
    "stapel",
    { enhet: "min", etikettRubrik: "Vecka", vardeRubrik: "Minuter" }
  ));

  /* Passhistorik */
  var passKort = el("div", { class: "kort" }, [el("h2", { text: "Loggade pass" })]);
  if (!DATA.pass.length) {
    passKort.appendChild(el("p", { class: "dampad", text: "Inga pass loggade ännu." }));
  }
  DATA.pass
    .slice()
    .sort(function (a, b) { return a.datum > b.datum ? -1 : 1; })
    .slice(0, 30)
    .forEach(function (p) {
      var ruta = el("div", { class: "pass-historik" });
      ruta.appendChild(el("header", null, [
        el("strong", { text: finDatum(p.datum) + (p.rubrik ? " – " + p.rubrik : "") }),
        el("button", {
          class: "mini", text: "Ta bort",
          onclick: function () {
            if (confirm("Ta bort passet " + p.datum + "?")) {
              DATA.pass = DATA.pass.filter(function (x) { return x.id !== p.id; });
              sparaData(DATA);
              renderaHistorik();
            }
          }
        })
      ]));
      p.poster.forEach(function (post) {
        var o = getOvning(post.ovningId);
        var namn = o ? o.namn : post.ovningId;
        var dos = [];
        if (post.set) dos.push(post.set + " set");
        if (post.reps) dos.push(post.reps + " reps");
        if (post.vikt) dos.push(post.vikt + " kg");
        if (post.sek) dos.push(post.sek + " sek");
        if (post.min) dos.push(post.min + " min");
        var smarta = Number(post.smarta) || 0;
        ruta.appendChild(el("div", { class: "post-rad" }, [
          el("span", { text: namn }),
          el("span", { class: "liten", text: dos.join(" · ") }),
          el("span", { class: "smarta-varde " + smartaKlass(smarta), text: smarta + "/10" })
        ]));
      });
      passKort.appendChild(ruta);
    });
  vy.appendChild(passKort);

  /* Data */
  var dataKort = el("div", { class: "kort" }, [
    el("h2", { text: "Din data" }),
    el("p", { class: "dampad", text: "Allt sparas lokalt i den här webbläsaren. Exportera regelbundet som säkerhetskopia, eller för att flytta till en annan enhet." })
  ]);
  var textOmrade = el("textarea", { class: "gomd", "aria-label": "Sammanfattning" });
  dataKort.appendChild(el("div", { class: "knapprad" }, [
    el("button", { class: "sekundar", text: "Exportera (JSON)", onclick: function () { exporteraData(DATA); } }),
    el("button", {
      class: "sekundar", text: "Importera",
      onclick: function () { document.getElementById("importFil").click(); }
    }),
    el("button", {
      class: "sekundar", text: "Kopiera sammanfattning till Claude",
      onclick: function () {
        var text = claudeSammanfattning(DATA);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            alert("Kopierat! Klistra in i en Claude-chatt för att få personlig feedback på din träning.");
          }, function () { visaText(); });
        } else { visaText(); }
        function visaText() {
          textOmrade.classList.remove("gomd");
          textOmrade.value = text;
          textOmrade.style.minHeight = "180px";
          textOmrade.select();
        }
      }
    }),
    el("button", {
      class: "fara", text: "Rensa all data",
      onclick: function () {
        if (confirm("Vill du verkligen radera ALL sparad träningsdata? Detta går inte att ångra.") &&
            confirm("Säker? Ta gärna en export först.")) {
          DATA = tomData();
          sparaData(DATA);
          LAGE.senasteFeedback = [];
          renderaHistorik();
        }
      }
    })
  ]));
  dataKort.appendChild(textOmrade);
  vy.appendChild(dataKort);
}

function statRuta(etikett, varde) {
  return el("div", { class: "statruta" }, [
    el("div", { class: "etikett", text: etikett }),
    el("div", { class: "varde", text: varde })
  ]);
}

function diagramKort(rubrik, forklaring, serie, typ, opts) {
  var kort = el("div", { class: "kort" }, [
    el("h2", { text: rubrik }),
    el("p", { class: "dampad", text: forklaring })
  ]);
  var behallare = el("div", { class: "diagram-behallare" });
  var tabellBehallare = el("div", { class: "gomd" });
  kort.appendChild(behallare);
  kort.appendChild(tabellBehallare);

  var visarTabell = false;
  var knapp = el("button", {
    class: "mini", text: "Visa som tabell",
    onclick: function () {
      visarTabell = !visarTabell;
      knapp.textContent = visarTabell ? "Visa som diagram" : "Visa som tabell";
      behallare.classList.toggle("gomd", visarTabell);
      tabellBehallare.classList.toggle("gomd", !visarTabell);
      if (visarTabell) ritaTabell(tabellBehallare, serie, opts);
      else rita();
    }
  });
  if (serie.length) kort.appendChild(knapp);

  function rita() {
    if (typ === "stapel") ritaStapeldiagram(behallare, serie, opts);
    else ritaLinjediagram(behallare, serie, opts);
  }

  /* Rita efter att kortet hamnat i DOM (behöver bredd) */
  requestAnimationFrame(rita);
  return kort;
}

/* ---------- Seriedata för diagram ---------- */
function senasteVeckor(antal) {
  var veckor = [];
  var start = veckostart(idagStr());
  for (var i = antal - 1; i >= 0; i--) {
    var d = parseDatum(start);
    d.setDate(d.getDate() - i * 7);
    veckor.push(datumStr(d));
  }
  return veckor;
}

function veckoEtikett(veckoStartStr) {
  var d = parseDatum(veckoStartStr);
  return d.getDate() + "/" + (d.getMonth() + 1);
}

function veckoBelastningsSerie() {
  if (!DATA.pass.length) return [];
  var veckor = senasteVeckor(8);
  return veckor.map(function (v) {
    var summa = 0;
    DATA.pass.forEach(function (p) {
      if (veckostart(p.datum) !== v) return;
      p.poster.forEach(function (post) { summa += belastningsPoang(post); });
    });
    return { etikett: veckoEtikett(v), varde: Math.round(summa * 10) / 10 };
  });
}

function veckoSmartaSerie() {
  if (!DATA.pass.length) return [];
  var veckor = senasteVeckor(8);
  var serie = [];
  veckor.forEach(function (v) {
    var summa = 0, antal = 0;
    DATA.pass.forEach(function (p) {
      if (veckostart(p.datum) !== v) return;
      p.poster.forEach(function (post) {
        summa += Number(post.smarta) || 0;
        antal++;
      });
    });
    if (antal > 0) serie.push({ etikett: veckoEtikett(v), varde: Math.round((summa / antal) * 10) / 10 });
  });
  return serie;
}

function veckoGangSerie() {
  if (!DATA.pass.length) return [];
  var veckor = senasteVeckor(8);
  return veckor.map(function (v) {
    var summa = 0;
    DATA.pass.forEach(function (p) {
      if (veckostart(p.datum) !== v) return;
      p.poster.forEach(function (post) {
        if (post.ovningId === "gang") summa += post.min || 0;
      });
    });
    return { etikett: veckoEtikett(v), varde: summa };
  });
}

/* =========================================================
   VY: PROFIL
   ========================================================= */
function renderaProfil() {
  var vy = document.getElementById("vy-profil");
  toms(vy);

  vy.appendChild(el("div", { class: "kort" }, [
    el("h2", { text: "Din hälsoprofil" }),
    el("p", { text: PROFIL.sammanfattning })
  ]));

  var regionKort = el("div", { class: "kort" }, [el("h2", { text: "Område för område" })]);
  PROFIL.regioner.forEach(function (r) {
    regionKort.appendChild(el("h3", { text: REGIONER[r.region].namn }));
    regionKort.appendChild(el("p", { class: "dampad", text: r.historik }));
    regionKort.appendChild(el("p", null, [el("strong", { text: "Strategi: " }), r.strategi]));
  });
  vy.appendChild(regionKort);

  var sakerhet = el("div", { class: "kort" }, [el("h2", { text: "Viktigt" })]);
  sakerhet.appendChild(meddElement({
    niva: "varning",
    text: PROFIL.varningstecken,
    varfor: null
  }));
  sakerhet.appendChild(el("p", { class: "dampad", text: PROFIL.disclaimer }));
  vy.appendChild(sakerhet);
}

/* =========================================================
   START
   ========================================================= */
function init() {
  var nav = document.querySelector("nav.flikar");
  FLIKAR.forEach(function (f) {
    var knapp = el("button", { "data-flik": f.id }, [
      el("span", { class: "ikon", text: f.ikon }),
      el("span", { text: f.namn })
    ]);
    knapp.dataset.flik = f.id;
    knapp.addEventListener("click", function () { bytFlik(f.id); });
    nav.appendChild(knapp);
  });
  bytFlik("idag");
}

document.addEventListener("DOMContentLoaded", init);
