# Altertemplate

`Altertemplate` adalah repository sumber untuk membuat project Alterdev baru tanpa menyusun struktur dasar dari awal.

Sudah tersedia:

- React + Vite
- Laravel API
- PostgreSQL 16 + Redis
- Docker Compose
- JWT Authentication
- Role, permission, dan dynamic menu
- GitHub Actions CI/CD
- Deployment ke cPanel melalui SSH

> Nama `altertemplate` hanya dipakai untuk repository sumber. Semua contoh project baru dalam dokumentasi memakai nama `projecta`.

## Kebutuhan

### Komputer lokal

- Git
- Docker Desktop
- repository `template_services`
- izin Administrator untuk mengubah Windows `hosts`

PHP, Composer, Node.js, PostgreSQL, dan Redis tidak perlu dipasang langsung di Windows karena dijalankan melalui Docker.

### Hosting

- cPanel/shared hosting dengan SSH
- PostgreSQL
- PHP 8.3 dengan ekstensi `pdo_pgsql`
- domain frontend dan API
- SSL aktif
- repository GitHub

## Struktur Repository

```text
project/
├── backend/
├── frontend/
├── mobile/
├── deploy/
├── docs/
├── nginx/
├── .github/workflows/
└── docker-compose.yml
```

`template_services` adalah repository terpisah yang menyediakan PostgreSQL, pgAdmin, Redis, Nginx reverse proxy, dan Docker network bersama untuk development lokal.

## Urutan Penggunaan

1. [Membuat dan menjalankan project di lokal](docs/PROJECT-LOCAL-SETUP.md)
2. [Menyiapkan hosting dan CI/CD](docs/PROJECT-HOSTING-CICD.md)
3. [Menggunakan CI/CD sehari-hari](docs/CICD-DAILY.md)
4. [Mengikuti aturan development](docs/DEVELOPMENT-GUIDE.md)

Ikuti urutan tersebut untuk project baru. Setiap langkah sudah menyebutkan lokasi pengerjaan: komputer lokal, cPanel, GitHub, atau SSH hosting.
