// =====================================================
// KALKULATOR HASIL HUTAN KAYU
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
    const jumlah = getIntVal("jumlah");
    const hidup = getIntVal("hidup");
    const usia = getIntVal("usia");
    const hb = getVal("hb");
    const hg = getVal("hg");

    const luasM2 = bata * 14;

    // --- PENGELUARAN ---

    // Upah tanam: Rp 5.000/pohon
    const upahTanam = jumlah * 5000;

    // Upah perawatan: Rp 2.000/pohon/tahun × usia
    const upahRawat = jumlah * 2000 * usia;

    const upah = upahTanam + upahRawat;

    // Bibit: Rp 3.000/pohon
    const bibit = jumlah * 3000;

    // Pupuk: Rp 1.500/pohon/tahun × usia
    const pupuk = jumlah * 1500 * usia;

    // Pestisida/obat: Rp 500/pohon/tahun × usia
    const obat = jumlah * 500 * usia;

    // Tebang: Rp 15.000 per pohon hidup
    const tebang = hidup * 15000;

    const totalProduksi = bibit + pupuk + obat + tebang;

    // Angkut: Rp 10.000 per pohon hidup
    const angkut = hidup * 10000;

    // Pungutan/retribusi: Rp 5.000 per pohon hidup
    const pungutan = hidup * 5000;

    const totalOperasional = angkut + pungutan;
    const totalPengeluaran = upah + totalProduksi + totalOperasional;

    // --- PENDAPATAN ---
    const pendapatanKotor = hidup * hg;
    const labaBulan = (pendapatanKotor - totalPengeluaran) / (usia * 12);

    // --- ASET ---
    const nilaiTanah = bata * hb;
    const nilaiPohon = hidup * hg; // estimasi nilai pohon berdiri

    // Update Pengeluaran
    updateUI("rUpah", upah);
    updateUI("rBibit", bibit);
    updateUI("rPupuk", pupuk);
    updateUI("rObat", obat);
    updateUI("rTebang", tebang);
    updateUI("rTotalProduksi", totalProduksi);
    updateUI("rAngkut", angkut);
    updateUI("rPungutan", pungutan);
    updateUI("rTotalOperasional", totalOperasional);
    updateUI("rTotalPengeluaran", totalPengeluaran);

    // Update Pendapatan
    updateUI("rPohonHidup", hidup, false);
    updateUI("rPendapatanKotor", pendapatanKotor);
    updateUI("rTotalPendapatan", pendapatanKotor);
    updateUI("rLabaBulan", labaBulan);

    // Update Aset
    updateUI("rNilaiTanah", nilaiTanah);
    updateUI("rNilaiPohon", nilaiPohon);
    updateUI("rLuas", luasM2, false);
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    ['bata', 'jumlah', 'hidup', 'usia', 'hb', 'hg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    ['hb', 'hg'].forEach(id => {
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