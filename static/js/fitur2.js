// ============================================================
// FITUR TAMBAHAN 2 — v22
// 1) Acak posisi opsi saat Tryout/Simulasi
// 2) Sembunyikan kunci selama Tryout/Simulasi
// 3) Simulasi Format Seleksi (komposisi tetap)
// 4) Drill adaptif berbasis tingkat kesulitan nyata
// 5) Mode hafalan cepat (kartu bolak-balik)
// 6) Grafik tren nilai + tren per kategori
// 7) Siapkan mode offline
// 8) Ajakan pasang ke layar utama (PWA)
// ============================================================

// ---------- 1. acak posisi opsi ----------
window.acakOpsi = function (q) {
  var n = (q.pilihan || []).length;
  if (n < 2) return q;
  var urut = [];
  for (var i = 0; i < n; i++) urut.push(i);
  for (var j = urut.length - 1; j > 0; j--) {
    var r = Math.floor(Math.random() * (j + 1));
    var t = urut[j]; urut[j] = urut[r]; urut[r] = t;
  }
  var baru = Object.assign({}, q);
  baru.pilihan = urut.map(function (i) { return q.pilihan[i]; });
  baru.jawaban = urut.indexOf(q.jawaban);
  if (q.pilihanSvg) baru.pilihanSvg = urut.map(function (i) { return q.pilihanSvg[i]; });
  baru.urutAsli = urut;            // untuk keperluan rujukan bila diperlukan
  return baru;
};

// ---------- 2. buka kunci lebih awal (saat tryout) ----------
window.bukaKunciSekarang = function () {
  S.tampilkanKunci = true;
  render();
};

// ---------- 3. simulasi format seleksi ----------
var KOMPOSISI_SELEKSI = [
  ['tkw', 15], ['verbal', 8], ['numerik', 10], ['penalaran_logika', 10],
  ['matematika', 7], ['bahasa_inggris', 5], ['kepribadian', 5]
];

window.startSimulasiFormat = function (percobaan) {
  var jumlah = KOMPOSISI_SELEKSI.reduce(function (a, x) { return a + x[1]; }, 0);  // 60 soal
  if (!katSiapSemua()) {
    S.formatCoba = (S.formatCoba || 0) + 1;
    if (S.formatCoba > 2) { S.page = 'gagal'; render(); return; }
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan simulasi format seleksi...';
    render();
    pastikanSemua().then(function () { startSimulasiFormat(percobaan); });
    return;
  }
  S.formatCoba = 0;
  var semua = getAllSoal();
  var perKat = {};
  semua.forEach(function (s) { (perKat[s.kategori] = perKat[s.kategori] || []).push(s); });
  var pilih = [];
  KOMPOSISI_SELEKSI.forEach(function (x) {
    var nama = namaKategori(x[0]);
    var bank = shuffle(perKat[nama] || []);
    pilih = pilih.concat(bank.slice(0, x[1]).map(acakOpsi));
  });
  if (pilih.length < jumlah) {          // jaga-jaga kalau data kurang
    pilih = pilih.concat(shuffle(semua).slice(0, jumlah - pilih.length).map(acakOpsi));
  }
  S.cat = 'format';
  S.mode = 'tryout';
  S.isSimulasi = true;
  S.isFormat = true;
  S.iqSpec = null;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.questions = pilih;
  S.timed = true;
  S.tampilkanKunci = false;            // kunci baru dibuka di layar hasil
  S.totalTime = 5400;                  // 90 menit
  S.timeLeft = 5400;
  if (S.timer) { clearInterval(S.timer); S.timer = null; }
  S.page = 'soal';
  render();
};

window.infoKomposisiFormat = function () {
  return KOMPOSISI_SELEKSI.map(function (x) {
    return namaKategori(x[0]) + ' ' + x[1];
  }).join(' · ');
};

// ---------- 4. drill adaptif ----------
function statSoal() {
  try { return JSON.parse(localStorage.getItem('tni_soal_stat') || '{}') || {}; } catch (e) { return {}; }
}
function simpanStatSoal(o) { try { localStorage.setItem('tni_soal_stat', JSON.stringify(o)); } catch (e) {} }

