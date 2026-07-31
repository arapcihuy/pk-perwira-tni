
// ============================================================
// TNI PERWIRA BELAJAR — app.js
// Semua fungsi di window scope agar inline onclick bisa akses
// ============================================================

// ---- STATE ----
var S = {
  page: 'home',
  mode: null,        // 'tryout' | 'learn' | 'drill'
  cat: 'all',
  questions: [],
  idx: 0,
  answers: {},       // idx -> pilihan index user
  timer: null,
  timeLeft: 0,
  totalTime: 0,
  bankCat: 'all',
  wrongIds: [],      // ids soal yang salah untuk drill
};

// ---- UTILS ----
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function katIcon(k) {
  var m = { tkw:'🏛️', matematika:'🔢', bahasa_inggris:'🌐',
            penalaran_logika:'🧠', numerik:'📊', verbal:'📝',
            kraepelin:'⚡', tes_gambar:'🎯', kepribadian:'🧩' };
  return m[k] || '📋';
}

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('tni_prog') || '{}'); } catch(e) { return {}; }
}
function saveProgress(p) { localStorage.setItem('tni_prog', JSON.stringify(p)); }

function loadScores() {
  try { return JSON.parse(localStorage.getItem('tni_scores') || '[]'); } catch(e) { return []; }
}
function saveScores(arr) { localStorage.setItem('tni_scores', JSON.stringify(arr)); }

// ---- RENDER ROUTER ----
function render() {
  var m = document.getElementById('main');
  if (!m) return;

  document.querySelectorAll('.nav-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.page === S.page);
  });

  // Keyboard hint hanya saat soal
  var kbh = document.getElementById('kbHint');
  if (kbh) kbh.classList.toggle('show', S.page === 'soal');

  switch (S.page) {
    case 'home':  m.innerHTML = renderHome();  break;
    case 'cat':   m.innerHTML = renderCat();   break;
    case 'soal':  m.innerHTML = renderSoal();  startTimerIfNeeded(); break;
    case 'hasil': m.innerHTML = renderHasil(); break;
    case 'bank':  m.innerHTML = renderBank();  break;
    case 'prog':  m.innerHTML = renderProg();  break;
  }
}

// ---- HOME ----
function renderHome() {
  var all = getAllSoal();
  var scores = loadScores();
  var avgScore = '-';
  if (scores.length > 0) {
    var sum = scores.reduce(function(a,b){ return a + b.nilai; }, 0);
    avgScore = Math.round(sum / scores.length);
  }
  var catKeys = Object.keys(SOAL_DATABASE);

  var catCards = catKeys.map(function(k) {
    var v = SOAL_DATABASE[k];
    return '<div class="card" style="cursor:pointer;padding:16px" onclick="startCat(\'' + k + '\',\'tryout\')">' +
      '<div style="font-size:24px;margin-bottom:8px">' + katIcon(k) + '</div>' +
      '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">' + v.nama + '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">' + v.soal.length + ' soal</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();startCat(\'' + k + '\',\'tryout\')">⏱ Tryout</button>' +
        '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();startCat(\'' + k + '\',\'learn\')">📖 Belajar</button>' +
      '</div></div>';
  }).join('');

  return '<div style="margin-bottom:20px">' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Selamat datang 👋</div>' +
    '<div style="font-size:13px;color:var(--text2)">Platform belajar PK Perwira TNI — gratis, offline, tanpa akun.</div>' +
    '</div>' +

    '<div class="grid-3" style="margin-bottom:20px">' +
      '<div class="card card-gold card-sm">' +
        '<div class="card h3">Total Soal</div>' +
        '<div class="card num">' + all.length + '</div>' +
        '<div class="card sub">' + catKeys.length + ' kategori materi</div>' +
      '</div>' +
      '<div class="card card-sm">' +
        '<div class="card h3">Tryout Selesai</div>' +
        '<div class="card num">' + scores.length + '</div>' +
        '<div class="card sub">sesi tryout</div>' +
      '</div>' +
      '<div class="card card-sm">' +
        '<div class="card h3">Rata-rata Nilai</div>' +
        '<div class="card num">' + avgScore + '</div>' +
        '<div class="card sub">dari 100</div>' +
      '</div>' +
    '</div>' +

    '<div style="display:flex;gap:10px;margin-bottom:12px">' +
      '<button class="btn btn-primary btn-lg" style="flex:1" onclick="goPage(\'cat\',\'tryout\')">⏱ Mulai Tryout</button>' +
      '<button class="btn btn-secondary btn-lg" style="flex:1" onclick="goPage(\'cat\',\'learn\')">📖 Mode Belajar</button>' +
    '</div>' +
    '<div style="margin-bottom:24px">' +
      '<button class="btn btn-danger btn-lg" style="width:100%" onclick="startSimulasi60()">🎯 Simulasi PK Perwira — 60 Soal · 90 Menit</button>' +
    '</div>' +
    '</div>' +

    '<div class="tips-box">' +
      '<div class="tips-title">💡 Tips Persiapan PK Perwira TNI</div>' +
      '<ul>' +
        '<li>Kerjakan minimal 1 tryout per hari, review semua yang salah</li>' +
        '<li>Fokus TWK (Wawasan Kebangsaan) — bobotnya besar di seleksi</li>' +
        '<li>Latihan numerik 15 menit setiap hari untuk kecepatan berhitung</li>' +
        '<li>Target nilai 80+ untuk lebih aman — minimum lulus 70</li>' +
        '<li>Tekan tombol 1/2/3/4 untuk pilih jawaban saat tryout</li>' +
      '</ul>' +
    '</div>' +

    '<div class="section-title">Pilih Kategori Langsung</div>' +
    '<div class="grid-auto">' + catCards + '</div>';
}

