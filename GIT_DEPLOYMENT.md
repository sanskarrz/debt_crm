# Git Deployment Guide

## 🚀 **Deploying Debt Recovery CRM to Git**

This guide will help you deploy the Debt Recovery CRM system to Git repositories for version control and collaboration.

## 📋 **Prerequisites**

1. **Git installed** on your system
2. **GitHub/GitLab account** (or any Git hosting service)
3. **Node.js 18+** installed
4. **Docker and Docker Compose** installed

## 🔧 **Step 1: Initialize Git Repository**

### **Local Git Setup**

```bash
# Navigate to project directory
cd debt-recovery-crm

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Debt Recovery CRM with Admin Panel"

# Set main branch
git branch -M main
```

### **Create Remote Repository**

1. **GitHub**:
   - Go to https://github.com/new
   - Repository name: `debt-recovery-crm`
   - Description: `Debt Recovery Call Center CRM with SIP Trunk & GSM Gateway Integration`
   - Set to Public or Private
   - Don't initialize with README (we already have one)

2. **GitLab**:
   - Go to https://gitlab.com/projects/new
   - Project name: `debt-recovery-crm`
   - Set visibility level
   - Don't initialize with README

3. **Bitbucket**:
   - Go to https://bitbucket.org/repo/create
   - Repository name: `debt-recovery-crm`
   - Set access level
   - Don't initialize with README

## 🔗 **Step 2: Connect to Remote Repository**

```bash
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/debt-recovery-crm.git

# Verify remote
git remote -v

# Push to remote repository
git push -u origin main
```

## 📁 **Step 3: Repository Structure**

Your Git repository will have this structure:

```
debt-recovery-crm/
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── dialer/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── asterisk/
│   └── config/
├── database/
│   └── init.sql
├── docker-compose.yml
├── setup-admin.bat
├── setup-admin.sh
├── README.md
├── LICENSE
├── .gitignore
└── .gitattributes
```

## 🔄 **Step 4: Workflow Setup**

### **Development Workflow**

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub/GitLab
```

### **Maintenance Workflow**

```bash
# Update from main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/fix-issue

# Make fixes and commit
git add .
git commit -m "Fix: description of fix"

# Push and create PR
git push origin hotfix/fix-issue
```

## 🐳 **Step 5: Docker Deployment**

### **Production Docker Compose**

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: debt_recovery_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network

  asterisk:
    image: andrius/asterisk:18-current
    ports:
      - "5060:5060/udp"
      - "5060:5060/tcp"
      - "10000-20000:10000-20000/udp"
      - "8088:8088"
    volumes:
      - ./asterisk/config:/etc/asterisk
    environment:
      - ASTERISK_UID=1000
      - ASTERISK_GID=1000
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/debt_recovery_crm
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    restart: unless-stopped

  dialer:
    build: ./dialer
    ports:
      - "3002:3002"
    environment:
      - REDIS_URL=redis://redis:6379
      - ASTERISK_URL=http://asterisk:8088
      - ASTERISK_USER=admin
      - ASTERISK_PASSWORD=${ASTERISK_PASSWORD}
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/debt_recovery_crm
    depends_on:
      - redis
      - asterisk
      - backend
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3001
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### **Environment Variables**

Create `.env.prod`:

```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
ASTERISK_PASSWORD=your-asterisk-password
SERVER_IP=your-server-ip
```

## 🚀 **Step 6: Deployment Options**

### **Option 1: VPS/Cloud Server**

```bash
# Clone repository on server
git clone https://github.com/yourusername/debt-recovery-crm.git
cd debt-recovery-crm

# Copy production environment
cp .env.prod .env

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Option 2: Docker Hub**

```bash
# Build and push images
docker build -t yourusername/debt-recovery-backend ./backend
docker build -t yourusername/debt-recovery-frontend ./frontend
docker build -t yourusername/debt-recovery-dialer ./dialer

# Push to Docker Hub
docker push yourusername/debt-recovery-backend
docker push yourusername/debt-recovery-frontend
docker push yourusername/debt-recovery-dialer
```

### **Option 3: GitHub Actions (CI/CD)**

The repository includes GitHub Actions workflow for automated testing and deployment.

## 📋 **Step 7: Branch Strategy**

### **Recommended Branch Structure**

```
main (production)
├── develop (development)
├── feature/new-feature
├── hotfix/critical-fix
└── release/v1.0.0
```

### **Branch Protection Rules**

1. **Main Branch**:
   - Require pull request reviews
   - Require status checks to pass
   - Require up-to-date branches
   - Restrict pushes to main

2. **Develop Branch**:
   - Require pull request reviews
   - Allow force pushes for maintainers

## 🔒 **Step 8: Security Considerations**

### **Secrets Management**

1. **Environment Variables**:
   - Never commit `.env` files
   - Use environment-specific configs
   - Rotate secrets regularly

2. **GitHub Secrets** (for CI/CD):
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `ASTERISK_PASSWORD`
   - `SERVER_IP`

### **Access Control**

1. **Repository Permissions**:
   - Admin: Full access
   - Maintain: Push to protected branches
   - Write: Push to non-protected branches
   - Read: Clone and pull

2. **Branch Protection**:
   - Enable branch protection rules
   - Require reviews for main branch
   - Require status checks

## 📊 **Step 9: Monitoring and Maintenance**

### **Health Checks**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Monitor resources
docker stats
```

### **Backup Strategy**

```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres debt_recovery_crm > backup.sql

# Configuration backup
tar -czf config-backup.tar.gz asterisk/config database/
```

## 🆘 **Step 10: Troubleshooting**

### **Common Git Issues**

1. **Merge Conflicts**:
   ```bash
   git status
   git diff
   # Resolve conflicts manually
   git add .
   git commit
   ```

2. **Large Files**:
   ```bash
   # Add to .gitignore
   echo "large-file.zip" >> .gitignore
   git rm --cached large-file.zip
   git commit -m "Remove large file"
   ```

3. **Reset to Previous Commit**:
   ```bash
   git log --oneline
   git reset --hard <commit-hash>
   git push --force-with-lease
   ```

### **Docker Issues**

1. **Port Conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   # Kill process using port
   sudo kill -9 <PID>
   ```

2. **Container Won't Start**:
   ```bash
   # Check logs
   docker-compose logs <service-name>
   # Rebuild containers
   docker-compose up --build --force-recreate
   ```

## 📚 **Step 11: Documentation**

### **Repository Documentation**

1. **README.md** - Main project documentation
2. **ADMIN_SETUP_GUIDE.md** - Admin panel setup
3. **DEPLOYMENT.md** - Deployment instructions
4. **GIT_DEPLOYMENT.md** - This guide
5. **API Documentation** - API endpoints and usage

### **Code Documentation**

1. **Inline Comments** - Explain complex logic
2. **JSDoc/TSDoc** - Function documentation
3. **Architecture Diagrams** - System overview
4. **API Documentation** - Endpoint specifications

## 🎉 **Step 12: Go Live Checklist**

- [ ] Repository created and configured
- [ ] All code committed and pushed
- [ ] Branch protection rules enabled
- [ ] CI/CD pipeline configured
- [ ] Production environment set up
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team access configured

## 🔄 **Step 13: Ongoing Maintenance**

### **Regular Tasks**

1. **Weekly**:
   - Review pull requests
   - Check system health
   - Update dependencies

2. **Monthly**:
   - Security updates
   - Performance review
   - Backup verification

3. **Quarterly**:
   - Major version updates
   - Security audit
   - Documentation review

Your Debt Recovery CRM system is now ready for Git deployment and collaborative development! 🚀

