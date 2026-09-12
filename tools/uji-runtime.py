#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Uji runtime aplikasi di browser sungguhan (Playwright/Chromium).

Dipakai di CI (.github/workflows/uji-runtime.yml) dan bisa dijalankan lokal:
    python3 tools/uji-runtime.py

Yang diperiksa:
  - halaman termuat tanpa error JavaScript (pageerror / console error)
  - seluruh kategori bisa dibuka dan pembahasan muncul
  - semua gambar soal benar-benar ter-render
  - mode tryout mengunci kunci, simulasi format seleksi berjalan
  - mode hafalan, bank soal, dan halaman progress tampil
Keluar dengan kode 1 bila ada yang gagal.
"""
import functools
import http.server
import os
import socket
import socketserver
import sys
import threading
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

gagal = []


def cek(cond, label, detail=''):
    print(('  OK    ' if cond else '  GAGAL ') + '| ' + label + ((' -> ' + str(detail)[:300]) if detail else ''))
    if not cond:
        gagal.append(label)


def port_bebas():
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port


def jalankan_server(port):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)
    httpd.allow_reuse_address = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('playwright belum terpasang — jalankan: pip install playwright && playwright install chromium')
        return 2

    port = port_bebas()
    httpd = jalankan_server(port)
    url = 'http://127.0.0.1:%d/index.html' % port
    print('melayani', ROOT, 'di', url)

    kesalahan = []
    with sync_playwright() as p:
        browser = None
        for cara in (lambda: p.chromium.launch(channel='chrome'),   # pakai Chrome yang terpasang (lokal)
                     lambda: p.chromium.launch()):                  # pakai chromium bawaan playwright (CI)
            try:
                browser = cara()
                break
            except Exception as e:
                print('  (gagal meluncurkan browser: %s)' % str(e)[:90])
        if browser is None:
            print('tidak bisa meluncurkan browser — jalankan: playwright install chromium')
            httpd.shutdown()
            return 2
        page = browser.new_page(viewport={'width': 1200, 'height': 900})
        page.on('pageerror', lambda e: kesalahan.append('pageerror: %s' % e))
        page.on('console', lambda m: kesalahan.append('console: %s' % m.text)
                if m.type == 'error' and 'favicon' not in m.text.lower() else None)
        page.on('requestfailed', lambda r: None)

        page.goto(url, wait_until='load', timeout=30000)
        page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=20000)

        print('== 1. Halaman utama ==')
        total = page.evaluate('() => totalSoal()')
        cek(total >= 1000, 'index memuat jumlah soal', total)
        page.wait_for_function('() => typeof pastikanSemua === "function"', timeout=10000)
        page.evaluate('() => pastikanSemua()')
        page.wait_for_function('() => katSiapSemua()', timeout=30000)
        cek(True, 'seluruh kategori berhasil dimuat')

        print('== 2. Setiap kategori dapat dibuka ==')
        kategori = page.evaluate('() => daftarKategori()')
        for k in kategori:
            hasil = page.evaluate("""async (kat) => {
                startCat(kat, 'learn');
                const q = S.questions[S.idx];
                pickAnswer(q.jawaban);
                const b = document.querySelector('.explanation-body');
                return { n: S.questions.length, pb: b ? b.textContent.split('\\n').length : 0 };
            }""", k)
            cek(hasil['n'] > 0 and hasil['pb'] >= 2, 'kategori %s: %d soal, pembahasan %d baris' % (k, hasil['n'], hasil['pb']), hasil)

        print('== 3. Gambar soal ==')
        img = page.evaluate("""async () => {
            const imgs = getAllSoal().filter(s => s.gambar);
            const hasil = await Promise.all(imgs.map(s => new Promise(r => {
                const i = new Image(); i.onload = () => r(1); i.onerror = () => r(0); i.src = s.gambar;
            })));
            return { total: imgs.length, ok: hasil.reduce((a, b) => a + b, 0) };
        }""")
        cek(img['total'] > 0 and img['ok'] == img['total'], 'semua gambar ter-render (%d)' % img['total'], img)

        print('== 4. Mode tryout mengunci kunci ==')
        tout = page.evaluate("""() => {
            startCat('tkw', 'tryout');
            const q = S.questions[S.idx];
            pickAnswer((q.jawaban + 1) % 4);
            return {
                kunciTerkunci: S.tampilkanKunci === false,
                adaNotice: document.body.textContent.indexOf('Kunci dikunci selama tryout') >= 0
            };
        }""")
        cek(tout['kunciTerkunci'] and tout['adaNotice'], 'kunci tidak dibocorkan saat tryout', tout)

        print('== 5. Simulasi format seleksi ==')
        fmt = page.evaluate("""() => {
            startSimulasiFormat();
            const per = {};
            S.questions.forEach(x => { per[x.kategori] = (per[x.kategori] || 0) + 1; });
            return { jumlah: S.questions.length, kategori: Object.keys(per).length, detik: S.timeLeft };
        }""")
        cek(fmt['jumlah'] == 60 and fmt['kategori'] >= 6 and fmt['detik'] == 5400,
            'simulasi 60 soal, komposisi tetap, 90 menit', fmt)

        print('== 6. Mode hafalan & bank soal ==')
        haf = page.evaluate("""() => {
            bukaHafalan('semua');
            const adaKartu = !!document.querySelector('.flash-card');
            hafalBalik();
            const adaJawab = !!document.querySelector('.flash-jawab');
            return { kartu: HAF.daftar.length, adaKartu: adaKartu, adaJawab: adaJawab };
        }""")
        cek(haf['kartu'] > 0 and haf['adaKartu'] and haf['adaJawab'], 'kartu hafalan tampil dan bisa dibalik', haf)

        bank = page.evaluate("""() => {
            S.bankCat = 'all'; S.bankQuery = ''; S.page = 'bank'; render();
            return document.querySelectorAll('.bank-item').length;
        }""")
        cek(bank > 0, 'bank soal merender daftar', bank)

        print('== 7. Halaman progress ==')
        prog = page.evaluate("""() => {
            S.page = 'prog'; render();
            return {
                tren: document.body.textContent.indexOf('Tren nilai') >= 0 || document.body.textContent.indexOf('Mode offline') >= 0
            };
        }""")
        cek(prog['tren'], 'halaman progress menampilkan panel tren/offline', prog)

        print('== 8. Halaman tentang & topik ==')
        tentang = page.evaluate("""() => {
            bukaTentang();
            const adaVersi = document.body.textContent.indexOf('Versi aset') >= 0;
            const adaLihatSoal = document.body.textContent.indexOf('Jumlah soal') >= 0;
            S.bankCat = 'tkw'; S.bankQuery = ''; S.page = 'bank'; render();
            const chip = document.querySelectorAll('.chip').length;
            setTopikBank('tni-au');
            const setelah = document.querySelectorAll('.bank-item').length;
            drillTopik('tni-au', 25);
            return { adaVersi: adaVersi, adaLihatSoal: adaLihatSoal, chip: chip, saringHasil: setelah, topikDrill: S.questions.length };
        }""")
        cek(tentang['adaVersi'] and tentang['adaLihatSoal'], 'halaman tentang tampil', tentang)
        cek(tentang['chip'] > 2 and tentang['saringHasil'] > 0 and tentang['topikDrill'] == 25,
            'filter topik & drill topik berjalan', tentang)

        print('== 9. Mode offline (jaringan dimatikan) ==')
        try:
            page.goto(url, wait_until='load', timeout=30000)
            page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=20000)
            page.evaluate('() => pastikanSemua()')
            page.wait_for_function('() => katSiapSemua()', timeout=30000)
            page.wait_for_timeout(1500)          # beri waktu service worker menyimpan berkas
            page.context.set_offline(True)
            page.reload(wait_until='load', timeout=30000)
            offline = page.evaluate("""async () => {
                await pastikanSemua();
                startCat('tkw', 'learn');
                const q = S.questions[S.indexedDB ? S.idx : 0];
                pickAnswer(q.jawaban);
                const b = document.querySelector('.explanation-body');
                return { total: totalSoal(), soal: S.questions.length, pb: b ? b.textContent.split('\\n').length : 0 };
            }""")
            cek(offline['soal'] > 0 and offline['pb'] >= 2, 'aplikasi tetap jalan tanpa internet (dari cache)', offline)
        except Exception as e:
            cek(False, 'aplikasi tetap jalan tanpa internet (dari cache)', str(e)[:140])
        finally:
            page.context.set_offline(False)

        print('== 10. Aksesibilitas (axe-core) ==')
        try:
            page.goto(url, wait_until='load', timeout=30000)
            page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=20000)
            page.add_script_tag(path=os.path.join(ROOT, 'tools', 'axe.min.js'))
            page.evaluate("""async () => { await pastikanSemua(); startCat('tkw', 'learn'); }""")
            hasil_axe = page.evaluate("""async () => {
                const r = await axe.run(document, { resultTypes: ['violations'] });
                return r.violations.map(v => ({ id: v.id, impact: v.impact, jumlah: v.nodes.length,
                                                contoh: (v.nodes[0] && v.nodes[0].target) ? v.nodes[0].target.join(' ') : '' }));
            }""")
            berat = [v for v in hasil_axe if v['impact'] in ('critical', 'serious')]
            cek(not berat, 'tidak ada pelanggaran aksesibilitas berat (axe)', berat[:5])
            if hasil_axe:
                print('           catatan axe (ringan/menengah): %s' %
                      [('%s(%s,%d)' % (v['id'], v['impact'], v['jumlah'])) for v in hasil_axe][:8])
        except Exception as e:
            cek(False, 'pemeriksaan aksesibilitas axe berjalan', str(e)[:140])

        browser.close()

    print()
    cek(not kesalahan, 'tidak ada error JavaScript di seluruh pengujian', kesalahan[:5])
    httpd.shutdown()

    if gagal:
        print('HASIL: %d pemeriksaan GAGAL — %s' % (len(gagal), '; '.join(gagal)))
        return 1
    print('HASIL: UJI RUNTIME LULUS')
    return 0


if __name__ == '__main__':
    sys.exit(main())
