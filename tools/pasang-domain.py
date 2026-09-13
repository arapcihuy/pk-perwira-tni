#!/usr/bin/env python3
"""Pindahkan situs ke domain sendiri (dijalankan SETELAH domain dibeli & DNS diarahkan).

Yang dikerjakan:
  1. Menulis berkas CNAME di akar repositori (syarat GitHub Pages untuk domain sendiri).
  2. Mengganti alamat lama (arapcihuy.github.io/pk-perwira-tni) dengan domain baru pada:
     halaman arahan, halaman privasi/syarat/mutu, sitemap.xml, robots.txt, index.html (kanonik & og).
  3. Menyalakan custom domain di GitHub Pages + HTTPS paksa (lewat gh api).
  4. Memeriksa DNS sudah mengarah ke GitHub Pages sebelum dianggap berhasil.

Contoh:
  /usr/bin/python3 tools/pasang-domain.py --domain siappsikotes.com
  /usr/bin/python3 tools/pasang-domain.py --domain siappsikotes.com --uji-saja
"""
import argparse
import json
import os
import re
import subprocess
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAMA = 'https://arapcihuy.github.io/pk-perwira-tni'
LAMA_TANPA_SKEMA = 'arapcihuy.github.io/pk-perwira-tni'

BERKAS = [
    'index.html', '404.html', 'sw.js',
    'psikotes/index.html', 'privasi/index.html', 'syarat/index.html', 'mutu/index.html',
    'sitemap.xml', 'robots.txt', 'PEDOMAN-MUTU-SOAL.md',
]


def jalankan(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def cek_dns(domain):
    ip = []
    for tipe in ('A', 'CNAME'):
        _, out = jalankan('dig +short %s %s' % (tipe, domain))
        ip += [x.strip() for x in out.splitlines() if x.strip()]
    siap = any(x.startswith('185.199.') for x in ip) or any('github.io' in x for x in ip)
    return siap, ip


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--domain', required=True, help='domain final, mis. siappsikotes.com')
    ap.add_argument('--uji-saja', action='store_true', help='hanya periksa DNS, jangan ubah berkas')
    ap.add_argument('--lewati-dns', action='store_true', help='ubah berkas tanpa menunggu DNS')
    a = ap.parse_args()

    domain = a.domain.strip().lower().replace('https://', '').replace('http://', '').rstrip('/')
    baru = 'https://' + domain
    print('domain baru :', baru)

    siap, ip = cek_dns(domain)
    print('DNS sekarang:', ip if ip else '(belum ada)')
    if not siap and not a.lewati_dns:
        print('\nBELUM SIAP: DNS belum mengarah ke GitHub Pages.')
        print('Tambahkan di panel DNS domainmu:')
        print('  A @ 185.199.108.153 / .109.153 / .110.153 / .111.153')
        print('  CNAME www -> arapcihuy.github.io')
        print('Tunggu 10 menit - 2 jam, lalu jalankan lagi. (Paksa: --lewati-dns)')
        return 2

    diubah = []
    if not a.uji_saja:
        for rel in BERKAS:
            p = os.path.join(APP, rel)
            if not os.path.exists(p):
                continue
            s = open(p, encoding='utf-8').read()
            if LAMA not in s and LAMA_TANPA_SKEMA not in s:
                continue
            s2 = s.replace(LAMA, baru).replace(LAMA_TANPA_SKEMA, domain)
            if s2 != s:
                open(p, 'w', encoding='utf-8').write(s2)
                diubah.append(rel)
        with open(os.path.join(APP, 'CNAME'), 'w', encoding='utf-8') as f:
            f.write(domain + '\n')
        diubah.append('CNAME (baru)')
        print('\nberkas diubah:')
        for x in diubah:
            print('  -', x)

    # GitHub Pages: pasang domain + HTTPS paksa
    kode, keluar = jalankan('gh api -X PUT repos/arapcihuy/pk-perwira-tni/pages -f cname=%s' % domain)
    print('\npasang custom domain di GitHub Pages:', 'BERHASIL' if kode == 0 else 'GAGAL')
    if kode != 0:
        print(keluar.strip()[:400])
    else:
        kode2, keluar2 = jalankan('gh api -X PUT repos/arapcihuy/pk-perwira-tni/pages -F https_enforced=true')
        print('HTTPS paksa:', 'BERHASIL' if kode2 == 0 else 'GAGAL (coba lagi setelah sertifikat terbit)')

    print('\nLangkah berikutnya (saya jalankan, atau kamu minta saya):')
    print('  1. Tunggu sertifikat HTTPS terbit (5-30 menit).')
    print('  2. Verifikasi: bash tools/kirim.sh  lalu periksa ulang situs di', baru)
    return 0


if __name__ == '__main__':
    sys.exit(main())
