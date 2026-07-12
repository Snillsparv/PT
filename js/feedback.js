/* =========================================================
   feedback.js — regelmotorn som ger feedback, progressions-
   förslag och dagens pass. Alla regler är medvetet enkla och
   transparenta: varje meddelande förklarar sitt "varför".
   ========================================================= */

"use strict";

/* Smärtnivåer (trafikljuset) */
var SMARTA_GRONT_MAX = 2;
var SMARTA_GULT_MAX = 5;

/* ---------- Belastningspoäng ----------
   Ett enkelt, transparent mått per loggpost:
   styrka: set, isometriskt: set × 0,5, kondition/gång: minuter / 10.
------------------------------------------ */
function belastningsPoang(post) {
  var o = getOvning(post.ovningId);
  if (!o) return 0;
  if (o.typ === "kondition") return (post.min || 0) / 10;
  if (o.typ === "iso") return (post.set || 0) * 0.5;
  if (o.typ === "rorlighet") return 0;
  return post.set || 0;
}

function postensRegion(post) {
  var o = getOvning(post.ovningId);
  return o ? o.region : null;
}

/* Svenskt talformat (decimalkomma) */
function svTal(v) {
  return String(v).replace(".", ",");
}

function nastaDag(datumStrIn) {
  var d = parseDatum(datumStrIn);
  d.setDate(d.getDate() + 1);
  return datumStr(d);
}

/* Vilka morgonkoll-regioner en övning belastar */
function kollRegionerFor(ovning) {
  if (ovning.id === "gang") return ["underben", "fot", "kna"];
  if (ovning.id === "cykel") return ["kna"];
  return [ovning.region];
}

/* 24-timmarsregeln: var morgonen efter ett pass grön för övningens regioner?
   Saknas morgonkoll för dagen efter antas den vara okej. */
function morgonenEfterGron(datum, ovning, data) {
  var koll = data.morgonkoll.find(function (k) { return k.datum === nastaDag(datum); });
  if (!koll || !koll.regioner) return true;
  return kollRegionerFor(ovning).every(function (r) {
    return (Number(koll.regioner[r]) || 0) < 3;
  });
}

/* ---------- Analys direkt efter ett loggat pass ---------- */
function analyseraPass(pass, data) {
  var meddelanden = [];

  pass.poster.forEach(function (post) {
    var o = getOvning(post.ovningId);
    if (!o) return;
    var smarta = Number(post.smarta) || 0;

    if (smarta > SMARTA_GULT_MAX) {
      var reg = foregaendeOvning(o.id);
      meddelanden.push({
        niva: "stopp",
        text: o.namn + ": smärta " + smarta + "/10 är rött. Gör inte om den här dosen." +
          (reg ? " Backa till " + reg.namn + " nästa gång." : " Halvera dosen (eller vila området) nästa gång."),
        varfor: "Trafikljuset: över 5/10 betyder att vävnaden fick mer än den tålde idag."
      });
    } else if (smarta > SMARTA_GRONT_MAX) {
      meddelanden.push({
        niva: "varning",
        text: o.namn + ": smärta " + smarta + "/10 är gult. Stanna på exakt samma dos nästa pass och känn efter i morgon bitti.",
        varfor: "Trafikljuset: 3–5/10 är okej att träna på, men inte att stegra ifrån."
      });
    } else {
      var forslag = progressionsForslag(post.ovningId, data);
      if (forslag && forslag.redo) {
        meddelanden.push({
          niva: "ok",
          text: o.namn + ": grönt! " + forslag.text,
          varfor: forslag.varfor
        });
      } else {
        meddelanden.push({
          niva: "info",
          text: o.namn + ": grönt (" + smarta + "/10). Bra dos – kör samma en gång till innan du ökar.",
          varfor: "Regeln är två gröna pass i rad innan stegring."
        });
      }
    }
  });

  /* Kolla vila: styrka för samma region två dagar i rad */
  var igar = new Date(parseDatum(pass.datum));
  igar.setDate(igar.getDate() - 1);
  var igarStr = datumStr(igar);
  var passIgar = data.pass.filter(function (p) { return p.datum === igarStr && p.id !== pass.id; });
  var regionerIdag = {};
  pass.poster.forEach(function (post) {
    var o = getOvning(post.ovningId);
    if (o && o.typ === "styrka") regionerIdag[o.region] = true;
  });
  passIgar.forEach(function (p) {
    p.poster.forEach(function (post) {
      var o = getOvning(post.ovningId);
      if (o && o.typ === "styrka" && regionerIdag[o.region]) {
        meddelanden.push({
          niva: "varning",
          text: "Du styrketränade " + REGIONER[o.region].namn.toLowerCase() + " även igår. Ge området en vilodag i morgon.",
          varfor: "48-timmarsregeln: samma region behöver minst en dag mellan styrkepass. Isometriskt och promenader går bra oftare."
        });
      }
    });
  });

  return meddelanden;
}

