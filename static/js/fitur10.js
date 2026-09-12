// ============================================================
// FITUR 10 — v33: PANDUAN & LATIHAN TES GAMBAR
//
// Mengisi celah baterai psikotes: Wartegg (8 kotak), BAUM (pohon),
// DAP (orang), HTP (rumah-pohon-orang).
//
// Kejujuran yang dipegang:
//  - Tes gambar TIDAK ada jawaban benar/salah dan TIDAK bisa dihafal.
//  - Yang bisa dilatih: mengenal prosesnya, melengkapi semua kotak,
//    menjaga ketenangan, dan menghindari kesalahan umum.
//  - Aplikasi ini TIDAK memberi skor dan TIDAK menilai gambar. Hasil
//    gambar hanya untuk ditinjau sendiri (tersimpan di perangkat).
// ============================================================

window.GAMBAR_INFO = [
  { kode: 'wartegg', nama: 'Wartegg (8 kotak)',
    isi: 'Delapan kotak berisi rangsangan berbeda: titik, garis lengkung, tiga garis sejajar, kotak hitam kecil, dua garis bersudut, garis horizontal dan vertikal, garis lengkung berlapis, dan satu kotak kosong.',
    dinilai: 'Semua kotak terisi; urutan pengerjaan; tekanan dan ketebalan garis; ukuran gambar dibanding kotak; bentuk yang muncul dan tema yang berulang.',
    salah: 'Mengosongkan kotak karena takut salah; menggambar terlalu kecil; membuat semua kotak mirip; mencontek gaya orang lain sehingga tidak konsisten.' },
  { kode: 'baum', nama: 'BAUM (menggambar pohon)',
    isi: 'Menggambar satu pohon berkayu (bukan pohon kelapa, pisang, atau bambu) di kertas kosong.',
    dinilai: 'Kelengkapan bagian (akar, batang, cabang, daun, buah); letak pohon di kertas; tekanan garis; suasana yang muncul dari gambar.',
    salah: 'Menggambar pohon dari jenis yang tidak berkayu; mengulang-ulang garis karena ragu; menghabiskan terlalu banyak waktu di satu bagian.' },
  { kode: 'dap', nama: 'DAP (menggambar orang)',
    isi: 'Menggambar satu orang secara utuh, bukan hanya wajah atau separuh badan.',
    dinilai: 'Kelengkapan anggota tubuh; perbandingan ukuran antar bagian; penempatan di kertas; detail pakaian dan aktivitas.',
    salah: 'Menggambar hanya wajah; proporsi yang jauh dari wajar; menggambar tokoh kartun yang terlalu sederhana.' },
  { kode: 'htp', nama: 'HTP (rumah, pohon, orang)',
    isi: 'Menggambar rumah, pohon, dan orang dalam satu lembar kertas, menjadi satu pemandangan.',
    dinilai: 'Hubungan antar objek (jarak, ukuran, arah menghadap); kelengkapan tiap objek; konsistensi gaya; kesan keseluruhan.',
    salah: 'Menggambar tiga objek terpisah tanpa hubungan; ukuran tidak seimbang (orang lebih besar dari rumah); mengerjakan berurutan kaku tanpa memperhatikan tata letak.' }
];

window.GAMBAR_CHECKLIST = [
  'Pastikan alat tulis lengkap (pensil, penghapus dipakai seperlunya, kertas cukup).',
  'Isi SEMUA kotak atau SEMUA bagian — ruang kosong terbaca sebagai menghindar.',
  'Gambar memenuhi sebagian besar bidang yang tersedia, jangan menyusut kecil di pojok.',
  'Kerjakan dengan tempo tetap; tidak perlu sempurna, tetapi konsisten.',
  'Jangan menyalin gaya gambar orang lain di ruang ujian.',
  'Setelah selesai, periksa kelengkapan: apakah ada bagian yang tertinggal?'
];

window.GAMBAR_LATIHAN = { mode: 'wartegg', gambar: null, coretan: 0 };

