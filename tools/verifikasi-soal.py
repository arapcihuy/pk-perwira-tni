#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifikasi bank soal PK Perwira — dijalankan otomatis di CI tiap push.

Tanpa dependensi luar. Keluar dengan kode 1 kalau ada pemeriksaan yang gagal.
Pakai:  python3 tools/verifikasi-soal.py
"""
import base64
import collections
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from fractions import Fraction as F
from math import gcd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOAL = os.path.join(ROOT, 'data', 'soal.js')

gagal = []


def cek(cond, label, detail=''):
    print(('  OK    ' if cond else '  GAGAL ') + '| ' + label + ((' -> ' + str(detail)[:300]) if detail else ''))
    if not cond:
        gagal.append(label)


def baca_db():
    raw = open(SOAL, encoding='utf-8').read()
    i = raw.index('{', raw.index('SOAL_DATABASE'))
    depth = 0
    for n, ch in enumerate(raw[i:]):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return json.loads(raw[i:i + n + 1]), raw
    raise SystemExit('SOAL_DATABASE tidak ketemu di data/soal.js')


def lcm(a, b):
    return a * b // gcd(a, b)


SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')


def nilai_opsi(s):
    s = s.strip()
    m = re.match(r'^Rp([\d\.]+)$', s)
    if m:
        return F(int(m.group(1).replace('.', '')))
    m = re.match(r'^(-?\d+)\s*/\s*(-?\d+)$', s)
    if m and int(m.group(2)) != 0:
        return F(int(m.group(1)), int(m.group(2)))
    m = re.match(r'^(\d+),(\d+)$', s)
    if m:
        return F(int(m.group(1) + m.group(2)), 10 ** len(m.group(2)))
    m = re.match(r'^(\d+)\.(\d+)$', s)
    if m:
        return F(int(m.group(1) + m.group(2)), 10 ** len(m.group(2)))
    # hanya opsi yang benar-benar angka (angka murni atau angka + satuan)
    m = re.match(r'^(\d+(?:[.,]\d+)?)\s*[a-zA-Z°³²/]', s)
    if m:
        return F(m.group(1).replace(',', '.'))
    m = re.match(r'^(\d+(?:[.,]\d+)?)$', s)
    if m:
        return F(m.group(1).replace(',', '.'))
    return None


def hitung(t):
    t = t.strip()
    if not t.endswith('...'):
        return None
    core = t[:-3].strip().rstrip('= ').strip()
    core = core.replace('×', '*').replace('÷', '/')
    core = re.sub(r'√\s*(\d+)', lambda m: 'math.isqrt(%s)' % m.group(1), core)
    core = re.sub(r'Akar dari\s*(\d+)', lambda m: 'math.isqrt(%s)' % m.group(1), core)
    bersih = core.replace('math.isqrt', '').replace('(', '').replace(')', '').replace(',', '.')
    if re.match(r'^[\d\s\+\-\*/\.]*$', bersih):
        try:
            return F(eval(core, {'math': math, '__builtins__': {}})).limit_denominator(10 ** 6)
        except Exception:
            return None
    m = re.match(r'^(\d+)\s*%\s*dari\s*(\d+)(?:\s*\+\s*(\d+)\s*%\s*dari\s*(\d+))?\s*$', core)
    if m:
        v = int(m.group(1)) * int(m.group(2)) / 100
        if m.group(3):
            v += int(m.group(3)) * int(m.group(4)) / 100
        return F(v)
    m = re.match(r'^(FPB|KPK)\s*dari\s*(\d+)\s*dan\s*(\d+)$', core)
    if m:
        a, b = int(m.group(2)), int(m.group(3))
        return F(gcd(a, b) if m.group(1) == 'FPB' else lcm(a, b))
    m = re.match(r'^(\d)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$', core)
    if m:
        return F(int(m.group(1)) ** int(m.group(2).translate(SUP)))
    return None


def main():
    db, raw = baca_db()
    soal = [q for v in db.values() for q in v['soal']]
    print('== 1. Struktur ==')
    cek(len(soal) >= 1000, 'jumlah soal minimal 1000', len(soal))
    cek(len(db) == 9, 'jumlah kategori = 9', len(db))
    ids = [q['id'] for q in soal]
    cek(len(set(ids)) == len(ids), 'id unik', '%d id untuk %d soal' % (len(set(ids)), len(ids)))
    cek(all(0 <= q['jawaban'] < len(q['pilihan']) for q in soal), 'semua indeks kunci valid')
    cek(all(len(q['pilihan']) == 4 for q in soal), 'setiap soal 4 opsi')
    cek(all(str(q['pertanyaan']).strip() for q in soal), 'semua pertanyaan terisi')
    cek(all(str(q['pembahasan']).strip() for q in soal), 'semua pembahasan terisi')

    print('== 2. Hitung ulang soal aritmetika ==')
    salah, diuji = [], 0
    for q in soal:
        t = str(q['pertanyaan'])
        if '...' not in t:
            continue
        harap = hitung(t)
        if harap is None:
            continue
        kunci = q['pilihan'][q['jawaban']]
        if re.search(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]', kunci):
            continue
        dapat = nilai_opsi(kunci)
        diuji += 1
        if dapat is not None and dapat != harap:
            salah.append((q['id'], t[:50], kunci, str(harap)))
    cek(not salah, 'semua soal hitung cocok dengan kuncinya (%d diuji otomatis)' % diuji, salah[:6])

    print('== 3. Kraepelin: kunci = satuan hasil penjumlahan ==')
    kb = []
    for q in db.get('kraepelin', {}).get('soal', []):
        m = re.match(r'^(?:Berapa hasil:?\s*)?(\d+)\s*\+\s*(\d+)', q['pertanyaan'])
        if not m:
            m = re.search(r'menjumlahkan (\d+)\s*\+\s*(\d+)', q['pertanyaan'])
        if not m:
            continue
        a, b = int(m.group(1)), int(m.group(2))
        s = a + b
        benar = str(s % 10) if s >= 10 else str(s)
        if q['pilihan'][q['jawaban']] != benar:
            kb.append((q['id'], '%d+%d' % (a, b), q['pilihan'][q['jawaban']], benar))
    cek(not kb, 'semua soal Kraepelin angka cocok dengan aturan satuan', kb)

    print('== 4. Opsi tidak ada yang bernilai sama ==')
    amb = []
    for q in soal:
        seen = collections.defaultdict(list)
        for p in q['pilihan']:
            if re.search(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]', p):
                continue
            k = nilai_opsi(p)
            if k is None:
                continue
            if re.search(r'[a-zA-Z]', p) and not p.startswith('Rp') and not re.match(r'^-?\d+\s*/\s*-?\d+$', p.strip()):
                continue
            seen[k].append(p)
        for k, ps in seen.items():
            if len(set(ps)) > 1:
                amb.append((q['id'], ps))
    cek(not amb, 'tidak ada dua opsi bernilai sama', amb[:6])

    print('== 5. Tidak ada soal duplikat ==')
    grupd = collections.defaultdict(list)
    for q in soal:
        grupd[(' '.join(str(q['pertanyaan']).lower().split()),
               tuple(sorted(q['pilihan'])), q['pilihan'][q['jawaban']])].append(q['id'])
    dupd = [ids for ids in grupd.values() if len(ids) > 1]
    cek(not dupd, 'tidak ada dua soal yang isinya sama persis', dupd[:5])

    print('== 6. Format pembahasan ==')
    cek(all(str(q['pembahasan']).startswith('JAWABAN: ') for q in soal), 'semua pembahasan diawali "JAWABAN:"')
    cek(all(q['pilihan'][q['jawaban']] in q['pembahasan'] for q in soal), 'kunci disebut di pembahasan')
    cek(all(len(str(q['pembahasan']).split('\n')) >= 2 for q in soal), 'ada baris penjelasan cara/langkah')
    pendek = [q['id'] for q in soal if len(str(q['pembahasan'])) < 40]
    cek(not pendek, 'tidak ada pembahasan terlalu pendek', pendek[:5])

    print('== 7. Gambar soal ==')
    rusak = []
    for q in soal:
        g = q.get('gambar')
        if not g:
            continue
        try:
            svg = base64.b64decode(g.split(',', 1)[1]).decode()
            ET.fromstring(svg)
            if '<svg' not in svg:
                rusak.append((q['id'], 'bukan svg'))
        except Exception as e:
            rusak.append((q['id'], str(e)[:40]))
    cek(not rusak, 'semua gambar soal valid', rusak[:5])


    print('== 7b. Kraepelin kolom angka: kunci harus cocok dengan angka di gambar ==')
    kk = []
    for q in db.get('kraepelin', {}).get('soal', []):
        t = str(q['pertanyaan'])
        if not re.match(r'^k1\d\d$', q['id']) or not q.get('gambar'):
            continue           # hanya soal kolom angka v23 (k101-k115)
        m = re.search(r'kolom angka (\d) pada gambar.*?angka ke-(\d) dan ke-(\d)', t, re.S)
        if not m:
            kk.append((q['id'], 'pola pertanyaan tidak dikenali'))
            continue
        kolom, p1 = int(m.group(1)), int(m.group(2))
        try:
            svg = base64.b64decode(q['gambar'].split(',', 1)[1]).decode()
        except Exception as e:
            kk.append((q['id'], 'gambar tidak terbaca'))
            continue
        angka = [int(x) for x in re.findall(r"font-size='18'[^>]*>(\d)<", svg)]
        if len(angka) != 18:
            kk.append((q['id'], 'jumlah angka di gambar = %d (seharusnya 18)' % len(angka)))
            continue
        isi = angka[(kolom - 1) * 6: kolom * 6]
        a, b = isi[p1 - 1], isi[p1]
        harap = str((a + b) % 10)
        if q['pilihan'][q['jawaban']] != harap:
            kk.append((q['id'], 'kunci %s, seharusnya %s (%d+%d)' % (q['pilihan'][q['jawaban']], harap, a, b)))
    cek(not kk, 'semua soal Kraepelin kolom cocok dengan angka di gambarnya', kk[:5])

    print('== 7c. Kelengkapan gambar pada Tes Gambar ==')
    tg_tanpa = [q['id'] for q in db.get('tes_gambar', {}).get('soal', []) if not q.get('gambar')]
    cek(not tg_tanpa, 'semua soal Tes Gambar punya gambar', tg_tanpa[:8])


    print('== 7d. Kunci soal Tes Gambar dihitung ulang dari gambarnya ==')
    try:
        import importlib.util as _ilu
        _spec = _ilu.spec_from_file_location('vg', os.path.join(ROOT, 'tools', 'verifikasi-gambar.py'))
        _vg = _ilu.module_from_spec(_spec)
        _spec.loader.exec_module(_vg)
        _temuan = _vg.periksa_semua(db)
        _jumlah = sum(1 for q in db.get('tes_gambar', {}).get('soal', []) if _vg.periksa(q)[0] is not None)
        cek(not _temuan, 'kunci Tes Gambar cocok dengan isi gambarnya (%d soal diperiksa otomatis)' % _jumlah, _temuan[:5])
    except Exception as e:
        cek(False, 'pemeriksaan gambar berjalan', str(e)[:140])

    print('== 8. Versi aset konsisten ==')
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
    v_html = sorted(set(re.findall(r'\?v=([A-Za-z0-9\.\-]+)', html)))
    v_sw = sorted(set(re.findall(r'\?v=([A-Za-z0-9\.\-]+)', sw)))
    v_cache = re.findall(r"CACHE\s*=\s*'([^']+)'", sw)
    cek(len(v_html) == 1, 'index.html memakai satu versi aset', v_html)
    cek(set(v_html) == set(v_sw), 'versi di index.html sama dengan sw.js', (v_html, v_sw))
    # maksud pemeriksaan: nama cache WAJIB memuat versi aset yang sedang dipakai, supaya
    # perangkat pengguna membuang cache lama. Merek di depan nama cache bebas.
    versi_cache = [c.rsplit('-', 1)[-1].lstrip('vV') for c in v_cache]
    cek(versi_cache and versi_cache[0] in v_html, 'nama cache service worker memuat versi aset', v_cache)

    print()
    if gagal:
        print('HASIL: %d pemeriksaan GAGAL — %s' % (len(gagal), '; '.join(gagal)))
        sys.exit(1)
    print('HASIL: SEMUA VERIFIKASI LULUS (%d soal, %d kategori)' % (len(soal), len(db)))


if __name__ == '__main__':
    main()
