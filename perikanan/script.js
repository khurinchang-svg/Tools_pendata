// =====================================================
// KALKULATOR USAHA PERIKANAN – REALISTIS DESA
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
    const benih = getIntVal("benih");
    const kematian = 22.5;
    const hb = getVal("hb");
    const hg = getVal("hg");
    const hp = getVal("hp");

    const luasM2 = bata * 14;

    // Padat tebar = benih / luas
    const padatTebar = luasM2 > 0 ? (benih / luasM2) : 0;

    // Ikan hidup = benih - (benih × kematian%)
    const ikanHidup = Math.round(benih * (1 - kematian / 100));

    // Berat panen: rata-rata 0.25 kg/ekor untuk ikan konsumsi desa (nila/lele/mas)
    const beratRata = 0.25;
    const panenKg = ikanHidup * beratRata;

    // --- PENGELUARAN ---
    const upah = 480 * luasM2;
    const biayaBenih = benih * hp;

    // Pakan: FCR 1.5 (1.5 kg pakan untuk 1 kg daging)
    const pakanKg = panenKg * 1.5;
    const biayaPakan = pakanKg * 8000; // Rp 8.000/kg pakan (harga desa)

    // Obat & vitamin: Rp 30 per m²
    const obat = 30 * luasM2;

    // Kapur & pupuk kolam: Rp 20 per m²
    const kapur = 20 * luasM2;

    // Pengolahan kolam: Rp 250 per m²
    const olah = 250 * luasM2;

    const totalProduksi = biayaBenih + biayaPakan + obat + kapur + olah;

    // Listrik/pompa: Rp 50 per m² per siklus
    const listrik = 50 * luasM2;

    // Angkut: Rp 300 per kg hasil panen
    const angkut = panenKg * 300;

    const totalOperasional = listrik + angkut;
    const totalPengeluaran = upah + totalProduksi + totalOperasional;

    // --- PENDAPATAN ---
    const pendapatanKotor = panenKg * hg;
    const laba1x = (pendapatanKotor - totalPengeluaran) / 12;
    const laba2x = laba1x * 2;

    // --- ASET ---
    const nilaiTanah = bata * hb;

    // Update Pengeluaran
    updateUI("rUpah", upah);
    updateUI("rBiayaBenih", biayaBenih);
    updateUI("rPakan", pakanKg, false);
    updateUI("rBiayaPakan", biayaPakan);
    updateUI("rObat", obat);
    updateUI("rKapur", kapur);
    updateUI("rOlah", olah);
    updateUI("rTotalProduksi", totalProduksi);
    updateUI("rListrik", listrik);
    updateUI("rAngkut", angkut);
    updateUI("rTotalOperasional", totalOperasional);
    updateUI("rTotalPengeluaran", totalPengeluaran);

    // Update Pendapatan
    updateUI("rIkanHidup", ikanHidup, false);
    updateUI("rPanen", panenKg, false);
    updateUI("rPendapatanKotor", pendapatanKotor);
    updateUI("rTotalPendapatan", pendapatanKotor);
    updateUI("rLaba1x", laba1x);
    updateUI("rLaba2x", laba2x);

    // Update Aset
    updateUI("rNilaiTanah", nilaiTanah);
    updateUI("rPadatTebar", padatTebar.toFixed(1) + " ekor/m²", false);
    updateUI("rLuas", luasM2, false);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    ['bata', 'benih', 'kematian', 'hb', 'hg', 'hp'].forEach(id => {
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