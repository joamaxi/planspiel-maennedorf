const CACHE_NAME = 'planspiel-buelach-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',

  // CSS
  './assets/css/app.css',
  './assets/css/tailwind.css',

  // JS
  './assets/js/core.js',
  './assets/js/header.js',
  './assets/js/footer.js',

  // Logos
  './assets/logos/neosight-logo.png',

  // Pictos / Icons
  './assets/pictos/back.svg',
  './assets/pictos/next.svg',
  './assets/pictos/handbuch.svg',
  './assets/pictos/wirkung.svg',
  './assets/pictos/bank.svg',
  './assets/pictos/ereignis.svg',
  './assets/pictos/neosight-192.png',
  './assets/pictos/neosight-512.png',
  './assets/pictos/SmilePOS-8.png',
  './assets/pictos/SmileNEG-8.png',
  './assets/pictos/SmilePIC-8.png',

  // Screens (hier alle spz-XX.html eintragen sobald vorhanden)
  './screens/spz-01.html',

  // JSON-Daten (hier alle json-Files eintragen sobald vorhanden)
  // './data/json/einstellungen.json',
];

// Install: alle Assets cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-first, dann Netzwerk
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