window.bukaLatihanGambar = function (mode) {
  GAMBAR_LATIHAN.mode = mode || 'wartegg';
  GAMBAR_LATIHAN.gambar = null;
  GAMBAR_LATIHAN.coretan = 0;
  navTo('gambar');
};

window.renderGambar = function () {
  var kartu = GAMBAR_INFO.map(function (t) {
    return '<div class="gambar-info">' +
      '<div class="hari-head">' + ic('image', 15) + ' <strong>' + escapeHtml(t.nama) + '</strong></div>' +
      '<div class="hari-sub"><strong>Bentuk tesnya:</strong> ' + escapeHtml(t.isi) + '</div>' +
      '<div class="hari-sub"><strong>Yang dinilai pengamat:</strong> ' + escapeHtml(t.dinilai) + '</div>' +
      '<div class="hari-sub"><strong>Kesalahan umum:</strong> ' + escapeHtml(t.salah) + '</div>' +
      '</div>';
  }).join('');

  var daftar = GAMBAR_CHECKLIST.map(function (t) {
    return '<div class="fokus-item"><span class="fokus-num">' + ic('check', 11) + '</span>' + escapeHtml(t) + '</div>';
  }).join('');

  var mode = GAMBAR_LATIHAN.mode;
  var kanvas = '<canvas id="kanvasGambar" class="kanvas" width="720" height="520" ' +
    'aria-label="Kanvas latihan menggambar"></canvas>';
  var tombolMode = ['wartegg', 'kosong'].map(function (m) {
    var label = m === 'wartegg' ? 'Kotak Wartegg (8 kotak)' : 'Kertas kosong (BAUM/DAP/HTP)';
    return '<button class="btn btn-sm ' + (mode === m ? 'btn-primary' : 'btn-secondary') + '" ' +
      'onclick="bukaLatihanGambar(\'' + m + '\')">' + label + '</button>';
  }).join(' ');

  return '<div class="card">' +
      '<div class="hari-head">' + ic('image', 16) + ' <strong>Tes Gambar — panduan & latihan</strong>' +
        '<span class="hari-tgl">tidak dinilai</span></div>' +
      '<div class="hari-sub">Tes gambar mengukur <strong>cara kamu menghadapi tugas yang tidak jelas</strong>, ' +
      'bukan bagus atau jeleknya gambar. Karena itu tidak ada jawaban benar dan tidak bisa dihafal. ' +
      'Yang bisa kamu siapkan: tahu prosesnya, mengisi semua bagian, dan tetap tenang.</div>' +
    '</div>' +
    '<div class="card"><div class="hari-head">' + ic('list', 16) + ' <strong>Empat jenis tes gambar</strong></div>' + kartu + '</div>' +
    '<div class="card"><div class="hari-head">' + ic('check', 16) + ' <strong>Daftar periksa sebelum tes</strong></div>' + daftar + '</div>' +
    '<div class="card">' +
      '<div class="hari-head">' + ic('edit', 16) + ' <strong>Latihan menggambar</strong>' +
        '<span class="hari-tgl">di perangkatmu sendiri</span></div>' +
      '<div class="hari-sub">Latihan ini hanya untuk membiasakan tangan dan mengukur waktu, ' +
      'supaya kamu tidak kaku saat tes sebenarnya. Gambarmu <strong>tidak dikirim ke mana pun</strong> ' +
      'dan tidak dinilai oleh aplikasi ini.</div>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; margin:10px 0">' + tombolMode + '</div>' +
      kanvas +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px">' +
        '<button class="btn btn-secondary btn-sm" onclick="bersihkanKanvas()">' + ic('refresh', 14) + ' Bersihkan</button>' +
        '<button class="btn btn-secondary btn-sm" onclick="simpanGambar()">' + ic('download', 14) + ' Simpan gambarku</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="mulaiTimerGambar()">' + ic('clock', 14) + ' Mulai hitung waktu</button>' +
        '<span class="hari-sub" id="timerGambar" style="align-self:center"></span>' +
      '</div>' +
      '<div class="hari-sub" style="margin-top:10px">Saran waktu: Wartegg 8 kotak sekitar 8-10 menit; ' +
      'satu gambar BAUM/DAP sekitar 10 menit; HTP sekitar 15 menit.</div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="hari-head">' + ic('shield', 16) + ' <strong>Batas jujur</strong></div>' +
      '<div class="hari-sub">Aplikasi ini tidak menilai gambar dan tidak memberi skor. Penilaian tes gambar ' +
      'dilakukan psikolog terlatih dengan alat resmi yang berlisensi — kami tidak memakai alat itu. ' +
      'Yang kami sediakan: pemahaman proses, daftar periksa, dan latihan supaya kamu tidak gugup.</div>' +
    '</div>';
};

