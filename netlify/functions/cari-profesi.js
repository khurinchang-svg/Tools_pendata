// netlify/functions/cari-profesi.js

const DAFTAR_PROFESI = `000. Tidak Bekerja
001. Agen Tenaga Kerja
002. Ahli Sejarah dan Cagar Budaya
003. Akuntan
004. Analis Keuangan
005. Anggota DPD
006. Anggota DPR RI/MPR RI
007. Anggota DPRD Provinsi/Anggota DPRD Kabupaten/Kota
008. Apoteker
009. Arsiparis
010. Arsitek
011. Asisten Apoteker
013. Atlet/Olahragawan
014. Awak Kapal
018. Bidan
021. Buruh Angkut Barang
022. Buruh Bangunan
023. Buruh Industri
024. Buruh Perikanan
025. Buruh Pertambangan
026. Buruh Pertanian/Kehutanan
027. Buruh Peternakan
028. Camat
029. Chef
030. Chief Executive Officer (CEO)
031. Dokter Gigi
032. Dokter Hewan
033. Dokter Spesialis
034. Dokter Umum
035. Dosen
038. Fotografer
039. Gembala
040. Gubernur
041. Guru
042. Hakim
043. Hakim Agung
044. Imam Masjid
045. Jaksa
048. Juru Gambar Teknik/Drafter
049. Kameramen
050. Kapten Kapal
051. Kasir
052. Kepala Desa
053. Ketua Adat
054. Ketua Organisasi
055. Konsultan
056. Kreator Konten
058. Kurir
060. Makelar
061. Manajer
063. Mekanik
069. Operator Mesin
072. Paraji
073. Paranormal
074. Pastor
075. Pedagang
076. Pedagang Asongan/Keliling Makanan
077. Pedagang Asongan/Keliling Nonmakanan
078. Pedagang Online
079. Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)
080. Pekerja Garmen/Konveksi
081. Pekerja Percetakan
082. Pekerja Profesional Penjualan (Agen Asuransi, Sales Penjualan, dll)
083. Pekerja Sosial
084. Pelaku Ekosistem Musik
086. Pelaku Ekosistem Seni Pertunjukan
087. Pelaku Ekosistem Seni Rupa dan Kriya
088. Pelatih/Instruktur Olahraga
089. Pelayan Toko
090. Pembantu/Asisten Rumah Tangga
091. Pemberi Pinjaman
092. Pembuat Makanan/Juru Masak
093. Pembuat Minuman (Barista, Bartender, dll)
094. Pembuat Rokok/Cerutu/Tembakau Gulung
095. Pembuat Sepatu dan Tas
096. Pembudi Daya Ikan dan Biota Air Lainnya
097. Pemulung
098. Penagih Hutang (Debt Collector)
099. Penasihat Spiritual
100. Penata Busana
101. Penata Rambut
102. Penata Rias
107. Pengacara
108. Pengasuh Anak (Baby Sitter)
109. Pengelola Gedung/Properti
110. Pengemudi Ojek Online
111. Pengemudi Ojek Pangkalan
112. Pengepul
113. Penjaga Keamanan/Satpam
114. Penjahit
115. Penulis
116. Penyelenggara Acara (Event Organizer/EO)
119. Perajin Batu
120. Perajin Kayu, Bambu, dan Anyaman
121. Perajin Kulit dan Tekstil
122. Perajin Logam
123. Perajin Perhiasan
124. Perajin Tembikar/Keramik
127. Perangkat Desa
128. Perawat
129. Petani/Pekebun/Petani Hutan
130. Peternak
131. Petugas Pemadam Kebakaran
132. Petugas Stasiun Pengisian Bahan Bakar
133. Pilot
135. PNS Fungsional Tertentu
136. PNS Fungsional Umum
137. PNS Struktural
138. Polisi
139. Pramugara/i
140. Pramusaji
142. Programer
143. Psikiater
144. Psikolog
145. Pustakawan
146. Resepsionis
147. Sekretaris
148. Seniman/Artis
149. Sopir
150. Supervisor/Mandor
151. Tabib
152. Teknisi
153. Teller Bank
154. Tenaga Cuci
155. Tenaga Humas
156. Tenaga Kebersihan
157. Tenaga Tata Usaha
158. Tentara Nasional Indonesia (TNI)
159. Tukang Bangunan
160. Tukang Cat
161. Tukang Cukur
162. Tukang Fotokopi
163. Tukang Gigi
164. Tukang Kaca
165. Tukang Kayu
166. Tukang Kunci
167. Tukang Las/Pandai Besi
168. Tukang Listrik
169. Tukang Pijat
170. Tukang Pipa
171. Tukang Sablon
172. Tukang Sol Sepatu
173. Tukang Tambal Ban
174. Tukang Tebang Kayu
176. Ustaz/Mubalig
182. Wartawan
185. Lainnya (tuliskan: ....................................)
999. Tidak Tahu`;

exports.handler = async (event) => {
    // CORS header
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { keyword } = JSON.parse(event.body);

        if (!keyword) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Keyword diperlukan' })
            };
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'user',
                    content: `You are a job classification assistant. Here is the COMPLETE list of available job codes:\n${DAFTAR_PROFESI}\n\nUser typed: "${keyword}"\n\nIMPORTANT RULES:\n1. Choose ONE best match from the list above.\n2. DO NOT invent or make up any job that is NOT in the list.\n3. If no match, return exactly: "185 - Lainnya (tuliskan: ....................................)" followed by "(saran: your suggestion)".\n4. Reply ONLY with this format: "CODE - JOB NAME"\n5. No extra words, no explanation.`
                }],
                temperature: 0.3,
                max_tokens: 60
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Gagal menghubungi AI' })
        };
    }
};
