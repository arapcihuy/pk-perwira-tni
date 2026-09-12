// ============================================================
// FITUR 8 — v30: PSIKOTES & TES IQ UNTUK UMUM (non-kedinasan)
//
// 1. Tes Kepribadian Big Five dari Mini-IPIP (20 butir, DOMAIN PUBLIK)
//    Sumber: International Personality Item Pool (ipip.ori.org).
//    Goldberg (1999) mengembangkan IPIP; Mini-IPIP divalidasi Donnellan dkk (2006)
//    dengan reliabilitas internal tiap faktor 0,65-0,77.
//    Karena domain publik, butir ini boleh dipakai, diterjemahkan, dan dijual.
// 2. Jalur "Umum / Kerja" untuk pencari kerja yang menghadapi psikotes rekrutmen.
// 3. Laporan Lengkap (siap dijual) — disiapkan tapi belum dibuka.
//
// Bahasa sengaja dibuat sederhana: pembaca awam harus paham tanpa kamus.
// ============================================================

// ---------- 1. BUTIR TES KEPRIBADIAN (Mini-IPIP, terjemahan sederhana) ----------
// urut sesuai kunci resmi: [teks, faktor, arah]  arah +1 = makin setuju makin tinggi
var IPIP_BUTIR = [
  ['Saya orang yang menghidupkan suasana saat kumpul-kumpul.', 'E', +1],
  ['Saya suka mengobrol dengan banyak orang berbeda di sebuah acara.', 'E', +1],
  ['Saya tidak banyak bicara.', 'E', -1],
  ['Saya lebih suka menyendiri di belakang.', 'E', -1],

  ['Saya ikut merasakan apa yang dirasakan orang lain.', 'A', +1],
  ['Saya bisa merasakan emosi orang lain.', 'A', +1],
  ['Saya sebenarnya tidak terlalu tertarik pada orang lain.', 'A', -1],
  ['Saya tidak tertarik pada masalah orang lain.', 'A', -1],

  ['Saya langsung menyelesaikan tugas yang harus dikerjakan.', 'C', +1],
  ['Saya suka keteraturan.', 'C', +1],
  ['Saya sering lupa mengembalikan barang ke tempatnya.', 'C', -1],
  ['Saya sering membuat berantakan.', 'C', -1],

  ['Suasana hati saya sering berubah-ubah.', 'N', +1],
  ['Saya mudah kesal.', 'N', +1],
  ['Saya biasanya santai.', 'N', -1],
  ['Saya jarang merasa sedih.', 'N', -1],

  ['Imajinasi saya hidup.', 'O', +1],
  ['Saya sulit memahami gagasan yang rumit atau abstrak.', 'O', -1],
  ['Saya tidak tertarik pada gagasan yang abstrak.', 'O', -1],
  ['Saya tidak punya imajinasi yang bagus.', 'O', -1]
];

window.FAKTOR_B5 = {
  E: { nama: 'Ekstraversi', arti: 'seberapa senang kamu bergaul dan berada di keramaian',
       tinggi: 'Kamu senang bertemu banyak orang dan biasanya mudah memulai pembicaraan.',
       rendah: 'Kamu lebih nyaman dengan sedikit orang dan butuh waktu sendiri untuk mengisi tenaga.' },
  A: { nama: 'Keramahan', arti: 'seberapa mudah kamu ikut merasakan dan menolong orang lain',
       tinggi: 'Kamu peka pada perasaan orang lain dan mudah bekerja sama.',
       rendah: 'Kamu lebih terus terang dan tidak mudah ikut arus; ini bukan hal buruk, tapi perlu dijelaskan saat wawancara.' },
  C: { nama: 'Kehati-hatian', arti: 'seberapa rapi, teratur, dan bisa diandalkan kamu',
       tinggi: 'Kamu teratur dan menyelesaikan pekerjaan tepat waktu — sifat yang paling dicari perusahaan.',
       rendah: 'Kamu lebih luwes dan spontan, tapi perlu alat bantu agar tidak melewatkan tenggat.' },
  N: { nama: 'Kestabilan Emosi', arti: 'seberapa tenang kamu saat menghadapi tekanan',
       tinggi: 'Kamu stabil dan tenang saat ditekan.',
       rendah: 'Kamu mudah terpengaruh suasana hati; latih cara menenangkan diri sebelum menghadapi tes dan wawancara.' },
  O: { nama: 'Keterbukaan', arti: 'seberapa besar rasa ingin tahu dan imajinasimu',
       tinggi: 'Kamu suka gagasan baru dan mudah beradaptasi dengan cara kerja baru.',
       rendah: 'Kamu lebih suka cara yang sudah terbukti dan pekerjaan yang jelas aturannya.' }
};

