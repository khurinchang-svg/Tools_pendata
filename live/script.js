// ============================================
// KONFIGURASI
// ============================================
const API = {
    RAJADESA: "https://simpul-jabar.32net.id/api/um-rekap?kdkab=3207%20-%20KAB.%20CIAMIS&kdkec=190%20-%20RAJADESA&kdkel=004%20-%20RAJADESA&level_view=PETUGAS",
    PURWARAJA: "https://simpul-jabar.32net.id/api/um-rekap?kdkab=3207%20-%20KAB.%20CIAMIS&kdkec=190%20-%20RAJADESA&kdkel=007%20-%20PURWARAJA&level_view=PETUGAS"
};

const PETUGAS_PURWARAJA = ["Ehat Hayati", "UHER HERNAWAN"];
const TANGGAL_MULAI = new Date(2026, 5, 15); // 1 Juli 2026 (bulan 6 = Juli)
const KENAIKAN_HARIAN = 1.7;

// ============================================
// DOM ELEMENTS
// ============================================
const els = {
    nasional: document.getElementById("nasional"),
    percent: document.getElementById("percent"),
    bar: document.getElementById("bar"),
    target: document.getElementById("target"),
    done: document.getElementById("done"),
    remain: document.getElementById("remain"),
    officer: document.getElementById("officer"),
    update: document.getElementById("update"),
    petugasList: document.getElementById("petugasList"),
    status: document.getElementById("status"),
    refreshBtn: document.getElementById("refresh"),
    progressBar: document.querySelector(".progress")
};

// ============================================
// HITUNG PERSENTASE NASIONAL
// ============================================
function hitungNasional() {
    const hariIni = new Date();
    const mulai = new Date(TANGGAL_MULAI);
    mulai.setHours(0, 0, 0, 0);
    hariIni.setHours(0, 0, 0, 0);
    
    const selisihHari = Math.max(0, Math.floor((hariIni - mulai) / 86400000));
    const persen = Math.min(100, 1.7 + (selisihHari * KENAIKAN_HARIAN));
    return persen;
}

// ============================================
// WARNA BERDASARKAN PROGRESS
// ============================================
function getColor(progress) {
    const nasional = hitungNasional();
    if (progress >= nasional + 1.7) return "#00E676";
    if (progress >= nasional) return "#43A047";
    if (progress >= nasional - 1.7) return "#FBC02D";
    return "#E53935";
}

// ============================================
// FORMAT ANGKA
// ============================================
function formatNumber(num) {
    return Number(num || 0).toLocaleString("id-ID");
}

// ============================================
// FETCH DATA
// ============================================
async function fetchData() {
    const [resRajadesa, resPurwaraja] = await Promise.all([
        fetch(API.RAJADESA),
        fetch(API.PURWARAJA)
    ]);
    
    if (!resRajadesa.ok || !resPurwaraja.ok) {
        throw new Error("Gagal mengambil data dari server");
    }
    
    const [jsonRajadesa, jsonPurwaraja] = await Promise.all([
        resRajadesa.json(),
        resPurwaraja.json()
    ]);
    
    const petugasPurwaraja = (jsonPurwaraja.data || []).filter(item =>
        PETUGAS_PURWARAJA.includes(item.nama_petugas)
    );
    
    return [...(jsonRajadesa.data || []), ...petugasPurwaraja];
}

// ============================================
// RENDER DATA
// ============================================
function render(petugas) {
    let totalTarget = 0;
    let totalPendataan = 0;
    
    petugas.forEach(item => {
        totalTarget += Number(item.target || 0);
        totalPendataan += Number(item.pendataan || 0);
    });
    
    const persen = totalTarget > 0 ? (totalPendataan / totalTarget * 100) : 0;
    const nasional = hitungNasional();
    const warna = getColor(persen);
    
    els.target.textContent = formatNumber(totalTarget);
    els.done.textContent = formatNumber(totalPendataan);
    els.remain.textContent = formatNumber(totalTarget - totalPendataan);
    els.officer.textContent = petugas.length;
    els.percent.textContent = persen.toFixed(2) + "%";
    els.percent.style.color = warna;
    els.nasional.textContent = nasional.toFixed(1) + "%";
    els.bar.style.width = persen + "%";
    els.bar.style.background = warna;
    els.update.textContent = "Update: " + new Date().toLocaleString("id-ID");
    
    els.progressBar.setAttribute("aria-valuenow", Math.round(persen));
    
    // Render daftar petugas dengan DocumentFragment
    const fragment = document.createDocumentFragment();
    
    petugas
        .sort((a, b) => (b.percentage_pendataan || 0) - (a.percentage_pendataan || 0))
        .forEach(item => {
            const persenPetugas = item.percentage_pendataan || 0;
            const warnaPetugas = getColor(persenPetugas);
            
            const card = document.createElement("div");
            card.className = "petugas-card";
            card.innerHTML = `
                <div class="nama">${item.nama_petugas || "Tanpa Nama"}</div>
                <div class="petugas-progress">
                    <div class="petugas-bar"
                         style="width:${persenPetugas}%;background:${warnaPetugas}">
                    </div>
                </div>
                <div class="angka">
                    <span><b>${persenPetugas.toFixed(2)}%</b></span>
                    <span>${item.pendataan || 0} / ${item.target || 0}</span>
                </div>
            `;
            fragment.appendChild(card);
        });
    
    els.petugasList.innerHTML = "";
    els.petugasList.appendChild(fragment);
}

// ============================================
// LOAD & RENDER (tampilkan status)
// ============================================
async function loadData() {
    els.status.textContent = "⏳ Mengambil data...";
    els.status.style.color = "#1565c0";
    
    try {
        const data = await fetchData();
        render(data);
        els.status.textContent = "";
    } catch (err) {
        els.status.textContent = "❌ Gagal mengambil data. Periksa koneksi.";
        els.status.style.color = "#e53935";
    }
}

// ============================================
// EVENT LISTENER
// ============================================
els.refreshBtn.addEventListener("click", loadData);

// ============================================
// INIT
// ============================================
loadData();