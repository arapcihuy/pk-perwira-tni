
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
  flagged: {},       // idx -> boolean (ragu-ragu)
  timer: null,
  timeLeft: 0,
  totalTime: 0,
  bankCat: 'all',
  wrongIds: [],      // ids soal yang salah untuk drill
};

// ---- FULLSCREEN UTILITY ----
window.toggleFullscreen = function() {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function(){});
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(function(){});
    }
  }
};

// ---- SECURITY & SANITIZATION ----
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function sanitizeImgSrc(url) {
  if (!url || typeof url !== 'string') return '';
  var trimmed = url.trim();
  if (/^(data:image\/[a-zA-Z0-9+]+;base64,|https:\/\/|static\/|\.\/)/i.test(trimmed)) {
    return encodeURI(trimmed);
  }
  return '';
}
window.sanitizeImgSrc = sanitizeImgSrc;

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
  var m = { tkw:'landmark', matematika:'calculator', bahasa_inggris:'globe',
            penalaran_logika:'brain', numerik:'hash', verbal:'pencil',
            kraepelin:'zap', tes_gambar:'layers', kepribadian:'user' };
  return m[k] || 'file';
}

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('tni_prog') || '{}'); } catch(e) { return {}; }
}
function saveProgress(p) { localStorage.setItem('tni_prog', JSON.stringify(p)); }

function loadScores() {
  try { return JSON.parse(localStorage.getItem('tni_scores') || '[]'); } catch(e) { return []; }
}
function saveScores(arr) { localStorage.setItem('tni_scores', JSON.stringify(arr)); }

// ---- HEADER STATS ----
function updateHeaderStats() {
  var allSoal = getAllSoal();
  var el1 = document.getElementById('hStatSoal');
  var el2 = document.getElementById('hStatKat');
  var el3 = document.getElementById('hStatTO');
  if (el1) el1.textContent = allSoal.length;
  if (el2) el2.textContent = Object.keys(SOAL_DATABASE).length;
  if (el3) el3.textContent = loadScores().length;
}

// ---- RENDER ROUTER ----
function render() {
  var m = document.getElementById('main');
  if (!m) return;

  document.querySelectorAll('.nav-btn').forEach(function(b) {
    var p = b.dataset.page;
    var isActive = false;
    if (p === 'cat') {
      isActive = (S.page === 'cat' && S.mode === 'tryout') || (S.page === 'soal' && S.mode === 'tryout');
    } else if (p === 'cat2') {
      isActive = (S.page === 'cat' && S.mode === 'learn') || (S.page === 'soal' && S.mode === 'learn');
    } else {
      isActive = (p === S.page);
    }
    b.classList.toggle('active', isActive);
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
    case 'tips':  m.innerHTML = renderTips(S.tipsCat || 'umum'); break;
    case 'prog':  m.innerHTML = renderProg();  break;
  }
}
window.render = render;

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
    return '<div class="card" style="cursor:pointer;padding:18px" onclick="startCat(\'' + k + '\',\'tryout\')">' +
      '<div class="kat-icon" style="margin-bottom:10px">' + icon(katIcon(k), 22) + '</div>' +
      '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">' + v.nama + '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">' + v.soal.length + ' soal</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();startCat(\'' + k + '\',\'tryout\')">' + ic('clock', 15) + ' Tryout</button>' +
        '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();startCat(\'' + k + '\',\'learn\')">' + ic('book', 15) + ' Belajar</button>' +
      '</div></div>';
  }).join('');

  return '<div style="margin-bottom:20px">' +
    '<div style="font-size:24px;font-weight:800;color:var(--white);margin-bottom:4px;letter-spacing:-0.4px">Selamat Datang</div>' +
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
      '<button class="btn btn-primary btn-lg" style="flex:1" onclick="goPage(\'cat\',\'tryout\')">' + ic('clock', 17) + ' Mulai Tryout</button>' +
      '<button class="btn btn-secondary btn-lg" style="flex:1" onclick="goPage(\'cat\',\'learn\')">' + ic('book', 17) + ' Mode Belajar</button>' +
    '</div>' +
    '<div style="margin-bottom:24px">' +
      '<button class="btn btn-danger btn-lg" style="width:100%" onclick="startSimulasi60()">' + ic('target', 17) + ' Simulasi PK Perwira — 60 Soal · 90 Menit</button>' +
    '</div>' +

    '<div class="tips-box">' +
      '<div class="tips-title">' + ic('bulb', 16) + ' Tips Persiapan PK Perwira TNI</div>' +
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
    '<div class="kat-icon">' + icon('layers', 22) + '</div>' +
    '<div class="kat-name">Semua Kategori</div>' +
    '<div class="kat-sub">' + all.length + ' soal · acak</div>' +
    '</div>';

  catKeys.forEach(function(k) {
    var v = SOAL_DATABASE[k];
    items += '<div class="kat-card" onclick="startCat(\'' + k + '\',\'' + S.mode + '\')">' +
      '<div class="kat-icon">' + icon(katIcon(k), 22) + '</div>' +
      '<div class="kat-name">' + v.nama + '</div>' +
      '<div class="kat-sub">' + v.soal.length + ' soal</div>' +
      '</div>';
  });

  return '<div class="mode-badge">' + (isTO ? ic('clock', 14) + ' Mode Tryout dengan Timer' : ic('book', 14) + ' Mode Belajar tanpa Timer') + '</div>' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">' +
    (isTO ? 'Tryout' : 'Mode Belajar') + '</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:20px">Pilih kategori soal:</div>' +
    '<div class="grid-auto">' + items + '</div>';
}