window.IPIP_SKALA = ['Sangat tidak sesuai', 'Kurang sesuai', 'Netral', 'Sesuai', 'Sangat sesuai'];

window.B5 = { idx: 0, jawab: [], selesai: false };

window.mulaiBigFive = function () {
  B5 = { idx: 0, jawab: [], selesai: false };
  navTo('b5');
};

window.jawabB5 = function (nilai) {
  B5.jawab[B5.idx] = nilai;
  if (B5.idx < IPIP_BUTIR.length - 1) {
    B5.idx++;
    render();
  } else {
    B5.selesai = true;
    simpanB5();
    render();
  }
};

window.jawabB5Kembali = function () {
  if (B5.idx > 0) { B5.idx--; render(); }
};

// penilaian sesuai aturan resmi IPIP: butir "+" dinilai 1-5, butir "-" dibalik (5-1)
window.hitungB5 = function () {
  var faktor = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  var jumlah = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  IPIP_BUTIR.forEach(function (b, i) {
    var v = B5.jawab[i];
    if (v === undefined) return;
    faktor[b[1]] += (b[2] > 0) ? v : (6 - v);
    jumlah[b[1]]++;
  });
  // rentang tiap faktor: 4-20 (4 butir x skala 1-5)
  var hasil = {};
  Object.keys(faktor).forEach(function (k) {
    hasil[k] = { skor: jumlah[k] ? faktor[k] : 0, maks: jumlah[k] * 5, persen: jumlah[k] ? Math.round((faktor[k] / (jumlah[k] * 5)) * 100) : 0 };
  });
  return hasil;
};

function simpanB5() {
  try {
    var riwayat = JSON.parse(localStorage.getItem('tni_b5') || '[]');
    riwayat.push({ tanggal: new Date().toISOString().slice(0, 10), skor: hitungB5() });
    localStorage.setItem('tni_b5', JSON.stringify(riwayat.slice(-20)));
  } catch (e) {}
}

window.b5Terakhir = function () {
  try {
    var r = JSON.parse(localStorage.getItem('tni_b5') || '[]');
    return r.length ? r[r.length - 1] : null;
  } catch (e) { return null; }
};

// ---------- 2. TAMPILAN TES KEPRIBADIAN ----------
window.renderBigFive = function () {
  if (B5.selesai) return laporanB5();

  var total = IPIP_BUTIR.length;
  var butir = IPIP_BUTIR[B5.idx];
  var persen = Math.round(((B5.idx) / total) * 100);
  var pilihan = IPIP_SKALA.map(function (label, i) {
    return '<button class="b5-pilih" onclick="jawabB5(' + (i + 1) + ')">' + label + '</button>';
  }).join('');

  return '<div class="card">' +
    '<div class="hari-head">' + ic('brain', 16) + ' <strong>Tes Kepribadian (20 pernyataan)</strong>' +
      '<span class="hari-tgl">' + (B5.idx + 1) + ' / ' + total + '</span></div>' +
    '<div class="prog-track" style="margin:8px 0 16px"><div class="prog-bar" style="width:' + persen + '%"></div></div>' +
    '<div class="b5-tanya">' + escapeHtml(butir[0]) + '</div>' +
    '<div class="b5-pilihan">' + pilihan + '</div>' +
    '<div class="hari-sub" style="margin-top:14px">Jawab sesuai keadaanmu yang sebenarnya, bukan yang terdengar bagus. ' +
    'Di tes ini <strong>tidak ada jawaban benar atau salah</strong> — yang dilihat adalah gambaran dirimu.</div>' +
    (B5.idx > 0 ? '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="jawabB5Kembali()">' + ic('arrow-left', 14) + ' Kembali</button>' : '') +
    '</div>';
};

function barisFaktor(kunci, h) {
  var f = FAKTOR_B5[kunci];
  var v = h[kunci];
  var warna = v.persen >= 70 ? 'pass' : (v.persen >= 40 ? 'warn' : 'fail');
  var sisi = v.persen >= 50 ? f.tinggi : f.rendah;
  return '<div class="b5-faktor">' +
    '<div class="kat-row-top"><span><strong>' + f.nama + '</strong> <span class="hari-sub">— ' + f.arti + '</span></span>' +
      '<span>' + v.persen + '%</span></div>' +
    '<div class="prog-track"><div class="prog-bar ' + warna + '" style="width:' + v.persen + '%"></div></div>' +
    '<div class="hari-sub" style="margin-top:4px">' + escapeHtml(sisi) + '</div>' +
    '</div>';
}

