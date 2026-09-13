#!/bin/sh
# Pembungkus: memakai Python-nya .tools-venv supaya pustaka gambar QR tersedia
cd "$(dirname "$0")/.." || exit 1
exec ./.tools-venv/bin/python tools/buat-qris.py "$@"
