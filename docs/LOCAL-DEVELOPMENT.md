# Local Development

Panduan singkat untuk menjalankan Altertemplate di komputer developer.

## Prasyarat

- Git
- Docker Desktop
- Repository `template_services`
- Port 80 tersedia

Struktur:

```text
alterdev/
├── template_services/
└── altertemplate/
```

## Instalasi dari Clone Baru

Clone repository:

```powershell
cd E:\project\alterdev
git clone URL_TEMPLATE_SERVICES template_services
git clone URL_ALTERTEMPLATE altertemplate
```

Jalankan service:

```powershell
cd E:\project\alterdev\template_services
docker compose up -d
docker compose ps
```

Buat `.env`:

```powershell
cd E:\project\alterdev\altertemplate
Copy-Item backend\.env.example backend\.env
```

Konfigurasi utama development:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://api.altertemplate.local
FRONTEND_URL=http://altertemplate.local

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

Build aplikasi:

```powershell
docker compose up -d --build
```

Buat database:

```powershell
cd E:\project\alterdev\template_services
docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS altertemplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Inisialisasi Laravel:

```powershell
cd E:\project\alterdev\altertemplate
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan jwt:secret
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan optimize:clear
```

Tambahkan hosts:

```text
127.0.0.1 altertemplate.local
127.0.0.1 api.altertemplate.local
```

## Struktur Kerja

Frontend:

```text
frontend/src/
├── components/app/     isi + logic fitur
├── contexts/           global state
├── layouts/            layout utama
├── pages/              wrapper halaman
├── routes/             routing
└── utils/              helper
```

Prinsip: **page dibuat tipis**, logic utama diletakkan di `components/app/...`.

Backend:

```text
backend/
├── app/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
└── tests/
```

## Perintah Harian

```powershell
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan optimize:clear
docker compose exec backend php artisan test

docker compose exec frontend npm run build
```

## Aturan Database

Perubahan schema wajib lewat migration:

```powershell
docker compose exec backend php artisan make:migration nama_migration
docker compose exec backend php artisan migrate
```

Data bawaan template gunakan Seeder.

Data yang dibuat lewat UI hanya masuk ke database lokal dan tidak ikut saat push.

## Reset

Rebuild tanpa menghapus database:

```powershell
docker compose down
docker compose up -d --build
```

Reset seluruh tabel development:

```powershell
docker compose exec backend php artisan migrate:fresh --seed
```

> `migrate:fresh` destruktif. Gunakan hanya untuk database development.
