#!/usr/bin/env bash
set -e

cd /var/www/html

# Laravel needs writable dirs
mkdir -p storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# If Laravel isn't present, still start php-fpm
if [ ! -f artisan ]; then
  echo "[api] Laravel not found (artisan missing). Starting php-fpm."
  exec php-fpm
fi

# Install deps if vendor missing/empty
if [ ! -f vendor/autoload.php ]; then
  echo "[api] Installing composer dependencies..."
  composer install --no-interaction --prefer-dist --no-progress
fi

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

echo "[api] Running migrations..."
php artisan migrate --force || true

exec php-fpm
