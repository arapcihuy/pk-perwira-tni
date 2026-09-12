#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Smoke test situs live PK Perwira: memastikan yang tayang benar-benar sehat.

Dipakai workflow terjadwal (.github/workflows/terjadwal.yml) dan bisa dijalankan manual:
    python3 tools/uji-situs-live.py

Memeriksa: index.html, konsistensi versi aset, data index, file kategori, skrip utama,
manifest/service worker. Bila Playwright tersedia, dilanjutkan memuat situs di Chromium
dan menghitung error JavaScript + gambar yang gagal render.
"""
import os
import re
import sys
import urllib.request

BASE = os.environ.get('SITUS', 'https://arapcihuy.github.io/pk-perwira-tni')
gagal = []


def cek(cond, label, detail=''):
    print(('  OK    ' if cond else '  GAGAL ') + '| ' + label + ((' -> ' + str(detail)[:200]) if detail else ''))
    if not cond:
        gagal.append(label)


def ambil(path):
    url = BASE + '/' + path.lstrip('/')
    req = urllib.request.Request(url, headers={'User-Agent': 'pemeriksa-pk-perwira/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode('utf-8', 'replace')


def main():
    print('memeriksa:', BASE)
    try:
        status, html = ambil('index.html')
    except Exception as e:
        print('GAGAL mengambil index.html:', e)
        return 1
    cek(status == 200, 'index.html dapat diakses', status)

    versi = re.findall(r'\?v=([A-Za-z0-9\.\-]+)', html)
    unik = sorted(set(versi))
    cek(len(unik) == 1, 'semua aset memakai satu versi', unik)
    v = unik[0] if unik else ''
    print('           versi tayang:', v)

    for nama, penanda in [
        ('data/soal-index.js?v=%s' % v, 'DATA_SOAL_INDEX'),
        ('data/tips.js?v=%s' % v, 'TIPS_DATA'),
        ('static/js/data-loader.js?v=%s' % v, 'pastikanSemua'),
        ('static/js/app.js?v=%s' % v, 'SOAL_DATABASE'),
        ('static/js/fitur5.js?v=%s' % v, 'ringkasanHafalan'),
        ('sw.js?v=%s' % v, 'CACHE'),
        ('manifest.json', 'name'),
    ]:
        try:
            st, isi = ambil(nama)
            cek(st == 200 and penanda in isi, 'berkas %s memuat %s' % (nama.split('?')[0], penanda), st)
        except Exception as e:
            cek(False, 'berkas %s dapat diambil' % nama.split('?')[0], str(e)[:120])

    try:
        st, idx = ambil('data/soal-index.js?v=%s' % v)
        m = re.search(r'"total":\s*(\d+)', idx) or re.search(r'total\s*=\s*(\d+)', idx)
        total = int(m.group(1)) if m else 0
        cek(total >= 1000, 'jumlah soal pada index live', total)
        for kat in ['tkw', 'matematika', 'numerik', 'tes_gambar', 'kepribadian']:
            st2, isi2 = ambil('data/soal-%s.js?v=%s' % (kat, v))
            cek(st2 == 200 and 'SOAL_PART' in isi2, 'data kategori %s tersedia' % kat, st2)
    except Exception as e:
        cek(False, 'data kategori dapat diambil', str(e)[:120])

    # muat di Chromium bila Playwright ada (bagian paling meyakinkan)
    try:
        from playwright.sync_api import sync_playwright
        kesalahan = []
        with sync_playwright() as p:
            browser = None
            for cara in (lambda: p.chromium.launch(channel='chrome'), lambda: p.chromium.launch()):
                try:
                    browser = cara()
                    break
                except Exception:
                    continue
            if browser is None:
                print('  (Playwright tidak bisa meluncurkan browser — bagian ini dilewati)')
            else:
                page = browser.new_page()
                page.on('pageerror', lambda e: kesalahan.append('pageerror: %s' % e))
                page.on('console', lambda m: kesalahan.append('console: %s' % m.text)
                        if m.type == 'error' and 'favicon' not in m.text.lower() else None)
                page.goto(BASE + '/index.html?smo=1', wait_until='load', timeout=45000)
                page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
                page.evaluate('() => pastikanSemua()')
                page.wait_for_function('() => katSiapSemua()', timeout=60000)
                hasil = page.evaluate("""async () => {
                    const imgs = getAllSoal().filter(s => s.gambar);
                    const ok = await Promise.all(imgs.map(s => new Promise(r => {
                        const i = new Image(); i.onload = () => r(1); i.onerror = () => r(0); i.src = s.gambar;
                    })));
                    startCat('tkw', 'learn');
                    const q = S.questions[S.idx];
                    pickAnswer(q.jawaban);
                    const b = document.querySelector('.explanation-body');
                    return { total: totalSoal(), gambar: imgs.length, gambarOK: ok.reduce((a, b) => a + b, 0),
                             pb: b ? b.textContent.split('\\n').length : 0, ringkasan: typeof ringkasanHafalan === 'function' };
                }""")
                cek(hasil['total'] >= 1000, 'soal termuat di situs live', hasil['total'])
                cek(hasil['gambarOK'] == hasil['gambar'], 'semua gambar live ter-render',
                    '%s/%s' % (hasil['gambarOK'], hasil['gambar']))
                cek(hasil['pb'] >= 2, 'pembahasan tampil di situs live', hasil['pb'])
                cek(not kesalahan, 'tidak ada error JavaScript di situs live', kesalahan[:3])
                browser.close()
    except ImportError:
        print('  (Playwright tidak terpasang — hanya pemeriksaan HTTP yang dijalankan)')

    print()
    if gagal:
        print('HASIL: %d pemeriksaan GAGAL — %s' % (len(gagal), '; '.join(gagal)))
        return 1
    print('HASIL: SITUS LIVE SEHAT')
    return 0


if __name__ == '__main__':
    sys.exit(main())