window.catatStatSoal = function (id, benar) {
  if (!id) return;
  var st = statSoal();
  var it = st[id] || { b: 0, s: 0 };
  if (benar) it.b++; else it.s++;
  it.t = fHariIni();
  st[id] = it;
  simpanStatSoal(st);
};

// tingkat kesulitan nyata: persentase benar. Zona belajar efektif 40-75%.
window.drillAdaptif = function () {
  if (!katSiapSemua()) {
    S.adaptifCoba = (S.adaptifCoba || 0) + 1;
    if (S.adaptifCoba > 2) { S.page = 'gagal'; render(); return; }
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan latihan adaptif...';
    render();
    pastikanSemua().then(function () { drillAdaptif(); });
    return;
  }
  S.adaptifCoba = 0;
  var st = statSoal();
  var semua = getAllSoal();
  var zona = [], belumPernah = [], terlaluMudah = [];
  semua.forEach(function (q) {
    var s = st[q.id];
    if (!s || (s.b + s.s) < 1) { belumPernah.push(q); return; }
    var p = s.b / (s.b + s.s);
    if (p >= 0.4 && p <= 0.75) zona.push({ q: q, p: p, n: s.b + s.s });
    else if (p > 0.75) terlaluMudah.push(q);
  });
  zona.sort(function (a, b) { return b.n - a.n; });          // paling sering dicoba dulu
  var pilih = zona.slice(0, 20).map(function (x) { return acakOpsi(x.q); });
  var sisa = 25 - pilih.length;
  if (sisa > 0) pilih = pilih.concat(shuffle(belumPernah).slice(0, sisa).map(acakOpsi));
  if (pilih.length < 10) pilih = pilih.concat(shuffle(terlaluMudah).slice(0, 10 - pilih.length).map(acakOpsi));
  if (!pilih.length) { alert('Belum cukup data. Kerjakan beberapa sesi dulu.'); return; }

  var sudahDikerjakan = Object.keys(st).length;
  S.cat = 'adaptif';
  S.mode = 'drill';
  S.isSimulasi = false;
  S.isFormat = false;
  S.iqSpec = null;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.questions = pilih;
  S.timed = false;
  S.tampilkanKunci = true;             // latihan: pembahasan langsung tampil
  S.page = 'soal';
  render();
};

window.infoAdaptif = function () {
  var st = statSoal();
  var n = 0, zona = 0;
  Object.keys(st).forEach(function (k) {
    var s = st[k];
    n++;
    var p = s.b / (s.b + s.s);
    if (p >= 0.4 && p <= 0.75) zona++;
  });
  return { dipantau: n, zona: zona };
};

// ---------- 5. mode hafalan (kartu bolak-balik) ----------
var HAF = { daftar: [], idx: 0, balik: false, saring: 'belum', sesi: 0 };

function hafalStore() {
  try { return JSON.parse(localStorage.getItem('tni_hafal') || '{}') || {}; } catch (e) { return {}; }
}
function simpanHafal(o) { try { localStorage.setItem('tni_hafal', JSON.stringify(o)); } catch (e) {} }

function susunKartu() {
  var semua = getAllSoal().filter(function (s) {
    return s.kategori === namaKategori('tkw');
  });
  var h = hafalStore();
  if (HAF.saring === 'belum') {
    semua = semua.filter(function (s) {
      var v = h[s.id];
      return !v || v.t < 2;                 // belum ditandai hafal 2x
    });
  }
  HAF.daftar = shuffle(semua);
  HAF.idx = 0;
  HAF.balik = false;
  HAF.sesi++;
}

