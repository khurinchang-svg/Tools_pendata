// =====================================================
// KALKULATOR USAHA KEBUN KOPI
// =====================================================

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
    if (value === '') {
        element.value = '';
        return;
    }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
};

const updateUI = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = isRupiah ? formatRupiah(value) : formatAngka(value);
    }
};

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

// --- PERHITUNGAN ---
function hitung() {
    const bata = getIntVal("bata");
    const hb = getVal("hb");    // harga lahan per bata
    const hg = getVal("hg");    // harga green bean per kg
    const hp = getVal("hp");    // harga 1 pohon

    const luasM2 = bata * 14;

    // Estimasi jumlah pohon: 1 pohon butuh 2.5m × 2.5m = 6.25 m²
    const jumlahPohon = Math.floor(luasM2 / 4);

    // Produksi green bean: 2.5 kg per pohon per tahun
    const hasilPanen = jumlahPohon * 0.375;

    // --- PENGELUARAN ---
    const upah = 200 * luasM2;
    const urea = ((luasM2 / 10000) * 400)*2;
    const biayaUrea = urea * 4500;
    const npk = ((luasM2 / 10000) * 600)*2;
    const biayaNpk = npk * 4600;
    const totalPupuk = biayaUrea + biayaNpk;
    const pestisida = 125 * luasM2;
    const olah = 250 * luasM2;
    const totalProduksi = totalPupuk;
    const angkut = (hasilPanen * 3) * 1000;
    const giling = hasilPanen * 2 * 500;
    const totalOperasional = angkut ;
    const totalPengeluaran = upah + totalProduksi + totalOperasional;

    // --- PENDAPATAN ---
    const pendapatanKotor = hasilPanen * hg;
    const laba1x = (pendapatanKotor - totalPengeluaran) / 12;
    const laba2x = laba1x * 2;

    // --- ASET ---
    const nilaiTanah = bata * hb;
    const nilaiPohon = jumlahPohon * hp;

    // Update Pengeluaran
    updateUI("rUpah", upah);
    updateUI("rUrea", urea, false);
    updateUI("rBiayaUrea", biayaUrea);
    updateUI("rNpk", npk, false);
    updateUI("rBiayaNpk", biayaNpk);
    updateUI("rTotalPupuk", totalPupuk);
    updateUI("rPestisida", pestisida);
    updateUI("rOlah", olah);
    updateUI("rTotalProduksi", totalProduksi);
    updateUI("rAngkut", angkut);
    updateUI("rGiling", giling);
    updateUI("rTotalOperasional", totalOperasional);
    updateUI("rTotalPengeluaran", totalPengeluaran);

    // Update Pendapatan
    updateUI("rBeras", hasilPanen, false);
    updateUI("rPendapatanKotor", pendapatanKotor);
    updateUI("rTotalPendapatan", pendapatanKotor);
    updateUI("rLaba1x", laba1x);
    updateUI("rLaba2x", laba2x);

    // Update Aset
    updateUI("rNilaiSawah", nilaiTanah);
    updateUI("rNilaiPohon", nilaiPohon);
    updateUI("rJumlahPohon", jumlahPohon, false);
    updateUI("rLuas", luasM2, false);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    ['bata', 'hb', 'hg', 'hp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    ['hb', 'hg', 'hp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            formatRibuan(el);
            el.addEventListener('input', function(e) {
                let cursor = this.selectionStart;
                let oldLen = this.value.length;
                formatRibuan(this);
                let newLen = this.value.length;
                let diff = newLen - oldLen;
                if (diff > 0) cursor += diff;
                this.setSelectionRange(cursor, cursor);
                hitung();
            });
        }
    });

    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            bukaTab(e.currentTarget.getAttribute('data-tab'));
        });
    });

    document.querySelectorAll('.btn-copy-row').forEach(row => {
        row.addEventListener('click', () => {
            const targetId = row.getAttribute('data-target');
            copyFromRow(targetId);
        });
    });

    hitung();
});