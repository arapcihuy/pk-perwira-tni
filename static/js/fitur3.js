// ============================================================
// FITUR TAMBAHAN 3 — v23
// 1) Filter Bank Soal per TOPIK + drill topik
// 2) Skor kesiapan ujian (dengan rentang kepercayaan)
// 3) Rencana harian otomatis
// 4) Rapor kesiapan menyatu (bank + psikotes + IQ Lab)
// 5) Riwayat Kraepelin antar sesi
// 6) Waktu per kategori (dipakai layar hasil)
// 7) Halaman Tentang aplikasi
// ============================================================

// ---------- util ----------
function semuaSoalLengkap() {
  return getAllSoal();
}
function ringkas(cat, q) { return q; }

// ============================================================
// 1. FILTER TOPIK DI BANK SOAL
// ============================================================
window.TOPIK_S = { cat: 'all', topik: 'all' };

window.daftarTopik = function (cat) {
  var hitung = {};
  semuaSoalLengkap().forEach(function (q) {
    if (cat && cat !== 'all' && q.kategori !== namaKategori(cat)) return;
    if (!q.topik) return;
    hitung[q.topik] = (hitung[q.topik] || 0) + 1;
  });
  return Object.keys(hitung).sort(function (a, b) { return hitung[b] - hitung[a]; })
    .map(function (t) { return { topik: t, jumlah: hitung[t] }; });
};

window.namaTopik = function (t) { return String(t).replace(/-/g, ' '); };

window.setTopikBank = function (t) {
  TOPIK_S.topik = t;
  S.bankLimit = 60;
  render();
};

window.panelTopikBank = function () {
  if (!katSiapSemua()) return '';
  var kat = (S.bankCat === 'all') ? 'all' : S.bankCat;
  var daftar = daftarTopik(kat).slice(0, 14);
  if (!daftar.length) return '';
  var chips = daftar.map(function (d) {
    var aktif = TOPIK_S.topik === d.topik;
    return '<button class="chip ' + (aktif ? 'chip-aktif' : '') + '" onclick="setTopikBank(\'' + d.topik + '\')">' +
      escapeHtml(namaTopik(d.topik)) + ' <span class="chip-num">' + d.jumlah + '</span></button>';
  }).join('');
  return '<div class="topik-bar">' +
    '<button class="chip ' + (TOPIK_S.topik === 'all' ? 'chip-aktif' : '') + '" onclick="setTopikBank(\'all\')">semua topik</button>' +
    chips +
    '</div>' +
    (TOPIK_S.topik !== 'all'
      ? '<div style="margin-top:8px"><button class="btn btn-primary btn-sm" onclick="drillTopik(\'' + TOPIK_S.topik + '\', 25)">' +
        ic('target', 15) + ' Latihan 25 soal topik ini</button></div>'
      : '');
};

window.drillTopik = function (topik, jumlah) {
  if (!katSiapSemua()) {
    S.topikCoba = (S.topikCoba || 0) + 1;
    if (S.topikCoba > 2) { S.page = 'gagal'; render(); return; }
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan latihan topik ' + namaTopik(topik) + '...';
    render();
    pastikanSemua().then(function () { drillTopik(topik, jumlah); });
    return;
  }
  S.topikCoba = 0;
  var bank = semuaSoalLengkap().filter(function (q) { return q.topik === topik; });
  if (!bank.length) { alert('Belum ada soal untuk topik ini.'); return; }
  S.cat = 'topik:' + topik;
  S.mode = 'drill';
  S.isSimulasi = false;
  S.iqSpec = null;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.questions = shuffle(bank).slice(0, jumlah || 25).map(acakOpsi);
  S.timed = false;
  S.tampilkanKunci = true;
  S.page = 'soal';
  render();
};

// saring daftar bank soal sesuai topik terpilih
window.bankSaringTopik = function (q) {
  if (!TOPIK_S.topik || TOPIK_S.topik === 'all') return true;
  return q.topik === TOPIK_S.topik;
};

