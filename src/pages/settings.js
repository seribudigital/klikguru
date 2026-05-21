import { appState, updateMetadataSekolah, addKelas, addSiswa, addSiswaMassal, updateSiswa } from "../state";

export function renderSettings(container) {
  const { sekolah, kelas, siswa } = appState;
  
  // Format tanggal hari ini YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Mengelompokkan siswa per kelas untuk filter visual di UI
  // Kita simpan filter kelas aktif untuk melihat siswa di state UI sementara (memanfaatkan dataset)
  const defaultFilterClass = kelas.length > 0 ? kelas[0] : "";
  const activeFilterClass = container.dataset.activeFilterClass || defaultFilterClass;

  // Filter seluruh siswa kelas terpilih untuk tahun ajaran aktif (baik aktif maupun non-aktif/mutasi)
  const filteredSiswa = siswa.filter(s => 
    s.riwayat_kelas && 
    s.riwayat_kelas[sekolah.tahun_ajaran_aktif] === activeFilterClass
  ).sort((a, b) => a.nama.localeCompare(b.nama));

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in pb-8">
      
      <!-- Page Title -->
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight font-sans">Pengaturan</h2>
        <p class="text-slate-400 text-xs mt-1">Konfigurasi data sekolah, kelas, mapel, dan data siswa.</p>
      </div>

      <!-- CARD 1: Tahun Ajaran & Mapel -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="border-b border-slate-800 pb-2">
          <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Tahun Ajaran & Mapel</h3>
        </div>

        <div class="space-y-3">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tahun Ajaran Aktif</label>
          <div class="flex gap-2">
            <input type="text" id="input-tahun-ajaran" 
              class="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium"
              placeholder="Contoh: 2026_2027" 
              value="${sekolah.tahun_ajaran_aktif || ''}">
            <button id="btn-save-tahun" 
              class="bg-slate-850 hover:bg-slate-800 active:scale-95 text-emerald-400 border border-emerald-500/20 font-semibold px-5 rounded-xl text-sm transition-all cursor-pointer">
              Simpan
            </button>
          </div>
          <div id="save-status" class="hidden text-xs text-emerald-400 font-medium">Tahun ajaran berhasil disimpan!</div>
        </div>

        <div class="space-y-3 pt-2">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mata Pelajaran</label>
          <!-- Form Tambah Mapel -->
          <div class="flex gap-2">
            <input type="text" id="input-mapel-baru" 
              class="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium"
              placeholder="Tambah Mapel Baru...">
            <button id="btn-add-mapel" 
              class="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-4 rounded-xl text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/10"
              title="Tambah Mapel">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <!-- List Mapel -->
          <ul id="list-mapel" class="divide-y divide-slate-900/60 max-h-40 overflow-y-auto pr-1">
            ${sekolah.daftar_mapel && sekolah.daftar_mapel.length > 0 
              ? sekolah.daftar_mapel.map((mapel, index) => `
                <li class="flex justify-between items-center py-2.5 group">
                  <span class="text-sm text-slate-350 font-medium">${mapel}</span>
                  <button data-index="${index}" class="btn-archive-mapel p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              `).join("")
              : `<li class="text-center py-4 text-xs text-slate-500">Belum ada mata pelajaran.</li>`
            }
          </ul>
        </div>
      </div>

      <!-- CARD 2: Manajemen Kelas -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="border-b border-slate-800 pb-2">
          <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Manajemen Kelas</h3>
        </div>

        <div class="space-y-3">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tambah Kelas Baru</label>
          <div class="flex gap-2">
            <input type="text" id="input-kelas-baru" 
              class="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium"
              placeholder="Contoh: 7A, 8B, 9C">
            <button id="btn-add-kelas" 
              class="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-4 rounded-xl text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/10">
              Tambah
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Daftar Kelas Aktif</label>
          <div class="flex flex-wrap gap-2 py-1">
            ${kelas.length > 0 
              ? kelas.map(k => `
                <span class="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200">
                  ${k}
                </span>
              `).join("")
              : `<p class="text-xs text-slate-500 py-1">Belum ada kelas terdaftar.</p>`
            }
          </div>
        </div>
      </div>

      <!-- CARD 3: Manajemen Siswa -->
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="border-b border-slate-800 pb-2">
          <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Manajemen Siswa</h3>
        </div>

        <!-- Form Tambah Siswa -->
        <div id="form-tambah-siswa" class="space-y-3.5 bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
          <div class="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 class="text-xs font-bold text-emerald-400">Pendaftaran Siswa Baru</h4>
            <button id="btn-download-template" 
              class="text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Unduh Templat</span>
            </button>
          </div>
          
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="input-siswa-nama">Nama Lengkap</label>
            <input type="text" id="input-siswa-nama" 
              class="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium"
              placeholder="Masukkan nama siswa...">
          </div>

          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="select-siswa-kelas">Kelas (Tahun Ajaran ${sekolah.tahun_ajaran_aktif})</label>
            <select id="select-siswa-kelas" 
              class="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium">
              <option value="" disabled selected>-- Pilih Kelas --</option>
              ${kelas.map(k => `<option value="${k}">${k}</option>`).join("")}
            </select>
          </div>

          <button id="btn-save-siswa" 
            class="w-full bg-slate-800 hover:bg-slate-750 active:scale-95 text-emerald-400 border border-emerald-500/20 font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer flex justify-center items-center gap-2">
            <span>Daftarkan Siswa</span>
          </button>
        </div>

        <!-- Form Unggah Siswa Massal -->
        <div id="form-import-siswa" class="space-y-3.5 bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
          <h4 class="text-xs font-bold text-emerald-400">Unggah Data Siswa Massal</h4>
          
          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="select-import-kelas">Pilih Kelas Tujuan (Tahun Ajaran ${sekolah.tahun_ajaran_aktif})</label>
            <select id="select-import-kelas" 
              class="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium">
              <option value="" disabled selected>-- Pilih Kelas Tujuan --</option>
              ${kelas.map(k => `<option value="${k}">${k}</option>`).join("")}
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">File Excel/CSV (.xlsx, .csv)</label>
            
            <label class="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900/40 transition-all group">
              <div class="flex flex-col items-center justify-center pt-3 pb-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 group-hover:text-emerald-400 mb-1.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium px-2" id="import-file-label">Klik untuk pilih file</p>
                <p class="text-[9px] text-slate-600 mt-0.5">Mendukung .xlsx & .csv</p>
              </div>
              <input type="file" id="input-import-file" class="hidden" accept=".xlsx, .csv" />
            </label>
          </div>

          <!-- Loading & Status Indicator -->
          <div id="import-status-container" class="hidden flex items-center justify-center gap-2 p-2 bg-slate-950/80 border border-slate-900 rounded-xl">
            <div id="import-spinner" class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span id="import-status-text" class="text-xs text-slate-400 font-medium">Memproses file...</span>
          </div>

          <button id="btn-import-siswa" 
            class="w-full bg-slate-800 hover:bg-slate-750 active:scale-95 text-emerald-400 border border-emerald-500/20 font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer flex justify-center items-center gap-2" disabled>
            <span>Mulai Impor Siswa</span>
          </button>
        </div>

        <!-- Section List Siswa dengan Filter Kelas -->
        <div class="space-y-3 pt-2">
          <div class="flex justify-between items-center">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lihat Anggota Kelas</label>
            <span class="text-[10px] font-semibold text-slate-500">Total Siswa Aktif: ${siswa.filter(s => s.status_aktif).length}</span>
          </div>

          <div class="flex gap-2">
            <select id="filter-siswa-kelas" 
              class="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold">
              <option value="" ${!activeFilterClass ? "selected" : ""} disabled>-- Pilih Kelas Filter --</option>
              ${kelas.map(k => `<option value="${k}" ${activeFilterClass === k ? "selected" : ""}>Kelas ${k}</option>`).join("")}
            </select>
          </div>

          <!-- List Siswa Hasil Filter -->
          <div class="bg-slate-950/65 rounded-xl border border-slate-900 max-h-60 overflow-y-auto">
            <table class="w-full text-left text-xs text-slate-350">
              <thead class="bg-slate-900/60 text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-900">
                <tr>
                  <th class="px-4 py-2.5">Nama & Status</th>
                  <th class="px-4 py-2.5">Tanggal Masuk</th>
                  <th class="px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-siswa-body">
                ${filteredSiswa.length > 0 
                  ? filteredSiswa.map(s => {
                      const statusBadge = s.status_sekolah === "Aktif" || !s.status_sekolah
                        ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Aktif</span>`
                        : s.status_sekolah === "Pindah Sekolah"
                          ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/10">Pindah</span>`
                          : `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/10">Lulus</span>`;
                      
                      return `
                        <tr class="border-b border-slate-900/30 hover:bg-slate-900/10">
                          <td class="px-4 py-2.5">
                            <div class="font-medium text-slate-200">${s.nama}</div>
                            <div class="mt-0.5 flex items-center gap-1.5 flex-wrap">
                              ${statusBadge}
                              ${s.tanggal_keluar ? `<span class="text-[9px] text-slate-500 font-medium">Keluar: ${s.tanggal_keluar}</span>` : ""}
                            </div>
                          </td>
                          <td class="px-4 py-2.5 text-slate-400 font-medium">${s.tanggal_masuk || todayStr}</td>
                          <td class="px-4 py-2.5 text-right">
                            <button data-id="${s.id}" class="btn-mutasi-siswa px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-805/80 text-[10px] font-bold text-emerald-400 hover:text-emerald-350 rounded-lg transition-all cursor-pointer">
                              Mutasi
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join("")
                  : `<tr><td colspan="3" class="text-center py-6 text-slate-500">Tidak ada siswa terdaftar di kelas ini.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;

  // --- HANDLER EVENT ---

  // Elements
  const inputTahun = document.getElementById("input-tahun-ajaran");
  const btnSaveTahun = document.getElementById("btn-save-tahun");
  const elStatus = document.getElementById("save-status");
  const inputMapel = document.getElementById("input-mapel-baru");
  const btnAddMapel = document.getElementById("btn-add-mapel");
  const listMapelUl = document.getElementById("list-mapel");

  const inputKelas = document.getElementById("input-kelas-baru");
  const btnAddKelas = document.getElementById("btn-add-kelas");

  const inputSiswaNama = document.getElementById("input-siswa-nama");
  const selectSiswaKelas = document.getElementById("select-siswa-kelas");
  const btnSaveSiswa = document.getElementById("btn-save-siswa");

  const filterSiswaKelas = document.getElementById("filter-siswa-kelas");

  const btnDownloadTemplate = document.getElementById("btn-download-template");
  const selectImportKelas = document.getElementById("select-import-kelas");
  const importFileLabel = document.getElementById("import-file-label");
  const inputImportFile = document.getElementById("input-import-file");
  const importStatusContainer = document.getElementById("import-status-container");
  const importStatusText = document.getElementById("import-status-text");
  const btnImportSiswa = document.getElementById("btn-import-siswa");

  // 1. Simpan Tahun Ajaran
  btnSaveTahun.addEventListener("click", async () => {
    const val = inputTahun.value.trim().replace(/\s+/g, "_");
    if (!val) {
      alert("Tahun ajaran tidak boleh kosong!");
      return;
    }
    btnSaveTahun.disabled = true;
    try {
      await updateMetadataSekolah({ tahun_ajaran_aktif: val });
      elStatus.classList.remove("hidden");
      setTimeout(() => elStatus.classList.add("hidden"), 2000);
      renderSettings(container);
    } catch (err) {
      alert("Gagal menyimpan tahun ajaran.");
    } finally {
      btnSaveTahun.disabled = false;
    }
  });

  // 2. Tambah Mapel
  btnAddMapel.addEventListener("click", async () => {
    const newMapel = inputMapel.value.trim();
    if (!newMapel) return;
    if (sekolah.daftar_mapel.some(m => m.toLowerCase() === newMapel.toLowerCase())) {
      alert("Mata pelajaran sudah terdaftar.");
      return;
    }
    const updatedMapel = [...sekolah.daftar_mapel, newMapel];
    btnAddMapel.disabled = true;
    try {
      await updateMetadataSekolah({ daftar_mapel: updatedMapel });
      inputMapel.value = "";
      renderSettings(container);
    } catch (err) {
      alert("Gagal menambahkan mata pelajaran.");
    } finally {
      btnAddMapel.disabled = false;
    }
  });

  // 3. Hapus Mapel (Event Delegation)
  listMapelUl.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-archive-mapel");
    if (!btn) return;
    const index = parseInt(btn.getAttribute("data-index"), 10);
    const mapelName = sekolah.daftar_mapel[index];
    if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${mapelName}"?`)) {
      const updatedMapel = sekolah.daftar_mapel.filter((_, i) => i !== index);
      try {
        await updateMetadataSekolah({ daftar_mapel: updatedMapel });
        renderSettings(container);
      } catch (err) {
        alert("Gagal menghapus mata pelajaran.");
      }
    }
  });

  // 4. Tambah Kelas Baru
  btnAddKelas.addEventListener("click", async () => {
    const newKelas = inputKelas.value.trim().toUpperCase();
    if (!newKelas) {
      alert("Masukkan nama kelas!");
      return;
    }
    if (kelas.includes(newKelas)) {
      alert("Kelas ini sudah terdaftar!");
      return;
    }
    btnAddKelas.disabled = true;
    try {
      await addKelas(newKelas);
      inputKelas.value = "";
      renderSettings(container);
    } catch (err) {
      alert("Gagal menambahkan kelas baru.");
    } finally {
      btnAddKelas.disabled = false;
    }
  });

  // 5. Tambah Siswa Baru
  btnSaveSiswa.addEventListener("click", async () => {
    const nama = inputSiswaNama.value.trim();
    const kelasId = selectSiswaKelas.value;

    if (!sekolah.tahun_ajaran_aktif) {
      alert("Tentukan Tahun Ajaran Aktif terlebih dahulu di bagian atas!");
      return;
    }
    if (!nama) {
      alert("Masukkan nama siswa!");
      return;
    }
    if (!kelasId) {
      alert("Pilih kelas siswa!");
      return;
    }

    const siswaData = {
      nama: nama,
      status_aktif: true,
      status_sekolah: "Aktif",
      tanggal_masuk: todayStr,
      tanggal_keluar: null,
      riwayat_kelas: {
        [sekolah.tahun_ajaran_aktif]: kelasId
      }
    };

    btnSaveSiswa.disabled = true;
    btnSaveSiswa.innerHTML = `<span>Mendaftarkan...</span>`;
    try {
      await addSiswa(siswaData);
      inputSiswaNama.value = "";
      // Set filter view ke kelas siswa yang baru didaftarkan agar langsung kelihatan
      container.dataset.activeFilterClass = kelasId;
      renderSettings(container);
    } catch (err) {
      alert("Gagal mendaftarkan siswa baru.");
    } finally {
      btnSaveSiswa.disabled = false;
      btnSaveSiswa.innerHTML = `<span>Daftarkan Siswa</span>`;
    }
  });

  // 6. Filter Siswa Berdasarkan Kelas
  filterSiswaKelas.addEventListener("change", (e) => {
    container.dataset.activeFilterClass = e.target.value;
    renderSettings(container);
  });

  // --- HANDLER IMPOR MASSAL ---

  // 7. Unduh Templat
  btnDownloadTemplate.addEventListener("click", () => {
    const csvContent = "Nama Siswa\nBudi Santoso\nSiti Aminah\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "templat_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Validasi input untuk mengaktifkan/nonaktifkan tombol impor
  function validateImportInputs() {
    const fileSelected = inputImportFile.files && inputImportFile.files.length > 0;
    const classSelected = selectImportKelas.value !== "";
    btnImportSiswa.disabled = !(fileSelected && classSelected);
    if (fileSelected && classSelected) {
      btnImportSiswa.classList.remove("bg-slate-800", "text-emerald-400/40");
      btnImportSiswa.classList.add("bg-emerald-500", "hover:bg-emerald-400", "text-slate-950", "shadow-lg", "shadow-emerald-500/10");
    } else {
      btnImportSiswa.classList.add("bg-slate-800", "text-emerald-400/40");
      btnImportSiswa.classList.remove("bg-emerald-500", "hover:bg-emerald-400", "text-slate-950", "shadow-lg", "shadow-emerald-500/10");
    }
  }

  selectImportKelas.addEventListener("change", validateImportInputs);

  inputImportFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      importFileLabel.textContent = file.name;
      importFileLabel.classList.add("text-emerald-400", "font-semibold");
    } else {
      importFileLabel.textContent = "Klik untuk pilih file";
      importFileLabel.classList.remove("text-emerald-400", "font-semibold");
    }
    validateImportInputs();
  });

  btnImportSiswa.addEventListener("click", async () => {
    const kelasId = selectImportKelas.value;
    const file = inputImportFile.files[0];

    if (!sekolah.tahun_ajaran_aktif) {
      alert("Tentukan Tahun Ajaran Aktif terlebih dahulu di bagian atas!");
      return;
    }
    if (!kelasId) {
      alert("Pilih kelas tujuan terlebih dahulu!");
      return;
    }
    if (!file) {
      alert("Pilih file Excel/CSV terlebih dahulu!");
      return;
    }

    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const isCsv = file.name.endsWith(".csv");

    if (!isXlsx && !isCsv) {
      alert("Format file tidak didukung. Harap unggah file .xlsx atau .csv.");
      return;
    }

    // Tampilkan loading
    importStatusContainer.classList.remove("hidden");
    importStatusText.textContent = "Membaca file...";
    btnImportSiswa.disabled = true;
    selectImportKelas.disabled = true;
    inputImportFile.disabled = true;

    let studentNames = [];

    try {
      if (isXlsx) {
        importStatusText.textContent = "Memuat parser Excel...";
        const XLSX = await loadSheetJS();
        importStatusText.textContent = "Membaca data Excel...";
        const data = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        studentNames = extractNamesFromSheetData(json);
      } else {
        // Is CSV: try SheetJS first, fallback to manual if fails
        try {
          importStatusText.textContent = "Memuat parser CSV...";
          const XLSX = await loadSheetJS();
          importStatusText.textContent = "Membaca data CSV...";
          const data = await readFileAsArrayBuffer(file);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          studentNames = extractNamesFromSheetData(json);
        } catch (sheetError) {
          console.warn("SheetJS failed to load, falling back to manual CSV parser:", sheetError);
          importStatusText.textContent = "Membaca data CSV (fallback)...";
          const text = await readFileAsText(file);
          studentNames = parseCsvManual(text);
        }
      }

      if (studentNames.length === 0) {
        alert("Tidak ada nama siswa yang ditemukan di file. Pastikan ada kolom dengan header berisi kata 'Nama'.");
        resetImportUI();
        return;
      }

      importStatusText.textContent = `Menyimpan ${studentNames.length} siswa ke Firestore...`;

      // Buat list data siswa
      const siswaDataList = studentNames.map(name => ({
        nama: name,
        status_aktif: true,
        status_sekolah: "Aktif",
        tanggal_masuk: todayStr,
        tanggal_keluar: null,
        riwayat_kelas: {
          [sekolah.tahun_ajaran_aktif]: kelasId
        }
      }));

      // Panggil addSiswaMassal
      const totalImported = await addSiswaMassal(siswaDataList);

      // Notifikasi sukses
      alert(`Berhasil mengimpor ${totalImported} siswa ke Kelas ${kelasId}`);
      
      // Update filter view ke kelas tujuan impor agar data langsung terlihat
      container.dataset.activeFilterClass = kelasId;
      renderSettings(container);

    } catch (err) {
      console.error("Gagal mengimpor siswa:", err);
      alert("Terjadi kesalahan saat mengimpor data siswa: " + err.message);
      resetImportUI();
    }
  });

  function resetImportUI() {
    importStatusContainer.classList.add("hidden");
    btnImportSiswa.disabled = false;
    selectImportKelas.disabled = false;
    inputImportFile.disabled = false;
    validateImportInputs();
  }

  // 8. Klik Mutasi Siswa (Event Delegation)
  const tableBody = document.getElementById("table-siswa-body");
  if (tableBody) {
    tableBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-mutasi-siswa");
      if (!btn) return;
      
      const siswaId = btn.getAttribute("data-id");
      const siswaObj = siswa.find(s => s.id === siswaId);
      if (!siswaObj) return;
      
      showMutasiModal(siswaObj, async (updatedData) => {
        await updateSiswa(siswaId, updatedData);
        renderSettings(container);
      });
    });
  }
}

