"""Cek kenapa statTopik() kosong setelah menjawab soal."""
import functools
import http.server
import os
import socket
import socketserver
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    from playwright.sync_api import sync_playwright
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/index.html' % port

    with sync_playwright() as p:
        b = None
        for cara in (lambda: p.chromium.launch(channel='chrome'), lambda: p.chromium.launch()):
            try:
                b = cara()
                break
            except Exception:
                continue
        page = b.new_page()
        err = []
        page.on('pageerror', lambda e: err.append(str(e)[:150]))
        page.goto(url + '?stat=1', wait_until='load', timeout=40000)
        page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
        page.evaluate('() => pastikanSemua()')
        page.wait_for_function('() => katSiapSemua()', timeout=60000)
        hasil = page.evaluate("""() => {
            startCat('tkw', 'learn');
            S.idx = 0; S.tSoalIdx = -1; render();
            const q = S.questions[0];
            pickAnswer((q.jawaban + 1) % 4);
            const kunci = Object.keys(localStorage).filter(k => k.indexOf('tni_') === 0);
            return {
                idSoal: q.id, topikSoal: q.topik || '(kosong)',
                statSoalIsi: (localStorage.getItem('tni_stat_soal') || '').slice(0, 90),
                statSemuaIsi: (localStorage.getItem('tni_stat_all') || '').slice(0, 90),
                panjangStatTopik: statTopik().length,
                isiStatTopik: statTopik().slice(0, 3),
                kunciPenyimpanan: kunci,
                adaFungsi: { semuaStat: typeof semuaStat, statSoal: typeof statSoal, statSoalSemua: typeof statSoalSemua },
            };
        }""")
        for k, v in hasil.items():
            print('%s: %s' % (k, v))
        print('error halaman:', err[:2])
        b.close()
    httpd.shutdown()


if __name__ == '__main__':
    sys.exit(main())
