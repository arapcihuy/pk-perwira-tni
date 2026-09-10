// ============================================================
// IQ LAB — ITEM BANK & GENERATOR (data/soal-iq.js)
// Basis item terstandar internasional (ICAR / Raven-style):
//   MR  = Matrix Reasoning
//   LN  = Letter & Number Series
//   VR  = Verbal Reasoning / Aritmetika
//   R3D = 3D Rotation (disimulasikan rotasi figural)
// Semua item digenerate lokal di browser. Tanpa jaringan, tanpa akun.
// Format item sama dengan SOAL_DATABASE: {id, pertanyaan, pilihan,
// jawaban, pembahasan, kategori} + opsional {svg, pilihanSvg}.
// ============================================================

// ---- REFERENSI ALAT UKUR TERVALIDASI (untuk skor & norma) ----
var IQ_REF = {
  target: 110,
  baseline: 100,
  links: [
    {
      nama: 'ICAR — International Cognitive Ability Resource',
      url: 'https://icar-project.org/sampletest/sampletest2013.php',
      ukur: 'Matrix reasoning, deret angka & huruf, verbal, rotasi 3D (16 item)',
      dasar: 'Public-domain, divalidasi lewat publikasi peer-review, dipakai riset psikometri'
    },
    {
      nama: 'Mensa Norway — tes ter-norma (Raven-style)',
      url: 'https://test.mensa.no/',
      ukur: 'Penalaran figural/abstrak, 35 item, 25 menit',
      dasar: 'Norma populasi, keluaran estimasi IQ skala SD15'
    },
    {
      nama: 'Cambridge Brain Sciences',
      url: 'https://www.cambridgebrainsciences.com/',
      ukur: '12 task: memori, penalaran, atensi, kecepatan',
      dasar: 'Baterai riset kognitif, banyak publikasi ilmiah'
    },
    {
      nama: 'BrainHQ (Posit Science)',
      url: 'https://www.brainhq.com/',
      ukur: 'Speed of processing, memori, atensi',
      dasar: 'Diuji lewat RCT besar (ACTIVE trial) — basis bukti terkuat di kelas brain training'
    },
    {
      nama: 'CogniFit — IQbe',
      url: 'https://www.cognifit.com/us/id/iq-test-iqbe',
      ukur: 'IQ nonverbal culture-fair, laporan per-domain',
      dasar: 'Penilaian digital ternorma, minim bias budaya'
    },
    {
      nama: 'TIKI — Tes Intelegensi Kolektif Indonesia',
      url: 'https://www.talentlytica.com/alat-ukur/tes-intelegensi-kolektif-indonesia',
      ukur: 'Intelegensi umum dengan norma Indonesia',
      dasar: 'Dikembangkan bersama Fakultas Psikologi Unpad & Vrije Universiteit Amsterdam'
    }
  ],
  domain: [
    { key: 'angka',    nama: 'Deret Angka',         kode: 'LN',  desc: 'Pola aritmetika, geometri, selang-seling, beda naik, kombinatorial' },
    { key: 'huruf',    nama: 'Deret Huruf',         kode: 'LN',  desc: 'Pola alfabetik dengan lompatan tetap / berubah' },
    { key: 'matriks',  nama: 'Matriks Figural',     kode: 'MR',  desc: 'Aturan baris-kolom: jumlah elemen, rotasi, isi bentuk' },
    { key: 'rotasi',   nama: 'Rotasi Figural',      kode: 'R3D', desc: 'Hasil putaran vs cermin (distraktor mirror)' },
    { key: 'verbal',   nama: 'Verbal & Aritmetika', kode: 'VR',  desc: 'Pecahan bertingkat, umur, perbandingan, sudut jam, kecepatan' },
    { key: 'campuran', nama: 'Campuran Semua Jenis', kode: 'MIX', desc: 'Acak semua jenis soal — melatih ketahanan & kecepatan seperti tes asli' }
  ]
};

