# Min PT

En personlig tränare som webbsida – byggd kring en hälsoprofil med mycket
lättprovocerade sen- och ledbesvär. Grundprincipen i allt: **starta lägre,
stegra långsammare**.

## Vad sidan gör

- **Idag** – dagens föreslagna pass utifrån aktuell fas och veckodag, justerat
  efter morgonkollen (mår ett område dåligt får det vila den dagen).
- **Logga** – registrera övningar med set/reps/vikt/tid och smärta 0–10.
  Direkt efter sparat pass får du feedback enligt trafikljusmodellen, med
  progressionsförslag när du haft två gröna pass i rad.
- **Program** – tre faser (Grunden → Uppbyggnad → Kapacitet) med veckoscheman,
  plus ett gångprogram i 18 steg mot målet att kunna promenera som vanligt.
- **Övningar** – bibliotek där varje övning förklarar *varför* den är vald
  utifrån hälsoprofilen och vad du ska se upp med.
- **Historik** – trender för belastning, smärta och gångminuter, plus
  export/import av all data och en knapp som kopierar en sammanfattning att
  klistra in i en Claude-chatt för personlig feedback.
- **Profil** – den träningsrelevanta hälsoprofilen, varningstecken och
  friskrivning.

## Köra sidan

Sidan är helt statisk – ingen byggprocess, inga beroenden.

- **Lokalt:** öppna `index.html` i valfri webbläsare. (Service workern kräver
  http/https, så offlineläget aktiveras först när sidan serveras – t.ex.
  `python3 -m http.server`.)
- **GitHub Pages:** Settings → Pages → Deploy from branch → välj branch och
  `/ (root)`. Sidan hamnar på `https://<användare>.github.io/<repo>/`.

## Installera som app

Sidan är en PWA (`manifest.webmanifest` + `sw.js`) och kan läggas på
hemskärmen som en vanlig app – utan adressfält, med egen ikon och fullt
användbar offline. Alla sökvägar är relativa, så det fungerar både i roten
och under `/<repo>/` på GitHub Pages.

- **iPhone/iPad (Safari):** Dela-knappen → *Lägg till på hemskärmen*.
  Måste göras i Safari; Chrome på iOS har inte det valet.
- **Android (Chrome):** menyn ⋮ → *Installera app* / *Lägg till på hemskärmen*.

Appskalet cachas av service workern (nätet först för sidan, cache först för
övriga filer), så en ny version slår igenom vid nästa öppning med täckning.
Höj `CACHE_VERSION` i `sw.js` när appskalet ändras.

## Datalagring

All träningsdata sparas i webbläsarens `localStorage` på den enhet du
använder – ingenting skickas någonstans. Ta en export (Historik → Exportera)
då och då som säkerhetskopia, eller för att flytta datan mellan enheter.

**Obs vid installation på iPhone:** en hemskärmsapp på iOS får sitt eget
lagringsutrymme, skilt från Safari. Har du loggat pass i webbläsaren först
ser appen tom ut – exportera i Safari (Historik → Exportera) och importera
i appen, så följer historiken med.

## Viktigt

Sidan är ett träningsstöd, inte medicinsk rådgivning. Vid varningstecken
(blod i urin, svullen/röd/varm led, feber, vilovärk, domningar) – sök vård.
