#!/bin/sh
# Pembungkus: memakai venv perkakas (di luar repo) supaya pustaka gambar QR tersedia
cd "$(dirname "$0")/.." || exit 1
PYBIN="$HOME/venv-siappsikotes/bin/python"
[ -x "$PYBIN" ] || PYBIN=/usr/bin/python3
exec "$PYBIN" tools/buat-qris.py "$@"