// ---- PILIH KATEGORI ----
function renderCat() {
  var isTO = S.mode === 'tryout';
  var all = getAllSoal();
  var catKeys = Object.keys(SOAL_DATABASE);

  var items = '<div class="kat-card" onclick="startCat(\'all\',\'' + S.mode + '\')">' +
    '<div class="kat-icon">🎯</div>' +
    '<div class="kat-name">Semua Kategori</div>' +
    '<div class="kat-sub">' + all.length + ' soal · acak</div>' +
    '</div>';

  catKeys.forEach(function(k) {
    var v = SOAL_DATABASE[k];
    items += '<div class="kat-card" onclick="startCat(\'' + k + '\',\'' + S.mode + '\')">' +
      '<div class="kat-icon">' + katIcon(k) + '</div>' +
      '<div class="kat-name">' + v.nama + '</div>' +
      '<div class="kat-sub">' + v.soal.length + ' soal</div>' +
      '</div>';
  });

  return '<div class="mode-badge">' + (isTO ? '⏱ Mode Tryout dengan Timer' : '📖 Mode Belajar tanpa Timer') + '</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">' +
    (isTO ? 'Tryout' : 'Mode Belajar') + '</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:20px">Pilih kategori soal:</div>' +
    '<div class="grid-auto">' + items + '</div>';
}

// ---- START ----
function startCat(cat, mode) {
  S.cat = cat;
  S.mode = mode;
  S.idx = 0;
  S.answers = {};

  if (cat === 'all') {
    S.questions = shuffle(getAllSoal());
  } else {
    var db = SOAL_DATABASE[cat];
    S.questions = shuffle(db.soal.map(function(s) {
      return Object.assign({}, s, { kategori: db.nama });
    }));
  }

  S.totalTime = S.questions.length * 90;
  S.timeLeft = S.totalTime;
  if (S.timer) { clearInterval(S.timer); S.timer = null; }

  S.page = 'soal';
  render();
}

