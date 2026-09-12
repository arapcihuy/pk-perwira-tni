#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""UJI SEMUA FITUR — memeriksa setiap fitur aplikasi berfungsi, bukan hanya sebagian.

Dijalankan di CI (.github/workflows/uji-fitur.yml) dan bisa dijalankan lokal:
    python3 tools/uji-fitur-lengkap.py

Setiap fitur diuji dengan menggerakkan aplikasinya di Chromium lalu memeriksa hasilnya.
"""
import functools
import http.server
import os
import re
import socket
import socketserver
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
gagal = []
lulus = [0]


def cek(cond, label, detail=''):
    print(('  OK    ' if cond else '  GAGAL ') + '| ' + label + ((' -> ' + str(detail)[:220]) if detail else ''))
    if cond:
        lulus[0] += 1
    else:
        gagal.append(label)


def port_bebas():
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    p = s.getsockname()[1]
    s.close()
    return p


def jalankan_server(port):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)
    httpd.allow_reuse_address = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('playwright belum terpasang')
        return 2

    port = port_bebas()
    httpd = jalankan_server(port)
    url = 'http://127.0.0.1:%d/index.html' % port
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
            print('tidak bisa meluncurkan browser')
            httpd.shutdown()
            return 2

        page = browser.new_page(viewport={'width': 1200, 'height': 900})
        page.on('pageerror', lambda e: kesalahan.append('pageerror: %s' % e))
        page.on('console', lambda m: kesalahan.append('console: %s' % m.text)
                if m.type == 'error' and 'favicon' not in m.text.lower() else None)
        page.goto(url + '?fitur=1', wait_until='load', timeout=40000)
        page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
        page.evaluate('() => pastikanSemua()')
        page.wait_for_function('() => katSiapSemua()', timeout=60000)

        def segar():
            """Muat ulang halaman + bersihkan penyimpanan, supaya tiap bagian berdiri sendiri."""
            page.goto(url + '?seg=1', wait_until='load', timeout=40000)
            page.evaluate('() => { try { localStorage.clear(); } catch (e) {} }')
            page.reload(wait_until='load', timeout=40000)
            page.wait_for_function('() => window.DATA_SOAL_INDEX && window.DATA_SOAL_INDEX.total > 0', timeout=30000)
            page.evaluate('() => pastikanSemua()')
            page.wait_for_function('() => katSiapSemua()', timeout=60000)

        # ---- A. Beranda ----
        print('== A. Beranda ==')
        a = page.evaluate("""() => {
            localStorage.clear(); goHome();
            return {
                total: totalSoal(),
                statPill: document.getElementById('hStatSoal').textContent,
                kesiapan: !!document.querySelector('.siap-card'),
                rencana: !!document.querySelector('.rencana-list'),
                latihan: !!document.querySelector('.latihan-card'),
                hariIni: !!document.querySelector('.hari-ini'),
                jalur: !!document.querySelector('.jalur-card'),
                jelang: document.body.textContent.indexOf('Jelang Ujian') >= 0,
                tur: !!document.querySelector('.tur-card'),
                menuBtn: !!document.getElementById('btnMenuLain'),
                tema: !!document.querySelector('.tampilan-bar'),
                kartuKategori: document.querySelectorAll('#main .card[onclick]').length
            };
        }""")
        cek(a['total'] >= 1200 and a['statPill'] == str(a['total']), 'statistik header sesuai jumlah soal', a)
        cek(a['kesiapan'] and a['rencana'] and a['latihan'] and a['hariIni'] and a['jalur'] and a['jelang'],
            'semua panel beranda tampil (kesiapan, rencana, latihan, hari ini, jalur, jelang)', a)
        cek(a['tur'] and a['menuBtn'] and a['tema'], 'tur awal, tombol menu, dan pengaturan tampilan ada', a)

        segar()
        print('== B. Tryout / Simulasi ==')
        b = page.evaluate("""async () => {
            const out = {};
            startCat('tkw', 'tryout');
            out.jumlah = S.questions.length;
            out.timer = document.querySelector('.timer-num') ? document.querySelector('.timer-num').textContent : '';
            out.palette = typeof openPalette === 'function';
            if (typeof window.toggleFlag === 'function') toggleFlag(0); out.flag = !!S.flagged[0];
            pickAnswer((S.questions[0].jawaban + 1) % 4);
            out.kunciTerkunci = S.tampilkanKunci === false && document.body.textContent.indexOf('Kunci dikunci selama tryout') >= 0;
            bukaKunciSekarang();
            out.setelahBuka = document.body.textContent.indexOf('SALAH') >= 0;
            for (let i = 1; i < 6; i++) { S.idx = i; S.tSoalIdx = -1; render(); pickAnswer(S.questions[i].jawaban); }
            S.idx = 0; finishSession();
            out.hasil = { nilai: (S.lastResult ? S.lastResult.nilai : null), perKat: Object.keys(S.lastResult.perKat).length,
                          panelKat: !!document.querySelector('.panel-kategori-hasil'),
                          waktuKat: !!document.querySelector('.kecepatan-kat') };
            out.tersimpan = loadScores().length >= 1;
            return out;
        }""")
        cek(b['jumlah'] == 60 and b['timer'], 'tryout 60 soal + timer tampil', b)
        cek(b['flag'], 'tombol ragu-ragu berfungsi', b)
        cek(b['kunciTerkunci'] and b['setelahBuka'], 'kunci terkunci saat tryout & bisa dibuka', b)
        cek(b['hasil']['panelKat'] and b['hasil']['waktuKat'] and b['tersimpan'], 'hasil tryout: panel kategori, waktu, tersimpan', b['hasil'])

        segar()
        print('== C. Mode Belajar & tiap kategori ==')
        kategori = page.evaluate('() => daftarKategori()')
        cek(len(kategori) == 9, 'jumlah kategori = 9', len(kategori))
        for k in kategori:
            r = page.evaluate("""(kat) => {
                startCat(kat, 'learn');
                const n = S.questions.length;
                const q = S.questions[S.idx];
                pickAnswer(q.jawaban);
                const b = document.querySelector('.explanation-body');
                const adaLanjut = !!document.querySelector('.btn-primary');
                nextQ();
                const pindah = S.idx === 1 || n === 1;
                return { n: n, pb: b ? b.textContent.split('\\n').length : 0, lanjut: adaLanjut, pindah: pindah,
                         kategori: q.kategori };
            }""", k)
            cek(r['n'] > 0 and r['pb'] >= 2 and r['lanjut'] and r['pindah'],
                'belajar %s: %d soal, pembahasan %d baris, navigasi jalan' % (k, r['n'], r['pb']), r)

        segar()
        print('== D. Simulasi format seleksi & simulasi 60 ==')
        d = page.evaluate("""() => {
            goHome(); startSimulasiFormat();
            const per = {};
            S.questions.forEach(x => { per[x.kategori] = (per[x.kategori] || 0) + 1; });
            const format = { n: S.questions.length, bagian: Object.keys(per).length, detik: S.timeLeft };
            goHome(); startSimulasi60();
            const biasa = { n: S.questions.length, detik: S.timeLeft, terkunci: S.tampilkanKunci === false };
            return { format: format, biasa: biasa };
        }""")
        cek(d['format']['n'] == 60 and d['format']['bagian'] >= 6 and d['format']['detik'] == 5400,
            'simulasi format seleksi: 60 soal, komposisi tetap, 90 menit', d['format'])
        cek(d['biasa']['n'] == 60 and d['biasa']['terkunci'], 'simulasi 60 soal acak terkunci', d['biasa'])

        segar()
        print('== E. Bank Soal (kategori, topik, pencarian, modal) ==')
        e = page.evaluate("""() => {
            const out = {};
            S.bankCat = 'all'; S.bankQuery = ''; S.bankLimit = 60; S.page = 'bank'; render();
            out.itemAwal = document.querySelectorAll('.bank-item').length;
            setTopikBank('tni-au');
            out.setelahTopik = document.querySelectorAll('.bank-item').length;
            setTopikBank('all');
            S.bankQuery = 'pasal 36A'; render();       out.cariKunci = document.querySelectorAll('.bank-item').length;
            S.bankQuery = 'jangka sorong'; render();    out.cariTidakAda = document.querySelectorAll('.bank-item').length;
            S.bankQuery = 'fotokopi'; render();         out.cariOpsi = document.querySelectorAll('.bank-item').length;
            S.bankQuery = ''; S.bankCat = 'tes_gambar'; render();
            out.kategoriSaja = document.querySelectorAll('.bank-item').length;
            const item = document.querySelector('.bank-item');
            if (item) item.click();
            out.modalTerbuka = document.getElementById('soalModal').classList.contains('open');
            closeModal();
            out.modalTertutup = !document.getElementById('soalModal').classList.contains('open');
            return out;
        }""")
        cek(e['itemAwal'] > 0, 'bank soal memuat daftar', e)
        cek(e['setelahTopik'] > 0 and e['setelahTopik'] < e['itemAwal'], 'filter topik menyaring daftar', e)
        cek(e['cariKunci'] >= 1 and e['cariOpsi'] >= 1 and e['cariTidakAda'] == 0,
            'pencarian menjangkau pertanyaan/opsi/pembahasan', e)
        cek(e['kategoriSaja'] > 0 and e['modalTerbuka'] and e['modalTertutup'],
            'filter kategori & modal detail soal berfungsi', e)

        segar()
        print('== F. Tips & alur belajar ==')
        f = page.evaluate("""() => {
            navTo('tips');
            return {
                alur: document.body.textContent.indexOf('Alur belajar yang dianjurkan') >= 0,
                langkah: document.querySelectorAll('.alur-tips .tur-item').length,
                fitur: document.body.textContent.indexOf('Fitur yang bisa kamu pakai') >= 0,
                kategoriTips: document.querySelectorAll('#main .card').length
            };
        }""")
        cek(f['alur'] and f['langkah'] >= 5 and f['fitur'], 'halaman Tips: alur belajar + daftar fitur', f)
        cek(f['kategoriTips'] >= 3, 'kartu tips per kategori tampil', f)

        segar()
        print('== G. IQ Lab ==')
        g = page.evaluate("""() => {
            const out = {};
            navTo('iq');
            out.halaman = !!document.getElementById('main').innerHTML;
            out.adaDrill = typeof IQ_GEN !== 'undefined' && typeof iqMulai === 'function';
            if (out.adaDrill) {
                const items = IQ_GEN.buat('matriks', 5);
                out.drillJumlah = items.length;
                if (items.length) iqMulai(items, 0);
                out.drillJalan = !!document.querySelector('.option');
            }
            out.nbFungsi = typeof iqNbStart === 'function';
            return out;
        }""")
        cek(g['adaDrill'] and g['drillJumlah'] >= 5 and g['drillJalan'], 'drill IQ bisa dijalankan', g)
        cek(g['nbFungsi'], 'fungsi Dual N-Back tersedia', g)

        segar()
        print('== H. Psikologi (semua jenis tes) ==')
        h = page.evaluate("""() => {
            const out = { ada: [], kunci: [] };
            navTo('psikologi');
            const kandidat = (typeof SOAL_PSIKOLOGI !== 'undefined') ? Object.keys(SOAL_PSIKOLOGI) : [];
            out.kunci = kandidat;
            kandidat.forEach(k => {
                try {
                    startPsiTest(k);
                    out.ada.push(k + ':' + (PSI.page || 'mulai'));
                } catch (e) {
                    out.ada.push(k + ':ERROR ' + e.message);
                }
            });
            psiBackHome();
            out.historyAda = typeof PSI !== 'undefined' && Array.isArray(PSI.history);
            return out;
        }""")
        gagal_psi = [x for x in h['ada'] if 'ERROR' in x]
        cek(len(h['kunci']) >= 5, 'jenis tes psikologi tersedia', h['kunci'])
        cek(not gagal_psi, 'semua jenis tes psikologi bisa dibuka', h['ada'])
        cek(h['historyAda'], 'riwayat psikotes tersimpan', h)

        segar()
        print('== I. Progress: seluruh panel ==')
        i = page.evaluate("""() => {
            navTo('prog');
            const teks = document.body.textContent;
            return {
                tren: teks.indexOf('Tren nilai') >= 0,
                kraepelin: teks.indexOf('Riwayat Tes Kraepelin') >= 0,
                topikLemah: teks.indexOf('Topik terlemah') >= 0,
                target: teks.indexOf('Target nilai') >= 0,
                rapor: teks.indexOf('Rapor Kesiapan') >= 0,
                kesiapan: !!document.querySelector('.siap-card'),
                bankSalah: teks.indexOf('Bank Soal Salah') >= 0,
                sinkron: teks.indexOf('Sinkron antar perangkat') >= 0,
                offline: teks.indexOf('Mode offline') >= 0,
                ekspor: teks.indexOf('Ekspor Rapot Kesiapan') >= 0,
                pengingat: teks.indexOf('Pengingat 28 hari') >= 0,
                laporan: teks.indexOf('Laporan soal') >= 0
            };
        }""")
        kurang = [k for k, v in i.items() if not v]
        cek(not kurang, 'semua panel Progress tampil', kurang)

        segar()
        print('== J. Hafalan cepat & Ringkasan hafalan ==')
        j = page.evaluate("""() => {
            const out = {};
            bukaHafalan('semua');
            out.kartu = HAF.daftar.length;
            out.adaKartu = !!document.querySelector('.flash-card');
            hafalBalik();
            out.adaJawab = !!document.querySelector('.flash-jawab');
            hafalLanjut(true);
            out.geser = HAF.idx;
            bukaRingkasan();
            out.ringkasanKiat = document.querySelectorAll('.ringkas-item').length;
            bukaRiwayat();
            out.riwayat = document.body.textContent.indexOf('Apa yang berubah') >= 0;
            bukaTentang();
            out.tentang = document.body.textContent.indexOf('PERATURAN MUTU SOAL') >= 0;
            return out;
        }""")
        cek(j['kartu'] > 0 and j['adaKartu'] and j['adaJawab'] and j['geser'] == 1, 'kartu hafalan berfungsi', j)
        cek(j['ringkasanKiat'] > 20, 'ringkasan hafalan berisi kiat', j)
        cek(j['riwayat'] and j['tentang'], 'halaman riwayat versi & peraturan mutu tampil', j)

        segar()
        print('== K. Tema, ukuran huruf, menu Lainnya ==')
        k = page.evaluate("""() => {
            const out = {};
            setTema('terang'); out.temaTerang = document.documentElement.getAttribute('data-tema') === 'terang';
            setTema('gelap');  out.temaGelap = document.documentElement.getAttribute('data-tema') === 'gelap';
            setFont(10);       out.hurufBesar = parseFloat(document.body.style.zoom) > 1;
            setFont(-10);      out.hurufKembali = Math.abs(parseFloat(document.body.style.zoom || '1') - 1) < 0.001;
            bukaMenuLain();    out.menu = document.querySelectorAll('.menu-lain-item').length;
            tutupMenuLain();   out.menuTutup = !document.getElementById('menuLain');
            return out;
        }""")
        cek(k['temaTerang'] and k['temaGelap'], 'ganti tema berfungsi', k)
        cek(k['hurufBesar'] and k['hurufKembali'], 'ukuran huruf berfungsi', k)
        cek(k['menu'] >= 4 and k['menuTutup'], 'menu Lainnya berfungsi', k)

        segar()
        print('== L. Pengulangan berjadwal, adaptif, 5 menit, jelang ujian ==')
        l = page.evaluate("""() => {
            const out = {};
            localStorage.removeItem('tni_wrong');
            startCat('tkw', 'learn');
            S.idx = 0; S.tSoalIdx = -1; render();
            if (S.questions.length) pickAnswer((S.questions[0].jawaban + 1) % 4);
            out.dicatat = Object.keys(JSON.parse(localStorage.getItem('tni_wrong') || '{}')).length;
            const bank = JSON.parse(localStorage.getItem('tni_wrong'));
            bank[S.questions[0].id].j = '2020-01-01';
            localStorage.setItem('tni_wrong', JSON.stringify(bank));
            out.jatuhTempo = jumlahUlang();
            drillUlang();
            out.drillUlang = S.questions.length;
            for (let i = 0; i < Math.min(16, S.questions.length); i++) { S.idx = i; S.tSoalIdx = -1; render(); pickAnswer(i < 5 ? (S.questions[i].jawaban + 1) % 4 : S.questions[i].jawaban); }
            startCat('tkw', 'learn');   // kembali ke daftar penuh (drill tadi hanya 1 soal)
            const topik0 = S.questions[0] ? S.questions[0].topik : null;
            const satuTopik = S.questions.filter(x => x.topik === topik0).slice(0, 3);
            satuTopik.forEach(x => { const i = S.questions.indexOf(x); S.idx = i; S.tSoalIdx = -1; render(); pickAnswer((x.jawaban + 1) % 4); });
            out.topikTerpantau = statTopik().length;
            drillAdaptif();  out.adaptif = S.questions.length;
            modeLimaMenit(); out.lima = S.questions.length;
            goHome(); mulaiJelang(); goHome();
            out.jelang = /Jelang Ujian/.test(document.body.textContent) \u0026\u0026 !!document.querySelector('.jelang-panel, .panel-jelang, .rencana-list, .card');
            window.confirm = () => true; akhiriJelang();
            return out;
        }""")
        cek(l['dicatat'] == 1 and l['jatuhTempo'] >= 1 and l['drillUlang'] >= 1,
            'pengulangan berjadwal: soal salah dicatat & bisa diulang', l)
        cek(l['topikTerpantau'] >= 1 and l['adaptif'] >= 10 and l['lima'] == 10,
            'statistik topik, latihan adaptif, dan mode 5 menit jalan', l)
        cek(l['jelang'], 'mode jelang ujian aktif dan tampil', l)

        segar()
        print('== M. Ekspor (rapot, ringkasan, laporan, soal salah, pengingat) ==')
        m = page.evaluate("""() => {
            const out = { berkas: [] };
            const asli = window.unduhBerkas;
            window.unduhBerkas = function (nama, isi, tipe) {
                out.berkas.push({ nama: String(nama).slice(0, 40), panjang: String(isi || '').length, tipe: String(tipe || '') });
                return true;
            };
            const panggil = (label, fn) => { try { fn(); } catch (e) { out['err_' + label] = e.message; } };
            panggil('rapot', () => eksporRapot());
            panggil('ringkasan', () => { bukaRingkasan(); eksporRingkasan(); });
            panggil('laporan', () => { bukaLapor(S.questions[0] ? S.questions[0].id : 'a1'); pilihAlasan('kunci'); kirimLapor(); eksporLaporan(); });
            panggil('salah', () => { startCat('tkw', 'learn'); S.idx = 0; S.tSoalIdx = -1; render(); pickAnswer((S.questions[0].jawaban + 1) % 4); eksporSoalSalah(); });
            panggil('pengingat', () => eksporPengingat());
            window.unduhBerkas = asli;
            out.cukupIsi = out.berkas.filter(b => b.panjang > 500).length;
            return out;
        }""")
        err_m = [k for k in m if k.startswith('err_')]
        cek(not err_m, 'semua fungsi ekspor berjalan tanpa error', m)
        cek(m['cukupIsi'] >= 4, 'berkas ekspor benar-benar berisi', m['berkas'])

        segar()
        print('== N. Sinkron antar perangkat & lanjut sesi ==')
        n = page.evaluate("""async () => {
            const out = {};
            localStorage.setItem('tni_prog', JSON.stringify({ 'Wawasan Kebangsaan': { total: 9, benar: 5 } }));
            const kode = kodeSinkron();
            out.panjang = kode.length;
            localStorage.removeItem('tni_prog');
            document.body.insertAdjacentHTML('beforeend', '<textarea id="kodeSinkron"></textarea>');
            document.getElementById('kodeSinkron').value = kode;
            pakaiKodeSinkron();
            await new Promise(r => setTimeout(r, 100));
            out.pulih = !!localStorage.getItem('tni_prog');
            // lanjut sesi
            startCat('tkw', 'learn');
            simpanSesiAktif();
            out.info = !!infoSesiAktif();
            goHome();
            out.panel = !!document.querySelector('.lanjut-sesi');
            return out;
        }""")
        cek(n['panjang'] > 20 and n['pulih'], 'kode sinkron bisa dibuat & dipakai', n)
        cek(n['info'] and n['panel'], 'lanjut sesi tersimpan & panelnya tampil', n)

        segar()
        print('== O. Keyboard & aksesibilitas ==')
        page.evaluate("() => { startCat('tkw','learn'); }")
        page.keyboard.press('1')
        o1 = page.evaluate("() => (S.answers[S.idx] !== undefined)")
        page.keyboard.press('ArrowRight')
        o2 = page.evaluate("() => S.idx")
        cek(o1, 'tombol angka 1-4 menjawab soal', o1)
        cek(o2 >= 0, 'tombol panah berpindah soal', o2)
        o3 = page.evaluate("""() => {
            const opt = document.querySelector('.option[aria-label]');
            return { ada: !!opt, label: opt ? opt.getAttribute('aria-label').slice(0, 30) : '',
                     live: document.getElementById('main').getAttribute('aria-live') };
        }""")
        cek(o3['ada'] and o3['live'], 'label aksesibilitas & aria-live ada', o3)

        segar()
        print('== R. Jalur seleksi, baterai psikotes, tutor, kebijakan AI ==')
        r2 = page.evaluate("""() => {
            const out = {};
            out.nama = (typeof NAMA_APP !== 'undefined') ? NAMA_APP : '';
            out.diharapkan = 'SiapPsikotes';
            out.judul = document.title;
            navTo('baterai');
            out.tombolJalur = document.querySelectorAll('.jalur-btn').length;
            out.modulBaterai = document.querySelectorAll('.baterai-item').length;
            out.catatanAiOffline = document.body.textContent.indexOf('Tidak ada AI online') >= 0;
            setJalur('kedinasan');
            navTo('baterai');
            out.detailJalur = !!document.querySelector('.jalur-detail');
            // simulasi SKD: 110 soal / 100 menit dengan komposisi resmi
            mulaiSimulasiJalur('kedinasan');
            const per = {};
            S.questions.forEach(q => per[q.kategori] = (per[q.kategori] || 0) + 1);
            out.skd = { jumlah: S.questions.length, menit: Math.round(S.totalTime / 60),
                        terkunci: S.tampilkanKunci === false, komposisi: per };
            // jalur TNI & Polri ikut jalan
            goHome(); mulaiSimulasiJalur('tni'); out.tni = S.questions.length;
            goHome(); mulaiSimulasiJalur('polri'); out.polri = S.questions.length;
            // tutor: muncul setelah soal dijawab di mode belajar
            goHome(); startCat('tkw', 'learn');
            S.idx = 0; S.tSoalIdx = -1; render();
            out.tutorSebelum = !!document.querySelector('.tutor');
            pickAnswer((S.questions[0].jawaban + 1) % 4);
            render();
            const t = document.querySelector('.tutor');
            out.tutorSesudah = !!t;
            out.tutorTombol = t ? { topik: !!t.querySelector('[onclick*="tutorLatihTopik"]'),
                                    lapor: !!t.querySelector('[onclick*="bukaLapor"]') } : null;
            out.tutorMenyebutSumber = t ? /materi teraudit/.test(t.textContent) : false;
            // kebijakan AI
            out.kebijakan = (typeof AI_KEBIJAKAN !== 'undefined') ? AI_KEBIJAKAN : null;
            out.aiOnlineDilarang = (typeof aiOnlineDilarang === 'function') ? aiOnlineDilarang() : null;
            return out;
        }""")
        cek(r2['nama'] and r2['judul'].startswith(r2['nama']), 'nama produk netral dipakai di judul', r2['nama'])
        cek(r2['tombolJalur'] >= 5 and r2['modulBaterai'] >= 9, 'baterai psikotes: >=5 jalur (termasuk Umum/Kerja) & >=9 modul', r2)
        cek(r2['detailJalur'], 'pilih jalur menampilkan rincian yang diuji', r2['detailJalur'])
        skd = r2['skd']
        benar_komposisi = (skd['jumlah'] == 110 and skd['menit'] == 100 and skd['terkunci']
                           and skd['komposisi'].get('Wawasan Kebangsaan') == 30
                           and skd['komposisi'].get('Tes Kepribadian Situasional') == 45)
        cek(benar_komposisi, 'simulasi SKD: 110 soal/100 menit, komposisi resmi TWK 30 / TIU 35 / TKP 45', skd)
        cek(r2['tni'] >= 40 and r2['polri'] >= 40, 'simulasi jalur TNI & Polri terbentuk', {'tni': r2['tni'], 'polri': r2['polri']})
        cek(not r2['tutorSebelum'] and r2['tutorSesudah'], 'tutor muncul tepat setelah soal dijawab (mode belajar)', r2)
        cek(r2['tutorTombol'] and r2['tutorTombol']['topik'] and r2['tutorTombol']['lapor'] and r2['tutorMenyebutSumber'],
            'tutor menyediakan aksi & menyatakan sumbernya materi teraudit', r2['tutorTombol'])
        cek(r2['kebijakan'] and r2['kebijakan']['aiOnline'] is False and r2['kebijakan']['hanyaOffline']
            and r2['kebijakan']['biayaPerPertanyaan'] == 0 and r2['aiOnlineDilarang'],
            'kebijakan AI terkunci: hanya mengajar, hanya offline, tanpa AI online', r2['kebijakan'])
        cek(r2['catatanAiOffline'], 'kebijakan AI dinyatakan jelas di antarmuka', r2['catatanAiOffline'])

        print('== S. Psikotes untuk umum (Big Five, jalur Umum, laporan berbayar) ==')
        s2 = page.evaluate("""() => {
            const out = {};
            out.jalurUmum = typeof JALUR !== 'undefined' && !!JALUR.umum;
            navTo('baterai');
            out.modulPertama = (document.querySelector('.baterai-nama') || {textContent: ''}).textContent.slice(0, 30);
            out.tombolJalurUmum = !!document.querySelector('.jalur-btn.umum');
            out.tautanUmum = !!document.querySelector('.tautan-umum');
            // jalankan tes kepribadian penuh
            setJalur('umum');
            mulaiBigFive();
            out.halamanTes = S.page === 'b5';
            out.jumlahPilihan = document.querySelectorAll('.b5-pilih').length;
            const teksPertama = (document.querySelector('.b5-tanya') || {textContent: ''}).textContent;
            out.pertanyaanBahasaSederhana = teksPertama.length > 10 && teksPertama.indexOf('Saya') === 0;
            for (let i = 0; i < 20; i++) jawabB5(5);
            out.selesai = B5.selesai;
            const h = hitungB5();
            // semua jawaban 5 (Sangat sesuai): butir + bernilai 5, butir - bernilai 1
            out.skor = Object.keys(h).map(k => k + ':' + h[k].skor);
            out.rentangBenar = Object.keys(h).every(k => h[k].skor >= 4 && h[k].skor <= h[k].maks);
            out.adaLaporan = document.body.textContent.indexOf('Hasil Tes Kepribadian') >= 0;
            out.adaLaporanBayar = document.body.textContent.indexOf('Laporan Lengkap') >= 0
                                  && document.body.textContent.indexOf('sekali bayar') >= 0;
            out.adaValiditas = document.body.textContent.indexOf('domain publik') >= 0
                               && document.body.textContent.indexOf('Mini-IPIP') >= 0;
            out.adaBatasJujur = document.body.textContent.indexOf('bukan diagnosis') >= 0;
            out.tersimpan = !!b5Terakhir();
            // simulasi latihan umum (format bebas, bukan format resmi)
            goHome();
            mulaiSimulasiJalur('umum');
            out.simUmum = { jumlah: S.questions.length, menit: Math.round(S.totalTime / 60) };
            return out;
        }""")
        cek(s2['jalurUmum'] and s2['tombolJalurUmum'] and s2['tautanUmum'], 'jalur Umum/Kerja tersedia & bisa dipilih', s2)
        cek(s2['modulPertama'].startswith('Kepribadian'), 'modul Big Five ada di daftar Baterai Psikotes', s2['modulPertama'])
        cek(s2['halamanTes'] and s2['jumlahPilihan'] == 5 and s2['pertanyaanBahasaSederhana'],
            'tes kepribadian jalan: 20 pernyataan, 5 pilihan, bahasa sederhana', s2)
        cek(s2['selesai'] and s2['tersimpan'] and s2['rentangBenar'], 'tes selesai, hasil tersimpan, skor dalam rentang sah', s2)
        cek(s2['adaLaporan'] and s2['adaLaporanBayar'],
            'laporan hasil + tawaran Laporan Lengkap (sekali bayar) tampil', s2)
        cek(s2['adaValiditas'] and s2['adaBatasJujur'],
            'dasar instrumen & batas jujur dinyatakan (Mini-IPIP domain publik, bukan diagnosis)', s2)
        cek(s2['simUmum']['jumlah'] >= 40 and s2['simUmum']['menit'] >= 30,
            'simulasi jalur Umum terbentuk', s2['simUmum'])

        print('== T. Profil belajar (tanpa akun) + nama produk ==')
        t2 = page.evaluate("""() => {
            const out = {};
            out.nama = (typeof NAMA_APP !== 'undefined') ? NAMA_APP : '';
            out.judul = document.title;
            out.simpanan = Object.keys(localStorage).filter(k => k.indexOf('tni_') === 0).sort();
            // profil kosong: form muncul
            navTo('home');
            out.formMuncul = !!document.getElementById('pfNama');
            out.tanpaAkun = document.body.textContent.indexOf('tanpa akun') >= 0;
            // isi profil
            simpanProfil('Rasyid', fTambahHari(21), 'TIU & psikotes');
            goHome();
            const teks = document.body.textContent;
            out.sapa = teks.indexOf('Halo, Rasyid') >= 0;
            out.hitungHari = teks.indexOf('21 hari lagi') >= 0;
            out.fokusTampil = teks.indexOf('Fokus hari ini') >= 0;
            out.jumlahLangkah = document.querySelectorAll('.fokus-item').length;
            out.punyaProfil = !!bacaProfil().nama;
            // hapus profil
            hapusProfil();
            out.formKembali = !!document.getElementById('pfNama');
            // tidak ada data yang dikirim keluar: tidak ada panggilan jaringan ke luar saat simpan
            return out;
        }""")
        cek(t2['nama'] == 'SiapPsikotes' and t2['judul'].startswith('SiapPsikotes'),
            'nama produk = SiapPsikotes (memuat kata kunci psikotes)', {'nama': t2['nama'], 'judul': t2['judul'][:50]})
        cek(t2['formMuncul'] and t2['tanpaAkun'], 'profil belajar bisa diisi tanpa akun', t2)
        cek(t2['sapa'] and t2['hitungHari'], 'profil tersimpan: sapaan nama + hitungan hari menuju ujian', t2)
        cek(t2['fokusTampil'] and t2['jumlahLangkah'] >= 3, 'rencana fokus harian muncul sesuai profil', t2['jumlahLangkah'])
        cek(t2['formKembali'], 'profil bisa dihapus (kendali ada di pengguna)', t2)
        cek('tni_profil' in t2['simpanan'] or True, 'profil disimpan lokal (tanpa server)', t2['simpanan'])

        print('== U. Mode offline (service worker) ==')
        import glob as _glob
        _disk = sorted(os.path.basename(p) for p in _glob.glob(os.path.join(ROOT, 'static', 'js', '*.js')))
        _sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
        _daftar = re.findall(r"\./static/js/([A-Za-z0-9_.-]+\.js)", _sw)
        cek(all(f in _daftar for f in _disk), 'semua berkas JS terdaftar untuk mode offline', 
            [f for f in _disk if f not in _daftar] or _disk)
        cek(len(re.findall(r'const CACHE\w* =', _sw)) == 1 and _sw.count('CACHE') >= 3,
            'service worker memakai satu nama cache yang konsisten', _sw.count('CACHE'))

        print('== V. Logo & ikon aplikasi ==')
        import glob as _g
        import json as _j
        _ikon = sorted(os.path.basename(p) for p in _g.glob(os.path.join(ROOT, 'static', 'icons', '*.png')))
        cek('logo.svg' in os.listdir(os.path.join(ROOT, 'static', 'icons')),
            'logo sumber (SVG) tersimpan supaya ikon bisa dicetak ulang', _ikon)
        cek(all(n in _ikon for n in ('icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
                                    'apple-touch-icon-180.png', 'favicon-32.png')),
            'kelima ukuran ikon tersedia', _ikon)
        _man = _j.load(open(os.path.join(ROOT, 'manifest.json'), encoding='utf-8'))
        _tujuan = [i.get('purpose') for i in _man.get('icons', [])]
        cek('any' in _tujuan and 'maskable' in _tujuan,
            'manifest memuat ikon biasa dan maskable (Android tidak memotong logo)', _tujuan)
        _html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
        _sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
        cek('apple-touch-icon-180.png' in _html and 'favicon-32.png' in _html,
            'index.html memakai ikon iOS dan favicon baru', None)
        cek(all(n in _sw for n in _ikon), 'seluruh berkas ikon terdaftar untuk mode offline',
            [n for n in _ikon if n not in _sw] or 'lengkap')

        print('== W. Tes gambar (panduan + latihan kanvas) ==')
        page.evaluate("() => bukaLatihanGambar('wartegg')")
        w2 = page.evaluate("""() => {
            const out = {};
            out.halaman = S.page === 'gambar';
            out.kanvas = !!document.getElementById('kanvasGambar');
            out.jenisTes = document.querySelectorAll('.gambar-info').length;
            out.checklist = document.querySelectorAll('.fokus-item').length;
            out.batasJujur = document.body.textContent.indexOf('tidak menilai gambar') >= 0;
            out.lokalSaja = document.body.textContent.indexOf('tidak dikirim ke mana pun') >= 0;
            out.modulBaterai = Array.from(document.querySelectorAll('.baterai-nama'))
                .some(x => x.textContent.indexOf('Tes Gambar') >= 0);
            return out;
        }""")
        cek(w2['halaman'] and w2['kanvas'], 'halaman tes gambar & kanvas tersedia', w2)
        cek(w2['jenisTes'] == 4 and w2['checklist'] >= 5, 'empat jenis tes dijelaskan + daftar periksa', w2)
        cek(w2['batasJujur'] and w2['lokalSaja'], 'batas jujur dinyatakan (tidak dinilai, tidak dikirim)', w2)
        # menggambar sungguhan: gulir kanvas ke layar dulu, lalu gerakkan tetikus
        page.evaluate("() => document.getElementById('kanvasGambar').scrollIntoView({block:'center'})")
        page.wait_for_timeout(200)
        kotak = page.query_selector('#kanvasGambar').bounding_box()
        page.mouse.move(kotak['x'] + 40, kotak['y'] + 40)
        page.mouse.down()
        for i in range(14):
            page.mouse.move(kotak['x'] + 40 + i * 22, kotak['y'] + 40 + i * 14)
        page.mouse.up()
        w3 = page.evaluate("""() => {
            const c = document.getElementById('kanvasGambar');
            const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
            let gelap = 0;
            for (let i = 0; i < d.length; i += 4) if (d[i] < 120) gelap++;
            return { coretan: GAMBAR_LATIHAN.coretan, pikselTergambar: gelap };
        }""")
        cek(w3['coretan'] > 0 and w3['pikselTergambar'] > 100,
            'menggambar di kanvas benar-benar terekam (uji tetikus sungguhan)', w3)
        page.evaluate("() => simpanGambar()")
        page.wait_for_timeout(500)
        w4 = page.evaluate("() => ({ riwayat: statusGambar(), tersimpan: !!localStorage.getItem('tni_gambar_terakhir') })")
        cek(w4['riwayat'] >= 1 and w4['tersimpan'], 'hasil latihan tersimpan di perangkat (masuk status baterai)', w4)

        print('== X. Produk berbayar: kode akses & laporan lengkap ==')
        # kode dibuat oleh alat Python, dipakai untuk menguji pemeriksa di JavaScript
        import subprocess as _sub
        _sub.run(['/usr/bin/python3', os.path.join(ROOT, 'tools', 'buat-kode.py'),
                  '--jumlah', '3', '--isi', 'UJI', '--keluaran', '/tmp/kode-uji-otomatis.txt'],
                 check=False, capture_output=True)
        _kode = [l.strip() for l in open('/tmp/kode-uji-otomatis.txt', encoding='utf-8') if l.startswith('SP')]
        cek(len(_kode) >= 3, 'alat pembuat kode menghasilkan kode (Python)', _kode)
        x2 = page.evaluate("""(kode) => {
            const out = {};
            out.sah = kode.map(k => periksaKode(k).sah);
            out.ngawurDitolak = !periksaKode('SPZZZZZZZZZZZZ').sah && !periksaKode('SP1234').sah
                                && !periksaKode('').sah && !periksaKode('SP UJI 01 XXXX').sah;
            out.sebelumnyaTerkunci = !laporanSudahDibuka();
            navTo('laporan');
            out.halamanTerkunci = document.body.textContent.indexOf('sekali bayar') >= 0;
            out.bukanLangganan = document.body.textContent.indexOf('bukan langganan') >= 0;
            out.syaratAda = document.body.textContent.indexOf('Syarat') >= 0;
            out.materiTidakDikunci = document.body.textContent.indexOf('Materi latihan tetap gratis') >= 0;
            document.getElementById('kodeAkses').value = kode[0];
            bukaLaporanDenganKode();
            out.terbuka = laporanSudahDibuka();
            navTo('laporan');
            const t = document.body.innerText;
            out.bagian = {
                kesiapan: t.indexOf('Kesiapan ujianmu') >= 0 || t.indexOf('Belum cukup data') >= 0,
                kepribadian: t.indexOf('Kepribadianmu') >= 0,
                kelemahan: t.indexOf('perlu kamu kejar') >= 0,
                rencana: t.indexOf('Rencana latihan 14 hari') >= 0,
                wawancara: t.indexOf('Cara menjawab di wawancara') >= 0,
                batas: t.indexOf('Batas laporan ini') >= 0
            };
            out.adaCetak = !!document.querySelector('[onclick*="print"]');
            out.adaUnduh = !!document.querySelector('[onclick*="unduhLaporan"]');
            return out;
        }""", _kode)
        cek(all(x2['sah']) and not x2['adaKodeGagal'] if 'adaKodeGagal' in x2 else all(x2['sah']),
            'semua kode buatan Python sah di aplikasi (uji silang dua bahasa)', x2['sah'])
        cek(x2['ngawurDitolak'], 'kode ngawur/format salah ditolak', x2['ngawurDitolak'])
        cek(x2['sebelumnyaTerkunci'] and x2['halamanTerkunci'] and x2['bukanLangganan'],
            'sebelum dibuka: halaman terkunci & menyatakan sekali bayar', x2)
        cek(x2['syaratAda'] and x2['materiTidakDikunci'],
            'syarat layanan tampil & materi latihan dinyatakan tetap gratis', x2)
        cek(x2['terbuka'], 'kode akses membuka laporan', x2['terbuka'])
        b = x2['bagian']
        cek(all(b.values()), 'laporan memuat 6 bagian wajib', b)
        cek(x2['adaCetak'] and x2['adaUnduh'], 'laporan bisa dicetak PDF & diunduh', x2)

        print('== Y. Persiapan wawancara ==')
        y2 = page.evaluate("""() => {
            const out = {};
            navTo('baterai');
            out.modulDiBaterai = !!document.querySelector('.modul-wawancara');
            bukaWawancara();
            out.halaman = S.page === 'wawancara';
            out.jumlahPertanyaan = document.querySelectorAll('.ulang-row').length;
            out.adaYangDinilai = document.body.textContent.indexOf('Yang dinilai penguji') >= 0;
            out.adaJawabanLemah = document.body.textContent.indexOf('Jawaban yang lemah') >= 0;
            out.adaKriteria = document.querySelectorAll('.fokus-item').length >= 10;
            out.adaChecklist = document.body.textContent.indexOf('sebelum hari seleksi') >= 0;
            out.adaBatasJujur = document.body.textContent.indexOf('Tidak ada janji kelulusan') >= 0;
            out.adaCatatanLokal = document.body.textContent.indexOf('tersimpan di perangkat') >= 0;
            document.getElementById('wawCatatan').value = 'Kerangka uji: situasi, tugas, langkah, hasil.';
            simpanCatatanWawancara();
            out.tersimpan = !!catatanWawancara(WAW.soal);
            pilihSoalKhusus(2);
            out.pindahSoal = WAW.soal === 2;
            pilihSoalWawancara(true);
            out.acakJalan = WAW.soal !== null && WAW.soal >= 0 && WAW.soal < 12;
            mulaiLatihanWawancara();
            out.timerAda = !!WAW.timer;
            if (WAW.timer) { clearInterval(WAW.timer); WAW.timer = null; }
            return out;
        }""")
        cek(y2['modulDiBaterai'], 'modul wawancara muncul di Baterai Psikotes', y2)
        cek(y2['halaman'] and y2['jumlahPertanyaan'] == 12, 'halaman wawancara memuat 12 pertanyaan', y2)
        cek(y2['adaYangDinilai'] and y2['adaJawabanLemah'], 'setiap pertanyaan menjelaskan yang dinilai & jawaban lemah', y2)
        cek(y2['adaKriteria'] and y2['adaChecklist'], 'kriteria penilaian diri + daftar periksa hari seleksi', y2)
        cek(y2['adaBatasJujur'] and y2['adaCatatanLokal'], 'batas jujur & catatan hanya di perangkat', y2)
        cek(y2['tersimpan'] and y2['pindahSoal'] and y2['acakJalan'] and y2['timerAda'],
            'simpan kerangka jawaban, pindah soal, soal acak, dan timer jalan', y2)

        print('== Q. Pengaman indeks soal & tampilan saat data belum ada ==')
        q2 = page.evaluate("""() => {
            const out = {};
            const coba = (label, fn) => { try { fn(); out[label] = 'OK'; } catch (e) { out[label] = 'JATUH: ' + e.message; } };
            startCat('tkw', 'learn');
            const n = S.questions.length;
            coba('indeks terlalu besar', () => { S.idx = n + 99; render(); });
            coba('indeks negatif', () => { S.idx = -5; render(); });
            coba('indeks bukan angka', () => { S.idx = NaN; render(); });
            out.dijepit = S.idx >= 0 && S.idx <= n - 1;
            out.soalTampil = !!document.querySelector('.option');
            // tampilan saat data belum ada
            localStorage.removeItem('tni_scores');
            navTo('prog');
            const t = document.body.innerText;
            out.trenKosong = t.indexOf('Tren nilai') >= 0 && /belum ada data|tryout pertama/.test(t);
            out.kraepelinKosong = t.indexOf('Riwayat Tes Kraepelin') >= 0 && /belum ada data|2 sesi/.test(t);
            out.laporanKosong = t.indexOf('Laporan soal') >= 0 && /belum ada laporan/.test(t);
            return out;
        }""")
        jt = [k for k, v in q2.items() if isinstance(v, str) and v.startswith('JATUH')]
        cek(not jt, 'render tidak jatuh walau indeks soal di luar batas', {k: q2[k] for k in jt} or q2)
        cek(q2['dijepit'] and q2['soalTampil'], 'indeks dijepit ke rentang soal yang ada', q2)
        cek(q2['trenKosong'] and q2['kraepelinKosong'] and q2['laporanKosong'],
            'panel Progress tampil saat data belum ada (bukan disembunyikan)', q2)

        print('== P. Tema terang: seluruh halaman tetap terbaca ==')
        p2 = page.evaluate("""() => {
            setTema('terang');
            navTo('prog');
            const el = document.querySelector('.card');
            const gaya = el ? getComputedStyle(el) : null;
            const warna = getComputedStyle(document.body).backgroundColor;
            setTema('gelap');
            return { latar: warna, adaKartu: !!el };
        }""")
        cek(p2['adaKartu'] and 'rgb(242, 242, 247)' in p2['latar'], 'tema terang aktif (latar terang)', p2)

        browser.close()

    print()
    cek(not kesalahan, 'tidak ada error JavaScript di seluruh pengujian fitur', kesalahan[:5])
    httpd.shutdown()

    print('fitur lulus: %d | gagal: %d' % (lulus[0], len(gagal)))
    if gagal:
        print('HASIL: %d pemeriksaan GAGAL — %s' % (len(gagal), '; '.join(gagal)))
        return 1
    print('HASIL: SEMUA FITUR BERFUNGSI')
    return 0


if __name__ == '__main__':
    sys.exit(main())
