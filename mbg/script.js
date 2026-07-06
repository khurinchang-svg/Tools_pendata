// =====================================================
// KALKULATOR MBG
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
    if (el) el.innerHTML = isRupiah ? formatRupiah(value) : formatAngka(value);
};

const updateUIValue = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isRupiah ? formatRupiah(value) : formatAngka(value);
};

// =========================================
// COPY TO CLIPBOARD (sama dengan PPOB)
// =========================================

const copyFromRow = (targetId) => {
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
// TOGGLE TAHUN BARU (simpel)
// =========================================

function toggleTahunBaru() {
    const tahun = document.querySelector('input[name="tahun"]:checked');
    if (!tahun) return;
    const is2025 = tahun.value === '2025';
    
    // Reset semua checkbox
    document.querySelectorAll('.month-cb').forEach(cb => cb.checked = false);
    
    // Update info
    const info = document.getElementById('infoBulan');
    if (is2025) {
        info.textContent = '* 2025: centang satu bulan → otomatis sampai Desember';
    } else {
        info.textContent = '* 2026: hanya bisa pilih satu bulan';
    }
    
    hitung();
}

// =========================================
// HANDLE BULAN BARU
// =========================================

function handleBulanBaru() {
    const tahun = document.querySelector('input[name="tahun"]:checked');
    if (!tahun) return;
    const is2025 = tahun.value === '2025';
    
    const allCheckboxes = document.querySelectorAll('.month-cb');
    const checked = document.querySelector('.month-cb:checked');
    
    if (is2025) {
        // 2025: jika ada yang dicentang, centang sampai Desember
        if (checked) {
            const bulanValue = parseInt(checked.value, 10);
            allCheckboxes.forEach(cb => {
                const val = parseInt(cb.value, 10);
                cb.checked = val >= bulanValue;
            });
        }
    } else {
        // 2026: hanya boleh satu yang dicentang
        if (checked) {
            allCheckboxes.forEach(cb => {
                if (cb !== checked) cb.checked = false;
            });
        }
    }
    
    hitung();
}

// =========================================
// HANDLE BULAN 2026 (single select)
// =========================================

function handleBulan2026(selected) {
    if (selected.checked) {
        document.querySelectorAll('input[name="month2026"]').forEach(r => {
            if (r !== selected) r.checked = false;
        });
        hitung();
    }
}

// =========================================
// TOGGLE PORSI
// =========================================

function togglePorsi() {
    const besar = document.getElementById('togglePorsiBesar').checked;
    const kecil = document.getElementById('togglePorsiKecil').checked;

    const wrapperBesar = document.getElementById('porsiBesarWrapper');
    const wrapperKecil = document.getElementById('porsiKecilWrapper');

    if (besar) {
        wrapperBesar.classList.remove('porsi-disabled');
        document.getElementById('jumlahBesar').disabled = false;
        document.getElementById('tarifBesar').disabled = false;
    } else {
        wrapperBesar.classList.add('porsi-disabled');
        document.getElementById('jumlahBesar').disabled = true;
        document.getElementById('jumlahBesar').value = '0';
        document.getElementById('tarifBesar').disabled = true;
    }

    if (kecil) {
        wrapperKecil.classList.remove('porsi-disabled');
        document.getElementById('jumlahKecil').disabled = false;
        document.getElementById('tarifKecil').disabled = false;
    } else {
        wrapperKecil.classList.add('porsi-disabled');
        document.getElementById('jumlahKecil').disabled = true;
        document.getElementById('jumlahKecil').value = '0';
        document.getElementById('tarifKecil').disabled = true;
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

    // Tutup semua tooltip lain
    document.querySelectorAll('.tooltip-popover').forEach(t => {
        if (t.id !== id) t.classList.remove('aktif');
    });

    popover.classList.toggle('aktif');
}

// Tutup tooltip saat klik di luar
document.addEventListener('click', function(e) {
    if (!e.target.closest('.tooltip-container')) {
        document.querySelectorAll('.tooltip-popover').forEach(t => {
            t.classList.remove('aktif');
        });
    }
});

// =========================================
// EDIT VALUE INLINE (Tab Pengeluaran)
// =========================================

function editValue(el) {
    const currentText = el.textContent.replace(/[^\d]/g, '');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText ? parseInt(currentText, 10).toLocaleString('id-ID') : '';
    input.style.width = '140px';
    input.style.padding = '4px 8px';
    input.style.border = '2px solid var(--primary)';
    input.style.borderRadius = '8px';
    input.style.fontSize = '14px';
    input.style.fontWeight = '700';
    input.style.textAlign = 'right';
    input.style.background = '#fff';
    input.autofocus = true;

    const parent = el.parentElement;
    const originalText = el.textContent;

    // Ganti value dengan input
    el.innerHTML = '';
    el.appendChild(input);

    input.focus();
    input.select();

    // Format ribuan saat input
    input.addEventListener('input', function() {
        formatRibuan(this);
    });

    // Simpan saat blur atau enter
    const saveValue = () => {
        const val = getValFromInput(input);
        el.innerHTML = formatRupiah(val);
        // Trigger hitung ulang
        hitung();
    };

    input.addEventListener('blur', saveValue);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
        if (e.key === 'Escape') {
            el.innerHTML = originalText;
            hitung();
        }
    });

    // Fokus otomatis
    setTimeout(() => input.focus(), 50);
}

