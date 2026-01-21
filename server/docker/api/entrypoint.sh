#!/usr/bin/env bash
set -e

cd /var/www/html

if [ ! -f artisan ]; then
  echo "[api] Laravel not found yet (artisan missing). Starting php-fpm anyway."
  exec php-fpm
fi

if [ ! -d vendor ]; then
  echo "[api] Installing composer dependencies..."
  composer install --no-interaction --prefer-dist
fi

echo "[api] Waiting for database..."
php -r '
$host=getenv("DB_HOST")?: "postgres";
$port=getenv("DB_PORT")?: "5432";
for ($i=0; $i<30; $i++) {
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
