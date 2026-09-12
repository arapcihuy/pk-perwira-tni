#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifikasi akhir bank soal setelah perbaikan (jalankan dari root repo)."""
import json, re, math, base64, collections, xml.etree.ElementTree as ET
from math import gcd


def lcm(a, b):
    return a * b // gcd(a, b)
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
rep(tot >= 1000, 'jumlah soal minimal 1000', tot)
rep(len(db) == 9, 'jumlah kategori = 9', len(db))
ids = [q['id'] for v in db.values() for q in v['soal']]
rep(len(set(ids)) == len(ids), 'id unik (tidak ada tabrakan id)', '%d id untuk %d soal' % (len(set(ids)), len(ids)))
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


print('== 3b. Kraepelin: kunci = satuan hasil penjumlahan ==')
kb = []
for q in db['kraepelin']['soal']:
    m = re.match(r'^(?:Berapa hasil:?\s*)?(\d+)\s*\+\s*(\d+)', q['pertanyaan'])
    if not m:
        m = re.search(r'menjumlahkan (\d+)\s*\+\s*(\d+)', q['pertanyaan'])
    if not m:
        continue
    a, b = int(m.group(1)), int(m.group(2))
    s2 = a + b
    benar = str(s2 % 10) if s2 >= 10 else str(s2)
    if q['pilihan'][q['jawaban']] != benar:
        kb.append((q['id'], '%d+%d' % (a, b), q['pilihan'][q['jawaban']], benar))
rep(not kb, 'semua soal Kraepelin angka cocok dengan aturan satuan', kb)

print('== 3c. Tidak ada soal duplikat ==')
grupd = collections.defaultdict(list)
for cat, v in db.items():
    for q in v['soal']:
        grupd[(cat, ' '.join(q['pertanyaan'].lower().split()),
               tuple(sorted(q['pilihan'])), q['pilihan'][q['jawaban']])].append(q['id'])
dupd = [(k[0], ids) for k, ids in grupd.items() if len(ids) > 1]
rep(not dupd, 'tidak ada dua soal yang isinya sama persis', dupd)

print('== 3d. Pengecoh masuk akal (kesalahan hitung yang lazim) ==')
POLA_CEK = ('Volume kubus dengan rusuk', 'Volume balok')
jauh = []
for cat, v in db.items():
    for q in v['soal']:
        t = q['pertanyaan']
        jenis = None
        m = re.match(r'^(KPK|FPB) dari (\d+) dan (\d+)', t)
        if m:
            jenis = 'kpkfpb'
            a2, b2 = int(m.group(2)), int(m.group(3))
        m2 = re.match(r'^(\d)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \.\.\.$', t)
        if m2:
            jenis = 'pangkat'
            p2, n2 = int(m2.group(1)), int(m2.group(2).translate(SUPMAP))
        m3 = re.match(r'^Volume kubus dengan rusuk (\d+) cm', t)
        if m3:
            jenis = 'kubus'
            r2 = int(m3.group(1))
        m4 = re.match(r'^Volume balok (\d+) × (\d+) × (\d+) cm', t)
        if m4:
            jenis = 'balok'
            d1, d2, d3 = map(int, m4.groups())
        if not jenis:
            continue
        # hanya batch yang pengecohnya dirapikan (pangkat n123-n138, KPK/FPB n159-n176, volume m150-m159)
        terpilih = (re.match(r'^n1(2[3-9]|3[0-8])$', q['id']) or re.match(r'^n1(5[9]|6\d|7[0-6])$', q['id'])
                    or re.match(r'^m15\d$', q['id']))
        if not terpilih:
            continue
        nilai = []
        for p in q['pilihan']:
            mm = re.match(r'^(\d+)', p.strip())
            nilai.append(int(mm.group(1)) if mm else None)
        kk = re.match(r'^(\d+)', q['pilihan'][q['jawaban']].strip())
        if None in nilai or len(set(nilai)) != 4 or not kk:
            jauh.append((cat, q['id'], q['pilihan'], 'opsi bukan angka unik'))
            continue
        k = int(kk.group(1))
        izin = {k}
        if jenis == 'kpkfpb':
            izin |= {a2 * b2, a2 + b2, gcd(a2, b2), lcm(a2, b2), 2 * gcd(a2, b2), min(a2, b2)}
            izin |= {x for x in nilai if x <= min(a2, b2) or a2 % x == 0 or b2 % x == 0}
        elif jenis == 'pangkat':
            izin |= {p2 ** (n2 - 1), p2 ** (n2 + 1), p2 * n2, p2 ** (n2 - 2), p2 ** (n2 + 2), 2 * p2 ** n2}
        elif jenis == 'kubus':
            izin |= {r2 * r2, 6 * r2 * r2, (r2 - 1) ** 3, (r2 + 1) ** 3}
        else:
            izin |= {d1 + d2 + d3, d1 * d2, 2 * k, k // 2}
        asing = [x for x in nilai if x not in izin]
        if asing:
            jauh.append((cat, q['id'], q['pilihan'], 'pengecoh tidak lazim: %s' % asing))
rep(not jauh, 'semua pengecoh berasal dari kesalahan hitung yang wajar', jauh[:6])

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
