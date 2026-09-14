#!/usr/bin/env python3
"""Audit menyeluruh situs SiapPsikotes: halaman, meta, tautan dalam, sisa alamat lama, ukuran.

Memeriksa situs live. Tidak mengubah apa pun.
Pakai: /usr/bin/python3 tools/audit-situs.py [--lokal]
"""
import os
import re
import sys
import urllib.request
import urllib.error

LIVE = 'https://siappsikotes.my.id'
LIVE_HTTP = 'http://siappsikotes.my.id'
LOKAL = 'http://127.0.0.1:8801'
if '--lokal' in sys.argv:
    DASAR = LOKAL
elif '--http' in sys.argv:
    DASAR = LIVE_HTTP      # dipakai selama sertifikat HTTPS belum terbit
else:
    DASAR = LIVE

HALAMAN = ['', 'psikotes/', 'beli/', 'contoh/', 'mutu/', 'syarat/', 'privasi/',
           'manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml',
           '.well-known/security.txt', '404.html']

HARUS_ADA_META = ['<title', 'name="description"', 'rel="canonical"', 'name="viewport"',
                  'property="og:title"', 'property="og:image"', 'name="twitter:card"']


def ambil(url, metode='GET'):
    req = urllib.request.Request(url, method=metode, headers={'User-Agent': 'audit-hermes/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status, r.read().decode('utf-8', 'replace'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, '', {}
    except Exception as e:
        return 0, str(e), {}


def main():
    print('=== 1. Keadaan tiap halaman (%s) ===' % DASAR)
    isi = {}
    gagal = []
    for h in HALAMAN:
        url = DASAR + '/' + h
        kode, teks, kepala = ambil(url)
        isi[h] = teks
        ukuran = len(teks)
        tanda = 'OK  ' if kode == 200 else 'GAGAL'
        print('  %-5s %-26s %s  %.1f KB' % (tanda, '/' + h, kode, ukuran / 1024.0))
        if kode != 200:
            gagal.append((h, kode))
        if h.endswith('/') and h != '':
            pass

    print()
    print('=== 2. Kelengkapan meta pada halaman HTML ===')
    for h in [x for x in HALAMAN if x == '' or x.endswith('/')]:
        t = isi.get(h, '')
        kurang = [m for m in HARUS_ADA_META if m not in t]
        status = 'lengkap' if not kurang else 'KURANG: ' + ', '.join(kurang)
        print('  %-16s %s' % ('/' + h, status))

    print()
    print('=== 3. Tautan dalam: apakah ada yang menuju halaman tidak ada ===')
    semua_tautan = set()
    for h in [x for x in HALAMAN if x == '' or x.endswith('/')]:
        for m in re.finditer(r'(?:href|src)="([^"]+)"', isi.get(h, '')):
            u = m.group(1)
            if u.startswith(('http://', 'https://', 'mailto:', 'data:', '#')):
                continue
            semua_tautan.add((h, u.split('#')[0].split('?')[0]))
    rusak = []
    for asal, u in sorted(semua_tautan):
        if not u or u.startswith('..'):
            # relatif: ubah ke absolut
            basis = DASAR + '/' + asal
            u_abs = os.path.normpath(os.path.join(basis, u)).replace('http:/', 'http://').replace('https:/', 'https://')
        elif u.startswith('/'):
            u_abs = DASAR + u
        else:
            u_abs = DASAR + '/' + asal.rstrip('/') + '/' + u if asal else DASAR + '/' + u
        kode, _, _ = ambil(u_abs, 'HEAD')
        if kode >= 400 or kode == 0:
            rusak.append((asal or '/', u, kode))
    if rusak:
        for r in rusak[:25]:
            print('  RUSAK  %-14s -> %-40s %s' % r)
    else:
        print('  semua tautan dalam yang diperiksa hidup (%d tautan)' % len(semua_tautan))

    print()
    print('=== 4. Sisa alamat lama / campuran http ===')
    for h in [x for x in HALAMAN if x == '' or x.endswith('/')]:
        t = isi.get(h, '')
        temuan = []
        if 'arapcihuy.github.io' in t:
            temuan.append('alamat github.io masih ada')
        if re.search(r'src="http://|href="http://siappsikotes', t):
            temuan.append('rujukan http:// (campuran)')
        if 'pk-perwira-tni' in t:
            temuan.append('nama lama pk-perwira-tni')
        print('  %-16s %s' % ('/' + h, '; '.join(temuan) if temuan else 'bersih'))

    print()
    print('=== 5. Ringkasan ===')
    print('  halaman gagal diakses : %s' % (gagal if gagal else 'tidak ada'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