// ---- START ----
function startCat(cat, mode) {
  S.cat = cat;
  S.mode = mode;
  S.isSimulasi = false;
  S.idx = 0;
  S.answers = {};
  S.flagged = {};

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
  if (!S.questions.length) return '<div class="empty"><div class="empty-icon">' + icon('alert', 44) + '</div><p>Tidak ada soal.</p></div>';

  var q = S.questions[S.idx];
  var n = S.questions.length;
  var pct = Math.round(((S.idx + 1) / n) * 100);
  var letters = ['A','B','C','D'];
  var ans = S.answers[S.idx];
  var answered = ans !== undefined;
  var isFlagged = !!S.flagged[S.idx];

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
      '<span>' + escapeHtml(p) + '</span>' +
      '</div>';
  }).join('');

  var expHtml = '';
  if (answered) {
    var benar = (ans === q.jawaban);
    var expTitle = benar
      ? '<span class="exp-verdict correct">' + ic('check', 13) + ' BENAR</span>'
      : '<span class="exp-verdict wrong">' + ic('x', 13) + ' SALAH</span>';
    expHtml = '<div class="explanation show">' +
      '<div class="explanation-head"><strong>' + ic('book', 15) + ' Pembahasan</strong>' + expTitle + '</div>' +
      '<div class="explanation-body">' + escapeHtml(q.pembahasan) + '</div>' +
      '</div>';
  }

  var prevBtn = '<button class="btn btn-ghost btn-sm" onclick="prevQ()"' + (S.idx === 0 ? ' disabled' : '') + '>' + ic('arrow-left', 15) + ' Sebelumnya</button>';
  var flagBtn = '<button class="btn btn-flag btn-sm ' + (isFlagged ? 'active' : '') + '" onclick="toggleFlag(' + S.idx + ')" title="Tandai Ragu-Ragu">' + ic('flag', 15) + ' ' + (isFlagged ? 'Ragu (Aktif)' : 'Ragu-ragu') + '</button>';

  var nextBtn = '';
  if (S.idx < n - 1) {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="nextQ()">Berikutnya ' + ic('arrow-right', 15) + '</button>';
  } else {
    nextBtn = '<button class="btn btn-primary btn-sm" onclick="finishSession()">' + ic('check', 15) + ' Selesai</button>';
  }
  var skipBtn = (!answered && S.mode === 'tryout')
    ? '<button class="btn btn-ghost btn-sm" onclick="skipQ()">' + ic('chevron-right', 15) + ' Lewati</button>' : '';

  var safeImg = sanitizeImgSrc(q.gambar);
  var imgHtml = safeImg ? '<div class="soal-img"><img src="' + safeImg + '" alt="Gambar soal" style="max-width:100%;max-height:320px;border-radius:8px;margin:10px 0;display:block;border:1px solid var(--border)"></div>' : '';

  return '<div class="soal-wrap">' +
    '<div class="soal-head">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<div>' +
          '<div class="label">Soal</div>' +
          '<div class="value">' + (S.idx + 1) + ' / ' + n + '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-sm" onclick="openPalette()" style="margin-left:4px">' + ic('list', 15) + ' Palet Soal</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="toggleFullscreen()" title="Layar Penuh" style="padding:6px 9px">' + ic('maximize', 16) + '</button>' +
      '</div>' +
      timerHtml +
    '</div>' +
    '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="soal-body">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div class="soal-cat-tag">' + escapeHtml(q.kategori || 'Umum') + '</div>' +
        (isFlagged ? '<span style="font-size:11px;color:var(--gold3);font-weight:700;display:inline-flex;align-items:center;gap:4px">' + ic('flag', 12) + ' Ditandai Ragu-ragu</span>' : '') +
      '</div>' +
      '<div class="soal-text">' + escapeHtml(q.pertanyaan) + '</div>' +
      imgHtml +
      '<div class="options">' + opts + '</div>' +
    '</div>' +
    expHtml +
    '<div class="soal-foot">' +
      prevBtn +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
        flagBtn +
        skipBtn +
        nextBtn +
      '</div>' +
    '</div>' +
  '</div>';
}

