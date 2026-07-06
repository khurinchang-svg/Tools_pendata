// 1. UTILITIES (paling atas)
const formatRupiah = (angka) => `Rp ${Math.round(angka).toLocaleString("id-ID")}`;
const formatAngka = (angka) => Math.round(angka).toLocaleString("id-ID");

const getVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = el.value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(val) || 0;
};

const getIntVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseInt(el.value.replace(/\D/g, ''), 10) || 0;
};

const formatRibuan = (element) => {
    let value = element.value.replace(/\D/g, '');
    if (value === '') { element.value = ''; return; }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
};

const updateUI = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = isRupiah ? formatRupiah(value) : formatAngka(value);
};

// 2. FUNGSI LAIN (togglePegawai, getPeriode, getJenisBangunan)
function togglePegawai() {
    const cb = document.getElementById('cbPegawai');
    const row = document.getElementById('rowPegawai');
    const jml = document.getElementById('jumlahPegawai');
    const gaji = document.getElementById('gajiPegawai');

    if (cb.checked) {
        row.classList.remove('input-disabled');
        jml.disabled = false;
        gaji.disabled = false;
    } else {
        row.classList.add('input-disabled');
        jml.disabled = true;
        gaji.disabled = true;
        jml.value = '0';
        gaji.value = '0';
    }
    hitung();
}
function getPeriodePendapatan() {
    const radio = document.querySelector('input[name="periodePendapatan"]:checked');
    return radio ? radio.value : 'harian';
}

function getPeriode() {
    const radio = document.querySelector('input[name="periode"]:checked');
    return radio ? radio.value : 'harian';
}

function getJenisBangunan() {
    const radio = document.querySelector('input[name="jenisBangunan"]:checked');
    return radio ? radio.value : 'permanen';
}
// fungsi buka tab//

const bukaTab = (tabId) => {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("aktif"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const content = document.getElementById(tabId);
    const btn = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (content) content.classList.add("aktif");
    if (btn) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
    }
    document.querySelectorAll(".tab").forEach(t => {
        if (t !== btn) t.setAttribute("aria-selected", "false");
    });
};

// fungsi copy from row//

const copyFromRow = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const text = el.innerText.replace(/[^\d]/g, '');
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {});
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(textArea);
    }
};

