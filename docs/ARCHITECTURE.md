# Architecture

Altertemplate memisahkan aplikasi, infrastruktur development, dan deployment production.

## Development Lokal

```text
Browser
  ├── altertemplate.local
  │      ↓
  │  template_services Nginx
  │      ↓
  │  altertemplate_frontend:5173
  │
  └── api.altertemplate.local
         ↓
     template_services Nginx
         ↓
     altertemplate_nginx_backend:80
         ↓
     altertemplate_backend:9000
         ↓
     Laravel
       ├── MySQL
       └── Redis
```

## Frontend

```text
frontend/src/
├── components/app/
├── contexts/
├── layouts/
├── pages/
├── routes/
└── utils/
```

Prinsip:

```text
pages          = wrapper
components/app = isi + logic fitur
layouts        = kerangka
routes         = routing
utils          = helper
```

## Backend

Laravel menangani:

```text
JWT authentication
role
permission
dynamic menu
API
database
```

Tabel auth utama menggunakan struktur seperti:

```text
auth_users
auth_roles
auth_permissions
auth_permission_roles
auth_menus
```

## Authentication

```text
React login
    ↓
Laravel API
    ↓
JWT
    ↓
Protected Route
    ↓
Role + Permission
    ↓
Dynamic Menu
```

Production wajib HTTPS.

## Database

```text
Migration = schema
Seeder    = default/template data
User Data = data per environment
```

Data database lokal tidak otomatis disalin ke production.

## Production

```text
GitHub
   ↓
GitHub Actions
   ├── Composer build
   └── Vite build
   ↓
SSH / SCP
   ↓
cPanel
   ├── /home/USER/apps/PROJECT
   └── /home/USER/FRONTEND_DOMAIN
```

API document root:

```text
/home/USER/apps/PROJECT/public
```

Frontend menggunakan hasil Vite `dist` dan `.htaccess` untuk fallback React Router.

## Environment

Development:

```text
MySQL/Redis dari Docker
APP_DEBUG=true
HTTP lokal
```

Production:

```text
MySQL cPanel
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
APP_DEBUG=false
HTTPS
```
