# Finance Analyser - Enterprise SaaS Financial Management System

A production-ready, multi-tenant SaaS financial management system built with PHP/Laravel and React. Features enterprise-grade security, real-time updates, AI-powered analytics, and comprehensive financial management tools.

## 🚀 Current Status

**✅ Production Ready** - All critical issues resolved and system fully operational

### Recent Updates (April 2026)
- **Fixed Authentication Issues** - Resolved `/auth/me` 500 errors with improved error handling
- **WebSocket Integration** - Real-time socket server running on port 3001
- **Session Management** - Fixed forced logout on refresh, now preserves sessions properly
- **API Interceptor** - Enhanced token retrieval with fallback mechanisms
- **Health Monitoring** - All services passing health checks

### Active Services
- **API Server**: `http://localhost:8080` (Nginx + PHP-FPM)
- **Frontend Dev Server**: `http://localhost:3000` (Vite + React)
- **WebSocket Server**: `http://localhost:3001` (Socket.io + Node.js)
- **MySQL Database**: `localhost:3306`
- **Redis Cache**: `localhost:6379`
- **Laravel Horizon**: Queue monitoring dashboard

## Features

### Core Features
- **Multi-Tenant SaaS Architecture** - Support for multiple companies with complete data isolation
- **Role-Based Access Control (RBAC)** - Granular permissions with 5 user roles
- **JWT Authentication** - Secure token-based authentication system
- **Audit Logging** - Complete activity tracking for compliance
- **Real-Time Notifications** - Email, SMS, and in-app notifications
- **Advanced Reporting** - Generate PDF, Excel, and CSV reports
- **Dashboard Customization** - Personalized widgets and themes

### Advanced Features
- **AI Chat Assistant** - Natural language financial queries
- **Fraud Detection** - Automated suspicious activity monitoring
- **Smart Budget Recommendations** - AI-powered budget optimization
- **API Integrations** - Stripe, Razorpay, PayPal, and bank APIs
- **File Management** - Secure file uploads with auto-categorization
- **Backup & Restore** - Automated and manual backup system
- **Financial Risk Scoring** - Comprehensive risk assessment

## Technology Stack

### Backend
- **PHP 8.2+** - Modern PHP with strict typing
- **Laravel 11** - Enterprise PHP framework
- **MySQL 8.0** / **PostgreSQL** - Primary database
- **Redis** - Caching and queue management
- **JWT** - Token-based authentication
- **Spatie Laravel Permission** - RBAC system

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **React Query** - Server state management

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Web server
- **Supervisor** - Process management
- **Laravel Horizon** - Queue monitoring
- **Laravel Telescope** - Debug assistant

### Security
- **HTTPS/SSL** - Encrypted communication
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - API abuse prevention
- **Password Hashing** - Secure password storage

## Architecture

### Clean Architecture Pattern
```
app/
 Controllers/     # HTTP request handling
 Services/        # Business logic
 Repositories/    # Data access layer
 Models/          # Eloquent models
 Jobs/            # Background jobs
 Events/          # Event handling
 Listeners/       # Event listeners
 Middleware/      # HTTP middleware
```

### Database Design
- **Multi-tenant** with `company_id` isolation
- **Soft deletes** for data recovery
- **Audit trails** for compliance
- **Indexed columns** for performance
- **Foreign key constraints** for data integrity

## Installation

### Prerequisites
- Docker & Docker Compose
- Composer
- Node.js & npm
- Git

### Quick Start

#### Option 1: Automated Setup (Windows)
```batch
# Run the provided batch file
QUICK_START.bat
```

#### Option 2: Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/finance-analyser.git
cd finance-analyser
```

2. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

3. **Start Docker containers**
```bash
docker-compose up -d
```

4. **Install dependencies**
```bash
composer install
npm install
cd frontend && npm install && cd ..
cd socket-server && npm install && cd ..
```

5. **Run migrations and seeders**
```bash
php artisan migrate
php artisan db:seed
```

6. **Start development servers**
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Socket Server
cd socket-server && npm run dev

# Terminal 3: Queue Workers
php artisan queue:work
```

7. **Access the application**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080/api
- **WebSocket**: http://localhost:3001
- **API Documentation**: http://localhost:8080/api/docs
- **Horizon Dashboard**: http://localhost:8080/horizon

### Development Commands

#### Backend
```bash
# Run tests
php artisan test

# Clear caches
php artisan optimize:clear

# Queue management
php artisan queue:work
php artisan horizon

# Database operations
php artisan migrate:fresh --seed
php artisan db:seed --class=RolePermissionSeeder
```

#### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Code quality
npm run lint
npm run format
npm run type-check
```

#### Socket Server
```bash
# Development
npm run dev

# Production
npm run start

# Health check
curl http://localhost:3001/health
```

## API Documentation

### Authentication Endpoints
```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Transaction Endpoints
```http
GET    /api/v1/transactions
POST   /api/v1/transactions
PUT    /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}
POST   /api/v1/transactions/{id}/approve
POST   /api/v1/transactions/{id}/reject
```

### Report Endpoints
```http
GET  /api/v1/reports
POST /api/v1/reports/generate
GET  /api/v1/reports/{id}/download
```