window.laporanB5 = function () {
  var h = hitungB5();
  var urut = Object.keys(h).sort(function (a, b) { return h[b].persen - h[a].persen; });
  var kuat = FAKTOR_B5[urut[0]].nama;
  var rendah = FAKTOR_B5[urut[urut.length - 1]].nama;

  return '<div class="card">' +
      '<div class="hari-head">' + ic('award', 16) + ' <strong>Hasil Tes Kepribadian</strong>' +
        '<span class="hari-tgl">5 sifat utama</span></div>' +
      urut.map(function (k) { return barisFaktor(k, h); }).join('') +
      '<div class="hari-sub" style="margin-top:12px">Yang paling menonjol: <strong>' + kuat + '</strong>. ' +
      'Yang paling rendah: <strong>' + rendah + '</strong>. Keduanya bukan penilaian bagus-buruk, ' +
      'tetapi berguna untuk tahu posisi kerjamu dan apa yang perlu kamu jelaskan saat wawancara.</div>' +
    '</div>' +
    panelLaporanLengkap(h) +
    '<div class="card">' +
      '<div class="hari-head">' + ic('check', 16) + ' <strong>Ulangi kapan saja</strong></div>' +
      '<div class="hari-sub">Kepribadian cenderung stabil, tapi hasilnya bisa bergeser saat kamu sedang tertekan ' +
      'atau sedang banyak berubah. Ulangi beberapa bulan sekali untuk melihat polanya.</div>' +
      '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="mulaiBigFive()">' + ic('refresh', 14) + ' Ulangi tes</button>' +
      '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="navTo(\'baterai\')">Kembali ke baterai</button>' +
    '</div>' +
    panelValiditas();
};

// ---------- 3. LAPORAN LENGKAP (siap dijual) ----------
// Belum dibuka karena pembayaran belum dipasang. Saat siap: ubah LAPORAN_BAYAR_AKTIF jadi true.
window.LAPORAN_BAYAR_AKTIF = false;
window.HARGA_LAPORAN = 'Rp 39.000';

window.panelLaporanLengkap = function () { return panelCaraBeli(); };

function laporanLengkapIsi(h) {
  return '<div class="card"><div class="hari-head">' + ic('file', 16) + ' <strong>Laporan Lengkap</strong></div>' +
    '<div class="hari-sub">Laporan lengkapmu siap.</div></div>';
}

// ---------- 4. HALAMAN VALIDITAS & LISENSI (jujur dan terbuka) ----------
window.panelValiditas = function () {
  return '<div class="card">' +
    '<div class="hari-head">' + ic('shield', 16) + ' <strong>Dasar dan batas tes ini</strong></div>' +
    '<div class="hari-sub"><strong>Yang dipakai:</strong> 20 pernyataan dari Mini-IPIP ' +
    '(International Personality Item Pool, ipip.ori.org). IPIP berstatus <strong>domain publik</strong> — ' +
    'boleh dipakai, diterjemahkan, dan dijual. IPIP dikembangkan Goldberg (1999); Mini-IPIP divalidasi ' +
    'Donnellan dkk (2006) dengan reliabilitas tiap sifat antara 0,65-0,77.</div>' +
    '<div class="hari-sub" style="margin-top:8px"><strong>Yang TIDAK dipakai:</strong> tes berlisensi seperti ' +
    'Raven, WAIS, CFIT, IST, PAPI Kostick, MMPI, dan Wartegg tidak kami pakai — itu milik penerbitnya masing-masing. ' +
    'Aplikasi ini juga bukan pengganti tes resmi.</div>' +
    '<div class="hari-sub" style="margin-top:8px"><strong>Batas jujur:</strong> terjemahan bahasa Indonesia ini ' +
    'belum diuji ulang pada orang Indonesia (belum ada norma lokal), dan hasilnya menggambarkan ' +
    'penilaianmu tentang dirimu sendiri — bukan diagnosis, bukan vonis, dan bukan penentu kelulusan.</div>' +
    '</div>';
};

// ---------- 5. SEMUA LAPORAN (untuk ditinjau sendiri) ----------
window.bukaSemuaLaporan = function () {
  var t = '';
  t += 'TES KEPRIBADIAN (Mini-IPIP) — 20 butir, domain publik\n';
  t += 'Sumber: IPIP (ipip.ori.org); Goldberg 1999; Mini-IPIP: Donnellan dkk 2006 (reliabilitas 0,65-0,77).\n';
  t += 'Penilaian: butir positif 1-5, butir negatif dibalik, dijumlahkan per sifat (rentang 4-20).\n\n';
  var h = b5Terakhir();
  if (h) {
    Object.keys(h.skor).forEach(function (k) {
      t += '  ' + FAKTOR_B5[k].nama + ': ' + h.skor[k].skor + ' / ' + h.skor[k].maks + '  (' + h.skor[k].persen + '%)\n';
    });
    t += '  tanggal: ' + h.tanggal + '\n';
  } else {
    t += '  (belum ada hasil)\n';
  }
  t += '\nBATAS: bukan diagnosis dan bukan pengganti tes resmi. Terjemahan belum divalidasi lokal.\n';
  alert(t);
};


