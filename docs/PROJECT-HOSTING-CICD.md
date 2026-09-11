# Project Hosting + CI/CD Setup

Gunakan setelah project lokal berjalan normal.

Contoh:

```text
Project  : mitrakita
Frontend : https://mitrakita.alterdev.id
API      : https://api-mitrakita.alterdev.id
```

## 1. Domain + Folder cPanel

```text
Frontend root:
/home/alterdev/mitrakita.alterdev.id

Laravel root:
/home/alterdev/apps/mitrakita

API document root:
/home/alterdev/apps/mitrakita/public
```

API harus menunjuk ke folder `/public`.

## 2. Database Production

Buat database, user, password, lalu assign user dengan `ALL PRIVILEGES`.

Contoh:

```text
DB_DATABASE=alterdev_mitrakita
DB_USERNAME=alterdev_mitrakitauser
```

## 3. `.env` Production

Lokasi:

```text
/home/alterdev/apps/mitrakita/.env
```

```env
APP_NAME=Mitrakita
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api-mitrakita.alterdev.id
FRONTEND_URL=https://mitrakita.alterdev.id

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=alterdev_mitrakita
DB_USERNAME=alterdev_mitrakitauser
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
JWT_SECRET=
```

Generate:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
openssl rand -hex 32
```

Lalu:

```bash
chmod 600 /home/alterdev/apps/mitrakita/.env
```

## 4. Test Database

```bash
cd /home/alterdev/apps/mitrakita
/usr/local/bin/php artisan config:clear
/usr/local/bin/php artisan migrate:status
```

`Migration table not found` normal untuk DB baru. `Access denied` berarti user/privilege DB belum benar.

## 5. GitHub Secrets

```text
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
```

## 6. GitHub Variables

```text
DEPLOY_ENABLED=false
SSH_PORT=57103
PHP_BIN=/usr/local/bin/php
BACKEND_PATH=/home/alterdev/apps/mitrakita
FRONTEND_PATH=/home/alterdev/mitrakita.alterdev.id
VITE_API_URL=https://api-mitrakita.alterdev.id/api
```

## 7. SSL

Pastikan frontend dan API sudah HTTPS valid.

## 8. First Deploy

Ubah:

```text
DEPLOY_ENABLED=true
```

Jalankan:

```text
GitHub → Actions → Deploy Production → Run workflow → main
```

Pipeline menjalankan build, upload, `migrate --force`, cache Laravel, dan deploy frontend.

## 9. Seeder Production

Jika butuh data awal:

```bash
cd /home/alterdev/apps/mitrakita
/usr/local/bin/php artisan db:seed --force
```

Seeder biasanya cukup saat first deployment.

## 10. Verifikasi

- [ ] frontend terbuka
- [ ] API `/up` aktif
- [ ] login berhasil
- [ ] role/menu benar
- [ ] migration berhasil
- [ ] seed tersedia
- [ ] refresh route React tidak 404