// ============================================================
// 2. SKOR KESIAPAN UJIAN
// ============================================================
function statSoalSemua() { return (typeof statSoal === 'function') ? statSoal() : {}; }

window.hitungKesiapan = function () {
  var st = statSoalSemua();
  var jmlSoal = totalSoal();          // jangan pakai nama totalSoal: akan menutupi fungsi global totalSoal()
  var dikerjakan = 0, benar = 0;
  Object.keys(st).forEach(function (k) {
    var s = st[k];
    dikerjakan++;
    benar += s.b || 0;
  });
  var percobaan = 0;
  Object.keys(st).forEach(function (k) { percobaan += (st[k].b || 0) + (st[k].s || 0); });
  var akurasi = percobaan ? Math.round((benar / percobaan) * 100) : 0;
  var cakupan = jmlSoal ? Math.round((dikerjakan / jmlSoal) * 100) : 0;

  // nilai tryout terakhir (bila ada) sebagai pembanding
  var skor = loadScores();
  var nSkor = skor.slice(-5);
  var rataTryout = nSkor.length ? Math.round(nSkor.reduce(function (a, s) { return a + (s.nilai || 0); }, 0) / nSkor.length) : null;

  var perkiraan = null, rentang = 0, catatan = '';
  if (percobaan >= 20) {
    var dasar = (rataTryout !== null) ? Math.round((akurasi * 0.6) + (rataTryout * 0.4)) : akurasi;
    perkiraan = dasar;
    // rentang makin sempit bila soal yang dikerjakan makin banyak
    rentang = Math.max(3, Math.round(12 - (cakupan / 100) * 8));
    catatan = 'Perkiraan dari akurasi latihan dan ' + (rataTryout !== null ? 'nilai tryout terakhir' : 'cakupan latihan') +
      '. Targetmu ' + tgt + ', jadi status dinilai terhadap target itu.';
  } else {
    catatan = 'Belum cukup data (minimal 20 soal dikerjakan) untuk memperkirakan nilai.';
  }

  var status, warna;
  var tgt = (typeof targetNilai === 'function') ? targetNilai() : 80;
  if (perkiraan === null) { status = 'Belum terukur'; warna = 'warn'; }
  else if (perkiraan >= tgt) { status = 'Siap (target ' + tgt + ')'; warna = 'pass'; }
  else if (perkiraan >= tgt - 10) { status = 'Cukup siap (target ' + tgt + ')'; warna = 'warn'; }
  else { status = 'Perlu latihan lagi (target ' + tgt + ')'; warna = 'fail'; }

  return {
    target: tgt, totalSoal: jmlSoal, dikerjakan: dikerjakan, cakupan: cakupan, akurasi: akurasi,
    percobaan: percobaan, rataTryout: rataTryout, perkiraan: perkiraan, rentang: rentang,
    status: status, warna: warna, catatan: catatan
  };
};

window.panelKesiapan = function () {
  var k = hitungKesiapan();
  var angka = (k.perkiraan === null)
    ? '<div class="siap-angka siap-warn">?</div>'
    : '<div class="siap-angka siap-' + k.warna + '">' + k.perkiraan + '<span class="siap-plus">±' + k.rentang + '</span></div>';
  return '<div class="card siap-card">' +
    '<div class="hari-head">' + ic('medal', 16) + ' <strong>Kesiapan Ujian</strong>' +
      '<span class="hari-tgl">' + k.status + '</span></div>' +
    angka +
    '<div class="hari-grid">' +
      '<div class="hari-box"><div class="hari-num">' + k.akurasi + '%</div><div class="hari-lbl">akurasi latihan</div></div>' +
      '<div class="hari-box"><div class="hari-num">' + k.cakupan + '%</div><div class="hari-lbl">soal tercakup</div></div>' +
      '<div class="hari-box"><div class="hari-num">' + k.dikerjakan + '</div><div class="hari-lbl">soal dipantau</div></div>' +
    '</div>' +
    '<div class="hari-sub" style="margin-top:8px">' + escapeHtml(k.catatan) +
      (k.perkiraan !== null ? ' Rentang ±' + k.rentang + ' menunjukkan ketidakpastian — makin banyak soal dikerjakan, makin sempit rentangnya.' : '') +
    '</div>' +
    '</div>';
};

