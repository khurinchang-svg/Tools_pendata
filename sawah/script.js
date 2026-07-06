// =====================================================
// KALKULATOR USAHA PADI SAWAH – FINAL
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

// --- COPY (dari btn-copy-row) ---
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
    const hs = getVal("hs");
    const hb = getVal("hb");

    const luasM2 = bata * 14;
    const beras = luasM2 * 0.18;

    // Pengeluaran
    const upah = 480 * luasM2;
    const urea = (luasM2 / 10000) * 300;
    const biayaUrea = urea * 4500;
    const npk = (luasM2 / 10000) * 400;
    const biayaNpk = npk * 4600;
    const totalPupuk = biayaUrea + biayaNpk;
    const pestisida = 125 * luasM2;
    const olah = 250 * luasM2;
    const totalProduksi = totalPupuk + pestisida + olah;
    const angkut = ((beras * 2) / 40) * 8000;
    const giling = beras * 2 * 500;
    const totalOperasional = angkut + giling;
    const totalPengeluaran = upah + totalProduksi + totalOperasional;

    // Pendapatan
    const pendapatanKotor = beras * hb;
    const laba1x = (pendapatanKotor - totalPengeluaran) / 12;
    const laba2x = laba1x * 2;

    // Aset
    const nilaiSawah = bata * hs;

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
    updateUI("rBeras", beras, false);
    updateUI("rPendapatanKotor", pendapatanKotor);
    updateUI("rTotalPendapatan", pendapatanKotor);
    updateUI("rLaba1x", laba1x);
    updateUI("rLaba2x", laba2x);

    // Update Aset
    updateUI("rNilaiSawah", nilaiSawah);
    updateUI("rLuas", luasM2, false);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    ['bata', 'hs', 'hb'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    ['hs', 'hb'].forEach(id => {
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

    // Copy via btn-copy-row
    document.querySelectorAll('.btn-copy-row').forEach(row => {
        row.addEventListener('click', () => {
            const targetId = row.getAttribute('data-target');
            copyFromRow(targetId);
        });
    });

    hitung();
});