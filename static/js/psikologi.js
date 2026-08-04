// ============================================================
// TES PSIKOLOGI TNI AU - Native-like PWA
// Aplikasi lengkap dengan Kraepelin, Memory Span, Digit Span, dll
// ============================================================

// State management untuk tes psikologi
var PSI = {
  page: 'psi-home',
  testType: null,
  currentTest: null,
  testData: null,
  startTime: 0,
  answers: [],
  timerInterval: null,
  audioPlaying: false,
  
  // Kraepelin specific
  kraepelinData: null,
  kraepelinCol: 0,
  kraepelinRow: 0,
  kraepelinAnswers: [],
  
  // Memory Span specific
  memoryWords: [],
  memoryPhase: 'listen', // 'listen', 'remember', 'write'
  
  // Digit Span specific
  digitNumbers: [],
  digitPhase: 'listen',
  
  // Progress tracking
  scores: {},
  history: []
};

// Load progress dari localStorage
function loadPsiProgress() {
  try {
    var stored = localStorage.getItem('tni_psi_progress');
    if (stored) {
      PSI.history = JSON.parse(stored);
    }
  } catch(e) {
    console.error('Failed to load PSI progress:', e);
  }
}

function savePsiProgress() {
  try {
    localStorage.setItem('tni_psi_progress', JSON.stringify(PSI.history));
  } catch(e) {
    console.error('Failed to save PSI progress:', e);
  }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function renderPsiHome() {
  if (typeof SOAL_PSIKOLOGI === 'undefined') {
    return '<div class="empty"><div class="empty-icon">⚠️</div>' +
      '<p>Database soal psikologi belum dimuat.</p>' +
      '<button class="btn btn-primary" onclick="location.reload()">Muat Ulang</button></div>';
  }
  
  var tests = [
    { key: 'memory_span', icon: '🧠', nama: 'Tes Daya Ingat', desc: '16 kategori, 30 detik per kategori' },
    { key: 'digit_span', icon: '🔢', nama: 'Digit Span', desc: '18 soal, angka maju-mundur' },
    { key: 'aritmatika', icon: '➕', nama: 'Aritmatika Lisan', desc: '12 soal cerita' },
    { key: 'deret_angka', icon: '📊', nama: 'Deret Angka', desc: '12 pola deret' },
    { key: 'kraepelin', icon: '⚡', nama: 'Tes Kraepelin', desc: '3 menit, penjumlahan cepat' }
  ];
  
  var html = '<div style="margin-bottom:20px">' +
    '<div style="font-size:20px;font-weight:700;color:var(--white);margin-bottom:4px">Tes Psikologi TNI AU 🧠</div>' +
    '<div style="font-size:13px;color:var(--text2)">Format: Soal dibacakan → Jawab tertulis</div>' +
    '</div>';
  
  html += '<div style="display:grid;gap:12px">';
  
  tests.forEach(function(t) {
    var testData = SOAL_PSIKOLOGI[t.key];
    var soalCount = 0;
    if (testData && testData.soal) {
      soalCount = testData.soal.length;
    }
    
    html += '<div class="card" style="padding:16px;cursor:pointer" onclick="startPsiTest(\''+t.key+'\')">' +
      '<div style="display:flex;gap:12px;align-items:start">' +
        '<div style="font-size:32px">'+t.icon+'</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:4px">'+t.nama+'</div>' +
          '<div style="font-size:12px;color:var(--text3);margin-bottom:8px">'+t.desc+'</div>' +
          '<div style="font-size:11px;color:var(--text2)">'+soalCount+' soal tersedia</div>' +
        '</div>' +
        '<div style="color:var(--primary);font-size:20px">→</div>' +
      '</div>' +
    '</div>';
  });
  
  html += '</div>';
  
  // Progress History
  if (PSI.history.length > 0) {
    html += '<div style="margin-top:24px">' +
      '<div style="font-size:16px;font-weight:600;color:var(--white);margin-bottom:12px">Riwayat Latihan</div>';
    
    PSI.history.slice(-5).reverse().forEach(function(h) {
      var date = new Date(h.timestamp);
      html += '<div class="card" style="padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div>' +
            '<div style="font-size:13px;font-weight:600;color:var(--white)">'+h.testName+'</div>' +
            '<div style="font-size:11px;color:var(--text3)">'+date.toLocaleString('id-ID')+'</div>' +
          '</div>' +
          '<div style="font-size:14px;font-weight:700;color:var(--primary)">'+h.score+'%</div>' +
        '</div>' +
      '</div>';
    });
    
    html += '</div>';
  }
  
  return html;
}

// Start tes psikologi
function startPsiTest(testKey) {
  PSI.testType = testKey;
  PSI.currentTest = SOAL_PSIKOLOGI[testKey];
  PSI.testData = PSI.currentTest.soal[0];
  PSI.startTime = Date.now();
  PSI.answers = [];
  
  if (testKey === 'kraepelin') {
    startKraepelin();
  } else if (testKey === 'memory_span') {
    startMemorySpan();
  } else if (testKey === 'digit_span') {
    startDigitSpan();
  } else {
    PSI.page = 'psi-test';
    render();
  }
}

// ============================================================
// TES KRAEPELIN
// ============================================================

function startKraepelin() {
  PSI.kraepelinData = PSI.currentTest.generateSoal();
  PSI.kraepelinCol = 0;
  PSI.kraepelinRow = 0;
  PSI.kraepelinAnswers = [];
  
  for (var i = 0; i < PSI.kraepelinData.length; i++) {
    PSI.kraepelinAnswers[i] = [];
  }
  
  PSI.page = 'psi-kraepelin';
  render();
  startKraepelinTimer();
}

function startKraepelinTimer() {
  var timeLeft = PSI.currentTest.waktu_total;
  
  PSI.timerInterval = setInterval(function() {
    timeLeft--;
    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;
    
    var timerEl = document.getElementById('kraepelinTimer');
    if (timerEl) {
      timerEl.textContent = pad(minutes) + ':' + pad(seconds);
    }
    
    if (timeLeft <= 0) {
      clearInterval(PSI.timerInterval);
      finishKraepelin();
    }
  }, 1000);
}

function renderKraepelin() {
  var html = '<div style="padding:16px;height:calc(100vh - 140px);overflow:hidden;display:flex;flex-direction:column">';
  
  // Header
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--white)">⚡ Tes Kraepelin</div>' +
      '<div style="font-size:12px;color:var(--text3)">Jumlahkan 2 angka berurutan, tulis digit terakhir</div>' +
    '</div>' +
    '<div style="font-size:24px;font-weight:700;color:var(--primary)" id="kraepelinTimer">03:00</div>' +
  '</div>';
  
  // Kraepelin Grid
  html += '<div style="flex:1;overflow-x:auto;overflow-y:hidden;background:var(--bg-elevated);border-radius:8px;padding:16px">';
  html += '<div style="display:flex;gap:24px">';
  
  for (var col = 0; col < PSI.kraepelinData.length; col++) {
    html += '<div style="display:flex;flex-direction:column;gap:4px">';
    
    for (var row = 0; row < PSI.kraepelinData[col].length; row++) {
      var isActive = col === PSI.kraepelinCol && row === PSI.kraepelinRow;
      var answerVal = PSI.kraepelinAnswers[col][row] || '';
      
      html += '<div style="display:flex;align-items:center;gap:8px">' +
        '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;' +
          'background:var(--bg);border-radius:4px;font-size:16px;font-weight:600;color:var(--white)">' +
          PSI.kraepelinData[col][row] +
        '</div>' +
        '<input type="text" maxlength="1" ' +
          'style="width:32px;height:32px;text-align:center;font-size:16px;font-weight:600;' +
          'background:'+(isActive?'var(--primary)':'var(--bg)')+';' +
          'border:2px solid '+(isActive?'var(--primary)':'var(--border)')+';' +
          'color:var(--white);border-radius:4px" ' +
          'value="'+answerVal+'" ' +
          'onkeyup="handleKraepelinInput(event, '+col+', '+row+')" ' +
          'id="k_'+col+'_'+row+'">' +
      '</div>';
    }
    
    html += '</div>';
  }
  
  html += '</div></div>';
  
  // Instructions
  html += '<div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:8px;font-size:12px;color:var(--text2)">' +
    '<strong style="color:var(--white)">Instruksi:</strong> Jumlahkan 2 angka berurutan (atas + bawah), tulis digit terakhir hasilnya. ' +
    'Tekan Enter untuk lanjut ke bawah, Tab untuk lanjut ke kolom berikutnya.' +
  '</div>';
  
  html += '</div>';
  
  return html;
}

