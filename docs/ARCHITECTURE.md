# Konsep Arsitektur Altertemplate

Dokumen ini menjelaskan alasan proyek dipisah menjadi repository aplikasi dan repository infrastruktur bersama.

## Dua repository, dua tanggung jawab

### `altertemplate`

Repository aplikasi yang sedang Anda baca. Isinya:

- React/Vite untuk halaman web;
- Laravel/PHP-FPM untuk backend dan API;
- queue worker Laravel;
- Nginx internal untuk meneruskan request API ke PHP-FPM;
- React Native sebagai proyek mobile opsional.

Repository ini dapat dikembangkan dan dirilis tanpa menyimpan data MySQL di dalam Git.

### `template_services`

Repository infrastruktur lokal/bersama. Isinya:

- MySQL;
- Redis;
- phpMyAdmin;
- Nginx reverse proxy;
- konfigurasi domain untuk setiap proyek Alterdev.

Satu `template_services` dapat digunakan oleh beberapa proyek. Setiap proyek aplikasi memiliki database sendiri, tetapi dapat memakai container MySQL dan Redis yang sama.

## Aliran request frontend

```text
1. Browser membuka http://altertemplate.local
2. Windows hosts mengarahkan domain ke 127.0.0.1
3. service_nginx_proxy menerima request pada port 80
4. altertemplate.conf memilih server_name altertemplate.local
5. Request diteruskan ke altertemplate_frontend:5173
6. Vite mengirim aplikasi React ke browser
```

Container frontend tidak perlu membuka port langsung ke Windows karena reverse proxy dan frontend berada dalam network Docker yang sama.

## Aliran request backend

```text
1. Browser membuka http://api.altertemplate.local
2. service_nginx_proxy meneruskan request ke altertemplate_nginx_backend:80
3. Nginx backend meneruskan file PHP ke altertemplate_backend:9000
4. Laravel memproses request
5. Laravel dapat mengakses mysql:3306 dan redis:6379
```

## Network Docker

`altertemplate/docker-compose.yml` menyatakan network berikut sebagai external:

```yaml
networks:
  template_services_template_network:
    external: true
```

Artinya repository ini tidak membuat network tersebut. Network harus lebih dahulu dibuat oleh Compose milik `template_services`.

Nama default network Docker Compose merupakan gabungan nama project dan nama network:

```text
template_services + template_network = template_services_template_network
```

Karena itu, jalankan `template_services` terlebih dahulu dan jangan sembarang mengganti project name Compose. Untuk server jangka panjang, sebaiknya beri network nama eksplisit di repository infrastruktur agar tidak bergantung pada nama folder.

## Container aplikasi

| Container | Fungsi | Akses |
| --- | --- | --- |
| `altertemplate_frontend` | Vite dev server dan React | Melalui reverse proxy |
| `altertemplate_backend` | Laravel/PHP-FPM | Internal pada port 9000 |
| `altertemplate_nginx_backend` | Web server Laravel | Melalui reverse proxy |
| `altertemplate_queue` | Memproses queue Laravel | Internal |

## Penyimpanan data

- Source code di-bind mount dari komputer ke container.
- `backend/vendor` menggunakan volume container agar dependency sesuai Linux container.
- `frontend/node_modules` menggunakan volume container agar dependency sesuai Linux container.
- Database disimpan oleh volume `mysql_data` milik `template_services`.
- Redis disimpan oleh volume `redis_data` milik `template_services`.

Menghapus container aplikasi tidak menghapus database. Namun menjalankan `docker compose down -v` di `template_services` dapat menghapus volume data dan harus dilakukan dengan sangat hati-hati.

## Kondisi autentikasi

Route frontend `/login` dan `/admin` sudah tersedia. Untuk sementara, login menggunakan username `admin` dan password `admin`, lalu menyimpan status login pada browser. Route guard frontend mencegah akses biasa ke dashboard tanpa status tersebut.

Cara ini hanya cocok untuk demonstrasi layout. Kredensial berada di source frontend dan dapat dilihat oleh siapa pun, sehingga belum boleh dianggap sebagai autentikasi sungguhan atau digunakan di production. Backend belum memiliki endpoint login.

Tahap implementasi autentikasi nantinya minimal mencakup:

1. memilih metode autentikasi Laravel, misalnya Sanctum;
2. membuat endpoint login, logout, dan profil pengguna;
3. mengatur CORS dan cookie/session domain;
4. menyimpan state pengguna di frontend;
5. melindungi route dashboard;
6. menambahkan rate limiting dan pengujian.
