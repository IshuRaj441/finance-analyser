# Local Setup Instructions (Without Docker)

Since Docker is not installed, here's how to set up the Finance Analyser locally on Windows:

## Prerequisites

1. **PHP 8.2+**
   - Download from: https://windows.php.net/download/
   - Choose the VS16 x64 Thread Safe version
   - Extract to `C:\php`

2. **Composer**
   - Download from: https://getcomposer.org/Composer-Setup.exe
   - Run the installer

3. **MySQL 8.0+**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or install XAMPP from: https://www.apachefriends.org/

4. **Redis**
   - Download Windows version from: https://github.com/microsoftarchive/redis/releases
   - Or use WSL with Redis

5. **Node.js 18+**
   - Download from: https://nodejs.org/

## Step-by-Step Setup

### 1. Install PHP
```bash
# Download PHP and add to PATH
# Edit C:\php\php.ini and enable extensions:
extension=pdo_mysql
extension=mysqli
extension=redis
extension=fileinfo
extension=mbstring
extension=openssl
extension=curl
extension=gd
extension=zip
```

### 2. Install Composer
Download and run the Composer installer from getcomposer.org

### 3. Setup Database
```sql
-- Create database in MySQL
CREATE DATABASE finance_analyser CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON finance_analyser.* TO 'finance_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Clone Repository
```bash
git clone https://github.com/your-org/finance-analyser.git
cd finance-analyser
```

### 5. Install Dependencies
```bash
# PHP dependencies
composer install

# Node dependencies
npm install
```

### 6. Environment Setup
```bash
# Copy environment file
copy .env.example .env

# Generate keys
php artisan key:generate
php artisan jwt:secret
```

### 7. Configure .env
```env
APP_NAME="Finance Analyser"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finance_analyser
DB_USERNAME=finance_user
DB_PASSWORD=secret

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_here

MAIL_MAILER=log
```

### 8. Run Migrations
```bash
php artisan migrate
php artisan db:seed
```

### 9. Build Frontend
```bash
npm run build
```

### 10. Start Services
```bash
# Terminal 1: Start PHP server
php artisan serve

# Terminal 2: Start Redis
redis-server

# Terminal 3: Start queue worker
php artisan queue:work

# Terminal 4: Start frontend development (optional)
cd frontend
npm run dev
```

## Access Points

- **API**: http://localhost:8000/api
- **Frontend**: http://localhost:3000 (if running npm run dev)
- **API Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health

## Default Login

- **Email**: admin@example.com
- **Password**: password

## Alternative: Use XAMPP

If you prefer an all-in-one solution:

1. Download and install XAMPP from https://www.apachefriends.org/
2. Start Apache and MySQL services
3. Use phpMyAdmin at http://localhost/phpmyadmin
4. Follow steps 4-10 above

## Troubleshooting

### PHP Issues
```bash
# Check PHP version
php --version

# Check installed extensions
php -m
```

### Database Issues
```bash
# Test MySQL connection
mysql -u finance_user -p finance_analyser
```

### Redis Issues
```bash
# Test Redis connection
redis-cli ping
```

### Laravel Issues
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Check permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

## Next Steps

1. Test the API endpoints
2. Create your first transaction
3. Explore the dashboard
4. Try the AI features

## Need Docker?

For the best experience, install Docker Desktop:
https://www.docker.com/products/docker-desktop/

Then run the QUICK_START.bat script for automatic setup.
