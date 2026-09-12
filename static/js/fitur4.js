
function topikSoal(q) { return q && q.topik ? q.topik : null; }

function semuaStat() { return (typeof statSoal === 'function') ? statSoal() : {}; }

function storeLaporan() {
  try { return JSON.parse(localStorage.getItem('tni_laporan') || '[]') || []; } catch (e) { return []; }
}
function simpanLaporan(a) { try { localStorage.setItem('tni_laporan', JSON.stringify(a.slice(-300))); } catch (e) {} }

window.LAPORAN_S = { soalId: null, alasan: 'kunci', catatan: '', terbuka: false };

var ALASAN = [
  { k: 'kunci', t: 'Kunci terasa salah' },
  { k: 'pembahasan', t: 'Pembahasan kurang jelas' },
  { k: 'ambigu', t: 'Soal ambigu (dua jawaban benar)' },
  { k: 'tulis', t: 'Salah tulis / salah ketik' }
];

window.bukaLapor = function (id) {
  LAPORAN_S.soalId = id || (S.questions[S.idx] ? S.questions[S.idx].id : null);
  LAPORAN_S.terbuka = true;
  LAPORAN_S.alasan = 'kunci';
  LAPORAN_S.catatan = '';
  render();
};

window.tutupLapor = function () { LAPORAN_S.terbuka = false; render(); };
window.pilihAlasan = function (k) { LAPORAN_S.alasan = k; render(); };
window.ubahCatatan = function (v) { LAPORAN_S.catatan = v; };

window.kirimLapor = function () {
  var id = LAPORAN_S.soalId;
  if (!id) return;
  var q = getAllSoal().find(function (s) { return s.id === id; });
  var a = storeLaporan();
  a.push({
    id: id,
    kategori: q ? q.kategori : '',
    topik: q ? (q.topik || '') : '',
    alasan: LAPORAN_S.alasan,
    catatan: String(LAPORAN_S.catatan || '').slice(0, 300),
    pertanyaan: q ? String(q.pertanyaan).slice(0, 160) : '',
    tanggal: fHariIni()
  });
  simpanLaporan(a);
  LAPORAN_S.terbuka = false;
  render();
};

window.jumlahLaporan = function () { return storeLaporan().length; };

window.eksporLaporan = function () {
  var a = storeLaporan();
  if (!a.length) { alert('Belum ada laporan soal.'); return; }
  var peta = {};
  getAllSoal().forEach(function (s) { peta[s.id] = s; });
  var html = ['<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan Soal — SiapPsikotes</title>',
    '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;max-width:820px;margin:24px auto;padding:0 16px}',
    'h2{font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px}.pg{background:#f6f6f8;padding:10px;border-radius:8px;white-space:pre-line}',
    '.lbl{display:inline-block;background:#e8e8ef;border-radius:12px;padding:2px 8px;font-size:12px;margin-right:6px}</style></head><body>',
    '<h1 style="font-size:20px">Laporan Soal — SiapPsikotes</h1>',
    '<p>Dicetak: ' + new Date().toLocaleString('id-ID') + ' · ' + a.length + ' laporan</p>',
    '<p><button onclick="window.print()">Cetak / Simpan PDF</button></p>'];
  a.slice().reverse().forEach(function (l, i) {
    var q = peta[l.id];
    html.push('<h2>' + (i + 1) + '. ' + escapeHtml(l.id) + ' — ' + escapeHtml(l.kategori) + '</h2>');
    html.push('<div><span class="lbl">' + escapeHtml(alasanTeks(l.alasan)) + '</span><span class="lbl">' + l.tanggal + '</span></div>');
    html.push('<div>' + escapeHtml(q ? String(q.pertanyaan) : l.pertanyaan) + '</div>');
    if (q) {
      html.push('<ol type="A">' + q.pilihan.map(function (p, j) {
        return '<li' + (j === q.jawaban ? ' style="font-weight:700;color:#0a7a2f"' : '') + '>' + escapeHtml(String(p)) + '</li>';
      }).join('') + '</ol>');
      html.push('<div class="pg"><strong>Pembahasan</strong>\n' + escapeHtml(String(q.pembahasan)) + '</div>');
    }
    if (l.catatan) html.push('<div class="pg"><strong>Catatan pelapor</strong>\n' + escapeHtml(l.catatan) + '</div>');
  });
  html.push('</body></html>');
  unduhBerkas('laporan-soal-' + fHariIni() + '.html', html.join('\n'), 'text/html');
};

