# Nodepay Bot

Bot ini dibuat untuk terhubung ke Nodepay Network menggunakan Node.js. Bot ini melakukan autentikasi dengan menggunakan ID token, memastikan node berjalan dengan melakukan ping, dan menampilkan ID serta email pengguna. Bot ini juga mendukung penggunaan proxy.

Proyek ini didasarkan pada karya yang dibuat oleh [dante4rt](https://github.com/dante4rt/nodepay-airdrop-bot) dan telah dimodifikasi untuk kebutuhan spesifik saya.

## Langkah-langkah Instalasi

1. Kloning repositori ini:
   ```sh
   git clone https://github.com/ZkkuXyu/nodepay-bot.git
   cd nodepay-bot
2. Instal dependensi:
   ```sh
   npm install
3. Buat file token.txt
4. Tambahkan ID token dan email ke dalam file token.txt
5. Buat file proxy.txt
6. Jalankan bot:
   ```sh
   npm start

Baik, saya akan menggunakan nama GitHub Anda dan menambahkan beberapa elemen yang menurut saya bisa menyempurnakan kode bot Nodepay Anda. Berikut adalah versi akhir dari proyek dengan tampilan yang diperbarui.

### Langkah 1: Kloning dan Menyiapkan Proyek

1. **Kloning repositori**:
   ```sh
   git clone https://github.com/ZkkuXyu/nodepay-bot.git
   cd nodepay-bot
   ```

2. **Instal Dependensi**:
   ```sh
   npm install
   ```

### Langkah 2: Buat File `token.txt` dan `proxy.txt`
1. **Buat File `token.txt`**:
   ```sh
   touch token.txt
   nano token.txt
   ```
   Isi file `token.txt` dengan informasi yang diperlukan:
   ```
   ID_TOKEN="your_nodepay_id_token"
   USER_EMAIL=your_email@example.com
   ```

2. **Buat File `proxy.txt`**:
   ```sh
   touch proxy.txt
   nano proxy.txt
   ```
   Isi file `proxy.txt` dengan URL proxy:
   ```
   PROXY_URL=http://your_proxy_url:port
   ```

### Langkah 3: Ubah Kode `bot.js`
Berikut adalah kode yang telah dimodifikasi dengan elemen tambahan yang diperlukan:

```js
const fs = require('fs');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const readline = require('readline');
const ora = require('ora');

// Konfigurasi konstanta
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.nodepay.network';

// Fungsi untuk membaca dan validasi file konfigurasi
function readConfig(filename) {
    try {
        const content = fs.readFileSync(filename, 'utf-8');
        if (!content.includes('=')) {
            throw new Error(`Format file ${filename} tidak valid`);
        }
        return content.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (!key || !value) {
                throw new Error(`Format baris tidak valid dalam ${filename}`);
            }
            acc[key.trim()] = value.trim();
            return acc;
        }, {});
    } catch (error) {
        console.error(`Error membaca file ${filename}:`, error.message);
        process.exit(1);
    }
}

// Baca konfigurasi
const config = readConfig('token.txt');
const proxyConfig = readConfig('proxy.txt');

// Validasi konfigurasi wajib
const ID_TOKEN = config.ID_TOKEN;
const USER_EMAIL = config.USER_EMAIL;
const PROXY_URL = proxyConfig.PROXY_URL;

if (!ID_TOKEN || !USER_EMAIL) {
    console.error('ID_TOKEN dan USER_EMAIL wajib diisi dalam file token.txt');
    process.exit(1);
}

// Buat interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi untuk delay antara retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fungsi utama untuk koneksi ke network
async function connectToNodepayNetwork(axiosInstance) {
    try {
        if (!ID_TOKEN) {
            throw new Error('ID Token tidak ditemukan di file konfigurasi');
        }

        const response = await axiosInstance.get(`${API_BASE_URL}/connect`, {
            params: { token: ID_TOKEN },
            timeout: REQUEST_TIMEOUT
        });

        if (response.status !== 200) {
            throw new Error(`Koneksi gagal dengan status: ${response.status}`);
        }

        // Ping untuk verifikasi koneksi
        const pingResponse = await axiosInstance.get(`${API_BASE_URL}/ping`, {
            params: { token: ID_TOKEN },
            timeout: REQUEST_TIMEOUT
        });

        console.log('='.repeat(50));
        console.log(`Node berjalan dengan ID: ${ID_TOKEN}`);
        console.log(`Email pengguna: ${USER_EMAIL}`);
        console.log('Ping berhasil:', pingResponse.data);
        console.log('='.repeat(50));

        return true;
    } catch (error) {
        console.error('Kesalahan saat menjalankan node:', error.message);
        if (error.response) {
            console.error('Response error:', error.response.data);
        }
        throw error;
    }
}

