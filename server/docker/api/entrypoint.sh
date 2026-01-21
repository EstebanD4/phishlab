#!/usr/bin/env bash
set -e

# 1) Sync code from RO (/app) to RW workdir (/var/www/html)
if [ -d /app ] && [ -f /app/artisan ]; then
  echo "[api] Syncing application code into workdir..."
  rsync -a --delete \
    --exclude vendor \
    --exclude storage \
    --exclude bootstrap/cache \
    /app/ /var/www/html/
else
  echo "[api] /app not found or artisan missing. Starting php-fpm."
  exec php-fpm
fi

cd /var/www/html

# 2) Ensure writable dirs for Laravel
mkdir -p storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# 3) Install deps if vendor missing
if [ ! -f vendor/autoload.php ]; then
  echo "[api] Installing composer dependencies..."
  composer install --no-interaction --prefer-dist --no-progress
fi

# 4) Wait DB
echo "[api] Waiting for database..."
php -r '
$host=getenv("DB_HOST")?: "postgres";
$port=getenv("DB_PORT")?: "5432";
for ($i=0; $i<40; $i++) {
  $fp=@fsockopen($host, (int)$port, $errno, $errstr, 1);
  if ($fp) { fclose($fp); exit(0); }
  sleep(1);
}
fwrite(STDERR, "DB not reachable\n");
exit(1);
';

# 5) Migrate (safe)
echo "[api] Running migrations..."
php artisan migrate --force || true

exec php-fpm