window.bukaHafalan = function (saring) {
  if (!katSiapSemua()) {
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan kartu hafalan...';
    render();
    pastikanSemua().then(function () { bukaHafalan(saring); });
    return;
  }
  HAF.saring = saring || HAF.saring || 'belum';
  susunKartu();
  S.page = 'hafalan';
  render();
};
window.hafalSaring = function (s) { HAF.saring = s; HAF.daftar = []; bukaHafalan(s); };
window.hafalBalik = function () { HAF.balik = true; render(); };
window.hafalLanjut = function (tahu) {
  var kartu = HAF.daftar[HAF.idx];
  if (kartu) {
    var h = hafalStore();
    var v = h[kartu.id] || { t: 0, l: 0 };
    if (tahu) v.t++; else { v.l++; v.t = 0; }
    h[kartu.id] = v;
    simpanHafal(h);
    if (!tahu) {                          // belum hafal -> dikembalikan ke belakang antrean
      HAF.daftar.push(kartu);
    }
  }
  HAF.idx++;
  HAF.balik = false;
  render();
};
window.hafalUlangDariAwal = function () { susunKartu(); render(); };
window.hafalStat = function () {
  var h = hafalStore();
  var hafal = 0;
  Object.keys(h).forEach(function (k) { if (h[k].t >= 2) hafal++; });
  var total = getAllSoal().filter(function (s) { return s.kategori === namaKategori('tkw'); }).length;
  return { hafal: hafal, total: total };
};

window.renderHafalan = function () {
  if (!HAF.daftar.length) susunKartu();
  var st = hafalStat();
  var jumlah = HAF.daftar.length;
  var head = '<div class="mode-badge">' + ic('bulb', 14) + ' Mode Hafalan Cepat — kartu bolak-balik</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Hafalan Wawasan Kebangsaan</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:14px">' +
      st.hafal + ' dari ' + st.total + ' kartu sudah ditandai hafal. ' +
      'Kartu yang kamu tandai "belum" akan muncul lagi di akhir antrean.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
      '<button class="btn ' + (HAF.saring === 'belum' ? 'btn-primary' : 'btn-secondary') + ' btn-sm" onclick="hafalSaring(\'belum\')">Belum hafal</button>' +
      '<button class="btn ' + (HAF.saring === 'semua' ? 'btn-primary' : 'btn-secondary') + ' btn-sm" onclick="hafalSaring(\'semua\')">Semua kartu</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="hafalUlangDariAwal()">Acak ulang</button>' +
    '</div>';

  if (!jumlah) {
    return head + '<div class="empty"><div class="empty-icon">' + icon('check-circle', 44) + '</div>' +
      '<p>Semua kartu di kategori ini sudah kamu tandai hafal. Bagus!</p>' +
      '<button class="btn btn-secondary" style="margin-top:12px" onclick="hafalSaring(\'semua\')">Ulangi semua kartu</button></div>';
  }
  if (HAF.idx >= jumlah) {
    return head + '<div class="empty"><div class="empty-icon">' + icon('award', 44) + '</div>' +
      '<p>Antrean kartu selesai. ' + jumlah + ' kartu dikerjakan.</p>' +
      '<div style="display:flex;gap:8px;margin-top:12px;justify-content:center">' +
      '<button class="btn btn-primary" onclick="hafalUlangDariAwal()">Putar ulang</button>' +
      '<button class="btn btn-secondary" onclick="goHome()">Kembali</button></div></div>';
  }

  var q = HAF.daftar[HAF.idx];
  var ingat = '';
  var m = String(q.pembahasan || '').match(/INGAT: (.+)$/m);
  if (m) ingat = m[1];
  var depan = '<div class="flash-card" onclick="hafalBalik()">' +
    '<div class="flash-label">Pertanyaan ' + (HAF.idx + 1) + ' / ' + jumlah + '</div>' +
    '<div class="flash-teks">' + escapeHtml(String(q.pertanyaan)) + '</div>' +
    (HAF.balik ? '' : '<div class="flash-hint">Ketuk kartu untuk melihat jawaban</div>') +
    '</div>';
  var belakang = '';
  if (HAF.balik) {
    belakang = '<div class="flash-jawab">' +
      '<div class="flash-label">Jawaban</div>' +
      '<div class="flash-kunci">' + escapeHtml(q.pilihan[q.jawaban]) + '</div>' +
      (ingat ? '<div class="flash-ingat">' + escapeHtml(ingat) + '</div>' : '') +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="btn btn-secondary btn-lg" style="flex:1" onclick="hafalLanjut(false)">' + ic('refresh', 16) + ' Belum hafal</button>' +
        '<button class="btn btn-primary btn-lg" style="flex:1" onclick="hafalLanjut(true)">' + ic('check', 16) + ' Sudah hafal</button>' +
      '</div>';
  } else {
    belakang = '<button class="btn btn-primary btn-lg" style="width:100%;margin-top:12px" onclick="hafalBalik()">Lihat jawaban</button>';
  }
  return head + depan + belakang;
};