function getValFromInput(input) {
    const val = input.value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(val) || 0;
}

// =========================================
// HITUNG SEMUA
// =========================================

function hitung() {
    // --- Ambil semua input ---
    const tahun = document.querySelector('input[name="tahun"]:checked');
    const is2025 = tahun ? tahun.value === '2025' : true;

    // Bulan yang dipilih
    let bulanTerpilih = [];
    if (is2025) {
        document.querySelectorAll('.month-cb-2025:checked').forEach(cb => {
            bulanTerpilih.push(parseInt(cb.value, 10));
        });
    } else {
        const selected = document.querySelector('input[name="month2026"]:checked');
        if (selected) bulanTerpilih.push(parseInt(selected.value, 10));
    }

    // Porsi
    const toggleBesar = document.getElementById('togglePorsiBesar').checked;
    const toggleKecil = document.getElementById('togglePorsiKecil').checked;
    const jumlahBesar = toggleBesar ? getIntVal('jumlahBesar') : 0;
    const jumlahKecil = toggleKecil ? getIntVal('jumlahKecil') : 0;
    const tarifBesar = toggleBesar ? getVal('tarifBesar') : 0;
    const tarifKecil = toggleKecil ? getVal('tarifKecil') : 0;

    const hariOperasional = getIntVal('hariOperasional') || 22;
    const biayaOperasional = getVal('biayaOperasional');
    const pendapatanLain = getVal('pendapatanLain');

    const panjang = getNumberVal('panjangDapur');
    const lebar = getNumberVal('lebarDapur');
    const biayaBangunan = getVal('biayaBangunan') || 1500000;
    const peralatan = getVal('nilaiPeralatan');
    const kendaraan = getVal('nilaiKendaraan');
    const inventaris = getVal('nilaiInventaris');

    const toggleEstimasi = document.getElementById('toggleEstimasi').checked;

    // --- Hitung Pendapatan ---
    const pendapatanBesar = jumlahBesar * tarifBesar * hariOperasional;
    const pendapatanKecil = jumlahKecil * tarifKecil * hariOperasional;
    const totalPendapatan = pendapatanBesar + pendapatanKecil + pendapatanLain;

    // --- Hitung Pengeluaran ---
    let upah = 0;
    let produksi = 0;

    if (toggleEstimasi) {
        produksi = totalPendapatan * 0.6;  // 60%
        upah = totalPendapatan * 0.1;      // 10%
    }

    // Baca nilai yang sudah diedit (jika ada)
    const upahEl = document.getElementById('bUpah');
    const produksiEl = document.getElementById('bProduksi');
    const operasionalEl = document.getElementById('bOperasional');
    const nonopsEl = document.getElementById('bNonops');

    // Jika user sudah mengedit, ambil dari elemen (tapi tetap pakai estimasi jika toggle aktif)
    // Kita simpan nilai di data attribute atau kita baca dari text
    // Cara: baca dari elemen jika ada angka
    const getEditedValue = (el, defaultValue) => {
        if (!el) return defaultValue;
        const text = el.textContent.replace(/[^\d]/g, '');
        if (text === '') return defaultValue;
        return parseInt(text, 10) || defaultValue;
    };

    // Untuk komponen yang bisa diedit, kita baca nilainya dari elemen
    // Tapi jika toggle estimasi aktif, kita override
    let upahFinal = upah;
    let produksiFinal = produksi;

    // Jika toggle estimasi tidak aktif, ambil dari input user
    if (!toggleEstimasi) {
        // Baca dari elemen yang sudah diedit
        const upahText = upahEl ? upahEl.textContent.replace(/[^\d]/g, '') : '';
        const produksiText = produksiEl ? produksiEl.textContent.replace(/[^\d]/g, '') : '';
        upahFinal = upahText ? parseInt(upahText, 10) : 0;
        produksiFinal = produksiText ? parseInt(produksiText, 10) : 0;
    } else {
        // Toggle aktif: update elemen dengan nilai estimasi
        if (upahEl) upahEl.textContent = formatRupiah(upah);
        if (produksiEl) produksiEl.textContent = formatRupiah(produksi);
    }

    // Operasional dan Nonoperasional selalu dari input user (bisa diedit)
    const operasionalFinal = biayaOperasional || 0;
    const nonopsFinal = getEditedValue(nonopsEl, 0);

    // Pembelian barang = 0 (tetap)
    const pembelian = 0;

    const totalPengeluaran = upahFinal + produksiFinal + pembelian + operasionalFinal + nonopsFinal;

    // --- Keuntungan ---
    const keuntungan = totalPendapatan - totalPengeluaran;

    // --- Aset ---
    const luas = panjang * lebar;
    const tanahBangunan = luas * biayaBangunan;
    const selainTanah = peralatan + kendaraan + inventaris;
    const totalAset = tanahBangunan + selainTanah;

    // --- Update UI Tab Pendapatan ---
    updateUIValue('aJumlahBesar', jumlahBesar, false);
    updateUIValue('aTarifBesar', tarifBesar);
    updateUIValue('aJumlahKecil', jumlahKecil, false);
    updateUIValue('aTarifKecil', tarifKecil);
    updateUIValue('aHari', hariOperasional, false);
    updateUIValue('aPendapatanLain', pendapatanLain);
    updateUIValue('aTotalPendapatan', totalPendapatan);
    
    // Keuntungan dengan warna
    const keuntunganEl = document.getElementById('aKeuntungan');
    if (keuntungan < 0) {
        keuntunganEl.style.color = '#f44336';
        keuntunganEl.textContent = formatRupiah(keuntungan) + ' ⚠️ Rugi';
    } else {
        keuntunganEl.style.color = 'var(--primary)';
        keuntunganEl.textContent = formatRupiah(keuntungan);
    }
    updateUIValue('aTotalPendapatanCopy', totalPendapatan);
    updateUIValue('aKeuntunganCopy', keuntungan);

    // --- Update UI Tab Pengeluaran ---
    // Update elemen yang bisa diedit (jika toggle aktif sudah diupdate di atas)
    if (!toggleEstimasi) {
        // Jika toggle tidak aktif, kita update elemen dengan nilai dari user
        // Tapi user sudah mengedit langsung, jadi kita biarkan
        // Kita hanya update jika elemen masih kosong
        if (upahEl && upahEl.textContent === 'Rp 0') {
            upahEl.textContent = formatRupiah(upahFinal);
        }
        if (produksiEl && produksiEl.textContent === 'Rp 0') {
            produksiEl.textContent = formatRupiah(produksiFinal);
        }
    }

    // Update operasional dan nonops
    if (operasionalEl) operasionalEl.textContent = formatRupiah(operasionalFinal);
    if (nonopsEl) nonopsEl.textContent = formatRupiah(nonopsFinal);
    
    // Pembelian tetap 0
    updateUIValue('bPembelian', 0);
    updateUIValue('bTotalPengeluaran', totalPengeluaran);
    updateUIValue('bTotalPengeluaranCopy', totalPengeluaran);

    // Validasi
    const warning = document.getElementById('warningPengeluaran');
    if (totalPengeluaran > totalPendapatan * 2 && totalPendapatan > 0) {
        warning.classList.add('aktif');
    } else {
        warning.classList.remove('aktif');
    }

    // --- Update UI Tab Aset ---
    updateUIValue('cTanahBangunan', tanahBangunan);
    updateUIValue('cPeralatan', peralatan);
    updateUIValue('cKendaraan', kendaraan);
    updateUIValue('cInventaris', inventaris);
    updateUIValue('cSelainTanah', selainTanah);
    updateUIValue('cTotalAset', totalAset);
    updateUIValue('cTotalAsetCopy', totalAset);
    updateUIValue('cLuas', luas + ' m²', false);
    updateUIValue('cLuasCopy', luas + ' m²', false);
}

