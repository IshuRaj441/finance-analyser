# Production Deployment Guide - Finance Analyser

## Overview

This guide covers the complete production deployment process for the Finance Analyser SaaS application with enterprise-grade security, monitoring, and scalability.

## Prerequisites

### Infrastructure Requirements
- **Server**: Ubuntu 22.04 LTS or CentOS 8+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: SSD with at least 100GB
- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **Network**: Stable internet connection with SSL certificate

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- SSL certificate (Let's Encrypt recommended)
- Domain name configured with DNS

## Environment Configuration

### 1. Environment Variables

Create `.env.production` file:

```bash
# Application
APP_NAME="Finance Analyser"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_VERSION=1.0.0

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=finance_analyser
DB_USERNAME=finance_user
DB_PASSWORD=SECURE_PASSWORD_HERE
MYSQL_ROOT_PASSWORD=SECURE_ROOT_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# Security
FORCE_HTTPS=true
ALLOW_REGISTRATION=true
ALLOW_PASSWORD_RESET=true

# Monitoring
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
ENABLE_TELEMETRY=false
ENABLE_DEBUG_TOOLBAR=false

# Horizon
HORIZON_DARK_MODE=false
```

### 2. Generate Application Key

```bash
php artisan key:generate --force
```

## SSL Certificate Setup

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL

Place certificates in `docker/nginx/ssl/`:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

## Deployment Process

### 1. Clone Repository

```bash
git clone https://github.com/your-org/finance-analyser.git
cd finance-analyser
```

### 2. Configure Environment

```bash
cp .env.example .env.production
# Edit .env.production with your values
```

### 3. Build and Deploy

```bash
# Build production images
docker-compose -f docker/production/docker-compose.prod.yml build

# Start services
docker-compose -f docker/production/docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan migrate --force

# Cache configuration for production
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan view:cache

# Create storage link
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan storage:link

# Seed initial data (optional)
docker-compose -f docker/production/docker-compose.prod.yml exec app php artisan db:seed --class=DatabaseSeeder
```

### 4. Verify Deployment

```bash
# Check service status
docker-compose -f docker/production/docker-compose.prod.yml ps

# Check health endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/health/queue
curl https://your-domain.com/api/health/redis
curl https://your-domain.com/api/health/database
```

## Monitoring and Logging

### Health Monitoring

Access the following endpoints:
- `/health` - Overall system health
- `/api/health/queue` - Queue status
- `/api/health/redis` - Redis status
- `/api/health/database` - Database status

### Log Locations

- Application logs: `storage/logs/`
- Supervisor logs: `supervisor_logs` volume
- Nginx logs: `nginx_logs` volume
- MySQL logs: `mysql_logs` volume
- Redis logs: `redis_logs` volume

### Laravel Horizon

Access Horizon dashboard at `https://your-domain.com/horizon`
- Requires admin role
- Real-time queue monitoring
- Failed job management
- Performance metrics

## Security Configuration

### Firewall Rules

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Headers

The application includes:
- HSTS (HTTP Strict Transport Security)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

### Rate Limiting

- API endpoints: 60 requests per minute
- Authentication: 5 requests per minute
- File uploads: 10 requests per minute

## Backup Strategy

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
CONTAINER_NAME="finance-analyser-mysql-prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec $CONTAINER_NAME mysqldump -u root -p$MYSQL_ROOT_PASSWORD finance_analyser > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/html

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups at 2 AM
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Performance Optimization

### Database Optimization

```sql
-- Optimize MySQL configuration
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### Redis Optimization

- Memory limit: 256MB
- Eviction policy: allkeys-lru
- Persistence: AOF enabled

### PHP Optimization

- OPcache enabled
- Memory limit: 512MB
- Max execution time: 300s

## Scaling Considerations

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer**: Use HAProxy or AWS ALB
2. **Multiple App Servers**: Scale app containers
3. **Database Replication**: MySQL master-slave setup
4. **Redis Cluster**: For distributed caching

### Resource Allocation

Based on traffic:
- **Small (100-500 users)**: Current configuration
- **Medium (500-2000 users)**: 2x app containers, 2x workers
- **Large (2000+ users)**: 4x app containers, 4x workers, database cluster

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml logs service-name
   ```

2. **Database connection failed**
   - Check MySQL container health
   - Verify credentials in .env
   - Check network connectivity

3. **Queue jobs not processing**
   - Check Supervisor status
   - Verify Redis connection
   - Review Horizon dashboard

4. **High memory usage**
   - Monitor PHP-FPM processes
   - Check for memory leaks
   - Review worker configurations

### Emergency Procedures

1. **Maintenance Mode**
   ```bash
   docker-compose exec app php artisan down --message="System Maintenance"
   ```

2. **Emergency Restart**
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml restart
   ```

3. **Rollback Deployment**
   ```bash
   git checkout previous-tag
   docker-compose -f docker/production/docker-compose.prod.yml up -d --build
   ```

## Compliance and Auditing

### Data Protection

- GDPR compliance features enabled
- Data encryption at rest and in transit
- Audit logging for all sensitive operations
- User consent management

### Security Audits

- Monthly vulnerability scans
- Dependency updates
- Security headers validation
- Access log reviews

## Support and Maintenance

### Regular Tasks

1. **Daily**: Monitor health dashboards
2. **Weekly**: Review logs and performance metrics
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Full security audit and performance review

### Monitoring Tools

- Application metrics: Laravel Telescope
- Server metrics: Docker stats
- Database metrics: MySQL slow query log
- Queue metrics: Laravel Horizon

## Contact and Support

For production issues:
- Emergency: emergency@your-domain.com
- Technical: support@your-domain.com
- Documentation: https://docs.your-domain.com

---

**Note**: This deployment guide assumes you have proper system administration knowledge. Always test in a staging environment before deploying to production.
