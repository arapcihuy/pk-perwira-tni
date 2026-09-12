
window.NAMA_APP = 'SiapPsikotes';
window.SUB_APP = 'Latihan Tes IQ, Psikotes Kerja & Kepribadian — Kedinasan, TNI, Polri, CPNS';

window.terapkanIdentitas = function () {
  document.title = NAMA_APP + ' — ' + SUB_APP;
  var m = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (m) m.setAttribute('content', NAMA_APP);
  var kunci = 'tni_brand_v1';
  try { localStorage.setItem(kunci, NAMA_APP); } catch (e) {}
};

window.JALUR = {
  kedinasan: {
    nama: 'Sekolah Kedinasan',
    singkat: 'Kedinasan',
    uji: ['SKD CAT — 110 soal / 100 menit: TWK 30 · TIU 35 (numerik, verbal, matematika, penalaran) · TKP 45',
          'Seleksi lanjutan tiap sekolah: psikologi, kesehatan, kebugaran, wawancara',
          'Sekolah: PKN STAN, IPDN, STIS, STMKG, STIN, Poltek SSN, Kemenhub'],
    sim: { judul: 'SKD Kedinasan', menit: 100, resmi: true,
           komposisi: { tkw: 30, numerik: 12, verbal: 8, matematika: 8, penalaran_logika: 7, kepribadian: 45 } },
    modul: ['iq', 'kraepelin', 'epss', 'gambar'],
    catatan: 'Komposisi SKD mengikuti format resmi (TWK 30, TIU 35, TKP 45). Seleksi lanjutan berbeda per sekolah.'
  },
  tni: {
    nama: 'TNI (Perwira/Bintara/Tamtama)',
    singkat: 'TNI',
    uji: ['Tes akademik / potensi akademik',
          'Psikotes: Kraepelin-Pauli, tes intelegensi, kepribadian, tes gambar',
          'Kesehatan (rikkes), kesamaptaan jasmani, wawancara'],
    sim: { judul: 'Akademik TNI', menit: 75, resmi: false,
           komposisi: { tkw: 12, numerik: 12, verbal: 8, matematika: 10, penalaran_logika: 8, kepribadian: 10 } },
    modul: ['iq', 'kraepelin', 'epss', 'gambar', 'daya_ingat'],
    catatan: 'Komposisi ini latihan, bukan komposisi resmi. Psikotes adalah tahap yang paling banyak menggugurkan.'
  },
  polri: {
    nama: 'Polri (Akpol/Bintara/Tamtama)',
    singkat: 'Polri',
    uji: ['CAT aspek pengetahuan',
          'CAT psikologi: intelegensi (IST/CFIT), kepribadian (MMPI/PAPI), Kraepelin-Pauli, tes gambar',
          'Rikkes, kesamaptaan, wawancara'],
    sim: { judul: 'Pengetahuan Polri', menit: 60, resmi: false,
           komposisi: { tkw: 15, numerik: 10, verbal: 10, penalaran_logika: 15, kepribadian: 10 } },
    modul: ['iq', 'kraepelin', 'epss', 'gambar', 'daya_ingat'],
    catatan: 'Polri memakai CAT psikologi. Latihan baterai penuh di bawah ini yang paling relevan.'
  },
  cpns: {
    nama: 'CPNS / PPPK',
    singkat: 'CPNS-PPPK',
    uji: ['SKD CAT — 110 soal / 100 menit: TWK 30 · TIU 35 (numerik, verbal, matematika, penalaran) · TKP 45',
          'Passing grade dan peringkat menentukan kelulusan',
          'PPPK memakai format serupa'],
    sim: { judul: 'SKD CPNS', menit: 100, resmi: true,
           komposisi: { tkw: 30, numerik: 12, verbal: 8, matematika: 8, penalaran_logika: 7, kepribadian: 45 } },
    modul: ['iq'],
    catatan: 'Komposisi SKD mengikuti format resmi. Psikotes umumnya bukan bagian SKD CPNS.'
  }
};

window.jalurAktif = function () {
  try { return localStorage.getItem('tni_jalur') || ''; } catch (e) { return ''; }
};
window.setJalur = function (k) {
  try { localStorage.setItem('tni_jalur', k); } catch (e) {}
  if (S.page === 'baterai') render(); else goHome();
};