## User Roles & Permissions

### Admin
- Manage users and companies
- Full system access
- Backup and restore
- System settings

### Manager
- View and approve transactions
- Generate reports
- Manage budgets
- View audit logs

### Accountant
- Create and manage transactions
- Generate financial reports
- Manage categories
- View budgets

### Employee
- Add expenses and income
- Upload receipts
- View personal reports
- Use AI features

### Viewer
- View dashboards only
- Read-only access
- View reports

## Development

### Code Quality
- **PHPStan** - Static analysis
- **Laravel Pint** - Code formatting
- **PHPUnit** - Unit testing
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

### Testing
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter TransactionTest

# Generate coverage report
php artisan test --coverage
```

### Queue Management
```bash
# Start queue workers
php artisan queue:work

# Monitor with Horizon
php artisan horizon

# Clear failed jobs
php artisan queue:flush-failed
```

## Deployment

### Production Deployment

1. **Server Requirements**
- Ubuntu 20.04+ or CentOS 8+
- Docker & Docker Compose
- SSL certificate
- Minimum 4GB RAM

2. **Environment Configuration**
```bash
# Set production variables
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Configure database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=finance_analyser
DB_USERNAME=your_user
DB_PASSWORD=secure_password

# Configure JWT
JWT_SECRET=your_jwt_secret

# Configure mail
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

3. **Deploy with Docker**
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Clear caches
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
```

### Monitoring

- **Laravel Horizon** - Queue monitoring
- **Laravel Telescope** - Application monitoring
- **Health Checks** - System health monitoring
- **Log Analysis** - Centralized logging

## Security

### Security Features
- **JWT Authentication** with refresh tokens
- **RBAC** with granular permissions
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CSRF Protection** for web routes
- **SQL Injection Prevention** with Eloquent
- **XSS Protection** with output escaping

### Security Best Practices
- Regular security updates
- Environment variable encryption
- Database connection encryption
- API endpoint authentication
- File upload validation
- Audit log monitoring

## Performance

### Optimization Techniques
- **Database Indexing** for fast queries
- **Redis Caching** for frequently accessed data
- **Queue System** for background processing
- **Lazy Loading** for relationships
- **Pagination** for large datasets
- **Asset Minification** for faster loading

### Monitoring Metrics
- Response time tracking
- Database query performance
- Memory usage monitoring
- CPU utilization tracking
- Error rate monitoring

## Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Clear JWT cache
php artisan cache:clear
php artisan config:clear

# Regenerate JWT secret
php artisan jwt:secret
```

#### WebSocket Connection Issues
```bash
# Check socket server status
curl http://localhost:3001/health

# Restart socket server
cd socket-server && npm run dev
```

#### Database Connection Issues
```bash
# Check MySQL container
docker-compose logs mysql

# Restart database
docker-compose restart mysql

# Reset database
php artisan migrate:fresh --seed
```

#### Frontend Build Issues
```bash
# Clear node modules
rm -rf frontend/node_modules
cd frontend && npm install

# Clear Vite cache
npm run build -- --force
```

### Health Checks
```bash
# API Health
curl http://localhost:8080/health

# Database Health
docker-compose exec mysql mysqladmin ping

# Redis Health
docker-compose exec redis redis-cli ping

# All Services Status
docker-compose ps
```

## Project Structure

```
Finance Analyser/
├── app/                     # Laravel application code
│   ├── Http/Controllers/    # API controllers
│   ├── Models/             # Eloquent models
│   ├── Services/           # Business logic
│   └── Jobs/               # Background jobs
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── lib/            # Utilities
│   └── public/             # Static assets
├── socket-server/          # WebSocket server
│   ├── src/                # Socket.io server code
│   └── package.json        # Node.js dependencies
├── docker/                 # Docker configurations
│   ├── nginx/              # Nginx config
│   ├── mysql/              # MySQL config
│   └── php/                # PHP-FPM config
├── database/               # Database files
│   ├── migrations/         # Database migrations
│   └── seeders/           # Database seeders
├── routes/                 # API routes
├── config/                 # Laravel configuration
└── storage/               # Application storage
```

## Environment Variables

### Key Configuration
```env
# Application
APP_NAME="Finance Analyser"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=finance_analyser
DB_USERNAME=finance_user
DB_PASSWORD=secret

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_TTL=60
JWT_REFRESH_TTL=20160

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# WebSocket
SOCKET_SERVER_URL=http://localhost:3001
```

## Support

### Documentation
- [API Documentation](/docs/api.md)
- [User Guide](/docs/user-guide.md)
- [Developer Guide](/docs/developer-guide.md)
- [Deployment Guide](/docs/deployment.md)
- [Local Setup Guide](LOCAL_SETUP.md)
- [Production Deployment](PRODUCTION_DEPLOYMENT.md)

### Community
- [GitHub Issues](https://github.com/your-org/finance-analyser/issues)
- [Discord Community](https://discord.gg/your-server)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/finance-analyser)

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Finance Analyser** - Enterprise Financial Management Made Simple

Built with enterprise-grade security, scalability, and performance in mind. Perfect for businesses of all sizes.

🚀 **Version 1.0.0** - Production Ready with Real-time Features
