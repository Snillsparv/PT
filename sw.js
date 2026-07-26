/* =========================================================
   sw.js — service worker: gör appen installerbar och offline.
   All träningsdata bor i localStorage, så det enda som behöver
   cachas är själva appskalet (HTML, CSS, JS, typsnitt, bilder).

   Höj CACHE_VERSION när appskalet ändras – då byggs cachen om
   och gamla versioner städas bort vid aktivering.
   ========================================================= */

"use strict";

var CACHE_VERSION = "v3";
var CACHE_NAMN = "min-pt-" + CACHE_VERSION;

/* Relativa vägar så att appen fungerar både i roten och under
   /PT/ på GitHub Pages. */
var APPSKAL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/data.js",
  "./js/storage.js",
  "./js/feedback.js",
  "./js/charts.js",
  "./js/app.js",
  "./fonts/anton-latin.woff2",
  "./img/emblem.png",
  "./img/superpappa-hero.webp",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-maskable-192.png",
  "./img/icon-maskable-512.png",
  "./img/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAMN)
      .then(function (cache) { return cache.addAll(APPSKAL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (namn) {
        return Promise.all(namn.map(function (n) {
          if (n !== CACHE_NAMN) return caches.delete(n);
          return null;
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  /* Sidladdning: nätet först så att en ny version slår igenom direkt,
     cachen som skyddsnät när telefonen är offline. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(function (svar) {
          var kopia = svar.clone();
          caches.open(CACHE_NAMN).then(function (c) { c.put(req, kopia); });
          return svar;
        })
        .catch(function () {
          return caches.match(req).then(function (traff) {
            return traff || caches.match("./index.html");
          });
        })
    );
    return;
  }

  /* Övriga filer: cachen först (snabb start), uppdatera i bakgrunden. */
  e.respondWith(
    caches.match(req).then(function (traff) {
      var natet = fetch(req)
        .then(function (svar) {
          if (svar && svar.status === 200 && svar.type === "basic") {
            var kopia = svar.clone();
            caches.open(CACHE_NAMN).then(function (c) { c.put(req, kopia); });
          }
          return svar;
        })
        .catch(function () { return traff; });
      return traff || natet;
    })
  );
});