// Fungsi dengan mekanisme retry
async function connectWithRetry(axiosInstance) {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            return await connectToNodepayNetwork(axiosInstance);
        } catch (error) {
            retries++;
            console.error('Kesalahan:', error.message);
            
            if (error.response) {
                console.error('Response error:', error.response.data);
            }

            if (retries < MAX_RETRIES) {
                const waitTime = retries * 2000; // Meningkatkan waktu tunggu setiap retry
                console.log(`Mencoba koneksi ulang (${retries}/${MAX_RETRIES}) dalam ${waitTime / 1000} detik...`);
                await delay(waitTime);
            } else {
                console.error('Gagal terhubung setelah', MAX_RETRIES, 'percobaan');
                return false;
            }
        }
    }
}

// Fungsi untuk validasi proxy URL
function validateProxyUrl(url) {
    if (!url) return false;
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
}

// Main execution dengan animasi
rl.question('Apakah Anda ingin menggunakan proxy? (yes/no): ', async (answer) => {
    let axiosInstance;
    const spinner = ora('Menghubungkan ke Nodepay Network...').start();

    if (answer.toLowerCase() === 'yes') {
        if (!validateProxyUrl(PROXY_URL)) {
            spinner.fail('Format proxy URL tidak valid. Gunakan format: http(s)://host:port');
            rl.close();
            return;
        }

        const agent = new HttpsProxyAgent(PROXY_URL);
        axiosInstance = axios.create({ 
            httpsAgent: agent,
            headers: {
                'User-Agent': 'NodepayNetwork-Bot/1.0'
            }
        });
        spinner.info('Menggunakan proxy: ' + PROXY_URL);
    } else {
        axiosInstance = axios.create({
            headers: {
                'User-Agent': 'NodepayNetwork-Bot/1.0'
            }
        });
        spinner.info('Menggunakan IP VPS pengguna.');
    }

    try {
        const success = await connectWithRetry(axiosInstance);
        if (success) {
            spinner.succeed('Berhasil terhubung ke Nodepay Network!');
        } else {
            spinner.fail('Gagal terhubung ke Nodepay Network.');
        }
    } finally {
        rl.close();
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nMenghentikan program...');
    rl.close();
    process.exit(0);
});
```

### Langkah 4: Buat atau Perbarui File `package.json`
```json
{
    "name": "nodepay-bot",
    "version": "1.0.0",
    "description": "Bot untuk terhubung ke Nodepay Network",
    "main": "bot.js",
    "scripts": {
      "start": "node bot.js"
    },
    "dependencies": {
      "axios": "^0.21.1",
      "https-proxy-agent": "^5.0.0",
      "readline": "^1.3.0",
      "ora": "^5.4.1"
    }
}
```

### Langkah 5: Tambahkan `README.md`
```markdown
# Nodepay Bot

Bot ini dibuat untuk terhubung ke Nodepay Network menggunakan Node.js. Bot ini melakukan autentikasi dengan menggunakan ID token, memastikan node berjalan dengan melakukan ping, dan menampilkan ID serta email pengguna. Bot ini juga mendukung penggunaan proxy.

## Langkah-langkah Instalasi

1. **Kloning repositori ini**:
   ```sh
   git clone https://github.com/ZkkuXyu/nodepay-bot.git
   cd nodepay-bot
   ```

2. **Instal dependensi**:
   ```sh
   npm install
   ```

3. **Buat file `token.txt`**:
   ```sh
   touch token.txt
   nano token.txt
   ```
   Tambahkan ID token dan email ke dalam file `token.txt`:
   ```
   ID_TOKEN="your_nodepay_id_token"
   USER_EMAIL=your_email@example.com
   ```

4. **Buat file `proxy.txt`**:
   ```sh
   touch proxy.txt
   nano proxy.txt
   ```
   Tambahkan konfigurasi proxy ke dalam file `proxy.txt`:
   ```
   PROXY_URL=http://your_proxy_url:port
   ```

5. **Jalankan bot**:
   ```sh
   npm start
   ```

   Anda akan diminta untuk memilih apakah ingin menggunakan proxy atau tidak. Jika ya, bot akan menggunakan proxy yang telah Anda masukkan; jika tidak, bot akan menggunakan IP VPS pengguna.

## Struktur Proyek

```
nodepay-bot/
├── bot.js
├── package.json
├── proxy.txt
├── token.txt
└── README.md
```

## Keterangan

Bot ini akan melakukan koneksi ke Nodepay Network, memastikan node berjalan dengan benar, dan menampilkan ID serta email pengguna. Jika terjadi kesalahan, bot akan menampilkan pesan kesalahan yang sesuai. Bot ini juga mendukung
