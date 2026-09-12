// ============================================================
// FITUR TAMBAHAN 5 — v25
// 1) Ringkasan Hafalan (lembar ringkas dari semua baris INGAT)
// 2) Insight waktu belajar (pagi/siang/malam)
// 3) Riwayat versi (changelog) di dalam aplikasi
// 4) Tur awal 4 langkah untuk pemakai baru
// ============================================================

// ============================================================
// 1. RINGKASAN HAFALAN
// ============================================================
var JUDUL_KATEGORI = {
  tkw: 'Wawasan Kebangsaan (tanggal, pasal, Pancasila, TNI)',
  bahasa_inggris: 'Bahasa Inggris (tenses, grammar)',
  verbal: 'Kemampuan Verbal (sinonim, antonim, baku)',
  penalaran_logika: 'Penalaran & Logika (deret, silogisme, sandi)',
  numerik: 'Kemampuan Numerik (hitung cepat, pecahan, persen)',
  matematika: 'Matematika (aljabar, geometri, statistik)',
  kraepelin: 'Tes Kraepelin (aturan satuan, konsistensi)',
  tes_gambar: 'Tes Gambar & Visual',
  kepribadian: 'Tes Kepribadian Situasional'
};

window.ringkasanHafalan = function () {
  var per = {};
  getAllSoal().forEach(function (q) {
    var m = String(q.pembahasan || '').match(/INGAT: (.+)$/m);
    if (!m) return;
    var teks = m[1].trim();
    if (teks.length < 12) return;
    var kat = q.kategori || 'Umum';
    var kunci = kat + '|' + teks;
    if (!per[kat]) per[kat] = {};
    if (!per[kat][teks]) per[kat][teks] = { teks: teks, n: 0, topikSet: {} };
    per[kat][teks].n++;
    if (q.topik) per[kat][teks].topikSet[q.topik] = 1;
  });
  var hasil = [];
  Object.keys(per).forEach(function (kat) {
    var items = Object.keys(per[kat]).map(function (k) {
      var x = per[kat][k];
      return { teks: x.teks, n: x.n, jumlahTopik: Object.keys(x.topikSet).length };
    }).sort(function (a, b) { return b.n - a.n; });
    if (items.length) {
      hasil.push({ kategori: kat, judul: JUDUL_KATEGORI[kategoriKunci(kat)] || kat, items: items });
    }
  });
  // urutkan kategori sesuai urutan ujian yang lazim
  var urut = ['Wawasan Kebangsaan', 'Kemampuan Verbal', 'Bahasa Inggris', 'Penalaran & Logika',
              'Kemampuan Numerik', 'Matematika', 'Tes Kraepelin (Hitung Cepat)',
              'Tes Gambar & Visual', 'Tes Kepribadian Situasional'];
  hasil.sort(function (a, b) { return urut.indexOf(a.kategori) - urut.indexOf(b.kategori); });
  return hasil;
};

function kategoriKunci(nama) {
  var kunci = null;
  daftarKategori().forEach(function (k) { if (namaKategori(k) === nama) kunci = k; });
  return kunci || nama;
}

window.bukaRingkasan = function () {
  if (!katSiapSemua()) {
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan ringkasan hafalan...';
    render();
    pastikanSemua().then(bukaRingkasan);
    return;
  }
  S.page = 'ringkasan';
  render();
};

