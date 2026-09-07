# Altertemplate

Starter full-stack milik **Alterdev** untuk membangun aplikasi web dengan React, Laravel, MySQL, Redis, dan Docker. `Altertemplate` adalah nama teknis repository/template, sedangkan nama brand yang tampil kepada pengguna adalah **Alterdev**.

> Proyek ini adalah aplikasi. Infrastruktur bersama seperti MySQL, Redis, phpMyAdmin, dan reverse proxy berada di repository terpisah bernama `template_services`.

## Status proyek

- Landing page Alterdev: tersedia di `/`
- Halaman login demo: tersedia di `/login`
- Dashboard admin sederhana: tersedia di `/admin`
- Kredensial development: username `admin`, password `admin`
- Login demo disimpan di browser; autentikasi backend belum dibuat dan belum aman untuk production
- Backend Laravel masih berupa skeleton awal
- Mobile React Native tersedia di folder `mobile`, tetapi tidak dijalankan oleh Docker Compose utama
- `docker-compose.yml` saat ini ditujukan untuk development lokal, bukan production

## Gambaran arsitektur

```text
Browser
  |
  +-- altertemplate.local ----------> reverse proxy template_services
  |                                      |
  |                                      +--> altertemplate_frontend:5173
  |
  +-- api.altertemplate.local ------> reverse proxy template_services
                                         |
                                         +--> altertemplate_nginx_backend:80
                                                  |
                                                  +--> altertemplate_backend:9000

altertemplate_backend + altertemplate_queue
  |
  +--> service_mysql:3306
  +--> service_redis:6379
```

Penjelasan lebih lengkap tersedia di [Konsep Arsitektur](docs/ARCHITECTURE.md).

## Struktur repository

```text
altertemplate/
├── backend/                 Laravel 12 dan PHP-FPM
├── frontend/                React 19, Vite, dan Tailwind CSS
├── mobile/                  React Native (opsional)
├── nginx/backend.conf       Nginx internal untuk Laravel
├── docker-compose.yml       Container aplikasi untuk development
└── docs/                    Dokumentasi instalasi dan deployment
```

## Persyaratan

Untuk menjalankan versi web secara lokal:

- Git
- Docker Desktop
- Repository `template_services`
- Port `80`, `3308`, `6379`, dan `8081` tidak dipakai aplikasi lain
- Khusus Windows: hentikan Apache XAMPP karena menggunakan port 80

Node.js, PHP, Composer, MySQL, dan Redis tidak wajib dipasang langsung di komputer apabila seluruh proses dijalankan melalui Docker.

## Instalasi cepat

Susunan folder yang disarankan:

```text
alterdev/
├── template_services/
└── altertemplate/
```

### 1. Jalankan service bersama

```powershell
cd E:\project\alterdev\template_services
docker compose up -d
```

Service ini menyediakan:

- MySQL: host internal `mysql:3306`, host komputer `localhost:3308`
- Redis: host internal `redis:6379`
- phpMyAdmin: `http://localhost:8081`
- reverse proxy: port `80`
- Docker network: `template_services_template_network`

### 2. Siapkan backend

Dari folder repository `altertemplate`:

```powershell
Copy-Item backend\.env.example backend\.env
```

Pastikan nilai development utama di `backend/.env` adalah:

```env
APP_NAME=Alterdev
APP_ENV=local
APP_DEBUG=true
APP_URL=http://api.altertemplate.local

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=altertemplate
DB_USERNAME=root
DB_PASSWORD=root

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379
```

Jangan pernah commit file `backend/.env` ke GitHub.

### 3. Jalankan container aplikasi

```powershell
cd E:\project\alterdev\altertemplate
docker compose up -d --build
```

Container frontend otomatis menjalankan `npm install` dan `npm run dev`. Karena itu, untuk alur Docker Anda tidak perlu menjalankan `npm run dev` secara manual dari Windows.

### 4. Buat database

Jalankan dari repository `template_services`:

```powershell
docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS altertemplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Buat application key dan migration

Jalankan dari repository `altertemplate`:

```powershell
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
docker compose exec backend php artisan optimize:clear
```

### 6. Tambahkan domain lokal

Buka Notepad sebagai Administrator, lalu edit:

```text
C:\Windows\System32\drivers\etc\hosts
```

Tambahkan:

```text
127.0.0.1 altertemplate.local
127.0.0.1 api.altertemplate.local
```

Setelah itu buka:

- Frontend: [http://altertemplate.local](http://altertemplate.local)
- Login: [http://altertemplate.local/login](http://altertemplate.local/login)
- Backend: [http://api.altertemplate.local](http://api.altertemplate.local)
- phpMyAdmin: [http://localhost:8081](http://localhost:8081)

Panduan instalasi lebih terperinci tersedia di [Instalasi Lokal](docs/LOCAL-DEVELOPMENT.md).

## Cara menjalankan sehari-hari

Jika container sudah pernah dibuat, cukup jalankan:

```powershell
cd E:\project\alterdev\template_services
docker compose up -d

