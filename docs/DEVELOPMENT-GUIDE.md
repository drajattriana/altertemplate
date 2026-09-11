# Development Guide

Panduan singkat agar style kerja antar developer konsisten.

## Scope

| Prefix | Area |
| --- | --- |
| `FE` | Frontend |
| `BF` | Backend |
| `MB` | Mobile |
| `ALL` | Lintas area, docs, CI/CD, config umum |

## Type

| Type | Untuk |
| --- | --- |
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `refactor` | Rapikan struktur |
| `docs` | Dokumentasi |
| `chore` | Config/dependency/maintenance |
| `test` | Testing |
| `style` | Formatting/UI kecil |
| `perf` | Optimasi performa |

## Format Commit

```text
SCOPE:type/short-description
```

Contoh:

```text
FE:feat/create-menu
FE:fix/sidebar-mobile
BF:feat/menu-permission-api
BF:fix/jwt-expiration
MB:feat/profile-screen
ALL:docs/update-deployment
ALL:chore/update-dependency
```

Aturan:

```text
type + description lowercase
description pakai kebab-case
satu commit = satu perubahan logis
```

Hindari:

```text
update
fix bug
final
revisi
test123
```

## Branch

```text
scope/type/short-description
```

Contoh:

```text
fe/feat/create-menu
bf/fix/login-validation
all/docs/update-readme
```

## Frontend

```text
Page = wrapper
Logic/isi = components/app
Routing = routes
Helper = utils
```

Sebelum commit:

```powershell
docker compose exec frontend npm run build
```

## Backend

Schema wajib lewat migration:

```powershell
docker compose exec backend php artisan make:migration nama_migration
docker compose exec backend php artisan migrate
```

Data bawaan template gunakan Seeder.

Sebelum commit:

```powershell
docker compose exec backend php artisan test
```

## Comment di Code

Comment hanya untuk section atau alasan yang memang perlu dijelaskan.

Gunakan:

```ts
// ==================================================================================================
// MENU PERMISSION
```

Hindari comment yang hanya mengulang kode.

Khusus `.gitignore`, comment wajib menggunakan `#`.

## Sebelum Push

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

Jika ada perubahan database, pastikan migration ikut commit.
