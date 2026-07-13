/* =========================================================
   data.js — Hälsoprofil, övningsbibliotek och program
   Allt innehåll är anpassat efter din historik (se PROFIL).
   ========================================================= */

"use strict";

/* ---------- Kroppsregioner ----------
   Varje region har en egen ikon och neonfärg som används för att
   gruppera övningar visuellt. Färgen är aldrig ensam bärare av
   information – ikon och namn följer alltid med. */
const REGIONER = {
  kna:      { namn: "Knän",                 checkin: true,  ikon: "🦵", farg: "#22d3ee" },
  underben: { namn: "Underben/skenben",     checkin: true,  ikon: "🦿", farg: "#a78bfa" },
  fot:      { namn: "Fötter/hälar",         checkin: true,  ikon: "🦶", farg: "#f472b6" },
  hoft:     { namn: "Höft/säte",            checkin: false, ikon: "🍑", farg: "#fb923c" },
  axel:     { namn: "Axlar",                checkin: true,  ikon: "🤷", farg: "#4ade80" },
  arm:      { namn: "Armbågar/underarmar",  checkin: true,  ikon: "💪", farg: "#fbbf24" },
  hand:     { namn: "Händer/fingrar",       checkin: true,  ikon: "✋", farg: "#f87171" },
  bal:      { namn: "Bål/rygg",             checkin: false, ikon: "🧘", farg: "#60a5fa" },
  kondition:{ namn: "Kondition",            checkin: false, ikon: "🚴", farg: "#e879f9" }
};

/* ---------- Träningsrelevant hälsoprofil ---------- */
const PROFIL = {
  sammanfattning:
    "Mycket lättprovocerade sen-, led- och benhinnebesvär i flera regioner trots normala " +
    "prover, MR och bedömningar av reumatolog och neurolog. Kroppen tål belastning – men " +
    "tröskeln är låg och stegringen måste vara mycket långsammare än i vanliga program. " +
    "Grundprincipen för allt på den här sidan: starta lägre, stegra långsammare, och låt " +
    "smärtan (inte kalendern) styra tempot.",
  regioner: [
    {
      region: "kna",
      historik: "Löparknä i båda knäna sedan 2012, provoceras av löpning över ca 1 km. " +
        "Återkommande besvär, senast 2025 vid gymträning med låga vikter.",
      strategi: "Ingen löpning tills vidare. Cykel är din bästa vän. Isometrisk knäträning " +
        "(väggsitt, spansk knäböj) och höft-/sätesstyrka först, begränsat knäböjsdjup, " +
        "mycket långsam viktökning."
    },
    {
      region: "underben",
      historik: "Benhinnebesvär sedan 2022, provoceras av gång längre än ca 1 km eller " +
        "långvarigt stående. Mycket lättutlöst.",
      strategi: "Gradvis gångprogram i korta intervaller med pauser, vadstyrka som byggs " +
        "från sittande till stående, tibialisträning. Inga hopp, ingen löpning."
    },
    {
      region: "fot",
      historik: "Överansträngda hälsenor och hälsporre i perioder, diffus smärta under " +
        "fötterna, plattfot sedan barndomen.",
      strategi: "Långsam senträning för vaderna (isometriskt → excentriskt), fotens små " +
        "muskler (short foot, tågrepp). Bra skor/inlägg vid gång."
    },
    {
      region: "axel",
      historik: "Rotatorcuffbesvär efter viktlyftning 2024, har inte helt släppt och " +
        "överbelastas fortfarande lätt.",
      strategi: "Utåtrotation med band och skulderbladskontroll före allt annat. Inga " +
        "pressar över huvudet i början – lutande press kommer först i fas 3. Lätta vikter, " +
        "fler repetitioner."
    },
    {
      region: "hand",
      historik: "Ledbesvär i pekfingrar och tummar sedan 2016 (provoceras av klättring, " +
        "mycket tangentbordsarbete, degknådning). 2025: ömma punkter i handflatorna efter " +
        "bilkörning. Handledsbesvär sommaren 2017.",
      strategi: "Låg greppbelastning i all träning – lätta hantlar, band i stället för " +
        "stång där det går. Mjuk, kort greppträning i små doser för att långsamt bygga " +
        "tolerans. Ingen klättring eller hängande."
    },
    {
      region: "arm",
      historik: "Tennisarmbågsliknande besvär hösten 2024 efter längre datorarbete. " +
        "Återkommande diffusa känningar vid armbågarna.",
      strategi: "Mycket lätt excentrisk handledsträning när det är lugnt, pausa vid " +
        "känningar. Undvik hårda grepp och snabba ryck."
    },
    {
      region: "bal",
      historik: "Överaktiv blåsa sedan 2013. Trattbröst (påverkar normalt inte träning).",
      strategi: "Bäckenbottenträning (knipövningar) ingår i programmet – det är " +
        "förstahandsträning vid överaktiv blåsa. Rörlighet för bröstryggen för hållningen. " +
        "Planera pass så att toalett finns nära, och töm blåsan före passet."
    }
  ],
  varningstecken:
    "Sök vård (och pausa programmet) vid: blod i urinen, svullnad/rodnad/värme över en led, " +
    "feber i samband med ledbesvär, vilovärk som väcker dig på natten, domningar eller " +
    "plötslig kraftlöshet.",
  disclaimer:
    "Den här sidan är ett träningsstöd, inte medicinsk rådgivning. Den ersätter inte " +
    "läkare eller fysioterapeut. Eftersom dina besvär är ovanliga och lättprovocerade: " +
    "visa gärna programmet för en fysioterapeut och stäm av att det passar dig."
};

