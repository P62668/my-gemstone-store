# Gemstone Store - Launch Ready

This document provides instructions for launching the Gemstone Store application in production mode.

## Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)
- SQLite database (included in the project)

## Quick Start

1. **Start the application:**
   ```bash
   ./start.sh
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

3. **Stop the application:**
   ```bash
   ./stop.sh
   ```

## Manual Launch Instructions

If you prefer to start the application manually:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the standalone server:**
   ```bash
   node .next/standalone/server.js
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## Admin Login

To access the admin panel, you'll need to log in with admin credentials. If you haven't created an admin user yet, you can create one using the following script:

```bash
node scripts/create-admin-user.js
```

## Environment Variables

The application uses the following environment variables (configured in `.env` file):

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Secret for authentication
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_SITE_URL`: Site URL

## Troubleshooting

1. **Port already in use:**
   ```bash
   # Kill processes on port 3000
   lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
   ```

2. **Rebuild the application:**
   ```bash
   # Clean build artifacts
   rm -rf .next
   
   # Rebuild
   npm run build
   ```

3. **Check application logs:**
   ```bash
   # View logs (if using PM2 or similar process manager)
   tail -f logs/app.log
   ```

## Production Deployment

For production deployment, consider using:

1. **PM2 Process Manager:**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start application with PM2
   pm2 start .next/standalone/server.js --name gemstone-store
   
   # Save PM2 configuration
   pm2 save
   ```

2. **Docker Deployment:**
   ```bash
   # Build Docker image
   docker build -t gemstone-store .
   
   # Run container
   docker run -p 3000:3000 gemstone-store
   ```

3. **Nginx Reverse Proxy:**
   Configure Nginx to proxy requests to the Node.js server for better performance and SSL termination.

## Security Considerations

1. **Change default secrets:**
   - Update `NEXTAUTH_SECRET` in `.env` file
   - Update database credentials if using a different database

2. **SSL Configuration:**
   - Use HTTPS in production
   - Configure SSL certificates

3. **Firewall:**
   - Restrict access to necessary ports only

4. **Regular Updates:**
   - Keep dependencies up to date
   - Monitor for security vulnerabilities

## Support

For any issues or questions, please contact the development team.