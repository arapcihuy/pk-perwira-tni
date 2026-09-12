"""Reproduksi terarah: cari jalur pengguna yang membuat aplikasi jatuh (renderSoal: 'pilihan' undefined)."""
import functools
import http.server
import os
import socket
import socketserver
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def port_bebas():
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    p = s.getsockname()[1]
    s.close()
    return p


def main():
    from playwright.sync_api import sync_playwright

    port = port_bebas()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/index.html' % port

    with sync_playwright() as p:
        browser = None
        for cara in (lambda: p.chromium.launch(channel='chrome'), lambda: p.chromium.launch()):
            try:
                browser = cara()
                break
            except Exception:
                continue
        page = browser.new_page(viewport={'width': 1200, 'height': 900})
        kesalahan = []
        page.on('pageerror', lambda e: kesalahan.append(str(e)[:200]))

        skenario = {
            'A. psikotes lalu belajar': """() => {
                startPsiTest('epps'); psiBackHome(); goHome();
                startCat('tkw', 'learn'); render();
                return { soal: S.questions.length, page: S.page, psiPage: PSI.page };
            }""",
            'B. psikotes lalu tryout': """() => {
                startPsiTest('kraepelin'); psiBackHome(); goHome();
                startCat('tkw', 'tryout'); render();
                return { soal: S.questions.length, page: S.page };
            }""",
            'C. psikotes (semua) lalu belajar': """() => {
                Object.keys(SOAL_PSIKOLOGI).forEach(k => startPsiTest(k));
                psiBackHome(); goHome();
                startCat('tkw', 'learn'); render();
                return { soal: S.questions.length, page: S.page };
            }""",
            'D. bank lalu belajar': """() => {
                navTo('bank'); S.bankCat = 'all'; render(); goHome();
                startCat('tkw', 'learn'); render();
                return { soal: S.questions.length, page: S.page };
            }""",
            'E. render tanpa soal (langsung)': """() => {
                goHome();
                S.page = 'learn'; S.questions = []; S.idx = 0; render();
                return { soal: 0, page: S.page };
            }""",
            'F. tips lalu belajar': """() => {
                navTo('tips'); render(); goHome();
                startCat('matematika', 'learn'); render();
                return { soal: S.questions.length, page: S.page };
            }""",
        }

        for nama, kode in skenario.items():
            page.goto(url + '?repro=1', wait_until='load', timeout=40000)
            page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
            page.evaluate('() => pastikanSemua()')
            page.wait_for_function('() => katSiapSemua()', timeout=60000)
            kesalahan.clear()
            try:
                hasil = page.evaluate(kode)
                keadaan = 'OK  ' if not kesalahan else 'JATUH'
                print('%s | %-34s | %s' % (keadaan, nama, hasil))
            except Exception as e:
                print('JATUH | %-34s | %s' % (nama, str(e).splitlines()[0][:120]))
            if kesalahan:
                print('        pesan halaman: %s' % kesalahan[0][:160])

        print()
        print('=== isi halaman Progress (untuk memeriksa panel yang dicari) ===')
        page.goto(url + '?prog=1', wait_until='load', timeout=40000)
        page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
        page.evaluate('() => { pastikanSemua(); }')
        page.wait_for_function('() => katSiapSemua()', timeout=60000)
        teks = page.evaluate("""() => { navTo('prog'); return document.body.innerText; }""")
        judul = [b.strip() for b in teks.splitlines() if b.strip() and len(b.strip()) < 60]
        kata_kunci = ['Kraepelin', 'Laporan', 'Salah', 'Sinkron', 'Offline', 'Target', 'Rapor', 'Tren']
        for k in kata_kunci:
            cocok = [j for j in judul if k.lower() in j.lower()]
            print('  %-10s -> %s' % (k, cocok[:3] if cocok else '(TIDAK ADA)'))
        browser.close()
    httpd.shutdown()


if __name__ == '__main__':
    sys.exit(main())
