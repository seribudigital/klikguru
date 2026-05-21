import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="flex-1 flex flex-col justify-center px-2 animate-fade-in">
      <div class="glass rounded-3xl p-8 shadow-xl border border-slate-800/80">
        
        <!-- Logo / Title -->
        <div class="text-center mb-8">
          <!-- Logo KlikGuru SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-16 h-16 mx-auto drop-shadow-[0_4px_12px_rgba(16,185,129,0.25)] mb-4" fill="none">
            <defs>
              <linearGradient id="logo-grad-login" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#34d399" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
            </defs>
            <path d="M 72 28 C 64 18, 36 18, 26 28 C 12 42, 12 68, 26 82 C 36 92, 64 92, 72 82" stroke="url(#logo-grad-login)" stroke-width="8" stroke-linecap="round" />
            <path d="M 34 40 H 52" stroke="#64748b" stroke-width="4" stroke-linecap="round" opacity="0.8" />
            <path d="M 34 52 H 45" stroke="#64748b" stroke-width="4" stroke-linecap="round" opacity="0.8" />
            <path d="M 34 64 H 52" stroke="#64748b" stroke-width="4" stroke-linecap="round" opacity="0.8" />
            <path d="M 48 55 L 56 63 L 74 45" stroke="#34d399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 74 45 L 89 58 L 81 59 L 85 69 L 80 71 L 76 61 L 71 64 Z" fill="#059669" stroke="#34d399" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <h1 class="text-2xl font-bold tracking-tight text-white font-sans">KlikGuru</h1>
          <p class="text-slate-400 text-xs mt-2">Aplikasi Jurnal & Absensi Mandiri</p>
        </div>

        <!-- Form -->
        <form id="login-form" class="space-y-5">
          <div>
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2" for="email">Email Guru</label>
            <input type="email" id="email" required 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              placeholder="nama@guru.sch.id">
          </div>
          
          <div>
            <label class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2" for="password">Password</label>
            <input type="password" id="password" required 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              placeholder="••••••••">
          </div>

          <div id="login-error" class="hidden text-rose-400 text-xs bg-rose-950/30 border border-rose-900/50 rounded-xl p-3.5"></div>

          <button type="submit" id="btn-login-submit"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all text-sm mt-2 flex justify-center items-center gap-2 cursor-pointer">
            <span>Masuk</span>
          </button>
        </form>

      </div>
    </div>
  `;

  const form = document.getElementById("login-form");
  const elError = document.getElementById("login-error");
  const btnSubmit = document.getElementById("btn-login-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    elError.classList.add("hidden");
    
    // Loading State
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <div class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
      <span>Memproses...</span>
    `;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Listener Auth di main.js akan otomatis merespon dan me-redirect ke halaman utama
    } catch (error) {
      console.error("Gagal melakukan login Firebase:", error);
      elError.classList.remove("hidden");
      
      switch (error.code) {
        case "auth/invalid-email":
          elError.textContent = "Format email salah atau tidak valid.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          elError.textContent = "Kombinasi Email atau Password salah.";
          break;
        case "auth/network-request-failed":
          elError.textContent = "Koneksi internet bermasalah. Periksa jaringan Anda.";
          break;
        default:
          elError.textContent = `Kesalahan: ${error.message}`;
      }
      
      // Reset State Button
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Masuk</span>`;
    }
  });
}
