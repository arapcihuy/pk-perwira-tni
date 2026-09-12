#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cap versi aset aplikasi (cache-busting) pada index.html dan sw.js.

Pakai:  python3 tools/stamp-versi.py <versi>
Contoh: python3 tools/stamp-versi.py 36ad3cd

Dipakai otomatis oleh .github/workflows/versi.yml supaya penanda versi
tidak perlu dinaikkan manual setiap kali deploy.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    if len(sys.argv) < 2:
        print('pakai: python3 tools/stamp-versi.py <versi>')
        return 2
    versi = re.sub(r'[^A-Za-z0-9\.\-]', '', sys.argv[1])
    if not versi:
        print('versi kosong setelah dibersihkan')
        return 2

    berubah = []
    for nama in ('index.html', 'sw.js'):
        path = os.path.join(ROOT, nama)
        s = open(path, encoding='utf-8').read()
        s2 = re.sub(r'\?v=[A-Za-z0-9\.\-]+', '?v=' + versi, s)
        s2 = re.sub(r'v=([A-Za-z0-9\.\-]+)([\'"])', r'v=' + versi + r'\2', s2)
        # nama cache service worker: pertahankan merek di depannya, perbarui versinya
        s2 = re.sub(r"(CACHE\s*=\s*')([A-Za-z0-9\.\-]+)(-[A-Za-z0-9\.\-]+)(')",
                    r"\g<1>\g<2>-" + versi + r"\g<4>", s2)
        s2 = re.sub(r'tni-perwira-[A-Za-z0-9\.\-]+', 'tni-perwira-v' + versi, s2)
        if s2 != s:
            open(path, 'w', encoding='utf-8').write(s2)
            berubah.append(nama)
    print('versi dipasang:', versi, '| file diubah:', ', '.join(berubah) if berubah else 'tidak ada')
    return 0


if __name__ == '__main__':
    sys.exit(main())
