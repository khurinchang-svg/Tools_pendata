// =====================================================
// KALKULATOR INDUSTRI MAKANAN
// =====================================================

// =========================================
// UTILITY FUNCTIONS
// =========================================

const formatRupiah = (angka) => {
    if (angka === undefined || angka === null || isNaN(angka)) return 'Rp 0';
    return `Rp ${Math.round(angka).toLocaleString("id-ID")}`;
};

const formatAngka = (angka) => {
    if (angka === undefined || angka === null || isNaN(angka)) return '0';
    return Math.round(angka).toLocaleString("id-ID");
};

const formatAngkaM2 = (angka) => {
    if (angka === undefined || angka === null || isNaN(angka)) return '0 m²';
    return Math.round(angka).toLocaleString("id-ID") + ' m²';
};

const formatRibuan = (element) => {
    let value = element.value.replace(/\D/g, '');
    if (value === '') { element.value = ''; return; }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
};

const getVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = el.value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(val) || 0;
};

const getNumberVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseFloat(el.value) || 0;
};

const getIntVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseInt(el.value.replace(/\D/g, ''), 10) || 0;
};

const updateUI = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) {
        if (typeof value === 'string' && value.includes('m²')) {
            el.textContent = value;
        } else {
            el.textContent = isRupiah ? formatRupiah(value) : formatAngka(value);
        }
    }
};

// =========================================
// COPY VALUE
// =========================================

const copyValue = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let text = el.textContent.replace(/[^\d]/g, '');
    if (text === '') text = '0';
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

// =========================================
// TAB
// =========================================

function bukaTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("aktif"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const content = document.getElementById(tabId);
    const btn = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (content) content.classList.add("aktif");
    if (btn) { btn.classList.add("active"); btn.setAttribute("aria-selected", "true"); }
    document.querySelectorAll(".tab").forEach(t => {
        if (t !== btn) t.setAttribute("aria-selected", "false");
    });
}

// =========================================
// TOGGLE PENYUSUTAN
// =========================================

function togglePenyusutan() {
    const checked = document.getElementById('togglePenyusutan').checked;
    const wrapper = document.getElementById('penyusutanWrapper');
    const input = document.getElementById('biayaPenyusutan');
    
    if (checked) {
        wrapper.classList.remove('hidden');
        input.disabled = false;
    } else {
        wrapper.classList.add('hidden');
        input.disabled = true;
        input.value = '0';
    }
    hitung();
}

// =========================================
// TOGGLE STATUS BANGUNAN
// =========================================

function toggleStatusBangunan() {
    hitung();
}

// =========================================
// TOOLTIP
// =========================================

function toggleTooltip(event, id) {
    event.stopPropagation();
    const popover = document.getElementById(id);
    if (!popover) return;

    document.querySelectorAll('.tooltip-popover').forEach(t => {
        if (t.id !== id) t.classList.remove('aktif');
    });

    popover.classList.toggle('aktif');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.tooltip-container')) {
        document.querySelectorAll('.tooltip-popover').forEach(t => {
            t.classList.remove('aktif');
        });
    }
});

// =========================================
// HITUNG SEMUA
// =========================================

function hitung() {
    // --- Ambil semua input ---
    const nilaiPenjualan = getVal('nilaiPenjualan');
    const pendapatanLain = getVal('pendapatanLain');
    
    const upahTenaga = getVal('upahTenaga');
    const biayaBahan = getVal('biayaBahan');
    const biayaKemasan = getVal('biayaKemasan');
    const biayaOperasional = getVal('biayaOperasional');
    const biayaNonops = getVal('biayaNonops');
    
    const togglePenyusutan = document.getElementById('togglePenyusutan').checked;
    const biayaPenyusutan = togglePenyusutan ? getVal('biayaPenyusutan') : 0;
    
    const frekuensi = getIntVal('frekuensiProduksi') || 0;
    
    const statusBangunan = document.querySelector('input[name="statusBangunan"]:checked');
    const isMilik = statusBangunan ? statusBangunan.value === 'milik' : true;
    
    const panjang = getNumberVal('panjangBangunan');
    const lebar = getNumberVal('lebarBangunan');
    const biayaBangunan = getVal('biayaBangunan') || 1500000;
    const peralatan = getVal('nilaiPeralatan');
    const kendaraan = getVal('nilaiKendaraan');
    const inventaris = getVal('nilaiInventaris');

    // --- Hitung Pendapatan ---
    const totalPendapatan = nilaiPenjualan + pendapatanLain;

    // --- Hitung Pengeluaran ---
    const totalPengeluaran = upahTenaga + biayaBahan + biayaKemasan + biayaOperasional + biayaNonops + biayaPenyusutan;

    // --- Hitung Konversi Bulanan ---
    const pendapatanBulanan = totalPendapatan * frekuensi;
    const pengeluaranBulanan = totalPengeluaran * frekuensi;
    const keuntunganBulanan = pendapatanBulanan - pengeluaranBulanan;

    // --- Hitung Aset ---
    const luas = panjang * lebar;
    const asetTanahBangunan = isMilik ? (luas * biayaBangunan) : 0;
    const asetLainnya = peralatan + kendaraan + inventaris;
    const totalAset = asetTanahBangunan + asetLainnya;

    // --- Update Tab Pendapatan ---
    updateUI('tNilaiPenjualan', nilaiPenjualan);
    updateUI('tPendapatanLain', pendapatanLain);
    updateUI('tTotalPendapatan', totalPendapatan);
    updateUI('tTotalPendapatanCopy', totalPendapatan);

    // --- Update Tab Pengeluaran ---
    updateUI('tUpahTenaga', upahTenaga);
    updateUI('tBiayaBahan', biayaBahan);
    updateUI('tBiayaKemasan', biayaKemasan);
    updateUI('tBiayaOperasional', biayaOperasional);
    updateUI('tBiayaNonops', biayaNonops);
    updateUI('tPenyusutan', biayaPenyusutan);
    updateUI('tTotalPengeluaran', totalPengeluaran);
    updateUI('tTotalPengeluaranCopy', totalPengeluaran);

    // --- Validasi ---
    const warning = document.getElementById('warningPengeluaran');
    if (totalPengeluaran > totalPendapatan && totalPendapatan > 0) {
        warning.classList.add('aktif');
    } else {
        warning.classList.remove('aktif');
    }

    // --- Update Tab Konversi Bulanan ---
    const frekuensiEl = document.getElementById('tFrekuensi');
    if (frekuensiEl) frekuensiEl.textContent = formatAngka(frekuensi) + ' kali';
    updateUI('tPendapatanBulanan', pendapatanBulanan);
    updateUI('tPengeluaranBulanan', pengeluaranBulanan);
    updateUI('tKeuntunganBulanan', keuntunganBulanan);
    updateUI('tKeuntunganBulananCopy', keuntunganBulanan);

    // --- Update Tab Aset ---
    const statusText = isMilik ? 'Milik sendiri' : (statusBangunan ? statusBangunan.value === 'sewa' ? 'Sewa' : 'Menumpang' : 'Milik sendiri');
    updateUI('tStatusBangunan', statusText, false);
    updateUI('tAsetTanahBangunan', asetTanahBangunan);
    updateUI('tPeralatan', peralatan);
    updateUI('tKendaraan', kendaraan);
    updateUI('tInventaris', inventaris);
    updateUI('tAsetLainnya', asetLainnya);
    updateUI('tTotalAset', totalAset);
    updateUI('tTotalAsetCopy', totalAset);
    
    const luasEl = document.getElementById('tLuasTanah');
    if (luasEl) luasEl.textContent = formatAngkaM2(luas);
}

