#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gambar pembahasan untuk soal matematika geometri: bangun + rumus + nilai yang diketahui.

Menulis .audit/gambar-geometri.json -> { id_soal: svg }
"""
import json
import re

H = ("<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150' style='background:#0c1829'>"
     "<rect width='300' height='150' fill='#0c1829'/>")
E = '</svg>'


def t(x, y, isi, warna='#ffd700', ukuran=12, jangkar='middle', tebal=True):
    tb = " font-weight='bold'" if tebal else ''
    return ("<text x='%s' y='%s' fill='%s' font-size='%s' text-anchor='%s'%s>%s</text>"
            % (x, y, warna, ukuran, jangkar, tb, isi))


def garis(x1, y1, x2, y2, warna='#4a90d9', tebal=2, putus=None):
    d = " stroke-dasharray='4 3'" if putus else ''
    return "<line x1='%s' y1='%s' x2='%s' y2='%s' stroke='%s' stroke-width='%s'%s/>" % (x1, y1, x2, y2, warna, tebal, d)


def kotak(x, y, w, h, isi='none', warna='#4a90d9', tebal=2):
    return "<rect x='%s' y='%s' width='%s' height='%s' fill='%s' stroke='%s' stroke-width='%s'/>" % (x, y, w, h, isi, warna, tebal)


def poli(points, isi='none', warna='#4a90d9', tebal=2, opacity=None):
    op = " opacity='%s'" % opacity if opacity else ''
    return "<polygon points='%s' fill='%s' stroke='%s' stroke-width='%s'%s/>" % (points, isi, warna, tebal, op)


def lingkaran(cx, cy, r, isi='none'):
    return "<circle cx='%s' cy='%s' r='%s' fill='%s' stroke='#4a90d9' stroke-width='2'/>" % (cx, cy, r, isi)


def angka(q, pola):
    m = re.search(pola, q['pertanyaan'])
    return m.group(1) if m else None


def gambar_untuk(q):
    tanya = q['pertanyaan'].lower()
    pb = q['pembahasan']

    # lingkaran (luas/keliling, jari-jari atau diameter)
    if 'lingkaran' in tanya:
        r = angka(q, r'jari-jari (\d+)')
        d = angka(q, r'diameter (\d+)')
        label = ('r = %s cm' % r) if r else (('d = %s cm' % d) if d else 'r = jari-jari')
        return (H + lingkaran(95, 70, 42) + garis(95, 70, 137, 70, '#ffd700', 1)
                + t(112, 62, label, '#ffd700', 11)
                + t(95, 126, 'r', '#9fd0ff', 11)
                + t(230, 55, 'L = π r²', '#ffffff', 12)
                + t(230, 74, 'K = 2 π r', '#ffffff', 12)
                + t(230, 93, 'π = 22/7', '#7a96b8', 11, 'middle', False) + E)

    # kubus (volume)
    if 'kubus' in tanya:
        r = angka(q, r'rusuk (\d+)')
        r = r or angka(q, r'rusuk (\d+) cm')
        lab = ('r = %s cm' % r) if r else 'r = rusuk'
        return (H + kotak(70, 40, 80, 80, isi='#162540')
                + poli('70,40 100,20 180,20 150,40', isi='#1a2d47')
                + poli('150,40 180,20 180,100 150,120', isi='#122036')
                + t(110, 85, lab, '#ffd700', 11)
                + t(245, 60, 'V = r × r × r', '#ffffff', 12)
                + t(245, 80, '     = r³', '#ffffff', 12)
                + t(245, 100, 'L = 6 r²', '#7a96b8', 11, 'middle', False) + E)

    # balok
    if 'balok' in tanya:
        m = re.search(r'balok (\d+) ?[×x] ?(\d+) ?[×x] ?(\d+)', tanya)
        lab = ('%s, %s, %s cm' % m.groups()) if m else 'p, l, t'
        return (H + kotak(60, 45, 100, 65, isi='#162540')
                + poli('60,45 95,22 195,22 160,45', isi='#1a2d47')
                + poli('160,45 195,22 195,87 160,110', isi='#122036')
                + t(110, 82, lab, '#ffd700', 10)
                + t(245, 60, 'V = p × l × t', '#ffffff', 12)
                + t(245, 82, 'L = 2(pl+pt+lt)', '#7a96b8', 10, 'middle', False) + E)

    # segitiga
    if 'segitiga' in tanya and 'siku' not in tanya:
        a = angka(q, r'alas (\d+)')
        tg = angka(q, r'tinggi (\d+)')
        lab = ('a = %s, t = %s' % (a, tg)) if (a and tg) else 'a = alas, t = tinggi'
        return (H + poli('60,120 200,120 130,35')
                + garis(130, 35, 130, 120, '#ffd700', 1, putus=True)
                + t(130, 78, 't', '#ffd700', 11)
                + t(130, 138, 'a', '#ffd700', 11)
                + t(150, 40, lab, '#9fd0ff', 10)
                + t(255, 60, 'L = ½ × a × t', '#ffffff', 11) + E)

    # trapesium
    if 'trapesium' in tanya:
        return (H + poli('55,115 205,115 170,40 90,40')
                + garis(130, 40, 130, 115, '#ffd700', 1, putus=True)
                + t(137, 80, 't', '#ffd700', 11)
                + t(130, 133, 'sisi sejajar a dan b', '#9fd0ff', 10)
                + t(255, 60, 'L = ½(a+b) × t', '#ffffff', 11) + E)

    # persegi (luas/keliling)
    if 'persegi' in tanya and 'panjang' not in tanya:
        s = angka(q, r'sisi (\d+)')
        lab = ('s = %s cm' % s) if s else 's = sisi'
        return (H + kotak(80, 30, 90, 90, isi='#162540') + t(125, 82, lab, '#ffd700', 11)
                + t(245, 60, 'L = s × s', '#ffffff', 12)
                + t(245, 82, 'K = 4 × s', '#ffffff', 12) + E)

    # persegi panjang (termasuk soal cerita luas/keliling)
    p = angka(q, r'panjang (\d+)')
    l = angka(q, r'lebar (\d+)')
    if p and l:
        lab = 'p = %s cm, l = %s cm' % (p, l)
    elif p:
        lab = 'p = %s cm, l = ?' % p
    else:
        lab = 'p = panjang, l = lebar'
    return (H + kotak(70, 40, 120, 70, isi='#162540')
            + t(130, 82, lab, '#ffd700', 10)
            + t(130, 30, 'p', '#9fd0ff', 11)
            + t(55, 80, 'l', '#9fd0ff', 11)
            + t(255, 60, 'L = p × l', '#ffffff', 11)
            + t(255, 80, 'K = 2(p+l)', '#ffffff', 11) + E)


def main():
    db = json.load(open('.audit/db-new.json'))
    hasil = {}
    n = 0
    for q in db['matematika']['soal']:
        if q.get('topik') != 'geometri':
            continue
        svg = gambar_untuk(q)
        if svg:
            hasil[q['id']] = svg
            n += 1
    json.dump(hasil, open('.audit/gambar-geometri.json', 'w'), ensure_ascii=False)
    print('gambar pembahasan geometri dibuat:', n)


if __name__ == '__main__':
    main()