function alasanTeks(k) {
  var x = ALASAN.filter(function (a) { return a.k === k; })[0];
  return x ? x.t : k;
}

function unduhBerkas(nama, isi, tipe) {
  var blob = new Blob([isi], { type: (tipe || 'text/plain') + ';charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

window.panelLapor = function () {
  var q = S.questions[S.idx];
  var id = LAPORAN_S.soalId || (q ? q.id : null);
  if (!LAPORAN_S.terbuka) {
    return '<div style="margin-top:12px;text-align:center">' +
      '<button class="btn btn-ghost btn-sm" onclick="bukaLapor(\'' + (id || '') + '\')">' + ic('flag', 14) + ' Laporkan soal ini</button>' +
      (jumlahLaporan() ? '<span class="hari-sub" style="margin-left:8px">' + jumlahLaporan() + ' laporan tersimpan</span>' : '') +
      '</div>';
  }
  var opsi = ALASAN.map(function (a) {
    return '<button class="chip ' + (LAPORAN_S.alasan === a.k ? 'chip-aktif' : '') + '" onclick="pilihAlasan(\'' + a.k + '\')">' + a.t + '</button>';
  }).join(' ');
  return '<div class="card lapor-box" style="margin-top:14px">' +
    '<div class="hari-head">' + ic('flag', 16) + ' <strong>Laporkan soal ' + escapeHtml(String(id || '')) + '</strong></div>' +
    '<div class="topik-bar">' + opsi + '</div>' +
    '<textarea class="kode-box" id="catatanLapor" placeholder="Catatan (opsional): bagian mana yang terasa keliru?" oninput="ubahCatatan(this.value)">' + escapeHtml(LAPORAN_S.catatan) + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button class="btn btn-primary btn-sm" style="flex:1" onclick="kirimLapor()">Kirim laporan</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="tutupLapor()">Batal</button>' +
    '</div>' +
    '<div class="hari-sub" style="margin-top:8px">Laporan disimpan di perangkat ini. Buka Progress → Laporan soal untuk mengekspor semuanya jadi satu berkas.</div>' +
    '</div>';
};

window.panelDaftarLaporan = function () {
  var a = storeLaporan();
  if (!a.length) {
    return '<div class="card" style="margin-top:16px">' +
      '<div class="hari-head">' + ic('flag', 16) + ' <strong>Laporan soal</strong>' +
        '<span class="hari-tgl">belum ada laporan</span></div>' +
      '<div class="hari-sub">Kalau kamu menemukan soal yang terasa keliru (kunci tidak cocok, pembahasan sulit diikuti, ' +
      'atau pertanyaan ambigu), tekan tombol <strong>Laporkan soal</strong> di halaman Bank Soal atau saat mengerjakan. ' +
      'Laporanmu masuk daftar prioritas audit sesuai PERATURAN MUTU SOAL.</div>' +
      '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navTo(\'bank\')">Buka Bank Soal</button>' +
      '</div>';
  }
  var peta = {};
  getAllSoal().forEach(function (s) { peta[s.id] = s; });
  var baris = a.slice().reverse().slice(0, 12).map(function (l) {
    var q = peta[l.id];
    return '<div class="ulang-row"><div class="ulang-teks">' + escapeHtml(l.id + ' · ' + alasanTeks(l.alasan)) +
      ' — ' + escapeHtml(q ? String(q.pertanyaan).slice(0, 60) : l.pertanyaan) + '…</div>' +
      '<div class="ulang-aksi"><button class="btn btn-ghost btn-sm" onclick="hapusLaporan(\'' + l.id + '\')">hapus</button></div></div>';
  }).join('');
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('flag', 16) + ' <strong>Laporan soal</strong><span class="hari-tgl">' + a.length + ' laporan</span></div>' +
    '<div class="hari-sub">Soal yang kamu tandai perlu diperiksa. Ekspor lalu kirimkan berkasnya untuk audit lanjutan.</div>' +
    baris +
    '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="eksporLaporan()">Ekspor semua laporan</button>' +
    '</div>';
};

window.hapusLaporan = function (id) {
  var a = storeLaporan().filter(function (l) { return l.id !== id; });
  simpanLaporan(a);
  render();
};

window.cocokCariBank = function (item, kata) {
  if (!kata) return true;
  var t = String(kata).toLowerCase();
  var bahan = [item.pertanyaan, item.katNama, item.katKey, item.topik, item.pembahasan]
    .concat(item.pilihan || []).join(' ').toLowerCase();
  return bahan.indexOf(t) >= 0;
};

window.statTopik = function () {
  var st = semuaStat();
  var peta = {};
  getAllSoal().forEach(function (q) {
    if (!q.topik) return;
    var s = st[q.id];
    if (!s) return;
    var p = peta[q.topik] || (peta[q.topik] = { topik: q.topik, b: 0, s: 0, kategori: q.kategori });
    p.b += s.b || 0;
    p.s += s.s || 0;
  });
  return Object.keys(peta).map(function (k) {
    var p = peta[k];
    var total = p.b + p.s;
    return { topik: k, kategori: p.kategori, total: total, persen: total ? Math.round((p.b / total) * 100) : 0 };
  }).filter(function (p) { return p.total >= 3; })
    .sort(function (a, b) { return a.persen - b.persen; });
};

window.panelTopikLemah = function () {
  var d = statTopik();
  if (!d.length) {
    return '<div class="card" style="margin-top:16px"><div class="hari-head">' + ic('target', 16) +
      ' <strong>Topik terlemah</strong></div><div class="hari-sub">Belum ada data. Kerjakan minimal 3 soal pada satu topik supaya analisisnya muncul.</div></div>';
  }
  var lima = d.slice(0, 6);
  var baris = lima.map(function (p) {
    var warna = p.persen >= 80 ? 'pass' : (p.persen >= 70 ? 'warn' : 'fail');
    return '<div class="kat-row"><div class="kat-row-top"><span>' + escapeHtml(namaTopik(p.topik)) +
      ' <span class="hari-sub">(' + escapeHtml(p.kategori) + ')</span></span><span>' + p.persen + '% · ' + p.total + ' soal</span></div>' +
      '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + p.persen + '%"></div></div></div>';
  }).join('');
  var terlemah = lima[0];
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('target', 16) + ' <strong>Topik terlemah</strong>' +
      '<span class="hari-tgl">' + d.length + ' topik terpantau</span></div>' +
    baris +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-sm" style="flex:1" onclick="drillTopik(\'' + terlemah.topik + '\', 25)">' +
        ic('target', 14) + ' Latih topik ' + escapeHtml(namaTopik(terlemah.topik)) + '</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="modeLimaMenit()">' + ic('clock', 14) + ' Mode 5 menit</button>' +
    '</div></div>';
};

window.targetNilai = function () {
  var v = parseInt(localStorage.getItem('tni_target') || '80', 10);
  return (isNaN(v) || v < 60 || v > 100) ? 80 : v;
};
window.setTargetNilai = function (v) {
  var n = Math.max(60, Math.min(100, parseInt(v, 10) || 80));
  localStorage.setItem('tni_target', String(n));
  render();
};
window.panelTarget = function () {
  var t = targetNilai();
  var opsi = [70, 80, 85, 90].map(function (x) {
    return '<button class="chip ' + (t === x ? 'chip-aktif' : '') + '" onclick="setTargetNilai(' + x + ')">' + x + '</button>';
  }).join(' ');
  return '<div class="card" style="margin-top:16px">' +
    '<div class="hari-head">' + ic('medal', 16) + ' <strong>Target nilai</strong>' +
      '<span class="hari-tgl">sekarang ' + t + '</span></div>' +
    '<div class="hari-sub">Kesiapan ujian dan saran latihan menyesuaikan target ini. Minimum lulus seleksi biasanya 70; ambil 85-90 untuk jurusan yang ketat.</div>' +
    '<div class="topik-bar" style="margin-top:8px">' + opsi + '</div>' +
    '</div>';
};

window.eksporRapot = function () {
  var k = hitungKesiapan();
  var t = targetNilai();
  var kat = loadProgress();
  var topik = statTopik().slice(0, 10);
  var psi = (typeof PSI !== 'undefined' && PSI.history) ? PSI.history.slice(-8) : [];
  var skor = loadScores().slice(-10);
  var h = ['<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Rapot Kesiapan — SiapPsikotes</title>',
    '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;max-width:820px;margin:24px auto;padding:0 16px;color:#111}',
    'h1{font-size:20px}h2{font-size:15px;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:4px}',
    'table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left}',
    '.big{font-size:34px;font-weight:800}</style></head><body>'];
  h.push('<h1>Rapot Kesiapan — SiapPsikotes</h1>');
  h.push('<p>Dicetak: ' + new Date().toLocaleString('id-ID') + ' · versi aplikasi ' + escapeHtml(buildKu()) + ' · target nilai ' + t + '</p>');
  h.push('<p><button onclick="window.print()">Cetak / Simpan PDF</button></p>');
  h.push('<h2>Ringkasan</h2><table><tr><th>Perkiraan nilai</th><td class="big">' +
    (k.perkiraan === null ? 'belum terukur' : k.perkiraan + ' ± ' + k.rentang) + '</td></tr>' +
    '<tr><th>Status</th><td>' + k.status + ' (target ' + t + ')</td></tr>' +
    '<tr><th>Akurasi latihan</th><td>' + k.akurasi + '% dari ' + k.percobaan + ' jawaban</td></tr>' +
    '<tr><th>Cakupan soal</th><td>' + k.cakupan + '% (' + k.dikerjakan + ' dari ' + k.totalSoal + ' soal)</td></tr></table>');
  h.push('<h2>Per kategori</h2><table><tr><th>Kategori</th><th>Dikerjakan</th><th>Benar</th><th>Akurasi</th></tr>');
  Object.keys(kat).forEach(function (n) {
    var p = kat[n];
    if (!p || !p.total) return;
    h.push('<tr><td>' + escapeHtml(n) + '</td><td>' + p.total + '</td><td>' + p.benar + '</td><td>' +
      Math.round((p.benar / p.total) * 100) + '%</td></tr>');
  });
  h.push('</table>');
  if (topik.length) {
    h.push('<h2>Topik terlemah</h2><table><tr><th>Topik</th><th>Kategori</th><th>Soal</th><th>Akurasi</th></tr>');
    topik.forEach(function (p) {
      h.push('<tr><td>' + escapeHtml(namaTopik(p.topik)) + '</td><td>' + escapeHtml(p.kategori) + '</td><td>' +
        p.total + '</td><td>' + p.persen + '%</td></tr>');
    });
    h.push('</table>');
  }
  if (psi.length) {
    h.push('<h2>Hasil psikotes</h2><table><tr><th>Tes</th><th>Skor</th><th>Benar/Total</th></tr>');
    var lihat = {};
    psi.forEach(function (x) { lihat[x.testName] = x; });
    Object.keys(lihat).forEach(function (n) {
      var x = lihat[n];
      h.push('<tr><td>' + escapeHtml(n) + '</td><td>' + (x.score || 0) + '%</td><td>' + (x.correct || 0) + '/' + (x.total || 0) + '</td></tr>');
    });
    h.push('</table>');
  }
  if (skor.length) {
    h.push('<h2>Riwayat nilai (' + skor.length + ' sesi terakhir)</h2><table><tr><th>Tanggal</th><th>Nilai</th><th>Benar</th><th>Salah</th><th>Dilewati</th></tr>');
    skor.forEach(function (x) {
      h.push('<tr><td>' + escapeHtml(String(x.tgl || '')) + '</td><td>' + (x.nilai || 0) + '</td><td>' + (x.benar || 0) +
        '</td><td>' + (x.salah || 0) + '</td><td>' + (x.skip || 0) + '</td></tr>');
    });
    h.push('</table>');
  }
  h.push('<p style="font-size:12px;color:#555">Perkiraan nilai dihitung dari akurasi latihan dan nilai tryout, ' +
    'dengan rentang ketidakpastian yang menyempit bila makin banyak soal dikerjakan. Ini bukan jaminan hasil seleksi.</p>');
  h.push('</body></html>');
  unduhBerkas('rapot-kesiapan-' + fHariIni() + '.html', h.join('\n'), 'text/html');
};

window.modeLimaMenit = function (jumlah) {
  if (!katSiapSemua()) {
    S.limaCoba = (S.limaCoba || 0) + 1;
    if (S.limaCoba > 2) { S.page = 'gagal'; render(); return; }
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan sesi 5 menit...';
    render();
    pastikanSemua().then(function () { modeLimaMenit(jumlah); });
    return;
  }
  S.limaCoba = 0;
  var st = semuaStat();
  var topikLemah = statTopik().slice(0, 3).map(function (p) { return p.topik; });
  var pool = getAllSoal().filter(function (q) { return topikLemah.indexOf(q.topik) >= 0; });
  if (pool.length < 10) pool = getAllSoal();
  var pilih = shuffle(pool).slice(0, jumlah || 10).map(acakOpsi);
  S.cat = 'lima-menit';
  S.mode = 'drill';
  S.isSimulasi = false;
  S.iqSpec = null;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.questions = pilih;
  S.timed = false;
  S.tampilkanKunci = true;
  S.page = 'soal';
  render();
};

window.eksporPengingat = function () {
  var jam = 19;                                  // pengingat pukul 19:00 waktu lokal
  var mulai = new Date();
  var baris = [];
  function z(n) { return (n < 10 ? '0' : '') + n; }
  for (var i = 0; i < 28; i++) {
    var d = new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate() + i);
    var tgl = d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate());
    baris.push('BEGIN:VEVENT');
    baris.push('UID:siappsikotes-' + tgl + '@lokal');
    baris.push('DTSTAMP:' + tgl + 'T000000Z');
    baris.push('DTSTART:' + tgl + 'T' + z(jam) + '0000');
    baris.push('DURATION:PT30M');
    baris.push('SUMMARY:Belajar SiapPsikotes — target harian');
    baris.push('DESCRIPTION:Buka aplikasi belajar: 1 sesi + ulangi soal yang jatuh tempo + hafalan TWK.');
    baris.push('BEGIN:VALARM');
    baris.push('TRIGGER:-PT10M');
    baris.push('ACTION:DISPLAY');
    baris.push('DESCRIPTION:Pengingat belajar SiapPsikotes');
    baris.push('END:VALARM');
    baris.push('END:VEVENT');
  }
  var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SiapPsikotes//Belajar//ID',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'].concat(baris).concat(['END:VCALENDAR']).join('\r\n');
  unduhBerkas('pengingat-belajar-siappsikotes.ics', ics, 'text/calendar');
};

var _renderSebelumFitur4 = window.render;
window.render = function () {
  if (_renderSebelumFitur4) _renderSebelumFitur4.apply(this, arguments);
  try { sisipPanel4(); } catch (e) {}
};

function sisipPanel4() {
  var m = document.getElementById('main');
  if (!m) return;

  if (S.page === 'soal' && S.questions.length) {
    var kotak = m.querySelector('.question-box') || m.querySelector('.q-box') || m.firstElementChild;
    if (kotak && !m.querySelector('.lapor-box') && !m.querySelector('.lapor-zona')) {
      var w = document.createElement('div');
      w.className = 'lapor-zona';
      w.innerHTML = panelLapor();
      m.appendChild(w);
    }
  }

  if (S.page === 'prog') {
    var box = m.querySelector('.panel-rapor-prog');
    if (box && !box.dataset.fitur4) {
      box.dataset.fitur4 = '1';
      box.insertAdjacentHTML('beforeend', panelTarget() + panelTopikLemah() + panelDaftarLaporan());
    }
    if (box && !box.dataset.fitur4b) {
      box.dataset.fitur4b = '1';
      box.insertAdjacentHTML('beforeend',
        '<div class="card" style="margin-top:16px"><div class="hari-head">' + ic('download', 16) +
        ' <strong>Ekspor & pengingat</strong></div>' +
        '<div class="hari-sub">Bawa ringkasan keluar aplikasi: rapot untuk dibaca/dicetak, atau pengingat harian di kalender.</div>' +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
          '<button class="btn btn-secondary btn-sm" onclick="eksporRapot()">Ekspor Rapot Kesiapan (PDF/HTML)</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="eksporPengingat()">Pengingat 28 hari (.ics)</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="modeLimaMenit()">Mode 5 menit</button>' +
        '</div></div>');
    }
  }
}

var _setBankCatLama = window.setBankCat;
window.setBankCat = function (k) {
  if (typeof _setBankCatLama === 'function') _setBankCatLama.apply(this, arguments);
};
