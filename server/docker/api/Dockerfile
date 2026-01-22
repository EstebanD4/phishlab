FROM php:8.4-fpm

# Dépendances + extensions PHP
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_mysql zip intl opcache \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Cache deps
COPY composer.json ./
# copier composer.lock seulement s'il existe
# (workaround Docker: on copie tout et on gère en bash)
COPY . .
RUN if [ -f composer.lock ]; then \
      composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader; \
    else \
      composer update --no-dev --prefer-dist --no-interaction --optimize-autoloader; \
    fi


# Code
COPY . .

# Droits Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
