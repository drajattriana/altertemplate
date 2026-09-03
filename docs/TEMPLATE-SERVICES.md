# Integrasi dengan Template Services

`template_services` dipisahkan dari repository aplikasi agar database, Redis, dan reverse proxy dapat digunakan bersama oleh beberapa proyek Alterdev.

## Kontrak yang dibutuhkan Altertemplate

Repository infrastruktur wajib menyediakan:

| Kebutuhan | Nama/port yang diharapkan |
| --- | --- |
| Docker network | `template_services_template_network` |
| MySQL service | `mysql:3306` |
| Redis service | `redis:6379` |
| Reverse proxy | port host `80` |
| Frontend target | `altertemplate_frontend:5173` |
| Backend target | `altertemplate_nginx_backend:80` |

Jika nama tersebut diubah di repository infrastruktur, `altertemplate/docker-compose.yml`, konfigurasi backend, dan konfigurasi proxy juga harus diperbarui bersama-sama.

## Konfigurasi reverse proxy development

Di repository `template_services`, simpan virtual host proyek sebagai:

```text
nginx/conf.d/altertemplate.conf
```

Konsep konfigurasinya:

```nginx
resolver 127.0.0.11 valid=30s ipv6=off;

server {
    listen 80;
    server_name altertemplate.local;

    location / {
        set $upstream http://altertemplate_frontend:5173;
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

server {
    listen 80;
    server_name api.altertemplate.local;

    client_max_body_size 50M;

    location / {
        set $upstream http://altertemplate_nginx_backend:80;
        proxy_pass $upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Setelah mengubah file Nginx:

```powershell
cd E:\project\alterdev\template_services
docker compose exec nginx_proxy nginx -t
docker compose restart nginx_proxy
```

Selalu jalankan `nginx -t` terlebih dahulu agar kesalahan sintaks tidak mematikan seluruh domain lokal.

## Menambahkan proyek Alterdev lain

Untuk proyek baru, ulangi pola berikut:

1. buat database baru dalam MySQL bersama;
2. buat file virtual host baru di `nginx/conf.d`;
3. hubungkan container proyek ke `template_services_template_network`;
4. gunakan nama container yang unik;
5. tambahkan domain lokal ke Windows hosts;
6. jangan menggunakan port host tambahan jika trafik melewati reverse proxy.

Contoh penamaan:

```text
namaaplikasi.local
api.namaaplikasi.local
namaaplikasi_frontend
namaaplikasi_nginx_backend
namaaplikasi_backend
```

## Batas tanggung jawab

Yang di-commit ke `altertemplate`:

- source code aplikasi;
- Compose container aplikasi;
- Nginx internal Laravel;
- `.env.example` tanpa secret;
- dokumentasi kontrak infrastruktur.

Yang di-commit ke `template_services`:

- Compose MySQL/Redis/reverse proxy;
- virtual host setiap aplikasi;
- script backup atau operasional infrastruktur;
- dokumentasi port dan network bersama.

Data database, file `.env`, private key TLS, dan password production tidak boleh disimpan di salah satu repository.