window.renderRingkasan = function () {
  var golongan = ringkasanHafalan();
  if (!golongan.length) return htmlMemuat('Ringkasan belum tersedia.');
  var total = golongan.reduce(function (a, g) { return a + g.items.length; }, 0);
  var bagian = golongan.map(function (g) {
    var isi = g.items.slice(0, 14).map(function (x) {
      return '<li class="ringkas-item">' + escapeHtml(x.teks) +
        (x.n > 1 ? ' <span class="hari-sub">(' + x.n + ' soal)</span>' : '') + '</li>';
    }).join('');
    var sisa = g.items.length > 14 ? '<div class="hari-sub">+' + (g.items.length - 14) + ' kiat lain di kategori ini</div>' : '';
    return '<div class="card" style="margin-bottom:12px">' +
      '<div class="hari-head">' + ic(katIcon(kategoriKunci(g.kategori)) || 'bulb', 15) + ' <strong>' + escapeHtml(g.judul) + '</strong>' +
        '<span class="hari-tgl">' + g.items.length + ' kiat</span></div>' +
      '<ul class="ringkas-list">' + isi + '</ul>' + sisa + '</div>';
  }).join('');
  return '<div class="mode-badge">' + ic('bulb', 14) + ' Ringkasan Hafalan — dibaca ulang sebelum ujian</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Lembar Kiat Hafalan</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:14px">' + total + ' kiat dari seluruh bank soal, ' +
      'dikelompokkan per bidang. Semua berasal dari baris INGAT pembahasan yang sudah diverifikasi.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
      '<button class="btn btn-secondary btn-sm" onclick="eksporRingkasan()">' + ic('download', 14) + ' Ekspor (cetak/PDF)</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="bukaHafalan()">' + ic('refresh', 14) + ' Latihan kartu</button>' +
    '</div>' + bagian;
};

window.eksporRingkasan = function () {
  var golongan = ringkasanHafalan();
  var h = ['<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Ringkasan Hafalan — PK Perwira</title>',
    '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;max-width:820px;margin:24px auto;padding:0 16px}',
    'h1{font-size:20px}h2{font-size:15px;margin-top:20px;border-bottom:1px solid #ddd;padding-bottom:4px}',
    'ul{padding-left:20px}li{margin:4px 0}</style></head><body>',
    '<h1>Ringkasan Hafalan — PK Perwira TNI</h1>',
    '<p>Dicetak: ' + new Date().toLocaleString('id-ID') + ' · sumber: baris kiat (INGAT) pada pembahasan bank soal</p>',
    '<p><button onclick="window.print()">Cetak / Simpan PDF</button></p>'];
  golongan.forEach(function (g) {
    h.push('<h2>' + escapeHtml(g.judul) + '</h2><ul>' + g.items.map(function (x) {
      return '<li>' + escapeHtml(x.teks) + '</li>';
    }).join('') + '</ul>');
  });
  h.push('</body></html>');
  unduhBerkas('ringkasan-hafalan-' + fHariIni() + '.html', h.join('\n'), 'text/html');
};

// ============================================================
// 2. INSIGHT WAKTU BELAJAR
// ============================================================
window.panelWaktuBelajar = function () {
  var skor = loadScores().filter(function (s) { return typeof s.jam === 'number'; });
  if (skor.length < 4) return '';
  var pagi = [], siang = [], malam = [];
  skor.forEach(function (s) {
    var j = s.jam;
    if (j < 12) pagi.push(s.nilai || 0);
    else if (j < 17) siang.push(s.nilai || 0);
    else malam.push(s.nilai || 0);
  });
  function rata(a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length) : null; }
  var kelompok = [
    { nama: 'Pagi (sebelum 12:00)', nilai: rata(pagi), n: pagi.length },
    { nama: 'Siang (12:00-17:00)', nilai: rata(siang), n: siang.length },
    { nama: 'Malam (setelah 17:00)', nilai: rata(malam), n: malam.length }
  ].filter(function (k) { return k.n > 0; });
  if (kelompok.length < 2) return '';
  var terbaik = kelompok.slice().sort(function (a, b) { return b.nilai - a.nilai; })[0];
  var baris = kelompok.map(function (k) {
    var warna = k.nilai >= 80 ? 'pass' : (k.nilai >= 70 ? 'warn' : 'fail');
    return '<div class="kat-row"><div class="kat-row-top"><span>' + k.nama + '</span><span>' + k.nilai + ' · ' + k.n + ' sesi</span></div>' +
      '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + k.nilai + '%"></div></div></div>';
  }).join('');
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('clock', 16) + ' <strong>Waktu belajar terbaik</strong>' +
      '<span class="hari-tgl">' + skor.length + ' sesi berjam</span></div>' +
    baris +
    '<div class="hari-sub" style="margin-top:8px">Rata-rata tertinggi pada <strong>' + terbaik.nama + '</strong> (' + terbaik.nilai + '). ' +
      'Kalau memungkinkan, jadwalkan tryout berat pada jam itu. Ini pola dari datamu, bukan patokan mutlak — ' +
      'jumlah sesi tiap jam masih sedikit, jadi jangan dijadikan satu-satunya dasar.</div>' +
    '</div>';
};