function handleKraepelinInput(e, col, row) {
  var value = e.target.value;
  
  // Only allow digits
  if (!/^[0-9]$/.test(value) && value !== '') {
    e.target.value = '';
    return;
  }
  
  PSI.kraepelinAnswers[col][row] = value;
  
  // Enter: move down
  if (e.key === 'Enter' && value !== '') {
    if (row < PSI.kraepelinData[col].length - 2) {
      PSI.kraepelinRow = row + 1;
      PSI.kraepelinCol = col;
      setTimeout(function() {
        var nextInput = document.getElementById('k_'+col+'_'+(row+1));
        if (nextInput) nextInput.focus();
      }, 10);
    } else {
      // Move to next column
      if (col < PSI.kraepelinData.length - 1) {
        PSI.kraepelinCol = col + 1;
        PSI.kraepelinRow = 0;
        setTimeout(function() {
          var nextInput = document.getElementById('k_'+(col+1)+'_0');
          if (nextInput) nextInput.focus();
        }, 10);
      }
    }
  }
  
  // Tab: move to next column
  if (e.key === 'Tab') {
    e.preventDefault();
    if (col < PSI.kraepelinData.length - 1) {
      PSI.kraepelinCol = col + 1;
      PSI.kraepelinRow = 0;
      setTimeout(function() {
        var nextInput = document.getElementById('k_'+(col+1)+'_0');
        if (nextInput) nextInput.focus();
      }, 10);
    }
  }
}

