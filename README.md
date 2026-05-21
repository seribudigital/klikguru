# KlikGuru - Jurnal & Absensi Mandiri Guru

KlikGuru adalah aplikasi web modern, ringan, dan responsif yang dirancang untuk membantu guru dalam mencatat jurnal harian sesi mengajar, absensi siswa, serta rekapitulasi kehadiran bulanan/semester secara cepat dan efisien.

## 🚀 Fitur Utama

1. **Dashboard Mengajar & Absensi Cepat**:
   - Pencatatan materi pembelajaran dan waktu mengajar secara langsung.
   - Antarmuka absensi "Default Hadir" (Tap-to-Rotate): Status kehadiran siswa dapat diubah secara berputar dengan satu ketukan (Hadir ➔ Sakit ➔ Izin ➔ Alfa).
   
2. **Absensi Wali Kelas (Kelas 8A)**:
   - Fitur khusus bagi wali kelas untuk mencatat kehadiran harian pagi hari tanpa terikat mata pelajaran tertentu.
   - Penyimpanan optimal di Firestore (hanya menyimpan daftar siswa yang tidak hadir untuk menghemat kuota).

3. **Manajemen Siklus Sekolah (Mutasi Siswa)**:
   - Manajemen status siswa (Aktif, Pindah Sekolah, Lulus).
   - Logika kalkulasi kehadiran adil: Menghitung persentase kehadiran berdasarkan tanggal siswa masuk dan tanggal efektif keluar.

4. **Rekapitulasi & Ekspor Laporan**:
   - Filter data kehadiran per kelas, mata pelajaran, dan rentang tanggal.
   - Indikator peringatan kehadiran rendah (< 75%).
   - Ekspor data lengkap ke CSV secara instan dengan dukungan UTF-8 BOM untuk kompatibilitas penuh dengan Microsoft Excel.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS (Tailwind CSS)
- **Build Tool**: Vite
- **Database & Auth**: Firebase / Firestore

---

## ⚡ Langkah Pemasangan Lokal

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/seribudigital/klikguru.git
   cd klikguru
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Salin berkas `.env.example` menjadi `.env` dan lengkapi dengan konfigurasi Firebase milik Anda:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

5. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deploy ke Vercel (Rekomendasi)

Untuk meng-hosting KlikGuru di Vercel dengan integrasi otomatis (CI/CD) dari GitHub, ikuti langkah berikut:

1. Buka dan masuk ke akun Anda di [Vercel Dashboard](https://vercel.com).
2. Klik tombol **Add New...** ➔ **Project**.
3. Pilih dan **Import** repositori `seribudigital/klikguru` dari akun GitHub Anda.
4. Pada bagian **Configure Project**:
   - Vercel akan otomatis mendeteksi proyek sebagai **Vite**.
   - Biarkan pengaturan Build & Output default (`npm run build` & `dist`).
   - Masukkan seluruh isi kunci/nilai konfigurasi Firebase dari berkas `.env` Anda ke kolom **Environment Variables**.
5. Klik **Deploy**. 

Setiap kali Anda melakukan `git push` ke repositori GitHub pada branch `main`, Vercel akan otomatis melakukan *build* dan pembaruan pada website KlikGuru secara langsung!