// ---- menggambar di kanvas (tetikus & sentuh) ----
window.siapkanKanvas = function () {
  var c = document.getElementById('kanvasGambar');
  if (!c) return;
  var ctx = c.getContext('2d');
  var gambarUlang = function () {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    if (GAMBAR_LATIHAN.mode === 'wartegg') {
      ctx.strokeStyle = '#c9c9c9';
      ctx.lineWidth = 2;
      var kiri = 40, atas = 30, lebar = (c.width - kiri * 2 - 20) / 2, tinggi = (c.height - atas * 2 - 20) / 2;
      ctx.strokeRect(kiri - 4, atas - 4, lebar * 2 + 28, tinggi * 2 + 28);
      ctx.beginPath();
      ctx.moveTo(kiri + lebar + 10, atas - 4);
      ctx.lineTo(kiri + lebar + 10, atas + tinggi * 2 + 24);
      ctx.moveTo(kiri - 4, atas + tinggi + 10);
      ctx.lineTo(kiri + lebar * 2 + 24, atas + tinggi + 10);
      ctx.stroke();
      GAMBAR_LATIHAN.kotak = { kiri: kiri, atas: atas, lebar: lebar, tinggi: tinggi };
    }
    if (GAMBAR_LATIHAN.gambar) {
      var img = new Image();
      img.onload = function () { ctx.drawImage(img, 0, 0); };
      img.src = GAMBAR_LATIHAN.gambar;
    }
  };
  gambarUlang();
  GAMBAR_LATIHAN._gambarUlang = gambarUlang;

  var menggambar = false, xAkhir = 0, yAkhir = 0;
  var posisi = function (e) {
    var r = c.getBoundingClientRect();
    var t = (e.touches && e.touches[0]) ? e.touches[0] : e;
    return { x: (t.clientX - r.left) * (c.width / r.width), y: (t.clientY - r.top) * (c.height / r.height) };
  };
  var mulai = function (e) {
    e.preventDefault();
    menggambar = true;
    var p = posisi(e);
    xAkhir = p.x; yAkhir = p.y;
    GAMBAR_LATIHAN.coretan++;
  };
  var gerak = function (e) {
    if (!menggambar) return;
    e.preventDefault();
    var p = posisi(e);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xAkhir, yAkhir);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    xAkhir = p.x; yAkhir = p.y;
  };
  var henti = function () { menggambar = false; };
  c.addEventListener('mousedown', mulai);
  c.addEventListener('mousemove', gerak);
  window.addEventListener('mouseup', henti);
  c.addEventListener('touchstart', mulai, { passive: false });
  c.addEventListener('touchmove', gerak, { passive: false });
  c.addEventListener('touchend', henti);
};

window.bersihkanKanvas = function () {
  GAMBAR_LATIHAN.gambar = null;
  GAMBAR_LATIHAN.coretan = 0;
  if (GAMBAR_LATIHAN._gambarUlang) GAMBAR_LATIHAN._gambarUlang();
};

