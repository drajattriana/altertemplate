# CI/CD Daily

Gunakan setelah project sudah online dan CI/CD sudah berhasil.

## Alur Normal

```text
coding lokal
→ test
→ git status
→ commit
→ git push origin main
→ GitHub Actions
→ production update
```

## Jika Ada Perubahan Database

Schema wajib lewat migration:

```powershell
docker compose exec backend php artisan make:migration nama_migration
docker compose exec backend php artisan migrate
```

Jangan ubah schema production langsung di phpMyAdmin.

## Test Sebelum Push

Frontend:

```powershell
docker compose exec frontend npm run build
```

Backend:

```powershell
docker compose exec backend php artisan test
```

## Commit + Push

```powershell
git status
git add PATH_FILE
git commit -m "FE:feat/create-menu"
git push origin main
```

## Apa yang Otomatis?

GitHub Actions:

```text
build backend
build frontend
upload
migrate --force
refresh cache
publish frontend
```

### Migration

Otomatis untuk struktur database.

### Seeder

Tidak otomatis hanya karena push.

Jika diperlukan:

```bash
cd /home/alterdev/apps/PROJECT
/usr/local/bin/php artisan db:seed --force
```

### Data User

Data user/transaksi/operasional tetap berada di database production. Data lokal tidak disinkronkan ke production.

## Jika Deploy Gagal

Jangan rerun berkali-kali. Buka step merah di GitHub Actions, perbaiki sumber error, lalu push ulang.

Kategori umum:

```text
build
SSH
SCP
migration
.env production
database privilege
```

## Pause Deploy

```text
DEPLOY_ENABLED=false
```

Aktifkan lagi setelah aman:

```text
DEPLOY_ENABLED=true
```

## Jangan Di-push

```text
.env
password
SSH private key
vendor
node_modules
dist
database dump production
```
