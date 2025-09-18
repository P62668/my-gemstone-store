# Shankarmala Production Deployment Guide

This guide provides step-by-step instructions for deploying the Shankarmala gemstone store to a production environment.

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (version 12+ recommended)
3. Domain name with SSL certificate
4. Stripe account with API keys
5. Email service account (Gmail, SendGrid, etc.)

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

```sql
CREATE DATABASE gemstone_store;
CREATE USER gemstone_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gemstone_store TO gemstone_user;
```

### 1.2 Update Prisma Schema

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.3 Configure Database URL

In your `.env.production` file:

```
DATABASE_URL="postgresql://gemstone_user:your_secure_password@localhost:5432/gemstone_store?connection_limit=10&pool_timeout=15"
```

### 1.4 Run Database Migrations

```bash
npx prisma migrate deploy
```

## Step 2: Environment Configuration

### 2.1 Update Environment Variables

Create or update `.env.production` with real values:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
JWT_SECRET="your-jwt-secret-key-here-minimum-32-characters"

# Stripe Configuration
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
```

## Step 3: Build and Deploy

### 3.1 Install Dependencies

```bash
npm ci --only=production
```

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

### 3.3 Build Application

```bash
npm run build
```

## Step 4: Start Application

### 4.1 Using Custom Server

```bash
NODE_ENV=production npm run start:prod
```

### 4.2 Using PM2 (Recommended)

First install PM2 globally:

```bash
npm install -g pm2
```

Then start the application:

```bash
pm2 start ecosystem.config.js --env production
```

## Step 5: Domain and SSL Configuration

### 5.1 Point Domain to Server

Configure your DNS to point your domain to your server's IP address.

### 5.2 Set Up SSL Certificate

Using Let's Encrypt with Certbot:

```bash
sudo certbot --nginx -d yourdomain.com
```

## Step 6: Monitoring and Maintenance

### 6.1 Set Up Health Checks

The application includes a health check endpoint at `/api/health`.

### 6.2 Configure Backups

Set up regular database backups:

```bash
pg_dump gemstone_store > backup_$(date +%Y%m%d).sql
```

### 6.3 Monitor Logs

Check application logs regularly:

```bash
pm2 logs shankarmala
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in environment variables
   - Verify PostgreSQL is running
   - Ensure database user has proper permissions

2. **Stripe Integration Not Working**
   - Verify Stripe API keys are correct
   - Check that keys are for the correct environment (live vs test)

3. **Email Not Sending**
   - Verify email service credentials
   - Check that your email provider allows SMTP access

### Getting Help

For support, contact the development team or check the application logs for error messages.