window.simpanGambar = function () {
  var c = document.getElementById('kanvasGambar');
  if (!c) return;
  if (!GAMBAR_LATIHAN.coretan) { alert('Belum ada gambar untuk disimpan.'); return; }
  GAMBAR_LATIHAN.gambar = c.toDataURL('image/png');
  try {
    localStorage.setItem('tni_gambar_terakhir', JSON.stringify({
      tanggal: new Date().toISOString().slice(0, 10),
      mode: GAMBAR_LATIHAN.mode,
      gambar: GAMBAR_LATIHAN.gambar
    }));
    var r = JSON.parse(localStorage.getItem('tni_gambar_riwayat') || '[]');
    r.push({ tanggal: new Date().toISOString().slice(0, 10), mode: GAMBAR_LATIHAN.mode });
    localStorage.setItem('tni_gambar_riwayat', JSON.stringify(r.slice(-20)));
  } catch (e) {}
  // unduhan memakai tautan data (tanpa perantara)
  var a = document.createElement('a');
  a.href = GAMBAR_LATIHAN.gambar;
  a.download = 'latihan-gambar-' + new Date().toISOString().slice(0, 10) + '.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  alert('Gambar disimpan ke perangkatmu dan tersimpan di aplikasi untuk ditinjau sendiri.');
};

var _timerGambarId = null;
window.mulaiTimerGambar = function () {
  var el = document.getElementById('timerGambar');
  if (!el) return;
  var batas = GAMBAR_LATIHAN.mode === 'wartegg' ? 10 * 60 : 15 * 60;
  var sisa = batas;
  if (_timerGambarId) clearInterval(_timerGambarId);
  el.textContent = 'sisa waktu: ' + Math.floor(sisa / 60) + ' menit';
  _timerGambarId = setInterval(function () {
    sisa--;
    var m = Math.floor(sisa / 60), s = sisa % 60;
    var t = document.getElementById('timerGambar');
    if (!t) { clearInterval(_timerGambarId); return; }
    t.textContent = 'sisa waktu: ' + m + ':' + (s < 10 ? '0' : '') + s;
    if (sisa <= 0) {
      clearInterval(_timerGambarId);
      t.textContent = 'waktu habis — periksa kelengkapan gambarmu';
    }
  }, 1000);
};

window.statusGambar = function () {
  try {
    var r = JSON.parse(localStorage.getItem('tni_gambar_riwayat') || '[]');
    return r.length;
  } catch (e) { return 0; }
};


// ---------- PEMASANGAN ----------
var _renderSebelumFitur10 = window.render;
window.render = function () {
  if (_renderSebelumFitur10) _renderSebelumFitur10.apply(this, arguments);
  try { sisipPanel10(); } catch (e) {}
};

function sisipPanel10() {
  var m = document.getElementById('main');
  if (!m) return;
  if (S.page === 'gambar') {
    m.innerHTML = renderGambar();
    siapkanKanvas();
  }
}

// pengganti pesan singkat lama: arahkan ke halaman panduan
window.tutorGambar = function () { bukaLatihanGambar('wartegg'); };

// modul tes gambar di Baterai Psikotes kini benar-benar bisa dibuka & berstatus
var _bateriLama10 = window.bateri;
window.bateri = function () {
  var daftar = _bateriLama10();
  daftar.forEach(function (mm) {
    if (mm.id === 'gambar') {
      delete mm.belum;
      mm.durasi = '8-15 menit';
      mm.mulai = "bukaLatihanGambar('wartegg')";
      mm.label = 'Buka panduan';
      mm.mengukur = 'Wartegg, BAUM, DAP, HTP — cara menghadapi dan daftar periksa (tidak dinilai aplikasi)';
    }
  });
  return daftar;
};

var _statusModulLama10 = window.statusModul;
window.statusModul = function (mm) {
  if (mm && mm.id === 'gambar') {
    var n = statusGambar();
    return n ? { lulus: true, teks: n + 'x latihan tersimpan', skor: null }
             : { lulus: false, teks: 'belum dicoba', skor: null };
  }
  return _statusModulLama10(mm);
};