// ============================================================
// 3. RIWAYAT VERSI
// ============================================================
var CHANGELOG = [
  { v: 'v25', tgl: '12 Sep 2026', isi: [
    'Ringkasan Hafalan: lembar kiat dari seluruh bank soal, siap dicetak.',
    'Pembahasan bergambar untuk 32 soal geometri (rumus + nilai yang diketahui).',
    '+52 soal TWK dan +40 soal Kepribadian Situasional (total 1205 soal).',
    'Posisi kunci jawaban diseimbangkan (kini ~25% untuk A/B/C/D) supaya tidak bisa ditebak.',
    'Insight waktu belajar (pagi/siang/malam) dan halaman riwayat versi.'
  ] },
  { v: 'v24', tgl: '12 Sep 2026', isi: [
    'Tombol Laporkan soal + ekspor laporan untuk audit lanjutan.',
    'Pencarian Bank Soal menjangkau pembahasan, opsi, dan topik.',
    'Statistik & latihan topik terlemah, target nilai bisa diatur, mode 5 menit.',
    'Ekspor Rapot Kesiapan dan pengingat 28 hari (.ics).',
    'Lint penulisan soal (94 perbaikan) dan aksesibilitas bersih (axe nol pelanggaran).'
  ] },
  { v: 'v23', tgl: '12 Sep 2026', isi: [
    'Label topik untuk seluruh soal + filter dan drill per topik.',
    'Skor Kesiapan Ujian, Rencana Harian Otomatis, Rapor Kesiapan, riwayat Kraepelin.',
    '+30 soal Tes Gambar dan +15 soal Kraepelin kolom angka.',
    'Uji aksesibilitas (axe) dan uji mode offline otomatis di CI.'
  ] },
  { v: 'v22', tgl: '12 Sep 2026', isi: [
    'Posisi opsi diacak saat Tryout/Simulasi dan kunci disembunyikan sampai sesi selesai.',
    'Simulasi Format Seleksi (komposisi tetap 60 soal/90 menit).',
    'Latihan adaptif, mode Hafalan Cepat, grafik tren nilai, siapkan mode offline.',
    'Uji runtime Chromium otomatis di CI.'
  ] },
  { v: 'v21', tgl: '12 Sep 2026', isi: [
    'Bank soal salah + pengulangan berjadwal (1-3-7-14-30 hari).',
    'Rincian hasil per kategori, ukuran kecepatan, lanjut sesi, jalur belajar 28 hari.',
    'Kode sinkron antar perangkat, ekspor soal salah, tema terang/gelap + ukuran huruf.',
    '+39 soal TWK, +29 soal Kepribadian, dan 20 gambar soal Tes Gambar.'
  ] },
  { v: 'v19-v20', tgl: '12 Sep 2026', isi: [
    'Audit akurasi 1000 soal: koreksi kunci salah (m58, w97, l33, tg2, tg6, tg16, mg1, e17, v66, w6),',
    'penghapusan soal ambigu, pengecoh dibuat wajar, dan pembahasan diseragamkan.',
    'Format pembahasan: JAWABAN / cara mengerjakan / INGAT.',
    'Data dipecah per kategori (muat pertama turun dari ~160 KB ke ~66 KB).'
  ] }
];

window.bukaRiwayat = function () { S.page = 'riwayat'; render(); };

