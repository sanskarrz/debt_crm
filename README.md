# Debt Recovery Call Center CRM

A comprehensive debt recovery call center CRM system with SIP trunk and GSM gateway integration for Indian collections agencies.

## 🚀 Features

- **Admin Panel**: Complete system management with SIP trunk and GSM gateway configuration
- **Supervisor Panel**: Campaign management, allocation uploads, live monitoring
- **Agent Panel**: Progressive and predictive call handling with disposition capture
- **Dialer Service**: Asterisk ARI controlled dialer with SIP trunk and GSM gateway integration
- **Compliance**: TRAI DLT compliance, DNC checks, time window enforcement
- **Reporting**: Comprehensive reports for calls, connects, PTP tracking, and agent KPIs

## 🏗️ Architecture

```
Frontend (Next.js) → Backend API (NestJS) → PostgreSQL
                    ↓
Dialer Service (Node.js) → Asterisk ARI → SIP Trunk → GSM Gateway → Customer Mobile
                    ↓
Redis (Pub/Sub for real-time communication)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/debt-recovery-crm.git
   cd debt-recovery-crm
   ```

2. **Run setup script**
   ```bash
   # Windows
   setup-admin.bat
   
   # Linux/Mac
   chmod +x setup-admin.sh
   ./setup-admin.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Backend API: http://localhost:3001
   - Dialer Service: http://localhost:3002

4. **Login with admin credentials**
   - Username: `admin`
   - Password: `admin123`

## 📋 Admin Panel Setup

### 1. Configure SIP Trunk
- Go to Admin Panel → SIP Trunk Configuration
- Add your telecom provider details (Airtel, Tata, Vi, etc.)
- Test connection before going live

### 2. Setup GSM Gateway
- Go to Admin Panel → GSM Gateway Setup
- Configure your hardware gateway (GoIP, Dinstar, etc.)
- Test connectivity and channel status

### 3. Create Users
- Go to Admin Panel → User Management
- Create supervisors and agents
- Assign appropriate roles

### 4. Start Campaigns
- Login as supervisor
- Create campaigns and upload allocations
- Start debt recovery operations

## 🔧 Configuration

### SIP Trunk Setup
Edit `asterisk/config/sip.conf` with your provider credentials:
```ini
[airtel-trunk]
type = peer
host = sip.airtel.in
port = 5060
username = your_username
secret = your_password
fromuser = your_username
fromdomain = sip.airtel.in
context = outbound
callerid = 1401234567
```

### GSM Gateway Setup
Configure your GSM gateway to connect to Asterisk:
```ini
[gsm-gateway]
type = peer
host = 192.168.1.100
port = 5060
username = goip
secret = goip123
context = outbound
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/profile` - Get user profile

### Admin Panel
- `GET/POST /api/sip-routes` - SIP trunk management
- `GET/POST /api/gsm-routes` - GSM gateway management
- `POST /api/sip-routes/:id/test` - Test SIP connection
- `POST /api/gsm-routes/:id/test` - Test GSM connection

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id` - Update campaign

### Allocations
- `GET /api/allocations` - List allocations
- `POST /api/allocations` - Create allocation
- `POST /api/allocations/upload` - Upload CSV/Excel file

### Call Attempts
- `GET /api/call-attempts` - List call attempts
- `POST /api/call-attempts` - Create call attempt
- `PATCH /api/call-attempts/:id/status` - Update call status

## 🐳 Docker Services

### Infrastructure
- **PostgreSQL**: Database server
- **Redis**: Caching and pub/sub
- **Asterisk**: PBX with ARI

### Application
- **Backend**: NestJS API server
- **Frontend**: Next.js web application
- **Dialer**: Node.js dialer service

## 🔒 Security

- JWT-based authentication
- Role-based access control (Admin, Supervisor, Agent)
- Encrypted PII data
- Secure API endpoints
- Audit logging for compliance

## 📈 Compliance Features

- **TRAI DLT**: Do Not Call (DNC) list integration
- **DPDP 2023**: Data privacy compliance with secure PII handling
- **TCCCPR 2018**: Time window enforcement (09:00-21:00 IST)
- **Abandonment Control**: Automatic throttling to maintain ≤3% abandon rate

## 🚨 Troubleshooting

### Common Issues

1. **Docker Services Not Starting**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Database Connection Failed**
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

3. **Asterisk Connection Failed**
   ```bash
   docker-compose logs asterisk
   docker-compose restart asterisk
   ```

4. **SIP Calls Not Working**
   - Verify SIP trunk credentials
   - Check network connectivity
   - Review Asterisk logs

## 📚 Documentation

- [Admin Setup Guide](ADMIN_SETUP_GUIDE.md) - Detailed admin panel configuration
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](docs/api.md) - Complete API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support and configuration assistance:
1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub
4. Contact the development team

## 🎯 Roadmap

- [ ] Multi-tenant support for BPO operators
- [ ] AI-assisted agent scripting
- [ ] IVR for debtor self-service
- [ ] WhatsApp/SMS integration
- [ ] Payment gateway integration
- [ ] Mobile agent apps

---

**Built with ❤️ for Indian debt recovery agencies**