"""Telusuri titik putus statTopik(): apakah data soal, statistik, atau pemetaan topiknya yang kosong."""
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
        page.goto(url + '?telusur=1', wait_until='load', timeout=40000)
        page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
        page.evaluate('() => pastikanSemua()')
        page.wait_for_function('() => katSiapSemua()', timeout=60000)
        h = page.evaluate("""() => {
            startCat('tkw', 'learn');
            S.idx = 0; S.tSoalIdx = -1; render();
            const q = S.questions[0];
            pickAnswer((q.jawaban + 1) % 4);
            const st = statSoal();
            const semua = getAllSoal();
            const diSemua = semua.filter(x => x.id === q.id);
            return {
                idSoal: q.id,
                statAda: Object.keys(st),
                soalAdaDiGetAllSoal: diSemua.length,
                topikDiGetAllSoal: diSemua.length ? (diSemua[0].topik || '(kosong)') : '-',
                jumlahGetAllSoal: semua.length,
                soalPertamaDiSemua: semua.length ? (semua[0].id + '/' + (semua[0].topik || 'kosong')) : '-',
                jenisSoalSemuaLengkap: typeof semuaSoalLengkap,
                jumlahSemuaLengkap: (typeof semuaSoalLengkap === 'function') ? semuaSoalLengkap().length : '-',
                topikMentah: getAllSoal().slice(0, 3).map(x => x.id + ':' + (x.topik || 'kosong'))
            };
        }""")
        for k, v in h.items():
            print('%s: %s' % (k, v))
        b.close()
    httpd.shutdown()


if __name__ == '__main__':
    sys.exit(main())