/* ---------- Träningsprinciper (trafikljusmodellen m.m.) ---------- */
const PRINCIPER = [
  {
    rubrik: "Trafikljuset – låt smärtan styra",
    text: "0–2 av 10: grönt, fortsätt och stegra försiktigt. 3–5: gult, träna kvar på samma " +
      "nivå men öka inte. 6+: rött, avbryt övningen och gå ner ett steg nästa gång. " +
      "Bedöm alltid även morgonen efter – smärta som är värre nästa dag räknas som gult/rött " +
      "även om passet kändes bra."
  },
  {
    rubrik: "24-timmarsregeln",
    text: "Det är okej att känna av kroppen under och direkt efter träning, om det lagt sig " +
      "till nästa morgon. Är du sämre 24 timmar senare var dosen för hög – upprepa inte den, " +
      "backa ett steg."
  },
  {
    rubrik: "Ändra en sak i taget",
    text: "Öka aldrig vikt, repetitioner och frekvens samtidigt. En variabel per vecka, " +
      "cirka 5 % i taget (halva den vanliga tumregeln – din kropp behöver längre tid på sig). " +
      "Sidans progressionsförslag följer den här regeln åt dig."
  },
  {
    rubrik: "Två gröna pass innan stegring",
    text: "Stegra en övning först när du klarat den planerade dosen två pass i rad med " +
      "smärta 0–2 både under passet och morgonen efter."
  },
  {
    rubrik: "48 timmar mellan tunga pass för samma område",
    text: "Styrketräning för samma kroppsregion behöver minst en vilodag emellan. Lätta " +
      "isometriska övningar och promenader enligt gångprogrammet går bra oftare."
  },
  {
    rubrik: "Lugn vecka var fjärde vecka",
    text: "Var fjärde vecka halverar du volymen (samma övningar, hälften så många set). " +
      "Senor och leder anpassar sig långsammare än muskler – det är under de lugna " +
      "veckorna som anpassningen sker."
  },
  {
    rubrik: "Bakslag är normala – planera för dem",
    text: "Ett bakslag betyder inte att träningen är fel, bara att dosen var för hög just då. " +
      "Backa till senaste nivå som kändes bra, stanna där en vecka och stegra igen. " +
      "Kurvan ska peka uppåt över månader, inte veckor."
  }
];