// ============================================================
// 3. RENCANA HARIAN OTOMATIS
// ============================================================
window.rencanaHarian = function () {
  if (!katSiapSemua()) return null;
  var st = statSoalSemua();
  var prog = loadProgress();
  var perKat = {};   // kategori -> {p, n}
  Object.keys(prog).forEach(function (nama) {
    var p = prog[nama];
    if (p && p.total >= 5) perKat[nama] = { p: Math.round((p.benar / p.total) * 100), n: p.total };
  });
  var urut = Object.keys(perKat).sort(function (a, b) { return perKat[a].p - perKat[b].p; });

  var ulang = (typeof daftarUlang === 'function') ? daftarUlang().length : 0;
  var zona = 0;
  Object.keys(st).forEach(function (k) {
    var s = st[k];
    var p = s.b / (s.b + s.s);
    if (p >= 0.4 && p <= 0.75) zona++;
  });

  var langkah = [];
  if (urut.length) {
    var lemah = urut[0];
    langkah.push('Kerjakan 20 soal <strong>' + escapeHtml(lemah) + '</strong> (akurasi ' + perKat[lemah].p + '% — terlemah saat ini)');
  } else {
    langkah.push('Mulai satu sesi <strong>Mode Belajar</strong> di kategori mana pun untuk mendapat data awal');
  }
  if (ulang > 0) langkah.push('Ulangi <strong>' + Math.min(ulang, 40) + ' soal</strong> yang jatuh tempo di bank soal salah');
  if (zona >= 5) langkah.push('Latihan adaptif <strong>25 soal</strong> (ada ' + zona + ' soal di zona pas)');
  langkah.push('Kalau belum, kerjakan 1 <strong>Simulasi Format Seleksi</strong> hari ini');
  return { langkah: langkah, lemah: urut.length ? urut[0] : null };
};

window.panelRencana = function () {
  var cetak = rencanaHarian();
  if (!cetak) return '';
  var li = cetak.langkah.map(function (l, i) {
    return '<li class="rencana-item"><span class="rencana-num">' + (i + 1) + '</span><span>' + l + '</span></li>';
  }).join('');
  return '<div class="card" style="margin-bottom:14px">' +
    '<div class="hari-head">' + ic('list', 16) + ' <strong>Rencana Hari Ini</strong>' +
      '<span class="hari-tgl">' + fHariIni() + '</span></div>' +
    '<ul class="rencana-list">' + li + '</ul>' +
    (cetak.lemah ? '<button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="drillKategori(\'' + cetak.lemah + '\')">' +
      ic('target', 15) + ' Mulai dari kategori terlemah</button>' : '') +
    '</div>';
};

window.drillKategori = function (namaKat) {
  var kunci = null;
  daftarKategori().forEach(function (k) { if (namaKategori(k) === namaKat) kunci = k; });
  if (!kunci) { navTo('cat'); return; }
  startCat(kunci, 'drill25');
};

