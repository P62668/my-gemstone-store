# SSL Configuration for Production

## Required SSL Files

Place the following SSL certificate files in this directory for production deployment:

- `server.crt`: Your SSL certificate file
- `server.key`: Your SSL private key file

## Obtaining SSL Certificates

### Option 1: Let's Encrypt (Recommended for Production)

Use Certbot to obtain free SSL certificates from Let's Encrypt:

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then copy the generated certificates to this directory:

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./server.key
```

### Option 2: Self-Signed Certificates (Development Only)

For development or testing, you can generate self-signed certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
```

## Security Considerations

- Ensure the private key (`server.key`) has restricted permissions: `chmod 600 server.key`
- Never commit SSL private keys to version control
- Set up automatic renewal for Let's Encrypt certificates
- Consider using a stronger cipher suite for high-security applications