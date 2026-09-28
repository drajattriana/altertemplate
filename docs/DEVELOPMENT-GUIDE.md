# Development Guide

Standar sederhana untuk development project Alterdev.

## Scope

| Prefix | Arti |
| --- | --- |
| `FE` | Frontend |
| `BF` | Backend |
| `MB` | Mobile |
| `ALL` | Lintas area / docs / CI/CD / config umum |

Gunakan `BF` untuk backend agar konsisten. Jangan campur `BE` dan `BF`.

## Type

| Type | Untuk |
| --- | --- |
| `feat` | fitur baru |
| `fix` | bug fix |
| `refactor` | rapikan struktur tanpa mengubah hasil |
| `docs` | dokumentasi |
| `chore` | config, dependency, maintenance |
| `test` | testing |
| `style` | formatting/UI kecil |
| `perf` | optimasi performa |

## Format Commit

```text
SCOPE:type/short-description
```

Contoh:

```text
FE:feat/create-menu
FE:fix/sidebar-mobile
BF:feat/create-user-api
BF:fix/login-validation
MB:feat/profile-screen
ALL:docs/update-readme
ALL:chore/update-ci
```

Aturan:

```text
description lowercase
pakai kebab-case
satu commit = satu perubahan logis
```

Hindari:

```text
update
fix bug
revisi
final
test123
```

## Format Branch

```text
scope/type/short-description
```

Contoh:

```text
fe/feat/create-menu
bf/fix/login-validation
all/docs/update-readme
```

## Struktur Frontend

```text
pages          = wrapper halaman
components/app = isi + logic fitur
layouts        = layout
routes         = routing
utils          = helper
```

Page dibuat tipis. Logic utama diletakkan di `components/app/...`.

## Backend

Jalankan perintah berikut di **PowerShell lokal**, dari folder utama project, misalnya `E:\project\alterdev\projecta`.

Schema wajib melalui migration:

```powershell
docker compose exec backend php artisan make:migration nama_migration
docker compose exec backend php artisan migrate
```

Data bawaan gunakan Seeder.

## Comment di Code

Gunakan comment hanya untuk section/alasan penting.

```ts
// ==================================================================================================
// MENU PERMISSION
```

Hindari comment yang cuma mengulang kode.

Khusus `.gitignore`, comment gunakan `#`.

## Command Harian

Jalankan di **PowerShell lokal**, dari folder utama project:

```powershell
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan optimize:clear
docker compose exec backend php artisan test

docker compose exec frontend npm run build
```

Reset DB development:

```powershell
docker compose exec backend php artisan migrate:fresh --seed
```

Gunakan hanya untuk database development.

## Sebelum Push

Jalankan di **PowerShell lokal**, dari folder utama project:

```powershell
git status
```

Pastikan tidak ikut:

```text
.env
vendor
node_modules
dist
private key
password
```

Jika schema berubah, migration harus ikut commit. Jika ada data bawaan baru, update Seeder.
