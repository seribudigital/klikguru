import { appState, saveSesiMengajar, saveAbsensiWaliKelas } from "../state";

// Module-level state untuk menyimpan progress pengerjaan agar tidak hilang saat pindah tab
let sessionState = {
  isTeaching: false,
  isWaliKelasAbsen: false,
  selectedClass: "",
  selectedMapel: "",
  attendance: {}, // Map of siswaId -> status ("Hadir", "Sakit", "Izin", "Alfa")
  materi: "",
  catatanKelas: "",
  jamMulai: "",
  jamSelesai: ""
};

export function renderJurnal(container) {
  const { sekolah, kelas, siswa } = appState;

  // Render Halaman Berdasarkan Status Mengajar
  if (!sessionState.isTeaching && !sessionState.isWaliKelasAbsen) {
    renderSelectorView(container, sekolah, kelas);
  } else if (sessionState.isWaliKelasAbsen) {
    renderWaliKelasView(container, sekolah, siswa);
  } else {
    renderTeachingView(container, sekolah, siswa);
  }
}

// 1. VIEW PEMILIHAN KELAS & MAPEL
function renderSelectorView(container, sekolah, kelas) {
  container.innerHTML = `
    <div class="space-y-6 animate-fade-in flex-1 flex flex-col justify-center py-4">
      <div class="glass rounded-3xl p-6 space-y-6 shadow-xl">
        
        <!-- Icon & Header -->
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-white tracking-tight">Mulai Mengajar Hari Ini</h2>
          <p class="text-slate-400 text-xs mt-1">Pilih kelas dan mata pelajaran untuk memulai pencatatan.</p>
        </div>

        <!-- Form Selector -->
        <div class="space-y-4">
          <!-- Dropdown Kelas -->
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="select-kelas">Pilih Kelas</label>
            <select id="select-kelas" 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-semibold">
              <option value="" disabled selected>-- Pilih Kelas --</option>
              ${kelas.map(k => `<option value="${k}" ${sessionState.selectedClass === k ? "selected" : ""}>Kelas ${k}</option>`).join("")}
            </select>
          </div>

          <!-- Dropdown Mapel -->
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="select-mapel">Pilih Mata Pelajaran</label>
            <select id="select-mapel" 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-semibold">
              <option value="" disabled selected>-- Pilih Mata Pelajaran --</option>
              ${sekolah.daftar_mapel.map(m => `<option value="${m}" ${sessionState.selectedMapel === m ? "selected" : ""}>${m}</option>`).join("")}
            </select>
          </div>
        </div>

        <button id="btn-start-teaching" 
          class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all text-sm cursor-pointer flex justify-center items-center gap-2">
          <span>Mulai Mengajar</span>
        </button>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-slate-800"></div>
          <span class="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Wali Kelas</span>
          <div class="flex-grow border-t border-slate-800"></div>
        </div>

        <button id="btn-wali-kelas-absen" 
          class="w-full bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 font-bold py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-sm cursor-pointer flex justify-center items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>Absensi Wali Kelas (8A)</span>
        </button>

      </div>
    </div>
  `;

  // Listener untuk Tombol Mulai
  const selectKelas = document.getElementById("select-kelas");
  const selectMapel = document.getElementById("select-mapel");
  const btnStart = document.getElementById("btn-start-teaching");
  const btnWaliKelas = document.getElementById("btn-wali-kelas-absen");

  btnStart.addEventListener("click", () => {
    const kVal = selectKelas.value;
    const mVal = selectMapel.value;

    if (!kVal || !mVal) {
      alert("Harap pilih Kelas dan Mata Pelajaran terlebih dahulu!");
      return;
    }

    // Set Session State
    sessionState.isTeaching = true;
    sessionState.isWaliKelasAbsen = false;
    sessionState.selectedClass = kVal;
    sessionState.selectedMapel = mVal;
    
    // Ambil jam sekarang untuk default jam mulai & selesai
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    // Jam selesai default (misal 90 menit kemudian)
    const duration = 90 * 60 * 1000;
    const endTime = new Date(now.getTime() + duration);
    const endTimeStr = `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}`;

    sessionState.jamMulai = currentTimeStr;
    sessionState.jamSelesai = endTimeStr;
    
    // Inisialisasi default absensi kosong
    sessionState.attendance = {};
    sessionState.materi = "";
    sessionState.catatanKelas = "";

    renderJurnal(container);
  });

  if (btnWaliKelas) {
    btnWaliKelas.addEventListener("click", () => {
      sessionState.isTeaching = false;
      sessionState.isWaliKelasAbsen = true;
      sessionState.selectedClass = "8A";
      sessionState.selectedMapel = "";
      sessionState.attendance = {};
      renderJurnal(container);
    });
  }
}

