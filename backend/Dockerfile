
FROM php:8.3-fpm-alpine

WORKDIR /var/www

# ==============================================================================================
# INSTALL SYSTEM DEPENDENCIES
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    freetype-dev

# ==============================================================================================
# PHP EXTENSIONS
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        fileinfo

# Install Composer dari official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .


RUN composer install --optimize-autoloader


RUN chown -R www-data:www-data \
        /var/www/storage \
        /var/www/bootstrap/cache \
    && chmod -R 775 \
        /var/www/storage \
        /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]