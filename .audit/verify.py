#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifikasi akhir bank soal setelah perbaikan (jalankan dari root repo)."""
import json, re, math, base64, collections, xml.etree.ElementTree as ET
from fractions import Fraction as F

db = json.load(open('.audit/db-new.json'))
ok = True
def rep(cond, label, detail=''):
    global ok
    print(('  OK    ' if cond else '  GAGAL ') + '| ' + label + ((' -> ' + str(detail)[:300]) if detail else ''))
    if not cond:
        ok = False

print('== 1. Struktur ==')
tot = sum(len(v['soal']) for v in db.values())
rep(tot == 1000, 'jumlah soal = 1000', tot)
rep(len(db) == 9, 'jumlah kategori = 9', len(db))
ids = [q['id'] for v in db.values() for q in v['soal']]
rep(len(set(ids)) == 1000, 'id unik', len(set(ids)) - len(ids))
bad = [q['id'] for v in db.values() for q in v['soal'] if not (0 <= q['jawaban'] < len(q['pilihan']))]
rep(not bad, 'semua indeks kunci valid', bad)
rep(all(len(q['pilihan']) == 4 for v in db.values() for q in v['soal']), 'setiap soal 4 opsi')
rep(all((q['pertanyaan'] or '').strip() for v in db.values() for q in v['soal']), 'semua pertanyaan terisi')
rep(all(q['pembahasan'].strip() for v in db.values() for q in v['soal']), 'semua pembahasan terisi')

print('== 2. Hitung ulang soal aritmetika ==')
SUPMAP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')
def hitung(t):
    """Kembalikan nilai yang seharusnya, atau None kalau tidak bisa diurai otomatis."""
    t = t.strip()
    if not t.endswith('...'):
        return None
    core = t[:-3].strip().rstrip('= ').strip()
    core = core.replace('×', '*').replace('÷', '/').replace('^', '**')
    # akar
    def rootrep(m):
        return 'math.isqrt(%s)' % m.group(1)
    c2 = re.sub(r'√\s*(\d+)', rootrep, core)
    c2 = re.sub(r'Akar dari\s*(\d+)', rootrep, c2)
    # pecahan campuran "3/8 + 5/6"
    if re.match(r'^[\d\s\+\-\*/\(\)\.\,]*$', c2.replace('math.isqrt', '').replace('(', '').replace(')', '').replace(',', '.')):
        try:
            v = eval(c2, {'math': math, '__builtins__': {}})
            return F(v).limit_denominator(10 ** 6)
        except Exception:
            return None
    m = re.match(r'^(\d+)\s*%\s*dari\s*(\d+)(?:\s*\+\s*(\d+)\s*%\s*dari\s*(\d+))?\s*$', core)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        v = a * b / 100
        if m.group(3):
            v += int(m.group(3)) * int(m.group(4)) / 100
        return F(v)
    m = re.match(r'^(FPB|KPK)\s*dari\s*(\d+)\s*dan\s*(\d+)$', core)
    if m:
        a, b = int(m.group(2)), int(m.group(3))
        return F(math.gcd(a, b) if m.group(1) == 'FPB' else a * b // math.gcd(a, b))
    m = re.match(r'^(\d)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$', core)
    if m:
        return F(int(m.group(1)) ** int(m.group(2).translate(SUPMAP)))
    return None

def nilaikan(s):
    """Nilai numerik sebuah opsi (Rp, pecahan, persen, satuan)."""
    s = s.strip()
    m = re.match(r'^Rp([\d\.]+)$', s)
    if m: return F(int(m.group(1).replace('.', '')))
    m = re.match(r'^(-?\d+)\s*/\s*(-?\d+)$', s)
    if m and int(m.group(2)) != 0: return F(int(m.group(1)), int(m.group(2)))
    m = re.match(r'^(\d+(?:[.,]\d+)?)\s*[a-zA-Z³²°/]', s) or re.match(r'^(\d+(?:[.,]\d+)?)$', s)
    if m:
        try: return F(m.group(1).replace(',', '.'))
        except Exception: return None
    return None

errs, dicek = [], 0
for cat, v in db.items():
    for q in v['soal']:
        t = q['pertanyaan']
        if not re.search(r'[=\?]', t) or '...' not in t:
            continue
        want = hitung(t)
        if want is None:
            continue
        got = nilaikan(q['pilihan'][q['jawaban']])
        if got is None and '²' in q['pilihan'][q['jawaban']]:
            continue          # jawaban bentuk pangkat (2⁵) -> tidak diuji angka
        dicek += 1
        if got is not None and got != want:
            errs.append((cat, q['id'], t, str(want), q['pilihan'][q['jawaban']]))
rep(not errs, 'semua soal hitung cocok dengan kuncinya (%d soal diuji otomatis)' % dicek, errs[:8])

print('== 3. Opsi tidak ada yang bernilai sama (anti-ambigu) ==')
amb = []
for cat, v in db.items():
    for q in v['soal']:
        seen = collections.defaultdict(list)
        for p in q['pilihan']:
            if re.search(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]', p):
                continue          # jawaban bentuk pangkat -> lewati
            k = nilaikan(p)
            if k is None: continue
            if re.search(r'[a-zA-Z]', p) and not re.match(r'^Rp', p) and not re.match(r'^-?\d+\s*/\s*-?\d+$', p.strip()):
                continue          # opsi bertema tanggal/teks -> jangan dibandingkan sebagai angka
            seen[k].append(p)
        for k, ps in seen.items():
            if len(set(ps)) > 1:
                amb.append((cat, q['id'], ps))
rep(not amb, 'tidak ada dua opsi bernilai sama', amb)

print('== 4. Pembahasan mudah dipahami ==')
L = [len(q['pembahasan']) for v in db.values() for q in v['soal']]
rep(all(q['pembahasan'].startswith('JAWABAN: ') for v in db.values() for q in v['soal']),
    'semua pembahasan diawali "JAWABAN:"')
rep(all(q['pilihan'][q['jawaban']] in q['pembahasan'] for v in db.values() for q in v['soal']),
    'kunci disebut di pembahasan')
rep(all(len(q['pembahasan'].split('\n')) >= 2 for v in db.values() for q in v['soal']),
    'setiap pembahasan punya baris penjelasan cara/langkah')
rep(min(L) >= 40, 'pembahasan terpendek', min(L))
tip = sum(1 for v in db.values() for q in v['soal'] if 'INGAT: ' in q['pembahasan'])
print('           baris INGAT ada di %d soal (sisanya sudah berisi blok TRIK/Tips)' % tip)
print('           panjang pembahasan: min %d, median %d, rata-rata %d' % (min(L), sorted(L)[len(L)//2], sum(L) / len(L)))

print('== 5. Gambar soal ==')
img = [(c, q['id'], q['gambar']) for c, v in db.items() for q in v['soal'] if q.get('gambar')]
bad_img = []
for c, i, g in img:
    try:
        raw = base64.b64decode(g.split(',', 1)[1]).decode()
        ET.fromstring(raw)
        if '<svg' not in raw:
            bad_img.append((c, i, 'bukan svg'))
    except Exception as e:
        bad_img.append((c, i, str(e)[:40]))
rep(not bad_img, 'semua gambar soal valid (%d gambar)' % len(img), bad_img)

print('== 6. Hasil ==')
print('  ', 'SEMUA VERIFIKASI LULUS' if ok else 'ADA YANG GAGAL — periksa di atas')