// ---------- 6. grafik tren nilai ----------
function grafikTren(skor) {
  if (!skor.length) return '';
  var w = 320, h = 90, pad = 8;
  var maks = 100;
  var lebar = (w - pad * 2) / skor.length;
  var batang = skor.map(function (s, i) {
    var v = Math.max(0, Math.min(100, s.nilai || 0));
    var th = Math.round(((h - 22) * v) / maks);
    var x = pad + i * lebar;
    var warna = v >= 80 ? 'var(--green)' : (v >= 70 ? 'var(--gold2)' : 'var(--red)');
    return '<rect x="' + (x + 1).toFixed(1) + '" y="' + (h - 14 - th) + '" width="' + Math.max(2, lebar - 2).toFixed(1) +
      '" height="' + th + '" rx="1.5" fill="' + warna + '" opacity="0.85"></rect>';
  }).join('');
  var rata = Math.round(skor.reduce(function (a, s) { return a + (s.nilai || 0); }, 0) / skor.length);
  var garisRata = '<line x1="' + pad + '" y1="' + (h - 14 - Math.round(((h - 22) * rata) / maks)) + '" x2="' + (w - pad) +
    '" y2="' + (h - 14 - Math.round(((h - 22) * rata) / maks)) + '" stroke="var(--blue2)" stroke-width="1" stroke-dasharray="3 3"></line>';
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto" role="img" aria-label="Grafik tren nilai ' + skor.length + ' sesi terakhir">' +
    batang + garisRata +
    '<text x="' + pad + '" y="' + (h - 2) + '" fill="var(--text3)" font-size="9">sesi terlama</text>' +
    '<text x="' + (w - pad) + '" y="' + (h - 2) + '" fill="var(--text3)" font-size="9" text-anchor="end">terbaru</text>' +
    '</svg>';
}

window.panelTren = function () {
  var skor = loadScores();
  if (!skor.length) return '';
  var nampil = skor.slice(-30);
  var rata = Math.round(nampil.reduce(function (a, s) { return a + (s.nilai || 0); }, 0) / nampil.length);
  var terbaik = Math.max.apply(null, nampil.map(function (s) { return s.nilai || 0; }));
  var tren = '';
  if (nampil.length >= 4) {
    var separuh = Math.floor(nampil.length / 2);
    var awal = nampil.slice(0, separuh), akhir = nampil.slice(separuh);
    var rAwal = awal.reduce(function (a, s) { return a + (s.nilai || 0); }, 0) / awal.length;
    var rAkhir = akhir.reduce(function (a, s) { return a + (s.nilai || 0); }, 0) / akhir.length;
    var delta = Math.round(rAkhir - rAwal);
    tren = delta > 0
      ? '<span class="ok-text">' + ic('trend', 13) + ' naik ' + delta + ' poin dibanding sesi sebelumnya</span>'
      : (delta < 0
        ? '<span class="warn-text">' + ic('alert', 13) + ' turun ' + Math.abs(delta) + ' poin — cek kategori terlemah</span>'
        : '<span class="hari-sub">stabil dibanding sesi sebelumnya</span>');
  }

  // tren per kategori dari sesi terakhir yang menyimpan rincian
  var denganKat = nampil.filter(function (s) { return s.perKat; });
  var katBaris = '';
  if (denganKat.length) {
    var lima = denganKat.slice(-5);
    var kumpul = {};
    lima.forEach(function (s) {
      Object.keys(s.perKat).forEach(function (k) {
        var v = s.perKat[k];
        if (!kumpul[k]) kumpul[k] = { b: 0, t: 0 };
        kumpul[k].b += v.benar; kumpul[k].t += v.total;
      });
    });
    katBaris = Object.keys(kumpul).sort(function (a, b) {
      return (kumpul[a].b / kumpul[a].t) - (kumpul[b].b / kumpul[b].t);
    }).slice(0, 5).map(function (k) {
      var v = kumpul[k];
      var p = Math.round((v.b / v.t) * 100);
      var warna = p >= 80 ? 'pass' : (p >= 70 ? 'warn' : 'fail');
      return '<div class="kat-row"><div class="kat-row-top"><span>' + escapeHtml(k) + '</span><span>' + p + '%</span></div>' +
        '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + p + '%"></div></div></div>';
    }).join('');
  }

  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('chart', 16) + ' <strong>Tren nilai</strong>' +
      '<span class="hari-tgl">' + nampil.length + ' sesi terakhir</span></div>' +
    grafikTren(nampil) +
    '<div class="hari-grid" style="margin-top:8px">' +
      '<div class="hari-box"><div class="hari-num">' + rata + '</div><div class="hari-lbl">rata-rata</div></div>' +
      '<div class="hari-box"><div class="hari-num">' + terbaik + '</div><div class="hari-lbl">terbaik</div></div>' +
      '<div class="hari-box"><div class="hari-num">' + skor.length + '</div><div class="hari-lbl">total sesi</div></div>' +
    '</div>' +
    '<div class="hari-sub" style="margin-top:8px">' + tren + '</div>' +
    (katBaris ? '<div style="margin-top:12px"><div class="hari-sub">Kategori terlemah (5 sesi terakhir):</div>' + katBaris + '</div>' : '') +
    '</div>';
};

