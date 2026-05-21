import { appState } from "../state";

// Module-level state to persist filters when switching tabs
let rekapState = {
  tipeRekap: "mapel", // "mapel" atau "wali"
  selectedClass: "",
  selectedMapel: "",
  tanggalMulai: "",
  tanggalSelesai: ""
};

export function renderRekap(container) {
  const { sekolah, kelas, siswa, jurnal, absensiWali } = appState;

  // 1. Inisialisasi Filter Default jika kosong
  if (!rekapState.tipeRekap) {
    rekapState.tipeRekap = "mapel";
  }
  if (!rekapState.selectedClass && kelas.length > 0) {
    rekapState.selectedClass = kelas[0];
  }
  if (!rekapState.selectedMapel && sekolah.daftar_mapel.length > 0) {
    rekapState.selectedMapel = sekolah.daftar_mapel[0];
  }
  if (!rekapState.tanggalMulai) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    rekapState.tanggalMulai = thirtyDaysAgo.toISOString().split('T')[0];
  }
  if (!rekapState.tanggalSelesai) {
    rekapState.tanggalSelesai = new Date().toISOString().split('T')[0];
  }

  const activeYear = sekolah.tahun_ajaran_aktif;
  const isWali = rekapState.tipeRekap === "wali";
  const selectedClassForCalculation = isWali ? "8A" : rekapState.selectedClass;

  // 2. Filter Sesi Jurnal / Absensi Wali Terpilih
  const filteredJurnal = jurnal.filter(j => {
    const matchClass = j.kelas_id === selectedClassForCalculation;
    const matchMapel = j.mapel === rekapState.selectedMapel;
    const matchDate = j.tanggal >= rekapState.tanggalMulai && j.tanggal <= rekapState.tanggalSelesai;
    return matchClass && matchMapel && matchDate;
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const filteredAbsensiWali = (absensiWali || []).filter(a => {
    const matchClass = a.kelas_id === "8A";
    const matchDate = a.tanggal >= rekapState.tanggalMulai && a.tanggal <= rekapState.tanggalSelesai;
    return matchClass && matchDate;
  }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const sourceData = isWali ? filteredAbsensiWali : filteredJurnal;

  // 3. Filter Daftar Siswa Kelas Terpilih di Tahun Ajaran Aktif
  const classStudents = siswa.filter(s => 
    s.riwayat_kelas && 
    s.riwayat_kelas[activeYear] === selectedClassForCalculation
  ).sort((a, b) => a.nama.localeCompare(b.nama));

  // 4. Hitung Statistik per Siswa dengan Logika Adil Mutasi
  const rekapSiswa = classStudents.map(s => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alfa = 0;
    let totalEligibleSesi = 0;

    sourceData.forEach(sesi => {
      const tSesi = sesi.tanggal;
      const tMasuk = s.tanggal_masuk || "";
      const tKeluar = s.tanggal_keluar || "";

      // Logika Kritis: Abaikan sesi dari perhitungan jika diluar masa aktif sekolah siswa
      if (tMasuk && tSesi < tMasuk) return;
      if (tKeluar && tSesi > tKeluar) return;

      totalEligibleSesi++;

      // Cari record ketidakhadiran siswa pada sesi ini
      const tidakHadir = sesi.ketidakhadiran && sesi.ketidakhadiran.find(kh => kh.siswa_id === s.id);
      if (tidakHadir) {
        const status = tidakHadir.status;
        if (status === "Sakit") sakit++;
        else if (status === "Izin") izin++;
        else if (status === "Alfa") alfa++;
      } else {
        hadir++;
      }
    });

    const persentase = totalEligibleSesi > 0 
      ? Math.round((hadir / totalEligibleSesi) * 100)
      : null;

    return {
      id: s.id,
      nama: s.nama,
      status_sekolah: s.status_sekolah || "Aktif",
      tanggal_masuk: s.tanggal_masuk || "",
      tanggal_keluar: s.tanggal_keluar || "",
      hadir,
      sakit,
      izin,
      alfa,
      totalEligibleSesi,
      persentase
    };
  });

  // Hitung rata-rata kehadiran kelas (hanya untuk siswa yang punya sesi eligible)
  const studentsWithSesi = rekapSiswa.filter(s => s.totalEligibleSesi > 0);
  const avgClassAttendance = studentsWithSesi.length > 0
    ? Math.round(studentsWithSesi.reduce((sum, s) => sum + s.persentase, 0) / studentsWithSesi.length)
    : null;

  // Render HTML
  container.innerHTML = `
    <div class="space-y-5 animate-fade-in pb-8">
      
      <!-- Page Title -->
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Rekap Kehadiran & Jurnal</h2>
        <p class="text-slate-400 text-xs mt-1">Pusat laporan pembelajaran kelas dan statistik absensi siswa.</p>
      </div>

      <!-- FILTER PANEL -->
      <div class="glass rounded-2xl p-5 space-y-4 border border-slate-900 shadow-lg">
        
        <!-- Toggle Tipe Rekap -->
        <div class="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button id="btn-tipe-mapel" class="flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isWali ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}">
            Rekap Mata Pelajaran
          </button>
          <button id="btn-tipe-wali" class="flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${isWali ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}">
            Rekap Wali Kelas (8A)
          </button>
        </div>

        <div class="${isWali ? 'block' : 'grid grid-cols-2 gap-3'}">
          <!-- Pilih Kelas -->
          <div class="space-y-1.5 ${isWali ? 'opacity-50 pointer-events-none' : ''}">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Kelas</label>
            <select id="rekap-select-kelas" ${isWali ? 'disabled' : ''} 
              class="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold">
              ${isWali 
                ? `<option value="8A" selected>Kelas 8A</option>`
                : (kelas.length > 0 
                    ? kelas.map(k => `<option value="${k}" ${rekapState.selectedClass === k ? "selected" : ""}>Kelas ${k}</option>`).join("")
                    : `<option value="" disabled>Belum ada kelas</option>`
                  )
              }
            </select>
          </div>

          <!-- Pilih Mapel -->
          <div class="space-y-1.5 ${isWali ? 'hidden' : ''}">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mata Pelajaran</label>
            <select id="rekap-select-mapel" 
              class="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold">
              ${sekolah.daftar_mapel.length > 0
                ? sekolah.daftar_mapel.map(m => `<option value="${m}" ${rekapState.selectedMapel === m ? "selected" : ""}>${m}</option>`).join("")
                : `<option value="" disabled>Belum ada mapel</option>`
              }
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Tanggal Mulai -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="rekap-date-mulai">Mulai Tanggal</label>
            <input type="date" id="rekap-date-mulai" 
              class="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold"
              value="${rekapState.tanggalMulai}">
          </div>

          <!-- Tanggal Selesai -->
          <div class="space-y-1.5">
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider" for="rekap-date-selesai">Sampai Tanggal</label>
            <input type="date" id="rekap-date-selesai" 
              class="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-xs font-semibold"
              value="${rekapState.tanggalSelesai}">
          </div>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Card 1: Total Pertemuan / Hari -->
        <div class="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between h-20 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">${isWali ? "Total Hari Absensi" : "Total Pertemuan"}</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold text-white tracking-tight">${sourceData.length}</span>
            <span class="text-slate-500 text-[10px] font-medium">${isWali ? "Hari" : "Sesi"}</span>
          </div>
        </div>

        <!-- Card 2: Kehadiran Rata-rata -->
        <div class="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between h-20 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rata Kehadiran</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-bold text-emerald-400 tracking-tight">${avgClassAttendance !== null ? `${avgClassAttendance}%` : "-"}</span>
          </div>
        </div>
      </div>

      <!-- TABLE & EXPORT -->
      <div class="glass rounded-2xl p-5 space-y-4 border border-slate-900 shadow-lg">
        <div class="flex justify-between items-center border-b border-slate-850 pb-2.5">
          <h3 class="text-xs font-bold text-slate-400 tracking-wider uppercase">Daftar Kehadiran Siswa</h3>
          
          <button id="btn-export-csv" 
            class="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:bg-slate-850 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor CSV</span>
          </button>
        </div>

        <!-- Scrollable Table -->
        <div class="bg-slate-950/65 rounded-xl border border-slate-900 max-h-[300px] overflow-y-auto">
          <table class="w-full text-left text-xs text-slate-350 border-collapse">
            <thead class="bg-slate-900/80 text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-900 sticky top-0 z-10">
              <tr>
                <th class="px-3.5 py-2.5">Nama</th>
                <th class="px-2 py-2.5 text-center" title="Hadir">H</th>
                <th class="px-2 py-2.5 text-center" title="Sakit">S</th>
                <th class="px-2 py-2.5 text-center" title="Izin">I</th>
                <th class="px-2 py-2.5 text-center" title="Alfa">A</th>
                <th class="px-3.5 py-2.5 text-right">%</th>
              </tr>
            </thead>
            <tbody id="rekap-siswa-body">
              ${rekapSiswa.length > 0 
                ? rekapSiswa.map(s => {
                    const lowAtt = s.persentase !== null && s.persentase < 75;
                    const pctText = s.persentase !== null ? `${s.persentase}%` : "-";
                    const pctClass = lowAtt ? "text-rose-450 font-bold" : "text-slate-200 font-semibold";
                    
                    return `
                      <tr class="border-b border-slate-900/30 hover:bg-slate-900/10">
                        <td class="px-3.5 py-3 font-medium text-slate-200">
                          <div class="max-w-[150px] truncate" title="${s.nama}">${s.nama}</div>
                          ${s.status_sekolah !== "Aktif" 
                            ? `<span class="inline-block mt-0.5 text-[8px] px-1 bg-slate-900 text-slate-500 border border-slate-800 rounded font-bold uppercase tracking-wider">${s.status_sekolah === "Pindah Sekolah" ? "Pindah" : s.status_sekolah}</span>`
                            : ""
                          }
                        </td>
                        <td class="px-2 py-3 text-center text-slate-400 font-medium">${s.hadir}</td>
                        <td class="px-2 py-3 text-center text-amber-500/80 font-medium">${s.sakit}</td>
                        <td class="px-2 py-3 text-center text-orange-500/80 font-medium">${s.izin}</td>
                        <td class="px-2 py-3 text-center text-rose-500/80 font-medium">${s.alfa}</td>
                        <td class="px-3.5 py-3 text-right ${pctClass}">${pctText}</td>
                      </tr>
                    `;
                  }).join("")
                : `<tr><td colspan="6" class="text-center py-8 text-slate-500 font-medium">Tidak ada data siswa.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  `;

  // --- EVENT LISTENERS ---

  const selectKelas = document.getElementById("rekap-select-kelas");
  const selectMapel = document.getElementById("rekap-select-mapel");
  const dateMulai = document.getElementById("rekap-date-mulai");
  const dateSelesai = document.getElementById("rekap-date-selesai");
  const btnExport = document.getElementById("btn-export-csv");
  const btnTipeMapel = document.getElementById("btn-tipe-mapel");
  const btnTipeWali = document.getElementById("btn-tipe-wali");

  const updateFilter = () => {
    if (selectKelas) rekapState.selectedClass = selectKelas.value;
    if (selectMapel) rekapState.selectedMapel = selectMapel.value;
    rekapState.tanggalMulai = dateMulai.value;
    rekapState.tanggalSelesai = dateSelesai.value;
    renderRekap(container);
  };

  if (selectKelas) selectKelas.addEventListener("change", updateFilter);
  if (selectMapel) selectMapel.addEventListener("change", updateFilter);
  dateMulai.addEventListener("change", updateFilter);
  dateSelesai.addEventListener("change", updateFilter);

  btnTipeMapel.addEventListener("click", () => {
    rekapState.tipeRekap = "mapel";
    renderRekap(container);
  });

  btnTipeWali.addEventListener("click", () => {
    rekapState.tipeRekap = "wali";
    renderRekap(container);
  });

  // CSV EXPORT HANDLER
  btnExport.addEventListener("click", () => {
    if (rekapSiswa.length === 0 && sourceData.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const rows = [];

    // Helper untuk escape cell CSV
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val).trim();
      str = str.replace(/"/g, '""');
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str}"`;
      }
      return str;
    };

    // 1. Judul Laporan Kehadiran
    rows.push([isWali ? "LAPORAN ABSENSI HARIAN WALI KELAS (PERWALIAN)" : "LAPORAN REKAPITULASI KEHADIRAN SISWA"]);
    rows.push([`Kelas`, isWali ? "8A" : rekapState.selectedClass]);
    if (!isWali) {
      rows.push([`Mata Pelajaran`, rekapState.selectedMapel]);
    }
    rows.push([`Tahun Ajaran`, activeYear]);
    rows.push([`Rentang Tanggal`, `${rekapState.tanggalMulai} s.d. ${rekapState.tanggalSelesai}`]);
    rows.push([isWali ? `Total Hari Absensi` : `Total Pertemuan Sesi`, `${sourceData.length} ${isWali ? 'Hari' : 'Sesi'}`]);
    rows.push([]);

    // 2. Tabel Rekap Kehadiran
    rows.push([
      "No",
      "Nama Siswa",
      "Status Sekolah",
      "Tanggal Masuk",
      "Tanggal Keluar",
      "Hadir (H)",
      "Sakit (S)",
      "Izin (I)",
      "Alfa (A)",
      isWali ? "Total Hari Efektif" : "Total Sesi Efektif",
      "Persentase Kehadiran"
    ]);

    rekapSiswa.forEach((s, idx) => {
      rows.push([
        idx + 1,
        escapeCSV(s.nama),
        s.status_sekolah,
        s.tanggal_masuk,
        s.tanggal_keluar,
        s.hadir,
        s.sakit,
        s.izin,
        s.alfa,
        s.totalEligibleSesi,
        s.persentase !== null ? `${s.persentase}%` : "-"
      ]);
    });

    rows.push([]);
    rows.push([]);

    // 3. Judul Jurnal Mengajar / Log Absensi
    if (isWali) {
      rows.push(["RIWAYAT LOG ABSENSI HARIAN KELAS"]);
      rows.push([]);
      rows.push([
        "No",
        "Tanggal",
        "Daftar Siswa Tidak Hadir (Sakit/Izin/Alfa)"
      ]);

      filteredAbsensiWali.forEach((j, idx) => {
        const detailAbsen = j.ketidakhadiran && j.ketidakhadiran.length > 0
          ? j.ketidakhadiran.map(kh => {
              const student = siswa.find(s => s.id === kh.siswa_id);
              const name = student ? student.nama : kh.siswa_id;
              return `${name} (${kh.status})`;
            }).join("; ")
          : "Nihil (Hadir Semua)";

        rows.push([
          idx + 1,
          j.tanggal,
          escapeCSV(detailAbsen)
        ]);
      });
    } else {
      rows.push(["DAFTAR RIWAYAT JURNAL MENGAJAR GURU"]);
      rows.push([]);
      rows.push([
        "No",
        "Tanggal",
        "Jam Pelajaran",
        "Materi Pembelajaran",
        "Catatan Kejadian Kelas"
      ]);

      filteredJurnal.forEach((j, idx) => {
        rows.push([
          idx + 1,
          j.tanggal,
          `${j.jam_mulai} - ${j.jam_selesai}`,
          escapeCSV(j.materi),
          escapeCSV(j.catatan_kelas || "-")
        ]);
      });
    }

    // Generate CSV file client-side
    // Gunakan UTF-8 BOM agar terbaca dengan baik di Microsoft Excel
    const csvContent = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Format nama file agar rapi
    const filePrefix = isWali ? "Absensi_Wali_8A" : `Rekap_${rekapState.selectedClass}_${rekapState.selectedMapel.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const fileName = `${filePrefix}_${rekapState.tanggalMulai}_to_${rekapState.tanggalSelesai}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