// ---- PALETTE (CAT MODAL) ----
function openPalette() {
  var grid = document.getElementById('paletteGrid');
  var modal = document.getElementById('paletteModal');
  if (!grid || !modal) return;

  var html = '';
  for (var i = 0; i < S.questions.length; i++) {
    var answered = S.answers[i] !== undefined;
    var flagged = !!S.flagged[i];
    var current = (i === S.idx);

    var cls = 'palette-num';
    if (answered) cls += ' answered';
    if (flagged) cls += ' flagged';
    if (current) cls += ' current';

    html += '<div class="' + cls + '" onclick="jumpToQ(' + i + ')">' + (i + 1) + '</div>';
  }
  grid.innerHTML = html;
  modal.classList.add('open');
}
window.openPalette = openPalette;

function closePaletteModal() {
  var m = document.getElementById('paletteModal');
  if (m) m.classList.remove('open');
}
window.closePaletteModal = closePaletteModal;

function jumpToQ(idx) {
  closePaletteModal();
  if (idx >= 0 && idx < S.questions.length) {
    S.idx = idx;
    render();
    if (S.mode === 'tryout') startTimerIfNeeded();
  }
}
window.jumpToQ = jumpToQ;

function toggleFlag(idx) {
  S.flagged[idx] = !S.flagged[idx];
  render();
}
window.toggleFlag = toggleFlag;

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
  var tUsed = S.totalTime - S.timeLeft;
  var tStr = S.mode === 'tryout'
    ? Math.floor(tUsed / 60) + ' mnt ' + (tUsed % 60) + ' dtk' : '-';

  S.lastResult = {
    nilai: nilai,
    lulus: lulus,
    benar: benar,
    salah: salah,
    skip: skip,
    tStr: tStr,
    isSimulasi: !!S.isSimulasi
  };

  var scores = loadScores();
  scores.push({
    nilai: nilai,
    benar: benar,
    salah: salah,
    skip: skip,
    tgl: new Date().toLocaleDateString('id-ID')
  });
  if (scores.length > 10) scores.shift();
  saveScores(scores);
  updateHeaderStats();

  S.page = 'hasil';
  render();
};