function finishKraepelin() {
  clearInterval(PSI.timerInterval);
  
  // Calculate score
  var correctAnswers = PSI.currentTest.hitungJawaban(PSI.kraepelinData);
  var totalCorrect = 0;
  var totalAnswered = 0;
  
  for (var col = 0; col < PSI.kraepelinAnswers.length; col++) {
    for (var row = 0; row < PSI.kraepelinAnswers[col].length; row++) {
      if (PSI.kraepelinAnswers[col][row] !== '') {
        totalAnswered++;
        if (PSI.kraepelinAnswers[col][row] == correctAnswers[col][row]) {
          totalCorrect++;
        }
      }
    }
  }
  
  var score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  
  PSI.history.push({
    testName: 'Tes Kraepelin',
    score: score,
    correct: totalCorrect,
    total: totalAnswered,
    timestamp: Date.now()
  });
  
  savePsiProgress();
  
  PSI.page = 'psi-result';
  PSI.scores = {
    correct: totalCorrect,
    total: totalAnswered,
    score: score
  };
  
  render();
}

// ============================================================
// TES MEMORY SPAN
// ============================================================

function startMemorySpan() {
  PSI.memoryWords = [];
  PSI.memoryPhase = 'listen';
  PSI.page = 'psi-memory';
  render();
  
  // Auto-play words
  setTimeout(function() {
    playMemoryWords();
  }, 1000);
}

function playMemoryWords() {
  var words = PSI.testData.kata;
  var index = 0;
  
  function playNext() {
    if (index < words.length) {
      var wordEl = document.getElementById('memoryWord');
      if (wordEl) {
        wordEl.textContent = words[index];
        wordEl.style.transform = 'scale(1.1)';
        setTimeout(function() {
          wordEl.style.transform = 'scale(1)';
        }, 300);
      }
      
      index++;
      setTimeout(playNext, 1200);
    } else {
      // Finished playing, start remember phase
      PSI.memoryPhase = 'remember';
      render();
      
      setTimeout(function() {
        PSI.memoryPhase = 'write';
        render();
      }, 30000); // 30 seconds to remember
    }
  }
  
  playNext();
}