// ---- SOAL ----
function renderSoal() {
  if (!S.questions.length) return '<div class="empty"><div class="empty-icon">⚠️</div><p>Tidak ada soal.</p></div>';

  var q = S.questions[S.idx];
  var n = S.questions.length;
  var pct = Math.round((S.idx / n) * 100);
  var letters = ['A','B','C','D'];
  var ans = S.answers[S.idx];
  var answered = ans !== undefined;

  var timerHtml = '';
  if (S.mode === 'tryout') {
    var mn = Math.floor(S.timeLeft / 60);
    var sc = S.timeLeft % 60;
    var cls = S.timeLeft < 30 ? 'danger' : (S.timeLeft < 90 ? 'warning' : '');
    timerHtml = '<div class="timer-box"><div class="label">Sisa Waktu</div>' +
      '<div class="timer-num ' + cls + '">' + pad(mn) + ':' + pad(sc) + '</div></div>';
  }

  var opts = q.pilihan.map(function(p, i) {
    var cls = 'option';
    if (answered) {
      cls += ' locked';
      if (i === q.jawaban) cls += ' correct';
      else if (i === ans) cls += ' wrong';
    } else {
      if (i === ans) cls += ' selected';
    }
    var onclick = answered ? '' : 'onclick="pickAnswer(' + i + ')"';
    return '<div class="' + cls + '" ' + onclick + '>' +
      '<div class="option-letter">' + letters[i] + '</div>' +
      '<span>' + p + '</span>' +
      '</div>';
  }).join('');

  var expHtml = '';
  if (answered && S.mode === 'learn') {
    expHtml = '<div class="explanation show"><strong>📖 Pembahasan</strong>' + q.pembahasan + '</div>';
  }

  var prevBtn = '<button class="btn btn-ghost btn-sm" onclick="prevQ()"' + (S.idx === 0 ? ' disabled' : '') + '>← Sebelumnya</button>';
  var nextBtn = '';
  if (S.idx < n - 1) {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="nextQ()">Berikutnya →</button>';
  } else {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="finishSession()">✅ Selesai</button>';
  }
  var skipBtn = (!answered && S.mode === 'tryout')
    ? '<button class="btn btn-ghost btn-sm" onclick="skipQ()">Lewati</button>' : '';

  return '<div class="soal-wrap">' +
    '<div class="soal-head">' +
      '<div>' +
        '<div class="label">Soal</div>' +
        '<div class="value">' + (S.idx + 1) + ' / ' + n + '</div>' +
      '</div>' +
      timerHtml +
    '</div>' +
    '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="soal-body">' +
      '<div class="soal-cat-tag">' + (q.kategori || 'Umum') + '</div>' +
      '<div class="soal-text">' + q.pertanyaan + '</div>' +
      (q.gambar ? '<div class="soal-img"><img src="' + q.gambar + '" alt="Gambar soal" style="max-width:100%;max-height:320px;border-radius:8px;margin:10px 0;display:block;border:1px solid var(--border)"></div>' : '') +
      '<div class="options">' + opts + '</div>' +
    '</div>' +
    expHtml +
    '<div class="soal-foot">' +
      prevBtn +
      '<div style="display:flex;gap:6px">' + skipBtn + nextBtn + '</div>' +
    '</div>' +
  '</div>';
}

// ---- TIMER ----
function startTimerIfNeeded() {
  if (S.mode !== 'tryout') return;
  if (S.timer) return;
  S.timer = setInterval(function() {
    S.timeLeft--;
    if (S.timeLeft <= 0) {
      clearInterval(S.timer); S.timer = null;
      finishSession();
      return;
    }
    var el = document.querySelector('.timer-num');
    if (el) {
      var mn = Math.floor(S.timeLeft / 60);
      var sc = S.timeLeft % 60;
      el.textContent = pad(mn) + ':' + pad(sc);
      el.className = 'timer-num ' + (S.timeLeft < 30 ? 'danger' : (S.timeLeft < 90 ? 'warning' : ''));
    }
  }, 1000);
}

// ---- ACTIONS ----
window.pickAnswer = function(i) {
  if (S.answers[S.idx] !== undefined) return;
  S.answers[S.idx] = i;

  var q = S.questions[S.idx];
  var prog = loadProgress();
  var kat = q.kategori || 'Umum';
  if (!prog[kat]) prog[kat] = { total: 0, benar: 0 };
  prog[kat].total++;
  if (i === q.jawaban) prog[kat].benar++;
  saveProgress(prog);

  render();
  if (S.mode === 'tryout') startTimerIfNeeded();
};

window.nextQ = function() {
  if (S.idx < S.questions.length - 1) {
    S.idx++;
    render();
    if (S.mode === 'tryout') startTimerIfNeeded();
  }
};

window.prevQ = function() {
  if (S.idx > 0) {
    S.idx--;
    render();
    if (S.mode === 'tryout') startTimerIfNeeded();
  }
};

window.skipQ = function() {
  if (S.idx < S.questions.length - 1) {
    S.idx++;
    render();
    startTimerIfNeeded();
  } else {
    finishSession();
  }
};

window.finishSession = function() {
  clearInterval(S.timer); S.timer = null;
  S.page = 'hasil';
  render();
};

