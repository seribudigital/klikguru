import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, writeBatch, updateDoc } from "firebase/firestore";

// Local State
export const appState = {
  user: null,
  sekolah: {
    tahun_ajaran_aktif: "",
    daftar_mapel: [],
    daftar_tahun_ajaran: []
  },
  kelas: [], // array ID kelas, contoh: ["7A", "8A"]
  siswa: [], // array objek siswa lengkap
  jurnal: [], // array riwayat sesi mengajar (jurnal & absen)
  absensiWali: [], // array riwayat absensi harian kelas perwalian (Wali Kelas)
  loading: true
};

// Listener callbacks untuk sinkronisasi UI
const listeners = [];

export function subscribeState(callback) {
  listeners.push(callback);
  // Return unsubscribe function
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function notifyStateChange() {
  listeners.forEach(cb => {
    try {
      cb(appState);
    } catch (e) {
      console.error("Error in state subscriber callback:", e);
    }
  });
}

// Fetch Metadata Sekolah (Initial Load)
export async function loadMetadataSekolah() {
  try {
    const docRef = doc(db, "metadata", "sekolah");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      appState.sekolah = docSnap.data();
      if (!appState.sekolah.daftar_tahun_ajaran) {
        appState.sekolah.daftar_tahun_ajaran = [appState.sekolah.tahun_ajaran_aktif || "2026_2027"];
      }
    } else {
      const defaultData = {
        tahun_ajaran_aktif: "2026_2027",
        daftar_mapel: ["Informatika", "Matematika", "IPA", "Seni Budaya"],
        daftar_tahun_ajaran: ["2026_2027"]
      };
      await setDoc(docRef, defaultData);
      appState.sekolah = defaultData;
    }
    notifyStateChange();
  } catch (error) {
    console.error("Gagal memuat metadata sekolah:", error);
  }
}

// Update Metadata Sekolah
export async function updateMetadataSekolah(newData) {
  try {
    const docRef = doc(db, "metadata", "sekolah");
    appState.sekolah = { ...appState.sekolah, ...newData };
    notifyStateChange();
    await setDoc(docRef, appState.sekolah);
  } catch (error) {
    console.error("Gagal memperbarui metadata sekolah:", error);
    throw error;
  }
}

// Fetch semua kelas
export async function loadKelas() {
  try {
    const querySnapshot = await getDocs(collection(db, "kelas"));
    appState.kelas = querySnapshot.docs.map(doc => doc.id).sort();
    notifyStateChange();
  } catch (error) {
    console.error("Gagal memuat daftar kelas:", error);
  }
}

// Fetch semua siswa
export async function loadSiswa() {
  try {
    const querySnapshot = await getDocs(collection(db, "siswa"));
    appState.siswa = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    notifyStateChange();
  } catch (error) {
    console.error("Gagal memuat daftar siswa:", error);
  }
}

// Tambah Kelas baru
export async function addKelas(kelasId) {
  try {
    const docRef = doc(db, "kelas", kelasId);
    await setDoc(docRef, { created_at: new Date().toISOString() });
    
    if (!appState.kelas.includes(kelasId)) {
      appState.kelas.push(kelasId);
      appState.kelas.sort();
      notifyStateChange();
    }
  } catch (error) {
    console.error("Gagal menambahkan kelas baru:", error);
    throw error;
  }
}

// Tambah Siswa baru
export async function addSiswa(siswaData) {
  try {
    const docRef = await addDoc(collection(db, "siswa"), siswaData);
    const newSiswa = { id: docRef.id, ...siswaData };
    appState.siswa.push(newSiswa);
    notifyStateChange();
    return docRef.id;
  } catch (error) {
    console.error("Gagal menambahkan siswa baru:", error);
    throw error;
  }
}

// Tambah Siswa baru secara Massal (Bulk Import)
export async function addSiswaMassal(siswaList) {
  try {
    const batch = writeBatch(db);
    const savedSiswa = [];

    siswaList.forEach(siswaData => {
      // Buat DocRef baru dengan ID auto-generated di client
      const newDocRef = doc(collection(db, "siswa"));
      batch.set(newDocRef, siswaData);
      savedSiswa.push({ id: newDocRef.id, ...siswaData });
    });

    await batch.commit();

    // Perbarui local state
    appState.siswa.push(...savedSiswa);
    notifyStateChange();
    return savedSiswa.length;
  } catch (error) {
    console.error("Gagal mengimpor siswa massal:", error);
    throw error;
  }
}


// Fetch semua jurnal dan absen
export async function loadJurnalDanAbsen() {
  try {
    const querySnapshot = await getDocs(collection(db, "jurnal_dan_absen"));
    appState.jurnal = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    notifyStateChange();
  } catch (error) {
    console.error("Gagal memuat riwayat jurnal:", error);
  }
}

