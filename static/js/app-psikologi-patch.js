
// Tambahan untuk integrasi halaman psikologi
var originalRenderProg = window.renderProg;

// Extend render function untuk support psikologi page
if (typeof renderProg === 'function') {
  window.renderProg = function() {
    if (S.page === 'psikologi' || PSI.page.startsWith('psi-')) {
      // Handled by psikologi.js
      return '';
    }
    return originalRenderProg();
  };
}

// Update getAllSoal untuk include tes psikologi
var originalGetAllSoal = window.getAllSoal;
if (typeof getAllSoal === 'function') {
  window.getAllSoal = function() {
    var soal = originalGetAllSoal();
    
    // Add psikologi tests count
    if (typeof SOAL_PSIKOLOGI !== 'undefined') {
      var psiCount = 0;
      for (var key in SOAL_PSIKOLOGI) {
        if (SOAL_PSIKOLOGI[key].soal) {
          psiCount += SOAL_PSIKOLOGI[key].soal.length;
        }
      }
      // Add virtual category for stats
      soal._psikologi_count = psiCount;
    }
    
    return soal;
  };
}