// ---- HASIL ----
function renderHasil() {
  var n = S.questions.length;
  var benar = 0, salah = 0, skip = 0;
  for (var i = 0; i < n; i++) {
    var a = S.answers[i];
    if (a === undefined) skip++;
    else if (a === S.questions[i].jawaban) benar++;
    else salah++;
  }
  var nilai = Math.round((benar / n) * 100);
  var lulus = nilai >= 70;

  var scores = loadScores();
  scores.push({ nilai: nilai, benar: benar, salah: salah, skip: skip,
                tgl: new Date().toLocaleDateString('id-ID') });
  if (scores.length > 10) scores.shift();
  saveScores(scores);

  var tUsed = S.totalTime - S.timeLeft;
  var tStr = S.mode === 'tryout'
    ? Math.floor(tUsed / 60) + ' mnt ' + (tUsed % 60) + ' dtk' : '-';

  return '<div class="result-wrap">' +
    '<div class="result-circle ' + (lulus ? 'pass' : 'fail') + '">' +
      '<div class="score">' + nilai + '</div>' +
      '<div class="score-label">/ 100</div>' +
    '</div>' +
    '<div class="result-status ' + (lulus ? 'pass' : 'fail') + '">' +
      (lulus ? '✅ LULUS — Nilai ≥ 70' : '❌ Belum Lulus — Nilai < 70') +
    '</div>' +
    '<div class="result-stats">' +
      '<div class="result-stat"><div class="rs-num rs-correct">' + benar + '</div><div class="rs-lbl">Benar</div></div>' +
      '<div class="result-stat"><div class="rs-num rs-wrong">' + salah + '</div><div class="rs-lbl">Salah</div></div>' +
      '<div class="result-stat"><div class="rs-num">' + skip + '</div><div class="rs-lbl">Dilewati</div></div>' +
      (S.mode === 'tryout' ? '<div class="result-stat"><div class="rs-num" style="font-size:16px">' + tStr + '</div><div class="rs-lbl">Waktu</div></div>' : '') +
    '</div>' +
    '<div class="result-actions">' +
      '<button class="btn btn-primary" onclick="retrySession()">🔄 Ulangi</button>' +
      '<button class="btn btn-secondary" onclick="reviewSession()">📋 Review</button>' +
      (salah > 0 ? '<button class="btn btn-danger btn-sm" onclick="drillWrong()">🎯 Drill ' + salah + ' Soal Salah</button>' : '') +
      '<button class="btn btn-ghost" onclick="goHome()">🏠 Beranda</button>' +
    '</div>' +
    '</div>';
}

window.retrySession = function() { startCat(S.cat, S.mode); };

window.drillWrong = function() {
  // Kumpulkan soal yang dijawab salah
  var wrongQ = [];
  for (var i = 0; i < S.questions.length; i++) {
    var a = S.answers[i];
    if (a !== undefined && a !== S.questions[i].jawaban) {
      wrongQ.push(S.questions[i]);
    }
  }
  if (!wrongQ.length) return;
  S.mode = 'learn';
  S.questions = shuffle(wrongQ);
  S.idx = 0;
  S.answers = {};
  S.totalTime = 0;
  S.timeLeft = 0;
  S.page = 'soal';
  render();
};

window.startSimulasi60 = function() {
  // Simulasi tryout 60 soal 90 menit persis format PK Perwira
  var all = getAllSoal();
  S.cat = 'all';
  S.mode = 'tryout';
  S.questions = shuffle(all).slice(0, 60);
  S.idx = 0;
  S.answers = {};
  S.totalTime = 5400; // 90 menit = 5400 detik
  S.timeLeft = 5400;
  if (S.timer) { clearInterval(S.timer); S.timer = null; }
  S.page = 'soal';
  render();
};

window.reviewSession = function() {
  // Tampilkan semua soal dalam mode belajar dengan jawaban yang sudah ada
  S.mode = 'learn';
  S.idx = 0;
  S.page = 'soal';
  render();
};

// ---- BANK SOAL ----
function renderBank() {
  var catKeys = Object.keys(SOAL_DATABASE);
  var list = [];
  catKeys.forEach(function(k) {
    if (S.bankCat === 'all' || S.bankCat === k) {
      SOAL_DATABASE[k].soal.forEach(function(s) {
        list.push(Object.assign({}, s, { katKey: k, katNama: SOAL_DATABASE[k].nama }));
      });
    }
  });

  var opts = '<option value="all"' + (S.bankCat==='all'?' selected':'') + '>Semua Kategori</option>';
  catKeys.forEach(function(k) {
    opts += '<option value="' + k + '"' + (S.bankCat===k?' selected':'') + '>' + SOAL_DATABASE[k].nama + '</option>';
  });

  var items = list.map(function(s, i) {
    // Encode soal ke base64 untuk menghindari masalah quote
    var encoded = btoa(encodeURIComponent(JSON.stringify(s)));
    return '<div class="bank-item" onclick="showModal(\'' + encoded + '\')">' +
      '<div class="bi-meta">' + (i+1) + '. ' + s.katNama + '</div>' +
      '<div class="bi-q">' + s.pertanyaan + '</div>' +
      '</div>';
  }).join('');

  return '<div class="bank-filters">' +
    '<span style="font-size:13px;font-weight:600;color:var(--text)">Bank Soal</span>' +
    '<select onchange="setBankCat(this.value)">' + opts + '</select>' +
    '<span class="bank-count">' + list.length + ' soal</span>' +
    '</div>' +
    '<p style="font-size:12px;color:var(--text3);margin-bottom:14px">Klik soal untuk lihat kunci jawaban dan pembahasan.</p>' +
    items +
    renderModal();
}

