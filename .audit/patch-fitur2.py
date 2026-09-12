#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sambungkan fitur2.js ke alur aplikasi (v22)."""
p = 'static/js/app.js'
s = open(p, encoding='utf-8').read()
asli = s

# 1) halaman hafalan
s = s.replace("    case 'gagal':", "    case 'hafalan': m.innerHTML = renderHafalan(); break;\n    case 'gagal':")

# 2) startCat: acak opsi untuk tryout/simulasi + atur tampil kunci
s = s.replace("""  S.timed = (mode === 'tryout');
  S.totalTime = S.timed ? S.questions.length * 90 : 0;""",
"""  // acak posisi opsi untuk tryout/simulasi supaya posisi jawaban tidak bisa dihafal
  // (mode Belajar tetap berurutan agar enak dibaca)
  if (mode === 'tryout' && window.acakOpsi) {
    S.questions = S.questions.map(function(q) { return acakOpsi(q); });
  }
  // kunci disembunyikan selama tryout, dibuka di layar hasil / mode Review
  S.tampilkanKunci = (mode !== 'tryout');

  S.timed = (mode === 'tryout');
  S.totalTime = S.timed ? S.questions.length * 90 : 0;""")

# 3) opsi: jangan bocorkan kunci saat tryout
s = s.replace("""    var cls = 'option';
    if (answered) {
      cls += ' locked';
      if (i === q.jawaban) cls += ' correct';
      else if (i === ans) cls += ' wrong';
    } else {""",
"""    var cls = 'option';
    if (answered) {
      cls += ' locked';
      if (S.tampilkanKunci === false) {
        if (i === ans) cls += ' selected';
      } else {
        if (i === q.jawaban) cls += ' correct';
        else if (i === ans) cls += ' wrong';
      }
    } else {""")

# 4) pembahasan: dikunci saat tryout
s = s.replace("""  var expHtml = '';
  if (answered) {
    var benar = (ans === q.jawaban);""",
"""  var expHtml = '';
  if (answered && S.tampilkanKunci === false) {
    expHtml = '<div class="explanation show">' +
      '<div class="explanation-head"><strong>' + ic('book', 15) + ' Kunci dikunci selama tryout</strong>' +
      '<span class="exp-verdict">' + ic('clock', 12) + ' MODE UJIAN</span></div>' +
      '<div class="explanation-body">Di mode Tryout/Simulasi, kunci dan pembahasan baru dibuka setelah sesi selesai — supaya hasilnya jujur dan kebiasaan menandai soal ragu tetap terlatih.\n' +
      'Kamu tetap bisa membukanya sekarang kalau memang ingin belajar sambil mengerjakan.</div>' +
      '<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="bukaKunciSekarang()">' + ic('bulb', 14) + ' Buka kunci sekarang</button>' +
      '</div>';
  } else if (answered) {
    var benar = (ans === q.jawaban);""")

# 5) review: kunci ditampilkan
s = s.replace("""window.reviewSession = function() {
  // Tampilkan semua soal dalam mode belajar dengan jawaban yang sudah ada
  S.mode = 'learn';
  S.idx = 0;""",
"""window.reviewSession = function() {
  // Tampilkan semua soal dalam mode belajar dengan jawaban yang sudah ada
  S.mode = 'learn';
  S.tampilkanKunci = true;
  S.idx = 0;""")

# 6) profil soal adaptif: catat statistik per soal
s = s.replace("  if (window.catatSoalSalah) catatSoalSalah(q.id, i === q.jawaban);",
              "  if (window.catatSoalSalah) catatSoalSalah(q.id, i === q.jawaban);\n"
              "  if (window.catatStatSoal) catatStatSoal(q.id, i === q.jawaban);")

# 7) riwayat nilai: simpan 30 sesi + rincian per kategori untuk grafik tren
s = s.replace("""    var scores = loadScores();
    scores.push({
      nilai: nilai,
      benar: benar,
      salah: salah,
      skip: skip,
      tgl: new Date().toLocaleDateString('id-ID')
    });
    if (scores.length > 10) scores.shift();
    saveScores(scores);""",
"""    var scores = loadScores();
    scores.push({
      nilai: nilai,
      benar: benar,
      salah: salah,
      skip: skip,
      tgl: new Date().toLocaleDateString('id-ID'),
      perKat: S.lastResult.perKat || null
    });
    if (scores.length > 30) scores.shift();
    saveScores(scores);""")

# 8) simulasi 60 soal campuran: tetap acak opsi + kunci disembunyikan
s = s.replace("""  S.questions = shuffle(all).slice(0, 60);
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.timed = true;""",
"""  S.questions = shuffle(all).slice(0, 60).map(function(q) { return acakOpsi(q); });
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.isFormat = false;
  S.tampilkanKunci = false;
  S.timed = true;""")

if s == asli:
    print('!! app.js tidak berubah')
else:
    open(p, 'w', encoding='utf-8').write(s)
    print('app.js dipatch:', len(s) - len(asli), 'karakter')

# index.html + sw.js
p = 'index.html'
s = open(p, encoding='utf-8').read()
if 'fitur2.js' not in s:
    s = s.replace('<script src="static/js/fitur.js?v=21"></script>',
                  '<script src="static/js/fitur.js?v=21"></script>\n  <script src="static/js/fitur2.js?v=21"></script>')
    open(p, 'w', encoding='utf-8').write(s)
    print('index.html: fitur2.js ditambahkan')

p = 'sw.js'
s = open(p, encoding='utf-8').read()
if 'fitur2.js' not in s:
    s = s.replace("  './static/js/fitur.js?v=21',", "  './static/js/fitur.js?v=21',\n  './static/js/fitur2.js?v=21',")
    open(p, 'w', encoding='utf-8').write(s)
    print('sw.js: fitur2.js masuk daftar cache')