/* ---------- Övningsbibliotek ----------
   typ: iso | styrka | rorlighet | kondition
   niva: 1 (fas 1) | 2 (fas 2) | 3 (fas 3)
   dos:  standarddos { set, reps } | { set, sek } | { min }
   next: id för nästa övning i progressionskedjan
--------------------------------------- */
const OVNINGAR = [
  /* ---- Knä & höft ---- */
  {
    id: "vaggsitt", namn: "Väggsitt (grunt)", region: "kna", typ: "iso", niva: 1,
    utrustning: "Vägg",
    beskrivning: "Stå med ryggen mot väggen och glid ner till en grund vinkel (ca 30–45°, " +
      "inte till 90°). Håll positionen. Vila lika länge som du höll.",
    dos: { set: 3, sek: 20 },
    darfor: "Isometrisk träning bygger styrka runt knät utan rörelse – det snällaste sättet " +
      "att belasta ett lättirriterat löparknä och har ofta smärtdämpande effekt.",
    seUpp: "Gå inte djupare än att det känns tryggt. Smärta framtill i knät över 2/10 = res dig.",
    next: "spansk-knaboj"
  },
  {
    id: "spansk-knaboj", namn: "Spansk knäböj (band)", region: "kna", typ: "iso", niva: 2,
    utrustning: "Kraftigt gummiband fäst i låg punkt",
    beskrivning: "Bandet bakom knävecken, luta dig bakåt mot bandets drag och böj knäna – " +
      "börja grunt (ca 45–60°) och öka djupet gradvis över flera veckor. Lodrät överkropp. " +
      "Håll positionen.",
    dos: { set: 3, sek: 30 },
    darfor: "Belastar lårmuskeln hårt i ett stilla, kontrollerat läge – ett beprövat sätt " +
      "att bygga knästyrka när knäna är känsliga för rörelse.",
    seUpp: "Kräver ett rejält band. Börja grunt och med korta hålltider – smärta framtill i " +
      "knät över 2/10 betyder mindre djup nästa håll.",
    next: "bensats-stol"
  },
  {
    id: "rakt-benlyft", namn: "Rakt benlyft", region: "kna", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Ligg på rygg, ena benet böjt. Spänn lårmuskeln på det raka benet och lyft " +
      "det långsamt till ca 45°, sänk kontrollerat.",
    dos: { set: 2, reps: 10 },
    darfor: "Aktiverar lårmuskeln helt utan att böja knät – noll belastning på själva knäleden.",
    seUpp: "Håll ländryggen i golvet.",
    next: null
  },
  {
    id: "tke", namn: "Terminal knäextension (band)", region: "kna", typ: "styrka", niva: 1,
    utrustning: "Gummiband",
    beskrivning: "Band runt knävecket, fäst framför dig. Stå med lätt böjt knä och pressa " +
      "det långsamt helt rakt mot bandets motstånd.",
    dos: { set: 2, reps: 12 },
    darfor: "Tränar knäts sista sträckning med minimal ledbelastning – bra kontrollövning " +
      "för löparknä.",
    seUpp: "Långsamt och kontrollerat, inget ryck.",
    next: null
  },
  {
    id: "hoftlyft", namn: "Höftlyft", region: "hoft", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Ligg på rygg med böjda knän, pressa upp höften tills kroppen är rak från " +
      "knän till axlar. Kläm ihop sätet i toppen, sänk långsamt.",
    dos: { set: 2, reps: 12 },
    darfor: "Starkare säte avlastar både knän och underben vid gång – en av de viktigaste " +
      "övningarna för dina mål.",
    seUpp: "Pressa genom hälarna, inte tårna (skonar vaderna).",
    next: "hoftlyft-enben"
  },
  {
    id: "hoftlyft-enben", namn: "Höftlyft på ett ben", region: "hoft", typ: "styrka", niva: 2,
    utrustning: "Ingen",
    beskrivning: "Som höftlyft men med ena benet sträckt i luften. Håll bäckenet vågrätt.",
    dos: { set: 2, reps: 8 },
    darfor: "Dubbel belastning på sätet utan någon extra utrustning eller greppbelastning.",
    seUpp: "Tappa inte bäckenet åt sidan.",
    next: null
  },
  {
    id: "musslan", namn: "Musslan", region: "hoft", typ: "styrka", niva: 1,
    utrustning: "Ev. miniband",
    beskrivning: "Ligg på sidan med böjda knän, fötterna ihop. Öppna knäna som ett " +
      "musselskal utan att rulla bäckenet bakåt.",
    dos: { set: 2, reps: 15 },
    darfor: "Tränar höftens utåtrotatorer som styr knäts position – svaghet här är en " +
      "klassisk bidragande orsak till löparknä.",
    seUpp: "Liten rörelse räcker, känn det i sätet – inte i ländryggen.",
    next: "sidoliggande-benlyft"
  },
  {
    id: "sidoliggande-benlyft", namn: "Sidoliggande benlyft", region: "hoft", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Ligg på sidan med raka ben. Lyft översta benet ca 30–40 cm med hälen " +
      "något först, sänk långsamt.",
    dos: { set: 2, reps: 12 },
    darfor: "Stärker gluteus medius som stabiliserar bäckenet vid varje steg du tar.",
    seUpp: "Luta inte överkroppen bakåt, tån får gärna peka lätt nedåt.",
    next: null
  },
  {
    id: "bensats-stol", namn: "Knäböj till stol", region: "kna", typ: "styrka", niva: 2,
    utrustning: "Stol/pall",
    beskrivning: "Stå framför en stol, sätt dig långsamt (3 sekunder ner), nudda sitsen och " +
      "res dig. Armarna framför kroppen som motvikt – inget grepp behövs.",
    dos: { set: 2, reps: 8 },
    darfor: "Begränsat, förutsägbart djup gör den mycket snällare mot knäna än fria knäböj, " +
      "och händerna belastas inte alls.",
    seUpp: "Högre sits = lättare. Börja högt.",
    next: "stepup"
  },
  {
    id: "stepup", namn: "Step-up (låg höjd)", region: "kna", typ: "styrka", niva: 2,
    utrustning: "Låg pall/trappsteg (10–15 cm)",
    beskrivning: "Kliv upp på en låg pall, långsamt och kontrollerat, kliv ner ännu " +
      "långsammare. Byt ben halvvägs.",
    dos: { set: 2, reps: 8 },
    darfor: "Bygger den gångstyrka du behöver i vardagen, med höjden som exakt dosratt.",
    seUpp: "Knät ska peka över foten, inte falla inåt. Öka höjden före antalet.",
    next: "benpress"
  },
  {
    id: "benpress", namn: "Benpress (lätt)", region: "kna", typ: "styrka", niva: 3,
    utrustning: "Gym",
    beskrivning: "Benpress med lätt vikt, begränsat djup (ca 90° i knät), långsam nedfas.",
    dos: { set: 2, reps: 10 },
    darfor: "Ger mätbar, finjusterbar belastning utan balanskrav och utan greppbelastning – " +
      "det tryggaste gymalternativet för dina knän.",
    seUpp: "Börja löjligt lätt (t.ex. 20–30 kg) och öka max 5 % per vecka.",
    next: null
  },
  {
    id: "rdl-latt", namn: "Rumänska marklyft (lätta hantlar)", region: "hoft", typ: "styrka", niva: 3,
    utrustning: "Lätta hantlar",
    beskrivning: "Fäll höften bakåt med lätt böjda knän och rak rygg tills det stramar i " +
      "baksida lår, res dig genom att pressa höften fram.",
    dos: { set: 2, reps: 8 },
    darfor: "Tränar baksideskedjan som avlastar knäna – men kommer sist i progressionen " +
      "eftersom den belastar greppet.",
    seUpp: "Håll vikterna lätta för händernas skull – hellre långsammare tempo än tyngre " +
      "hantlar. Vid minsta känning i fingrarna: byt till höftlyft.",
    next: null
  },

  /* ---- Underben & fötter ---- */
  {
    id: "sittande-tahavning", namn: "Sittande tåhävning", region: "underben", typ: "styrka", niva: 1,
    utrustning: "Stol, ev. vikt på låren",
    beskrivning: "Sitt med fötterna i golvet, pressa upp på tå långsamt, sänk ännu " +
      "långsammare (3 sekunder ner).",
    dos: { set: 3, reps: 15 },
    darfor: "Belastar vader, hälsenor och benhinnornas fästen med bara en bråkdel av " +
      "kroppsvikten – rätt startpunkt för dina lättirriterade underben.",
    seUpp: "Ska kännas som arbete i vaden, inte smärta längs skenbenet.",
    next: "tahavning-iso"
  },
  {
    id: "tahavning-iso", namn: "Stående tåhävning – isometrisk", region: "underben", typ: "iso", niva: 2,
    utrustning: "Något att hålla lätt i för balans",
    beskrivning: "Ställ dig på tå på båda fötterna och håll positionen stilla.",
    dos: { set: 3, sek: 20 },
    darfor: "Isometriskt arbete är skonsammast för retliga senor (hälsenor, hälsporre) och " +
      "brukar dessutom dämpa smärta.",
    seUpp: "Fingertoppsstöd för balansen räcker – häng inte i händerna.",
    next: "tahavning-exc"
  },
  {
    id: "tahavning-exc", namn: "Långsam tåhävning (excentrisk)", region: "underben", typ: "styrka", niva: 2,
    utrustning: "Ev. trappsteg",
    beskrivning: "Pressa upp på tå på två ben, sänk sedan långsamt (4–5 sekunder) – till " +
      "en början på plant golv, senare med hälarna utanför ett trappsteg.",
    dos: { set: 3, reps: 10 },
    darfor: "Den mest beprövade träningen för hälsenor och hälsporre – långsam senbelastning " +
      "är det som får senvävnad att bli tåligare.",
    seUpp: "Stanna på plant golv tills det är helt lugnt. 24-timmarsregeln gäller extra här.",
    next: "tahavning-enben"
  },
  {
    id: "tahavning-enben", namn: "Tåhävning på ett ben", region: "underben", typ: "styrka", niva: 3,
    utrustning: "Ev. trappsteg",
    beskrivning: "Som långsam tåhävning men upp och ner på ett ben i taget.",
    dos: { set: 3, reps: 8 },
    darfor: "Slutmålet för vadstyrkan – klarar du den här smärtfritt tål underbenen " +
      "betydligt längre promenader.",
    seUpp: "Byt tillbaka till två ben samma sekund som formen sviktar.",
    next: null
  },
  {
    id: "soleus-tahavning", namn: "Tåhävning med böjda knän", region: "underben", typ: "styrka", niva: 2,
    utrustning: "Ingen",
    beskrivning: "Stå med knäna lätt böjda (ca 20–30°) och gör långsamma tåhävningar i det " +
      "läget.",
    dos: { set: 2, reps: 12 },
    darfor: "Böjda knän flyttar arbetet till soleus – den djupa vadmuskeln som gör " +
      "merparten av jobbet vid just gång. En nyckelövning för dina benhinnor.",
    seUpp: "Mindre rörelse än vanlig tåhävning är normalt.",
    next: null
  },
  {
    id: "tibialis-lyft", namn: "Tibialislyft", region: "underben", typ: "styrka", niva: 1,
    utrustning: "Vägg",
    beskrivning: "Luta ryggen mot väggen med fötterna en bit ut. Lyft tårna/framfötterna mot " +
      "smalbenen så högt du kan, sänk långsamt.",
    dos: { set: 2, reps: 15 },
    darfor: "Stärker muskeln på skenbenets framsida och balanserar vadarbetet – ett bra " +
      "stöd runt benhinnorna. Kom ihåg att tåhävningarna (särskilt med böjda knän) är " +
      "huvudövningarna för just benhinnebesvären.",
    seUpp: "Bränna i muskeln är okej, skarp smärta längs benhinnan är stopp.",
    next: null
  },
  {
    id: "short-foot", namn: "Short foot (fotvalvsövning)", region: "fot", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Sitt med foten platt i golvet. Dra framfoten kort mot hälen så att " +
      "fotvalvet höjs, utan att kröka tårna. Håll 5 sekunder, slappna av.",
    dos: { set: 2, reps: 10 },
    darfor: "Bygger fotens egna muskler – extra värdefullt med plattfot, eftersom ett " +
      "aktivt fotvalv avlastar benhinnor, hälsenor och fotsulor.",
    seUpp: "Subtil rörelse, kramp i början är vanligt – skaka loss och fortsätt.",
    next: null
  },
  {
    id: "tagrepp-handduk", namn: "Tågrepp med handduk", region: "fot", typ: "styrka", niva: 1,
    utrustning: "Handduk",
    beskrivning: "Sitt med en handduk under foten och dra den mot dig med tårna, släpp och " +
      "upprepa.",
    dos: { set: 2, reps: 12 },
    darfor: "Enkel träning för fotsulans muskler som stöttar vid diffus fotsmärta och " +
      "plattfot.",
    seUpp: "Krampkänsla = vila en stund och kör vidare med färre repetitioner.",
    next: null
  },

  /* ---- Axlar ---- */
  {
    id: "axel-iso-utrot", namn: "Isometrisk utåtrotation (dörrkarm)", region: "axel", typ: "iso", niva: 1,
    utrustning: "Dörrkarm/vägg",
    beskrivning: "Armbåge i 90° intill kroppen, handryggen mot dörrkarmen. Pressa utåt mot " +
      "karmen utan att något rör sig, ca 50 % av max.",
    dos: { set: 3, sek: 15 },
    darfor: "Väcker rotatorcuffen helt utan rörelse – tryggaste starten för en axel som " +
      "lätt blir överbelastad.",
    seUpp: "50 % ansträngning räcker. Ingen smärta ska kännas under hållet.",
    next: "band-utrot"
  },
  {
    id: "band-utrot", namn: "Utåtrotation med band", region: "axel", typ: "styrka", niva: 1,
    utrustning: "Lätt gummiband",
    beskrivning: "Armbåge i 90° intill kroppen (gärna hoprullad handduk mellan armbåge och " +
      "kropp). Rotera underarmen utåt mot bandets motstånd, långsamt tillbaka.",
    dos: { set: 2, reps: 12 },
    darfor: "Grundövningen för rotatorcuffen. Bandet är snällt mot både axel och grepp – " +
      "du kan trä bandet runt handleden om fingrarna säger ifrån.",
    seUpp: "Lätt band, höga repetitioner. Ingen smärta i själva axelleden.",
    next: null
  },
  {
    id: "band-inrot", namn: "Inåtrotation med band", region: "axel", typ: "styrka", niva: 1,
    utrustning: "Lätt gummiband",
    beskrivning: "Som utåtrotation men åt andra hållet: rotera underarmen in mot magen mot " +
      "bandets motstånd.",
    dos: { set: 2, reps: 12 },
    darfor: "Balanserar axelns framsida så att cuffen tränas åt båda håll.",
    seUpp: "Samma som utåtrotation – lätt och långsamt.",
    next: null
  },
  {
    id: "skulderblads-rodd", namn: "Bandrodd med skulderbladsfokus", region: "axel", typ: "styrka", niva: 1,
    utrustning: "Gummiband",
    beskrivning: "Band fäst i brösthöjd. Dra armbågarna bakåt och kläm ihop skulderbladen, " +
      "håll 1 sekund, släpp långsamt tillbaka.",
    dos: { set: 2, reps: 12 },
    darfor: "Skulderbladskontroll är grunden som avlastar rotatorcuffen i allt annat du gör " +
      "med armarna.",
    seUpp: "Axlarna ner från öronen. Trä bandet runt handlederna om greppet stör fingrarna.",
    next: "hantelrodd"
  },
  {
    id: "wall-slides", namn: "Wall slides", region: "axel", typ: "rorlighet", niva: 1,
    utrustning: "Vägg",
    beskrivning: "Stå med ryggen mot väggen, underarmarna mot väggen i 'kaktusposition'. " +
      "Glid armarna långsamt uppåt så långt det går utan att de lämnar väggen.",
    dos: { set: 2, reps: 8 },
    darfor: "Mjuk rörlighet för axlar och bröstrygg – bra motvikt till datorarbete och " +
      "trattbröstets tendens till framåtlutad hållning.",
    seUpp: "Gå bara så högt som är bekvämt, ingen greppbelastning alls.",
    next: null
  },
  {
    id: "face-pull", namn: "Face pull med band (lätt)", region: "axel", typ: "styrka", niva: 2,
    utrustning: "Gummiband i ansiktshöjd",
    beskrivning: "Dra bandet mot ansiktet med höga armbågar och rotera underarmarna bakåt i " +
      "slutläget. Långsamt tillbaka.",
    dos: { set: 2, reps: 12 },
    darfor: "Kombinerar skulderbladskontroll och utåtrotation – nästa steg när " +
      "grundövningarna känns lätta.",
    seUpp: "Lätt band. Känns det i nacken är bandet för tungt.",
    next: null
  },
  {
    id: "hantelrodd", namn: "Hantelrodd (lätt)", region: "axel", typ: "styrka", niva: 2,
    utrustning: "Lätt hantel, bänk/stol",
    beskrivning: "Stöd ena handen och knät mot en bänk. Ro hanteln mot höften med " +
      "skulderbladet först, sänk långsamt.",
    dos: { set: 2, reps: 10 },
    darfor: "Bygger ryggstyrka som stöttar axlarna – med lätt vikt är den snäll mot både " +
      "cuff och grepp.",
    seUpp: "Vikten begränsas av dina händer, inte din rygg – håll den lätt och öka i " +
      "repetitioner i stället.",
    next: null
  },
  {
    id: "lutande-press", namn: "Press i lutande läge (lätt)", region: "axel", typ: "styrka", niva: 3,
    utrustning: "Lätta hantlar, lutande bänk",
    beskrivning: "Pressa lätta hantlar i ett lutande läge (ca 30–45°), långsam sänkning. " +
      "Ersätter press över huvudet.",
    dos: { set: 2, reps: 10 },
    darfor: "Ger pressträning i en vinkel som är mycket snällare mot rotatorcuffen än " +
      "strikt press över huvudet.",
    seUpp: "Först i fas 3, och bara om utåtrotation och rodd varit gröna i flera veckor. " +
      "Smärta i främre axeln = avbryt.",
    next: null
  },

  /* ---- Händer & underarmar ---- */
  {
    id: "bollkram", namn: "Mjuk bollkramning", region: "hand", typ: "styrka", niva: 1,
    utrustning: "Mjuk boll/svamp",
    beskrivning: "Krama en mjuk boll lugnt till ca 50 % av max, håll 3 sekunder, släpp helt. " +
      "Korta, snälla doser.",
    dos: { set: 2, reps: 8 },
    darfor: "Bygger greppstyrka i minsta möjliga dos – målet är att långsamt höja " +
      "fingrarnas tolerans utan att väcka ledbesvären.",
    seUpp: "Aldrig till smärta. Kör inte samma dag som händerna redan känts av (bilkörning, " +
      "mycket tangentbord).",
    next: "grepphall-iso"
  },
  {
    id: "fingerextension-band", namn: "Fingerextension med gummiband", region: "hand", typ: "styrka", niva: 1,
    utrustning: "Vanligt gummiband",
    beskrivning: "Gummiband runt fingertopparna, spreta långsamt ut fingrarna mot motståndet " +
      "och släpp långsamt ihop.",
    dos: { set: 2, reps: 10 },
    darfor: "Tränar fingrarnas öppnare – balanserar all vardaglig grepp-/böjbelastning och " +
      "är mycket skonsam för lederna.",
    seUpp: "Lätt band, lugnt tempo.",
    next: null
  },
  {
    id: "grepphall-iso", namn: "Isometriskt grepphåll", region: "hand", typ: "iso", niva: 2,
    utrustning: "Lätt hantel eller kasse",
    beskrivning: "Håll en lätt vikt i handen med rak handled, stilla, i korta intervall.",
    dos: { set: 3, sek: 15 },
    darfor: "Stilla håll är den mildaste formen av greppbelastning – förberedelse för att " +
      "bära kassar och hålla i redskap utan bakslag.",
    seUpp: "Börja mycket lätt (1–2 kg). Öka tiden före vikten.",
    next: null
  },
  {
    id: "handledscurl-exc", namn: "Excentrisk handledscurl (mycket lätt)", region: "arm", typ: "styrka", niva: 2,
    utrustning: "Mycket lätt hantel (0,5–1 kg)",
    beskrivning: "Underarmen på ett bord, handflatan nedåt över kanten. Lyft upp handen med " +
      "hjälp av andra handen, sänk sedan långsamt (4–5 sekunder) med bara den tränande handen.",
    dos: { set: 2, reps: 8 },
    darfor: "Excentrisk träning är förstahandsvalet vid tennisarmbågsbesvär – men i din " +
      "minsta möjliga dos, och bara när armbågen är lugn.",
    seUpp: "Kör inte under pågående skov. 24-timmarsregeln gäller strikt.",
    next: null
  },

  /* ---- Bål & bäckenbotten ---- */
  {
    id: "dead-bug", namn: "Dead bug", region: "bal", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Ligg på rygg med armar rakt upp och höfter/knän i 90°. Sträck långsamt ut " +
      "motsatt arm och ben utan att svanka, tillbaka och byt sida.",
    dos: { set: 2, reps: 8 },
    darfor: "Bålstabilitet utan någon belastning på händer, knän eller fötter – perfekt " +
      "grundövning för dig.",
    seUpp: "Ländryggen lätt mot golvet hela tiden. Andas.",
    next: null
  },
  {
    id: "bird-dog", namn: "Bird dog", region: "bal", typ: "styrka", niva: 1,
    utrustning: "Matta",
    beskrivning: "Stå på alla fyra, sträck ut motsatt arm och ben till en rak linje, håll 2 " +
      "sekunder, byt sida.",
    dos: { set: 2, reps: 8 },
    darfor: "Rygg- och bålkontroll med låg intensitet.",
    seUpp: "Handleden belastas i vinkel – vik ett handduksstöd under handloven eller stå på " +
      "knogarna om handlederna känns. Hoppa över vid pågående handledsbesvär.",
    next: null
  },
  {
    id: "sidoplanka-kna", namn: "Sidoplanka på knä", region: "bal", typ: "iso", niva: 1,
    utrustning: "Matta",
    beskrivning: "Ligg på sidan med stöd på underarm och knän, lyft höften till rak linje " +
      "knä–axel och håll.",
    dos: { set: 2, sek: 15 },
    darfor: "Sidostabilitet för bål och höft – på underarmen slipper handlederna belastning.",
    seUpp: "Armbågen rakt under axeln.",
    next: "sidoplanka"
  },
  {
    id: "sidoplanka", namn: "Sidoplanka", region: "bal", typ: "iso", niva: 2,
    utrustning: "Matta",
    beskrivning: "Som sidoplanka på knä men med raka ben, vikten på underarm och fotens " +
      "utsida.",
    dos: { set: 2, sek: 20 },
    darfor: "Progression av sidoplankan när knäversionen känns lätt.",
    seUpp: "Behåll rak linje, sjunk inte ihop i axeln.",
    next: null
  },
  {
    id: "pallof", namn: "Pallofpress (band)", region: "bal", typ: "styrka", niva: 2,
    utrustning: "Gummiband i brösthöjd",
    beskrivning: "Stå i sidled mot bandets fäste, håll bandet mot bröstet och pressa armarna " +
      "rakt fram utan att låta bandet vrida dig. Långsamt tillbaka.",
    dos: { set: 2, reps: 10 },
    darfor: "Rotationsstabilitet med valfritt lätt motstånd – bandet kan hållas med hela " +
      "handen utan hårt grepp.",
    seUpp: "Stå nära fästet = lättare.",
    next: null
  },
  {
    id: "knip", namn: "Knipövningar (bäckenbotten)", region: "bal", typ: "styrka", niva: 1,
    utrustning: "Ingen",
    beskrivning: "Knip som när du håller emot kissnödighet: dra ihop och lyft bäckenbotten, " +
      "håll 5 sekunder, slappna av lika länge. Även snabba knip (1 sekund) som variation.",
    dos: { set: 2, reps: 10 },
    darfor: "Bäckenbottenträning är förstahandsbehandlingen vid överaktiv blåsa – ett " +
      "starkt, snabbt knip kan dessutom dämpa plötsliga trängningar när de kommer.",
    seUpp: "Slappna av helt mellan knipen – avslappningen är halva övningen. Håll andningen " +
      "igång.",
    next: null
  },

  /* ---- Rörlighet ---- */
  {
    id: "brostryggs-rotation", namn: "Bröstryggsrotation (sidoliggande)", region: "bal", typ: "rorlighet", niva: 1,
    utrustning: "Matta",
    beskrivning: "Ligg på sidan med böjda höfter, armarna raka framför dig. För översta " +
      "armen i en stor båge över till andra sidan och följ med blicken, tillbaka igen.",
    dos: { set: 1, reps: 8 },
    darfor: "Rörlighet i bröstryggen förbättrar både hållning och axelfunktion – extra " +
      "relevant med trattbröst och mycket stillasittande.",
    seUpp: "Mjuk rörelse, inget tvingande.",
    next: null
  },
  {
    id: "hoftbojar-stretch", namn: "Höftböjarstretch", region: "hoft", typ: "rorlighet", niva: 1,
    utrustning: "Matta/kudde under knät",
    beskrivning: "Utfallsposition med ena knät i golvet. Skjut höften mjukt framåt tills det " +
      "stramar på framsidan av höften, håll 30 sekunder per sida.",
    dos: { set: 1, reps: 2 },
    darfor: "Öppnar upp höftens framsida efter sittande dagar – hjälper både gångsteg och " +
      "hållning.",
    seUpp: "Kudde under knät. Mjukt, aldrig till smärta.",
    next: null
  },
  {
    id: "vad-stretch", namn: "Vadstretch mot vägg", region: "underben", typ: "rorlighet", niva: 1,
    utrustning: "Vägg",
    beskrivning: "Händerna mot väggen, ena benet bakåt med hälen i golvet. Luta dig framåt " +
      "tills det stramar i vaden, håll 30 sekunder. Böj sedan lätt på bakre knät för djupa " +
      "vaden.",
    dos: { set: 1, reps: 2 },
    darfor: "Mjukar upp vader och hälsenor – bra före och efter dina gångpass.",
    seUpp: "Stretch ska strama, inte göra ont. Lätt handstöd mot väggen.",
    next: null
  },

  /* ---- Kondition ---- */
  {
    id: "cykel", namn: "Motionscykel (lågt motstånd)", region: "kondition", typ: "kondition", niva: 1,
    utrustning: "Motionscykel",
    beskrivning: "Cykla med lågt motstånd och bekväm kadens. Sadeln så högt att knät nästan " +
      "sträcks – det minskar trycket i knäskålsleden.",
    dos: { min: 10 },
    darfor: "Din bästa konditionsform: ingen stöt mot benhinnor eller hälar, minimal " +
      "knäbelastning och lätt vila för händerna (vila dem ovanpå styret).",
    seUpp: "Motståndet är dosratten – håll det lågt länge. Öka tid före motstånd.",
    next: null
  },
  {
    id: "gang", namn: "Promenad (enligt gångprogrammet)", region: "kondition", typ: "kondition", niva: 1,
    utrustning: "Bra skor, ev. inlägg",
    beskrivning: "Gå i lugnt tempo enligt aktuellt steg i gångprogrammet (se fliken " +
      "Program). Dela upp i intervaller med pauser – det är poängen, inte fusk.",
    dos: { min: 12 },
    darfor: "Målet med hela programmet är att kunna gå som vanligt igen. Vägen dit är " +
      "många korta, snälla doser – inte några få långa.",
    seUpp: "Vid benhinnekänning under promenaden: sätt dig och pausa. Är den kvar dagen " +
      "efter, gå ner ett steg i programmet.",
    next: null
  },
  {
    id: "simning", namn: "Simning/vattengympa", region: "kondition", typ: "kondition", niva: 1,
    utrustning: "Simhall",
    beskrivning: "Simma lugnt (gärna ryggsim/frisim) eller gå/jogga i vatten.",
    dos: { min: 20 },
    darfor: "Vattnet bär kroppsvikten – helkroppskondition med nästan noll ledbelastning.",
    seUpp: "Bröstsim med kraftiga bentag kan reta knän – välj andra simsätt om det känns.",
    next: null
  },
  {
    id: "rodd", namn: "Roddmaskin (lätt)", region: "kondition", typ: "kondition", niva: 3,
    utrustning: "Roddmaskin",
    beskrivning: "Lugn rodd med lågt motstånd och avslappnat grepp – dra med benen och " +
      "ryggen, låt händerna bara vara krokar.",
    dos: { min: 8 },
    darfor: "Bra helkroppskondition när du kommit längre – men greppet gör att den ligger " +
      "sist i progressionen.",
    seUpp: "Först i fas 3. Korta pass. Vid minsta känning i fingrar/armbågar: byt till cykel.",
    next: null
  }
];