function hitung() {
    const panjang = getIntVal("panjang");
    const lebar = getIntVal("lebar");
    const hargaTanah = getVal("hargaTanah");
    const cbPegawai = document.getElementById('cbPegawai').checked;
    const jumlahPegawai = getIntVal("jumlahPegawai");
    const gajiPegawai = getVal("gajiPegawai");
    const belanja = getVal("belanja");
    const periode = getPeriode();
    const pengeluaranBulanan = getVal("pengeluaranBulanan");
    const pendapatan = getVal("pendapatan");
const periodePendapatan = getPeriodePendapatan();
    const nilaiPeralatan = getVal("nilaiPeralatan");
    const jenisBangunan = getJenisBangunan();

    const luasM2 = panjang * lebar;

    // === BELANJA TAHUNAN ===
    let belanjaTahunan = 0;
    if (periode === 'harian') {
        belanjaTahunan = (belanja * 20 * 11) + (belanja * 14 * 0.7);
    } else if (periode === 'mingguan') {
        const bulanan = belanja * 4;
        belanjaTahunan = (bulanan * 11) + (bulanan * 0.7);
    } else {
        belanjaTahunan = (belanja * 11) + (belanja * 0.7);
    }

    // === PENDAPATAN TAHUNAN ===
let pendapatanTahunan = 0;
if (periodePendapatan === 'harian') {
    pendapatanTahunan = (pendapatan * 20 * 11) + (pendapatan * 14 * 0.7);
} else if (periodePendapatan === 'mingguan') {
    const bulanan = pendapatan * 4;
    pendapatanTahunan = (bulanan * 11) + (bulanan * 0.7);
} else {
    pendapatanTahunan = (pendapatan * 11) + (pendapatan * 0.7);
}

    // === a. UPAH ===
    const totalUpah = cbPegawai ? jumlahPegawai * gajiPegawai * 12 : 0;

    // === b. PRODUKSI ===
    const produksi = 0;
    const totalProduksi = produksi;

    // === c. PEMBELIAN ===
    const totalPembelian = belanjaTahunan;

    // === d. OPERASIONAL ===
    const totalOperasional = pengeluaranBulanan * 12;

    // === e. NONOPS ===
    const nonOps = belanjaTahunan * 0.01;

    // === f. TOTAL ===
    const totalPengeluaran = totalUpah + totalProduksi + totalPembelian + totalOperasional + nonOps;

    // === PENDAPATAN ===
    const pendapatanKotor = pendapatanTahunan;
    const totalPendapatan = pendapatanKotor;
    const labaBersih = (totalPendapatan - totalPengeluaran) / 12;

    // === ASET ===
    const asetTanah = luasM2 * (hargaTanah / 14);

    const pengaliBangunan = {
        modern: 2200000,
        permanen: 1500000,
        semi: 800000,
        kayu: 500000
    };
    const asetBangunan = luasM2 * (pengaliBangunan[jenisBangunan] || 1500000);
    const totalAsetTanah = asetTanah + asetBangunan;
// === PERINGATAN JIKA MINUS ===
const elLaba = document.getElementById('rLabaBersih');
if (labaBersih < 0) {
    elLaba.style.color = '#f44336';
    elLaba.innerHTML = formatRupiah(labaBersih) + ' ⚠️ Rugi, Periksa isian';
} else {
    elLaba.style.color = '';
    elLaba.innerHTML = formatRupiah(labaBersih);
}
    // Update
    updateUI("rTotalUpah", totalUpah);
    updateUI("rProduksi", produksi);
    updateUI("rTotalProduksi", totalProduksi);
    updateUI("rTotalPembelian", totalPembelian);
    updateUI("rTotalOperasional", totalOperasional);
    updateUI("rNonOps", nonOps);
    updateUI("rTotalPengeluaran", totalPengeluaran);
    updateUI("rPendapatanKotor", pendapatanKotor);
    updateUI("rTotalPendapatan", totalPendapatan);
    
    updateUI("rAsetTanah", totalAsetTanah);
    updateUI("rAsetPeralatan", nilaiPeralatan);
    updateUI("rTotalAset", nilaiPeralatan);
    updateUI("rLuas", luasM2, false);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    ['panjang', 'lebar', 'hargaTanah', 'jumlahPegawai', 'gajiPegawai', 'belanja', 'pengeluaranBulanan', 'pendapatan', 'nilaiPeralatan'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.addEventListener('input', hitung); el.addEventListener('change', hitung); }
    });

    ['hargaTanah', 'gajiPegawai', 'belanja', 'pengeluaranBulanan', 'pendapatan', 'nilaiPeralatan'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            formatRibuan(el);
            el.addEventListener('input', function(e) {
                let cursor = this.selectionStart;
                let oldLen = this.value.length;
                formatRibuan(this);
                let diff = this.value.length - oldLen;
                if (diff > 0) cursor += diff;
                this.setSelectionRange(cursor, cursor);
                hitung();
            });
        }
    });

    document.querySelectorAll('input[name="periode"]').forEach(radio => {
        radio.addEventListener('change', hitung);
    });

    document.querySelectorAll('input[name="jenisBangunan"]').forEach(radio => {
        radio.addEventListener('change', hitung);
    });

    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', (e) => bukaTab(e.currentTarget.getAttribute('data-tab')));
    });

    document.querySelectorAll('.btn-copy-row').forEach(row => {
        row.addEventListener('click', () => copyFromRow(row.getAttribute('data-target')));
    });

    hitung();
});