/* ---------- Progressionsförslag för en övning ----------
   Redo att stegra när de två senaste loggningarna av övningen var
   gröna (≤2) BÅDE under passet och morgonen efter (24-timmarsregeln),
   och dosen inte minskade mellan passen.
--------------------------------------------------------- */
function progressionsForslag(ovningId, data) {
  var o = getOvning(ovningId);
  if (!o) return null;

  var loggar = [];
  data.pass
    .slice()
    .sort(function (a, b) { return a.datum < b.datum ? -1 : 1; })
    .forEach(function (p) {
      p.poster.forEach(function (post) {
        if (post.ovningId === ovningId) loggar.push({ post: post, datum: p.datum });
      });
    });

  if (loggar.length < 2) return { redo: false };

  var senaste = loggar.slice(-2);
  var badaGrona = senaste.every(function (l) {
    return (Number(l.post.smarta) || 0) <= SMARTA_GRONT_MAX && morgonenEfterGron(l.datum, o, data);
  });
  if (!badaGrona) return { redo: false };

  /* Dosen får inte ha minskat mellan de två passen */
  var dosHolls = ["set", "reps", "sek", "min", "vikt"].every(function (f) {
    var forra = Number(senaste[0].post[f]);
    var nu = Number(senaste[1].post[f]);
    if (isNaN(forra) || isNaN(nu)) return true;
    return nu >= forra;
  });
  if (!dosHolls) return { redo: false };

  var sista = senaste[1].post;

  if (o.typ === "kondition") {
    if (o.id === "gang") {
      return {
        redo: true,
        text: "Två gröna gångpass i rad – har du tre gröna på nuvarande steg är det dags för nästa steg i gångprogrammet (fliken Program).",
        varfor: "Gångprogrammet stegras efter tre gröna pass på samma steg."
      };
    }
    var minNu = sista.min || o.dos.min;
    var nyaMin = minNu + Math.max(1, Math.round(minNu * 0.05));
    return {
      redo: true,
      text: "Nästa gång kan du prova " + nyaMin + " min (ca 5 % mer).",
      varfor: "Två gröna pass i rad → en variabel får öka, ca 5 % för konditionstid."
    };
  }

  if (o.typ === "iso") {
    var sek = sista.sek || o.dos.sek;
    if (sek < 45) {
      return {
        redo: true,
        text: "Nästa gång kan du prova " + (sek + 5) + " sek per håll.",
        varfor: "Två gröna pass i rad → öka hålltiden med ~5 sek, upp till ca 45 sek."
      };
    }
    if (o.next) {
      var nastaIso = getOvning(o.next);
      return {
        redo: true,
        text: "Du håller redan " + sek + " sek – dags att prova nästa övning i kedjan: " + nastaIso.namn + " (nivå " + nastaIso.niva + ").",
        varfor: "När hålltiden är uppe i ~45 sek är nästa övning i progressionskedjan rätt steg."
      };
    }
    return {
      redo: true,
      text: "Du håller " + sek + " sek – lägg till ett set i stället för mer tid.",
      varfor: "Vid ~45 sek per håll är fler set nästa variabel."
    };
  }

  if (o.typ === "styrka") {
    var vikt = Number(sista.vikt) || 0;
    if (vikt > 0) {
      var nyVikt = Math.round((vikt * 1.05) * 2) / 2;
      if (nyVikt === vikt) nyVikt = vikt + 0.5;
      return {
        redo: true,
        text: "Nästa gång kan du prova " + svTal(nyVikt) + " kg (ca 5 % mer).",
        varfor: "Två gröna pass i rad → öka vikten med ~5 % (halva den vanliga tumregeln)."
      };
    }
    var reps = sista.reps || o.dos.reps;
    if (reps < 15) {
      return {
        redo: true,
        text: "Nästa gång kan du prova " + (reps + 1) + " reps per set.",
        varfor: "Två gröna pass i rad → +1 repetition per set, upp till ca 15."
      };
    }
    if (o.next) {
      var nasta = getOvning(o.next);
      return {
        redo: true,
        text: "15 reps känns lätt – dags att prova nästa övning i kedjan: " + nasta.namn + " (nivå " + nasta.niva + ").",
        varfor: "När repetitionerna är uppe i 15 är nästa övning i progressionskedjan rätt steg."
      };
    }
    return {
      redo: true,
      text: "15 reps känns lätt – lägg till ett set.",
      varfor: "Vid 15 reps per set är fler set nästa variabel."
    };
  }

  return { redo: false };
}

