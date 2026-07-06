// =====================================================
// KALKULATOR TERNAK KAKI 4 – OPTIMIZED
// =====================================================

// --- UTILITIES ---
const formatRupiah = (angka) => `Rp ${Number(angka).toLocaleString("id-ID")}`;
const formatAngka = (angka) => Number(angka).toLocaleString("id-ID");

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

const roundUp = (x, multiple = 1000) => Math.ceil(x / multiple) * multiple;

const copyToClipboard = (id) => {
    const el = document.getElementById(id);
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

// --- FORMAT RIBUAN OTOMATIS ---
const formatRibuan = (element) => {
    let value = element.value.replace(/\D/g, '');
    if (value === '') {
        element.value = '';
        return;
    }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
};

// --- BATAS MAKSIMAL INPUT ---
const batasMaks = (id, maks) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
        if (Number(input.value) > maks) input.value = maks;
    });
};

// --- UI UPDATE ---
const updateUI = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = isRupiah ? formatRupiah(value) : formatAngka(value);
    }
};
// --- COPY ROW ---

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

// --- TAB NAVIGATION ---
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
    // set aria-selected false untuk yang lain
    document.querySelectorAll(".tab").forEach(t => {
        if (t !== btn) t.setAttribute("aria-selected", "false");
    });
};

// --- PERHITUNGAN UTAMA ---
function hitung() {
    const jenis = document.getElementById("jenis")?.value || "Kambing";
    const jumlah = getIntVal("jumlah");
    const lama = getIntVal("lama");
    const panjang = getIntVal("panjang");
    const lebar = getIntVal("lebar");
    const hargaTanah = getVal("hargaTanah");

    // Kebutuhan pakan per hari
    const D7 = jenis === "Sapi" ? 1 : 0.3;
    const pakanField = document.getElementById("pakan");
    if (pakanField) pakanField.value = D7;

    // Biaya pakan
    const I5 = roundUp((jumlah * (lama * 30) * D7) * 25000, 1000);
    // Operasional (40% dari pakan)
    const I8 = roundUp(I5 * 0.4, 1000);
    // Total pengeluaran
    const I10 = roundUp(I5 + I8, 1000);

    // Pendapatan kotoran (dummy)
    const M8 = ((jumlah * (lama * 30) * D7) * 0.5) * 1000;
    // Nilai disamakan dengan pengeluaran (M5)
    const M5 = I10;
    // Total pendapatan (penjualan + kotoran)
    const M10 = roundUp(M8 + M5, 1000);

    // Aset
    const M14 = (panjang * lebar) * 200000;
    const M15 = roundUp(((panjang * lebar) / 14) * hargaTanah, 1000);
    const M16 = roundUp(M14 + M15, 10000);
    const M23 = panjang * lebar;

    // Pendapatan bersih bulanan
    const I15 = roundUp((M10 - I10) / 12, 100);

    // Update UI
    updateUI("rPakan", I5);
    updateUI("rOpen", I8);
    updateUI("rOperasional", I10);
    updateUI("rTotalPengeluaran", I10);
    updateUI("rLain", M5);
    updateUI("rPendapatan", M8);
    updateUI("rTotalPendapatan", M10);
    updateUI("rBersih", M10 - I10);
    updateUI("rBulanan", I15);
    updateUI("rKandang", M14);
    updateUI("rTanah", M15);
    updateUI("rAset", M16);
    updateUI("rLuasHa", M23, false);
}

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Event listener untuk input perhitungan
    const inputIds = ['jenis', 'jumlah', 'lama', 'panjang', 'lebar'];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', hitung);
            el.addEventListener('change', hitung);
        }
    });

    // 2. Format ribuan untuk harga tanah
    const hargaTanahInput = document.getElementById('hargaTanah');
    if (hargaTanahInput) {
        formatRibuan(hargaTanahInput);
        hargaTanahInput.addEventListener('input', function(e) {
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

    // 3. Batas maksimal
    batasMaks("panjang", 10);
    batasMaks("lebar", 15);
    batasMaks("jumlah", 15);
    batasMaks("lama", 12);

    // 4. Tab navigation
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            bukaTab(tabId);
        });
    });

    // 5. Copy buttons
    document.querySelectorAll('.btn-copy-row').forEach(row => {
    row.addEventListener('click', () => {
        const targetId = row.getAttribute('data-target');
        copyFromRow(targetId);
    });
});

    // 6. Hitung pertama kali
    hitung();
});