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

# 2. Jalankan perintah kompilasi produksi standar
npm run build   # (atau npx vite build)
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
### Metode A: Via aaPanel Form (NPM Start)
1. Di form **Add Node project** aaPanel:
   - **Path:** `/www/wwwroot/lmscilacap`
   - **Node version:** Pilih **v22.x** atau **v20.x** (LTS).
   - **Run opt:** Pilih **`npm`** (atau `node`).
   - **User:** `www`
   - **Project name:** `lmscilacap`
   - **Run script / Command:** `start` *(aaPanel akan otomatis menjalankan `npm start` yang mengeksekusi `node .output/server/index.mjs`)*
   - **Port:** **`3001`** (atau port lain yang masih kosong).

### Metode B: Via Terminal aaPanel / PM2 CLI (Paling Stabil & Anti-Fail 💯)
Jika via form aaPanel terus mengalami *Failed to start*, jalankan 2 perintah ini langsung di **Terminal aaPanel**:

```bash
# 1. Masuk ke folder aplikasi
cd /www/wwwroot/lmscilacap

# 2. Jalankan aplikasi menggunakan PM2
PORT=3001 pm2 start .output/server/index.mjs --name lmscilacap
```

---

## 🔒 Langkah 4: Konfigurasi Reverse Proxy Nginx & SSL Let's Encrypt

1. Masuk ke menu **Website** ➔ **Node project** ➔ Klik pada nama domain/proyek Anda (`lms-mtsn2-cilacap`).
2. Masuk ke tab **URL rewrite / Proxy** atau tab **SSL**:
   - **Konfigurasi SSL:**
     1. Masuk ke tab **SSL** ➔ Pilih **Let's Encrypt**.
     2. Centang nama domain Anda ➔ Klik **Apply**.
     3. Setelah sertifikat terbit, aktifkan sakelar **Force HTTPS**.
   - **Konfigurasi Nginx Reverse Proxy:**
     aaPanel akan membuatkan reverse proxy mengarah ke port aplikasi Anda. Sesuaikan port di Nginx (`3001`):

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;  # Sesuaikan dengan Port yang Anda pilih
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

## 🗄️ Pengelolaan Database di aaPanel

Aplikasi LMS MTsN 2 Cilacap menggunakan arsitektur **Supabase Cloud Database**.

### 1. Default Option: Supabase Cloud Database (Rekomendasi Utama)
- **Dimana lokasi Databasenya?** Databasenya berada secara terpusat di Cloud Server Supabase (`https://zfmttodctylwjrtqkcud.supabase.co`).
- **Apakah perlu pasang MySQL/PostgreSQL di aaPanel?** **TIDAK PERLU.** Server aaPanel hanya bertindak sebagai aplikasi web runner yang terhubung secara otomatis ke database cloud melalui berkas `.env`.
- **Pengaturan `.env` di aaPanel:** Pastikan berkas `.env` di direktori `/www/wwwroot/lms.mtsn2cilacap.sch.id/` berisi kredensial berikut:
  ```env
  VITE_SUPABASE_URL="https://zfmttodctylwjrtqkcud.supabase.co"
  VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_rKnGWDYjb21HAK01k3EGrA_lqFWMOID"
  ```

---

## 🧪 Langkah 6: Verifikasi Hasil Deployment

1. Buka peramban (browser) dan akses alamat domain madrasah: **`https://lms.mtsn2cilacap.sch.id`**.
2. Pastikan halaman login LMS MTsN 2 Cilacap tampil dengan **Sertifikat SSL (Gembok Hijau/HTTPS)**.
3. Uji coba login menggunakan 7 peran pengguna untuk memastikan semua fitur berjalan sempurna di server aaPanel.

---

### 🎉 Selamat! LMS MTs Negeri 2 Cilacap Telah Berhasil Didistribusikan di Server aaPanel!
