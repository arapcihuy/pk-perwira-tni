#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sambungkan fitur3.js (v23): topik, kesiapan, rencana, rapor, tentang."""
import re

# ---------- app.js ----------
p = 'static/js/app.js'
s = open(p, encoding='utf-8').read()
asli = s

# halaman tentang
s = s.replace("    case 'hafalan': m.innerHTML = renderHafalan(); break;",
              "    case 'hafalan': m.innerHTML = renderHafalan(); break;\n    case 'tentang': m.innerHTML = renderTentang(); break;")

# filter topik pada bank soal
s = s.replace("""  catKeys.forEach(function(k) {
    if (S.bankCat === 'all' || S.bankCat === k) {
      SOAL_DATABASE[k].soal.forEach(function(s) {
        list.push(Object.assign({}, s, { katKey: k, katNama: SOAL_DATABASE[k].nama }));
      });
    }
  });""",
"""  catKeys.forEach(function(k) {
    if (S.bankCat === 'all' || S.bankCat === k) {
      SOAL_DATABASE[k].soal.forEach(function(s) {
        var item = Object.assign({}, s, { katKey: k, katNama: SOAL_DATABASE[k].nama });
        if (window.bankSaringTopik && !bankSaringTopik(item)) return;   // filter topik (fitur3)
        list.push(item);
      });
    }
  });""")

# mode drill25 (latihan 25 soal dari kategori tertentu) + reset filter topik saat pindah halaman
s = s.replace("""  if (mode === 'tryout' && S.questions.length > TRYOUT_MAX_SOAL) {
    S.questions = S.questions.slice(0, TRYOUT_MAX_SOAL);
  }""",
"""  if (mode === 'tryout' && S.questions.length > TRYOUT_MAX_SOAL) {
    S.questions = S.questions.slice(0, TRYOUT_MAX_SOAL);
  }
  if (mode === 'drill25') {
    S.mode = 'drill';
    S.questions = S.questions.slice(0, 25).map(function(q) { return window.acakOpsi ? acakOpsi(q) : q; });
  }""")

# saat membuka bank soal: reset pilihan topik bila kategorinya berubah
s = s.replace("""window.setBankCat = function(k) {""",
"""window.setBankCat = function(k) {
  if (window.TOPIK_S) TOPIK_S.topik = 'all';""")

# tautan "Tentang" di kaki beranda
s = s.replace("""'<div id="buildTag" style="text-align:center;font-size:11px;color:var(--text3);margin:20px 0 8px">Build v21 · pengulangan berjadwal, rincian per kategori, tema terang</div>'""",
"""'<div id="buildTag" style="text-align:center;font-size:11px;color:var(--text3);margin:20px 0 8px">Build v21 · pengulangan berjadwal, rincian per kategori, tema terang</div>' +
    '<div style="text-align:center;margin-bottom:16px"><button class="btn btn-ghost btn-sm" onclick="bukaTentang()">Tentang aplikasi & data</button></div>'""")

if s == asli:
    print('!! app.js tidak berubah')
else:
    open(p, 'w', encoding='utf-8').write(s)
    print('app.js dipatch:', len(s) - len(asli), 'karakter')

# ---------- index.html + sw.js ----------
p = 'index.html'
s = open(p, encoding='utf-8').read()
m = re.search(r'<script src="static/js/fitur2\.js\?v=([^"]+)"></script>', s)
assert m, 'pola fitur2.js tidak ditemukan'
if 'fitur3.js' not in s:
    s = s[:m.end()] + '\n  <script src="static/js/fitur3.js?v=%s"></script>' % m.group(1) + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
print('index.html fitur3:', 'fitur3.js' in open(p, encoding='utf-8').read())

p = 'sw.js'
s = open(p, encoding='utf-8').read()
m = re.search(r"'\./static/js/fitur2\.js\?v=([^']+)',", s)
assert m, 'pola fitur2.js tidak ditemukan di sw.js'
if 'fitur3.js' not in s:
    s = s[:m.end()] + "\n  './static/js/fitur3.js?v=%s'," % m.group(1) + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
print('sw.js fitur3:', 'fitur3.js' in open(p, encoding='utf-8').read())