function renderMemorySpan() {
  var html = '<div style="padding:16px;height:calc(100vh - 140px);display:flex;flex-direction:column">';
  
  // Header
  html += '<div style="text-align:center;margin-bottom:24px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px">🧠 Tes Daya Ingat</div>' +
    '<div style="font-size:13px;color:var(--text3)">Kategori: '+PSI.testData.kategori+'</div>' +
  '</div>';
  
  if (PSI.memoryPhase === 'listen') {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:48px;font-weight:700;color:var(--primary);margin-bottom:16px" id="memoryWord">...</div>' +
      '<div style="font-size:13px;color:var(--text2)">Dengarkan dan ingat kata-kata berikut</div>' +
    '</div>';
  } else if (PSI.memoryPhase === 'remember') {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:64px;margin-bottom:16px">⏳</div>' +
      '<div style="font-size:18px;font-weight:600;color:var(--white);margin-bottom:8px">Sedang mengingat...</div>' +
      '<div style="font-size:13px;color:var(--text2)">Anda punya 30 detik untuk mengingat</div>' +
    '</div>';
  } else {
    html += '<div style="flex:1">' +
      '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:12px">Tulis kata yang Anda ingat (pisahkan dengan koma):</div>' +
      '<textarea id="memoryAnswer" style="width:100%;height:200px;padding:12px;background:var(--bg-elevated);' +
        'border:2px solid var(--border);border-radius:8px;color:var(--white);font-size:14px;resize:none" ' +
        'placeholder="Contoh: Kucing, Gajah, Jerapah"></textarea>' +
      '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="submitMemoryAnswer()">Selesai</button>' +
    '</div>';
  }
  
  html += '</div>';
  
  return html;
}

function submitMemoryAnswer() {
  var answerEl = document.getElementById('memoryAnswer');
  if (!answerEl) return;
  
  var userWords = answerEl.value.split(',').map(function(w) { return w.trim().toLowerCase(); });
  var correctWords = PSI.testData.kata.map(function(w) { return w.toLowerCase(); });
  
  var correct = 0;
  userWords.forEach(function(w) {
    if (correctWords.indexOf(w) !== -1) {
      correct++;
    }
  });
  
  var score = Math.round((correct / correctWords.length) * 100);
  
  PSI.history.push({
    testName: 'Tes Daya Ingat - ' + PSI.testData.kategori,
    score: score,
    correct: correct,
    total: correctWords.length,
    timestamp: Date.now()
  });
  
  savePsiProgress();
  
  PSI.page = 'psi-result';
  PSI.scores = {
    correct: correct,
    total: correctWords.length,
    score: score
  };
  
  render();
}

// ============================================================
// TES DIGIT SPAN
// ============================================================

function startDigitSpan() {
  PSI.digitNumbers = [];
  PSI.digitPhase = 'listen';
  PSI.page = 'psi-digit';
  render();
  
  setTimeout(function() {
    playDigitNumbers();
  }, 1000);
}

function playDigitNumbers() {
  var numbers = PSI.testData.angka;
  var index = 0;
  
  function playNext() {
    if (index < numbers.length) {
      var digitEl = document.getElementById('digitNumber');
      if (digitEl) {
        digitEl.textContent = numbers[index];
        digitEl.style.transform = 'scale(1.2)';
        setTimeout(function() {
          digitEl.style.transform = 'scale(1)';
        }, 400);
      }
      
      index++;
      setTimeout(playNext, 1000);
    } else {
      PSI.digitPhase = 'write';
      render();
    }
  }
  
  playNext();
}