/* ---------- Veckoanalys / varningar ---------- */
function veckoAnalys(data) {
  var meddelanden = [];
  var idag = idagStr();

  if (!data.pass.length) return meddelanden;

  /* Inaktivitet */
  var senastePass = data.pass.reduce(function (max, p) { return p.datum > max ? p.datum : max; }, "0000-00-00");
  var dagarSedan = dagarMellan(senastePass, idag);
  if (dagarSedan >= 5) {
    meddelanden.push({
      niva: "info",
      text: "Det var " + dagarSedan + " dagar sedan senaste passet. Börja mjukt igen: kör nästa pass med ungefär 20 % mindre än sist.",
      varfor: "Efter ett uppehåll är tålighet det första som sjunker – en mjukstart förebygger bakslag."
    });
  }

  /* Veckobelastning per region: denna vecka mot snittet av föregående 4 veckor */
  var veckor = {};
  data.pass.forEach(function (p) {
    var v = veckostart(p.datum);
    if (!veckor[v]) veckor[v] = {};
    p.poster.forEach(function (post) {
      var region = postensRegion(post);
      if (!region) return;
      veckor[v][region] = (veckor[v][region] || 0) + belastningsPoang(post);
    });
  });

  var dennaVecka = veckostart(idag);
  var tidigareVeckor = Object.keys(veckor).filter(function (v) { return v < dennaVecka; }).sort().slice(-4);

  if (tidigareVeckor.length >= 2 && veckor[dennaVecka]) {
    Object.keys(veckor[dennaVecka]).forEach(function (region) {
      var nu = veckor[dennaVecka][region];
      var summa = 0;
      tidigareVeckor.forEach(function (v) { summa += veckor[v][region] || 0; });
      var snitt = summa / tidigareVeckor.length;
      if (snitt > 0.5 && nu > snitt * 1.3) {
        meddelanden.push({
          niva: "varning",
          text: REGIONER[region].namn + ": veckans volym är redan " + Math.round((nu / snitt) * 100) +
            " % av ditt 4-veckorssnitt. Låt resten av veckan vara lugn för det området.",
          varfor: "Snabba volymhopp (>130 % av snittet) är den vanligaste vägen till bakslag för senor och benhinnor."
        });
      }
    });
  }

  /* Lugn vecka var fjärde vecka (räknat från startdatum) */
  var veckorSedanStart = Math.floor(dagarMellan(veckostart(data.installningar.startdatum), dennaVecka) / 7);
  if (veckorSedanStart > 0 && (veckorSedanStart + 1) % 4 === 0) {
    meddelanden.push({
      niva: "info",
      text: "Det här är en lugn vecka: samma övningar, men hälften så många set. Stegra inte något den här veckan.",
      varfor: "Var fjärde vecka halveras volymen så att senor och leder hinner anpassa sig."
    });
  }

  /* Redo för nästa fas? */
  var fasTips = redoForNastaFas(data);
  if (fasTips) meddelanden.push(fasTips);

  return meddelanden;
}

/* ---------- Fasbedömning ---------- */
function redoForNastaFas(data) {
  var fas = data.installningar.fas;
  if (fas >= 3) return null;

  var idag = idagStr();
  var tvaVeckorSedan = new Date();
  tvaVeckorSedan.setDate(tvaVeckorSedan.getDate() - 14);
  var grans = datumStr(tvaVeckorSedan);

  var senaste = data.pass.filter(function (p) { return p.datum >= grans && p.datum <= idag; });
  if (senaste.length < 6) return null;

  var allaPoster = [];
  senaste.forEach(function (p) { allaPoster.push.apply(allaPoster, p.poster); });
  if (!allaPoster.length) return null;

  var snittSmarta = allaPoster.reduce(function (s, post) { return s + (Number(post.smarta) || 0); }, 0) / allaPoster.length;
  var nagonRod = allaPoster.some(function (post) { return (Number(post.smarta) || 0) > SMARTA_GULT_MAX; });

  if (snittSmarta > SMARTA_GRONT_MAX || nagonRod) return null;

  /* Fas 2→3 har extra krav: gångprogrammet på minst steg 10 och
     minst tre nivå 2-övningar gröna två pass i rad. */
  if (fas === 2) {
    if (data.installningar.gangsteg < 10) return null;
    var antalGronaNiva2 = 0;
    OVNINGAR.forEach(function (o) {
      if (o.niva !== 2) return;
      var f = progressionsForslag(o.id, data);
      if (f && f.redo) antalGronaNiva2++;
    });
    if (antalGronaNiva2 < 3) return null;
  }

  return {
    niva: "ok",
    text: "Du har " + senaste.length + " pass senaste 14 dagarna med snittsmärta " +
      svTal(snittSmarta.toFixed(1)) + "/10 och inga röda dagar. Du verkar redo för fas " + (fas + 1) +
      " – byt under fliken Program när du känner dig redo.",
    varfor: "Fasbytets krav (se fliken Program) ser ut att vara uppfyllda."
  };
}