window.setBankCat = function(v) { S.bankCat = v; S.page = 'bank'; render(); };

function renderModal() {
  return '<div class="modal-bg" id="soalModal">' +
    '<div class="modal-box">' +
      '<button class="modal-close-btn" onclick="closeModal()">✕ Tutup</button>' +
      '<div class="modal-cat" id="mCat"></div>' +
      '<div class="modal-q" id="mQ"></div>' +
      '<div id="mOpts"></div>' +
      '<div class="modal-exp" id="mExp"></div>' +
    '</div>' +
  '</div>';
}

window.showModal = function(encoded) {
  var s;
  try { s = JSON.parse(decodeURIComponent(atob(encoded))); } catch(e) { return; }
  var letters = ['A','B','C','D'];
  document.getElementById('mCat').textContent = s.katNama || '';
  document.getElementById('mQ').textContent = s.pertanyaan;
  // Tampilkan gambar jika ada
  var imgHtml = s.gambar ? '<div style="text-align:center;margin:10px 0"><img src="' + s.gambar + '" alt="Gambar soal" style="max-width:100%;max-height:280px;border-radius:8px;border:1px solid #333"></div>' : '';
  document.getElementById('mQ').innerHTML = s.pertanyaan + imgHtml;
  document.getElementById('mOpts').innerHTML = s.pilihan.map(function(p, i) {
    var isKey = i === s.jawaban;
    return '<div class="modal-opt' + (isKey ? ' key' : '') + '">' +
      letters[i] + '. ' + p +
      (isKey ? '<span class="modal-key-label">✅ Kunci</span>' : '') +
      '</div>';
  }).join('');
  document.getElementById('mExp').innerHTML = '<strong>📖 Pembahasan</strong><br>' + s.pembahasan;
  document.getElementById('soalModal').classList.add('open');
};

window.closeModal = function() {
  var m = document.getElementById('soalModal');
  if (m) m.classList.remove('open');
};

// ---- PROGRESS ----
function renderProg() {
  var prog = loadProgress();
  var scores = loadScores();
  var catKeys = Object.keys(SOAL_DATABASE);

  var rows = catKeys.map(function(k) {
    var nama = SOAL_DATABASE[k].nama;
    var p = prog[nama] || { total: 0, benar: 0 };
    var pct = p.total > 0 ? Math.round((p.benar / p.total) * 100) : 0;
    return '<div class="prog-row">' +
      '<div class="prog-label">' + katIcon(k) + ' ' + nama + '</div>' +
      '<div class="prog-track"><div class="prog-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="prog-pct">' + pct + '%</div>' +
      '</div>' +
      '<div class="prog-detail">' + p.benar + '/' + p.total + ' soal benar</div>';
  }).join('');

  var hist = scores.length === 0
    ? '<div class="empty"><div class="empty-icon">📋</div><p>Belum ada tryout selesai.</p></div>'
    : '<div class="history-grid">' + scores.map(function(s, i) {
        return '<div class="history-item">' +
          '<div class="h-score ' + (s.nilai>=70?'h-pass':'h-fail') + '">' + s.nilai + '</div>' +
          '<div class="h-date">' + (s.tgl||'') + '</div>' +
          '<div class="h-detail">✅' + s.benar + ' ❌' + s.salah + ' ⏭' + s.skip + '</div>' +
        '</div>';
      }).join('') + '</div>';

  return '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:20px">📈 Progress Belajar</div>' +
    '<div class="section-title">Akurasi per Kategori</div>' +
    '<div style="margin-bottom:24px">' + rows + '</div>' +
    '<div class="section-title">Riwayat Tryout</div>' +
    '<div style="margin-bottom:20px">' + hist + '</div>' +
    '<button class="btn btn-danger btn-sm" onclick="resetAll()">🗑️ Reset Semua Data</button>';
}

