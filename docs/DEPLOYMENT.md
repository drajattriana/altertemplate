# Deployment Production

Production memakai **GitHub Actions + SSH/SCP ke cPanel/shared hosting**.

Composer tidak wajib tersedia di hosting karena dependency backend dibangun di GitHub Actions.

## Alur

```text
git push main
    ↓
GitHub Actions
    ├── PHP 8.4 + Composer
    ├── composer install --no-dev
    ├── Node 20
    └── npm ci + npm run build
    ↓
SSH / SCP
    ↓
cPanel
    ├── Laravel: /home/USER/apps/PROJECT
    └── React dist: /home/USER/FRONTEND_DOMAIN
```

API document root wajib:

```text
/home/USER/apps/PROJECT/public
```

## Prasyarat

- cPanel dengan SSH
- PHP 8.4 atau kompatibel
- MySQL
- domain frontend + API
- SSL aktif
- GitHub repository
- SSH key deployment

## Struktur Hosting

Contoh `projeka`:

```text
/home/alterdev/
├── apps/
│   └── projeka/
│       ├── public/
│       ├── storage/
│       ├── vendor/
│       ├── artisan
│       └── .env
└── projeka.alterdev.id/
```

Domain:

```text
Frontend : https://projeka.alterdev.id
API      : https://api-projeka.alterdev.id
```

API document root:

```text
/home/alterdev/apps/projeka/public
```

## GitHub Secrets

```text
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
```

## GitHub Variables

```text
DEPLOY_ENABLED=false
SSH_PORT=57103
PHP_BIN=/usr/local/bin/php

BACKEND_PATH=/home/alterdev/apps/projeka
FRONTEND_PATH=/home/alterdev/projeka.alterdev.id
VITE_API_URL=https://api-projeka.alterdev.id/api
```

Gunakan `DEPLOY_ENABLED=false` saat setup.

## `.env` Production

Lokasi:

```text
/home/alterdev/apps/projeka/.env
```

Minimal:

```env
APP_NAME=Projeka
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api-projeka.alterdev.id

FRONTEND_URL=https://projeka.alterdev.id

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=alterdev_projeka
DB_USERNAME=alterdev_projekauser
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

JWT_SECRET=
```

Generate key:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
openssl rand -hex 32
```

Set permission:

```bash
chmod 600 /home/alterdev/apps/projeka/.env
```

`APP_KEY` dan `JWT_SECRET` dibuat sekali per project.

## Database Production

Buat database + database user lalu assign:

```text
ALL PRIVILEGES
```

Tes:

```bash
cd /home/alterdev/apps/projeka
/usr/local/bin/php artisan config:clear
/usr/local/bin/php artisan migrate:status
```

Jika DB baru, `Migration table not found` masih normal.

## First Deployment

Ubah:

```text
DEPLOY_ENABLED=true
```

Jalankan:

```text
GitHub → Actions → Deploy Production → Run workflow → main
```

Pipeline otomatis menjalankan migration production.

Sesudah berhasil:

```text
https://projeka.alterdev.id
https://api-projeka.alterdev.id/up
```

Jika butuh data awal:

```bash
cd /home/alterdev/apps/projeka
/usr/local/bin/php artisan db:seed --force
```

Seeder biasanya cukup dijalankan saat first deployment.

## Update Berikutnya

```text
ubah source
→ test
→ commit
→ push main
→ GitHub Actions
→ migrate --force
→ deploy
```

Migration = schema. Seeder = data bawaan. Data input user tidak disinkronkan dari lokal.

## Checklist Go-Live

- [ ] Domain frontend aktif
- [ ] Domain API aktif
- [ ] SSL valid
- [ ] API document root ke `/public`
- [ ] Database + user dibuat
- [ ] ALL PRIVILEGES diberikan
- [ ] `.env` production terisi
- [ ] `APP_KEY` terisi
- [ ] `JWT_SECRET` terisi
- [ ] `APP_DEBUG=false`
- [ ] `FRONTEND_URL` benar
- [ ] `VITE_API_URL` benar
- [ ] GitHub Secrets benar
- [ ] GitHub Variables benar
- [ ] Migration berhasil
- [ ] Seeder awal dijalankan jika diperlukan
- [ ] Login production berhasil
