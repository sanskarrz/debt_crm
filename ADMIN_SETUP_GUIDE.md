# Admin Panel Setup Guide

## 🎯 **Admin Panel Features**

The new admin panel provides comprehensive system management capabilities:

### **1. SIP Trunk Configuration**

- Add multiple SIP trunk providers (Airtel, Tata, Vi, etc.)
- Test connection before going live
- Manage caller IDs and credentials
- Enable/disable trunks as needed

### **2. GSM Gateway Setup**

- Configure GSM gateways (GoIP, Dinstar, etc.)
- Monitor channel status and signal strength
- Test gateway connectivity
- Manage multiple gateways

### **3. User Management**

- Create supervisors and agents
- Manage user roles and permissions
- Enable/disable user accounts
- Reset passwords

### **4. Connection Guide**

- Step-by-step setup instructions
- Troubleshooting tips
- Network requirements
- Hardware configuration

## 🚀 **Quick Start**

### **Step 1: Access Admin Panel**

1. **Login with Admin Credentials**:

   - Username: `admin2`
   - Password: `admin123`
   - URL: http://localhost:3000

2. **Navigate to Admin Dashboard**:
   - The system will automatically redirect admin users to `/admin`

### **Step 2: Configure SIP Trunk**

1. **Go to "SIP Trunk Configuration" tab**
2. **Click "Add SIP Trunk"**
3. **Fill in the details**:
   ```
   Name: Airtel Business
   Provider: Airtel
   Host: sip.airtel.in
   Port: 5060
   Username: your_airtel_username
   Password: your_airtel_password
   Caller ID: 1401234567
   ```
4. **Click "Create SIP Trunk"**
5. **Test the connection** using the "Test" button

### **Step 3: Setup GSM Gateway**

1. **Go to "GSM Gateway Setup" tab**
2. **Click "Add GSM Gateway"**
3. **Fill in the details**:
   ```
   Name: GoIP Gateway
   Gateway Host: 192.168.1.100
   Gateway Port: 5060
   Username: goip
   Password: goip123
   Channel Count: 4
   ```
4. **Click "Create GSM Gateway"**
5. **Test the connection** using the "Test" button

### **Step 4: Create Users**

1. **Go to "User Management" tab**
2. **Click "Add User"**
3. **Create a Supervisor**:
   ```
   Username: supervisor1
   Email: supervisor@company.com
   Password: password123
   Role: Supervisor
   First Name: John
   Last Name: Doe
   Phone: +91-9876543210
   ```
4. **Create an Agent**:
   ```
   Username: agent1
   Email: agent@company.com
   Password: password123
   Role: Agent
   First Name: Jane
   Last Name: Smith
   Phone: +91-9876543211
   ```

## 🔧 **Detailed Configuration**

### **SIP Trunk Setup**

#### **Airtel Business**

```ini
Provider: Airtel
Host: sip.airtel.in
Port: 5060
Username: your_airtel_username
Password: your_airtel_password
Caller ID: 1401234567 (must be registered with TRAI)
```

#### **Tata Communications**

```ini
Provider: Tata
Host: sip.tatacommunications.com
Port: 5060
Username: your_tata_username
Password: your_tata_password
Caller ID: 1401234567
```

#### **Vi Business**

```ini
Provider: Vi
Host: sip.vodafone.in
Port: 5060
Username: your_vi_username
Password: your_vi_password
Caller ID: 1401234567
```

### **GSM Gateway Setup**

#### **GoIP Gateway**

```ini
Name: GoIP Gateway
Gateway Host: 192.168.1.100
Gateway Port: 5060
Username: goip
Password: goip123
Channel Count: 4
```

#### **Dinstar Gateway**

```ini
Name: Dinstar Gateway
Gateway Host: 192.168.1.101
Gateway Port: 5060
Username: admin
Password: admin123
Channel Count: 8
```

## 📋 **Hardware Requirements**

### **GSM Gateway Setup**

1. **Power On the Gateway**:

   - Connect power adapter
   - Wait for boot sequence to complete
   - Check LED indicators

2. **Network Configuration**:

   - Connect Ethernet cable to your network
   - Note the IP address (usually 192.168.1.100)
   - Access web interface: http://192.168.1.100

3. **SIM Card Installation**:

   - Insert SIM cards in all channels
   - Ensure SIM cards are activated
   - Check signal strength

4. **Gateway Configuration**:
   ```
   SIP Server: Your Asterisk IP (e.g., 192.168.1.50)
   SIP Port: 5060
   Username: goip
   Password: goip123
   Codec: ulaw/alaw
   ```

## 🌐 **Network Configuration**

### **Firewall Ports**

```
5060 UDP/TCP - SIP signaling
10000-20000 UDP - RTP media
8088 TCP - Asterisk ARI
3000-3002 TCP - Application ports
```

### **Router Configuration**

1. **Port Forwarding**:

   - Forward port 5060 to Asterisk server
   - Forward RTP ports 10000-20000
   - Forward port 8088 for ARI

2. **NAT Settings**:
   - Enable SIP ALG if available
   - Configure proper NAT traversal
   - Set up static IP for Asterisk server

## 🔍 **Testing & Troubleshooting**

### **SIP Trunk Testing**

1. **Connection Test**:

   - Use the "Test" button in admin panel
   - Check Asterisk logs: `docker-compose logs asterisk`
   - Verify registration status

2. **Common Issues**:
   - **Registration Failed**: Check credentials and firewall
   - **No Audio**: Check RTP port configuration
   - **Call Rejected**: Verify caller ID registration

### **GSM Gateway Testing**

1. **Connection Test**:

   - Use the "Test" button in admin panel
   - Check channel status
   - Verify SIM card activation

2. **Common Issues**:
   - **No Signal**: Check SIM card and antenna
   - **Registration Failed**: Verify SIP settings
   - **Channels Busy**: Check SIM card status

### **User Management**

1. **Login Issues**:

   - Verify user is active
   - Check password complexity
   - Ensure proper role assignment

2. **Permission Issues**:
   - Verify user role
   - Check campaign assignments
   - Review access controls

## 📊 **Monitoring & Maintenance**

### **System Health**

- Monitor SIP trunk status
- Check GSM gateway channels
- Review call statistics
- Monitor system resources

### **Regular Maintenance**

- Update SIP trunk credentials
- Check SIM card balances
- Review user accounts
- Backup configuration

## 🚨 **Security Best Practices**

1. **Change Default Passwords**:

   - Update admin password
   - Change SIP trunk passwords
   - Secure GSM gateway access

2. **Network Security**:

   - Use VPN for remote access
   - Enable firewall rules
   - Regular security updates

3. **User Management**:
   - Regular password updates
   - Role-based access control
   - Audit user activities

## 📞 **Support & Help**

### **Getting Help**

1. Check the "Connection Guide" tab
2. Review system logs
3. Test individual components
4. Contact technical support

### **Common Commands**

```bash
# Check Docker services
docker-compose ps

# View logs
docker-compose logs asterisk
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart asterisk
docker-compose restart backend
```

The admin panel provides a complete solution for managing your debt recovery call center system with easy-to-use interfaces for all configuration tasks! 🎉
