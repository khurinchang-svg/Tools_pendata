// =====================================================
// DASHBOARD SENGSUS TIM GEBER V2
// by ChatGPT
// =====================================================


// =====================================================
// API
// =====================================================

const API = {

    RAJADESA:
    "https://simpul-jabar.32net.id/api/um-rekap?kdkab=3207%20-%20KAB.%20CIAMIS&kdkec=190%20-%20RAJADESA&kdkel=004%20-%20RAJADESA&level_view=SLS",

    PURWARAJA:
    "https://simpul-jabar.32net.id/api/um-rekap?kdkab=3207%20-%20KAB.%20CIAMIS&kdkec=190%20-%20RAJADESA&kdkel=007%20-%20PURWARAJA&level_view=SLS"

};


//// =====================================================
// FILTER PETUGAS
// =====================================================

const FILTER = {

    "004 - RAJADESA": "ALL",

    "007 - PURWARAJA": [

        "hayatiehat99@gmail.com",

        "uherhernawan@gmail.com"

    ]

};


// =====================================================
// TARGET NASIONAL
// =====================================================

const TANGGAL_MULAI=new Date(2026,5,15);

const KENAIKAN_HARIAN=1.7;


// =====================================================
// DOM
// =====================================================

const els={

nasional:document.getElementById("nasional"),

percent:document.getElementById("percent"),

bar:document.getElementById("bar"),

target:document.getElementById("target"),

done:document.getElementById("done"),

remain:document.getElementById("remain"),

officer:document.getElementById("officer"),

update:document.getElementById("update"),

petugasList:document.getElementById("petugasList"),

status:document.getElementById("status"),

refresh:document.getElementById("refresh")

};


// =====================================================
// GLOBAL
// =====================================================

let dashboard=[];

let openedCard=null;


// =====================================================
// FORMAT ANGKA
// =====================================================

function angka(x){

return Number(x||0).toLocaleString("id-ID");

}


// =====================================================
// HITUNG TARGET NASIONAL
// =====================================================

function nasional(){

const hariIni=new Date();

const mulai=new Date(TANGGAL_MULAI);

hariIni.setHours(0,0,0,0);

mulai.setHours(0,0,0,0);

const selisih=Math.max(

0,

Math.floor((hariIni-mulai)/86400000)

);

return Math.min(

100,

1.7+(selisih*KENAIKAN_HARIAN)

);

}


// =====================================================
// WARNA PETUGAS
// =====================================================

function warnaPetugas(p){

const n=nasional();

if(p>=n+1.7) return "#00E676";

if(p>=n) return "#43A047";

if(p>=n-1.7) return "#FBC02D";

return "#E53935";

}


// =====================================================
// WARNA SLS
// =====================================================

function warnaSLS(p){

if(p>=90) return "#1976D2";

if(p>=70) return "#43A047";

if(p>=50) return "#7CB342";

if(p>=30) return "#FDD835";

if(p>=10) return "#FFF176";

return "#E53935";

}


// =====================================================
// MEMBERSIHKAN NAMA SLS
// =====================================================

function namaSLS(text){

    if(!text) return "-";

    return text
        .replace(/^[0-9]+\s*-\s*/, "")      // hapus kode depan
        .replace(/RW\s+\d+\s*/i, "")        // hapus RW xxx
        .replace(/\s*\(.*?\)$/, "")         // hapus (HLINA19988)
        .replace(/\s+/g, " ")               // rapikan spasi
        .trim();

}


// =====================================================
// NAMA PETUGAS
// =====================================================

function namaPetugas(item){

if(item.email==="salmansobari26@gmail.com"){

return "Salman Sobari";

}

return item.nama_lengkap || "Tanpa Nama";

}


// =====================================================
// AMBIL DATA API
// =====================================================

async function fetchData(){

els.status.textContent="Mengambil data...";

const hasil=await Promise.all([

fetch(API.RAJADESA),

fetch(API.PURWARAJA)

]);

const json=await Promise.all(

hasil.map(r=>r.json())

);

const semua=[

...(json[0].data||[]),

...(json[1].data||[])

];

return semua;

}

// =====================================================
// MEMBANGUN DASHBOARD DARI DATA SLS
// =====================================================

function buildDashboard(rows){

const map={};

rows.forEach(item=>{

const desa=item.nama_kel;

if(

FILTER[desa] !== "ALL" &&

!FILTER[desa].includes(item.email)

){

return;

}

if(!map[item.email]){

map[item.email]={

email:item.email,

nama:namaPetugas(item),

target:0,

pendataan:0,

submit:0,

persen:0,

jumlahSLS:0,

badge:{
biru:0,
hijau:0,
hijauMuda:0,
kuning:0,
kuningPucat:0,
merah:0
},

prioritas:[],

sls:[]

};

}



// =============================
// DATA SLS
// =============================

const sls={

nama:namaSLS(item.kdkab),

target:Number(item.target||0),

pendataan:Number(item.pendataan||0),

submit:Number(item.submit||0),

persen:Number(item.percentage_pendataan||0),

draft:Number(item.draft||0)

};



// =============================
// MASUKKAN KE PETUGAS
// =============================

map[item.email].sls.push(sls);

map[item.email].target+=sls.target;

map[item.email].pendataan+=sls.pendataan;

map[item.email].submit+=sls.submit;

});



// ======================================
// HITUNG TOTAL PETUGAS
// ======================================

Object.values(map).forEach(p=>{

p.jumlahSLS=p.sls.length;

p.persen=p.target
?((p.pendataan/p.target)*100)
:0;



// urutkan SLS dari yang terburuk

p.sls.sort((a,b)=>a.persen-b.persen);



// badge

p.sls.forEach(s=>{

if(s.persen>=90){

p.badge.biru++;

}

else if(s.persen>=70){

p.badge.hijau++;

}

else if(s.persen>=50){

p.badge.hijauMuda++;

}

else if(s.persen>=30){

p.badge.kuning++;

}

else if(s.persen>=10){

p.badge.kuningPucat++;

}

else{

p.badge.merah++;

}

});



// prioritas

p.prioritas=p.sls.slice(0,2);

});



// ======================================
// SORT PETUGAS
// ======================================

dashboard=Object.values(map)

.sort((a,b)=>b.persen-a.persen);

return dashboard;

}



