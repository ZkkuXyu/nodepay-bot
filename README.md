# Nodepay Bot

Bot ini dibuat untuk terhubung ke Nodepay Network menggunakan Node.js. Bot ini melakukan autentikasi dengan menggunakan ID token, memastikan node berjalan dengan melakukan ping, dan menampilkan ID serta email pengguna. Bot ini juga mendukung penggunaan proxy.

Proyek ini didasarkan pada karya yang dibuat oleh [dante4rt](https://github.com/dante4rt/nodepay-airdrop-bot) dan telah dimodifikasi.

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
