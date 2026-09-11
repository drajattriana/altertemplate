# Altertemplate

Starter full-stack **Alterdev** untuk membangun aplikasi dengan React, Laravel, MySQL, Redis, Docker, JWT Authentication, Role/Permission, Dynamic Menu, dan CI/CD GitHub Actions.

> `altertemplate` adalah repository template. Saat membuat project baru, ganti identitas project, domain, database, dan konfigurasi deployment.

## Struktur Repository

```text
altertemplate/
├── backend/                  Laravel API
├── frontend/                 React + Vite
├── mobile/                   Mobile app opsional
├── deploy/                   Script deployment
├── docs/                     Dokumentasi
├── nginx/                    Nginx internal backend
├── .github/workflows/        GitHub Actions
└── docker-compose.yml        Development lokal
```

## Yang Dibutuhkan

Development lokal:
- Git
- Docker Desktop
- Repository `template_services`
- Port 80 tersedia

Production:
- cPanel/shared hosting dengan SSH
- PHP 8.4 atau versi kompatibel
- MySQL
- Domain frontend dan API
- SSL aktif
- GitHub repository

PHP, Composer, Node.js, MySQL, dan Redis tidak wajib dipasang langsung di Windows jika development memakai Docker.

## Instalasi Cepat

Struktur folder:

```text
alterdev/
├── template_services/
└── altertemplate/
```

Jalankan service bersama:

```powershell
cd E:\project\alterdev\template_services
docker compose up -d
```

Siapkan backend:

```powershell
cd E:\project\alterdev\altertemplate
Copy-Item backend\.env.example backend\.env
docker compose up -d --build
```

Buat database lokal:

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

Tambahkan ke Windows hosts:

```text
127.0.0.1 altertemplate.local
127.0.0.1 api.altertemplate.local
```

Akses:

```text
Frontend   : http://altertemplate.local
API        : http://api.altertemplate.local
phpMyAdmin : http://localhost:8081
```

Panduan lengkap: [Local Development](docs/LOCAL-DEVELOPMENT.md).

## Database

```text
Migration = struktur database
Seeder    = data bawaan template
Data UI   = hanya tersimpan di database environment tersebut
```

Contoh:
- Tambah tabel/kolom → Migration
- Role, permission, menu, default user → Seeder
- Data input user → tidak ikut `git push`

Migration production dijalankan otomatis saat deploy. Seeder dijalankan saat first deployment atau sesuai kebutuhan.

## Aturan Development

Scope:

```text
FE  = Frontend
BF  = Backend
MB  = Mobile
ALL = Lintas area / docs / CI/CD / config umum
```

Type:

```text
feat     = fitur baru
fix      = bug fix
refactor = rapikan struktur
docs     = dokumentasi
chore    = maintenance/config/dependency
test     = testing
style    = formatting/UI kecil
perf     = optimasi performa
```

Format commit:

```text
SCOPE:type/short-description
```

Contoh:

```text
FE:feat/create-menu
BF:fix/login-validation
MB:feat/profile-screen
ALL:docs/update-deployment
```

Panduan lengkap: [Development Guide](docs/DEVELOPMENT-GUIDE.md).

## Production

Production tidak memakai Docker Compose development.

```text
git push main
    ↓
GitHub Actions
    ↓
Composer install --no-dev
npm ci + npm run build
    ↓
SSH/SCP ke cPanel
    ↓
php artisan migrate --force
Laravel cache
React dist
```

Panduan: [Deployment](docs/DEPLOYMENT.md).

## Project Baru dari Template

Yang wajib diganti:
- nama project
- nama container
- database lokal
- domain lokal
- `.env` lokal
- domain production frontend/API
- database production
- `APP_KEY`
- `JWT_SECRET`
- GitHub Variables
- path deployment cPanel

Tidak perlu membuat ulang workflow CI/CD.

Panduan: [New Project Checklist](docs/NEW-PROJECT.md).

## Dokumentasi

- [Local Development](docs/LOCAL-DEVELOPMENT.md)
- [Development Guide](docs/DEVELOPMENT-GUIDE.md)
- [New Project Checklist](docs/NEW-PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Template Services](docs/TEMPLATE-SERVICES.md)
- [Deployment](docs/DEPLOYMENT.md)