function renderDigitSpan() {
  var html = '<div style="padding:16px;height:calc(100vh - 140px);display:flex;flex-direction:column">';
  
  html += '<div style="text-align:center;margin-bottom:24px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px">🔢 Digit Span</div>' +
    '<div style="font-size:13px;color:var(--text3)">Level '+PSI.testData.level+' - '+PSI.testData.angka.length+' digit - '+
      (PSI.testData.tipe === 'maju' ? 'Maju ➡️' : 'Mundur ⬅️')+'</div>' +
  '</div>';
  
  if (PSI.digitPhase === 'listen') {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
      '<div style="font-size:72px;font-weight:700;color:var(--primary);margin-bottom:16px" id="digitNumber">?</div>' +
      '<div style="font-size:13px;color:var(--text2)">Dengarkan angka berikut</div>' +
    '</div>';
  } else {
    var instruction = PSI.testData.tipe === 'maju' ? 
      'Tulis angka sesuai urutan yang dibacakan:' : 
      'Tulis angka dengan urutan TERBALIK:';
    
    html += '<div style="flex:1">' +
      '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:12px">'+instruction+'</div>' +
      '<input type="text" id="digitAnswer" style="width:100%;padding:16px;background:var(--bg-elevated);' +
        'border:2px solid var(--border);border-radius:8px;color:var(--white);font-size:24px;text-align:center;' +
        'letter-spacing:8px" placeholder="Tulis angka..." />' +
      '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="submitDigitAnswer()">Selesai</button>' +
    '</div>';
  }
  
  html += '</div>';
  
  return html;
}

function submitDigitAnswer() {
  var answerEl = document.getElementById('digitAnswer');
  if (!answerEl) return;
  
  var userAnswer = answerEl.value.replace(/[^0-9]/g, '');
  var correctAnswer = PSI.testData.jawaban;
  
  var isCorrect = userAnswer === correctAnswer;
  var score = isCorrect ? 100 : 0;
  
  PSI.history.push({
    testName: 'Digit Span L'+PSI.testData.level+' '+PSI.testData.tipe,
    score: score,
    correct: isCorrect ? 1 : 0,
    total: 1,
    timestamp: Date.now()
  });
  
  savePsiProgress();
  
  PSI.page = 'psi-result';
  PSI.scores = {
    correct: isCorrect ? 1 : 0,
    total: 1,
    score: score
  };
  
  render();
}

// ============================================================
// RESULT PAGE
// ============================================================

function renderPsiResult() {
  var html = '<div style="padding:16px;height:calc(100vh - 140px);display:flex;flex-direction:column;align-items:center;justify-content:center">';
  
  var emoji = PSI.scores.score >= 80 ? '🎉' : PSI.scores.score >= 60 ? '👍' : '💪';
  
  html += '<div style="font-size:64px;margin-bottom:16px">'+emoji+'</div>' +
    '<div style="font-size:24px;font-weight:700;color:var(--white);margin-bottom:8px">Tes Selesai!</div>' +
    '<div style="font-size:48px;font-weight:700;color:var(--primary);margin-bottom:24px">'+PSI.scores.score+'%</div>' +
    '<div style="font-size:14px;color:var(--text2);margin-bottom:32px">'+
      'Benar: '+PSI.scores.correct+' dari '+PSI.scores.total+' soal'+
    '</div>' +
    '<button class="btn btn-primary" onclick="navTo(\'psikologi\')">Kembali ke Menu</button>';
  
  html += '</div>';
  
  return html;
}

// ============================================================
// INTEGRATION WITH MAIN APP
// ============================================================

// Extend main render function
var originalRender = window.render;
window.render = function() {
  var m = document.getElementById('main');
  if (!m) return;
  
  document.querySelectorAll('.nav-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.page === S.page || b.dataset.page === 'psikologi');
  });
  
  if (S.page === 'psikologi') {
    m.innerHTML = renderPsiHome();
  } else if (PSI.page === 'psi-home') {
    m.innerHTML = renderPsiHome();
  } else if (PSI.page === 'psi-kraepelin') {
    m.innerHTML = renderKraepelin();
  } else if (PSI.page === 'psi-memory') {
    m.innerHTML = renderMemorySpan();
  } else if (PSI.page === 'psi-digit') {
    m.innerHTML = renderDigitSpan();
  } else if (PSI.page === 'psi-result') {
    m.innerHTML = renderPsiResult();
  } else {
    originalRender();
  }
};

// Navigation
window.navTo = function(page) {
  if (page === 'psikologi') {
    S.page = 'psikologi';
    PSI.page = 'psi-home';
    loadPsiProgress();
  } else {
    S.page = page;
  }
  render();
};

// Load progress on init
document.addEventListener('DOMContentLoaded', function() {
  loadPsiProgress();
});
