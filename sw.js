// Service Worker — SiapPsikotes
// Strategi:
//  - HTML (navigasi): NETWORK-FIRST, supaya update situs langsung kelihatan.
//  - Aset (js/css/gambar/data): cache-first + update di belakang layar
//    (stale-while-revalidate) supaya tetap cepat & bisa offline.
const CACHE = 'siap-psikotes-cae9f8f';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './sitemap.xml',
  './robots.txt',
  './data/soal-bahasa_inggris.js?v=cae9f8f',
  './data/soal-index.js?v=cae9f8f',
  './data/soal-iq.js?v=cae9f8f',
  './data/soal-kepribadian.js?v=cae9f8f',
  './data/soal-kraepelin.js?v=cae9f8f',
  './data/soal-matematika.js?v=cae9f8f',
  './data/soal-numerik.js?v=cae9f8f',
  './data/soal-penalaran_logika.js?v=cae9f8f',
  './data/soal-penuh.js?v=cae9f8f',
  './data/soal-psikologi.js?v=cae9f8f',
  './data/soal-tes_gambar.js?v=cae9f8f',
  './data/soal-tkw.js?v=cae9f8f',
  './data/soal-verbal.js?v=cae9f8f',
  './data/soal.js?v=cae9f8f',
  './data/tips.js?v=cae9f8f',
  './static/css/style.css?v=cae9f8f',
  './static/js/app.js?v=cae9f8f',
  './static/js/data-loader.js?v=cae9f8f',
  './static/js/fitur.js?v=cae9f8f',
  './static/js/fitur2.js?v=cae9f8f',
  './static/js/fitur3.js?v=cae9f8f',
  './static/js/fitur4.js?v=cae9f8f',
  './static/js/fitur5.js?v=cae9f8f',
  './static/js/fitur6.js?v=cae9f8f',
  './static/js/fitur7.js?v=cae9f8f',
  './static/js/fitur8.js?v=cae9f8f',
  './static/js/fitur9.js?v=cae9f8f', './static/js/fitur10.js?v=cae9f8f', './static/js/fitur11.js?v=cae9f8f', './static/js/fitur12.js?v=cae9f8f',
  './static/js/icons.js?v=cae9f8f',
  './static/js/iq.js?v=cae9f8f',
  './static/js/psikologi.js?v=cae9f8f',
  './static/icons/apple-touch-icon-180.png?v=cae9f8f',
  './static/icons/favicon-32.png?v=cae9f8f',
  './static/icons/icon-192.png?v=cae9f8f',
  './static/icons/icon-512.png?v=cae9f8f',
  './static/icons/icon-maskable-512.png?v=cae9f8f'
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