// --- HELPER UNTUK IMPOR MASSAL ---

function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

function extractNamesFromSheetData(rows) {
  if (!rows || rows.length === 0) return [];
  
  // Temukan baris header pertama yang tidak kosong
  let headerRowIndex = 0;
  while (headerRowIndex < rows.length && (!rows[headerRowIndex] || rows[headerRowIndex].length === 0)) {
    headerRowIndex++;
  }
  
  if (headerRowIndex >= rows.length) return [];
  
  const header = rows[headerRowIndex];
  // Cari kolom yang berisi "nama" (case-insensitive)
  let nameColIndex = header.findIndex(col => col && col.toString().toLowerCase().includes("nama"));
  
  // Jika tidak ditemukan, default ke kolom 0
  if (nameColIndex === -1) {
    nameColIndex = 0;
  }
  
  const names = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row && row[nameColIndex]) {
      const name = row[nameColIndex].toString().trim();
      if (name) {
        names.push(name);
      }
    }
  }
  return names;
}

function parseCsvManual(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Ambil baris pertama sebagai header
  const header = lines[0].split(",");
  let nameColIndex = header.findIndex(col => col && col.toLowerCase().includes("nama"));
  if (nameColIndex === -1) {
    nameColIndex = 0;
  }
  
  const names = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    let cols = [];
    if (line.includes('"')) {
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches) {
        cols = matches.map(c => c.replace(/^"|"$/g, "").trim());
      } else {
        cols = line.split(",");
      }
    } else {
      cols = line.split(",");
    }
    
    if (cols[nameColIndex]) {
      const name = cols[nameColIndex].trim();
      if (name) {
        names.push(name);
      }
    }
  }
  return names;
}