// ============================================================
// SVG HELPER — gambar figural (inline SVG, aman & offline)
// inner() = isi gambar (tanpa <svg>), cell() = dibungkus <svg>
// ============================================================
var IQ_SVG = (function () {
  function wrap(inner, size) {
    size = size || 64;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var POS9 = [
    [16, 16], [32, 16], [48, 16],
    [16, 32], [32, 32], [48, 32],
    [16, 48], [32, 48], [48, 48]
  ];
  function innerDots(n) {
    var s = '';
    for (var i = 0; i < Math.min(n, 9); i++) {
      s += '<circle cx="' + POS9[i][0] + '" cy="' + POS9[i][1] + '" r="5.5" fill="currentColor"/>';
    }
    return s;
  }
  function innerLines(n) {
    var s = '';
    for (var i = 0; i < Math.min(n, 9); i++) {
      var y = 12 + i * 6;
      s += '<line x1="12" y1="' + y + '" x2="52" y2="' + y + '"/>';
    }
    return s;
  }
  function innerPolygon(sides, filled) {
    var cx = 32, cy = 32, r = 20, pts = [];
    for (var i = 0; i < sides; i++) {
      var ang = (Math.PI * 2 * i / sides) - Math.PI / 2;
      pts.push((cx + r * Math.cos(ang)).toFixed(1) + ',' + (cy + r * Math.sin(ang)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '"' + (filled ? ' fill="currentColor"' : '') + '/>';
  }
  // Bentuk ASIMETRIS (panji pada tiang) — memang tidak simetris, jadi hasil
  // CERMIN selalu berbeda dari hasil PUTARAN. Ini inti latihan rotasi vs cermin.
  var ASYM = '14,6 50,42 14,30 14,58';
  function innerAsym(deg, mirror) {
    var t = 'rotate(' + (deg || 0) + ' 32 32)';
    if (mirror) t = 'translate(64,0) scale(-1,1) ' + t;
    return '<polygon points="' + ASYM + '" transform="' + t + '"/>';
  }
  function innerGlyphs(n) {
    var g = ['<circle cx="32" cy="14" r="7"/>', '<polygon points="32,22 40,36 24,36"/>', '<rect x="24" y="42" width="16" height="16" rx="3"/>'];
    var s = '';
    for (var i = 0; i < Math.min(n, 3); i++) s += g[i];
    return s;
  }
  // state -> isi gambar, sesuai aturan
  function inner(state, rule) {
    if (rule === 'titik')  return innerDots(state);
    if (rule === 'garis')  return innerLines(state);
    if (rule === 'rotasi') return innerAsym(state, false);
    if (rule === 'bentuk') return innerPolygon(state.sides, state.filled);
    if (rule === 'glyph')  return innerGlyphs(state);
    return '';
  }
  function cell(state, rule, size) { return wrap(inner(state, rule), size || 60); }

  // Grid 3x3 soal matriks: 8 sel terisi, sel terakhir bertanda "?"
  function grid(cellsArr, missingIdx) {
    var s = '';
    for (var i = 0; i < 9; i++) {
      var r = Math.floor(i / 3), c = i % 3;
      var x = c * 70 + 6, y = r * 70 + 6;
      s += '<rect x="' + x + '" y="' + y + '" width="66" height="66" rx="8" fill="rgba(255,255,255,0.04)" stroke="currentColor" stroke-width="1" opacity="0.45"/>';
      if (i === missingIdx) {
        s += '<text x="' + (x + 33) + '" y="' + (y + 46) + '" font-size="32" text-anchor="middle" fill="currentColor" stroke="none">?</text>';
      } else {
        s += '<g transform="translate(' + (x + 1) + ',' + (y + 1) + ') scale(1.0)">' + cellsArr[i] + '</g>';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216" width="300" height="300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + s + '</svg>';
  }
  return { wrap: wrap, inner: inner, cell: cell, grid: grid, POS9: POS9 };
})();

// ============================================================
// GENERATOR ITEM
// ============================================================
var IQ_GEN = (function () {
  var ABJAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    var x = a.slice();
    for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = x[i]; x[i] = x[j]; x[j] = t; }
    return x;
  }

  // Susun 4 opsi unik yang memuat jawaban benar.
  // extraFn dipakai bila kandidat kurang (mis. item huruf/teks).
  function susunOpsi(correct, kandidat, extraFn) {
    var c = String(correct);
    var out = [c];
    var cNum = Number(c);
    var benarPositif = !isNaN(cNum) && c.trim() !== '' && cNum > 0;
    function coba(v) {
      if (v === null || v === undefined) return;
      var s = String(v);
      if (s.length === 0 || s === c) return;
      if (out.indexOf(s) !== -1) return;
      // jangan tampilkan angka nol/negatif sebagai pilihan bila jawabannya positif
      if (benarPositif && !isNaN(Number(s)) && Number(s) <= 0) return;
      if (out.length < 4) out.push(s);
    }
    (kandidat || []).forEach(coba);
    var n = Number(c);
    for (var bump = 1; out.length < 4 && bump <= 30; bump++) {
      if (!isNaN(n) && c.trim() !== '') {
        var cand = (bump % 2 === 1) ? n - Math.ceil(bump / 2) : n + Math.ceil(bump / 2);
        coba(cand);
      } else if (extraFn) {
        coba(extraFn(bump));
      }
    }
    var opsi = shuffle(out);
    return { pilihan: opsi, jawaban: opsi.indexOf(c) };
  }

  function buatItem(tipe, pertanyaan, correct, kandidat, pembahasan, extra, extraFn) {
    var o = susunOpsi(correct, kandidat, extraFn);
    var it = {
      id: 'iq-' + tipe + '-' + Math.random().toString(36).slice(2, 9),
      pertanyaan: pertanyaan,
      pilihan: o.pilihan,
      jawaban: o.jawaban,
      pembahasan: pembahasan,
      kategori: extra && extra.kategori ? extra.kategori : 'IQ',
      _tipe: tipe,
      _correct: String(correct)
    };
    if (extra) for (var k in extra) if (k !== 'kategori') it[k] = extra[k];
    return it;
  }
  function bersih(list, benar) {
    var out = [];
    list.forEach(function (v) {
      if (v === null || v === undefined) return;
      if (Number(v) <= 0 || Number(v) === Number(benar)) return;
      if (out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  // ---------- LN: DERET ANGKA ----------
  function deretAngka() {
    var r = ri(1, 8), t = [], n = 0, aturan = '', kandidat = [];
    if (r === 1) {
      var d = pick([3, 4, 5, 6, 7, 8, 9, 11, -3, -4, -5, -6]);
      var a = d > 0 ? ri(2, 15) : ri(Math.abs(d) * 5 + 2, Math.abs(d) * 5 + 25);
      for (var i = 0; i < 5; i++) t.push(a + i * d);
      n = a + 5 * d;
      aturan = 'Deret aritmetika: setiap suku bertambah ' + d + '. ' + t[4] + ' ' + (d > 0 ? '+' : '-') + ' ' + Math.abs(d) + ' = ' + n + '.';
      kandidat = [n + d, n - d, n + 1, n - 1, n + 2 * d];
    } else if (r === 2) {
      var rr = pick([2, 3]), a2 = ri(1, 4);
      for (var j = 0; j < 5; j++) t.push(a2 * Math.pow(rr, j));
      n = a2 * Math.pow(rr, 5);
      aturan = 'Deret geometri: setiap suku dikali ' + rr + '. ' + t[4] + ' x ' + rr + ' = ' + n + '.';
      kandidat = [n + rr, n - rr, n / rr, n + t[4], t[4] + rr];
    } else if (r === 3) {
      var p = ri(3, 9), q = ri(11, 19);
      if (Math.random() < 0.4) q = -q;
      // mulai dari angka yang cukup besar supaya tidak ada suku (atau jawaban) yang 0/negatif
      var cur = ri(2 * Math.abs(q) + 15, 2 * Math.abs(q) + 45);
      t.push(cur);
      for (var k2 = 0; k2 < 4; k2++) { cur += (k2 % 2 === 0) ? p : q; t.push(cur); }
      n = cur + p;
      aturan = 'Dua pola bergantian: +' + p + ' lalu ' + (q > 0 ? '+' : '') + q + '. Suku ke-6 lanjut pola +' + p + ': ' + t[4] + ' + ' + p + ' = ' + n + '.';
      kandidat = [cur + q, n + 1, n - 1, n + p, t[4] + q];
    } else if (r === 4) {
      var d4 = ri(2, 7), inc = ri(1, 4);
      t.push(ri(1, 9));
      for (var k4 = 0; k4 < 4; k4++) t.push(t[t.length - 1] + d4 + k4 * inc);
      n = t[4] + d4 + 4 * inc;
      aturan = 'Selisih antar suku naik ' + inc + ' tiap langkah (' + d4 + ', ' + (d4 + inc) + ', ' + (d4 + 2 * inc) + ', ' + (d4 + 3 * inc) + '). Selisih berikutnya ' + (d4 + 4 * inc) + ': ' + t[4] + ' + ' + (d4 + 4 * inc) + ' = ' + n + '.';
      kandidat = [n + inc, n - inc, n + d4, t[4] + d4 + 3 * inc, n + 1];
    } else if (r === 5) {
      var m = pick([2, 3]), c5 = ri(1, 6), a5 = ri(1, 5);
      t.push(a5);
      for (var k5 = 0; k5 < 4; k5++) t.push(t[t.length - 1] * m + c5);
      n = t[4] * m + c5;
      aturan = 'Pola x' + m + ' lalu +' + c5 + '. ' + t[4] + ' x ' + m + ' + ' + c5 + ' = ' + n + '.';
      kandidat = [n + c5, n - c5, t[4] * m, n + m, n - m];
    } else if (r === 6) {
      var c6 = ri(1, 9);
      for (var k6 = 2; k6 <= 6; k6++) t.push(k6 * k6 + c6);
      n = 49 + c6;
      aturan = 'Bilangan kuadrat + ' + c6 + ' (selisih naik 2: ' + (t[1] - t[0]) + ', ' + (t[2] - t[1]) + ', ' + (t[3] - t[2]) + ', ' + (t[4] - t[3]) + '). Berikutnya 49 + ' + c6 + ' = ' + n + '.';
      kandidat = [n + 2, n - 2, n + 1, t[4] + (t[4] - t[3]), n - 1];
    } else if (r === 7) {
      var f1 = ri(1, 6), f2 = ri(2, 7);
      t = [f1, f2];
      for (var k7 = 0; k7 < 3; k7++) t.push(t[t.length - 1] + t[t.length - 2]);
      n = t[4] + t[3];
      aturan = 'Tiap suku = jumlah dua suku sebelumnya. ' + t[3] + ' + ' + t[4] + ' = ' + n + '.';
      kandidat = [t[4] + t[2], n + 1, n - 1, t[4] * 2, n + 2];
    } else {
      var c8 = ri(0, 5);
      t = [2, 4, 8, 16, 32].map(function (v) { return v + c8; });
      n = 64 + c8;
      aturan = 'Deret 2^n + ' + c8 + ' (selisih mengganda tiap langkah). Berikutnya 64 + ' + c8 + ' = ' + n + '.';
      kandidat = [n + 1, n - 1, n + 2, n * 2, 32 + c8];
    }
    return buatItem('angka',
      'Lanjutkan deret berikut:  ' + t.join(',  ') + ',  ?',
      n, bersih(kandidat, n), aturan, { kategori: 'IQ — Deret Angka' });
  }

  // ---------- LN: DERET HURUF ----------
  function deretHuruf() {
    var r = ri(1, 3), pos = [], nx = 0, aturan = '', kandidat = [];
    if (r === 1) {
      var s = pick([2, 3, 4, 5]);
      var st = ri(1, 26 - 5 * s);
      for (var i = 0; i < 5; i++) pos.push(st + i * s);
      nx = st + 5 * s;
      aturan = 'Lompatan tetap ' + s + ' huruf (A=1, B=2, ...). Posisi ke-6 = ' + nx + ' = ' + ABJAD[nx - 1] + '.';
      kandidat = [ABJAD[nx - 1], ABJAD[nx], ABJAD[nx - 3], ABJAD[nx - 1 - s], ABJAD[Math.min(25, nx)]];
    } else if (r === 2) {
      var s1 = ri(2, 3), s2 = ri(4, 6);
      var cur = ri(1, 26 - (3 * s1 + 2 * s2));
      pos.push(cur);
      for (var k = 0; k < 4; k++) { cur += (k % 2 === 0) ? s1 : s2; pos.push(cur); }
      nx = cur + s1;
      aturan = 'Pola bergantian +' + s1 + ' lalu +' + s2 + '. Suku ke-6 lanjut +' + s1 + ' -> posisi ' + nx + ' = ' + ABJAD[nx - 1] + '.';
      kandidat = [ABJAD[nx - 1], ABJAD[cur + s2 - 1], ABJAD[nx + 1], ABJAD[nx - 2]];
    } else {
      // Lompatan naik: base, base+1, base+2, base+3
      // Suku ke-6 = start + 5*base + 10, jadi start dibatasi agar tidak melewati Z
      var base = ri(1, 3), maks = 26 - (5 * base + 10);
      var c = ri(1, Math.max(1, maks));
      pos.push(c);
      for (var k3 = 0; k3 < 4; k3++) { c += base + k3; pos.push(c); }
      nx = c + base + 4;
      aturan = 'Lompatan naik (' + base + ', ' + (base + 1) + ', ' + (base + 2) + ', ' + (base + 3) + '). Lompatan berikutnya ' + (base + 4) + ' -> posisi ' + nx + ' = ' + ABJAD[nx - 1] + '.';
      kandidat = [ABJAD[nx - 1], ABJAD[nx + 1], ABJAD[nx - 3], ABJAD[c + base + 2]];
    }
    var benar = ABJAD[nx - 1];
    var tampil = pos.map(function (v) { return ABJAD[v - 1]; });
    return buatItem('huruf',
      'Lanjutkan deret huruf berikut:  ' + tampil.join(', ') + ',  ?',
      benar, kandidat, aturan, { kategori: 'IQ — Deret Huruf' },
      function (bump) {
        var idx = ABJAD.indexOf(benar);
        var alt = idx + (bump % 2 === 1 ? -Math.ceil(bump / 2) : Math.ceil(bump / 2));
        return (alt >= 0 && alt < 26) ? ABJAD[alt] : null;
      });
  }

  // ---------- MR: MATRIKS FIGURAL (grid 3x3) ----------
  function matriks(attempt) {
    attempt = attempt || 0;
    // Aturan + parameter diacak supaya variasinya banyak, bukan 4 item statis.
    // Tiap aturan harus punya >= 4 keadaan gambar berbeda (butuh 4 opsi unik).
    var rule = pick(['titik', 'garis', 'rotasi', 'bentuk']);
    var P = {};
    if (rule === 'titik' || rule === 'garis') {
      P.off = ri(0, 3);            // jumlah = baris + kolom + 1 + off  -> 4 varian
    } else if (rule === 'rotasi') {
      P.start = pick([0, 45, 90, 135]);  // sudut awal -> 4 varian
    } else {
      P.sisi0 = pick([3, 4]);      // sisi terkecil 3 atau 4
      P.isiBaris = pick([1, 2]);   // baris ke-n (1-2) mulai terisi penuh
    }
    function state(r, c) {
      if (rule === 'titik' || rule === 'garis') return r + c + 1 + P.off;
      if (rule === 'rotasi') return (P.start + 45 * (r + c)) % 360;
      return { sides: c + P.sisi0, filled: r >= P.isiBaris, rot: 0 };
    }
    var benar = state(2, 2);
    var cells = [];
    for (var i = 0; i < 9; i++) cells.push(IQ_SVG.inner(state(Math.floor(i / 3), i % 3), rule));
    var gridSvg = IQ_SVG.grid(cells, 8);

    var svgBenar = IQ_SVG.cell(benar, rule);
    var opsiSvg = [svgBenar];
    var kandidatState = [state(0, 0), state(1, 1), state(2, 0), state(0, 2), state(2, 1), state(1, 2)];
    for (var k = 0; k < kandidatState.length && opsiSvg.length < 4; k++) {
      var s = IQ_SVG.cell(kandidatState[k], rule);
      if (opsiSvg.indexOf(s) === -1) opsiSvg.push(s);
    }
    var step = 1;
    while (opsiSvg.length < 4 && step <= 20) {
      var alt = (rule === 'bentuk')
        ? { sides: 3 + (step % 4), filled: step % 2 === 0, rot: 0 }
        : (rule === 'rotasi' ? (P.start + 45 * step) % 360 : benar + step);
      var altSvg = IQ_SVG.cell(alt, rule);
      if (opsiSvg.indexOf(altSvg) === -1) opsiSvg.push(altSvg);
      step++;
    }
    // jaring pengaman: kalau gambar opsi tidak bisa dibuat 4 yang unik, ulangi dengan aturan lain
    if (opsiSvg.length !== 4 || new Set(opsiSvg).size !== 4) {
      if (attempt < 6) return matriks(attempt + 1);
      return rotasi();
    }
    var acak = shuffle(opsiSvg);
    var teksAturan = {
      titik:  'Jumlah titik di setiap sel = baris + kolom + 1' + (P.off ? ' + ' + P.off : '') + '. Jadi sel kanan-bawah harus berisi ' + (benar) + ' titik.',
      garis:  'Jumlah garis di setiap sel = baris + kolom + 1' + (P.off ? ' + ' + P.off : '') + '. Jadi sel kanan-bawah harus berisi ' + (benar) + ' garis.',
      rotasi: 'Bentuk berputar 45 derajat setiap satu langkah ke kanan dan satu langkah ke bawah, mulai dari ' + P.start + ' derajat. Sel kanan-bawah = ' + benar + ' derajat (setara arah ' + P.start + ' derajat).',
      bentuk: 'Jumlah sisi naik per kolom (mulai ' + P.sisi0 + ' sisi) dan baris ke-' + P.isiBaris + ' dan sesudahnya berisi bentuk penuh. Sel kanan-bawah = bangun ' + benar.sides + ' sisi terisi.'
    }[rule];

    return {
      id: 'iq-matriks-' + Math.random().toString(36).slice(2, 9),
      pertanyaan: 'Perhatikan matriks figural. Gambar mana yang tepat mengisi sel bertanda tanya?',
      pilihan: ['A', 'B', 'C', 'D'],
      pilihanSvg: acak,
      jawaban: acak.indexOf(svgBenar),
      pembahasan: teksAturan + ' Periksa aturan itu pada baris DAN kolom sebelum memilih.',
      kategori: 'IQ — Matriks Figural',
      svg: gridSvg,
      _tipe: 'matriks',
      _correct: 'svg'
    };
  }

  // ---------- R3D: ROTASI FIGURAL ----------
  function rotasi() {
    var sudut = pick([45, 90, 135, 180, 225, 270, 315]);
    var svgBase = IQ_SVG.wrap(IQ_SVG.inner(0, 'rotasi'), 60);
    var benarSvg = IQ_SVG.wrap(IQ_SVG.inner(sudut, 'rotasi'), 60);
    function putar(s) { return IQ_SVG.wrap(IQ_SVG.inner(((s % 360) + 360) % 360, 'rotasi'), 60); }
    function cermin(s) {
      return IQ_SVG.wrap('<g transform="translate(64,0) scale(-1,1)">' + IQ_SVG.inner(((s % 360) + 360) % 360, 'rotasi') + '</g>', 60);
    }

    // Susun opsi dari pasangan (sudut, cermin) yang pasti berbeda satu sama lain.
    // Bentuk dasar sudah asimetris, jadi hasil cermin TIDAK pernah sama dengan hasil putaran.
    var opsi = [benarSvg];
    var cerminSvg = cermin(sudut);
    if (cerminSvg !== benarSvg && opsi.indexOf(cerminSvg) === -1) opsi.push(cerminSvg);
    var selisih = shuffle([45, 90, 135, 180, -45, -90, -135]);
    for (var k = 0; k < selisih.length && opsi.length < 4; k++) {
      var s2 = putar(sudut + selisih[k]);
      if (opsi.indexOf(s2) === -1) opsi.push(s2);
    }
    if (opsi.length !== 4 || new Set(opsi).size !== 4) return deretAngka(); // jaring pengaman
    var acak = shuffle(opsi);
    return {
      id: 'iq-rotasi-' + Math.random().toString(36).slice(2, 9),
      pertanyaan: 'Perhatikan bentuk di kiri, lalu pilih gambar hasil MEMUTAR bentuk itu ' + sudut +
        ' derajat searah jarum jam. Hati-hati: gambar cermin (dibalik) kelihatan mirip, tapi itu bukan hasil putaran.',
      pilihan: ['A', 'B', 'C', 'D'],
      pilihanSvg: acak,
      jawaban: acak.indexOf(benarSvg),
      pembahasan: 'Putar bentuk ' + sudut + ' derajat searah jarum jam: ujung panji pada tiang ikut berpindah ' + sudut + ' derajat. ' +
        'Pada pilihan cermin, panji berada di sisi yang berlawanan (kanan jadi kiri) sehingga bukan hasil putaran. ' +
        'Jadi hitung arah putarannya, jangan hanya menilai kemiripan bentuk.',
      kategori: 'IQ — Rotasi Figural',
      svg: svgBase,
      _tipe: 'rotasi',
      _correct: 'svg'
    };
  }

  // ---------- VR: VERBAL & ARITMETIKA ----------
  function verbal() {
    var t = ri(1, 6), pertanyaan = '', benar = 0, kandidat = [], bahas = '';
    if (t === 1) {
      var a = pick([2, 3, 4, 5]), b = pick([2, 3, 4, 5]), c = pick([2, 3, 4, 5]), kk = ri(3, 12);
      var N = a * b * c * kk;
      benar = kk;
      pertanyaan = 'Berapa hasil dari 1/' + a + ' dari 1/' + b + ' dari 1/' + c + ' dari ' + N + '?';
      bahas = 'Kerjakan bertahap dari belakang: ' + N + ' / ' + c + ' = ' + (N / c) + '; lalu / ' + b + ' = ' + (N / (b * c)) + '; lalu / ' + a + ' = ' + (N / (a * b * c)) + ' = ' + kk + '.';
      kandidat = [kk + 1, kk - 1, kk * 2, kk + 3];
    } else if (t === 2) {
      var A = ri(4, 14) * 2, tambah = ri(3, 15);
      benar = A / 2 + tambah;
      pertanyaan = 'Rafi berumur ' + A + ' tahun dan adiknya berumur setengah dari umur Rafi. Ketika Rafi berumur ' + (A + tambah) + ' tahun, berapa umur adiknya?';
      bahas = 'Umur adik sekarang ' + (A / 2) + ' tahun. Selisih umur tetap, jadi saat Rafi naik ' + tambah + ' tahun, adik juga naik ' + tambah + ' tahun: ' + (A / 2) + ' + ' + tambah + ' = ' + benar + '.';
      kandidat = [benar + tambah, (A + tambah) / 2, benar - 1, A / 2];
    } else if (t === 3) {
      var b1 = pick([2, 3, 4]), b2 = b1 + pick([1, 2, 3]), unit = ri(4, 15);
      benar = b2 * unit;
      pertanyaan = 'Perbandingan jumlah A : B = ' + b1 + ' : ' + b2 + '. Jika seluruhnya ada ' + ((b1 + b2) * unit) + ' unit, berapa jumlah B?';
      bahas = 'Total bagian = ' + b1 + ' + ' + b2 + ' = ' + (b1 + b2) + '. Satu bagian = ' + ((b1 + b2) * unit) + ' / ' + (b1 + b2) + ' = ' + unit + '. Maka B = ' + b2 + ' x ' + unit + ' = ' + benar + '.';
      kandidat = [b1 * unit, benar + unit, benar - unit, (b1 + b2) * unit - benar];
    } else if (t === 4) {
      var nama = shuffle(['Adi', 'Bima', 'Candra', 'Dedi', 'Eka']).slice(0, 3);
      benar = nama[0] + ' lebih tinggi dari ' + nama[2];
      pertanyaan = 'Diketahui: ' + nama[0] + ' lebih tinggi dari ' + nama[1] + ', dan ' + nama[1] + ' lebih tinggi dari ' + nama[2] + '. Pernyataan yang PASTI benar adalah...';
      bahas = 'Relasi bersifat transitif: ' + nama[0] + ' > ' + nama[1] + ' > ' + nama[2] + '. Maka yang pasti benar hanya ' + nama[0] + ' lebih tinggi dari ' + nama[2] + '.';
      kandidat = [nama[2] + ' lebih tinggi dari ' + nama[0], nama[1] + ' lebih tinggi dari ' + nama[0], nama[0] + ' sama tinggi dengan ' + nama[2]];
    } else if (t === 5) {
      var jam = ri(1, 12), menit = pick([10, 15, 20, 25, 30, 40, 45, 50]);
      var sudut = Math.abs(30 * jam - 5.5 * menit);
      // hindari kasus degeneratif (jarum bertumpuk -> sudut 0, jawaban bisa 0 atau 360)
      if (sudut === 0) return verbal();
      benar = sudut > 180 ? 360 - sudut : sudut;
      pertanyaan = 'Berapa besar sudut TERKECIL antara jarum jam dan jarum menit pada pukul ' + jam + '.' + (menit < 10 ? '0' + menit : menit) + '?';
      bahas = 'Rumus: |30 x jam - 5,5 x menit| = |30 x ' + jam + ' - 5,5 x ' + menit + '| = ' + Math.abs(30 * jam - 5.5 * menit).toFixed(1) + ' derajat' + (sudut > 180 ? '. Karena lebih dari 180, sudut terkecil = 360 - ' + sudut.toFixed(1) + ' = ' + benar + ' derajat.' : '.');
      kandidat = [benar + 15, benar - 15, 360 - benar, benar + 30];
    } else {
      var kec = pick([40, 50, 60, 70, 80, 90]), jamT = pick([1.5, 2, 2.5, 3, 4]);
      benar = kec * jamT;
      pertanyaan = 'Kendaraan melaju dengan kecepatan tetap ' + kec + ' km/jam selama ' + jamT + ' jam. Berapa jarak yang ditempuh (km)?';
      bahas = 'Jarak = kecepatan x waktu = ' + kec + ' x ' + jamT + ' = ' + benar + ' km.';
      kandidat = [benar + kec, benar - kec, kec + jamT, benar / 2];
    }
    return buatItem('verbal', pertanyaan, benar, bersih(kandidat, benar), bahas, { kategori: 'IQ — Verbal & Aritmetika' });
  }

  var PEMBUAT = { angka: deretAngka, huruf: deretHuruf, matriks: matriks, rotasi: rotasi, verbal: verbal };

  function buatSatu(domain) {
    if (domain === 'campuran') return PEMBUAT[pick(['angka', 'huruf', 'matriks', 'rotasi', 'verbal'])]();
    var f = PEMBUAT[domain] || deretAngka;
    return f();
  }

  function buat(domain, n) {
    n = n || 10;
    var out = [], guard = 0;
    while (out.length < n && guard < n * 15) {
      guard++;
      var it;
      try { it = buatSatu(domain); } catch (e) { continue; }
      if (!it || !it.pilihan || it.jawaban < 0 || it.pilihan.length !== 4) continue;
      var sig = it.pertanyaan + '|' + it.pilihan.join(',') + '|' + it.jawaban + '|' +
                (it.svg ? it.svg.length : '') + '|' + (it.pilihanSvg ? it.pilihanSvg[it.jawaban] : '');
      var dup = false;
      for (var i = 0; i < out.length; i++) if (out[i]._sig === sig) { dup = true; break; }
      if (dup) continue;
      it._sig = sig;
      out.push(it);
    }
    return out;
  }

  return {
    buat: buat, buatSatu: buatSatu,
    deretAngka: deretAngka, deretHuruf: deretHuruf, matriks: matriks, rotasi: rotasi, verbal: verbal
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IQ_GEN: IQ_GEN, IQ_REF: IQ_REF, IQ_SVG: IQ_SVG };
}
