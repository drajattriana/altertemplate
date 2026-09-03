# Panduan Deployment ke Server

Dokumen ini adalah arah deployment production untuk satu VPS/server Docker. Konfigurasi production belum tersedia di repository; jangan menganggap `docker-compose.yml` development sudah aman untuk internet.

## Perbedaan development dan production

| Bagian | Development saat ini | Production yang diperlukan |
| --- | --- | --- |
| Frontend | Vite dev server | Hasil `npm run build` dilayani Nginx/static host |
| Source code | Bind mount dari host | Disalin ke image yang immutable |
| Laravel | Dependency development ikut terpasang | Composer `--no-dev` dan autoloader optimized |
| Debug | `APP_DEBUG=true` | `APP_DEBUG=false` |
| Database | User root/password sederhana | User khusus dengan password kuat |
| Trafik | HTTP lokal | HTTPS publik |
| Database/Redis | Port dapat dibuka ke host | Tidak diekspos ke internet |
| phpMyAdmin | Selalu aktif | Dimatikan atau sangat dibatasi |

[Dokumentasi Vite](https://vite.dev/guide/static-deploy) menjelaskan bahwa hasil production default berada di folder `dist` dan `vite preview` bukan server production. [Dokumentasi Laravel](https://laravel.com/framework/docs/12.x/deployment) juga mewajibkan debug dimatikan pada production dan merekomendasikan cache optimasi saat deployment.

## Arsitektur production yang disarankan

```text
Internet
   |
DNS: alterdev.com dan api.alterdev.com
   |
Firewall: hanya 22, 80, dan 443
   |
Reverse proxy + TLS (template_services production)
   |                              |
   |                              +--> frontend Nginx (static dist)
   |
   +--> backend Nginx --> PHP-FPM Laravel --> MySQL
                                      |
                                      +--> Redis --> queue worker
```

Repository tetap dipisah:

```text
/opt/alterdev/template_services
/opt/alterdev/altertemplate
```

`template_services` mengelola proxy, TLS, MySQL, Redis, network, dan backup. `altertemplate` mengelola image aplikasi, migration, queue, dan frontend.

## Pekerjaan yang harus dibuat sebelum deployment pertama

### 1. Compose production

Buat file terpisah, misalnya `docker-compose.production.yml`. Jangan mengubah Compose development menjadi production karena developer lokal masih membutuhkannya.

Compose production perlu:

- menghapus bind mount source code;
- memakai image hasil build;
- menetapkan `restart: unless-stopped` atau kebijakan yang sesuai;
- memasukkan konfigurasi melalui environment/secrets server;
- menyediakan healthcheck;
- memakai network external dengan nama eksplisit;
- tidak membuka port database dan Redis ke publik.

Docker merekomendasikan override Compose khusus production dan menghapus bind mount source code untuk deployment. Lihat [Use Compose in production](https://docs.docker.com/compose/how-tos/production/).

### 2. Image frontend production

Gunakan multi-stage Dockerfile:

1. stage Node menjalankan `npm ci` dan `npm run build`;
2. stage Nginx hanya menyalin `frontend/dist`;
3. Nginx menyediakan fallback SPA agar `/login` dapat dibuka langsung.

Konsep fallback Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Tanpa fallback tersebut, refresh langsung pada `/login` dapat menghasilkan 404 dari Nginx.

### 3. Image backend production

Image backend production sebaiknya menjalankan:

```text
composer install --no-dev --classmap-authoritative --no-interaction
```

Source code berada di image, sedangkan hanya folder yang benar-benar perlu persisten yang dijadikan volume. Pastikan proses PHP dapat menulis ke `storage` dan `bootstrap/cache`, sesuai [panduan deployment Laravel](https://laravel.com/framework/docs/12.x/deployment#directory-permissions).

### 4. Secret production

Jangan commit `.env.production`. Simpan konfigurasi di server atau secret manager.

Contoh variabel yang wajib diisi:

```env
APP_NAME=Alterdev
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.alterdev.com
APP_KEY=base64:HASIL_KEY_YANG_AMAN

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=altertemplate
DB_USERNAME=altertemplate_app
DB_PASSWORD=PASSWORD_ACAK_YANG_KUAT

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PASSWORD=PASSWORD_REDIS
REDIS_PORT=6379
```

Jangan menggunakan nilai contoh di atas sebagai password sebenarnya. Docker menyarankan penggunaan secret dan pemisahan konfigurasi tiap environment dalam [best practices environment variables](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/).

Jika frontend membutuhkan API, tambahkan konfigurasi build frontend seperti:

```env
VITE_API_URL=https://api.alterdev.com
```

Nilai `VITE_*` akan masuk ke bundle browser dan tidak boleh berisi secret.

## Deployment pertama

### 1. Siapkan server

Minimal:

- Linux server yang masih didukung;
- Docker Engine dan Docker Compose plugin;
- Git;
- firewall;
- domain yang dapat dikelola DNS-nya;
- lokasi backup di luar volume utama.

### 2. Atur DNS

Buat A/AAAA record:

```text
alterdev.com      -> IP server
api.alterdev.com  -> IP server
```

Gunakan domain sebenarnya milik Anda. Jangan memakai `.local` pada production.

### 3. Clone repository

```bash
sudo mkdir -p /opt/alterdev
sudo chown "$USER":"$USER" /opt/alterdev
cd /opt/alterdev
git clone URL_TEMPLATE_SERVICES template_services
git clone URL_ALTERTEMPLATE altertemplate
```

### 4. Buat database dan user khusus

Masuk ke MySQL secara interaktif agar password tidak tersimpan dalam shell history:

```bash
cd /opt/alterdev/template_services
docker compose exec mysql mysql -uroot -p
```

Kemudian buat database dan user dengan password acak yang kuat:

```sql
CREATE DATABASE altertemplate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'altertemplate_app'@'%' IDENTIFIED BY 'GANTI_DENGAN_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON altertemplate.* TO 'altertemplate_app'@'%';
FLUSH PRIVILEGES;
```

### 5. Buat konfigurasi production

Buat file environment langsung di server dan batasi permission:

```bash
cd /opt/alterdev/altertemplate
cp backend/.env.example backend/.env
chmod 600 backend/.env
```

Edit seluruh nilai production sebelum container dipublikasikan.

`APP_KEY` harus dibuat satu kali lalu disimpan tetap. Mengganti key pada aplikasi berjalan dapat merusak session dan data terenkripsi.

### 6. Build dan jalankan

Setelah file production Compose tersedia:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml build
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### 7. Jalankan migration dan optimasi

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan migrate --force
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan optimize
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan reload
```

`php artisan reload` memastikan proses jangka panjang seperti queue worker menggunakan kode terbaru.

### 8. Aktifkan HTTPS

TLS dikelola pada reverse proxy production di `template_services`. Pastikan:

- sertifikat diperbarui otomatis;
- HTTP dialihkan ke HTTPS;
- header `X-Forwarded-Proto` diteruskan ke Laravel;
- domain API dan frontend memiliki sertifikat valid.

### 9. Verifikasi

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml ps
docker compose -f docker-compose.yml -f docker-compose.production.yml logs --tail=100 backend
docker compose -f docker-compose.yml -f docker-compose.production.yml logs --tail=100 queue
curl -I https://alterdev.com
curl -I https://api.alterdev.com/up
```

Laravel menyediakan health route `/up` secara default untuk memastikan aplikasi dapat boot dengan benar.

## Deployment update berikutnya

Jalankan hanya setelah backup tersedia:

```bash
cd /opt/alterdev/altertemplate
git pull --ff-only
docker compose -f docker-compose.yml -f docker-compose.production.yml build
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan migrate --force
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan optimize
docker compose -f docker-compose.yml -f docker-compose.production.yml exec backend php artisan reload
```

Untuk production yang lebih matang, gunakan tag image/version agar rollback aplikasi tidak bergantung pada keadaan working tree server.

## Backup

Backup minimal meliputi:

- dump MySQL terjadwal;
- file upload/storage yang bersifat persisten;
- konfigurasi production dan key secara terenkripsi;
- salinan backup di mesin/lokasi berbeda;
- uji restore berkala.

Jangan menganggap volume Docker sebagai backup.

## Checklist sebelum go-live

- [ ] Production Dockerfile dan Compose sudah dibuat dan diuji
- [ ] Frontend memakai static build, bukan Vite dev server
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] Secret tidak berada di Git
- [ ] Database memakai user khusus, bukan root
- [ ] MySQL, Redis, dan phpMyAdmin tidak terbuka ke internet
- [ ] HTTPS valid dan auto-renew aktif
- [ ] Migration berhasil
- [ ] Queue worker aktif
- [ ] `/up` mengembalikan status 200
- [ ] Refresh route frontend seperti `/login` tidak 404
- [ ] Backup dan restore sudah diuji
- [ ] Monitoring uptime dan log tersedia

## Yang belum tersedia di repository ini

Panduan ini mendefinisikan target production, tetapi beberapa artifact masih perlu dibuat sebelum hosting:

- `frontend/Dockerfile.production`;
- konfigurasi Nginx static frontend;
- `backend/Dockerfile.production`;
- `docker-compose.production.yml`;
- secret production;
- konfigurasi TLS di `template_services` production;
- CI/CD opsional.

Jangan melakukan deployment publik sebelum daftar tersebut selesai.
