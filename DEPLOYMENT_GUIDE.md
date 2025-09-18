# Production Deployment Guide

This guide will help you deploy the gemstone store application to a production environment.

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database
3. Domain name with SSL certificate
4. Stripe account with live API keys
5. Email service (SMTP) credentials

## Step 1: Environment Configuration

1. Copy the `.env.production` file and fill in all required values:
   ```bash
   cp .env.production .env.local
   ```

2. Update the following critical values:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A random 32+ character secret
   - `STRIPE_PUBLISHABLE_KEY` - Your live Stripe publishable key
   - `STRIPE_SECRET_KEY` - Your live Stripe secret key
   - `NEXTAUTH_URL` - Your production domain (e.g., https://yourdomain.com)
   - Email configuration values

## Step 2: Database Setup

1. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the database with initial data:
   ```bash
   npm run seed
   ```

## Step 3: Build the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

## Step 4: Start the Application

1. Start the application in production mode:
   ```bash
   npm start
   ```

   Or use a process manager like PM2:
   ```bash
   pm2 start server.js --name gemstone-store
   ```

## Step 5: Configure Reverse Proxy (Nginx)

If using Nginx, configure it to proxy requests to your Node.js application:

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

## Step 6: Configure Stripe Webhooks

1. In your Stripe Dashboard, add a webhook endpoint:
   - URL: `https://yourdomain.com/api/checkout/webhook`
   - Events: `checkout.session.completed`

2. Copy the webhook signing secret and add it to your `.env.local` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## Step 7: Set Up Monitoring

1. Configure health checks to monitor `/api/health`
2. Set up logging to monitor application performance
3. Configure error reporting to receive notifications about issues

## Troubleshooting

### Payment Issues
- Ensure `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are set to live keys, not test keys
- Verify the webhook is properly configured in Stripe Dashboard

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is consistent across all instances
- Verify `NEXTAUTH_URL` matches your production domain exactly

### Database Issues
- Check that `DATABASE_URL` is correct and the database is accessible
- Ensure all migrations have been applied

## Security Considerations

1. Never commit `.env` files to version control
2. Use strong, unique passwords for all services
3. Regularly update dependencies
4. Monitor logs for suspicious activity
5. Use HTTPS for all production traffic
6. Implement proper rate limiting
7. Regularly backup your database

## Performance Optimization

1. Use a CDN for static assets
2. Implement caching strategies
3. Optimize database queries
4. Use compression for responses
5. Monitor and optimize image sizes

## Maintenance

1. Regularly update dependencies
2. Monitor application performance
3. Backup database regularly
4. Review and rotate API keys periodically
5. Keep SSL certificates up to date