# Panduan Deploy LMS MTs Negeri 2 Cilacap di aaPanel (Node.js & Nginx)

Dokumen ini berisi panduan langkah demi langkah (*step-by-step*) untuk mengunggah, mengonfigurasi, dan mendistribusikan **LMS MTs Negeri 2 Cilacap** pada server VPS Linux menggunakan **aaPanel**, **PM2 Manager**, **Nginx Reverse Proxy**, dan **SSL Let's Encrypt**.

---

## 📋 Persyaratan Server (System Requirements)

- **OS Server:** Ubuntu 20.04 / 22.04 LTS atau Debian 11/12 / AlmaLinux 8/9.
- **Control Panel:** aaPanel (Versi Terbaru).
- **aaPanel Plugins Installed:**
  - **Nginx** (Versi 1.22 atau 1.24).
  - **PM2 Manager** / **Node.js Version Manager** (Disarankan Node.js v22.x LTS atau v24.x Terbaru).
- **Domain / Subdomain:** Misal `lms.mtsn2cilacap.sch.id` (Sudah mengarah/A-Record DNS ke IP Server).

---

## 🛠️ Langkah 1: Persiapan Build Bundling di Mesin Lokal

Sebelum mengunggah ke aaPanel, jalankan perintah pembuatan bundle produksi di komputer lokal:

```bash
# 1. Pastikan seluruh dependensi terinstall
npm install

# 2. Jalankan perintah kompilasi produksi
npx vite build
```

Setelah kompilasi selesai, direktori `.output/` akan terbentuk dengan struktur:
- `.output/public/` (Berkas statis HTML, CSS, JS, Gambar)
- `.output/server/` (Berkas Server Node.js SSR: `index.mjs`)

---

## 📦 Langkah 2: Kompres & Unggah Berkas ke aaPanel

1. Kompres folder proyek (termasuk folder `.output`, `package.json`, dan `.env` jika ada) menjadi berkas **`lms-build.zip`**.
2. Buka Dashboard **aaPanel** ➔ Masuk ke menu **Files**.
3. Navigasi ke direktori `/www/wwwroot/`.
4. Buat folder baru dengan nama domain Anda, contoh: **`lms.mtsn2cilacap.sch.id`**.
5. Unggah berkas **`lms-build.zip`** ke dalam folder `/www/wwwroot/lms.mtsn2cilacap.sch.id/`.
6. Klik kanan pada berkas zip ➔ Pilih **Uncompress**.

---

## 🚀 Langkah 3: Konfigurasi Node.js Project di aaPanel

1. Buka Dashboard **aaPanel** ➔ Masuk ke menu **Website**.
2. Pilih tab **Node project** ➔ Klik tombol **Add Node project**.
3. Isi formulir konfigurasi proyek Node.js sebagai berikut:
   - **Path:** `/www/wwwroot/lms.mtsn2cilacap.sch.id`
   - **Node version:** Pilih **v18.x** atau **v20.x** (LTS).
   - **Run option:** Pilih `node` atau `pm2`.
   - **User:** `www`
   - **Project name:** `lms-mtsn2-cilacap`
   - **Run script / Entry point:** `.output/server/index.mjs`
   - **Port:** `3000` (atau port kosong yang tersedia).
4. Klik **Submit**. aaPanel secara otomatis akan menjalankan server Node.js menggunakan PM2 pada port `3000`.

---

## 🔒 Langkah 4: Konfigurasi Reverse Proxy Nginx & SSL Let's Encrypt

1. Masuk ke menu **Website** ➔ **Node project** ➔ Klik pada nama domain/proyek Anda (`lms-mtsn2-cilacap`).
2. Masuk ke tab **URL rewrite / Proxy** atau tab **SSL**:
   - **Konfigurasi SSL:**
     1. Masuk ke tab **SSL** ➔ Pilih **Let's Encrypt**.
     2. Centang nama domain Anda ➔ Klik **Apply**.
     3. Setelah sertifikat terbit, aktifkan sakelar **Force HTTPS**.
   - **Konfigurasi Nginx Reverse Proxy:**
     aaPanel secara otomatis membuatkan reverse proxy mengarah ke `http://127.0.0.1:3000`. Pastikan aturan berikut terpasang di Nginx configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## ⚙️ Langkah 5: Pengelolaan Process & Auto-Restart (PM2)

Untuk memastikan aplikasi LMS selalu berjalan otomatis ketika server melakukan reboot/restart:

1. Buka aaPanel ➔ Masuk ke **App Store** ➔ Buka **PM2 Manager**.
2. Di dalam PM2 Manager, Anda akan melihat proses `lms-mtsn2-cilacap` berjalan dengan status **Online**.
3. Jika perlu melakukan *restart* atau melihat log aktivitas secara live:
   - **Terminal CLI Server:**
     ```bash
     # Cek status proses
     pm2 status

     # Restart aplikasi LMS
     pm2 restart lms-mtsn2-cilacap

     # Lihat log aktivitas real-time
     pm2 logs lms-mtsn2-cilacap
     ```

---

## 🧪 Langkah 6: Verifikasi Hasil Deployment

1. Buka peramban (browser) dan akses alamat domain madrasah: **`https://lms.mtsn2cilacap.sch.id`**.
2. Pastikan halaman login LMS MTsN 2 Cilacap tampil dengan **Sertifikat SSL (Gembok Hijau/HTTPS)**.
3. Uji coba login menggunakan 7 peran pengguna untuk memastikan semua fitur berjalan sempurna di server aaPanel.

---

### 🎉 Selamat! LMS MTs Negeri 2 Cilacap Telah Berhasil Didistribusikan di Server aaPanel!
