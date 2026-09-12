# Catatan Kerja — PK Perwira TNI (platform belajar)

Situs: https://arapcihuy.github.io/pk-perwira-tni/  
Repo: https://github.com/arapcihuy/pk-perwira-tni (branch `master`, GitHub Pages)  
Kode kerja lokal: `~/tni-belajar`  
Diperbarui: 2026-09-12

File ini mencatat semua pekerjaan yang dikerjakan otomatis (otonom) pada proyek ini,
supaya mudah ditelusuri kembali: apa yang diubah, kapan, dan hasil verifikasinya.

## Ringkasan isi aplikasi

- 1000 soal, 9 kategori: Wawasan Kebangsaan (112), Matematika (166), Bahasa Inggris (110),
  Penalaran dan Logika (134), Kemampuan Numerik (184), Kemampuan Verbal (100),
  Tes Kraepelin (100), Tes Gambar dan Visual (50), Tes Kepribadian Situasional (44).
- Fitur: Tryout (60 soal / 90 menit), mode Belajar, Bank Soal + pencarian, Tes Psikologi
  (Kraepelin, Digit Span, Daya Ingat, EPPS), IQ Lab (matriks, deret, rotasi, Dual N-Back),
  Progress, backup/restore data lokal (localStorage), PWA offline (service worker).
- Versi build saat ini: **v19** (penanda `?v=19` pada aset + nama cache service worker).

## Riwayat pekerjaan otonom

| Tanggal | Perubahan | Commit |
|---|---|---|
| 2026-07-31 | PK Perwira TNI - Platform Belajar PWA; remove bak file, add gitignore; icon: military star design; icon: premium layered military star - dark navy bg, gold star | fix: |
| 2026-08-01 | trigger: force GitHub Pages rebuild; fix: bump service worker cache to v3 - force browser cache invalidation | fix: |
| 2026-08-02 | Mulai bangun bank soal: TWK, MTK, Inggris, Logika, Numerik, Verbal, Kraepelin, Tes Gambar, Kepribadian; perbaikan SVG gambar soal (data URI base64) dan service worker. | fix: |
| 2026-08-04 | Aplikasi tes psikologi TNI AU lengkap ditambahkan. | feat: |
| 2026-08-17 | Perbaikan navigasi dan bug tes psikologi; retry deploy GitHub Pages saat gangguan infrastruktur. | chore: |
| 2026-08-19 | Fitur CAT soal palette, tanda ragu-ragu, kurva kinerja Kraepelin, backup/restore, fullscreen; penguatan sanitasi XSS dan validasi skema backup; perbaikan variabel CSS dan kunci jawaban. | feat(psikologi): |
| 2026-08-27 | Bank soal mencapai 1000 soal + redesign Apple glassmorphism + ikon SVG; perbaikan teks tidak terlihat dan sel Kraepelin aktif. | fix: |
| 2026-09-10 | IQ Lab (drill matriks/deret/rotasi/verbal + Dual N-Back + log skor) dan PWA network-first. Audit menyeluruh build v17 (16 bug diperbaiki: timer tryout, kunci jawaban ganda rotasi figural, bank soal lebih ringan, Kraepelin, import backup) dan v18 (pembahasan di hasil Tes Psikologi). Laporan: `~/Downloads/pk-perwira-audit-2026-09-10/LAPORAN-AUDIT.md`. | feat(v18): |
| 2026-09-12 | Audit akurasi 1000 soal + pembahasan dibuat mudah dipahami (build v19). Rincian di `LAPORAN-AUDIT-v19.md`. | fix(v19): |

## Cara kerja audit v19 (12 September 2026)

1. `data/soal.js` diekstrak ke bentuk terstruktur (`.audit/extract.py`).
2. Pemeriksaan otomatis: kunci di luar rentang, opsi bernilai sama (soal ambigu),
   hitung ulang aritmetika, kunci tidak disebut di pembahasan, duplikat pertanyaan, gambar rusak.
3. Pemeriksaan manual seluruh 1000 soal per kategori + verifikasi fakta ke sumber luar
   (UU TNI 3/2025, Pasal 36A UUD 1945, Keppres 137/1952, Paskhas 17 Oktober 1947,
   Dakota VT-CLA 29 Juli 1947, Sumpah Prajurit).
4. Perbaikan diterapkan lewat `.audit/fix.py` (idempotent), lalu diverifikasi `.audit/verify.py`.
5. Uji runtime di browser: 9 kategori dijalankan sampai pembahasan muncul, 41 gambar soal
   dimuat, `window.onerror` dipantau (0 error), diuji pada server lokal dan situs live.

Perintah menjalankan ulang:

```bash
/usr/bin/python3 .audit/extract.py   # ekstrak data
/usr/bin/python3 .audit/fix.py       # terapkan koreksi + format pembahasan
/usr/bin/python3 .audit/verify.py    # verifikasi akurasi
```

## Hasil verifikasi v19

- 1000 soal, 9 kategori, id unik, semua indeks kunci valid, semua soal 4 opsi.
- 126 soal hitung diuji ulang otomatis: semua cocok dengan kuncinya.
- Tidak ada dua opsi bernilai sama (soal ambigu) di seluruh bank soal.
- Semua pembahasan diawali `JAWABAN:` + memuat kunci, format 3 baris: JAWABAN / cara / INGAT.
- 41 gambar soal valid dan ter-render.
- Uji browser di situs live: 1000 soal termuat, pembahasan tampil 3 baris, 41/41 gambar OK, 0 error JS.
