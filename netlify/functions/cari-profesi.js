exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { keyword, profesiCandidates, kbliCandidates } = JSON.parse(event.body);

        if (!keyword) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Keyword is required' })
            };
        }

        // Build prompt untuk Groq
        const prompt = `
Anda adalah asisten pencarian kode profesi dan KBLI.

USER MENCARI: "${keyword}"

KANDIDAT PROFESI TERBAIK:
${profesiCandidates || 'Tidak ada kandidat'}

KANDIDAT KBLI TERBAIK:
${kbliCandidates || 'Tidak ada kandidat'}

TUGAS ANDA:
1. Pilih SATU kode profesi yang paling sesuai dari daftar kandidat.
2. Pilih SATU kode KBLI yang paling sesuai dari daftar kandidat.
3. Jika tidak ada yang cocok, gunakan kode 185 untuk profesi dengan saran.
4. Jika tidak ada KBLI yang cocok, gunakan kode 0 untuk KBLI.

FORMAT JAWABAN (WAJIB):
kode_profesi|kode_kbli

CONTOH:
034|86201

CONTOH (jika tidak ada profesi cocok):
185|86201 (saran: terapis anak)

CONTOH (jika tidak ada KBLI cocok):
034|0

CONTOH (jika tidak ada keduanya):
185|0 (saran: pekerja seni)

JAWAB HANYA DENGAN FORMAT TERSEBUT. JANGAN TAMBAHKAN KATA LAIN.
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PROFESI_GRK}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 80
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq API error:', response.status, errText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.choices[0]?.message?.content?.trim() || '185|0';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ result })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
