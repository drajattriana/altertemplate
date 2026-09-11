# New Project Checklist

Checklist saat membuat project baru dari Altertemplate.

Contoh:

```text
Project  : projeka
Frontend : projeka.alterdev.id
API      : api-projeka.alterdev.id
```

## 1. Repository

Buat project baru dari Altertemplate lalu hubungkan ke repository GitHub baru.

**CI/CD tidak perlu dibuat ulang.**

## 2. Development Lokal

Ganti:

```text
nama container
database lokal
domain lokal
APP_NAME
APP_URL
FRONTEND_URL
VITE_API_URL
```

Contoh:

```text
projeka_backend
projeka_nginx_backend
projeka_frontend
projeka_queue

projeka.local
api.projeka.local

database: projeka
```

Update Windows hosts dan reverse proxy `template_services`.

## 3. Database Lokal

```powershell
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```

## 4. cPanel

Buat:

```text
projeka.alterdev.id
api-projeka.alterdev.id
```

Backend:

```text
/home/alterdev/apps/projeka
```

API document root:

```text
/home/alterdev/apps/projeka/public
```

Frontend root:

```text
/home/alterdev/projeka.alterdev.id
```

## 5. Database Production

Buat database + user + password lalu beri:

```text
ALL PRIVILEGES
```

## 6. `.env` Production

Lokasi:

```text
/home/alterdev/apps/projeka/.env
```

Wajib ubah:

```text
APP_NAME
APP_URL
FRONTEND_URL
DB_DATABASE
DB_USERNAME
DB_PASSWORD
APP_KEY
JWT_SECRET
```

Production:

```text
APP_ENV=production
APP_DEBUG=false
DB_HOST=localhost
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

`APP_KEY` dan `JWT_SECRET` harus baru per project.

## 7. GitHub Secrets

Jika server sama, credential deployment dapat digunakan kembali:

```text
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
```

## 8. GitHub Variables

```text
DEPLOY_ENABLED=false
SSH_PORT=57103
PHP_BIN=/usr/local/bin/php

BACKEND_PATH=/home/alterdev/apps/projeka
FRONTEND_PATH=/home/alterdev/projeka.alterdev.id
VITE_API_URL=https://api-projeka.alterdev.id/api
```

## 9. SSL

Pastikan HTTPS frontend + API aktif.

## 10. First Deploy

Ubah:

```text
DEPLOY_ENABLED=true
```

Lalu:

```text
Actions → Deploy Production → Run workflow
```

Jika butuh data awal:

```bash
cd /home/alterdev/apps/projeka
/usr/local/bin/php artisan db:seed --force
```

## 11. Verifikasi

```text
frontend terbuka
API /up aktif
login berhasil
menu sesuai role
migration berhasil
seed tersedia
refresh route React tidak 404
```

Selesai.