/* ---------- Superpappa-sektionen (till Jessica) ----------
   Krafterna låses upp automatiskt utifrån verklig träningsdata:
   kravTyp "gangsteg" jämförs med gångprogrammets steg, "fas" med
   aktuell fas. Ordningen är den ungefärliga upplåsningsordningen. */
const SUPERPAPPA = {
  halsning: "Hej Jessica! 💌",
  intro: [
    "Det här är sidan där du kan följa vad all min träning ska leda till. Programmet är " +
    "byggt precis för min kropp: supersnälla doser som växer långsamt, så att jag blir " +
    "starkare utan bakslag.",
    "Planen har tre faser och ett gångprogram i 18 steg. Varje grönt pass tar mig ett " +
    "steg närmare listan här nedanför. Det går långsamt – men det är själva poängen. " +
    "Även superhjältar har en origin story."
  ],
  krafter: [
    {
      ikon: "🚶", namn: "Kvarterspatrullen",
      beskrivning: "Runda kvarteret tillsammans i lugnt tempo – utan att räkna meter.",
      kravTyp: "gangsteg", krav: 4
    },
    {
      ikon: "🌳", namn: "Parkexpeditionen",
      beskrivning: "Gå till parken, hänga där en stund och gå hela vägen hem igen.",
      kravTyp: "gangsteg", krav: 8
    },
    {
      ikon: "🛒", namn: "Kassbärarkraften",
      beskrivning: "Bära hem matkassarna – i båda händerna! – utan att fingrarna protesterar dagen efter.",
      kravTyp: "fas", krav: 2
    },
    {
      ikon: "🏙️", namn: "Stadsvandraren",
      beskrivning: "En hel stadsrunda: affärer, fik och lite planlöst strosande, utan att spana efter sittplatser.",
      kravTyp: "gangsteg", krav: 12
    },
    {
      ikon: "🥐", namn: "Bagarmästaren",
      beskrivning: "Knåda en riktig bulldeg för hand igen. Kanelbullar på söndagar, någon?",
      kravTyp: "fas", krav: 3
    },
    {
      ikon: "🥾", namn: "Söndagsströvaren",
      beskrivning: "Långa söndagspromenader och lättare utflykter i skogen.",
      kravTyp: "gangsteg", krav: 15
    },
    {
      ikon: "🤸", namn: "Lekmonstret",
      beskrivning: "Busa, kicka boll och bygga kojor utan att behöva ransonera orken.",
      kravTyp: "fas", krav: 3
    },
    {
      ikon: "🦸", namn: "Vardagshjälten",
      beskrivning: "Gå, stå, bära, fixa och greja en hel dag i sträck – som vilken superhjälte som helst.",
      kravTyp: "gangsteg", krav: 18
    },
    {
      ikon: "✨", namn: "Bonusnivån",
      beskrivning: "Kanske, någon vacker dag: jogga en liten bit igen. Men mest kommer den här hjälten att gå – snabbt, långt och glatt.",
      kravTyp: "bonus", krav: 0
    }
  ],
  avslutning: {
    rubrik: "Din superkraft i det här",
    text: "Fira de gröna veckorna med mig. Påminn mig om att vilodagar också är träning. " +
      "Och när jag säger att jag bara ska ta en kort promenad – följ gärna med. がんばって!"
  }
};