// Perbarui data siswa (Mutasi / Edit Status)
export async function updateSiswa(siswaId, updatedData) {
  try {
    const docRef = doc(db, "siswa", siswaId);
    await updateDoc(docRef, updatedData);
    
    // Perbarui local state
    const index = appState.siswa.findIndex(s => s.id === siswaId);
    if (index > -1) {
      appState.siswa[index] = { ...appState.siswa[index], ...updatedData };
      notifyStateChange();
    }
  } catch (error) {
    console.error("Gagal memperbarui data siswa:", error);
    throw error;
  }
}

// Simpan Sesi Mengajar & Absensi
export async function saveSesiMengajar(sesiData) {
  try {
    const docRef = await addDoc(collection(db, "jurnal_dan_absen"), sesiData);
    // Tambahkan juga ke local state agar rekap terupdate real-time
    appState.jurnal.push({ id: docRef.id, ...sesiData });
    notifyStateChange();
    return docRef.id;
  } catch (error) {
    console.error("Gagal menyimpan sesi mengajar:", error);
    throw error;
  }
}

// Fetch semua absensi wali kelas
export async function loadAbsensiWaliKelas() {
  try {
    const querySnapshot = await getDocs(collection(db, "absensi_wali_kelas"));
    appState.absensiWali = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    notifyStateChange();
  } catch (error) {
    console.error("Gagal memuat absensi wali kelas:", error);
  }
}

// Simpan/Timpa Absensi Wali Kelas
export async function saveAbsensiWaliKelas(docId, data) {
  try {
    const docRef = doc(db, "absensi_wali_kelas", docId);
    await setDoc(docRef, data);
    
    // Update local state
    const idx = appState.absensiWali.findIndex(a => a.id === docId);
    if (idx > -1) {
      appState.absensiWali[idx] = { id: docId, ...data };
    } else {
      appState.absensiWali.push({ id: docId, ...data });
    }
    notifyStateChange();
  } catch (error) {
    console.error("Gagal menyimpan absensi wali kelas:", error);
    throw error;
  }
}

// Eksekusi Kenaikan Kelas Massal (Batch Write)
export async function executeKenaikanKelasMassal(tahunAjaranBaru, mappings) {
  try {
    const batch = writeBatch(db);
    const todayStr = new Date().toISOString().split('T')[0];
    const tahunLama = appState.sekolah.tahun_ajaran_aktif;

    // Filter siswa yang aktif
    const siswaAktif = appState.siswa.filter(s => s.status_aktif === true);

    siswaAktif.forEach(siswaObj => {
      const kelasLama = siswaObj.riwayat_kelas ? siswaObj.riwayat_kelas[tahunLama] : null;
      if (!kelasLama) return;

      const mapping = mappings[kelasLama];
      if (!mapping) return;

      const docRef = doc(db, "siswa", siswaObj.id);

      if (mapping.lulus) {
        // Siswa Lulus: status_sekolah = "Lulus", status_aktif = false, tanggal_keluar = todayStr
        batch.update(docRef, {
          status_sekolah: "Lulus",
          status_aktif: false,
          tanggal_keluar: todayStr
        });
      } else if (mapping.kelasBaru) {
        // Siswa Naik Kelas: tambah di riwayat_kelas
        const updatedRiwayat = { ...(siswaObj.riwayat_kelas || {}) };
        updatedRiwayat[tahunAjaranBaru] = mapping.kelasBaru;
        
        batch.update(docRef, {
          riwayat_kelas: updatedRiwayat
        });
      }
    });

    // Update metadata sekolah
    const metadataDocRef = doc(db, "metadata", "sekolah");
    const daftarTahunBaru = [...(appState.sekolah.daftar_tahun_ajaran || [])];
    if (!daftarTahunBaru.includes(tahunAjaranBaru)) {
      daftarTahunBaru.push(tahunAjaranBaru);
      daftarTahunBaru.sort();
    }
    if (!daftarTahunBaru.includes(tahunLama)) {
      daftarTahunBaru.push(tahunLama);
      daftarTahunBaru.sort();
    }

    const updatedMetadata = {
      ...appState.sekolah,
      tahun_ajaran_aktif: tahunAjaranBaru,
      daftar_tahun_ajaran: daftarTahunBaru
    };

    batch.set(metadataDocRef, updatedMetadata);

    // Commit batch
    await batch.commit();

    // Reload data
    await loadMetadataSekolah();
    await loadSiswa();
  } catch (error) {
    console.error("Gagal mengeksekusi kenaikan kelas massal:", error);
    throw error;
  }
}