// ============================================================
// 4. RAPOR KESIAPAN MENYATU (bank + psikotes + IQ Lab)
// ============================================================
window.panelRapor = function () {
  var k = hitungKesiapan();
  var psi = (typeof PSI !== 'undefined' && PSI.history) ? PSI.history.slice(-8) : [];
  var terakhir = {};
  psi.forEach(function (h) {
    var nama = String(h.testName || '').replace('Tes Daya Ingat - ', 'Daya Ingat: ');
    terakhir[nama] = h;
  });
  var barisPsi = Object.keys(terakhir).map(function (nama) {
    var h = terakhir[nama];
    var skor = h.score || 0;
    var warna = skor >= 80 ? 'pass' : (skor >= 60 ? 'warn' : 'fail');
    var saran = skor >= 80 ? 'pertahankan' : (skor >= 60 ? 'latih lagi 1-2 sesi' : 'prioritaskan — sarankan Dual N-Back 15 menit/hari');
    return '<div class="kat-row"><div class="kat-row-top"><span>' + escapeHtml(nama) + '</span><span>' + skor + '% · ' + saran + '</span></div>' +
      '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + skor + '%"></div></div></div>';
  }).join('');

  var iqLog = (typeof loadIqLog === 'function') ? loadIqLog() : [];
  var iqTeks = '';
  if (iqLog && iqLog.length) {
    var ak = iqLog.slice(-5);
    var rata = Math.round(ak.reduce(function (a, x) { return a + (x.akurasi || x.skor || 0); }, 0) / ak.length);
    iqTeks = '<div class="hari-sub">IQ Lab (5 sesi terakhir): rata-rata akurasi <strong>' + rata + '%</strong>.</div>';
  }

  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('award', 16) + ' <strong>Rapor Kesiapan</strong></div>' +
    '<div class="hari-sub">Estimasi nilai ujian: <strong>' +
      (k.perkiraan === null ? 'belum terukur' : k.perkiraan + ' ± ' + k.rentang) + '</strong> · status <strong>' + k.status + '</strong></div>' +
    (barisPsi ? '<div style="margin-top:12px"><div class="hari-sub">Hasil psikotes terakhir:</div>' + barisPsi + '</div>'
              : '<div class="hari-sub" style="margin-top:10px">Belum ada hasil psikotes. Buka menu Psikologi untuk mulai (Kraepelin, Digit Span, Daya Ingat, EPPS).</div>') +
    iqTeks +
    '<div class="hari-sub" style="margin-top:8px">Saran: bagian dengan hasil terendah di atas adalah prioritas latihan hari ini.</div>' +
    '</div>';
};

// ============================================================
// 5. RIWAYAT KRAEPELIN ANTAR SESI
// ============================================================
window.panelKraepelinRiwayat = function () {
  if (typeof PSI === 'undefined' || !PSI.history) return '';
  var krap = PSI.history.filter(function (h) { return /kraepelin/i.test(h.testName || ''); }).slice(-10);
  if (krap.length < 2) return '';
  var w = 320, h = 90, pad = 8, maks = 100;
  var lebar = (w - pad * 2) / krap.length;
  var batang = krap.map(function (s, i) {
    var v = Math.max(0, Math.min(100, s.score || 0));
    var th = Math.round(((h - 22) * v) / maks);
    var x = pad + i * lebar;
    var warna = v >= 80 ? 'var(--green)' : (v >= 60 ? 'var(--gold2)' : 'var(--red)');
    return '<rect x="' + (x + 1).toFixed(1) + '" y="' + (h - 14 - th) + '" width="' + Math.max(2, lebar - 2).toFixed(1) +
      '" height="' + th + '" rx="1.5" fill="' + warna + '" opacity="0.85"></rect>';
  }).join('');
  var pertama = krap[0].score || 0, akhir = krap[krap.length - 1].score || 0;
  var delta = akhir - pertama;
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('zap', 16) + ' <strong>Riwayat Tes Kraepelin</strong>' +
      '<span class="hari-tgl">' + krap.length + ' sesi terakhir</span></div>' +
    '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto" role="img" aria-label="Grafik riwayat Kraepelin">' + batang +
      '<text x="' + pad + '" y="' + (h - 2) + '" fill="var(--text3)" font-size="9">terlama</text>' +
      '<text x="' + (w - pad) + '" y="' + (h - 2) + '" fill="var(--text3)" font-size="9" text-anchor="end">terbaru</text></svg>' +
    '<div class="hari-sub">Skor awal ' + pertama + '% → terakhir ' + akhir + '% (' +
      (delta >= 0 ? 'naik ' + delta : 'turun ' + Math.abs(delta)) + ' poin). ' +
      'Yang dinilai psikolog bukan angka tertinggi, tetapi kestabilan grafik antar kolom.</div>' +
    '</div>';
};

// ============================================================
// 6. WAKTU PER KATEGORI (dipakai layar hasil)
// ============================================================
window.hitungWaktuKategori = function () {
  var dur = S.dur || {};
  var per = {};
  Object.keys(dur).forEach(function (idx) {
    var q = S.questions[idx];
    if (!q) return;
    var kat = q.kategori || 'Umum';
    per[kat] = (per[kat] || 0) + (dur[idx] || 0);
  });
  return per;
};

