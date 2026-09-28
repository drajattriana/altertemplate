# CI/CD Sehari-hari

Gunakan panduan ini setelah project sudah online dan deployment pertama berhasil.

## Alur Normal

~~~text
ubah kode di lokal
→ test di lokal
→ commit
→ push ke main
→ GitHub Actions berjalan
→ hosting diperbarui otomatis
~~~

Contoh project dalam panduan ini adalah **projecta**.

## 1. Buat Perubahan di Lokal

Kerjakan di folder:

~~~text
E:\project\alterdev\projecta
~~~

Jika perubahan membutuhkan tabel atau kolom baru, jalankan di **PowerShell lokal**:

~~~powershell
cd E:\project\alterdev\projecta
docker compose exec backend php artisan make:migration nama_migration
docker compose exec backend php artisan migrate
~~~

Perintah pertama membuat file migration; perintah kedua mengujinya pada PostgreSQL lokal. Jangan mengubah struktur database production langsung dari cPanel atau phpPgAdmin.

## 2. Test Sebelum Push

Jalankan di **PowerShell lokal**, dari folder project:

~~~powershell
cd E:\project\alterdev\projecta
docker compose exec frontend npm run build
docker compose exec backend php artisan test
~~~

Fungsinya: memastikan frontend dapat dibangun dan test backend berhasil sebelum kode dikirim.

## 3. Commit dan Push

Masih di **PowerShell lokal**, folder project:

~~~powershell
git status
git add PATH_FILE_YANG_DIUBAH
git commit -m "FE:feat/create-menu"
git push origin main
~~~

Ganti **PATH_FILE_YANG_DIUBAH** dengan file yang benar. Periksa hasil **git status** agar file **.env**, password, atau file yang tidak terkait tidak ikut.

Push ke branch **main** otomatis memulai GitHub Actions jika variable **DEPLOY_ENABLED=true**.

## 4. Pantau Deployment

Buka **GitHub repository → Actions → Deploy Production**.

Workflow akan:

1. menguji Laravel dengan PostgreSQL;
2. membangun frontend;
3. mengunggah backend dan frontend;
4. menjalankan migration production;
5. memperbarui cache Laravel.

Tunggu sampai seluruh step berwarna hijau, lalu periksa frontend dan API.

## 5. Migration dan Seeder

Migration dijalankan otomatis oleh CI/CD untuk mengubah struktur database.

Seeder tidak otomatis dijalankan setiap push agar data production tidak terduplikasi. Jika seeder memang diperlukan, jalankan melalui **SSH hosting**:

~~~bash
cd /home/alterdev/apps/projecta
PHP_BIN=/opt/cpanel/ea-php83/root/usr/bin/php
"$PHP_BIN" artisan db:seed --force
~~~

Data user, transaksi, dan data operasional tetap berada di PostgreSQL production. Data lokal tidak disalin ke production.

## 6. Jika Deployment Gagal

Buka step merah di **GitHub Actions**, baca error terakhir, perbaiki sumbernya di lokal, lalu commit dan push ulang.

Periksa sesuai jenis error:

- **build**: dependency atau kode frontend/backend;
- **SSH/SCP**: host, port, key, atau permission;
- **migration**: file migration atau koneksi database;
- **could not find driver**: nilai **PHP_BIN** atau ekstensi **pdo_pgsql**;
- **authentication failed**: credential PostgreSQL di file **.env** hosting.

Jangan menjalankan ulang workflow berkali-kali sebelum sumber error diperbaiki.

## 7. Menghentikan Deployment Sementara

Kerjakan di **GitHub → Settings → Secrets and variables → Actions → Variables**:

~~~text
DEPLOY_ENABLED=false
~~~

Fungsinya: push tetap masuk ke GitHub, tetapi job deployment tidak dijalankan.

Untuk mengaktifkan kembali:

~~~text
DEPLOY_ENABLED=true
~~~

## File yang Tidak Boleh Di-push

~~~text
.env
password atau token
SSH private key
vendor
node_modules
dist
database dump production
~~~
