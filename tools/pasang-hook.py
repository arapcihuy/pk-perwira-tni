#!/usr/bin/env python3
"""Pasang gerbang pemeriksaan sebagai hook git pre-push.

Tujuan: mustahil mengirim commit yang membuat CI merah karena pemeriksaan yang
sebenarnya bisa dijalankan lokal (peraturan mutu, verifikasi bank soal, sintaks JS).

Jalankan sekali setelah clone:  python3 tools/pasang-hook.py
"""
import os
import stat
import subprocess

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = os.path.join(AKAR, '.git', 'hooks', 'pre-push')

ISI = '''#!/usr/bin/env bash
# Dipasang oleh tools/pasang-hook.py — menjalankan gerbang pemeriksaan sebelum push.
bash "$(git rev-parse --show-toplevel)/tools/periksa-sebelum-kirim.sh" || {
  echo
  echo "push dibatalkan oleh pre-push hook (perbaiki pemeriksaan di atas)"
  exit 1
}
'''


def main():
    if not os.path.isdir(os.path.join(AKAR, '.git')):
        print('bukan repositori git:', AKAR)
        return 1
    os.makedirs(os.path.dirname(HOOK), exist_ok=True)
    open(HOOK, 'w', encoding='utf-8').write(ISI)
    os.chmod(HOOK, 0o755)
    berkas = os.path.join(AKAR, 'tools', 'periksa-sebelum-kirim.sh')
    os.chmod(berkas, 0o755)
    print('hook pre-push dipasang:', HOOK)
    print('gerbang:', berkas)
    keluaran = subprocess.run(['bash', berkas], capture_output=True, text=True)
    print('uji gerbang sekarang: %s' % ('LULUS' if keluaran.returncode == 0 else 'GAGAL'))
    if keluaran.returncode != 0:
        print(keluaran.stdout[-800:])
    return keluaran.returncode


if __name__ == '__main__':
    raise SystemExit(main())
