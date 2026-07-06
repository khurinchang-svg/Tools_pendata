// =====================================================
// KALKULATOR PPOB
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
    if (value === '') { element.value = ''; return; }
    element.value = parseInt(value, 10).toLocaleString('id-ID');
};

const updateUI = (id, value, isRupiah = true) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = isRupiah ? formatRupiah(value) : formatAngka(value);
};

const bukaTab = (tabId) => {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("aktif"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const content = document.getElementById(tabId);
    const btn = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (content) content.classList.add("aktif");
    if (btn) { btn.classList.add("active"); btn.setAttribute("aria-selected", "true"); }
    document.querySelectorAll(".tab").forEach(t => { if (t !== btn) t.setAttribute("aria-selected", "false"); });
};

const copyFromRow = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const text = el.innerText.replace(/[^\d]/g, '');
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => {});
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px";
        document.body.appendChild(textArea); textArea.focus(); textArea.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(textArea);
    }
};

function getJenisLayanan() {
    const radio = document.querySelector('input[name="jenisLayanan"]:checked');
    return radio ? radio.value : 'pulsa';
}

function toggleLayanan() {
    const jenis = getJenisLayanan();
    document.getElementById('rowKeuntungan').classList.toggle('disabled-row', jenis === 'transfer');
    document.getElementById('rowTransfer').classList.toggle('disabled-row', jenis === 'pulsa');
    hitung();
}

function togglePegawai() {
    const cb = document.getElementById('cbPegawai');
    const row = document.getElementById('rowPegawai');
    const jml = document.getElementById('jumlahPegawai');
    const gaji = document.getElementById('gajiPegawai');
    if (cb.checked) {
        row.classList.remove('input-disabled');
        jml.disabled = false; gaji.disabled = false;
    } else {
        row.classList.add('input-disabled');
        jml.disabled = true; gaji.disabled = true;
        jml.value = '0'; gaji.value = '0';
    }
    hitung();
}

function getPeriode() {
    const radio = document.querySelector('input[name="periode"]:checked');
    return radio ? radio.value : 'harian';
}

function getJenisBangunan() {
    const radio = document.querySelector('input[name="jenisBangunan"]:checked');
    return radio ? radio.value : 'permanen';
}

function hitungTahunan(nilai, periode) {
    if (periode === 'harian') return (nilai * 20 * 11) + (nilai * 14 * 0.7);
    if (periode === 'mingguan') return ((nilai * 4) * 11) + ((nilai * 4) * 0.7);
    return (nilai * 11) + (nilai * 0.7);
}

function hitung() {
    const jenis = getJenisLayanan();
    const keuntungan = parseFloat(document.getElementById('keuntungan').value) || 0;
    const biayaTransfer = getVal('biayaTransfer');
    const cbPegawai = document.getElementById('cbPegawai').checked;
    const jumlahPegawai = getIntVal('jumlahPegawai');
    const gajiPegawai = getVal('gajiPegawai');
    const modal = getVal('modal');
    const periode = getPeriode();
    const pengeluaranBulanan = getVal('pengeluaranBulanan');
    const panjang = getIntVal('panjang');
    const lebar = getIntVal('lebar');
    const hargaTanah = getVal('hargaTanah');
    const jenisBangunan = getJenisBangunan();
    const nilaiPeralatan = getVal('nilaiPeralatan');

    const luasM2 = panjang * lebar;
    const modalTahunan = hitungTahunan(modal, periode);

    // Pendapatan
    let pendapatanTahunan = 0;
    if (jenis === 'pulsa') {
        pendapatanTahunan = modalTahunan * (1 + keuntungan / 100);
    } else if (jenis === 'transfer') {
        const jumlahTransaksi = modalTahunan / 50000;
        pendapatanTahunan = modalTahunan + (jumlahTransaksi * biayaTransfer);
    } else {
        const modalPulsa = modalTahunan * 0.5;
        const modalTransfer = modalTahunan * 0.5;
        const pendapatanPulsa = modalPulsa * (1 + keuntungan / 100);
        const jumlahTransaksi = modalTransfer / 50000;
        const pendapatanTransfer = modalTransfer + (jumlahTransaksi * biayaTransfer);
        pendapatanTahunan = pendapatanPulsa + pendapatanTransfer;
    }

    const totalUpah = cbPegawai ? jumlahPegawai * gajiPegawai * 12 : 0;
    const totalProduksi = 0;
    const totalPembelian = modalTahunan;
    const totalOperasional = pengeluaranBulanan * 12;
    const nonOps = modalTahunan * 0.01;
    const totalPengeluaran = totalUpah + totalProduksi + totalPembelian + totalOperasional + nonOps;

    const totalPendapatan = pendapatanTahunan;
    const labaBersih = (totalPendapatan - totalPengeluaran) / 12;

    const asetTanah = luasM2 * (hargaTanah / 14);
    const pengali = { modern: 2200000, permanen: 1500000, semi: 800000, kayu: 500000 };
    const asetBangunan = luasM2 * (pengali[jenisBangunan] || 1500000);

    updateUI("rTotalUpah", totalUpah);
    updateUI("rTotalProduksi", totalProduksi);
    updateUI("rTotalPembelian", totalPembelian);
    updateUI("rTotalOperasional", totalOperasional);
    updateUI("rNonOps", nonOps);
    updateUI("rTotalPengeluaran", totalPengeluaran);
    updateUI("rPendapatanKotor", totalPendapatan);
    updateUI("rPendapatanLain", 0);
    updateUI("rTotalPendapatan", totalPendapatan);
    updateUI("rAsetTanah", asetTanah + asetBangunan);
    updateUI("rAsetPeralatan", nilaiPeralatan);
    updateUI("rTotalAset", nilaiPeralatan);
    updateUI("rLuas", luasM2, false);

    const elLaba = document.getElementById("rLabaBersih");
    if (elLaba) {
        if (labaBersih < 0) {
            elLaba.style.color = "#f44336";
            elLaba.textContent = formatRupiah(labaBersih) + " ⚠️ Rugi";
        } else {
            elLaba.style.color = "";
            elLaba.textContent = formatRupiah(labaBersih);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ['panjang', 'lebar', 'hargaTanah', 'jumlahPegawai', 'gajiPegawai', 'modal', 'keuntungan', 'biayaTransfer', 'pengeluaranBulanan', 'nilaiPeralatan'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.addEventListener('input', hitung); el.addEventListener('change', hitung); }
    });

    ['hargaTanah', 'gajiPegawai', 'modal', 'biayaTransfer', 'pengeluaranBulanan', 'nilaiPeralatan'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            formatRibuan(el);
            el.addEventListener('input', function(e) {
                let cursor = this.selectionStart, oldLen = this.value.length;
                formatRibuan(this);
                let diff = this.value.length - oldLen;
                if (diff > 0) cursor += diff;
                this.setSelectionRange(cursor, cursor);
                hitung();
            });
        }
    });

    document.querySelectorAll('input[name="jenisLayanan"], input[name="periode"], input[name="jenisBangunan"]').forEach(radio => {
        radio.addEventListener('change', hitung);
    });

    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', (e) => bukaTab(e.currentTarget.getAttribute('data-tab')));
    });

    document.querySelectorAll('.btn-copy-row').forEach(row => {
        row.addEventListener('click', () => copyFromRow(row.getAttribute('data-target')));
    });

    toggleLayanan();
    hitung();
});