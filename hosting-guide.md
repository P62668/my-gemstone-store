# 🚀 Hosting Guide for Gemstone Store

This guide covers hosting your Next.js gemstone store on various providers including Hostinger, Vercel, Netlify, and traditional hosting.

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] Set up production database (PostgreSQL/MySQL)
- [ ] Update DATABASE_URL in environment variables
- [ ] Run database migrations
- [ ] Seed initial data

### 2. Environment Variables
- [ ] Configure all production environment variables
- [ ] Set up JWT_SECRET
- [ ] Configure Stripe production keys
- [ ] Set up email SMTP settings
- [ ] Configure admin credentials

### 3. Build Optimization
- [ ] Run `npm run build` successfully
- [ ] Fix any linting errors
- [ ] Optimize images
- [ ] Test all functionality

## 🏠 Hostinger Deployment

### Step 1: Prepare Your Project
```bash
# Build the project
npm run build

# Create production build
npm run build
```

### Step 2: Upload to Hostinger
1. **Access Hostinger Control Panel**
   - Log in to your Hostinger account
   - Go to File Manager or use FTP

2. **Upload Files**
   - Upload the entire project folder
   - Or use Git deployment if available

3. **Set Up Node.js**
   - In Hostinger control panel, enable Node.js
   - Set Node.js version to 18 or higher
   - Set the entry point to: `server.js`

### Step 3: Create Server File
Create `server.js` in your project root:
```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

### Step 4: Environment Variables
Set these in Hostinger's environment variables section:
```
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 5: Database Setup
1. **Create Database**
   - Use Hostinger's MySQL/PostgreSQL service
   - Or connect external database

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Seed Data**
   ```bash
   npm run prisma:seed
   ```

## 🌐 Other Hosting Providers

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### DigitalOcean App Platform
1. Connect GitHub repository
2. Select Node.js environment
3. Set build command: `npm run build`
4. Set run command: `npm start`

## 🔧 Common Issues & Solutions

### Issue 1: Build Failures
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue 2: Database Connection
**Solution:**
- Check DATABASE_URL format
- Ensure database is accessible
- Test connection locally

### Issue 3: Environment Variables
**Solution:**
- Verify all required variables are set
- Check for typos in variable names
- Ensure proper formatting

### Issue 4: Image Optimization
**Solution:**
- Configure image domains in next.config.js
- Use proper image formats
- Optimize image sizes

## 📊 Performance Optimization

### 1. Image Optimization
```javascript
// next.config.js
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 2. Bundle Optimization
```javascript
// next.config.js
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['@heroicons/react', 'framer-motion'],
}
```

### 3. Caching Strategy
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

## 🔒 Security Checklist

- [ ] Use HTTPS
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database backup strategy

## 📈 Monitoring & Analytics

### 1. Error Tracking
- Set up Sentry or similar
- Monitor application errors
- Track performance metrics

### 2. Analytics
- Google Analytics
- Custom event tracking
- User behavior analysis

### 3. Uptime Monitoring
- Set up uptime monitoring
- Configure alerts
- Monitor response times

## 🚀 Post-Deployment Checklist

- [ ] Test all pages and functionality
- [ ] Verify admin panel access
- [ ] Test payment processing
- [ ] Check email notifications
- [ ] Verify image uploads
- [ ] Test user registration/login
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test performance
- [ ] Set up monitoring

## 📞 Support

For hosting-specific issues:
- **Hostinger**: Contact their support team
- **Vercel**: Check their documentation
- **Netlify**: Use their community forum
- **General**: Check Next.js documentation

## 🔄 Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error logs
- Backup database regularly
- Check performance metrics
- Update security patches

### Emergency Procedures
- Keep backup of working version
- Document rollback procedures
- Maintain staging environment
- Test updates before production 