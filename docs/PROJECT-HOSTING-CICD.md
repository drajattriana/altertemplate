# Setup Hosting dan CI/CD

Ikuti panduan ini setelah Project A berjalan normal di lokal.

~~~text
Project       : projecta
Frontend      : https://projecta.alterdev.id
API           : https://api-projecta.alterdev.id
Backend path  : /home/alterdev/apps/projecta
Frontend path : /home/alterdev/projecta.alterdev.id
~~~

Ganti **projecta**, domain, dan username hosting sesuai project sebenarnya.

## 1. Buat Domain di cPanel

Kerjakan di **cPanel → Domains**:

1. Buat **projecta.alterdev.id**.
2. Atur document root ke **/home/alterdev/projecta.alterdev.id**.
3. Buat **api-projecta.alterdev.id**.
4. Atur document root API ke **/home/alterdev/apps/projecta/public**.
5. Aktifkan SSL untuk kedua domain.

Fungsinya: domain frontend menunjuk ke hasil build React, sedangkan domain API wajib menunjuk ke folder Laravel **public**.

## 2. Buat PostgreSQL Production

Kerjakan di **cPanel → PostgreSQL Database Wizard**:

1. Buat database, contoh **alterdev_projecta**.
2. Buat user, contoh **alterdev_projectauser**.
3. Buat password yang kuat.
4. Hubungkan user ke database dan berikan semua privilege.

Simpan nama database, username, dan password. Nilai tersebut akan dimasukkan ke file **.env** hosting.

## 3. Atur PHP dan Ekstensi PostgreSQL

Kerjakan di **cPanel → PHP Selector**:

1. Pilih domain **api-projecta.alterdev.id**.
2. Aktifkan isolation jika tersedia.
3. Pilih PHP **8.3**.
4. Pastikan ekstensi **pdo_pgsql** dan **pgsql** aktif.

Jika frontend dan API memakai pengaturan PHP per-domain, samakan keduanya ke PHP 8.3. Backend/API adalah bagian yang wajib memiliki **pdo_pgsql**.

## 4. Pastikan PHP CLI Benar

Masuk ke hosting melalui **SSH**, lalu jalankan:

~~~bash
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
"$PHP_BIN" -v
"$PHP_BIN" -r "echo extension_loaded('pdo_pgsql') ? 'pdo_pgsql AKTIF'.PHP_EOL : 'pdo_pgsql TIDAK AKTIF'.PHP_EOL;"
~~~

Fungsinya: menentukan PHP 8.3 untuk perintah terminal dan memastikan driver PostgreSQL aktif. Gunakan path ini untuk semua perintah Artisan di hosting.

## 5. Buat File Environment Production

Kerjakan melalui **SSH hosting** atau **cPanel File Manager**. Buat file:

~~~text
/home/alterdev/apps/projecta/.env
~~~

Isi minimal:

~~~env
APP_NAME=ProjectA
APP_ENV=production
APP_KEY=base64:HASIL_GENERATE_APP_KEY
APP_DEBUG=false
APP_URL=https://api-projecta.alterdev.id
FRONTEND_URL=https://projecta.alterdev.id

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=alterdev_projecta
DB_USERNAME=alterdev_projectauser
DB_PASSWORD="PASSWORD_POSTGRESQL"
DB_SSLMODE=prefer

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
JWT_SECRET=HASIL_GENERATE_JWT_SECRET
~~~

Jangan menyisakan konfigurasi MySQL aktif. Jika ingin menyimpannya sebagai catatan, beri tanda **#** pada setiap baris:

~~~env
# DB_CONNECTION=mysql
# DB_HOST=localhost
# DB_PORT=3306
~~~

Untuk membuat nilai rahasia, jalankan melalui **SSH hosting**:

~~~bash
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
"$PHP_BIN" -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
openssl rand -hex 32
~~~

Perintah pertama menghasilkan **APP_KEY**; perintah kedua menghasilkan **JWT_SECRET**. Salin masing-masing hasil ke file **.env**, lalu amankan file:

