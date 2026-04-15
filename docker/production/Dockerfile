# Production stage
FROM php:8.2-fpm-alpine AS production

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    supervisor \
    dcron \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    imagemagick-dev \
    openssl-dev \
    pkgconfig \
    imagemagick \
    nginx \
    autoconf \
    make \
    gcc \
    g++ \
    linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis imagick \
    && docker-php-ext-enable redis imagick

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application with proper permissions
COPY --chown=www-data:www-data . /var/www/html

# Create necessary directories
RUN mkdir -p /var/www/html/storage/logs \
    /var/www/html/storage/framework/cache \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/resources/views \
    /var/log/supervisor \
    /tmp \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 755 /var/www/html/storage

# Optimize application for production
RUN composer install --no-dev --optimize-autoloader \
    && php artisan route:cache

# Copy production configurations
COPY docker/production/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/production/nginx.conf /etc/nginx/nginx.conf
COPY docker/production/supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Security hardening
RUN rm -rf /var/www/html/.git \
    /var/www/html/node_modules \
    /var/www/html/frontend \
    /var/www/html/docker \
    /var/www/html/tests \
    /var/www/html/.env.example \
    /var/www/html/README.md \
    /var/www/html/CHANGELOG.md

# Switch to www-data user
USER www-data

# Expose ports
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD php-fpm -t || exit 1

# Start PHP-FPM
CMD ["php-fpm"]