/* ---------- Gångprogrammet ----------
   Stegen är medvetet små: den sammanhängande gångtiden (det som
   provocerar benhinnorna mest) ökar aldrig mer än ca 10–15 % per steg. */
const GANGPROGRAM = [
  { steg: 1,  beskrivning: "3 × 4 min gång, minst 2 min sittpaus emellan", totalMin: 12 },
  { steg: 2,  beskrivning: "3 × 5 min gång, 2 min paus", totalMin: 15 },
  { steg: 3,  beskrivning: "3 × 6 min gång, 2 min paus", totalMin: 18 },
  { steg: 4,  beskrivning: "3 × 7 min gång, 2 min paus", totalMin: 21 },
  { steg: 5,  beskrivning: "2 × 8 min gång, 3 min paus", totalMin: 16 },
  { steg: 6,  beskrivning: "2 × 9 min gång, 3 min paus", totalMin: 18 },
  { steg: 7,  beskrivning: "2 × 10 min gång, 3 min paus", totalMin: 20 },
  { steg: 8,  beskrivning: "2 × 12 min gång, 3 min paus", totalMin: 24 },
  { steg: 9,  beskrivning: "14 min sammanhängande + 8 min efter paus", totalMin: 22 },
  { steg: 10, beskrivning: "16 min sammanhängande + 8 min efter paus", totalMin: 24 },
  { steg: 11, beskrivning: "18 min sammanhängande + 8 min efter paus", totalMin: 26 },
  { steg: 12, beskrivning: "20 min sammanhängande gång", totalMin: 20 },
  { steg: 13, beskrivning: "23 min sammanhängande gång", totalMin: 23 },
  { steg: 14, beskrivning: "26 min sammanhängande gång", totalMin: 26 },
  { steg: 15, beskrivning: "30 min sammanhängande gång", totalMin: 30 },
  { steg: 16, beskrivning: "35 min sammanhängande gång", totalMin: 35 },
  { steg: 17, beskrivning: "40 min sammanhängande gång", totalMin: 40 },
  { steg: 18, beskrivning: "45 min sammanhängande gång – vardagsnivå!", totalMin: 45 }
];