window.bateri = function () {
  var modul = [
    { id: 'iq', nama: 'Tes Intelegensi (IQ)', mengukur: 'Logika, matriks, deret, rotasi, verbal — inti tes IST/CFIT',
      durasi: '10 soal/ronde', mulai: "navTo('iq')", label: 'Buka IQ Lab', tes: [] },
    { id: 'kraepelin', nama: 'Kraepelin / Pauli', mengukur: 'Kecepatan, ketelitian, ketahanan kerja di bawah tekanan',
      durasi: '10 kolom', mulai: "bukaKraepelinSim()", label: 'Mulai Kraepelin', tes: ['Tes Kraepelin'] },
    { id: 'daya_ingat', nama: 'Daya Ingat', mengukur: 'Rentang ingatan kata & konsentrasi',
      durasi: '1 ronde', mulai: "startPsiTest('memory_span')", label: 'Mulai Daya Ingat', tes: ['Tes Daya Ingat'] },
    { id: 'digit_span', nama: 'Rentang Angka (Digit Span)', mengukur: 'Rentang ingatan angka bertambah — bagian tes intelegensi',
      durasi: '1 ronde', mulai: "startPsiTest('digit_span')", label: 'Mulai Digit Span', tes: ['Digit Span'] },
    { id: 'aritmatika', nama: 'Aritmatika Lisan', mengukur: 'Kecepatan hitung mental',
      durasi: '1 ronde', mulai: "startPsiTest('aritmatika')", label: 'Mulai Aritmatika', tes: ['Aritmatika Lisan'] },
    { id: 'deret', nama: 'Deret Angka', mengukur: 'Pola bilangan — bagian TIU/inteligensi',
      durasi: '1 ronde', mulai: "startPsiTest('deret_angka')", label: 'Mulai Deret Angka', tes: ['Deret Angka'] },
    { id: 'epss', nama: 'Kepribadian (EPPS Militer)', mengukur: 'Kecenderungan perilaku kerja — TIDAK ada jawaban benar',
      durasi: '1 ronde', mulai: "startPsiTest('epps')", label: 'Mulai Kepribadian', tes: ['Tes Kepribadian'] },
    { id: 'gambar', nama: 'Tes Gambar (Wartegg, BAUM, DAP)', mengukur: 'Proyeksi kepribadian — tidak bisa dihafal',
      durasi: '—', mulai: "tutorGambar()", label: 'Cara menghadapinya', tes: [], belum: true }
  ];
  return modul;
};

function statusModul(m) {
  if (m.belum) return { lulus: false, teks: 'belum tersedia', skor: null };
  if (m.tes.length) {
    var h = (typeof PSI !== 'undefined' && PSI.history ? PSI.history : []).filter(function (x) {
      return m.tes.some(function (t) { return String(x.testName || '').indexOf(t) === 0; });
    });
    if (!h.length) return { lulus: false, teks: 'belum dicoba', skor: null };
    var terakhir = h[h.length - 1];
    return { lulus: true, teks: h.length + 'x · terakhir ' + terakhir.score + '%', skor: terakhir.score };
  }
  if (m.id === 'iq') {
    var log = (typeof loadIqLog === 'function') ? loadIqLog() : [];
    if (!log.length) return { lulus: false, teks: 'belum dicoba', skor: null };
    return { lulus: true, teks: log.length + ' ronde latihan', skor: null };
  }
  return { lulus: false, teks: 'belum dicoba', skor: null };
}

window.panelBaterai = function () {
  var modul = bateri();
  var sudah = modul.filter(function (m) { return statusModul(m).lulus; }).length;
  var bisa = modul.filter(function (m) { return !m.belum; }).length;
  var persen = Math.round((sudah / bisa) * 100);

  var kartu = modul.map(function (m, i) {
    var st = statusModul(m);
    var kelas = st.lulus ? 'baterai-item lulus' : (m.belum ? 'baterai-item kosong' : 'baterai-item');
    return '<div class="' + kelas + '">' +
      '<div class="baterai-num">' + (i + 1) + '</div>' +
      '<div class="baterai-isi">' +
        '<div class="baterai-nama">' + escapeHtml(m.nama) + '</div>' +
        '<div class="baterai-ukur">' + escapeHtml(m.mengukur) + '</div>' +
        '<div class="baterai-tanda">' + ic('clock', 12) + ' ' + m.durasi + ' · ' +
          (st.lulus ? '<span class="ok-text">' + st.teks + '</span>' : '<span class="hari-sub">' + st.teks + '</span>') +
        '</div>' +
      '</div>' +
      '<button class="btn ' + (st.lulus ? 'btn-secondary' : 'btn-primary') + ' btn-sm" onclick="' + m.mulai + '">' +
        (st.lulus ? 'Ulangi' : m.label) + '</button>' +
    '</div>';
  }).join('');

  return '<div class="card">' +
    '<div class="hari-head">' + ic('brain', 16) + ' <strong>Baterai Psikotes</strong>' +
      '<span class="hari-tgl">' + sudah + ' dari ' + bisa + ' modul</span></div>' +
    '<div class="prog-track" style="margin:8px 0 14px"><div class="prog-bar" style="width:' + persen + '%"></div></div>' +
    kartu +
    '<div class="hari-sub" style="margin-top:12px">Urutan ini mengikuti urutan yang umum dipakai panitia. ' +
    'Kerjakan berurutan, dan **jangan** menghafal jawaban tes kepribadian — yang dinilai adalah konsistensimu, ' +
    'bukan jawaban yang terdengar bagus.</div>' +
    '</div>';
};

