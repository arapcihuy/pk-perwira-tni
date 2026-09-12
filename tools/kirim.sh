#!/usr/bin/env bash
# Kirim perubahan ke GitHub setelah lulus gerbang pemeriksaan.
#
# Pakai:  bash tools/kirim.sh /tmp/pesan-commit.txt
#   Tanpa argumen -> memakai /tmp/pesan-commit.txt
#
# Skrip ini: (1) commit, (2) tarik perubahan terbaru dan selesaikan konflik cap versi,
# (3) samakan versi aset dengan versi terbaru di server, (4) jalankan gerbang pemeriksaan,
# (5) baru mengirim. Pengiriman dibatalkan bila gerbang gagal.
set -u
AKAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$AKAR" || exit 1

PESAN="${1:-/tmp/pesan-commit.txt}"
if [ ! -f "$PESAN" ]; then
  echo "berkas pesan commit tidak ditemukan: $PESAN"
  echo "pakai: bash tools/kirim.sh /tmp/pesan-commit.txt"
  exit 2
fi
echo "pesan commit dari: $PESAN"

echo "=== 1. commit ==="
git add -A
if git diff --cached --quiet; then
  echo "(tidak ada perubahan baru untuk di-commit)"
else
  git commit -q -F "$PESAN"
  echo "commit dibuat: $(git log -1 --pretty=%s)"
fi

echo "=== 2. tarik perubahan terbaru ==="
git fetch -q origin
git pull -q --rebase origin master 2>&1 | tail -2
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  echo "--- konflik cap versi: ambil versi commit sendiri, cap versi diurus langkah 3 ---"
  git checkout --theirs index.html sw.js 2>/dev/null
  git add index.html sw.js 2>/dev/null
  GIT_EDITOR=true git rebase --continue 2>&1 | tail -2
fi

echo "=== 3. samakan versi aset dengan versi terbaru di server ==="
STAMP=$(git log --oneline origin/master -1 | cut -d' ' -f1 | head -c7)
echo "stamp server: $STAMP"
/usr/bin/python3 tools/stamp-versi.py "$STAMP" | tail -1
grep -o "?v=[A-Za-z0-9]*" index.html | sort -u | tr '\n' ' '; echo
grep -o "CACHE = '[^']*'" sw.js

echo "=== 4. gerbang pemeriksaan ==="
if ! bash tools/periksa-sebelum-kirim.sh "${2:-}" > /tmp/gate-kirim.log 2>&1; then
  tail -4 /tmp/gate-kirim.log
  echo "GERBANG GAGAL - tidak dikirim"
  exit 1
fi
tail -2 /tmp/gate-kirim.log

echo "=== 5. kirim ==="
git add -A
git commit -q -m "chore: samakan versi aset setelah penyelesaian rebase" 2>/dev/null || true
if git push -q origin master; then
  echo "push: BERHASIL"
else
  echo "push: GAGAL"
  exit 1
fi
git log --oneline -3
