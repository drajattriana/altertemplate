# Instalasi dan Development Lokal

## Pilihan cara menjalankan

Gunakan salah satu pola berikut dan jangan mencampur `node_modules` Windows dengan `node_modules` container.

### Pola yang direkomendasikan: seluruh web melalui Docker

Pola ini paling konsisten karena PHP, Composer, Node.js, MySQL, dan Redis berjalan dalam container.

```powershell
# Terminal 1: infrastruktur bersama
cd E:\project\alterdev\template_services
docker compose up -d

# Terminal 2: aplikasi
cd E:\project\alterdev\altertemplate
docker compose up -d --build
```

Anda cukup mengedit source code. Volume Docker membuat perubahan frontend dan backend langsung terlihat di container. Vite menyediakan hot reload untuk frontend.

### Pola alternatif: frontend di Windows

Gunakan ini hanya jika ingin menjalankan Vite di luar Docker:

```powershell
cd frontend
npm install
npm run dev
```

Frontend dapat dibuka melalui URL yang ditampilkan Vite, biasanya `http://localhost:5173`. Backend, MySQL, dan Redis tetap dapat dijalankan melalui Docker.

Jika beralih kembali ke Docker dan dependency bermasalah, recreate container frontend agar volume dependency dibuat ulang:

```powershell
docker compose up -d --force-recreate frontend
```

## Instalasi dari clone baru

### 1. Clone repository

```powershell
cd E:\project\alterdev
git clone URL_REPOSITORY_TEMPLATE_SERVICES template_services
git clone URL_REPOSITORY_ALTERTEMPLATE altertemplate
```

### 2. Pastikan Docker Desktop aktif

Tes:

```powershell
docker version
docker compose version
```

### 3. Jalankan infrastruktur

```powershell
cd E:\project\alterdev\template_services
docker compose up -d
docker compose ps
```

Pastikan container MySQL sudah healthy sebelum melanjutkan.

### 4. Buat konfigurasi Laravel

```powershell
cd E:\project\alterdev\altertemplate
Copy-Item backend\.env.example backend\.env
```

File example sudah berisi default untuk development Docker. Jangan memasukkan password production ke file example.

### 5. Build aplikasi

```powershell
docker compose up -d --build
docker compose ps
```

### 6. Buat database development

```powershell
cd E:\project\alterdev\template_services
docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS altertemplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 7. Inisialisasi Laravel

```powershell
cd E:\project\alterdev\altertemplate
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan optimize:clear
```

Perintah `key:generate` cukup dilakukan sekali untuk setiap file `.env` baru. Jangan mengganti `APP_KEY` pada aplikasi yang sudah memiliki data terenkripsi atau session aktif.

### 8. Siapkan hosts lokal

Edit `C:\Windows\System32\drivers\etc\hosts` sebagai Administrator:

```text
127.0.0.1 altertemplate.local
127.0.0.1 api.altertemplate.local
```

Jika perubahan domain belum terbaca:

```powershell
ipconfig /flushdns
```

## Workflow pengembangan

### Frontend

Lokasi utama:

```text
frontend/src/pages/
frontend/src/components/
frontend/src/layouts/
frontend/src/routes/
frontend/src/styles/
```

Route aplikasi didefinisikan di `frontend/src/routes/index.tsx`.

Struktur layout dashboard:

```text
frontend/src/
├── components/app/
│   ├── dashboard/          Komponen isi dashboard
│   ├── AppHeader.tsx       Header, search, tema, dan user menu
│   ├── AppSidebar.tsx      Navigasi utama
│   ├── AppFooter.tsx       Footer aplikasi
│   ├── AppIcon.tsx         Icon layout yang dipakai bersama
│   ├── Backdrop.tsx        Overlay sidebar mobile
│   └── SidebarWidget.tsx   Widget bagian bawah sidebar
├── contexts/
│   ├── SidebarContext.tsx  State expand, hover, dan mobile sidebar
│   └── ThemeContext.tsx    State tema terang/gelap
├── layouts/
│   └── AppLayout.tsx       Penyusun seluruh layout dan Outlet
└── pages/app/
    └── DashboardPage.tsx   Komposisi halaman dashboard
```

Untuk mengganti isi dashboard, kerjakan komponen di `components/app/dashboard`. Untuk mengubah kerangka aplikasi, gunakan `AppLayout`, `AppHeader`, atau `AppSidebar`. Dengan pembagian ini, perubahan halaman tidak perlu mengubah logika layout.

Login dashboard sementara:

```text
URL      : http://altertemplate.local/login
Username : admin
Password : admin
Dashboard: http://altertemplate.local/admin
```

Status login demo disimpan di browser. Gunakan tombol `Keluar` pada header dashboard untuk menghapusnya. Login ini khusus development dan harus diganti dengan autentikasi backend sebelum production.

Sebelum commit perubahan frontend:

```powershell
docker compose exec frontend npm run build
```

### Backend

Lokasi utama:

```text
backend/app/
backend/routes/
backend/database/migrations/
backend/tests/
```

Setelah membuat migration:

```powershell
docker compose exec backend php artisan migrate
```

Sebelum commit perubahan backend:

```powershell
docker compose exec backend php artisan test
```

### Mobile

Folder `mobile` adalah aplikasi React Native terpisah dan tidak masuk Compose web. Persyaratan minimumnya Node.js 22.11 atau lebih baru, Android Studio untuk Android, dan macOS/Xcode untuk iOS.

```powershell
cd mobile
npm install
npm start
```

Terminal lain untuk Android:

```powershell
npm run android
```

## Reset yang aman

Recreate container aplikasi tanpa menghapus database:

```powershell
cd E:\project\alterdev\altertemplate
docker compose down
docker compose up -d --build
```

Reset database Laravel (menghapus seluruh tabel aplikasi):

```powershell
docker compose exec backend php artisan migrate:fresh
```

Perintah tersebut destruktif. Gunakan hanya pada database development yang boleh dihapus.
