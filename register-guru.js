import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Membaca dan mem-parsing file .env secara manual
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('File .env tidak ditemukan! Silakan buat file .env terlebih dahulu.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
  return env;
}

// Main execution
async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('\n=== REGISTER GURU (AKUN PERTAMA) ===');
    console.log('Cara Penggunaan:');
    console.log('  node register-guru.js <email> <password>\n');
    console.log('Contoh:');
    console.log('  node register-guru.js guru@sekolah.sch.id Rahasia123!\n');
    process.exit(0);
  }

  const email = args[0];
  const password = args[1];

  console.log('Membaca kredensial Firebase dari .env...');
  const env = loadEnv();

  // Validasi kredensial dummy
  if (env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY_HERE' || !env.VITE_FIREBASE_API_KEY) {
    console.error('\nPERINGATAN: Kredensial Firebase di file .env Anda masih menggunakan nilai placeholder.');
    console.error('Silakan perbarui file .env dengan kredensial Firebase asli Anda terlebih dahulu.');
    process.exit(1);
  }

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };

  console.log(`Menginisialisasi Firebase untuk Project ID: ${firebaseConfig.projectId}...`);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  console.log(`Mencoba mendaftarkan email: ${email}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('\n✅ BERHASIL!');
    console.log(`Akun Guru berhasil dibuat dengan UID: ${userCredential.user.uid}`);
    console.log(`Anda sekarang dapat masuk ke aplikasi menggunakan email: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ GAGAL MENDAFTARKAN AKUN:');
    switch (error.code) {
      case 'auth/email-already-in-use':
        console.error('Email tersebut sudah terdaftar di Firebase Anda.');
        break;
      case 'auth/invalid-email':
        console.error('Format email tidak valid.');
        break;
      case 'auth/weak-password':
        console.error('Password terlalu lemah (minimal 6 karakter).');
        break;
      default:
        console.error(error.message);
    }
    process.exit(1);
  }
}

run();
