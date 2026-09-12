#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pembahasan bergambar: gambar tambahan dengan daerah diberi nomor untuk soal hitung bangun.

Membuat .audit/gambar-pembahasan.json  ->  { id_soal: [svg_string] }
Dipakai fix.py untuk menambah field 'gambarPembahasan' pada soal terkait.
"""
import json

HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150' style='background:#0c1829'>"
        "<rect width='300' height='150' fill='#0c1829'/>")
E = '</svg>'


def t(x, y, isi, warna='#ffd700', ukuran=14):
    return ("<text x='%s' y='%s' fill='%s' font-size='%s' text-anchor='middle' font-weight='bold'>%s</text>"
            % (x, y, warna, ukuran, isi))


def garis(x1, y1, x2, y2, warna='#4a90d9', tebal=2):
    return "<line x1='%s' y1='%s' x2='%s' y2='%s' stroke='%s' stroke-width='%s'/>" % (x1, y1, x2, y2, warna, tebal)


def kotak(x, y, w, h, warna='#4a90d9', isi='none', tebal=2, opacity=None):
    op = " opacity='%s'" % opacity if opacity else ''
    return "<rect x='%s' y='%s' width='%s' height='%s' fill='%s' stroke='%s' stroke-width='%s'%s/>" % (x, y, w, h, isi, warna, tebal, op)


def poligon(points, isi='none', warna='#4a90d9', tebal=2, opacity=None):
    op = " opacity='%s'" % opacity if opacity else ''
    return "<polygon points='%s' fill='%s' stroke='%s' stroke-width='%s'%s/>" % (points, isi, warna, tebal, op)


GAMBAR = {}

# tg6 — persegi dibagi satu diagonal: 2 segitiga
GAMBAR['tg6'] = [HEAD +
                 kotak(100, 25, 100, 100) + garis(100, 25, 200, 125) +
                 poligon('100,25 100,125 200,125', isi='#4a90d9', opacity='0.35') +
                 t(133, 105, '1') + t(167, 62, '2') +
                 '<text x="150" y="142" fill="#7a96b8" font-size="11" text-anchor="middle">Satu diagonal = 2 segitiga</text>' + E]

# tg29 — segitiga dengan 1 garis dari titik tengah alas ke puncak: 3 segitiga
GAMBAR['tg29'] = [HEAD +
                  poligon('150,20 60,125 240,125') + garis(150, 20, 150, 125) +
                  poligon('150,20 60,125 150,125', isi='#4a90d9', opacity='0.3') +
                  poligon('150,20 150,125 240,125', isi='#4a90d9', opacity='0.15') +
                  t(115, 100, '1') + t(185, 100, '2') +
                  t(150, 45, '3', '#ffffff', 13) +
                  '<text x="150" y="142" fill="#7a96b8" font-size="11" text-anchor="middle">1, 2 = segitiga kecil · 3 = seluruh segitiga</text>' + E]

# tg36 — kisi 2x2: 5 persegi (4 kecil + 1 besar)
GAMBAR['tg36'] = [HEAD +
                  kotak(90, 20, 120, 100) + garis(150, 20, 150, 120) + garis(90, 70, 210, 70) +
                  t(120, 52, '1') + t(180, 52, '2') + t(120, 100, '3') + t(180, 100, '4') +
                  t(255, 45, '5', '#ffffff', 13) +
                  garis(240, 40, 215, 30, '#ffffff', 1) +
                  '<text x="150" y="140" fill="#7a96b8" font-size="11" text-anchor="middle">1-4 persegi kecil · 5 = persegi besar (penuh)</text>' + E]

# tg52 — persegi dengan dua diagonal: 4 segitiga
GAMBAR['tg52'] = [HEAD +
                  kotak(100, 25, 100, 100) + garis(100, 25, 200, 125) + garis(200, 25, 100, 125) +
                  t(150, 55, '1') + t(182, 78, '2') + t(150, 105, '3') + t(118, 78, '4') +
                  '<text x="150" y="142" fill="#7a96b8" font-size="11" text-anchor="middle">Dua diagonal = 4 segitiga</text>' + E]

# tg60 — tiga kubus tampak depan: 1,2 bawah + 3 atas
GAMBAR['tg60'] = [HEAD +
                  kotak(95, 70, 50, 50) + kotak(145, 70, 50, 50) + kotak(120, 30, 50, 40, isi='#162540') +
                  t(120, 102, '1') + t(170, 102, '2') + t(145, 58, '3') +
                  '<text x="235" y="80" fill="#7a96b8" font-size="10" text-anchor="middle">baris bawah 2</text>' +
                  '<text x="235" y="95" fill="#7a96b8" font-size="10" text-anchor="middle">baris atas 1</text>' + E]

# tg68 — segitiga medial: 4 segitiga kecil
GAMBAR['tg68'] = [HEAD +
                  poligon('150,20 60,125 240,125') +
                  poligon('105,72 195,72 150,125') + garis(105, 72, 195, 72) +
                  garis(105, 72, 150, 125) + garis(195, 72, 150, 125) +
                  t(105, 65, '1') + t(195, 65, '2') + t(150, 58, '3') + t(150, 108, '4') +
                  '<text x="150" y="142" fill="#7a96b8" font-size="11" text-anchor="middle">Titik tengah sisi dihubungkan = 4 segitiga</text>' + E]

json.dump({k: v for k, v in GAMBAR.items()}, open('.audit/gambar-pembahasan.json', 'w'), ensure_ascii=False)
print('pembahasan bergambar dibuat:', list(GAMBAR.keys()))