// ---- HASIL ----
function renderHasil() {
  var res = S.lastResult;
  if (!res) {
    var n = S.questions.length || 1;
    var b = 0, s = 0, sk = 0;
    for (var i = 0; i < n; i++) {
      var a = S.answers[i];
      if (a === undefined) sk++;
      else if (a === (S.questions[i] ? S.questions[i].jawaban : -1)) b++;
      else s++;
    }
    var nil = Math.round((b / n) * 100);
    res = { nilai: nil, lulus: nil >= 70, benar: b, salah: s, skip: sk, tStr: '-' };
  }

  return '<div class="result-wrap">' +
    '<div class="result-circle ' + (res.lulus ? 'pass' : 'fail') + '">' +
      '<div class="score">' + res.nilai + '</div>' +
      '<div class="score-label">/ 100</div>' +
    '</div>' +
    '<div class="result-status ' + (res.lulus ? 'pass' : 'fail') + '">' +
      (res.lulus ? ic('check-circle', 16) + ' LULUS — Nilai ≥ 70' : ic('x-circle', 16) + ' Belum Lulus — Nilai < 70') +
    '</div>' +
    '<div class="result-stats">' +
      '<div class="result-stat"><div class="rs-num rs-correct">' + res.benar + '</div><div class="rs-lbl">Benar</div></div>' +
      '<div class="result-stat"><div class="rs-num rs-wrong">' + res.salah + '</div><div class="rs-lbl">Salah</div></div>' +
      '<div class="result-stat"><div class="rs-num">' + res.skip + '</div><div class="rs-lbl">Dilewati</div></div>' +
      (S.mode === 'tryout' ? '<div class="result-stat"><div class="rs-num" style="font-size:16px">' + res.tStr + '</div><div class="rs-lbl">Waktu</div></div>' : '') +
    '</div>' +
    '<div class="result-actions">' +
      '<button class="btn btn-primary" onclick="retrySession()">' + ic('refresh', 16) + ' Ulangi</button>' +
      '<button class="btn btn-secondary" onclick="reviewSession()">' + ic('list', 16) + ' Review</button>' +
      (res.salah > 0 ? '<button class="btn btn-danger btn-sm" onclick="drillWrong()">' + ic('target', 15) + ' Drill ' + res.salah + ' Soal Salah</button>' : '') +
      '<button class="btn btn-ghost" onclick="goHome()">' + ic('home', 16) + ' Beranda</button>' +
    '</div>' +
    '</div>';
}

window.retrySession = function() {
  if (S.isSimulasi) {
    startSimulasi60();
  } else {
    startCat(S.cat, S.mode);
  }
};

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
  S.flagged = {};
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
  S.isSimulasi = true;
  S.questions = shuffle(all).slice(0, 60);
  S.idx = 0;
  S.answers = {};
  S.flagged = {};
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
    items;
}

window.setBankCat = function(v) { S.bankCat = v; S.page = 'bank'; render(); };