// =========================================
// RESET FORM
// =========================================

function resetForm() {
    // Reset Pendapatan
    document.getElementById('nilaiPenjualan').value = '1500000';
    document.getElementById('pendapatanLain').value = '0';
    
    // Reset Pengeluaran
    document.getElementById('upahTenaga').value = '200000';
    document.getElementById('biayaBahan').value = '1000000';
    document.getElementById('biayaKemasan').value = '100000';
    document.getElementById('biayaOperasional').value = '150000';
    document.getElementById('biayaNonops').value = '0';
    
    // Reset Penyusutan
    document.getElementById('togglePenyusutan').checked = false;
    document.getElementById('penyusutanWrapper').classList.add('hidden');
    document.getElementById('biayaPenyusutan').disabled = true;
    document.getElementById('biayaPenyusutan').value = '0';
    
    // Reset Konversi
    document.getElementById('frekuensiProduksi').value = '20';
    
    // Reset Aset
    document.querySelector('input[name="statusBangunan"][value="milik"]').checked = true;
    document.getElementById('panjangBangunan').value = '8';
    document.getElementById('lebarBangunan').value = '6';
    document.getElementById('biayaBangunan').value = '1.500.000';
    document.getElementById('nilaiPeralatan').value = '0';
    document.getElementById('nilaiKendaraan').value = '0';
    document.getElementById('nilaiInventaris').value = '0';
    
    // Sembunyikan warning
    document.getElementById('warningPengeluaran').classList.remove('aktif');
    
    // Hitung ulang
    hitung();
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener('DOMContentLoaded', function() {

    // === FUNGSI FORMAT RIBAUAN + HITUNG ===
    function handleInputWithFormat(id) {
        const el = document.getElementById(id);
        if (!el) return;
        
        el.addEventListener('input', function(e) {
            // Simpan posisi kursor
            let cursor = this.selectionStart;
            let oldLen = this.value.length;
            
            // Format ribuan
            let value = this.value.replace(/\D/g, '');
            if (value !== '') {
                this.value = parseInt(value, 10).toLocaleString('id-ID');
            } else {
                this.value = '';
            }
            
            // Kembalikan posisi kursor
            let diff = this.value.length - oldLen;
            if (diff > 0) cursor += diff;
            this.setSelectionRange(cursor, cursor);
            
            // Hitung ulang
            hitung();
        });
        
        el.addEventListener('change', hitung);
    }

    // === DAFTAR INPUT RUPIAH ===
    const rupiahInputs = [
        'nilaiPenjualan', 'pendapatanLain',
        'upahTenaga', 'biayaBahan', 'biayaKemasan',
        'biayaOperasional', 'biayaNonops', 'biayaPenyusutan',
        'biayaBangunan', 'nilaiPeralatan', 'nilaiKendaraan', 'nilaiInventaris'
    ];

    // Terapkan format ribuan untuk input rupiah
    rupiahInputs.forEach(id => handleInputWithFormat(id));

    // === INPUT NON-RUPIAH (hanya hitung, tanpa format) ===
    const nonRupiahInputs = [
        'frekuensiProduksi',
        'panjangBangunan', 'lebarBangunan'
    ];

    nonRupiahInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    // === RADIO BUTTON STATUS BANGUNAN ===
    document.querySelectorAll('input[name="statusBangunan"]').forEach(el => {
        el.addEventListener('change', toggleStatusBangunan);
    });

    // === INISIALISASI ===
    togglePenyusutan();
    hitung();
});