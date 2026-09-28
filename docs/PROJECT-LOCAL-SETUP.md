# Setup Project Baru di Lokal

Tutorial ini memakai contoh berikut:

```text
Repository sumber : altertemplate
Project baru      : projecta
Folder lokal      : E:\project\alterdev\projecta
Frontend          : http://projecta.local
API               : http://api.projecta.local
Database          : projecta
```

Ganti `projecta` dengan nama project sebenarnya.

## 1. Clone Repository Sumber

Jalankan di **PowerShell lokal**, dari folder `E:\project\alterdev`:

```powershell
cd E:\project\alterdev
git clone URL_REPOSITORY_ALTERTEMPLATE projecta
cd projecta
git remote remove origin
git remote add origin URL_REPOSITORY_PROJECTA
git remote -v
```

Fungsinya: menyalin Altertemplate ke folder `projecta`, lalu menghubungkannya ke repository GitHub milik Project A.

## 2. Ganti Identitas Docker

Buka file lokal:

```text
E:\project\alterdev\projecta\docker-compose.yml
```

Ganti nilai berikut:

```text
altertemplate_backend       → projecta_backend
altertemplate_nginx_backend → projecta_nginx_backend
altertemplate_frontend      → projecta_frontend
altertemplate_queue         → projecta_queue
DB_DATABASE=altertemplate   → DB_DATABASE=projecta
```

Ada dua `DB_DATABASE`: satu untuk service `backend` dan satu untuk `queue`. Jangan mengubah:

```text
DB_HOST=postgres
REDIS_HOST=redis
template_services_template_network
```

Fungsinya: mencegah nama container dan database bertabrakan dengan project lain.

## 3. Jalankan Service Bersama dan Buat Database

Jalankan di **PowerShell lokal**, dari repository `template_services`:

```powershell
cd E:\project\alterdev\template_services
docker compose up -d
docker compose exec postgres createdb -U postgres projecta
```

Fungsinya: menjalankan PostgreSQL, Redis, dan Nginx bersama, lalu membuat database `projecta`. Jika database sudah ada, abaikan error `already exists`.

## 4. Atur Backend

Jalankan di **PowerShell lokal**, dari folder project:

```powershell
cd E:\project\alterdev\projecta
Copy-Item backend\.env.example backend\.env
```

Fungsinya: membuat konfigurasi lokal Laravel. File `.env` tidak boleh di-commit.

Buka file:

```text
E:\project\alterdev\projecta\backend\.env
```

Pastikan nilai utamanya:

```env
APP_NAME=ProjectA
APP_ENV=local
APP_DEBUG=true
APP_URL=http://api.projecta.local
FRONTEND_URL=http://projecta.local

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=projecta
DB_USERNAME=postgres
DB_PASSWORD=root
DB_SSLMODE=prefer

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379
```

Sesuaikan juga file `backend/.env.example` dengan nama database dan URL baru agar anggota tim mendapat contoh yang benar.

## 5. Atur Frontend

Buat atau buka file lokal:

```text
E:\project\alterdev\projecta\frontend\.env
```

Isi:

```env
VITE_API_URL=http://api.projecta.local/api
```

Kemudian buka `frontend/vite.config.js` dan pastikan host berikut diizinkan:

```js
allowedHosts: [
  'projecta.local',
  'localhost',
]
```

Fungsinya: mengarahkan frontend ke API lokal dan mengizinkan domain `projecta.local`.

## 6. Daftarkan Domain Lokal Windows

Buka **Notepad sebagai Administrator**, lalu buka file:

```text
C:\Windows\System32\drivers\etc\hosts
```

Tambahkan:

```text
127.0.0.1 projecta.local
127.0.0.1 api.projecta.local
```

Setelah disimpan, jalankan di **PowerShell lokal**:

```powershell
ipconfig /flushdns
```

Fungsinya: membuat kedua domain lokal mengarah ke komputer sendiri.

## 7. Buat Konfigurasi Nginx Lokal

Jalankan di **PowerShell lokal**:

```powershell
Copy-Item E:\project\alterdev\template_services\nginx\conf.d\altertemplate.conf E:\project\alterdev\template_services\nginx\conf.d\projecta.conf
```

Fungsinya: membuat konfigurasi reverse proxy Project A dari contoh Altertemplate.

Buka file:

```text
E:\project\alterdev\template_services\nginx\conf.d\projecta.conf
```

Ganti semua nilai berikut:

```text
altertemplate.local             → projecta.local
api.altertemplate.local         → api.projecta.local
altertemplate_frontend          → projecta_frontend
altertemplate_nginx_backend     → projecta_nginx_backend
```

File ini berada di repository `template_services`, bukan di repository `projecta`.

## 8. Jalankan Container Project

Jalankan di **PowerShell lokal**, dari folder project:

```powershell
cd E:\project\alterdev\projecta
docker compose up -d --build
docker compose ps
```

Fungsinya: membangun dan menjalankan backend, frontend, queue, dan Nginx backend Project A.

## 9. Inisialisasi Laravel

Masih di **PowerShell lokal**, folder `E:\project\alterdev\projecta`:

```powershell
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan jwt:secret
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan optimize:clear
```

Fungsinya: membuat `APP_KEY`, membuat `JWT_SECRET`, menyiapkan tabel, mengisi data awal, dan membersihkan cache Laravel.

## 10. Aktifkan Reverse Proxy

Jalankan di **PowerShell lokal**, dari repository `template_services`:

```powershell
cd E:\project\alterdev\template_services
docker compose exec nginx_proxy nginx -t
docker compose restart nginx_proxy
```

`nginx -t` memeriksa konfigurasi. Restart hanya dilakukan setelah hasil pemeriksaan berhasil.

Jika Nginx gagal:

```powershell
docker compose logs --tail=100 nginx_proxy
```

## 11. Verifikasi

Buka di browser lokal:

```text
http://projecta.local
http://api.projecta.local/up
```

Pastikan:

- frontend terbuka;
- endpoint API `/up` berhasil;
- login JWT berhasil;
- dashboard, role, permission, dan menu dapat digunakan.