// ---------- 7. siapkan mode offline ----------
var PESAN_OFFLINE = '';
window.siapkanOffline = async function () {
  function tulis(t) {
    var st = document.getElementById('statusOffline');
    if (st) st.textContent = t;
  }
  var pesanSukses = '';
  tulis('Menyiapkan... memuat seluruh kategori soal.');
  try {
    await pastikanSemua();
    if (navigator.storage && navigator.storage.persist) { try { await navigator.storage.persist(); } catch (e) {} }
    var berkas = 0;
    if (window.caches) {
      var nama = await caches.keys();
      for (var i = 0; i < nama.length; i++) {
        var c = await caches.open(nama[i]);
        var k = await c.keys();
        berkas += k.length;
      }
    }
    var pakai = '';
    if (navigator.storage && navigator.storage.estimate) {
      try {
        var e = await navigator.storage.estimate();
        pakai = ' · terpakai ' + (e.usage / 1048576).toFixed(1) + ' MB';
      } catch (err) {}
    }
    localStorage.setItem('tni_offline_siap', JSON.stringify({ tgl: fHariIni(), soal: totalSoal(), berkas: berkas }));
    PESAN_OFFLINE = 'Siap offline: ' + totalSoal() + ' soal tersimpan (' + berkas + ' berkas di cache' + pakai + '). Bisa dipakai tanpa internet.';
    tulis(PESAN_OFFLINE);
    var panel = document.querySelector('.panel-salah-prog');
    if (panel) { panel.dataset.terisi = ''; sisipPanel2(); tulis(PESAN_OFFLINE); }
  } catch (e) {
    PESAN_OFFLINE = 'Gagal menyiapkan offline. Periksa koneksi lalu coba lagi.';
    tulis(PESAN_OFFLINE);
  }
};

window.infoOffline = function () {
  try { return JSON.parse(localStorage.getItem('tni_offline_siap') || 'null'); } catch (e) { return null; }
};