// =========================================
// RESET FORM
// =========================================

function resetForm() {
    // Reset tahun ke 2025
    document.querySelector('input[name="tahun"][value="2025"]').checked = true;
    toggleTahunBaru();

    // Reset bulan
    document.querySelectorAll('.month-cb').forEach(cb => cb.checked = false);

    // Reset porsi
    document.getElementById('togglePorsiBesar').checked = true;
    document.getElementById('togglePorsiKecil').checked = true;
    document.getElementById('jumlahBesar').value = '0';
    document.getElementById('jumlahKecil').value = '0';
    document.getElementById('tarifBesar').value = '15.000';
    document.getElementById('tarifKecil').value = '8.000';
    togglePorsi();

    // Reset input lainnya
    document.getElementById('hariOperasional').value = '22';
    document.getElementById('biayaOperasional').value = '';
    document.getElementById('pendapatanLain').value = '';
    document.getElementById('panjangDapur').value = '5';
    document.getElementById('lebarDapur').value = '4';
    document.getElementById('biayaBangunan').value = '1.500.000';
    document.getElementById('nilaiPeralatan').value = '';
    document.getElementById('nilaiKendaraan').value = '';
    document.getElementById('nilaiInventaris').value = '';

    // Reset toggle estimasi
    document.getElementById('toggleEstimasi').checked = true;

    // Reset nilai editable di tab pengeluaran
    document.getElementById('bUpah').textContent = 'Rp 0';
    document.getElementById('bProduksi').textContent = 'Rp 0';
    document.getElementById('bOperasional').textContent = 'Rp 0';
    document.getElementById('bNonops').textContent = 'Rp 0';

    // Sembunyikan warning
    document.getElementById('warningPengeluaran').classList.remove('aktif');

    // Hitung ulang
    hitung();
}

// =========================================
// EVENT LISTENERS
// =========================================

document.addEventListener('DOMContentLoaded', function() {

    // Input yang memicu hitung
    const inputs = [
        'jumlahBesar', 'jumlahKecil', 'tarifBesar', 'tarifKecil',
        'hariOperasional', 'biayaOperasional', 'pendapatanLain',
        'panjangDapur', 'lebarDapur', 'biayaBangunan',
        'nilaiPeralatan', 'nilaiKendaraan', 'nilaiInventaris'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    // Format ribuan untuk input text
    const rupiahInputs = [
        'tarifBesar', 'tarifKecil', 'biayaOperasional',
        'pendapatanLain', 'biayaBangunan',
        'nilaiPeralatan', 'nilaiKendaraan', 'nilaiInventaris'
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

    // Radio dan checkbox yang memicu hitung
    document.querySelectorAll('input[name="tahun"]').forEach(el => {
    el.addEventListener('change', toggleTahunBaru);
});

document.querySelectorAll('.month-cb').forEach(el => {
    el.addEventListener('change', handleBulanBaru);
});

    document.getElementById('toggleEstimasi').addEventListener('change', hitung);

    // Inisialisasi
    toggleTahunBaru();
    togglePorsi();
    hitung();
});