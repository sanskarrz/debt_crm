# Debt Recovery CRM - Deployment Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Windows Setup

```bash
# Clone and setup
git clone <repository-url>
cd debt-recovery-crm

# Run setup script
setup.bat

# Start development environment
start-dev.bat
```

### Linux/Mac Setup

```bash
# Clone and setup
git clone <repository-url>
cd debt-recovery-crm

# Run setup script
chmod +x setup.sh
./setup.sh

# Start development environment
chmod +x start-dev.sh
./start-dev.sh
```

## 🔧 Configuration

### 1. SIP Trunk Configuration

Edit `asterisk/config/sip.conf`:

```ini
[airtel-trunk]
type = peer
host = sip.airtel.in
port = 5060
username = YOUR_USERNAME
secret = YOUR_PASSWORD
fromuser = YOUR_USERNAME
fromdomain = sip.airtel.in
context = outbound
callerid = 1401234567
```

### 2. GSM Gateway Configuration

Edit `asterisk/config/sip.conf`:

```ini
[gsm-gateway]
type = peer
host = 192.168.1.100
port = 5060
username = goip
secret = goip123
context = outbound
```

### 3. Environment Variables

Copy and edit environment files:

```bash
cp backend/env.example backend/.env
cp dialer/env.example dialer/.env
```

Update with your configuration:

```env
# Backend .env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/debt_recovery_crm
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
PORT=3001

# Dialer .env
REDIS_URL=redis://localhost:6379
ASTERISK_URL=http://localhost:8088
ASTERISK_USER=admin
ASTERISK_PASSWORD=admin
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/debt_recovery_crm
PORT=3002
```

## 📊 Database Setup

The database is automatically initialized with:

- Complete schema for all tables
- Default admin user (admin/admin123)
- Sample SIP and GSM routes
- Proper indexes for performance

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Dialer Service**: http://localhost:3002
- **Asterisk ARI**: http://localhost:8088

## 🔐 Default Credentials

- **Admin User**: admin2 / admin123
- **Asterisk ARI**: admin / admin

## 📱 Features Overview

### Supervisor Panel

- Campaign management
- Allocation uploads (CSV/Excel)
- Real-time monitoring
- Agent management
- Comprehensive reports

### Agent Panel

- Progressive dialing (manual "Call Next")
- Predictive dialing (automatic)
- Call disposition capture
- Callback scheduling
- DNC management

### Compliance Features

- ✅ TRAI DLT compliance
- ✅ DPDP 2023 data privacy
- ✅ TCCCPR 2018 time windows (09:00-21:00 IST)
- ✅ Abandonment control (≤3%)
- ✅ Call recording
- ✅ Audit trails

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/profile` - Get user profile

### Campaigns

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/toggle-active` - Toggle campaign status

### Allocations

- `GET /api/allocations` - List allocations
- `POST /api/allocations` - Create allocation
- `POST /api/allocations/upload` - Upload CSV/Excel file
- `GET /api/allocations/next/:agentId` - Get next allocation for agent

### Call Attempts

- `GET /api/call-attempts` - List call attempts
- `POST /api/call-attempts` - Create call attempt
- `PATCH /api/call-attempts/:id/status` - Update call status

### Reports

- `GET /api/reports/campaign/:id` - Campaign report
- `GET /api/reports/agent/:id` - Agent report
- `GET /api/reports/overall` - Overall report

## 🐳 Docker Services

### Infrastructure

- **PostgreSQL**: Database server
- **Redis**: Caching and pub/sub
- **Asterisk**: PBX with ARI

### Application

- **Backend**: NestJS API server
- **Frontend**: Next.js web application
- **Dialer**: Node.js dialer service

## 📈 Monitoring

### Real-time Metrics

- Call statistics
- Agent performance
- Campaign progress
- Abandonment rates

### Reports

- Campaign analytics
- Agent KPIs
- PTP tracking
- Compliance reports

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Encrypted PII data
- Secure API endpoints
- Audit logging

## 🚨 Troubleshooting

### Common Issues

1. **Asterisk Connection Failed**

   - Check Asterisk container is running
   - Verify ARI credentials
   - Check firewall settings

2. **Database Connection Failed**

   - Ensure PostgreSQL is running
   - Check connection string
   - Verify database exists

3. **Redis Connection Failed**

   - Check Redis container status
   - Verify Redis URL
   - Check port availability

4. **SIP Calls Not Working**
   - Verify SIP trunk credentials
   - Check network connectivity
   - Review Asterisk logs

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs asterisk
```

## 📞 Support

For technical support:

1. Check the logs for errors
2. Verify configuration settings
3. Ensure all services are running
4. Review the troubleshooting section

## 🔄 Updates

To update the system:

1. Pull latest changes
2. Run `npm run install:all`
3. Restart services with `docker-compose restart`
4. Check for any new configuration requirements