function renderModal() {
  return '<div class="modal-bg" id="soalModal">' +
    '<div class="modal-box">' +
      '<button class="modal-close-btn" onclick="closeModal()">' + ic('x', 14) + ' Tutup</button>' +
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
  
  var safeImg = sanitizeImgSrc(s.gambar);
  var imgHtml = safeImg ? '<div style="text-align:center;margin:10px 0"><img src="' + safeImg + '" alt="Gambar soal" style="max-width:100%;max-height:280px;border-radius:8px;border:1px solid var(--border)"></div>' : '';
  
  document.getElementById('mQ').innerHTML = '<div>' + escapeHtml(s.pertanyaan) + '</div>' + imgHtml;
  document.getElementById('mOpts').innerHTML = (s.pilihan || []).map(function(p, i) {
    var isKey = i === s.jawaban;
    return '<div class="modal-opt' + (isKey ? ' key' : '') + '">' +
      letters[i] + '. ' + escapeHtml(p) +
      (isKey ? '<span class="modal-key-label">' + ic('check', 12) + ' Kunci</span>' : '') +
      '</div>';
  }).join('');
  document.getElementById('mExp').innerHTML = '<strong>' + ic('book', 14) + ' Pembahasan</strong><br>' + escapeHtml(s.pembahasan);
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
      '<div class="prog-label">' + icon(katIcon(k), 16) + ' ' + escapeHtml(nama) + '</div>' +
      '<div class="prog-track"><div class="prog-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="prog-pct">' + pct + '%</div>' +
      '</div>' +
      '<div class="prog-detail">' + p.benar + '/' + p.total + ' soal benar</div>';
  }).join('');

  var hist = scores.length === 0
    ? '<div class="empty"><div class="empty-icon">' + icon('list', 44) + '</div><p>Belum ada tryout selesai.</p></div>'
    : '<div class="history-grid">' + scores.map(function(s, i) {
        return '<div class="history-item">' +
          '<div class="h-score ' + (s.nilai>=70?'h-pass':'h-fail') + '">' + s.nilai + '</div>' +
          '<div class="h-date">' + (escapeHtml(s.tgl)||'') + '</div>' +
          '<div class="h-detail" style="display:flex;align-items:center;justify-content:center;gap:5px">' + ic('check', 12) + s.benar + ' ' + ic('x', 12) + s.salah + ' ' + ic('chevron-right', 12) + s.skip + '</div>' +
        '</div>';
      }).join('') + '</div>';

  return '<div style="font-size:24px;font-weight:800;color:var(--white);margin-bottom:22px;letter-spacing:-0.4px">' + ic('trend', 20) + ' Progress Belajar</div>' +
    '<div class="section-title">Akurasi per Kategori</div>' +
    '<div style="margin-bottom:24px">' + rows + '</div>' +
    '<div class="section-title">Riwayat Tryout</div>' +
    '<div style="margin-bottom:20px">' + hist + '</div>' +
    '<div class="backup-box">' +
      '<div>' +
        '<div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px;display:flex;align-items:center;gap:7px">' + ic('download', 16) + ' Backup & Restore Data</div>' +
        '<div style="font-size:12px;color:var(--text2)">Simpan atau pindahkan riwayat belajar antar perangkat secara aman.</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
        '<button class="btn btn-secondary btn-sm" onclick="exportData()">' + ic('download', 15) + ' Export Backup</button>' +
        '<label class="btn btn-secondary btn-sm" style="margin:0;cursor:pointer">' +
          ic('upload', 15) + ' Import Backup' +
          '<input type="file" id="importFileInput" accept=".json" style="display:none" onchange="importData(event)">' +
        '</label>' +
      '</div>' +
    '</div>' +
    '<div style="margin-top:20px">' +
      '<button class="btn btn-danger btn-sm" onclick="resetAll()">' + ic('trash', 15) + ' Reset Semua Data</button>' +
    '</div>';
}

