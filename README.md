# Nodepay Bot

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

## MIT LICENCE
Saya memberikan izin kepada pengguna lain untuk menggunakan, memodifikasi, dan mendistribusikan perangkat lunak sesuai dengan ketentuan lisensi MIT.

NOTE MEMODIFIKASI DAN MEMPERBARUI BOT YANG TELAH DI BUAT

## Struktur Proyek

```
nodepay-bot/
├── bot.js
├── package.json
├── proxy.txt
├── token.txt
└── README.md
```