window.mulaiSimulasiJalur = function (kunci) {
  var j = JALUR[kunci];
  if (!j) return;
  if (!katSiapSemua()) {
    S.pesanMemuat = 'Menyiapkan simulasi ' + j.sim.judul + '...';
    S.page = 'memuat';
    render();
    pastikanSemua().then(function () { mulaiSimulasiJalur(kunci); });
    return;
  }
  var semua = getAllSoal();
  var perKat = {};
  semua.forEach(function (s) { (perKat[s.kategori] = perKat[s.kategori] || []).push(s); });
  var pilih = [], kurang = 0;
  Object.keys(j.sim.komposisi).forEach(function (kat) {
    var bank = shuffle(perKat[namaKategori(kat)] || []);
    var ambil = bank.slice(0, j.sim.komposisi[kat]);
    if (ambil.length < j.sim.komposisi[kat]) kurang += (j.sim.komposisi[kat] - ambil.length);
    pilih = pilih.concat(ambil.map(acakOpsi));
  });
  var jumlah = Object.keys(j.sim.komposisi).reduce(function (a, k) { return a + j.sim.komposisi[k]; }, 0);
  if (kurang) {
    var ada = {};
    pilih.forEach(function (q) { ada[q.id] = 1; });
    var sisa = shuffle(semua.filter(function (q) { return !ada[q.id]; })).slice(0, kurang).map(acakOpsi);
    pilih = pilih.concat(sisa);
  }
  S.cat = 'format';
  S.mode = 'tryout';
  S.isSimulasi = true;
  S.isFormat = true;
  S.iqSpec = null;
  S.jalurSim = kunci;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
  S.dur = {};
  S.tSoalIdx = -1;
  S.questions = pilih.slice(0, jumlah);
  S.timed = true;
  S.tampilkanKunci = false;
  S.totalTime = j.sim.menit * 60;
  S.timeLeft = S.totalTime;
  if (S.timer) { clearInterval(S.timer); S.timer = null; }
  S.page = 'soal';
  render();
};


