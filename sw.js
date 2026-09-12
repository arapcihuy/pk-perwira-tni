// Service Worker — SiapPsikotes
// Strategi:
//  - HTML (navigasi): NETWORK-FIRST, supaya update situs langsung kelihatan.
//  - Aset (js/css/gambar/data): cache-first + update di belakang layar
//    (stale-while-revalidate) supaya tetap cepat & bisa offline.
const CACHE = 'siap-psikotes-1d7a38e';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './sitemap.xml',
  './robots.txt',
  './data/soal-bahasa_inggris.js?v=1d7a38e',
  './data/soal-index.js?v=1d7a38e',
  './data/soal-iq.js?v=1d7a38e',
  './data/soal-kepribadian.js?v=1d7a38e',
  './data/soal-kraepelin.js?v=1d7a38e',
  './data/soal-matematika.js?v=1d7a38e',
  './data/soal-numerik.js?v=1d7a38e',
  './data/soal-penalaran_logika.js?v=1d7a38e',
  './data/soal-penuh.js?v=1d7a38e',
  './data/soal-psikologi.js?v=1d7a38e',
  './data/soal-tes_gambar.js?v=1d7a38e',
  './data/soal-tkw.js?v=1d7a38e',
  './data/soal-verbal.js?v=1d7a38e',
  './data/soal.js?v=1d7a38e',
  './data/tips.js?v=1d7a38e',
  './static/css/style.css?v=1d7a38e',
  './static/js/app.js?v=1d7a38e',
  './static/js/data-loader.js?v=1d7a38e',
  './static/js/fitur.js?v=1d7a38e',
  './static/js/fitur2.js?v=1d7a38e',
  './static/js/fitur3.js?v=1d7a38e',
  './static/js/fitur4.js?v=1d7a38e',
  './static/js/fitur5.js?v=1d7a38e',
  './static/js/fitur6.js?v=1d7a38e',
  './static/js/fitur7.js?v=1d7a38e',
  './static/js/fitur8.js?v=1d7a38e',
  './static/js/fitur9.js?v=1d7a38e', './static/js/fitur10.js?v=1d7a38e', './static/js/fitur11.js?v=1d7a38e', './static/js/fitur12.js?v=1d7a38e',
  './static/js/icons.js?v=1d7a38e',
  './static/js/iq.js?v=1d7a38e',
  './static/js/psikologi.js?v=1d7a38e',
  './static/icons/apple-touch-icon-180.png?v=1d7a38e',
  './static/icons/favicon-32.png?v=1d7a38e',
  './static/icons/icon-192.png?v=1d7a38e',
  './static/icons/icon-512.png?v=1d7a38e',
  './static/icons/icon-maskable-512.png?v=1d7a38e'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // satu file gagal jangan sampai membatalkan seluruh instalasi PWA
      return Promise.all(FILES.map(function (u) {
        return c.add(u).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // 1) Navigasi / HTML: coba jaringan dulu, baru cache (offline)
  var isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') >= 0;
  if (isHTML) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) {
          return r || caches.match('./');
        });
      })
    );
    return;
  }

  // 2) Aset lain: sajikan dari cache, perbarui di belakang layar
  e.respondWith(
    caches.match(req).then(function (cached) {
      var jaringan = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type !== 'opaque') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || jaringan;
    })
  );
});
