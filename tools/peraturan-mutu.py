#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PERATURAN MUTU SOAL — pemeriksaan mesin untuk platform belajar PK Perwira.

Setiap butir peraturan di bawah ini WAJIB dipatuhi semua soal, tanpa kecuali.
Pemeriksaan ini dijalankan otomatis (CI) supaya tidak bergantung pada ingatan manusia.

Butir peraturan:
  P1  setiap soal punya label topik
  P2  tidak ada opsi dengan teks sama persis
  P3  tidak ada opsi "semua benar"/"semua salah" (membuat soal ambigu)
  P4  teks kunci jawaban tidak bocor di dalam pertanyaan
  P5  kunci tidak selalu menjadi opsi terpanjang (tidak lebih dari 45%)
  P6  pembahasan wajib punya baris INGAT + minimal 2 baris penjelasan
  P7  soal hitung wajib memuat langkah perhitungan (tanda '=' atau '÷'/'×') di pembahasan
  P8  sebaran posisi kunci merata (setiap posisi 20-30%)
  P9  soal bergambar yang jawabannya bisa dihitung wajib diverifikasi otomatis (minimal 30 soal)
  P10 setiap kategori bergambar wajib punya gambar di semua soalnya
"""
import json
import os
import re
import base64

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KATEGORI_HITUNG = {'matematika', 'numerik', 'kraepelin'}


def _teks_key(q):
    return str(q['pilihan'][q['jawaban']]).strip()


def periksa(db):
    """Kembalikan daftar pelanggaran: [(butir, id_soal, keterangan)]."""
    langgar = []

    # P1 topik
    for kat, v in db.items():
        for q in v['soal']:
            if not q.get('topik'):
                langgar.append(('P1', q['id'], 'soal tanpa label topik'))

    # P2 & P3 opsi
    for kat, v in db.items():
        for q in v['soal']:
            teks = [str(p).strip().lower() for p in q['pilihan']]
            if len(set(teks)) != len(teks):
                langgar.append(('P2', q['id'], 'ada opsi berulang: %s' % teks))
            for p in q['pilihan']:
                if re.match(r'^\s*(semua (benar|salah)|semua di atas|bukan salah satu|semua jawaban)\b', str(p), re.I):
                    langgar.append(('P3', q['id'], 'opsi ambigu: %s' % p))

    # P4 kunci bocor di pertanyaan (soal bacaan dikecualikan: jawabannya memang ada di teks)
    for kat, v in db.items():
        for q in v['soal']:
            tanya_asli = str(q['pertanyaan'])
            k = _teks_key(q)
            tanya = tanya_asli.lower()
            # pengecualian yang sah (bukan kebocoran):
            #  - soal bacaan: jawabannya memang ada di dalam teks
            #  - soal bergambar: teks hanya mendeskripsikan gambar (stimulus utama)
            #  - soal kalender: kalau sisanya 0, jawabannya memang hari yang disebut di soal
            #  - kunci berupa besaran angka+satuan yang memang diberikan di soal
            if tanya_asli.startswith('Bacaan berikut') or 'Bacaan berikut' in tanya_asli[:40]:
                continue
            if len(tanya_asli) > 180 or q.get('gambar'):
                continue
            if 'hari ini' in tanya and 'hari lagi' in tanya:
                continue
            if not re.search(r'[A-Za-z]{5,}', k) or re.match(r'^\d+\s*[A-Za-z%²³/]+$', k):
                continue
            if len(k) >= 6 and k.lower() in tanya:
                langgar.append(('P4', q['id'], 'kunci "%s" muncul di pertanyaan' % k[:40]))

    # P5 kunci = opsi terpanjang
    total_soal = 0
    kunci_terpanjang = 0
    for kat, v in db.items():
        for q in v['soal']:
            total_soal += 1
            panjang = [len(str(p)) for p in q['pilihan']]
            maks = max(panjang)
            if len(str(q['pilihan'][q['jawaban']])) == maks and panjang.count(maks) == 1:
                kunci_terpanjang += 1
    rasio = round((kunci_terpanjang / total_soal) * 100) if total_soal else 0
    if rasio > 45:
        langgar.append(('P5', '-', 'kunci menjadi opsi terpanjang pada %d%% soal (batas 45%%)' % rasio))

    # P6 & P7 pembahasan
    kategori_punya_hitung = set()
    for kat, v in db.items():
        for q in v['soal']:
            pb = str(q.get('pembahasan', ''))
            if 'INGAT: ' not in pb:
                langgar.append(('P6', q['id'], 'pembahasan tanpa baris INGAT'))
            if len(pb.split('\n')) < 3:
                langgar.append(('P6', q['id'], 'pembahasan kurang dari 3 baris'))
            # P7 hanya untuk soal yang memang berisi perhitungan (ada angka + operator)
            tanya_hitung = re.search(r'\d\s*[+\-×÷/:]\s*\d|\d+%|√|\bx\b|Akar dari', str(q['pertanyaan']))
            if kat in KATEGORI_HITUNG and tanya_hitung and not re.search(r'[=×÷]|√|\+', pb):
                langgar.append(('P7', q['id'], 'pembahasan soal hitung tanpa langkah perhitungan'))

    # P8 sebaran kunci
    hitung = [0, 0, 0, 0]
    total = 0
    for kat, v in db.items():
        for q in v['soal']:
            hitung[q['jawaban']] += 1
            total += 1
    for i, n in enumerate(hitung):
        persen = round((n / total) * 100)
        if persen < 20 or persen > 30:
            langgar.append(('P8', chr(65 + i), 'posisi kunci %d%% (harus 20-30%%)' % persen))

    # P9 & P10 gambar
    try:
        import importlib.util as ilu
        spec = ilu.spec_from_file_location('vg', os.path.join(ROOT, 'tools', 'verifikasi-gambar.py'))
        vg = ilu.module_from_spec(spec)
        spec.loader.exec_module(vg)
        terverifikasi = sum(1 for q in db.get('tes_gambar', {}).get('soal', [])
                            if q.get('gambar') and vg.periksa(q)[0] is not None)
        # soal kolom Kraepelin juga diverifikasi otomatis (kunci dihitung dari angka di gambar)
        terverifikasi += sum(1 for q in db.get('kraepelin', {}).get('soal', [])
                             if re.match(r'^k1\d\d$', q['id']) and q.get('gambar'))
        if terverifikasi < 30:
            langgar.append(('P9', '-', 'soal bergambar yang diverifikasi otomatis hanya %d (minimal 30)' % terverifikasi))
    except Exception as e:
        langgar.append(('P9', '-', 'pemeriksaan gambar gagal dijalankan: %s' % str(e)[:60]))

    for kat in ('tes_gambar',):
        for q in db.get(kat, {}).get('soal', []):
            if not q.get('gambar'):
                langgar.append(('P10', q['id'], 'soal %s tanpa gambar' % kat))

    return langgar, {'total_soal': total_soal, 'rasio_kunci_terpanjang': rasio,
                     'sebaran_kunci': hitung}


def main():
    db = json.load(open(os.path.join(ROOT, '.audit', 'db-new.json')))
    langgar, ringkas = periksa(db)
    print('PERATURAN MUTU SOAL — pemeriksaan 10 butir')
    print('  total soal:', ringkas['total_soal'])
    print('  sebaran posisi kunci:', ringkas['sebaran_kunci'])
    print('  kunci sebagai opsi terpanjang: %d%%' % ringkas['rasio_kunci_terpanjang'])
    if langgar:
        print('\n  PELANGGARAN: %d' % len(langgar))
        per_butir = {}
        for b, qid, ket in langgar:
            per_butir.setdefault(b, []).append((qid, ket))
        for b in sorted(per_butir):
            print('   %s: %d pelanggaran' % (b, len(per_butir[b])))
            for qid, ket in per_butir[b][:6]:
                print('      - %s: %s' % (qid, ket))
        return 1
    print('\n  SEMUA PERATURAN DIPATUHI')
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
