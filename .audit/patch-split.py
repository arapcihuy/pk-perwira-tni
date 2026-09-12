#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sambungkan app.js/fitur.js/index.html/sw.js dengan data yang dipecah per kategori."""
import re

# ---------------------------------------------------------------- app.js
p = 'static/js/app.js'
s = open(p, encoding='utf-8').read()
asli = s

# 1) header stats pakai index (tidak butuh semua data)
s = s.replace("""function updateHeaderStats() {
  var allSoal = getAllSoal();
  var el1 = document.getElementById('hStatSoal');
  var el2 = document.getElementById('hStatKat');
  var el3 = document.getElementById('hStatTO');
  if (el1) el1.textContent = allSoal.length;
  if (el2) el2.textContent = Object.keys(SOAL_DATABASE).length;
  if (el3) el3.textContent = loadToTotal();
}""",
"""function updateHeaderStats() {
  var el1 = document.getElementById('hStatSoal');
  var el2 = document.getElementById('hStatKat');
  var el3 = document.getElementById('hStatTO');
  if (el1) el1.textContent = totalSoal();
  if (el2) el2.textContent = daftarKategori().length;
  if (el3) el3.textContent = loadToTotal();
}

function jumlahSoalKategori(k) { return jumlahSoal(k); }
function namaKategoriAman(k) { return namaKategori(k); }""")

# 2) halaman "sedang memuat"
s = s.replace("""  switch (S.page) {
    case 'home':  m.innerHTML = renderHome();  break;""",
"""  switch (S.page) {
    case 'memuat': m.innerHTML = htmlMemuat(S.pesanMemuat || 'Menyiapkan soal...'); break;
    case 'home':  m.innerHTML = renderHome();  break;""")

# 3) beranda: hitungan dari index
s = s.replace("""function renderHome() {
  var all = getAllSoal();
  var scores = loadScores();""",
"""function renderHome() {
  var scores = loadScores();""")
s = s.replace("  var catKeys = Object.keys(SOAL_DATABASE);\n\n  var catCards = catKeys.map(function(k) {\n    var v = SOAL_DATABASE[k];",
              "  var catKeys = daftarKategori();\n\n  var catCards = catKeys.map(function(k) {\n    var v = { nama: namaKategori(k), soal: { length: jumlahSoal(k) } };")
s = s.replace("'<div class=\"card h3\">Total Soal</div>' +\n        '<div class=\"card num\">' + all.length + '</div>' +",
              "'<div class=\"card h3\">Total Soal</div>' +\n        '<div class=\"card num\">' + totalSoal() + '</div>' +")

# 4) halaman pilih kategori: hitungan dari index + gerbang data
s = s.replace("""function renderCat() {
  var isTO = S.mode === 'tryout';
  var all = getAllSoal();
  var catKeys = Object.keys(SOAL_DATABASE);

  var items = '<div class="kat-card" onclick="startCat(\\'all\\',\\'' + S.mode + '\\')">' +
    '<div class="kat-icon">' + icon('layers', 22) + '</div>' +
    '<div class="kat-name">Semua Kategori</div>' +
    '<div class="kat-sub">' + all.length + ' soal · acak</div>' +
    '</div>';

  catKeys.forEach(function(k) {
    var v = SOAL_DATABASE[k];""",
"""function renderCat() {
  var isTO = S.mode === 'tryout';
  var catKeys = daftarKategori();

  var items = '<div class="kat-card" onclick="startCat(\\'all\\',\\'' + S.mode + '\\')">' +
    '<div class="kat-icon">' + icon('layers', 22) + '</div>' +
    '<div class="kat-name">Semua Kategori</div>' +
    '<div class="kat-sub">' + totalSoal() + ' soal · acak</div>' +
    '</div>';

  catKeys.forEach(function(k) {
    var v = { nama: namaKategori(k), soal: { length: jumlahSoal(k) } };""")

