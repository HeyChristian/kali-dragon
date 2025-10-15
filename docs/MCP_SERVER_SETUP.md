# 🚀 MCP Server Setup Guide

This guide explains how to install and configure the Model Context Protocol (MCP) server on your Kali Linux VM using Kali Dragon.

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard for secure, controlled access to external resources by AI models. In the context of Kali Dragon, it provides:

- **Secure Communication** between your host and Kali VM
- **Controlled Access** to penetration testing tools
- **Context Sharing** for AI-assisted security testing
- **Audit Logging** of all operations

## Prerequisites

Before setting up the MCP server:

- ✅ Kali Linux VM properly configured and running
- ✅ SSH access to Kali VM established
- ✅ Python 3.8+ installed on Kali VM
- ✅ Network connectivity between host and VM

## Automatic Setup via Kali Dragon

### Using the Web Interface

1. **Open Kali Dragon** in your web browser
2. **Navigate to Setup tab** (🏗️ Setup)
3. **Click "🚀 Setup MCP Server"**
4. **Follow the guided setup process**

The automatic setup will:
- Install required Python packages
- Configure MCP server settings
- Set up security credentials
- Start the MCP service
- Verify connectivity

### Manual Verification

After automatic setup, verify in the Kali Dragon terminal:
```bash
# Check MCP server status
curl -X GET http://192.168.1.100:8080/health

# Test MCP endpoint
curl -X POST http://192.168.1.100:8080/mcp/ping \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## Manual Setup (Advanced)

If you prefer manual installation or need to troubleshoot:

### 1. Install Dependencies

On your Kali VM:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python dependencies
sudo apt install -y python3-pip python3-venv python3-dev

# Install required system packages
sudo apt install -y curl wget git build-essential
```

### 2. Create MCP Environment

```bash
# Create MCP directory
mkdir -p ~/kali-mcp-server
cd ~/kali-mcp-server

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install MCP dependencies
pip install --upgrade pip
pip install fastapi uvicorn pydantic requests paramiko psutil
```

### 3. Download MCP Server Code

```bash
# Clone or download MCP server files
# (This will integrate with your existing kali_mcp_server_fixed.js)
wget https://raw.githubusercontent.com/HeyChristian/kali-dragon/main/kali_mcp_server_fixed.js

# Convert to Python or use Node.js runtime
sudo apt install -y nodejs npm
```

### 4. Configure MCP Server

Create configuration file:
```bash
# Create config directory
mkdir -p ~/kali-mcp-server/config

# Create main configuration
cat > ~/kali-mcp-server/config/mcp_config.json << 'EOF'
{
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "debug": true
  },
  "security": {
    "api_key_required": true,
    "allowed_hosts": ["192.168.1.0/24", "10.0.0.0/8"],
    "rate_limit": {
      "requests_per_minute": 100,
      "burst_limit": 10
    }
  },
  "logging": {
    "level": "INFO",
    "file": "/var/log/kali-mcp.log",
    "max_size_mb": 100,
    "backup_count": 5
  },
  "tools": {
    "enabled": ["nmap", "nikto", "sqlmap", "gobuster"],
    "timeout_seconds": 300,
    "output_dir": "/tmp/mcp-outputs"
  }
}
EOF
```

### 5. Create MCP Server Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/kali-mcp.service << 'EOF'
[Unit]
Description=Kali MCP Server
After=network.target

[Service]
Type=simple
User=kali
Group=kali
WorkingDirectory=/home/kali/kali-mcp-server
Environment=PATH=/home/kali/kali-mcp-server/venv/bin
ExecStart=/home/kali/kali-mcp-server/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable kali-mcp.service
```

### 6. Start MCP Server

```bash
# Start the service
sudo systemctl start kali-mcp.service

# Check status
sudo systemctl status kali-mcp.service

# View logs
sudo journalctl -u kali-mcp.service -f
```

## Security Configuration

### API Key Setup

```bash
# Generate secure API key
API_KEY=$(openssl rand -hex 32)
echo "Generated API Key: $API_KEY"

# Save API key securely
echo "$API_KEY" > ~/kali-mcp-server/config/.api_key
chmod 600 ~/kali-mcp-server/config/.api_key

# Add to environment
echo "export MCP_API_KEY=$API_KEY" >> ~/.bashrc
source ~/.bashrc
```

### Firewall Configuration

```bash
# Allow MCP port
sudo ufw allow 8080/tcp

# Limit SSH access
sudo ufw limit ssh

