# Altertemplate

`Altertemplate` adalah starter project Alterdev untuk membuat project baru tanpa membangun struktur dasar dari nol.

Sudah tersedia:
- React + Vite
- Laravel API
- MySQL + Redis untuk development lokal
- Docker Compose
- JWT Authentication
- Role, Permission, Dynamic Menu
- Seeder data awal
- GitHub Actions CI/CD
- Deployment ke cPanel via SSH/SCP

> `altertemplate` adalah master template. Untuk project client, buat repository baru dari template ini lalu ubah identitas projectnya.

## Yang Dibutuhkan

### Development lokal
- Git
- Docker Desktop
- repository `template_services`
- akses edit Windows `hosts`

PHP, Composer, Node.js, MySQL, dan Redis tidak wajib dipasang langsung di Windows jika memakai Docker.

### Production
- GitHub repository
- cPanel/shared hosting + SSH
- PHP kompatibel
- MySQL
- domain frontend + API
- SSL aktif

## Struktur

```text
project/
├── backend/
├── frontend/
├── mobile/
├── deploy/
├── docs/
├── nginx/
├── .github/workflows/
└── docker-compose.yml
```

`template_services` menyediakan MySQL, Redis, phpMyAdmin, Nginx reverse proxy development, dan Docker network bersama.

# Daftar Isi

## 1. Membuat Project Baru dan Menjalankannya di Lokal

Gunakan saat baru membuat project dari Altertemplate.

➡️ [PROJECT-LOCAL-SETUP.md](docs/PROJECT-LOCAL-SETUP.md)

```text
clone template
→ ganti repository
→ rename Docker
→ buat database
→ atur .env
→ atur domain lokal
→ reverse proxy
→ migrate + seed
→ test
```

## 2. Hosting Project Baru + Setup CI/CD

Gunakan setelah local berjalan normal.

➡️ [PROJECT-HOSTING-CICD.md](docs/PROJECT-HOSTING-CICD.md)

```text
domain + SSL
→ database production
→ .env production
→ GitHub Secrets/Variables
→ first deploy
→ seed production
```

## 3. CI/CD Sehari-hari

Gunakan setelah project sudah online.

➡️ [CICD-DAILY.md](docs/CICD-DAILY.md)

```text
coding
→ test
→ commit
→ push main
→ GitHub Actions
→ production update
```

## 4. Aturan Development

➡️ [DEVELOPMENT-GUIDE.md](docs/DEVELOPMENT-GUIDE.md)

Mencakup `FE / BF / MB / ALL`, `feat / fix / refactor / docs / chore`, format branch/commit, migration vs seeder, command harian, dan aturan comment.