~~~bash
chmod 600 /home/alterdev/apps/projecta/.env
~~~

## 6. Uji Koneksi PostgreSQL

Jalankan melalui **SSH hosting**:

~~~bash
cd /home/alterdev/apps/projecta
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan migrate:status
~~~

Arti hasil:

- **Migration table not found**: koneksi berhasil dan database masih baru.
- **password authentication failed**: username atau password PostgreSQL salah.
- **could not find driver**: PHP CLI yang dipakai belum memiliki **pdo_pgsql**.
- **Could not open input file: artisan**: perintah dijalankan di folder yang salah.

## 7. Atur GitHub Secrets

Buka **GitHub repository Project A → Settings → Secrets and variables → Actions → Secrets**.

Buat:

~~~text
SSH_HOST        = hostname atau IP hosting
SSH_USER        = username SSH hosting
SSH_PRIVATE_KEY = isi private key deployment
~~~

Fungsinya: memberi GitHub Actions akses SSH ke hosting. Jangan memasukkan private key ke repository.

## 8. Atur GitHub Variables

Masih di **Settings → Secrets and variables → Actions → Variables**, buat:

~~~text
DEPLOY_ENABLED=false
SSH_PORT=57103
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
BACKEND_PATH=/home/alterdev/apps/projecta
FRONTEND_PATH=/home/alterdev/projecta.alterdev.id
VITE_API_URL=https://api-projecta.alterdev.id/api
~~~

Sesuaikan **SSH_PORT** jika port SSH hosting berbeda. Biarkan **DEPLOY_ENABLED=false** sampai semua nilai selesai diperiksa.

## 9. Sesuaikan Workflow Project

Kerjakan di **komputer lokal**, buka:

~~~text
E:\project\alterdev\projecta\.github\workflows\deploy.yml
~~~

Pastikan:

~~~yaml
php-version: "8.3"
~~~

Untuk identitas yang rapi, ganti semua **altertemplate_ci** menjadi **projecta_ci**. Database ini hanya digunakan sementara saat test di GitHub Actions, bukan database production.

## 10. Aktifkan dan Jalankan Deploy Pertama

Di **GitHub Variables**, ubah:

~~~text
DEPLOY_ENABLED=true
~~~

Kemudian jalankan di **PowerShell lokal**, dari folder project:

~~~powershell
cd E:\project\alterdev\projecta
git status
git add PATH_FILE_YANG_DIUBAH
git commit -m "ALL:chore/setup-projecta-deployment"
git push origin main
~~~

Fungsinya: push ke branch **main** memicu workflow deployment. Ganti **PATH_FILE_YANG_DIUBAH** dengan file yang memang ingin di-commit; jangan menambahkan file **.env**.

Pantau di **GitHub repository → Actions → Deploy Production**. Pipeline akan:

1. menguji migration dan seeder memakai PostgreSQL;
2. membangun frontend;
3. mengunggah backend dan frontend;
4. menjalankan **migrate --force**;
5. memperbarui cache Laravel.

Jika tidak ingin push baru, workflow juga dapat dijalankan dari **Actions → Deploy Production → Run workflow → main**.

## 11. Jalankan Seeder Satu Kali

Setelah deployment pertama berstatus hijau, jalankan melalui **SSH hosting**:

~~~bash
cd /home/alterdev/apps/projecta
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
"$PHP_BIN" artisan migrate:status
"$PHP_BIN" artisan db:seed --force
"$PHP_BIN" artisan optimize:clear
~~~

Fungsinya: memastikan migration sudah masuk, mengisi data awal production, lalu membersihkan cache. Seeder awal umumnya cukup dijalankan satu kali.

## 12. Verifikasi

Buka:

~~~text
https://projecta.alterdev.id
https://api-projecta.alterdev.id/up
~~~

Pastikan frontend, API, login, role, permission, menu, dan refresh halaman React berjalan normal.