// 2. VIEW LEMBAR MENGAJAR (ABSENSI & JURNAL)
function renderTeachingView(container, sekolah, siswa) {
  const activeYear = sekolah.tahun_ajaran_aktif;

  // Filter siswa aktif di kelas terpilih untuk tahun ajaran aktif
  const classStudents = siswa.filter(s => 
    s.status_aktif && 
    s.riwayat_kelas && 
    s.riwayat_kelas[activeYear] === sessionState.selectedClass
  ).sort((a, b) => a.nama.localeCompare(b.nama));

  // Pemetaan badge warna untuk memutar status absensi
  const statusStyles = {
    "Hadir": { bg: "bg-slate-900 border-slate-800", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15", dot: "bg-emerald-500" },
    "Sakit": { bg: "bg-amber-950/20 border-amber-900/40", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/25", dot: "bg-amber-500" },
    "Izin": { bg: "bg-orange-950/20 border-orange-900/40", badge: "bg-orange-500/10 text-orange-400 border border-orange-500/25", dot: "bg-orange-500" },
    "Alfa": { bg: "bg-rose-950/20 border-rose-900/40", badge: "bg-rose-500/10 text-rose-400 border border-rose-500/25", dot: "bg-rose-500" }
  };

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in relative">
      
      <!-- Session Header Info -->
      <div class="flex justify-between items-center bg-slate-900 border border-slate-850 p-4 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Sesi Mengajar Aktif</span>
          <h3 class="text-base font-bold text-white tracking-tight">${sessionState.selectedMapel}</h3>
          <p class="text-slate-400 text-xs">Kelas ${sessionState.selectedClass} • TA ${activeYear}</p>
        </div>
        <button id="btn-cancel-session" class="text-slate-400 hover:text-rose-400 text-xs font-semibold py-1.5 px-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg transition-colors cursor-pointer">
          Batal
        </button>
      </div>

      <!-- ABSENSI CEPAT SECTION -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="flex justify-between items-center border-b border-slate-850 pb-2">
          <h4 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Absensi Siswa ("Tap" untuk ganti status)</h4>
          <span class="text-[10px] font-semibold text-slate-500">Siswa: ${classStudents.length}</span>
        </div>

        ${classStudents.length > 0 
          ? `
            <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
              ${classStudents.map((s) => {
                const currentStatus = sessionState.attendance[s.id] || "Hadir";
                const style = statusStyles[currentStatus];
                
                return `
                  <div data-siswa-id="${s.id}" class="btn-toggle-absen flex justify-between items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${style.bg}">
                    <div class="flex items-center gap-3">
                      <div class="w-2.5 h-2.5 rounded-full ${style.dot} transition-colors duration-200 animate-pulse"></div>
                      <span class="text-sm font-semibold text-slate-200">${s.nama}</span>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${style.badge}">
                      ${currentStatus}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>
          `
          : `<p class="text-center py-6 text-xs text-slate-500">Tidak ada siswa terdaftar di kelas ini.</p>`
        }
      </div>

      <!-- JURNAL INTEGRATIF SECTION -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="border-b border-slate-850 pb-2">
          <h4 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Jurnal Kelas</h4>
        </div>

        <div class="space-y-4">
          <!-- Input Materi -->
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="input-materi">Materi Pembelajaran <span class="text-rose-400">*</span></label>
            <input type="text" id="input-materi" required 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
              placeholder="Contoh: Logika Algoritma & IF Statement"
              value="${sessionState.materi}">
          </div>

          <!-- Input Jam Mulai & Jam Selesai -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="input-jam-mulai">Jam Mulai <span class="text-rose-400">*</span></label>
              <input type="time" id="input-jam-mulai" required 
                class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                value="${sessionState.jamMulai || ''}">
            </div>
            <div class="space-y-2">
              <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="input-jam-selesai">Jam Selesai <span class="text-rose-400">*</span></label>
              <input type="time" id="input-jam-selesai" required 
                class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                value="${sessionState.jamSelesai || ''}">
            </div>
          </div>

          <!-- Input Catatan Kejadian -->
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="input-catatan">Catatan Kejadian Kelas</label>
            <textarea id="input-catatan" rows="3"
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-emerald-500 transition-all text-sm font-medium resize-none"
              placeholder="Contoh: Kelas kondusif, Budi mengantuk di kelas...">${sessionState.catatanKelas}</textarea>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTON -->
      <button id="btn-save-session-trigger" 
        class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all text-sm cursor-pointer flex justify-center items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span>Simpan Sesi Mengajar</span>
      </button>

      <!-- MODAL POPUP KONFIRMASI (HIDDEN BY DEFAULT) -->
      <div id="confirm-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-800 animate-fade-in">
          <div class="text-center">
            <h4 class="text-base font-bold text-white tracking-tight">Konfirmasi Sesi Mengajar</h4>
            <p class="text-slate-400 text-xs mt-1">Harap periksa rekap absensi berikut:</p>
          </div>

          <div class="bg-slate-900/60 rounded-2xl p-4 border border-slate-900 space-y-2 text-sm text-slate-300">
            <div class="flex justify-between">
              <span>Hadir:</span>
              <span class="font-bold text-emerald-400" id="modal-cnt-hadir">0</span>
            </div>
            <div class="flex justify-between">
              <span>Sakit:</span>
              <span class="font-bold text-amber-400" id="modal-cnt-sakit">0</span>
            </div>
            <div class="flex justify-between">
              <span>Izin:</span>
              <span class="font-bold text-orange-400" id="modal-cnt-izin">0</span>
            </div>
            <div class="flex justify-between">
              <span>Alfa:</span>
              <span class="font-bold text-rose-400" id="modal-cnt-alfa">0</span>
            </div>
            <div class="border-t border-slate-800 my-2 pt-2 flex justify-between text-xs text-slate-400">
              <span>Mata Pelajaran:</span>
              <span class="font-medium text-white">${sessionState.selectedMapel}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Kelas:</span>
              <span class="font-medium text-white">Kelas ${sessionState.selectedClass}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-400" id="modal-time-container">
              <span>Waktu Pelajaran:</span>
              <span class="font-medium text-white" id="modal-val-waktu">${sessionState.jamMulai} - ${sessionState.jamSelesai}</span>
            </div>
          </div>

          <p class="text-center text-xs font-semibold text-slate-400">Apakah data jurnal & absensi ini sudah benar?</p>

          <div class="flex gap-2">
            <button id="btn-modal-cancel" class="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-semibold py-3 rounded-xl text-xs transition-all border border-slate-850 cursor-pointer">
              Periksa Kembali
            </button>
            <button id="btn-modal-confirm" class="flex-1 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer">
              Ya, Simpan
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  // --- HANDLER EVENT ---

  // 1. Input listener untuk menyimpan state (mencegah hilang saat navigasi tab)
  const inputMateri = document.getElementById("input-materi");
  const inputJamMulai = document.getElementById("input-jam-mulai");
  const inputJamSelesai = document.getElementById("input-jam-selesai");
  const inputCatatan = document.getElementById("input-catatan");

  inputMateri.addEventListener("input", (e) => {
    sessionState.materi = e.target.value;
  });

  inputJamMulai.addEventListener("input", (e) => {
    sessionState.jamMulai = e.target.value;
  });

  inputJamSelesai.addEventListener("input", (e) => {
    sessionState.jamSelesai = e.target.value;
  });

  inputCatatan.addEventListener("input", (e) => {
    sessionState.catatanKelas = e.target.value;
  });

  // 2. Klik Batal Sesi Mengajar
  document.getElementById("btn-cancel-session").addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin membatalkan sesi mengajar ini? Semua progress absensi dan jurnal akan hilang.")) {
      resetSessionState();
      renderJurnal(container);
    }
  });

  // 3. Toggle Status Absensi (Tap-to-Rotate)
  // Menggunakan event delegation di list container
  container.addEventListener("click", (e) => {
    const row = e.target.closest(".btn-toggle-absen");
    if (!row) return;

    const id = row.getAttribute("data-siswa-id");
    const current = sessionState.attendance[id] || "Hadir";
    
    // Rotasi status: Hadir -> Sakit -> Izin -> Alfa -> Hadir
    const rotation = {
      "Hadir": "Sakit",
      "Sakit": "Izin",
      "Izin": "Alfa",
      "Alfa": "Hadir"
    };

    const next = rotation[current];
    sessionState.attendance[id] = next;

    // Render ulang UI lembar mengajar agar tidak mengganggu fokus input form, 
    // kita cukup update row spesifik tersebut agar UI terasa sangat fluid
    const style = statusStyles[next];
    
    // Update background row
    row.className = `btn-toggle-absen flex justify-between items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${style.bg}`;
    
    // Update dot status
    const dot = row.querySelector(".rounded-full");
    dot.className = `w-2.5 h-2.5 rounded-full ${style.dot} transition-colors duration-200 animate-pulse`;
    
    // Update badge status text & style
    const badge = row.querySelector("span[class*='text-[10px]']");
    badge.textContent = next;
    badge.className = `text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${style.badge}`;
  });

  // 4. Trigger Modal Simpan Sesi
  const btnTriggerSave = document.getElementById("btn-save-session-trigger");
  const modal = document.getElementById("confirm-modal");

  btnTriggerSave.addEventListener("click", () => {
    const matVal = inputMateri.value.trim();
    if (!matVal) {
      alert("Materi pembelajaran harus diisi!");
      inputMateri.focus();
      return;
    }

    const jamMulaiVal = inputJamMulai.value;
    const jamSelesaiVal = inputJamSelesai.value;

    if (!jamMulaiVal) {
      alert("Jam mulai harus diisi!");
      inputJamMulai.focus();
      return;
    }

    if (!jamSelesaiVal) {
      alert("Jam selesai harus diisi!");
      inputJamSelesai.focus();
      return;
    }

    // Hitung rekap absensi
    let cntHadir = 0;
    let cntSakit = 0;
    let cntIzin = 0;
    let cntAlfa = 0;

    classStudents.forEach(s => {
      const stat = sessionState.attendance[s.id] || "Hadir";
      if (stat === "Hadir") cntHadir++;
      else if (stat === "Sakit") cntSakit++;
      else if (stat === "Izin") cntIzin++;
      else if (stat === "Alfa") cntAlfa++;
    });

    // Tulis ke elemen modal popup
    document.getElementById("modal-cnt-hadir").textContent = cntHadir;
    document.getElementById("modal-cnt-sakit").textContent = cntSakit;
    document.getElementById("modal-cnt-izin").textContent = cntIzin;
    document.getElementById("modal-cnt-alfa").textContent = cntAlfa;

    // Perbarui jam mulai & selesai di modal
    document.getElementById("modal-val-waktu").textContent = `${jamMulaiVal} - ${jamSelesaiVal}`;

    // Tampilkan modal
    modal.classList.remove("hidden");
  });

  // 5. Batalkan modal
  document.getElementById("btn-modal-cancel").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 6. Konfirmasi modal untuk Simpan ke Firestore
  const btnModalConfirm = document.getElementById("btn-modal-confirm");
  btnModalConfirm.addEventListener("click", async () => {
    btnModalConfirm.disabled = true;
    btnModalConfirm.textContent = "Menyimpan...";

    // Saring data ketidakhadiran (HANYA menyimpan yang tidak hadir demi hemat kuota reads/writes)
    const ketidakhadiran = [];
    classStudents.forEach(s => {
      const stat = sessionState.attendance[s.id] || "Hadir";
      if (stat !== "Hadir") {
        ketidakhadiran.push({
          siswa_id: s.id,
          status: stat
        });
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const sesiData = {
      tanggal: todayStr,
      tahun_ajaran: activeYear,
      kelas_id: sessionState.selectedClass,
      mapel: sessionState.selectedMapel,
      materi: sessionState.materi.trim(),
      catatan_kelas: sessionState.catatanKelas.trim(),
      jam_mulai: sessionState.jamMulai,
      jam_selesai: sessionState.jamSelesai,
      ketidakhadiran: ketidakhadiran
    };

    try {
      await saveSesiMengajar(sesiData);
      alert("Sesi mengajar berhasil disimpan ke database!");
      
      // Reset state dan kembali ke halaman pemilihan kelas
      resetSessionState();
      renderJurnal(container);
    } catch (err) {
      alert("Gagal menyimpan sesi mengajar. Silakan coba kembali.");
    } finally {
      btnModalConfirm.disabled = false;
      btnModalConfirm.textContent = "Ya, Simpan";
      modal.classList.add("hidden");
    }
  });
}

function resetSessionState() {
  sessionState = {
    isTeaching: false,
    isWaliKelasAbsen: false,
    selectedClass: "",
    selectedMapel: "",
    attendance: {},
    materi: "",
    catatanKelas: "",
    jamMulai: "",
    jamSelesai: ""
  };
}

function renderWaliKelasView(container, sekolah, siswa) {
  const activeYear = sekolah.tahun_ajaran_aktif;
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const ISOdateStr = new Date().toISOString().split('T')[0];

  // Filter siswa aktif di kelas 8A untuk tahun ajaran aktif
  const classStudents = siswa.filter(s => 
    s.status_aktif && 
    s.riwayat_kelas && 
    s.riwayat_kelas[activeYear] === "8A"
  ).sort((a, b) => a.nama.localeCompare(b.nama));

  const statusStyles = {
    "Hadir": { bg: "bg-slate-900 border-slate-800", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15", dot: "bg-emerald-500" },
    "Sakit": { bg: "bg-amber-950/20 border-amber-900/40", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/25", dot: "bg-amber-500" },
    "Izin": { bg: "bg-orange-950/20 border-orange-900/40", badge: "bg-orange-500/10 text-orange-400 border border-orange-500/25", dot: "bg-orange-500" },
    "Alfa": { bg: "bg-rose-950/20 border-rose-900/40", badge: "bg-rose-500/10 text-rose-400 border border-rose-500/25", dot: "bg-rose-500" }
  };

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in relative">
      
      <!-- Session Header Info -->
      <div class="flex justify-between items-center bg-slate-900 border border-slate-850 p-4 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Absensi Harian Wali Kelas</span>
          <h3 class="text-base font-bold text-white tracking-tight">Kelas 8A (Perwalian)</h3>
          <p class="text-slate-400 text-xs">${todayStr} • TA ${activeYear}</p>
        </div>
        <button id="btn-cancel-session" class="text-slate-400 hover:text-rose-400 text-xs font-semibold py-1.5 px-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg transition-colors cursor-pointer">
          Batal
        </button>
      </div>

      <!-- ABSENSI SECTION -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="flex justify-between items-center border-b border-slate-850 pb-2">
          <h4 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Absensi Siswa ("Tap" untuk ganti status)</h4>
          <span class="text-[10px] font-semibold text-slate-500">Siswa: ${classStudents.length}</span>
        </div>

        ${classStudents.length > 0 
          ? `
            <div class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              ${classStudents.map((s) => {
                const currentStatus = sessionState.attendance[s.id] || "Hadir";
                const style = statusStyles[currentStatus];
                
                return `
                  <div data-siswa-id="${s.id}" class="btn-toggle-absen flex justify-between items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${style.bg}">
                    <div class="flex items-center gap-3">
                      <div class="w-2.5 h-2.5 rounded-full ${style.dot} transition-colors duration-200 animate-pulse"></div>
                      <span class="text-sm font-semibold text-slate-200">${s.nama}</span>
                    </div>
                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${style.badge}">
                      ${currentStatus}
                    </span>
                  </div>
                `;
              }).join("")}
            </div>
          `
          : `<p class="text-center py-6 text-xs text-slate-500">Tidak ada siswa terdaftar di kelas perwalian 8A.</p>`
        }
      </div>

      <!-- ACTION BUTTON -->
      <button id="btn-save-session-trigger" 
        class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all text-sm cursor-pointer flex justify-center items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        <span>Simpan Absen Kelas</span>
      </button>

      <!-- MODAL POPUP KONFIRMASI (HIDDEN BY DEFAULT) -->
      <div id="confirm-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-800 animate-fade-in">
          <div class="text-center">
            <h4 class="text-base font-bold text-white tracking-tight">Konfirmasi Simpan Absensi</h4>
            <p class="text-slate-400 text-xs mt-1">Harap periksa rekap absensi berikut:</p>
          </div>

          <div class="bg-slate-900/60 rounded-2xl p-4 border border-slate-900 space-y-2 text-sm text-slate-300">
            <div class="flex justify-between">
              <span>Hadir:</span>
              <span class="font-bold text-emerald-400" id="modal-cnt-hadir">0</span>
            </div>
            <div class="flex justify-between">
              <span>Sakit:</span>
              <span class="font-bold text-amber-400" id="modal-cnt-sakit">0</span>
            </div>
            <div class="flex justify-between">
              <span>Izin:</span>
              <span class="font-bold text-orange-400" id="modal-cnt-izin">0</span>
            </div>
            <div class="flex justify-between">
              <span>Alfa:</span>
              <span class="font-bold text-rose-400" id="modal-cnt-alfa">0</span>
            </div>
            <div class="border-t border-slate-800 my-2 pt-2 flex justify-between text-xs text-slate-400">
              <span>Kelas:</span>
              <span class="font-medium text-white">Kelas 8A</span>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Tanggal:</span>
              <span class="font-medium text-white">${ISOdateStr}</span>
            </div>
          </div>

          <p class="text-center text-xs font-semibold text-slate-400">Apakah data absensi kelas perwalian ini sudah benar?</p>

          <div class="flex gap-2">
            <button id="btn-modal-cancel" class="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-semibold py-3 rounded-xl text-xs transition-all border border-slate-850 cursor-pointer">
              Periksa Kembali
            </button>
            <button id="btn-modal-confirm" class="flex-1 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer">
              Ya, Simpan
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  // --- HANDLER EVENT ---

  // 1. Klik Batal
  document.getElementById("btn-cancel-session").addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin membatalkan absensi wali kelas ini? Semua progress absensi akan hilang.")) {
      resetSessionState();
      renderJurnal(container);
    }
  });

  // 2. Toggle Status Absensi (Tap-to-Rotate)
  container.addEventListener("click", (e) => {
    const row = e.target.closest(".btn-toggle-absen");
    if (!row) return;

    const id = row.getAttribute("data-siswa-id");
    const current = sessionState.attendance[id] || "Hadir";
    
    const rotation = {
      "Hadir": "Sakit",
      "Sakit": "Izin",
      "Izin": "Alfa",
      "Alfa": "Hadir"
    };

    const next = rotation[current];
    sessionState.attendance[id] = next;

    const style = statusStyles[next];
    
    // Update background row
    row.className = `btn-toggle-absen flex justify-between items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${style.bg}`;
    
    // Update dot status
    const dot = row.querySelector(".rounded-full");
    dot.className = `w-2.5 h-2.5 rounded-full ${style.dot} transition-colors duration-200 animate-pulse`;
    
    // Update badge status text & style
    const badge = row.querySelector("span[class*='text-[10px]']");
    badge.textContent = next;
    badge.className = `text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200 ${style.badge}`;
  });

  // 3. Trigger Modal Simpan Sesi
  const btnTriggerSave = document.getElementById("btn-save-session-trigger");
  const modal = document.getElementById("confirm-modal");

  btnTriggerSave.addEventListener("click", () => {
    let cntHadir = 0;
    let cntSakit = 0;
    let cntIzin = 0;
    let cntAlfa = 0;

    classStudents.forEach(s => {
      const stat = sessionState.attendance[s.id] || "Hadir";
      if (stat === "Hadir") cntHadir++;
      else if (stat === "Sakit") cntSakit++;
      else if (stat === "Izin") cntIzin++;
      else if (stat === "Alfa") cntAlfa++;
    });

    document.getElementById("modal-cnt-hadir").textContent = cntHadir;
    document.getElementById("modal-cnt-sakit").textContent = cntSakit;
    document.getElementById("modal-cnt-izin").textContent = cntIzin;
    document.getElementById("modal-cnt-alfa").textContent = cntAlfa;

    modal.classList.remove("hidden");
  });

  // 4. Batalkan modal
  document.getElementById("btn-modal-cancel").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 5. Konfirmasi modal untuk Simpan ke Firestore
  const btnModalConfirm = document.getElementById("btn-modal-confirm");
  btnModalConfirm.addEventListener("click", async () => {
    btnModalConfirm.disabled = true;
    btnModalConfirm.textContent = "Menyimpan...";

    // Saring data ketidakhadiran (HANYA menyimpan yang tidak hadir demi hemat kuota)
    const ketidakhadiran = [];
    classStudents.forEach(s => {
      const stat = sessionState.attendance[s.id] || "Hadir";
      if (stat !== "Hadir") {
        ketidakhadiran.push({
          siswa_id: s.id,
          status: stat
        });
      }
    });

    const docId = `${ISOdateStr}_8A`;

    const data = {
      tanggal: ISOdateStr,
      tahun_ajaran: activeYear,
      kelas_id: "8A",
      ketidakhadiran: ketidakhadiran
    };

    try {
      await saveAbsensiWaliKelas(docId, data);
      alert("Absensi Wali Kelas berhasil disimpan!");
      
      resetSessionState();
      renderJurnal(container);
    } catch (err) {
      alert("Gagal menyimpan absensi wali kelas. Silakan coba kembali.");
    } finally {
      btnModalConfirm.disabled = false;
      btnModalConfirm.textContent = "Ya, Simpan";
      modal.classList.add("hidden");
    }
  });
}
