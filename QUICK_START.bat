@echo off
echo =====================================
echo Finance Analyser Quick Start Script
echo =====================================
echo.

echo Checking prerequisites...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker found: %docker --version%
echo.

echo Building and starting Docker containers...
docker-compose -f docker-compose.local.yml up -d --build

if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker containers!
    pause
    exit /b 1
)

echo Containers started successfully!
echo.

echo Waiting for containers to be ready...
timeout /t 30 /nobreak >nul

echo Installing PHP dependencies...
docker-compose -f docker-compose.local.yml exec app mkdir -p /var/www/.cache/composer
docker-compose -f docker-compose.local.yml exec app chmod -R 777 /var/www/.cache
docker-compose -f docker-compose.local.yml exec app composer install

echo Installing Node dependencies...
docker-compose -f docker-compose.local.yml exec app npm install --prefix frontend

echo Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Environment file created.
)

echo Generating application keys...
docker-compose -f docker-compose.local.yml exec app php artisan key:generate
docker-compose -f docker-compose.local.yml exec app php artisan jwt:secret

echo Running database migrations...
docker-compose -f docker-compose.local.yml exec app php artisan migrate

echo Seeding database...
docker-compose -f docker-compose.local.yml exec app php artisan db:seed

echo Building frontend...
docker-compose -f docker-compose.local.yml exec app npm run build --prefix frontend

echo.
echo =====================================
echo SETUP COMPLETE!
echo =====================================
echo.
echo Access Points:
echo - API: http://localhost:8080/api
echo - Frontend: http://localhost:8080
echo - phpMyAdmin: http://localhost:8081
echo - Redis Commander: http://localhost:8082
echo.
echo Default Login:
echo - Email: admin@example.com
echo - Password: password
echo.
echo API Documentation: http://localhost:8080/api/docs
echo Health Check: http://localhost:8080/health
echo.
echo To stop containers: docker-compose -f docker-compose.local.yml down
echo To view logs: docker-compose -f docker-compose.local.yml logs -f
echo.
pause