cd E:\project\alterdev\altertemplate
docker compose up -d
```

Untuk menghentikan aplikasi tanpa menghapus database:

```powershell
cd E:\project\alterdev\altertemplate
docker compose down

cd E:\project\alterdev\template_services
docker compose down
```

Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus seluruh data MySQL dan Redis.

## Perintah yang sering digunakan

Jalankan perintah berikut dari repository `altertemplate`:

```powershell
# Melihat status container
docker compose ps

# Melihat seluruh log
docker compose logs -f

# Log frontend saja
docker compose logs -f frontend

# Log backend saja
docker compose logs -f backend

# Menjalankan migration
docker compose exec backend php artisan migrate

# Membatalkan batch migration terakhir
docker compose exec backend php artisan migrate:rollback

# Membersihkan cache Laravel
docker compose exec backend php artisan optimize:clear

# Build frontend
docker compose exec frontend npm run build

# Menjalankan test backend
docker compose exec backend php artisan test
```

## Hubungan dengan `template_services`

Repository ini tidak menyimpan konfigurasi reverse proxy publik dan container database bersama. Kontrak yang harus disediakan oleh `template_services` dijelaskan dalam [Integrasi Template Services](docs/TEMPLATE-SERVICES.md).

Urutan menyalakan service selalu:

1. `template_services`
2. `altertemplate`

Urutan mematikan service sebaiknya dibalik:

1. `altertemplate`
2. `template_services`

## Persiapan GitHub

Pastikan hal berikut tidak ikut di-commit:

- `backend/.env`
- `backend/vendor`
- seluruh `node_modules`
- hasil build `dist`
- log dan cache lokal

Jika repository belum dibuat:

```powershell
git init
git add .
git commit -m "Initial Altertemplate setup"
git branch -M main
git remote add origin https://github.com/USERNAME/altertemplate.git
git push -u origin main
```

Periksa sekali lagi sebelum push:

```powershell
git status
git ls-files | Select-String "\.env$|node_modules|vendor"
```

Output pemeriksaan terakhir seharusnya tidak memuat file rahasia atau dependency lokal.

## Hosting / production

Jangan langsung menjalankan konfigurasi development saat ini di server publik. Frontend saat ini memakai Vite dev server dan kredensial database development masih sederhana.

Sebelum hosting, minimal perlu:

1. domain dan DNS;
2. HTTPS/TLS;
3. build frontend statis;
4. `APP_ENV=production` dan `APP_DEBUG=false`;
5. password database dan Redis yang kuat;
6. backup database;
7. deployment migration yang terkontrol;
8. monitoring dan rotasi log.

Alur production lengkap tersedia di [Panduan Deployment](docs/DEPLOYMENT.md).

## Troubleshooting singkat

### Domain menampilkan Welcome to XAMPP

Apache XAMPP mengambil port 80. Stop Apache, lalu jalankan ulang proxy:

```powershell
cd E:\project\alterdev\template_services
docker compose up -d --force-recreate nginx_proxy
```

### Network eksternal tidak ditemukan

Pastikan `template_services` dijalankan terlebih dahulu dan network tersedia:

```powershell
docker network ls
```

Nama yang dibutuhkan adalah `template_services_template_network`.

### `@tailwindcss/vite` tidak ditemukan

Jika memakai Docker, recreate frontend:

```powershell
docker compose up -d --force-recreate frontend
docker compose logs -f frontend
```

Jika menjalankan frontend tanpa Docker:

```powershell
cd frontend
npm install
npm run dev
```

### Laravel error 500

```powershell
docker compose logs -f backend
docker compose exec backend php artisan optimize:clear
docker compose exec backend php artisan key:generate
```

## Dokumentasi lanjutan

- [Konsep Arsitektur](docs/ARCHITECTURE.md)
- [Instalasi dan Development Lokal](docs/LOCAL-DEVELOPMENT.md)
- [Integrasi Template Services](docs/TEMPLATE-SERVICES.md)
- [Deployment ke Server](docs/DEPLOYMENT.md)