window.panelKecepatanKategori = function (res) {
  var per = (res && res.perKat) ? res.perKat : {};
  var waktu = hitungWaktuKategori();
  var nama = Object.keys(waktu);
  if (!nama.length) return '';
  var urut = nama.map(function (n) {
    var jml = per[n] ? per[n].total : 1;
    return { nama: n, detik: Math.round(waktu[n] / Math.max(1, jml)), total: Math.round(waktu[n]) };
  }).sort(function (a, b) { return b.detik - a.detik; });
  var baris = urut.map(function (u) {
    var warna = u.detik <= 60 ? 'pass' : (u.detik <= 90 ? 'warn' : 'fail');
    return '<div class="kat-row"><div class="kat-row-top"><span>' + escapeHtml(u.nama) + '</span>' +
      '<span>' + u.detik + ' detik/soal · total ' + u.total + 's</span></div>' +
      '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + Math.min(100, Math.round((u.detik / 120) * 100)) + '%"></div></div></div>';
  }).join('');
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('clock', 16) + ' <strong>Waktu per kategori</strong></div>' +
    baris +
    '<div class="hari-sub" style="margin-top:8px">Kategori paling lambat adalah prioritas latihan kecepatan. Target: ≤ 60 detik/soal.</div>' +
    '</div>';
};

// ============================================================
// 7. HALAMAN TENTANG
// ============================================================
window.bukaTentang = function () {
  S.page = 'tentang';
  render();
};

window.renderTentang = function () {
  var k = hitungKesiapan();
  var pakai = '';
  var berkas = '';
  return '<div class="mode-badge">' + ic('shield', 14) + ' Tentang aplikasi</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Platform Belajar PK Perwira TNI</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:16px">Gratis, tanpa akun, data tersimpan di perangkat ini saja.</div>' +
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="hari-head">' + ic('file', 16) + ' <strong>Isi & versi</strong></div>' +
      '<div class="hari-sub">Versi aset: <strong>' + escapeHtml(buildKu()) + '</strong><br>' +
      'Jumlah soal: <strong>' + totalSoal() + '</strong> dalam ' + daftarKategori().length + ' kategori<br>' +
      'Gambar soal: <strong>' + getAllSoal().filter(function (q) { return q.gambar; }).length + '</strong><br>' +
      'Soal sudah pernah dikerjakan: <strong>' + k.dikerjakan + '</strong> (' + k.cakupan + '%)</div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="hari-head">' + ic('download', 16) + ' <strong>Data & penyimpanan</strong></div>' +
      '<div class="hari-sub">Semua progres (nilai, bank soal salah, hafalan, log IQ, hasil psikotes) disimpan di localStorage perangkat ini. ' +
      'Tidak ada data yang dikirim ke server.<br>' +
      'Pindah perangkat: buka <strong>Progress → Sinkron antar perangkat</strong>, salin kode lalu tempel di perangkat baru.</div>' +
      '<div id="infoPakaiTentang" class="hari-sub" style="margin-top:8px"></div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="btn btn-secondary btn-sm" onclick="tampilkanPakaiPenyimpanan()">Cek pemakaian penyimpanan</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="navTo(\'prog\')">Buka Progress</button>' +
      '</div>' +
      '</div>' +
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="hari-head">' + ic('alert', 16) + ' <strong>Reset data</strong></div>' +
      '<div class="hari-sub">Menghapus seluruh progres, nilai, bank soal salah, hafalan, dan log IQ di perangkat ini. ' +
      'Soal dan pengaturan tema tidak terpengaruh.</div>' +
      '<button class="btn btn-danger btn-sm" style="margin-top:10px" onclick="resetAll()">Reset semua data progres</button>' +
      '</div>' +
    '<div class="card">' +
      '<div class="hari-head">' + ic('bulb', 16) + ' <strong>Cara pakai singkat</strong></div>' +
      '<div class="hari-sub">1. Kerjakan 1 sesi (Tryout/Simulasi) atau Mode Belajar tiap hari.<br>' +
      '2. Soal yang salah otomatis masuk bank soal salah dan muncul lagi setelah 1-3-7-14-30 hari.<br>' +
      '3. Pakai <strong>Latihan Adaptif</strong> untuk soal yang tingkat benarmu 40-75%.<br>' +
      '4. Pakai <strong>Hafalan Cepat</strong> untuk materi TWK yang perlu dihafal.<br>' +
      '5. Cek <strong>Kesiapan Ujian</strong> dan <strong>Rapor Kesiapan</strong> di halaman Progress.</div>' +
      '</div>';
};