# Check firewall status
sudo ufw status
```

### SSL/TLS Setup (Recommended)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/kali-mcp.key \
  -out /etc/ssl/certs/kali-mcp.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=kali-mcp"

# Set appropriate permissions
sudo chmod 600 /etc/ssl/private/kali-mcp.key
sudo chmod 644 /etc/ssl/certs/kali-mcp.crt
```

## Testing MCP Server

### Basic Connectivity Test

```bash
# Test server health
curl -k https://192.168.1.100:8080/health

# Test with API key
curl -k -H "X-API-Key: $MCP_API_KEY" \
  https://192.168.1.100:8080/mcp/tools/list
```

### Tool Execution Test

```bash
# Test nmap integration
curl -k -H "X-API-Key: $MCP_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://192.168.1.100:8080/mcp/tools/nmap \
  -d '{"target": "127.0.0.1", "options": ["-sT", "-p", "22,80,443"]}'
```

### Performance Test

```bash
# Run performance benchmark
ab -n 100 -c 10 -H "X-API-Key: $MCP_API_KEY" \
  http://192.168.1.100:8080/health
```

## Integration with Kali Dragon

### Configure Connection

In Kali Dragon web interface:
1. Navigate to **⚙️ Management** tab
2. Click **"🔧 Reset"** to configure settings
3. Enter MCP server details:
   - **Host**: Your Kali VM IP
   - **Port**: 8080
   - **API Key**: Your generated API key
   - **SSL**: Enable if using HTTPS

### Test Integration

```bash
# In Kali Dragon terminal, test MCP connection
curl -H "X-API-Key: YOUR_API_KEY" \
  http://192.168.1.100:8080/mcp/status
```

## Available MCP Tools

Once configured, you can use these tools through Kali Dragon:

### Network Discovery
```bash
# Nmap port scan
mcp-nmap -target 192.168.1.0/24 -ports 22,80,443

# Network discovery
mcp-discover -range 192.168.1.0/24
```

### Web Application Testing
```bash
# Directory enumeration
mcp-gobuster -url http://target.com -wordlist common

# Nikto web scan
mcp-nikto -host target.com
```

### Vulnerability Assessment
```bash
# SQL injection testing
mcp-sqlmap -url "http://target.com/page.php?id=1"

# Custom vulnerability scan
mcp-scan -target target.com -profile web
```

## Monitoring and Logging

### Log Files

```bash
# MCP server logs
tail -f /var/log/kali-mcp.log

# System service logs
journalctl -u kali-mcp.service -f

# Security audit logs
tail -f /var/log/auth.log
```

### Performance Monitoring

```bash
# Check resource usage
htop

# Monitor network connections
netstat -tlnp | grep :8080

# Check disk space
df -h /tmp/mcp-outputs
```

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status kali-mcp.service

# View detailed logs
journalctl -u kali-mcp.service --no-pager

# Check configuration syntax
python -m json.tool config/mcp_config.json
```

### Connection Issues

```bash
# Test network connectivity
ping 192.168.1.100

# Check port accessibility
telnet 192.168.1.100 8080

# Verify firewall rules
sudo ufw status numbered
```

### Permission Problems

```bash
# Check file permissions
ls -la ~/kali-mcp-server/

# Fix ownership issues
sudo chown -R kali:kali ~/kali-mcp-server/

# Check log file permissions
sudo chmod 644 /var/log/kali-mcp.log
```

## Maintenance

### Regular Updates

```bash
# Update MCP server code
cd ~/kali-mcp-server
git pull origin main

# Update Python dependencies
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Restart service
sudo systemctl restart kali-mcp.service
```

### Backup Configuration

```bash
# Create backup directory
mkdir -p ~/backups/mcp-config

# Backup configuration
cp -r ~/kali-mcp-server/config ~/backups/mcp-config/
cp /etc/systemd/system/kali-mcp.service ~/backups/mcp-config/
```

### Log Rotation

```bash
# Configure logrotate for MCP logs
sudo tee /etc/logrotate.d/kali-mcp << 'EOF'
/var/log/kali-mcp.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        systemctl reload kali-mcp.service > /dev/null 2>&1 || true
    endscript
}
EOF
```

## Security Best Practices

1. **Change Default Credentials**: Always use strong, unique API keys
2. **Enable HTTPS**: Use SSL/TLS for all communications
3. **Limit Network Access**: Use firewall rules to restrict access
4. **Monitor Logs**: Regularly review logs for suspicious activity
5. **Update Regularly**: Keep MCP server and dependencies updated
6. **Backup Configurations**: Maintain secure backups of configurations

---

🐉 **Your MCP Server is ready!** You can now use advanced penetration testing tools through the secure MCP interface from Kali Dragon.