const GANGREGLER =
  "Stanna på samma steg i minst tre gångpass. Gå vidare till nästa steg först när alla tre " +
  "varit gröna (smärta 0–2 både under promenaden och nästa morgon). Blir det gult (3–5): " +
  "stanna kvar på steget. Rött (6+) eller sämre nästa dag: gå ner ett steg och stanna där " +
  "en vecka. Det gör inget om ett steg tar en månad – riktningen är det enda som räknas.";

/* ---------- Faser & veckoscheman ---------- */
const FASER = [
  {
    nr: 1,
    namn: "Fas 1 – Grunden",
    langd: "ca 4–6 veckor (eller så länge det behövs)",
    fokus: "Väcka kroppen med isometrisk träning, lätt cirkulation och gångprogrammets " +
      "första steg. Målet är inte framsteg – det är att hitta doser som aldrig ger bakslag.",
    kravForNasta: "Minst 3 loggade pass per vecka i 2 veckor i rad, med genomsnittlig " +
      "smärta 2 eller lägre och utan röda dagar.",
    vecka: [
      { dag: "Måndag",  rubrik: "Underkropp A", ovningar: ["vaggsitt", "hoftlyft", "sittande-tahavning", "short-foot", "cykel"] },
      { dag: "Tisdag",  rubrik: "Axlar & händer", ovningar: ["axel-iso-utrot", "skulderblads-rodd", "wall-slides", "bollkram", "fingerextension-band"] },
      { dag: "Onsdag",  rubrik: "Gång & rörlighet", ovningar: ["gang", "vad-stretch", "brostryggs-rotation", "knip"] },
      { dag: "Torsdag", rubrik: "Underkropp B", ovningar: ["rakt-benlyft", "musslan", "tibialis-lyft", "tagrepp-handduk", "cykel"] },
      { dag: "Fredag",  rubrik: "Bål & axlar", ovningar: ["dead-bug", "sidoplanka-kna", "band-utrot", "band-inrot", "knip"] },
      { dag: "Lördag",  rubrik: "Gång eller cykel", ovningar: ["gang", "hoftbojar-stretch"] },
      { dag: "Söndag",  rubrik: "Vila", ovningar: [] }
    ]
  },
  {
    nr: 2,
    namn: "Fas 2 – Uppbyggnad",
    langd: "ca 6–8 veckor",
    fokus: "Från isometriskt till långsam rörelse: spansk knäböj, excentriska tåhävningar, " +
      "lätta hantlar. Gångprogrammet fortsätter stegras i sin egen takt.",
    kravForNasta: "2 veckor i rad med genomsnittlig smärta 2 eller lägre, gångprogrammet på " +
      "minst steg 10, och minst tre av nivå 2-övningarna gröna två pass i rad.",
    vecka: [
      { dag: "Måndag",  rubrik: "Underkropp A", ovningar: ["spansk-knaboj", "bensats-stol", "hoftlyft-enben", "tahavning-iso", "cykel"] },
      { dag: "Tisdag",  rubrik: "Axlar & händer", ovningar: ["band-utrot", "skulderblads-rodd", "face-pull", "grepphall-iso", "fingerextension-band"] },
      { dag: "Onsdag",  rubrik: "Gång & bål", ovningar: ["gang", "dead-bug", "sidoplanka-kna", "knip", "vad-stretch"] },
      { dag: "Torsdag", rubrik: "Underkropp B", ovningar: ["stepup", "sidoliggande-benlyft", "tahavning-exc", "soleus-tahavning", "short-foot"] },
      { dag: "Fredag",  rubrik: "Axlar & bål", ovningar: ["hantelrodd", "band-inrot", "pallof", "bird-dog", "handledscurl-exc"] },
      { dag: "Lördag",  rubrik: "Gång eller cykel", ovningar: ["gang", "cykel", "hoftbojar-stretch"] },
      { dag: "Söndag",  rubrik: "Vila", ovningar: [] }
    ]
  },
  {
    nr: 3,
    namn: "Fas 3 – Kapacitet",
    langd: "tills vidare – det här är vägen mot en vanlig vardag",
    fokus: "Mätbar styrketräning (benpress, lätta marklyft, lutande press) och längre " +
      "sammanhängande promenader. Fortfarande max ~5 % ökning per vecka, fortfarande " +
      "lugn vecka var fjärde.",
    kravForNasta: "Ingen nästa fas – här handlar det om att långsamt höja taket och hålla " +
      "vanorna. Fira när gångprogrammet når steg 12!",
    vecka: [
      { dag: "Måndag",  rubrik: "Underkropp A", ovningar: ["benpress", "spansk-knaboj", "tahavning-enben", "short-foot", "cykel"] },
      { dag: "Tisdag",  rubrik: "Överkropp", ovningar: ["hantelrodd", "lutande-press", "band-utrot", "face-pull", "grepphall-iso"] },
      { dag: "Onsdag",  rubrik: "Gång & bål", ovningar: ["gang", "sidoplanka", "pallof", "knip"] },
      { dag: "Torsdag", rubrik: "Underkropp B", ovningar: ["stepup", "rdl-latt", "tahavning-exc", "tibialis-lyft"] },
      { dag: "Fredag",  rubrik: "Överkropp & händer", ovningar: ["skulderblads-rodd", "band-inrot", "handledscurl-exc", "bollkram", "wall-slides"] },
      { dag: "Lördag",  rubrik: "Längre gång eller rodd", ovningar: ["gang", "rodd", "vad-stretch"] },
      { dag: "Söndag",  rubrik: "Vila", ovningar: [] }
    ]
  }
];

/* ---------- Hjälpfunktioner för datat ---------- */
function getOvning(id) {
  return OVNINGAR.find(function (o) { return o.id === id; }) || null;
}

function ovningarPerRegion() {
  var grupper = {};
  OVNINGAR.forEach(function (o) {
    if (!grupper[o.region]) grupper[o.region] = [];
    grupper[o.region].push(o);
  });
  return grupper;
}

/* Föregående övning i en progressionskedja (den som pekar på id via next) */
function foregaendeOvning(id) {
  return OVNINGAR.find(function (o) { return o.next === id; }) || null;
}

function dosText(ovning) {
  var d = ovning.dos;
  if (d.min) return d.min + " min";
  if (d.sek) return d.set + " set × " + d.sek + " sek";
  return d.set + " set × " + d.reps + " reps";
}