window.tampilkanPakaiPenyimpanan = async function () {
  var el = document.getElementById('infoPakaiTentang');
  if (!el) return;
  if (!navigator.storage || !navigator.storage.estimate) { el.textContent = 'Peramban ini tidak menyediakan info penyimpanan.'; return; }
  try {
    var e = await navigator.storage.estimate();
    var mb = function (x) { return (x / 1048576).toFixed(2) + ' MB'; };
    var berkas = 0;
    if (window.caches) {
      var nama = await caches.keys();
      for (var i = 0; i < nama.length; i++) {
        var c = await caches.open(nama[i]);
        berkas += (await c.keys()).length;
      }
    }
    var l = 0;
    for (var j = 0; j < localStorage.length; j++) {
      var kk = localStorage.key(j);
      l += (kk.length + (localStorage.getItem(kk) || '').length) * 2;
    }
    el.textContent = 'Terpakai ' + mb(e.usage || 0) + ' dari kuota ' + mb(e.quota || 0) +
      ' · cache ' + berkas + ' berkas · data lokal ' + (l / 1024).toFixed(0) + ' KB.';
  } catch (err) {
    el.textContent = 'Gagal membaca info penyimpanan.';
  }
};

// ============================================================
// tempelkan panel-panel ke halaman terkait
// ============================================================
var _renderSebelumFitur3 = window.render;
window.render = function () {
  if (_renderSebelumFitur3) _renderSebelumFitur3.apply(this, arguments);
  try { sisipPanel3(); } catch (e) {}
};

function sisipPanel3() {
  var m = document.getElementById('main');
  if (!m) return;

  if (S.page === 'bank') {
    var head = m.querySelector('.bank-bar') || m.firstElementChild;
    if (head && !m.querySelector('.topik-bar')) {
      var w = document.createElement('div');
      w.className = 'topik-wrap';
      w.innerHTML = panelTopikBank();
      head.insertAdjacentElement('afterend', w);
    }
  }

  if (S.page === 'home') {
    var kotak = m.querySelector('.grid-3');
    if (kotak && !m.querySelector('.siap-card')) {
      var wrap = document.createElement('div');
      wrap.innerHTML = panelRencana() + panelKesiapan();
      kotak.insertAdjacentElement('afterend', wrap);
    }
  }

  if (S.page === 'hasil') {
    var hasil = m.querySelector('.panel-kategori-hasil');
    if (hasil && !hasil.querySelector('.kecepatan-kat')) {
      var div = document.createElement('div');
      div.className = 'kecepatan-kat';
      div.innerHTML = panelKecepatanKategori(S.lastResult || {});
      hasil.appendChild(div);
    }
  }

  if (S.page === 'prog') {
    var box = m.querySelector('.panel-rapor-prog');
    if (!box) {
      box = document.createElement('div');
      box.className = 'panel-rapor-prog';
      m.appendChild(box);
    }
    if (!box.dataset.terisi) {
      box.dataset.terisi = '1';
      box.innerHTML = panelRapor() + panelKraepelinRiwayat() + panelKesiapan();
    }
  }

  if (S.page === 'tentang') {
    var t = m.querySelector('.tentang-wrap');
    if (!t) {
      var d2 = document.createElement('div');
      d2.className = 'tentang-wrap';
      m.innerHTML = renderTentang();
    }
  }
}