window.panelOffline = function () {
  var o = infoOffline();
  var sekarangSiap = katSiapSemua();
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('download', 16) + ' <strong>Mode offline</strong>' +
      '<span class="hari-tgl">' + (sekarangSiap ? 'data lengkap termuat' : 'belum lengkap') + '</span></div>' +
    '<div class="hari-sub">' + (o
      ? 'Terakhir disiapkan ' + o.tgl + ' — ' + o.soal + ' soal, ' + o.berkas + ' berkas ter-cache.'
      : 'Belum disiapkan. Setelah disiapkan, seluruh soal bisa dikerjakan tanpa internet (mis. di perjalanan).') + '</div>' +
    '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="siapkanOffline()">Siapkan sekarang</button>' +
    '<div id="statusOffline" class="hari-sub" style="margin-top:8px" aria-live="polite">' + escapeHtml(PESAN_OFFLINE) + '</div>' +
    '</div>';
};

// ---------- 8. ajakan pasang ke layar utama ----------
var _promptPasang = null;
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  _promptPasang = e;
  if (localStorage.getItem('tni_pasang_nanti') === fHariIni()) return;
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
  setTimeout(function () {
    if (document.getElementById('tawarPasang')) return;
    var d = document.createElement('div');
    d.id = 'tawarPasang';
    d.className = 'tawar-pasang';
    d.innerHTML = '<div><strong>Pasang ke layar utama?</strong><br>' +
      '<span class="hari-sub">Bisa dipakai layar penuh dan tetap jalan saat offline.</span></div>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button class="btn btn-primary btn-sm" onclick="pasangSekarang()">Pasang</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="pasangNanti()">Nanti</button></div>';
    document.body.appendChild(d);
  }, 2500);
});

window.pasangSekarang = function () {
  var d = document.getElementById('tawarPasang');
  if (d) d.remove();
  if (_promptPasang) { _promptPasang.prompt(); _promptPasang = null; }
};
window.pasangNanti = function () {
  var d = document.getElementById('tawarPasang');
  if (d) d.remove();
  localStorage.setItem('tni_pasang_nanti', fHariIni());
};

// ---------- 9. panel beranda tambahan ----------
window.panelLatihan = function () {
  var info = infoAdaptif();
  return '<div class="card latihan-card">' +
    '<div class="hari-head">' + ic('target', 16) + ' <strong>Simulasi & Latihan Terarah</strong></div>' +
    '<div class="hari-sub">Simulasi format seleksi memakai komposisi tetap: ' + infoKomposisiFormat() + '.</div>' +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="btn btn-danger btn-sm" style="flex:1" onclick="startSimulasiFormat()">' + ic('flag', 15) + ' Simulasi Format Seleksi</button>' +
      '<button class="btn btn-secondary btn-sm" style="flex:1" onclick="drillAdaptif()">' + ic('target', 15) + ' Latihan Adaptif (25 soal)</button>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
      '<button class="btn btn-secondary btn-sm" style="flex:1" onclick="bukaHafalan()">' + ic('bulb', 15) + ' Hafalan Cepat (kartu)</button>' +
      '<button class="btn btn-ghost btn-sm" style="flex:1" onclick="navTo(\'prog\')">' + ic('chart', 15) + ' Tren & offline</button>' +
    '</div>' +
    '<div class="hari-sub" style="margin-top:8px">Kecepatan adaptif memantau ' + info.dipantau + ' soal; ' +
      info.zona + ' soal ada di zona pas untuk dilatih ulang.</div>' +
    '</div>';
};

// tempelkan panel tambahan pada halaman yang sesuai
var _renderSebelumFitur2 = window.render;
window.render = function () {
  if (_renderSebelumFitur2) _renderSebelumFitur2.apply(this, arguments);
  try { sisipPanel2(); } catch (e) {}
};

function sisipPanel2() {
  var m = document.getElementById('main');
  if (!m) return;
  if (S.page === 'home') {
    var kotak = m.querySelector('.grid-3');
    if (kotak && !m.querySelector('.latihan-card')) {
      var w = document.createElement('div');
      w.innerHTML = panelLatihan();
      kotak.insertAdjacentElement('afterend', w);
    }
  }
  if (S.page === 'prog') {
    var panel = m.querySelector('.panel-salah-prog');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'panel-salah-prog';
      m.appendChild(panel);
    }
    if (panel && !panel.dataset.terisi) {
      panel.dataset.terisi = '1';
      panel.innerHTML = panelTren() + panelOffline();
    }
  }
}