/* ---------- Morgonkoll → justering av dagens pass ---------- */
function dagensMorgonkoll(data) {
  var idag = idagStr();
  return data.morgonkoll.find(function (k) { return k.datum === idag; }) || null;
}

function dagensPass(data) {
  var idag = idagStr();
  var fas = FASER[Math.min(data.installningar.fas, FASER.length) - 1];
  var dagIndex = veckodagsIndex(idag);
  var dag = fas.vecka[dagIndex];

  var resultat = {
    fas: fas,
    rubrik: dag.rubrik,
    ovningar: [],
    justeringar: []
  };

  var koll = dagensMorgonkoll(data);
  var ommaRegioner = {};
  if (koll) {
    Object.keys(koll.regioner || {}).forEach(function (r) {
      if (Number(koll.regioner[r]) >= 3) ommaRegioner[r] = Number(koll.regioner[r]);
    });
  }

  dag.ovningar.forEach(function (id) {
    var o = getOvning(id);
    if (!o) return;
    var traffad = kollRegionerFor(o).find(function (r) { return ommaRegioner[r] !== undefined; });
    if (traffad && o.typ !== "rorlighet") {
      resultat.justeringar.push({
        niva: "varning",
        text: o.namn + " utgår idag – du angav " + ommaRegioner[traffad] + "/10 i " +
          REGIONER[traffad].namn.toLowerCase() + " i morgonkollen." +
          (o.typ === "kondition" && id === "gang" ? " Ta cykeln i stället om knäna är okej." : ""),
        varfor: "Vid 3+/10 på morgonen får området en lugn dag – rörlighet och övriga områden går bra."
      });
    } else {
      resultat.ovningar.push(o);
    }
  });

  return resultat;
}

/* ---------- Gångprogrammet: statusbedömning ----------
   Varje gång-post stämplas med det steg den gjordes på (post.gangsteg,
   sätts i sparaPass). Bara gångPASS (inte enskilda poster) gjorda på
   NUVARANDE steg räknas – tre gröna sådana i rad krävs för nästa steg.
   Poster utan stämpel (äldre data) räknas inte.
------------------------------------------------------ */
function gangStatus(data) {
  var steg = data.installningar.gangsteg;
  var stegInfo = GANGPROGRAM.find(function (s) { return s.steg === steg; }) || GANGPROGRAM[0];

  /* Ett gångpass = ett loggat pass som innehåller minst en gång-post */
  var gangpass = [];
  data.pass
    .slice()
    .sort(function (a, b) { return a.datum < b.datum ? -1 : 1; })
    .forEach(function (p) {
      var gangposter = p.poster.filter(function (post) { return post.ovningId === "gang"; });
      if (!gangposter.length) return;
      gangpass.push({
        datum: p.datum,
        paSteg: gangposter.every(function (post) { return Number(post.gangsteg) === steg; }),
        gron: gangposter.every(function (post) { return (Number(post.smarta) || 0) <= SMARTA_GRONT_MAX; })
      });
    });

  var paDettaSteg = gangpass.filter(function (g) { return g.paSteg; });
  var senasteTre = paDettaSteg.slice(-3);
  var redo = senasteTre.length === 3 && senasteTre.every(function (g) { return g.gron; });

  return {
    steg: steg,
    info: stegInfo,
    antalLoggade: gangpass.length,
    antalPaSteg: paDettaSteg.length,
    senasteTre: senasteTre,
    redoForNasta: redo && steg < GANGPROGRAM.length
  };
}