window.exportData = function() {
  var data = {
    version: 1,
    exportDate: new Date().toISOString(),
    tni_prog: loadProgress(),
    tni_scores: loadScores(),
    tni_psi_progress: (function(){ try { return JSON.parse(localStorage.getItem('tni_psi_progress')||'{}'); } catch(e){ return {}; } })()
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  var d = new Date();
  var dateStr = d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  a.download = 'backup-pk-perwira-' + dateStr + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.importData = function(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file melebihi batas keamanan (5MB).');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var json = JSON.parse(e.target.result);
      if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('Struktur file JSON tidak valid.');
      }

      // Validasi tni_prog
      var cleanProg = {};
      if (json.tni_prog && typeof json.tni_prog === 'object' && !Array.isArray(json.tni_prog)) {
        Object.keys(json.tni_prog).forEach(function(k) {
          var item = json.tni_prog[k];
          if (item && typeof item === 'object') {
            var tot = Number(item.total) || 0;
            var ben = Number(item.benar) || 0;
            if (tot >= 0 && ben >= 0) {
              cleanProg[escapeHtml(k)] = { total: tot, benar: ben };
            }
          }
        });
      }

      // Validasi tni_scores
      var cleanScores = [];
      if (Array.isArray(json.tni_scores)) {
        json.tni_scores.slice(0, 50).forEach(function(sc) {
          if (sc && typeof sc === 'object') {
            cleanScores.push({
              nilai: Number(sc.nilai) || 0,
              benar: Number(sc.benar) || 0,
              salah: Number(sc.salah) || 0,
              skip: Number(sc.skip) || 0,
              tgl: typeof sc.tgl === 'string' ? escapeHtml(sc.tgl).slice(0, 30) : ''
            });
          }
        });
      }

      // Validasi tni_psi_progress
      var cleanPsi = { history: [] };
      if (json.tni_psi_progress && typeof json.tni_psi_progress === 'object') {
        if (Array.isArray(json.tni_psi_progress.history)) {
          json.tni_psi_progress.history.slice(0, 50).forEach(function(h) {
            if (h && typeof h === 'object') {
              cleanPsi.history.push({
                testName: typeof h.testName === 'string' ? escapeHtml(h.testName).slice(0, 50) : '',
                score: Number(h.score) || 0,
                correct: Number(h.correct) || 0,
                total: Number(h.total) || 0,
                timestamp: Number(h.timestamp) || Date.now()
              });
            }
          });
        }
      }

      localStorage.setItem('tni_prog', JSON.stringify(cleanProg));
      localStorage.setItem('tni_scores', JSON.stringify(cleanScores));
      localStorage.setItem('tni_psi_progress', JSON.stringify(cleanPsi));

      updateHeaderStats();
      alert('Data backup terverifikasi aman & berhasil dipulihkan!');
      render();
    } catch(err) {
      alert('Gagal memulihkan backup: ' + err.message);
    }
  };
  reader.readAsText(file);
};

window.resetAll = function() {
  if (confirm('Hapus semua progress dan riwayat tryout?')) {
    localStorage.removeItem('tni_prog');
    localStorage.removeItem('tni_scores');
    localStorage.removeItem('tni_psi_progress');
    updateHeaderStats();
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
  if (page === 'tips') S.tipsCat = 'umum';
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
  var modal1 = document.getElementById('soalModal');
  if (modal1 && e.target === modal1) closeModal();
  var modal2 = document.getElementById('paletteModal');
  if (modal2 && e.target === modal2) closePaletteModal();
});

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  updateHeaderStats();
  render();
});

function renderTips(katKey) {
  if (!katKey) katKey = 'umum';
  S.tipsCat = katKey;
  var data = (typeof TIPS_DATA !== 'undefined') ? TIPS_DATA : null;
  if (!data) return '<div class="empty"><p>Data tips tidak ditemukan.</p></div>';
  var tabKeys = Object.keys(data);
  var tabs = tabKeys.map(function(k) {
    var icons = {umum:'target',tkw:'landmark',matematika:'calculator',bahasa_inggris:'globe',penalaran_logika:'brain',numerik:'hash',verbal:'pencil',kraepelin:'zap',tes_gambar:'layers',kepribadian:'user'};
    var label = ic(icons[k]||'file', 15) + ' ' + (k==='umum'?'Umum':k==='tkw'?'TWK':k==='matematika'?'MTK':k==='bahasa_inggris'?'Inggris':k==='penalaran_logika'?'Logika':k==='numerik'?'Numerik':k==='verbal'?'Verbal':k==='kraepelin'?'Kraepelin':k==='tes_gambar'?'Tes Gambar':k==='kepribadian'?'Kepribadian':k);
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
}
window.renderTips = renderTips;

window.showTips = function(k) {
  S.tipsCat = k;
  S.page = 'tips';
  render();
};
