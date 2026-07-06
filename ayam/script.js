// =====================================================
// KALKULATOR TERNAK AYAM – OPTIMIZED
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

// -- copy row ---

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
    document.querySelectorAll(".tab").forEach(t => {
        if (t !== btn) t.setAttribute("aria-selected", "false");
    });
};

// --- PERHITUNGAN UTAMA ---
function hitung() {
    const jenis = document.getElementById("jenis")?.value || "Kampung";
    const jumlah = getIntVal("jumlah");
    const lama = getIntVal("lama");
    const panjang = getIntVal("panjang");
    const lebar = getIntVal("lebar");
    const hargaTanah = getVal("hargaTanah");

    // Kebutuhan pakan per hari (berbeda per jenis)
    let D7 = 0.05; // Kampung
    if (jenis === "BR") D7 = 0.1;
    else if (jenis === "Petelur") D7 = 0.12;

    const pakanField = document.getElementById("pakan");
    if (pakanField) pakanField.value = D7;

    // Biaya pakan (harga per kg = Rp 7.500 untuk ayam)
    const I5 = roundUp((jumlah * (lama * 30) * D7) * 7500, 1000);
    // Operasional (40% dari pakan)
    const I8 = roundUp(I5 * 0.4, 1000);
    // Total pengeluaran
    const I10 = roundUp(I5 + I8, 1000);

    // Pendapatan kotoran (dummy)
    const M8 = ((jumlah * (lama * 30) * D7) * 0.5) * 1000;
    // Disamakan dengan pengeluaran (M5)
    const M5 = I10;
    // Total pendapatan
    const M10 = roundUp(M8 + M5, 1000);

    // Aset (dalam cm, jadi perlu dikonversi)
    const luasM2 = (panjang * lebar) / 10000; // cm² ke m²
    const M14 = luasM2 * 200000;
    const M15 = roundUp((luasM2 / 14) * hargaTanah, 1000);
    const M16 = roundUp(M14 + M15, 10000);
    const M23 = luasM2;

    // Pendapatan bersih bulanan
    const I15 = roundUp((M10 - I10) / 12, 100);

    // Update UI
    updateUI("rPakan", I5);
    updateUI("rOpen", I8);
    updateUI("rVaksin", 0); // Tidak dihitung, placeholder
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
    batasMaks("panjang", 2000);
    batasMaks("lebar", 2000);
    batasMaks("jumlah", 500);
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