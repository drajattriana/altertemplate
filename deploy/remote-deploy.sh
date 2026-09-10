#!/usr/bin/env bash

set -euo pipefail

BACKEND_PATH="$1"
FRONTEND_PATH="$2"
PHP_BIN="${3:-php}"

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_ARCHIVE="$DEPLOY_DIR/backend-production.tar.gz"
FRONTEND_ARCHIVE="$DEPLOY_DIR/frontend-production.tar.gz"


# ==================================================================================================
# VALIDATION

if [ ! -f "$BACKEND_ARCHIVE" ]; then
    echo "ERROR: backend-production.tar.gz tidak ditemukan."
    exit 1
fi

if [ ! -f "$FRONTEND_ARCHIVE" ]; then
    echo "ERROR: frontend-production.tar.gz tidak ditemukan."
    exit 1
fi

if [ ! -d "$BACKEND_PATH" ]; then
    mkdir -p "$BACKEND_PATH"
fi

if [ ! -d "$FRONTEND_PATH" ]; then
    mkdir -p "$FRONTEND_PATH"
fi

if [ ! -f "$BACKEND_PATH/.env" ]; then
    echo "ERROR: File .env production belum ada di:"
    echo "$BACKEND_PATH/.env"
    exit 1
fi


# ==================================================================================================
# BACKEND DEPLOYMENT

echo "Deploying Laravel backend..."

find "$BACKEND_PATH" \
    -mindepth 1 \
    -maxdepth 1 \
    ! -name ".env" \
    ! -name "storage" \
    -exec rm -rf {} +

tar -xzf "$BACKEND_ARCHIVE" \
    -C "$BACKEND_PATH"


# ==================================================================================================
# LARAVEL STORAGE

mkdir -p "$BACKEND_PATH/storage/app/public"
mkdir -p "$BACKEND_PATH/storage/framework/cache/data"
mkdir -p "$BACKEND_PATH/storage/framework/sessions"
mkdir -p "$BACKEND_PATH/storage/framework/views"
mkdir -p "$BACKEND_PATH/storage/logs"
mkdir -p "$BACKEND_PATH/bootstrap/cache"

chmod -R u+rwX,g+rwX \
    "$BACKEND_PATH/storage"

chmod -R u+rwX,g+rwX \
    "$BACKEND_PATH/bootstrap/cache"


# ==================================================================================================
# LARAVEL COMMANDS

cd "$BACKEND_PATH"

echo "Checking Composer vendor..."

"$PHP_BIN" -r "
require 'vendor/autoload.php';
echo 'Composer vendor OK'.PHP_EOL;
"

echo "Clearing old Laravel cache..."

"$PHP_BIN" artisan optimize:clear

echo "Running database migrations..."

"$PHP_BIN" artisan migrate --force

echo "Building Laravel production cache..."

"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan view:cache

if ! "$PHP_BIN" artisan route:cache; then
    echo "Route cache tidak dapat dibuat. Menggunakan route tanpa cache."
    "$PHP_BIN" artisan route:clear
fi

echo "Creating storage link..."

"$PHP_BIN" artisan storage:link || true


# ==================================================================================================
# FRONTEND DEPLOYMENT

echo "Deploying React frontend..."

find "$FRONTEND_PATH" \
    -mindepth 1 \
    -maxdepth 1 \
    ! -name ".well-known" \
    -exec rm -rf {} +

tar -xzf "$FRONTEND_ARCHIVE" \
    -C "$FRONTEND_PATH"


# ==================================================================================================
# CLEANUP

echo "Cleaning deployment files..."

rm -rf "$DEPLOY_DIR"

echo "Deployment completed successfully."