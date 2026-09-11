# Project Local Setup

Gunakan tutorial ini setiap kali membuat project baru dari Altertemplate.

Contoh:

```text
Project  : mitrakita
Frontend : http://mitrakita.local
API      : http://api.mitrakita.local
Database : mitrakita
```

Ganti `mitrakita` sesuai nama project.

## 1. Buat Repository Baru

```powershell
cd E:\project\alterdev
git clone URL_REPOSITORY_ALTERTEMPLATE mitrakita
cd mitrakita

git remote remove origin
git remote add origin URL_REPOSITORY_MITRAKITA
git remote -v
```

## 2. Ubah Docker Compose

Buat unik:

```text
altertemplate_backend       → mitrakita_backend
altertemplate_nginx_backend → mitrakita_nginx_backend
altertemplate_frontend      → mitrakita_frontend
altertemplate_queue         → mitrakita_queue
DB_DATABASE=altertemplate   → DB_DATABASE=mitrakita
```

Tetap:

```text
DB_HOST=mysql
REDIS_HOST=redis
template_services_template_network
```

## 3. Buat Database Lokal

```powershell
cd E:\project\alterdev\template_services
docker compose up -d

docker compose exec mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS mitrakita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 4. Backend `.env`

```powershell
cd E:\project\alterdev\mitrakita
Copy-Item backend\.env.example backend\.env
```

Minimal:

```env
APP_NAME=Mitrakita
APP_ENV=local
APP_DEBUG=true
APP_URL=http://api.mitrakita.local
FRONTEND_URL=http://mitrakita.local

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=mitrakita
DB_USERNAME=root
DB_PASSWORD=root

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379
```

Update juga `backend/.env.example`. Jangan commit `.env`.

## 5. Frontend

`frontend/.env`:

```env
VITE_API_URL=http://api.mitrakita.local/api
```

Di `frontend/vite.config.ts`:

```ts
allowedHosts: [
  'mitrakita.local',
  'localhost',
],
```

## 6. Windows Hosts

Buka Notepad sebagai Administrator lalu edit:

```text
C:\Windows\System32\drivers\etc\hosts
```

Tambahkan:

```text
127.0.0.1 mitrakita.local
127.0.0.1 api.mitrakita.local
```

Lalu:

```powershell
ipconfig /flushdns
```

## 7. Reverse Proxy Development

Buat:

```text
template_services/nginx/conf.d/mitrakita.conf
```

```nginx
# FRONTEND
server {
    listen 80;
    server_name mitrakita.local;

    location / {
        set $upstream http://mitrakita_frontend:5173;
        proxy_pass $upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# BACKEND API
server {
    listen 80;
    server_name api.mitrakita.local;
    client_max_body_size 50M;

    location / {
        set $upstream http://mitrakita_nginx_backend:80;
        proxy_pass $upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Catatan `resolver`

Jika `resolver 127.0.0.11...` sudah ada di config lain/global, jangan tulis lagi di config project.

Jika muncul:

```text
"resolver" directive is duplicate
```

hapus baris `resolver` dari config project.

## 8. Jalankan Docker Project

```powershell
cd E:\project\alterdev\mitrakita
docker compose up -d --build
docker compose ps
```

Target:

```text
mitrakita_backend
mitrakita_nginx_backend
mitrakita_frontend
mitrakita_queue
```

## 9. Inisialisasi Laravel

```powershell
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan jwt:secret
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan optimize:clear
```

## 10. Aktifkan Reverse Proxy

```powershell
cd E:\project\alterdev\template_services
docker compose exec nginx_proxy nginx -t
docker compose restart nginx_proxy
```

Jika proxy restart-loop:

```powershell
docker compose logs --tail=100 nginx_proxy
```

## 11. Test

```text
http://mitrakita.local
http://api.mitrakita.local/up
```

Test login, role, permission, menu, dashboard, dan API.

## Checklist

- [ ] repository baru
- [ ] remote Git baru
- [ ] container unik
- [ ] database lokal
- [ ] backend `.env`
- [ ] `.env.example`
- [ ] frontend `.env`
- [ ] Vite allowedHosts
- [ ] Windows hosts
- [ ] reverse proxy
- [ ] Docker berjalan
- [ ] APP_KEY
- [ ] JWT_SECRET
- [ ] migration
- [ ] seeder
- [ ] frontend + API normal
