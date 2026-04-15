# Local Development Setup Guide

## Prerequisites

### Option 1: Docker (Recommended)
- Docker Desktop for Windows
- Git

### Option 2: Local PHP Stack
- PHP 8.2+
- Composer
- MySQL 8.0+ or MariaDB
- Redis
- Node.js 18+
- npm/yarn

## Option 1: Docker Setup (Recommended)

### 1. Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Verify installation:
```bash
docker --version
docker compose version
```

### 2. Clone and Setup
```bash
git clone https://github.com/your-org/finance-analyser.git
cd finance-analyser

# Start containers
docker-compose up -d

# Install PHP dependencies
docker-compose exec app composer install

# Install Node dependencies
docker-compose exec app npm install

# Setup environment
cp .env.example .env
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan jwt:secret

# Run migrations
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# Build frontend
docker-compose exec app npm run build

# Access application
# API: http://localhost:8080/api
# Frontend: http://localhost:3000
```

## Option 2: Local PHP Stack Setup

### 1. Install PHP 8.2+
Download from https://www.php.net/downloads.php or use package manager:
```bash
# Using Chocolatey (Windows)
choco install php

# Verify installation
php --version
```

### 2. Install Composer
```bash
# Download Composer
curl -sS https://getcomposer.org/installer | php
move composer.phar C:\ProgramData\ComposerSetup\bin\composer.bat

# Verify installation
composer --version
```

### 3. Install MySQL
Download from https://dev.mysql.com/downloads/mysql/ or use XAMPP/WAMP

### 4. Install Redis
Download from https://redis.io/download or use Windows version

### 5. Install Node.js
Download from https://nodejs.org/

### 6. Setup Application
```bash
git clone https://github.com/your-org/finance-analyser.git
cd finance-analyser

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finance_analyser
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Run migrations
php artisan migrate
php artisan db:seed

# Start Redis server
redis-server

# Start queue worker
php artisan queue:work

# Build frontend
npm run build

# Start development server
php artisan serve

# Frontend development (in separate terminal)
cd frontend
npm run dev
```

## Environment Configuration

### Required Environment Variables
```env
APP_NAME="Finance Analyser"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finance_analyser
DB_USERNAME=root
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_here

MAIL_MAILER=log
```

## Database Setup

### Create Database
```sql
CREATE DATABASE finance_analyser CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON finance_analyser.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
```

## Access Points

### Docker Setup
- **API**: http://localhost:8080/api
- **Frontend**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8081
- **Redis Commander**: http://localhost:8082

### Local Setup
- **API**: http://localhost:8000/api
- **Frontend**: http://localhost:3000

## Default Login Credentials

After running database seeders:

### Admin User
- **Email**: admin@example.com
- **Password**: password

### Other Test Users
- **Manager**: manager@example.com / password
- **Accountant**: accountant@example.com / password
- **Employee**: employee@example.com / password
- **Viewer**: viewer@example.com / password

## Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build

# View logs
docker-compose logs app
docker-compose logs nginx
docker-compose logs mysql

# Access container shell
docker-compose exec app bash
```

### Local Setup Issues
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Check permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Restart services
php artisan queue:restart
```

## Development Tips

### Code Quality
```bash
# PHP formatting
composer pint

# JavaScript formatting
npm run format

# Run tests
php artisan test
npm test
```

### Debugging
- Use Laravel Telescope: http://localhost:8000/telescope
- Use Laravel Horizon: http://localhost:8000/horizon
- Check storage/logs/laravel.log for errors

## Next Steps

1. Explore the API documentation at http://localhost:8000/api/docs
2. Test the authentication endpoints
3. Create your first transaction
4. Explore the dashboard
5. Try the AI features
6. Set up your own company and users

## Support

For issues:
1. Check the logs
2. Review the troubleshooting section
3. Create an issue on GitHub
4. Check the documentation
