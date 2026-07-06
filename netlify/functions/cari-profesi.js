// netlify/functions/cari-profesi.js

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

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
                'Authorization': `Bearer ${process.env.PROFESI_GRK}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'user',
                    content: `You are a job classifier. Match the user's input to the closest job from this list (codes in Indonesian, with English translation in brackets):

000. Tidak Bekerja (Unemployed)
001. Agen Tenaga Kerja (Labor Agent)
002. Ahli Sejarah dan Cagar Budaya (Historian/Heritage Expert)
003. Akuntan (Accountant)
004. Analis Keuangan (Financial Analyst)
005. Anggota DPD (Senator/Regional Representative)
006. Anggota DPR RI/MPR RI (Parliament Member)
007. Anggota DPRD Provinsi/Kabupaten/Kota (Local Parliament Member)
008. Apoteker (Pharmacist)
009. Arsiparis (Archivist)
010. Arsitek (Architect)
011. Asisten Apoteker (Pharmacy Assistant)
013. Atlet/Olahragawan (Athlete)
014. Awak Kapal (Ship Crew)
018. Bidan (Midwife)
021. Buruh Angkut Barang (Porter/Transporter)
022. Buruh Bangunan (Construction Worker)
023. Buruh Industri (Factory Worker)
024. Buruh Perikanan (Fishery Worker)
025. Buruh Pertambangan (Mining Worker)
026. Buruh Pertanian/Kehutanan (Farm/Forestry Worker)
027. Buruh Peternakan (Livestock Worker)
028. Camat (Subdistrict Head)
029. Chef (Chef)
030. Chief Executive Officer/CEO (CEO)
031. Dokter Gigi (Dentist)
032. Dokter Hewan (Veterinarian)
033. Dokter Spesialis (Specialist Doctor)
034. Dokter Umum (General Doctor)
035. Dosen (Lecturer)
038. Fotografer (Photographer)
039. Gembala (Shepherd)
040. Gubernur (Governor)
041. Guru (Teacher)
042. Hakim (Judge)
043. Hakim Agung (Supreme Judge)
044. Imam Masjid (Mosque Imam)
045. Jaksa (Prosecutor)
048. Juru Gambar Teknik/Drafter (Drafter)
049. Kameramen (Cameraman)
050. Kapten Kapal (Ship Captain)
051. Kasir (Cashier)
052. Kepala Desa (Village Head)
053. Ketua Adat (Traditional Leader)
054. Ketua Organisasi (Organization Leader)
055. Konsultan (Consultant)
056. Kreator Konten (Content Creator)
058. Kurir (Courier)
060. Makelar (Broker)
061. Manajer (Manager)
063. Mekanik (Mechanic)
069. Operator Mesin (Machine Operator)
072. Paraji (Traditional Birth Attendant)
073. Paranormal (Psychic)
074. Pastor (Pastor/Priest)
075. Pedagang (Trader/Merchant)
076. Pedagang Asongan/Keliling Makanan (Street Food Vendor)
077. Pedagang Asongan/Keliling Nonmakanan (Street Non-food Vendor)
078. Pedagang Online (Online Seller)
079. PPPK (Government Contract Worker)
080. Pekerja Garmen/Konveksi (Garment Worker)
081. Pekerja Percetakan (Printing Worker)
082. Pekerja Profesional Penjualan/Agent/Sales (Sales Agent)
083. Pekerja Sosial (Social Worker)
084. Pelaku Ekosistem Musik (Music Industry Worker)
086. Pelaku Ekosistem Seni Pertunjukan (Performing Arts Worker)
087. Pelaku Ekosistem Seni Rupa dan Kriya (Visual Arts/Craft Worker)
088. Pelatih/Instruktur Olahraga (Sports Coach)
089. Pelayan Toko (Shop Assistant)
090. Pembantu/Asisten Rumah Tangga (Domestic Helper)
091. Pemberi Pinjaman (Money Lender)
092. Pembuat Makanan/Juru Masak (Cook/Food Maker)
093. Pembuat Minuman/Barista/Bartender (Beverage Maker/Barista)
094. Pembuat Rokok/Cerutu/Tembakau Gulung (Cigarette Maker)
095. Pembuat Sepatu dan Tas (Shoes/Bags Maker)
096. Pembudi Daya Ikan (Fish Farmer)
097. Pemulung (Scavenger)
098. Penagih Hutang/Debt Collector (Debt Collector)
099. Penasihat Spiritual (Spiritual Advisor)
100. Penata Busana (Fashion Stylist)
101. Penata Rambut (Hairdresser)
102. Penata Rias (Makeup Artist)
107. Pengacara (Lawyer)
108. Pengasuh Anak/Baby Sitter (Babysitter)
109. Pengelola Gedung/Properti (Property Manager)
110. Pengemudi Ojek Online (Online Motorcycle Taxi Driver)
111. Pengemudi Ojek Pangkalan (Conventional Motorcycle Taxi Driver)
112. Pengepul (Collector/Middleman)
113. Penjaga Keamanan/Satpam (Security Guard)
114. Penjahit (Tailor)
115. Penulis (Writer)
116. Penyelenggara Acara/EO (Event Organizer)
119. Perajin Batu (Stone Craftsman)
120. Perajin Kayu/Bambu/Anyaman (Wood/Bamboo Craftsman)
121. Perajin Kulit dan Tekstil (Leather/Textile Craftsman)
122. Perajin Logam (Metal Craftsman)
123. Perajin Perhiasan (Jewelry Craftsman)
124. Perajin Tembikar/Keramik (Pottery/Ceramic Craftsman)
127. Perangkat Desa (Village Official)
128. Perawat (Nurse)
129. Petani/Pekebun/Petani Hutan (Farmer/Plantation/Forestry)
130. Peternak (Livestock Farmer)
131. Petugas Pemadam Kebakaran (Firefighter)
132. Petugas SPBU (Gas Station Attendant)
133. Pilot (Pilot)
135. PNS Fungsional Tertentu (Specialized Civil Servant)
136. PNS Fungsional Umum (General Civil Servant)
137. PNS Struktural (Structural Civil Servant)
138. Polisi (Police)
139. Pramugara/i (Flight Attendant)
140. Pramusaji (Waiter/Waitress)
142. Programer (Programmer)
143. Psikiater (Psychiatrist)
144. Psikolog (Psychologist)
145. Pustakawan (Librarian)
146. Resepsionis (Receptionist)
147. Sekretaris (Secretary)
148. Seniman/Artis (Artist)
149. Sopir (Driver)
150. Supervisor/Mandor (Supervisor/Foreman)
151. Tabib (Traditional Healer)
152. Teknisi (Technician)
153. Teller Bank (Bank Teller)
154. Tenaga Cuci (Laundry Worker)
155. Tenaga Humas (Public Relations)
156. Tenaga Kebersihan (Cleaner)
157. Tenaga Tata Usaha (Administrative Staff)
158. TNI (Military)
159. Tukang Bangunan (Builder)
160. Tukang Cat (Painter)
161. Tukang Cukur (Barber)
162. Tukang Fotokopi (Photocopy Operator)
163. Tukang Gigi (Dental Technician)
164. Tukang Kaca (Glass Worker)
165. Tukang Kayu (Carpenter)
166. Tukang Kunci (Locksmith)
167. Tukang Las/Pandai Besi (Welder/Blacksmith)
168. Tukang Listrik (Electrician)
169. Tukang Pijat (Masseur)
170. Tukang Pipa (Plumber)
171. Tukang Sablon (Screen Printer)
172. Tukang Sol Sepatu (Shoe Repairer)
173. Tukang Tambal Ban (Tire Repairer)
174. Tukang Tebang Kayu (Lumberjack)
176. Ustaz/Mubalig (Islamic Preacher)
182. Wartawan (Journalist)
185. Lainnya (tuliskan: ....................................) (Others - write in)
999. Tidak Tahu (Don't Know)

User input: "${keyword}"

RULES:
1. Match to ONE job from the list above.
2. Return ONLY the Indonesian format: "CODE - NAMA PROFESI"
3. If no good match: "185 - Lainnya (tuliskan: ....................................)" followed by "(saran: your suggestion in Indonesian)"
4. No extra text, no explanation.`
                }],
                temperature: 0
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