// --- HELPER UNTUK MODAL MUTASI ---

function showMutasiModal(siswaObj, onSave) {
  // Buat element modal overlay
  const modalEl = document.createElement("div");
  modalEl.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  
  const todayStr = new Date().toISOString().split('T')[0];
  const currentStatus = siswaObj.status_sekolah || "Aktif";
  const currentTanggalKeluar = siswaObj.tanggal_keluar || todayStr;
  
  modalEl.innerHTML = `
    <div class="glass w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-850 animate-fade-in text-left">
      <div>
        <h4 class="text-base font-bold text-white tracking-tight">Mutasi / Edit Status Siswa</h4>
        <p class="text-slate-400 text-[11px] mt-1">Siswa: <span class="text-slate-200 font-semibold">${siswaObj.nama}</span></p>
      </div>

      <div class="space-y-4">
        <!-- Pilihan Status -->
        <div class="space-y-2">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Sekolah</label>
          <select id="modal-mutasi-status" 
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm font-semibold">
            <option value="Aktif" ${currentStatus === "Aktif" ? "selected" : ""}>Aktif</option>
            <option value="Pindah Sekolah" ${currentStatus === "Pindah Sekolah" ? "selected" : ""}>Pindah Sekolah</option>
            <option value="Lulus" ${currentStatus === "Lulus" ? "selected" : ""}>Lulus</option>
          </select>
        </div>

        <!-- Input Tanggal Keluar (Hanya tampil jika non-aktif) -->
        <div id="modal-mutasi-tanggal-container" class="${currentStatus === "Aktif" ? "hidden" : ""} space-y-2">
          <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="modal-mutasi-tanggal">Tanggal Efektif Keluar</label>
          <input type="date" id="modal-mutasi-tanggal" 
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-all text-sm font-semibold"
            value="${currentTanggalKeluar}">
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button id="btn-modal-mutasi-cancel" class="flex-1 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-350 font-semibold py-3 rounded-xl text-xs transition-all border border-slate-800/80 cursor-pointer">
          Batal
        </button>
        <button id="btn-modal-mutasi-save" class="flex-1 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer">
          Simpan Status
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalEl);
  
  const selectStatus = modalEl.querySelector("#modal-mutasi-status");
  const tanggalContainer = modalEl.querySelector("#modal-mutasi-tanggal-container");
  const inputTanggal = modalEl.querySelector("#modal-mutasi-tanggal");
  const btnCancel = modalEl.querySelector("#btn-modal-mutasi-cancel");
  const btnSave = modalEl.querySelector("#btn-modal-mutasi-save");
  
  // Toggle input tanggal berdasarkan status
  selectStatus.addEventListener("change", (e) => {
    if (e.target.value === "Aktif") {
      tanggalContainer.classList.add("hidden");
    } else {
      tanggalContainer.classList.remove("hidden");
    }
  });
  
  btnCancel.addEventListener("click", () => {
    modalEl.remove();
  });
  
  btnSave.addEventListener("click", async () => {
    const status = selectStatus.value;
    const isAktif = status === "Aktif";
    const tanggalKeluar = isAktif ? null : inputTanggal.value;
    
    if (!isAktif && !tanggalKeluar) {
      alert("Harap isi tanggal efektif keluar!");
      return;
    }
    
    btnSave.disabled = true;
    btnSave.textContent = "Menyimpan...";
    
    try {
      await onSave({
        status_sekolah: status,
        status_aktif: isAktif,
        tanggal_keluar: tanggalKeluar
      });
      modalEl.remove();
    } catch (err) {
      alert("Gagal memperbarui status siswa.");
      btnSave.disabled = false;
      btnSave.textContent = "Simpan Status";
    }
  });
}
