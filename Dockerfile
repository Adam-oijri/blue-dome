# syntax=docker/dockerfile:1.7
# Production image for BlueDome (Laravel 12 + Inertia/React, PHP 8.4) served by FrankenPHP.
# Single build stage on purpose: the Vite build runs the Wayfinder plugin, which shells
# out to `php artisan`, so PHP must be present while compiling the frontend.
FROM dunglas/frankenphp:1-php8.4 AS app

# PHP extensions this app needs (pgsql driver, intl, sodium for PII encryption, etc.)
RUN install-php-extensions pdo_pgsql pgsql intl zip gd bcmath opcache pcntl sodium

# Node 22 for `npm run build` (Wayfinder generate needs artisan, installed below).
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app

# Dummy key so artisan can boot during the asset build; always overridden at runtime.
ENV APP_ENV=production \
    APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=

# PHP dependencies first for layer caching (scripts deferred: full source not copied yet).
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader --no-progress

# Application source.
COPY . .

# Compile frontend assets (Wayfinder generate runs here), then discard node_modules.
RUN npm ci --no-audit --no-fund \
 && npm run build \
 && rm -rf node_modules

# Optimise autoloader and prepare writable dirs.
RUN composer dump-autoload --no-dev --optimize --no-scripts \
 && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# FrankenPHP/Caddy site config (php_server gives Laravel-style front-controller routing).
COPY <<'CADDY' /etc/frankenphp/Caddyfile
{
	auto_https off
	admin off
}
:8080 {
	root * /app/public
	encode zstd gzip
	php_server
}
CADDY

# Boot-time cache warmups; each is tolerant so a single failure can't block startup.
COPY <<'ENTRY' /usr/local/bin/docker-entrypoint.sh
#!/bin/sh
set -e
php artisan package:discover --ansi || true
php artisan storage:link || true
php artisan config:cache || true
php artisan view:cache || true
exec "$@"
ENTRY
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV APP_DEBUG=false \
    SERVER_NAME=:8080
EXPOSE 8080
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]
