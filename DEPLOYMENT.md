# Deployment Guide

This guide covers deploying the Finance Analyser SaaS platform to production environments.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Docker**: Latest stable version
- **Docker Compose**: Latest stable version
- **SSL Certificate**: For HTTPS

### Domain & DNS
- Domain name pointing to server IP
- SSL certificate (Let's Encrypt recommended)
- Subdomains for services (optional)

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /var/www/finance-analyser
sudo chown $USER:$USER /var/www/finance-analyser
```

### 2. Clone Repository

```bash
cd /var/www/finance-analyser
git clone https://github.com/your-org/finance-analyser.git .
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Edit environment variables
nano .env
```

#### Production Environment Variables

```env
APP_NAME="Finance Analyser"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=finance_analyser
DB_USERNAME=finance_user
DB_PASSWORD=secure_password_here

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_TTL=1440

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-mail-password
MAIL_ENCRYPTION=tls

# Pusher/WebSockets
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_HOST=your-push-host
PUSHER_PORT=443
PUSHER_SCHEME=https

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Payment Gateways
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret

# Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-s3-bucket

# Security
CORS_ALLOWED_ORIGINS="https://your-domain.com"
```

## Docker Deployment

### 1. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finance-analyser-app
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
      - ./docker/php/local.ini:/usr/local/etc/php/conf.d/local.ini
    networks:
      - finance-network
    depends_on:
      - mysql
      - redis
    environment:
      - APP_ENV=production

  nginx:
    image: nginx:alpine
    container_name: finance-analyser-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www/html
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt
    networks:
      - finance-network
    depends_on:
      - app

  mysql:
    image: mysql:8.0
    container_name: finance-analyser-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: finance_analyser
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/my.cnf
      - ./backups:/backups
    networks:
      - finance-network

  redis:
    image: redis:7-alpine
    container_name: finance-analyser-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - finance-network

  supervisor:
    image: php:8.2-fpm
    container_name: finance-analyser-supervisor
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
      - ./docker/supervisor/supervisord.conf:/etc/supervisor/conf.d/supervisord.conf
    networks:
      - finance-network
    depends_on:
      - app
      - redis
    command: bash -c "apt-get update && apt-get install -y supervisor && supervisorctl start all && tail -f /dev/null"

  horizon:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finance-analyser-horizon
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
    networks:
      - finance-network
    depends_on:
      - mysql
      - redis
    command: php artisan horizon

  websocket:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finance-analyser-websocket
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
    ports:
      - "6001:6001"
    networks:
      - finance-network
    depends_on:
      - redis
    command: php artisan websockets:serve

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local

networks:
  finance-network:
    driver: bridge
```

### 2. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Deploy Application

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

# Optimize application
docker-compose -f docker-compose.prod.yml exec app php artisan optimize:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

# Install frontend dependencies and build
cd frontend
npm install
npm run build
cd ..

# Set proper permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## Monitoring & Logging

### 1. Application Monitoring

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f mysql

# Monitor queue workers
docker-compose -f docker-compose.prod.yml exec app php artisan queue:monitor
```

### 2. Laravel Telescope & Horizon

```bash
# Install Telescope (if not already)
docker-compose -f docker-compose.prod.yml exec app php artisan telescope:install

# Publish Telescope assets
docker-compose -f docker-compose.prod.yml exec app php artisan vendor:publish --tag=telescope-assets

# Access Telescope at: https://your-domain.com/telescope
# Access Horizon at: https://your-domain.com/horizon
```

### 3. Health Checks

```bash
# Application health
curl https://your-domain.com/health

# Database connection
docker-compose -f docker-compose.prod.yml exec app php artisan tinker
# > DB::connection()->getPdo();
```

## Performance Optimization

### 1. PHP Configuration

Edit `docker/php/local.ini`:

```ini
memory_limit=512M
max_execution_time=300
upload_max_filesize=40M
post_max_size=40M
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=0
opcache.fast_shutdown=1
```

### 2. Nginx Configuration

Edit `docker/nginx/conf.d/default.conf`:

```nginx
# Add caching for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### 3. Database Optimization

```bash
# MySQL optimization
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Run optimization queries
OPTIMIZE TABLE transactions;
OPTIMIZE TABLE audit_logs;
OPTIMIZE TABLE notifications;
```

## Backup Strategy

### 1. Automated Backups

Create `scripts/backup.sh`:

```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/finance-analyser/backups"

# Database backup
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p finance_analyser > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz storage/app/

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://your-backup-bucket/
aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 2. Cron Jobs

```bash
# Edit crontab
sudo crontab -e

# Add backup job
0 2 * * * /var/www/finance-analyser/scripts/backup.sh

# Add Laravel scheduler
* * * * * cd /var/www/finance-analyser && docker-compose -f docker-compose.prod.yml exec app php artisan schedule:run
```

## Security Hardening

### 1. Firewall Setup

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

### 2. Security Headers

Add to Nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. Application Security

```bash
# Set secure permissions
sudo chmod 600 .env
sudo chmod 600 storage/oauth-*.key

# Disable debug mode in production
# Ensure APP_DEBUG=false in .env

# Regular security updates
sudo apt update && sudo apt upgrade -y
```

## Scaling & Load Balancing

### 1. Horizontal Scaling

For high-traffic deployments:

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    scale: 3
    # ... other config
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./docker/nginx/load-balancer.conf:/etc/nginx/nginx.conf
    # ... other config
```

### 2. Load Balancer Configuration

```nginx
# upstream backend {
#     least_conn;
#     server app_1:9000;
#     server app_2:9000;
#     server app_3:9000;
# }
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Database connection failed**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
   ```

3. **Queue workers not running**
   ```bash
   docker-compose -f docker-compose.prod.yml restart supervisor
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   ```

### Performance Issues

1. **High memory usage**
   - Check PHP memory limits
   - Monitor Redis memory usage
   - Optimize database queries

2. **Slow response times**
   - Enable OPcache
   - Use Redis for caching
   - Optimize Nginx configuration

## Maintenance

### Regular Tasks

1. **Weekly**
   - Update Docker images
   - Check backup integrity
   - Review security logs

2. **Monthly**
   - Update dependencies
   - Clean up old logs
   - Performance monitoring

3. **Quarterly**
   - Security audit
   - Capacity planning
   - Disaster recovery testing

### Update Process

```bash
# Backup current version
./scripts/backup.sh

# Pull latest changes
git pull origin main

# Update dependencies
docker-compose -f docker-compose.prod.yml exec app composer update
docker-compose -f docker-compose.prod.yml exec app npm update

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Clear caches
docker-compose -f docker-compose.prod.yml exec app php artisan optimize:clear
```

---

This deployment guide provides a comprehensive setup for production environments. Always test in staging before deploying to production.