// =====================================================
// RINGKASAN DASHBOARD
// =====================================================

function getSummary(){

let target=0;

let pendataan=0;

let submit=0;

let sls=0;



dashboard.forEach(p=>{

target+=p.target;

pendataan+=p.pendataan;

submit+=p.submit;

sls+=p.jumlahSLS;

});



return{

target,

pendataan,

submit,

sls,

petugas:dashboard.length,

persen:
target
?(pendataan/target*100)
:0

};

}

// =====================================================
// RENDER SUMMARY
// =====================================================

function renderSummary(){

const s=getSummary();

const warna=warnaPetugas(s.persen);

els.target.textContent=angka(s.target);

els.done.textContent=angka(s.pendataan);

els.remain.textContent=angka(s.target-s.pendataan);

els.officer.textContent=s.petugas;

els.percent.textContent=s.persen.toFixed(2)+"%";

els.nasional.textContent=nasional().toFixed(1)+"%";

els.bar.style.width=s.persen+"%";

els.bar.style.background=warna;

els.percent.style.color=warna;

els.update.textContent=
"Update "+new Date().toLocaleString("id-ID");

}



// =====================================================
// BADGE WARNA
// =====================================================

function renderBadge(b){

return `

<div class="badge">

<span class="biru">🔵 ${b.biru}</span>

<span class="hijau">🟢 ${b.hijau+b.hijauMuda}</span>

<span class="kuning">🟡 ${b.kuning}</span>

<span class="kuning2">🟨 ${b.kuningPucat}</span>

<span class="merah">🔴 ${b.merah}</span>

</div>

`;

}



// =====================================================
// CARD PETUGAS
// =====================================================

function renderPetugas(){

els.petugasList.innerHTML="";

dashboard.forEach((p,index)=>{

const warna=warnaPetugas(p.persen);

const card=document.createElement("div");

card.className="petugas-card";

card.innerHTML=`

<div class="petugas-header"

onclick="toggleCard(${index})">



<div class="petugas-atas">

<div class="nama">

${p.nama}

</div>

<div class="panah">

▼

</div>

</div>



<div class="petugas-progress">

<div class="petugas-bar"

style="

width:${p.persen}%;

background:${warna};

">

</div>

</div>



<div class="angka">

<div>

<b>${p.persen.toFixed(2)}%</b>

</div>

<div>

${angka(p.pendataan)} /

${angka(p.target)}

</div>

</div>



<div class="jumlah">

${p.jumlahSLS} Wilayah SLS

</div>



${renderBadge(p.badge)}



<div

class="detail"

id="detail${index}"

style="display:none">

</div>



</div>

`;

els.petugasList.appendChild(card);

});

}

// =====================================================
// RENDER DETAIL SLS
// =====================================================

function renderSLS(p){

let html="";

p.sls.forEach(s=>{

const warna=warnaSLS(s.persen);

html+=`

<div class="sls-card">

<div class="sls-title">

${s.nama}

</div>

<div class="sls-progress">

<div class="sls-bar"

style="

width:${s.persen}%;

background:${warna};

">

</div>

</div>

<div class="angka">

<div>

<b>${s.persen.toFixed(2)}%</b>

</div>

<div>

${angka(s.pendataan)} / ${angka(s.target)}

</div>

</div>

</div>

`;

});



// ==========================
// PRIORITAS
// ==========================

html+=`

<div class="prioritas">

<div class="prioritas-title">

Prioritas Pendampingan

</div>

`;



if(p.prioritas.length===0){

html+=`

<div class="baik">

✅ Semua wilayah dalam kondisi baik

</div>

`;

}else{

p.prioritas.forEach(x=>{

html+=`

<div class="prioritas-item">

🔴 ${x.nama}

<span>

${x.persen.toFixed(2)}%

</span>

</div>

`;

});

}



html+=`

</div>

`;



return html;

}



// =====================================================
// ACCORDION
// =====================================================

function toggleCard(index){

const detail=document.getElementById("detail"+index);



if(openedCard!==null && openedCard!==index){

const buka=document.getElementById("detail"+openedCard);

if(buka){

buka.style.display="none";

}

}



if(detail.style.display==="block"){

detail.style.display="none";

openedCard=null;

return;

}



detail.innerHTML=

renderSLS(

dashboard[index]

);

detail.style.display="block";

openedCard=index;

}



// =====================================================
// LOAD DATA
// =====================================================

async function loadData(){

try{

els.status.textContent="Mengambil data...";

const rows=

await fetchData();

if(rows.length===0){

    els.status.textContent="Tidak ada data.";

    return;

}

buildDashboard(rows);



renderSummary();



renderPetugas();



els.status.textContent="";

}catch(err){

console.error(err);

els.status.textContent=

"Gagal mengambil data.";

}

}



// =====================================================
// EVENT
// =====================================================

els.refresh.onclick=function(){

    els.status.textContent="✔ Data yang ditampilkan merupakan update terbaru hari ini.";

    setTimeout(function(){

        els.status.textContent="";

    },2500);

};



// =====================================================
// INIT
// =====================================================

loadData();
