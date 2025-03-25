#!/bin/bash

# Step 4: Pull latest code from repository
echo "Pulling latest code from repository..."
git pull origin main

# Step 5: Install dependencies
echo "Installing dependencies..."
npm install

# Step 6: Build the application
echo "Building the application..."
npm run build

# Step 7: Setup PM2 process
echo "Setting up PM2 process..."
pm2 delete skrbl-ai 2>/dev/null || true
pm2 start npm --name "skrbl-ai" -- start
pm2 save

# Step 8: Configure NGINX
echo "Configuring NGINX..."
sudo cat > /etc/nginx/sites-available/skrblai << 'EOL'
server {
    listen 80;
    server_name skrbl.ai www.skrbl.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Step 9: Enable the site and reload NGINX
echo "Enabling site and reloading NGINX..."
sudo ln -sf /etc/nginx/sites-available/skrblai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Step 10: Setup SSL with Certbot (commented out - run manually first time)
echo "SSL setup instructions:"
echo "To setup SSL with Certbot, run the following commands:"
echo "sudo apt-get install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d skrbl.ai -d www.skrbl.ai"

# Step 11: Setup SSL with Certbot (uncomment to use)
# echo "Setting up SSL with Certbot..."
# sudo apt-get install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# sudo systemctl restart nginx

# Step 12: Enable automatic certificate renewal
# echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null

# Build the project
echo "Building SKRBL AI..."
npm run build

# Restart PM2 process
echo "Restarting PM2 process..."
pm2 restart skrblai

# Check SSL certificates
echo "Checking SSL certificates..."
certbot certificates

echo "Deployment complete! SKRBL AI is live."
echo "SKRBL AI scaffold cleanup complete. Ready to build features." 