function barisPembahasan(q) {
  return String(q.pembahasan || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
}

window.tutorSoal = function () {
  var q = S.questions[S.idx];
  if (!q) return '';
  var baris = barisPembahasan(q);
  var cara = baris.filter(function (b) { return b.indexOf('JAWABAN:') !== 0 && b.indexOf('INGAT:') !== 0; }).join(' ');
  var ingat = (baris.filter(function (b) { return b.indexOf('INGAT:') === 0; })[0] || '').replace('INGAT:', '').trim();
  var kunci = q.pilihan[q.jawaban];

  var salah = q.pilihan.map(function (p, i) {
    if (i === q.jawaban) return '';
    return '<div class="tutor-opsi"><strong>' + String.fromCharCode(65 + i) + '.</strong> ' +
      escapeHtml(p) + ' <span class="hari-sub">— bukan jawabannya; pembedanya: ' + escapeHtml(kunci) + '</span></div>';
  }).join('');

  var topik = q.topik || '';
  var serupa = (typeof getAllSoal === 'function') ? getAllSoal().filter(function (x) {
    return x.topik === topik && x.id !== q.id;
  }).length : 0;

  return '<div class="card tutor">' +
    '<div class="hari-head">' + ic('bulb', 16) + ' <strong>Tutor</strong>' +
      '<span class="hari-tgl">dari materi teraudit — bukan karangan AI</span></div>' +

    '<div class="tutor-blok"><div class="tutor-judul">Inti cara mengerjakannya</div>' +
      '<div class="tutor-isi">' + escapeHtml(cara) + '</div></div>' +

    (ingat ? '<div class="tutor-blok"><div class="tutor-judul">Kiat ingat</div>' +
      '<div class="tutor-isi">' + escapeHtml(ingat) + '</div></div>' : '') +

    '<div class="tutor-blok"><div class="tutor-judul">Kunci dan pembeda tiap opsi</div>' +
      '<div class="tutor-isi">' + escapeHtml(kunci) + ' adalah jawabannya.</div>' + salah + '</div>' +

    '<div class="tutor-aksi">' +
      (topik && serupa ? '<button class="btn btn-secondary btn-sm" onclick="tutorLatihTopik()">' +
        ic('target', 14) + ' Latih topik ini (' + serupa + ' soal teraudit)</button>' : '') +
      '<button class="btn btn-ghost btn-sm" onclick="bukaLapor(S.questions[S.idx].id)">' +
        ic('flag', 14) + ' Pembahasan masih membingungkan</button>' +
    '</div>' +
    '<div class="hari-sub" style="margin-top:10px">Tutor ini tidak mengarang penjelasan baru: seluruh isinya diambil ' +
    'dari pembahasan yang sudah lulus PERATURAN MUTU SOAL. Kalau masih belum jelas, tekan tombol laporan di atas — ' +
    'itu masuk daftar prioritas audit.</div>' +
    '</div>';
};

window.tutorLatihTopik = function () {
  var q = S.questions[S.idx];
  if (!q || !q.topik) return;
  if (typeof drillTopik === 'function') drillTopik(q.topik, 10);
  else { goHome(); }
};

window.tutorGambar = function () {
  alert('Tes gambar (Wartegg 8 kotak, BAUM/pohon, DAP/orang, HTP) menilai cara kamu menghadapi tugas yang tidak jelas — ' +
    'bukan gambar bagus atau jelek.\n\nYang dinilai pengamat:\n' +
    '1. Kelengkapan: semua kotak diisi, tidak ada yang dikosongkan.\n' +
    '2. Urutan dan tekanan garis: ragu-ragu atau yakin.\n' +
    '3. Posisi gambar terhadap kotak: penuh, menyusut, atau keluar batas.\n' +
    '4. Tema yang berulang di beberapa kotak.\n\n' +
    'Kesalahan umum: mengosongkan kotak karena takut salah, menggambar terlalu kecil, dan menyalin gaya gambar orang lain ' +
    'sehingga hasilnya tidak konsisten.\n\n' +
    'Karena itu tes gambar tidak bisa dihafal — yang bisa disiapkan hanya ketenangan dan kelengkapan.');
};

window.AI_KEBIJAKAN = {
  hanyaMengajar: true,
  hanyaOffline: true,
  aiOnline: false,
  biayaPerPertanyaan: 0,
  catatan: 'Tidak ada AI online di aplikasi ini. Tutor bekerja dari materi teraudit; model kecil (bila dipasang) berjalan di perangkat.'
};

window.aiOnlineDilarang = function () {
  return AI_KEBIJAKAN.aiOnline === false;
};

window.aiOfflineStatus = function () {
  var ada = (typeof navigator !== 'undefined' && navigator.gpu) ? true : false;
  return { didukungWebGPU: ada, aktif: false, ukuranUnduhan: '±400 MB', model: 'model kecil di perangkat' };
};

window.panelAiOffline = function () {
  var s = aiOfflineStatus();
  return '<div class="card">' +
    '<div class="hari-head">' + ic('brain', 16) + ' <strong>AI Tutor offline</strong>' +
      '<span class="hari-tgl">' + (s.aktif ? 'aktif' : 'belum aktif') + '</span></div>' +
    '<div class="hari-sub">Rencananya: satu kali unduh ' + s.ukuranUnduhan + ' (model kecil di perangkat), lalu bisa ' +
    'menjelaskan ulang dengan bahasa lebih sederhana <strong>tanpa internet dan tanpa akun</strong>. ' +
    'Perangkatmu ' + (s.didukungWebGPU ? '<span class="ok-text">mendukung</span>' : '<span class="warn-text">belum mendukung</span>') +
    ' (WebGPU).</div>' +
    '<div class="hari-sub" style="margin-top:8px"><strong>Batas yang saya pegang:</strong> AI ini tidak boleh mengarang ' +
    'fakta. Ia hanya menulis ulang penjelasan yang sudah diaudit. Kalau jawabannya tidak ada di materi, ia harus bilang ' +
    'tidak ada — bukan mengira-ngira. Soal baru hasil AI pun wajib lewat PERATURAN MUTU SOAL sebelum dipakai.</div>' +
    '<div class="hari-sub" style="margin-top:8px">Sementara ini, tutor berbasis materi teraudit sudah jalan penuh ' +
    'tanpa unduhan (lihat tombol <strong>Tutor</strong> saat mengerjakan soal).</div>' +
    '<div class="hari-sub" style="margin-top:8px"><strong>Tidak ada AI online di aplikasi ini.</strong> ' +
    'Tidak ada langganan API, tidak ada biaya per pertanyaan, tidak ada data yang dikirim keluar — ' +
    'AI-nya hanya untuk mengajar, dan itu pun berjalan di perangkatmu.</div>' +
    '</div>';
};

window.renderBateraiPsi = function () {
  var j = jalurAktif();
  var jj = j && JALUR[j] ? JALUR[j] : null;
  var URUTAN_JALUR = ['umum', 'kedinasan', 'tni', 'polri', 'cpns'];
  var kunciJalur = URUTAN_JALUR.filter(function (k) { return !!JALUR[k]; })
    .concat(Object.keys(JALUR).filter(function (k) { return URUTAN_JALUR.indexOf(k) < 0; }));
  var kartuJalur = kunciJalur.map(function (k) {
    var x = JALUR[k];
    var aktif = k === j;
    return '<button class="jalur-btn' + (aktif ? ' on' : '') + '" onclick="setJalur(\'' + k + '\')">' +
      '<span class="jalur-nama">' + escapeHtml(x.singkat) + '</span>' +
      (k === 'umum' ? '<span class="jalur-ket">pencari kerja</span>' : '') + '</button>';
  }).join('');

  return '<div class="card">' +
      '<div class="hari-head">' + ic('compass', 16) + ' <strong>Pilih jalur seleksimu</strong></div>' +
      '<div class="hari-sub">Pilihan ini menentukan simulasi dan modul yang disarankan.</div>' +
      '<div class="jalur-bar">' + kartuJalur + '</div>' +
      (jj ? '<div class="jalur-detail"><div class="tutor-judul">' + escapeHtml(jj.nama) + '</div>' +
        jj.uji.map(function (u) { return '<div class="jalur-uji">' + ic('check', 13) + ' ' + escapeHtml(u) + '</div>'; }).join('') +
        '<div class="hari-sub" style="margin-top:8px">' + escapeHtml(jj.catatan) + '</div>' +
        '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="mulaiSimulasiJalur(\'' + j + '\')">' +
          ic('clock', 14) + ' Mulai simulasi ' + escapeHtml(jj.sim.judul) + '</button>' +
        '</div>' : '') +
    '</div>' +
    panelBaterai() +
    panelAiOffline() +
    '<div class="card">' +
      '<div class="hari-head">' + ic('list', 16) + ' <strong>Semua alat tes satu per satu</strong></div>' +
      '<div class="hari-sub">Kalau ingin memilih langsung, semua tes juga bisa dibuka dari halaman Psikologi.</div>' +
      '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="navTo(\'psikologi\')">Buka daftar lengkap</button>' +
    '</div>';
};


var _renderSebelumFitur7 = window.render;
window.render = function () {
  if (_renderSebelumFitur7) _renderSebelumFitur7.apply(this, arguments);
  try { sisipPanel7(); } catch (e) {}
};

function sisipPanel7() {
  var m = document.getElementById('main');
  if (!m) return;

  if (S.page === 'baterai') {
    m.innerHTML = renderBateraiPsi();
    tandaiNavAktif7();
    return;
  }

  if (S.page === 'soal' && S.mode === 'learn') {
    var q = S.questions[S.idx];
    var sudahDijawab = S.answers && S.answers[S.idx] !== undefined;
    var blok = m.querySelector('.explanation.show') || m.querySelector('.explanation');
    if (q && sudahDijawab && blok && !m.querySelector('.tutor')) {
      var sisip = document.createElement('div');
      sisip.innerHTML = tutorSoal();
      blok.insertAdjacentElement('afterend', sisip.firstElementChild);
    }
  }

  if (S.page === 'home') {
    var j = jalurAktif();
    if (j && JALUR[j] && !document.querySelector('.jalur-aktif-badge')) {
      var head = m.querySelector('.home-head') || m.firstElementChild;
      if (head) {
        var b = document.createElement('div');
        b.className = 'jalur-aktif-badge';
        b.innerHTML = ic('compass', 13) + ' Jalur: <strong>' + escapeHtml(JALUR[j].nama) + '</strong>' +
          ' <button class="btn btn-ghost btn-sm" onclick="navTo(\'baterai\')">Ubah</button>';
        head.insertAdjacentElement('afterend', b);
      }
    }
  }
}

function tandaiNavAktif7() {
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    var p = b.getAttribute('data-page');
    b.classList.toggle('active', p === 'baterai' || (S.page === 'baterai' && p === 'psikologi'));
  });
}

window.terapkanIdentitas();