// ============================================================
// 6. PEMASANGAN — jalur Umum, halaman tes, dan sisipan di Baterai
// ============================================================

// jalur untuk pengguna umum / pencari kerja (bukan instansi tertentu)
JALUR.umum = {
  nama: 'Umum / Dunia Kerja',
  singkat: 'Umum / Kerja',
  uji: ['Tes IQ & logika: matriks, deret angka, rotasi, verbal — paling sering keluar di rekrutmen',
        'Tes kecepatan kerja: Kraepelin / Pauli (menjumlahkan angka berderet)',
        'Tes kepribadian: Big Five (Mini-IPIP, 20 pernyataan)',
        'Tes gambar: Wartegg, BAUM, DAP — dipandu cara menghadapinya',
        'Wawancara: cara menjelaskan hasil tes kepribadianmu dengan jujur'],
  sim: { judul: 'Latihan Umum', menit: 60, resmi: false,
         komposisi: { numerik: 15, verbal: 15, penalaran_logika: 15, kepribadian: 15 } },
  catatan: 'Dipakai perusahaan dan lembaga mana pun. Ini latihan umum, bukan format resmi satu instansi.',
  modul: ['b5', 'iq', 'kraepelin', 'gambar']
};

// tambahkan modul Big Five ke daftar Baterai Psikotes
var _bateriLama = window.bateri;
window.bateri = function () {
  var daftar = _bateriLama();
  daftar.unshift({
    id: 'b5',
    nama: 'Kepribadian: Big Five (20 pernyataan)',
    mengukur: 'Lima sifat utama kepribadian — dipakai luas di dunia kerja',
    durasi: '±4 menit',
    mulai: 'mulaiBigFive()',
    label: 'Mulai Tes',
    tes: []
  });
  return daftar;
};

// status modul Big Five dibaca dari riwayat hasil
var _statusModulLama = window.statusModul;
window.statusModul = function (m) {
  if (m && m.id === 'b5') {
    var t = b5Terakhir();
    return t ? { lulus: true, teks: 'hasil tersimpan (' + t.tanggal + ')', skor: null }
             : { lulus: false, teks: 'belum dicoba', skor: null };
  }
  return _statusModulLama(m);
};

var _renderSebelumFitur8 = window.render;
window.render = function () {
  if (_renderSebelumFitur8) _renderSebelumFitur8.apply(this, arguments);
  try { sisipPanel8(); } catch (e) {}
};

function sisipPanel8() {
  var m = document.getElementById('main');
  if (!m) return;

  // halaman tes kepribadian
  if (S.page === 'b5') {
    m.innerHTML = renderBigFive();
    return;
  }

  // di halaman baterai: tambahkan tombol jalur Umum + tautan halaman umum
  if (S.page === 'baterai') {
    var kartu = m.querySelector('.card:last-of-type');
    if (kartu && !m.querySelector('.tautan-umum')) {
      var w = document.createElement('div');
      w.className = 'tautan-umum';
      w.innerHTML = '<div class="card"><div class="hari-head">' + ic('globe', 16) +
        ' <strong>Untuk umum (non-kedinasan)</strong></div>' +
        '<div class="hari-sub">Dipakai untuk psikotes rekrutmen kerja: tes IQ, kecepatan kerja, ' +
        'kepribadian Big Five, tes gambar, dan wawancara.</div>' +
        '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="setJalur(\'umum\')">' +
        ic('check', 14) + ' Pilih jalur Umum / Kerja</button></div>';
      kartu.insertAdjacentElement('afterend', w);
    }
    return;
  }

  // di beranda: tawarkan jalur umum kepada pengunjung baru
  if (S.page === 'home' && !m.querySelector('.ajak-umum')) {
    var kotak = m.querySelector('.grid-3');
    if (kotak) {
      var w2 = document.createElement('div');
      w2.className = 'ajak-umum';
      w2.innerHTML = '<div class="card"><div class="hari-head">' + ic('brain', 16) +
        ' <strong>Untuk umum: latihan psikotes kerja &amp; tes IQ</strong></div>' +
        '<div class="hari-sub">Tes IQ, kecepatan kerja (Kraepelin), kepribadian Big Five, dan tes gambar — ' +
        'gratis, tanpa akun, bisa offline.</div>' +
        '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="setJalur(\'umum\')">' +
        ic('arrow-right', 14) + ' Mulai latihan umum</button></div>';
      kotak.insertAdjacentElement('afterend', w2);
    }
  }
}
