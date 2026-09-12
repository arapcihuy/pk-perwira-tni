#!/usr/bin/env bash
# Gerbang pemeriksaan sebelum kirim (pre-push).
#
# Menjalankan SEMUA pemeriksaan cepat yang sama dengan CI:
#   1. PERATURAN MUTU SOAL (11 butir)
#   2. Verifikasi bank soal (akurasi, konsistensi versi aset, gambar)
#   3. Pemeriksaan sintaks seluruh JavaScript
#
# Kalau ada satu saja gagal, pengiriman DIBATALKAN. Ini mencegah kejadian
# berulang: CI merah karena pemeriksaan yang sebenarnya bisa dijalankan lokal.
#
# Pemakaian:  bash tools/periksa-sebelum-kirim.sh
# Hook:       .git/hooks/pre-push memanggil skrip ini (lihat tools/pasang-hook.py)

set -u
AKAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$AKAR" || exit 1

PY=/usr/bin/python3
GAGAL=0

echo "=== 1/3 PERATURAN MUTU SOAL ==="
if ! $PY tools/peraturan-mutu.py; then
  echo ">>> GAGAL: peraturan mutu soal tidak dipatuhi"
  GAGAL=1
fi

echo
echo "=== 2/3 VERIFIKASI BANK SOAL ==="
if ! $PY tools/verifikasi-soal.py; then
  echo ">>> GAGAL: verifikasi bank soal tidak lulus"
  GAGAL=1
fi

echo
echo "=== 3/3 SINTAKS JAVASCRIPT ==="
if command -v node > /dev/null 2>&1; then
  for f in static/js/*.js data/*.js sw.js; do
    [ -f "$f" ] || continue
    if ! node --check "$f" > /dev/null 2>&1; then
      echo "  GAGAL | sintaks: $f"
      node --check "$f" 2>&1 | head -3
      GAGAL=1
    fi
  done
  [ "$GAGAL" -eq 0 ] && echo "  OK    | seluruh JavaScript lolos pemeriksaan sintaks"
else
  echo "  (node tidak tersedia - pemeriksaan sintaks dilewati)"
fi

echo
echo "=== 4/4 MEREK & IDENTITAS (berkas yang dilihat pengguna) ==="
MEREK_GAGAL=0
for f in index.html manifest.json sw.js static/js/*.js data/*.js; do
  [ -f "$f" ] || continue
  if grep -q "PK Perwira" "$f" 2>/dev/null; then
    echo "  GAGAL | merek lama 'PK Perwira' masih ada di $f"
    MEREK_GAGAL=1
  fi
done
if [ "$MEREK_GAGAL" -eq 0 ]; then
  echo "  OK    | tidak ada merek lama di berkas yang dilihat pengguna"
else
  GAGAL=1
fi

echo
if [ "$GAGAL" -ne 0 ]; then
  echo "=============================================="
  echo "PENGIRIMAN DIBATALKAN - perbaiki dulu di atas."
  echo "=============================================="
  exit 1
fi
echo "SEMUA PEMERIKSAAN LULUS - aman untuk dikirim"
exit 0