window.renderRiwayat = function () {
  var bagian = CHANGELOG.map(function (c) {
    return '<div class="card" style="margin-bottom:12px">' +
      '<div class="hari-head">' + ic('star', 15) + ' <strong>' + c.v + '</strong><span class="hari-tgl">' + c.tgl + '</span></div>' +
      '<ul class="ringkas-list">' + c.isi.map(function (x) { return '<li class="ringkas-item">' + escapeHtml(x) + '</li>'; }).join('') + '</ul></div>';
  }).join('');
  return '<div class="mode-badge">' + ic('file', 14) + ' Riwayat versi</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Apa yang berubah</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:14px">Versi aplikasi saat ini: <strong>' + escapeHtml(buildKu()) + '</strong>. ' +
      'Setiap perubahan data maupun fitur dicatat di sini.</div>' + bagian;
};

// ============================================================
// 4. TUR AWAL
// ============================================================
var TUR = [
  { j: 'Mulai dari satu sesi', i: 'Tekan Simulasi Format Seleksi (60 soal, 90 menit) atau Mode Belajar. Setelah selesai, kunci dan pembahasan terbuka otomatis. Soal yang salah masuk ke bank soal salah dan muncul lagi besok.' },
  { j: 'Ulangi yang jatuh tempo', i: 'Setiap hari, buka beranda dan kerjakan soal yang perlu diulang (jadwal 1-3-7-14-30 hari). Pola ini yang paling cepat menaikkan nilai.' },
  { j: 'Latih yang lemah saja', i: 'Buka Progress untuk melihat topik terlemah dan Kesiapan Ujian, atau pakai Latihan Adaptif dan Mode 5 menit. Bank Soal bisa disaring per topik.' },
  { j: 'Hafalan & laporan', i: 'Ringkasan Hafalan berisi semua kiat hafalan siap dicetak. Kalau menemukan soal yang terasa keliru, tekan Laporkan soal lalu ekspor laporannya dari halaman Progress.' }
];

window.turAktif = function () { return localStorage.getItem('tni_tur') !== 'selesai' && S.page === 'home'; };
window.turSelesai = function () { localStorage.setItem('tni_tur', 'selesai'); render(); };

window.panelTur = function () {
  if (!turAktif()) return '';
  var kartu = TUR.map(function (t, i) {
    return '<div class="tur-item"><div class="tur-num">' + (i + 1) + '</div>' +
      '<div><div class="tur-judul">' + escapeHtml(t.j) + '</div><div class="hari-sub">' + escapeHtml(t.i) + '</div></div></div>';
  }).join('');
  return '<div class="card tur-card">' +
    '<div class="hari-head">' + ic('compass', 16) + ' <strong>Panduan awal (4 langkah)</strong></div>' +
    kartu +
    '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="turSelesai()">Saya mengerti</button>' +
    '</div>';
};

// ============================================================
// tempelkan panel + tautan
// ============================================================
var _renderSebelumFitur5 = window.render;
window.render = function () {
  if (_renderSebelumFitur5) _renderSebelumFitur5.apply(this, arguments);
  try { sisipPanel5(); } catch (e) {}
};

function sisipPanel5() {
  var m = document.getElementById('main');
  if (!m) return;

  if (S.page === 'home') {
    var kotak = m.querySelector('.grid-3');
    if (kotak && !m.querySelector('.tur-card')) {
      var w = document.createElement('div');
      w.innerHTML = panelTur();
      kotak.insertAdjacentElement('afterend', w);
    }
    var kaki = m.querySelector('#buildTag');
    if (kaki && !m.querySelector('.tautan-lain')) {
      var w2 = document.createElement('div');
      w2.className = 'tautan-lain';
      w2.style.cssText = 'text-align:center;margin-bottom:18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap';
      w2.innerHTML = '<button class="btn btn-ghost btn-sm" onclick="bukaRingkasan()">' + ic('bulb', 14) + ' Ringkasan Hafalan</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="bukaRiwayat()">' + ic('file', 14) + ' Riwayat versi</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="bukaTentang()">' + ic('shield', 14) + ' Tentang & data</button>';
      kaki.insertAdjacentElement('afterend', w2);
    }
  }

  if (S.page === 'prog') {
    var box = m.querySelector('.panel-rapor-prog');
    if (box && !box.dataset.fitur5) {
      box.dataset.fitur5 = '1';
      box.insertAdjacentHTML('beforeend', panelWaktuBelajar());
    }
  }
}
