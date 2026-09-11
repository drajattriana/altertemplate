# Template Services

`template_services` adalah infrastruktur bersama untuk **development lokal**.

## Service

| Service | Target |
| --- | --- |
| Docker network | `template_services_template_network` |
| MySQL | `mysql:3306` |
| Redis | `redis:6379` |
| phpMyAdmin | `localhost:8081` |
| Reverse proxy | port 80 |

## Urutan Menjalankan

```powershell
cd E:\project\alterdev\template_services
docker compose up -d

cd E:\project\alterdev\altertemplate
docker compose up -d
```

## Reverse Proxy

Contoh:

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
    }
}

server {
    listen 80;
    server_name api.altertemplate.local;

    location / {
        set $upstream http://altertemplate_nginx_backend:80;
        proxy_pass $upstream;
        proxy_set_header Host $host;
    }
}
```

Setelah mengubah Nginx:

```powershell
docker compose exec nginx_proxy nginx -t
docker compose restart nginx_proxy
```

## Project Baru

Wajib unik:

```text
database
domain lokal
container name
config Nginx
```

Contoh:

```text
projeka.local
api.projeka.local

projeka_frontend
projeka_backend
projeka_nginx_backend
projeka_queue
```

## Batas Tanggung Jawab

Project repository:

```text
source aplikasi
Docker Compose aplikasi
Laravel
React
migration
seeder
CI/CD
```

`template_services`:

```text
MySQL
Redis
phpMyAdmin
reverse proxy
network bersama
virtual host development
```

Jangan simpan `.env`, password, private key, atau dump production di Git.