window.resetAll = function() {
  if (confirm('Hapus semua progress dan riwayat tryout?')) {
    localStorage.removeItem('tni_prog');
    localStorage.removeItem('tni_scores');
    render();
  }
};

// ---- NAV HELPERS ----
window.goPage = function(page, mode) {
  clearInterval(S.timer); S.timer = null;
  S.mode = mode || null;
  S.page = page;
  render();
};

window.goHome = function() { goPage('home'); };

window.navTo = function(page) {
  clearInterval(S.timer); S.timer = null;
  if (page === 'bank') S.bankCat = 'all';
  S.page = page;
  render();
};

// ---- KEYBOARD ----
document.addEventListener('keydown', function(e) {
  if (S.page !== 'soal') return;
  var map = { '1':0, '2':1, '3':2, '4':3 };
  if (map[e.key] !== undefined) {
    if (S.answers[S.idx] === undefined) pickAnswer(map[e.key]);
  } else if (e.key === 'ArrowRight') {
    nextQ();
  } else if (e.key === 'ArrowLeft') {
    prevQ();
  }
});

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  var modal = document.getElementById('soalModal');
  if (modal && e.target === modal) closeModal();
});

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  // Update header stats
  var allSoal = getAllSoal();
  var el1 = document.getElementById('hStatSoal');
  var el2 = document.getElementById('hStatKat');
  var el3 = document.getElementById('hStatTO');
  if (el1) el1.textContent = allSoal.length;
  if (el2) el2.textContent = Object.keys(SOAL_DATABASE).length;
  if (el3) el3.textContent = loadScores().length;
  render();
});

window.renderTips = function(katKey) {
  if (!katKey) katKey = 'umum';
  var data = (typeof TIPS_DATA !== 'undefined') ? TIPS_DATA : null;
  if (!data) return '<div class="empty"><p>Data tips tidak ditemukan.</p></div>';
  var tabKeys = Object.keys(data);
  var tabs = tabKeys.map(function(k) {
    var icons = {umum:'🎯',tkw:'🏛️',matematika:'🔢',bahasa_inggris:'🌐',penalaran_logika:'🧠',numerik:'📊',verbal:'📝',kraepelin:'⚡',tes_gambar:'🎯',kepribadian:'🧩'};
    var label = (icons[k]||'📋') + ' ' + (k==='umum'?'Umum':k==='tkw'?'TWK':k==='matematika'?'MTK':k==='bahasa_inggris'?'Inggris':k==='penalaran_logika'?'Logika':k==='numerik'?'Numerik':k==='verbal'?'Verbal':k==='kraepelin'?'Kraepelin':k==='tes_gambar'?'Tes Gambar':k==='kepribadian'?'Kepribadian':k);
    return '<button class="btn '+(k===katKey?'btn-primary':'btn-secondary')+' btn-sm" onclick="window.showTips(\''+k+'\')">'+label+'</button>';
  }).join('');
  var d = data[katKey];
  if (!d) return '<div class="empty"><p>Tips tidak ditemukan.</p></div>';
  var cards = d.tips.map(function(t,i) {
    return '<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:flex-start;gap:12px">'+
      '<div style="background:var(--gold);color:var(--primary);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">'+(i+1)+'</div>'+
      '<div><div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:6px">'+t.judul+'</div>'+
      '<div style="font-size:13px;color:var(--text2);line-height:1.6">'+t.isi+'</div></div></div></div>';
  }).join('');
  return '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Strategi & Tips</div>'+
    '<div style="font-size:13px;color:var(--text2);margin-bottom:16px">Cara cepat dapat nilai tinggi PK Perwira TNI.</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">'+tabs+'</div>'+
    '<div style="font-size:16px;font-weight:700;color:var(--gold2);margin-bottom:16px">'+d.judul+'</div>'+cards;
};

window.showTips = function(k) {
  var m = document.getElementById('main');
  if (m) m.innerHTML = window.renderTips(k);
};

var _baseNavTo = window.navTo;
window.navTo = function(page) {
  if (page === 'tips') {
    document.querySelectorAll('.nav-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.page==='tips'); });
    var m = document.getElementById('main');
    if (m) m.innerHTML = window.renderTips('umum');
    return;
  }
  _baseNavTo(page);
};
