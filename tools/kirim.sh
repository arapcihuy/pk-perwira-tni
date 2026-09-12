#!/usr/bin/env bash
# Kirim v32: logo baru + ikon + pendaftaran offline, dengan penanganan konflik cap versi.
set -u
cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

echo "=== 1. commit ==="
git add -A
git commit -q -F /tmp/commit-v32.txt || { echo "(tidak ada perubahan untuk di-commit)"; }

echo "=== 2. tarik perubahan terbaru ==="
git fetch -q origin
git pull -q --rebase origin master 2>&1 | tail -2

if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  echo "--- konflik cap versi: ambil versi commit sendiri ---"
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
bash tools/periksa-sebelum-kirim.sh > /tmp/gate-final.log 2>&1
KODE=$?
tail -2 /tmp/gate-final.log
if [ $KODE -ne 0 ]; then
  echo "GERBANG GAGAL - tidak dikirim"
  exit 1
fi

echo "=== 5. kirim ==="
git add -A
git commit -q -m "chore: samakan versi aset setelah penyelesaian rebase" 2>/dev/null || true
git push -q origin master && echo "push: BERHASIL"
git log --oneline -3
