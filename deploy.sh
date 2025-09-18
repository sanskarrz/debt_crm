#!/bin/bash

# Debt Recovery CRM - Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Debt Recovery CRM Deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script as root or with sudo"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker and Docker Compose
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx and Certbot
echo "🔒 Installing Nginx and SSL tools..."
apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5060/udp  # SIP
ufw allow 10000:20000/udp  # RTP

# Create application directory
APP_DIR="/opt/debt-recovery-crm"
echo "📁 Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or copy application
if [ ! -d ".git" ]; then
    echo "📥 Please copy your application files to $APP_DIR"
    echo "Or clone from repository: git clone <your-repo-url> ."
    read -p "Press Enter when files are ready..."
fi

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp env.prod.example .env
    echo "🔧 Please edit .env file with your configuration:"
    echo "  - Set your domain name"
    echo "  - Set secure passwords"
    echo "  - Configure SIP trunk details"
    read -p "Press Enter when .env is configured..."
fi

# Create SSL certificate directory
mkdir -p nginx/ssl

# Get domain from .env
DOMAIN=$(grep DOMAIN .env | cut -d '=' -f2)

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "your-domain.com" ]; then
    echo "🔒 Obtaining SSL certificate for $DOMAIN..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Copy certificates for Docker
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
else
    echo "⚠️  No domain configured. Creating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=IN/ST=State/L=City/O=Organization/CN=localhost"
fi

# Set proper permissions
chown -R root:root $APP_DIR
chmod +x deploy.sh

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Setup automatic SSL renewal
echo "🔄 Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $APP_DIR/docker-compose.prod.yml restart nginx") | crontab -

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/debt-recovery-crm << EOF
/opt/debt-recovery-crm/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/debt-recovery-crm/docker-compose.prod.yml restart nginx
    endscript
}
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > /opt/backup-crm.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker exec debt-recovery-crm_postgres_1 pg_dump -U postgres debt_recovery_crm > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /opt/debt-recovery-crm --exclude=node_modules --exclude=.git .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/backup-crm.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-crm.sh") | crontab -

echo "✅ Deployment completed!"
echo ""
echo "🎉 Your Debt Recovery CRM is now running!"
echo "📱 Access your application at: https://$DOMAIN"
echo "🔐 Default admin credentials: admin2 / admin123"
echo ""
echo "📋 Next steps:"
echo "1. Login and change default passwords"
echo "2. Configure SIP trunk settings"
echo "3. Setup GSM gateway connection"
echo "4. Create supervisor and agent users"
echo "5. Start your first campaign"
echo ""
echo "📊 Monitoring:"
echo "- Logs: docker-compose -f docker-compose.prod.yml logs"
echo "- Status: docker-compose -f docker-compose.prod.yml ps"
echo "- Backups: /opt/backups/"
echo ""
echo "🆘 Support: Check the troubleshooting section in README.md"