# 5) startCat: tunggu data bila belum siap
s = s.replace("""function startCat(cat, mode) {
  S.cat = cat;""",
"""function startCat(cat, mode) {
  // data soal dimuat bertahap: tunggu sampai kategori ini siap
  if (cat !== 'all' && !katSiap(cat)) {
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan soal ' + namaKategori(cat) + '...';
    render();
    pastikanKategori(cat).then(function() { startCat(cat, mode); });
    return;
  }
  if (cat === 'all' && !katSiapSemua()) {
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan seluruh soal (sekali saja, sesudah ini langsung siap)...';
    render();
    pastikanSemua().then(function() { startCat(cat, mode); });
    return;
  }
  S.cat = cat;""")

# 6) ulangi sesi: tunggu data kategorinya
s = s.replace("""  } else if (SOAL_DATABASE[S.cat]) {
    startCat(S.cat, S.mode);""",
"""  } else if (S.cat === 'all' || SOAL_DATABASE[S.cat]) {
    startCat(S.cat, S.mode);""")

# 7) simulasi 60 soal: tunggu semua data
s = s.replace("""window.startSimulasi60 = function() {
  // Simulasi tryout 60 soal 90 menit persis format PK Perwira
  var all = getAllSoal();""",
"""window.startSimulasi60 = function() {
  // Simulasi tryout 60 soal 90 menit persis format PK Perwira
  if (!katSiapSemua()) {
    S.page = 'memuat';
    S.pesanMemuat = 'Menyiapkan 60 soal simulasi...';
    render();
    pastikanSemua().then(function() { startSimulasi60(); });
    return;
  }
  var all = getAllSoal();""")

# 8) bank soal: gerbang data
s = s.replace("""function renderBank() {
  var catKeys = Object.keys(SOAL_DATABASE);""",
"""function renderBank() {
  var butuh = (S.bankCat === 'all') ? pastikanSemua() : pastikanKategori(S.bankCat);
  if (!(S.bankCat === 'all' ? katSiapSemua() : katSiap(S.bankCat))) {
    butuh.then(function() { render(); });
    return htmlMemuat('Memuat bank soal...');
  }
  var catKeys = Object.keys(SOAL_DATABASE);""")

# 9) halaman progress: daftar kategori dari index
s = s.replace("""  var catKeys = Object.keys(SOAL_DATABASE);
  catKeys.forEach(function(k) {
    var p = prog[nama] || { total: 0, benar: 0 };""",
"""  var catKeys = daftarKategori();
  catKeys.forEach(function(k) {
    var p = prog[nama] || { total: 0, benar: 0 };""")
s = s.replace("""  var catKeys = Object.keys(SOAL_DATABASE);
  var rows = '';""", """  var catKeys = daftarKategori();
  var rows = '';""")

if s == asli:
    print('!! app.js tidak berubah — periksa pola')
else:
    open(p, 'w', encoding='utf-8').write(s)
    print('app.js dipatch:', len(s) - len(asli), 'karakter')

# ---------------------------------------------------------------- index.html
p = 'index.html'
s = open(p, encoding='utf-8').read()
s = s.replace('<script src="data/soal.js?v=20"></script>',
              '<script src="data/soal-index.js?v=20"></script>\n'
              '  <script src="data/tips.js?v=20"></script>\n'
              '  <script src="static/js/data-loader.js?v=20"></script>')
open(p, 'w', encoding='utf-8').write(s)
print('index.html: skrip data diganti')

# ---------------------------------------------------------------- sw.js
p = 'sw.js'
s = open(p, encoding='utf-8').read()
s = s.replace("  './data/soal.js?v=20',", "  './data/soal-index.js?v=20',\n  './data/tips.js?v=20',")
if "data-loader.js" not in s:
    s = s.replace("  './static/js/app.js?v=20',", "  './static/js/data-loader.js?v=20',\n  './static/js/app.js?v=20',\n  './static/js/fitur.js?v=20',")
open(p, 'w', encoding='utf-8').write(s)
print('sw.js: daftar cache diperbarui')
