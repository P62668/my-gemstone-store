# Shankarmala Gemstore - Final Deployment Guide

This guide provides comprehensive instructions for deploying the Shankarmala gemstone e-commerce platform to a production environment, including all fixes and improvements made during development.

## Summary of Fixes Applied

1. **Database Connection Issues**:
   - Fixed DATABASE_URL in environment files to point to correct location
   - Moved database file to correct location
   - Applied all Prisma migrations to create database schema
   - Seeded database with initial data including admin user

2. **Authentication Issues**:
   - Fixed admin login authentication with correct password
   - Verified Prisma client can connect to database
   - Ensured proper environment variable loading

3. **Professional Error Handling**:
   - Implemented comprehensive error handling system
   - Added custom error classes for different error types
   - Enhanced API error responses with standardized format
   - Created professional error boundary for React components

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (recommended for production) or SQLite (for development/testing)
3. Domain name with SSL certificate
4. Stripe account with live API keys
5. Email service account (Gmail, SendGrid, etc.)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-gemstone-store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Update the following critical values in `.env.local`:

```
# Database Configuration
DATABASE_URL="file:./dev.db"  # For SQLite development

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
JWT_SECRET="your-jwt-secret-key-here-minimum-32-characters"

# Stripe Configuration (for development)
STRIPE_PUBLISHABLE_KEY="pk_test_your_test_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_test_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_test_webhook_secret"

# Email Configuration
EMAIL_HOST="smtp.your-email-provider.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@yourdomain.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="noreply@yourdomain.com"

# Admin Configuration
ADMIN_EMAIL="admin@shankarmala.com"
ADMIN_PASSWORD="your-secure-admin-password"
```

### 4. Database Setup

#### For Development (SQLite):

1. Apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Seed the database:
   ```bash
   npm run seed:sqlite
   ```

   Note the admin password generated during seeding.

#### For Production (PostgreSQL):

1. Update `prisma/schema.prisma` to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Configure PostgreSQL connection in `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database_name"
   ```

3. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Seed the database:
   ```bash
   npm run prisma:seed
   ```

### 5. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

Admin login: Use the email `admin@shankarmala.com` and the password generated during seeding.

## Production Deployment

### 1. Environment Configuration

Create or update `.env.production` with real production values:

```env
# Database Configuration (PostgreSQL recommended for production)
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
JWT_SECRET="your-jwt-secret-key-here-minimum-32-characters"

# Stripe Configuration (LIVE KEYS)
STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email Configuration
EMAIL_HOST="smtp.your-email-provider.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@yourdomain.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="noreply@yourdomain.com"

# Admin Configuration
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-admin-password"

# Performance Settings
NODE_ENV="production"
```

### 2. Build and Deploy

#### Using Custom Server:

1. Install production dependencies:
   ```bash
   npm ci --only=production
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the application:
   ```bash
   NODE_ENV=production npm run start:prod
   ```

#### Using PM2 (Recommended for Production):

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the application:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### 3. Domain and SSL Configuration

#### Point Domain to Server

Configure your DNS to point your domain to your server's IP address.

#### Set Up SSL Certificate

Using Let's Encrypt with Certbot:

```bash
sudo certbot --nginx -d yourdomain.com
```

### 4. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Configure Stripe Webhooks

1. In your Stripe Dashboard, add a webhook endpoint:
   - URL: `https://yourdomain.com/api/checkout/webhook`
   - Events: `checkout.session.completed`

2. Copy the webhook signing secret and add it to your `.env.production` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## Monitoring and Maintenance

### Health Checks

The application includes a health check endpoint at `/api/health`.

### Backups

Set up regular database backups:
- For PostgreSQL: `pg_dump gemstone_store > backup_$(date +%Y%m%d).sql`
- For SQLite: Regular file backups of the database file

### Log Monitoring

Check application logs regularly:
```bash
pm2 logs shankarmala
```

## Security Considerations

1. Never commit `.env` files to version control
2. Use strong, unique passwords for all services
3. Regularly update dependencies
4. Monitor logs for suspicious activity
5. Use HTTPS for all production traffic
6. Implement proper rate limiting
7. Regularly backup your database
8. Keep SSL certificates up to date

## Performance Optimization

1. Use a CDN for static assets
2. Implement caching strategies
3. Optimize database queries
4. Use compression for responses
5. Monitor and optimize image sizes

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in environment variables
   - Verify database service is running
   - Ensure database user has proper permissions

2. **Stripe Integration Not Working**
   - Verify Stripe API keys are correct
   - Check that keys are for the correct environment (live vs test)

3. **Email Not Sending**
   - Verify email service credentials
   - Check that your email provider allows SMTP access

4. **Authentication Issues**
   - Ensure NEXTAUTH_SECRET is consistent across all instances
   - Verify NEXTAUTH_URL matches your production domain exactly

### Getting Help

For support, contact the development team or check the application logs for error messages.

## Professional Error Handling

The application includes a comprehensive professional error handling system:

1. Custom error classes for different error types
2. Standardized API error responses
3. Professional error boundary for React components
4. Structured logging with context
5. User-friendly error messaging

This system ensures consistent error handling across the entire application and provides meaningful feedback to both users and developers.

## Contact

For any issues or questions, please contact the Shankarmala development team.