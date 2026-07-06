// =====================================================
// KALKULATOR SEKOLAH
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

const formatRibuan = (element) => {
    let value = element.value.replace(/\D/g, '');
    if (value === '') { element.value = ''; return; }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
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

const updateUIValue = (id, value, isRupiah = true) => {
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
// COPY VALUE (seperti PPOB)
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

const bukaTab = (tabId) => {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("aktif"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const content = document.getElementById(tabId);
    const btn = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (content) content.classList.add("aktif");
    if (btn) { btn.classList.add("active"); btn.setAttribute("aria-selected", "true"); }
    document.querySelectorAll(".tab").forEach(t => {
        if (t !== btn) t.setAttribute("aria-selected", "false");
    });
};

// =========================================
// TOGGLE JENIS SEKOLAH
// =========================================

function toggleJenisSekolah() {
    const jenis = document.querySelector('input[name="jenisSekolah"]:checked');
    if (!jenis) return;
    const isNegeri = jenis.value === 'negeri';

    const rowBelanja = document.getElementById('rowBelanjaPegawai');
    const rowSiswa = document.getElementById('rowPemasukanSiswa');
    const inputBelanja = document.getElementById('belanjaPegawai');
    const inputSiswa = document.getElementById('pemasukanSiswa');

    if (isNegeri) {
        // Negeri: Belanja Pegawai aktif, Siswa disabled (0)
        rowBelanja.classList.remove('input-disabled');
        inputBelanja.disabled = false;
        rowSiswa.classList.add('input-disabled');
        inputSiswa.disabled = true;
        inputSiswa.value = '0';
    } else {
        // Swasta: Belanja Pegawai disabled (0), Siswa aktif
        rowBelanja.classList.add('input-disabled');
        inputBelanja.disabled = true;
        inputBelanja.value = '0';
        rowSiswa.classList.remove('input-disabled');
        inputSiswa.disabled = false;
    }

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
    const jenis = document.querySelector('input[name="jenisSekolah"]:checked');
    const isNegeri = jenis ? jenis.value === 'negeri' : true;

    const bos = getVal('bosTahunan');
    const belanjaPegawai = getVal('belanjaPegawai');
    const pemasukanSiswa = getVal('pemasukanSiswa');
    const upahGaji = getVal('upahGaji');
    const biayaProduksi = getVal('biayaProduksi');
    const biayaOperasional = getVal('biayaOperasional');
    const pendapatanLain = getVal('pendapatanLain');

    const panjang = getNumberVal('panjangBangunan');
    const lebar = getNumberVal('lebarBangunan');
    const biayaBangunan = getVal('biayaBangunan') || 1500000;
    const asetLainnya = getVal('asetLainnya');

    // --- Hitung Pendapatan ---
    const nilaiPendapatan = bos + belanjaPegawai + pemasukanSiswa;
    const totalPendapatan = nilaiPendapatan + pendapatanLain;

    // --- Hitung Pengeluaran ---
    const pembelianBarang = 0;
    const totalPengeluaran = upahGaji + biayaProduksi + pembelianBarang + biayaOperasional;

    // --- Keuntungan ---
    const keuntungan = totalPendapatan - totalPengeluaran;

    // --- Aset ---
    const luas = panjang * lebar;
    const asetTanahBangunan = luas * biayaBangunan;
    const totalAset = asetTanahBangunan + asetLainnya;

    // --- Update Tab Pendapatan ---
    updateUI('tJenisSekolah', isNegeri ? 'Negeri' : 'Swasta', false);
    updateUI('tBos', bos);
    updateUI('tBelanjaPegawai', belanjaPegawai);
    updateUI('tPemasukanSiswa', pemasukanSiswa);
    updateUI('tNilaiPendapatan', nilaiPendapatan);
    updateUI('tPendapatanLain', pendapatanLain);
    updateUI('tTotalPendapatan', totalPendapatan);

    // --- Update Tab Pengeluaran ---
    updateUI('tUpahGaji', upahGaji);
    updateUI('tBiayaProduksi', biayaProduksi);
    updateUI('tPembelianBarang', pembelianBarang);
    updateUI('tBiayaOperasional', biayaOperasional);
    updateUI('tTotalPengeluaran', totalPengeluaran);

    // --- Validasi Keuntungan (Negeri harus 0) ---
    const warning = document.getElementById('warningKeuntungan');
    const warningText = document.getElementById('warningText');
    if (isNegeri && Math.abs(keuntungan) > 1000) {
        warning.classList.add('aktif');
        if (keuntungan > 0) {
            warningText.textContent = '⚠️ Sekolah Negeri: Keuntungan tidak boleh positif (' + formatRupiah(keuntungan) + '). Periksa kembali isian.';
        } else {
            warningText.textContent = '⚠️ Sekolah Negeri: Keuntungan tidak boleh negatif (' + formatRupiah(keuntungan) + '). Periksa kembali isian.';
        }
    } else {
        warning.classList.remove('aktif');
    }

    // --- Update Tab Aset ---
    updateUI('tAsetTanahBangunan', asetTanahBangunan);
    updateUI('tAsetLainnya', asetLainnya);
    updateUI('tTotalAset', totalAset);
    
    const luasEl = document.getElementById('tLuasTanah');
    if (luasEl) luasEl.textContent = formatAngkaM2(luas);
}

// =========================================
// RESET FORM
// =========================================

function resetForm() {
    // Reset jenis sekolah ke Negeri
    document.querySelector('input[name="jenisSekolah"][value="negeri"]').checked = true;
    toggleJenisSekolah();

    // Reset input
    document.getElementById('bosTahunan').value = '0';
    document.getElementById('belanjaPegawai').value = '0';
    document.getElementById('pemasukanSiswa').value = '0';
    document.getElementById('upahGaji').value = '0';
    document.getElementById('biayaProduksi').value = '0';
    document.getElementById('biayaOperasional').value = '0';
    document.getElementById('pendapatanLain').value = '0';
    document.getElementById('panjangBangunan').value = '10';
    document.getElementById('lebarBangunan').value = '8';
    document.getElementById('biayaBangunan').value = '1.500.000';
    document.getElementById('asetLainnya').value = '0';

    // Sembunyikan warning
    document.getElementById('warningKeuntungan').classList.remove('aktif');

    // Hitung ulang
    hitung();
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener('DOMContentLoaded', function() {

    // Input yang memicu hitung
    const inputs = [
        'bosTahunan', 'belanjaPegawai', 'pemasukanSiswa',
        'upahGaji', 'biayaProduksi', 'biayaOperasional',
        'pendapatanLain', 'panjangBangunan', 'lebarBangunan',
        'biayaBangunan', 'asetLainnya'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    // Format ribuan untuk input rupiah
    const rupiahInputs = [
        'bosTahunan', 'belanjaPegawai', 'pemasukanSiswa',
        'upahGaji', 'biayaProduksi', 'biayaOperasional',
        'pendapatanLain', 'biayaBangunan', 'asetLainnya'
    ];

    rupiahInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
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

    // Radio button jenis sekolah
    document.querySelectorAll('input[name="jenisSekolah"]').forEach(el => {
        el.addEventListener('change', toggleJenisSekolah);
    });

    // Inisialisasi
    toggleJenisSekolah();
    hitung();
});