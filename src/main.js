import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { appState, loadMetadataSekolah, loadKelas, loadSiswa, loadJurnalDanAbsen, loadAbsensiWaliKelas, subscribeState } from "./state";
import { renderLogin } from "./pages/login";
import { renderSettings } from "./pages/settings";
import { renderJurnal } from "./pages/jurnal";
import { renderRekap } from "./pages/rekap";

const elContent = document.getElementById("app-content");
const elHeader = document.getElementById("app-header");
const elNav = document.getElementById("app-nav");
const elLoading = document.getElementById("app-loading");
const btnLogout = document.getElementById("btn-logout");

// Routing Client-Side Sederhana (Hash-based)
let currentRoute = window.location.hash || "#jurnal"; // default ke jurnal sekarang di Phase 2

function navigateTo(hash) {
  window.location.hash = hash;
}

window.addEventListener("hashchange", () => {
  currentRoute = window.location.hash;
  renderApp();
});

// Log out handler
btnLogout.addEventListener("click", async () => {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    try {
      await auth.signOut();
      appState.user = null;
      navigateTo("#login");
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  }
});

// Update status visual link navigasi bawah
function updateActiveNavLink() {
  const navIds = {
    "#jurnal": "nav-jurnal",
    "#rekap": "nav-rekap",
    "#settings": "nav-settings"
  };

  // Reset kelas aktif pada semua navigasi
  Object.entries(navIds).forEach(([route, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (currentRoute === route) {
      el.classList.remove("text-slate-400");
      el.classList.add("text-emerald-400", "font-semibold");
    } else {
      el.classList.remove("text-emerald-400", "font-semibold");
      el.classList.add("text-slate-400");
    }
  });
}

// Fungsi Rendering Utama
async function renderApp() {
  // Sembunyikan loading screen
  if (!elLoading.classList.contains("hidden")) {
    elLoading.classList.add("opacity-0");
    setTimeout(() => elLoading.classList.add("hidden"), 300);
  }

  // Cek Proteksi Halaman (Guard)
  if (!appState.user) {
    // Sembunyikan Header dan Nav jika tidak login
    elHeader.classList.replace("flex", "hidden");
    elNav.classList.replace("flex", "hidden");
    
    // Paksa ke halaman login
    if (currentRoute !== "#login") {
      navigateTo("#login");
      return;
    }
    renderLogin(elContent);
    return;
  }

  // Jika sudah login tapi berada di #login, alihkan ke default page (#jurnal)
  if (currentRoute === "#login") {
    navigateTo("#jurnal");
    return;
  }

  // Tampilkan Header dan Nav untuk user terautentikasi
  elHeader.classList.remove("hidden");
  elHeader.classList.add("flex");
  elNav.classList.remove("hidden");
  elNav.classList.add("flex");

  // Perbarui style link navigasi bawah
  updateActiveNavLink();

  // Render konten berdasarkan route aktif
  switch (currentRoute) {
    case "#jurnal":
      renderJurnal(elContent);
      break;
    case "#settings":
      renderSettings(elContent);
      break;
    case "#rekap":
      renderRekap(elContent);
      break;
    default:
      navigateTo("#jurnal");
  }
}

// Registrasi Event Listener Navigasi Bottom Bar
document.getElementById("nav-jurnal").addEventListener("click", () => navigateTo("#jurnal"));
document.getElementById("nav-rekap").addEventListener("click", () => navigateTo("#rekap"));
document.getElementById("nav-settings").addEventListener("click", () => navigateTo("#settings"));

// Pantau Status Autentikasi Firebase di awal
onAuthStateChanged(auth, async (user) => {
  appState.user = user;
  appState.loading = false;
  
  if (user) {
    // Ambil data master saat login berhasil
    await loadMetadataSekolah();
    await loadKelas();
    await loadSiswa();
    await loadJurnalDanAbsen();
    await loadAbsensiWaliKelas();
  }
  
  renderApp();
});

// Subscribe ke perubahan state untuk re-render UI dinamis saat state diperbarui
subscribeState(() => {
  if (appState.user && !appState.loading) {
    renderApp();
  }
});
