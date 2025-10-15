# 🔧 Troubleshooting Guide

Comprehensive solutions for common Kali Dragon MCP setup issues.

## 📋 Quick Diagnostic Checklist

Before diving into specific issues, run this quick diagnostic:

```bash
# 1. Check Node.js
node --version

# 2. Check network connectivity
ping -c 3 google.com

# 3. Check if ports are available
lsof -i :8000
lsof -i :3000

# 4. Check Kali VM connectivity (replace IP)
ping -c 3 192.168.64.3
ssh -T kali@192.168.64.3 'echo "SSH working"'
```

---

## 🚨 Common Setup Issues

## Quick Diagnosis

### Check System Status
In the Kali Dragon terminal, run:
```bash
# System information
echo "=== SYSTEM INFO ==="
uname -a
echo "Node.js: $(node --version)"
echo "Python: $(python3 --version 2>/dev/null || echo 'Not found')"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not found')"

# Network connectivity
echo -e "\n=== NETWORK ==="
ping -c 3 google.com
echo "Local IP: $(hostname -I | awk '{print $1}')"

# Port status
echo -e "\n=== PORTS ==="
netstat -tlnp | grep :8000 || echo "Port 8000 not listening"
```

## Common Issues

### 1. Browser Won't Open Automatically

**Symptoms:**
- Setup script completes but browser doesn't open
- Terminal shows server running but no browser window

**Solutions:**

**Check if port is already in use:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Restart Kali Dragon
./setup.sh
```

**Manual browser opening:**
```bash
# macOS
open http://localhost:8000

# Linux
xdg-open http://localhost:8000

# Windows (WSL)
cmd.exe /c start http://localhost:8000
```

**Try different port:**
```bash
# Set custom port
export PORT=8080
./setup.sh
```

### 2. Node.js Not Found

**Symptoms:**
- Error: "Node.js not found"
- Setup script fails immediately

**Solutions:**

**Install Node.js (macOS):**
```bash
# Using Homebrew (recommended)
brew install node

# Using MacPorts
sudo port install nodejs18

# Direct download
# Visit: https://nodejs.org/en/download/
```

**Install Node.js (Linux):**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# Arch Linux
sudo pacman -S nodejs npm
```

**Install Node.js (Windows):**
```bash
# Using Chocolatey
choco install nodejs

# Using Scoop
scoop install nodejs

# Direct download
# Visit: https://nodejs.org/en/download/
```

### 3. Permission Denied Errors

**Symptoms:**
- "Permission denied" when running setup.sh
- File access errors

**Solutions:**

**Make script executable:**
```bash
chmod +x setup.sh
```

**Fix ownership issues:**
```bash
# Fix ownership of project directory
sudo chown -R $USER:$USER /path/to/kali-dragon

# Fix permissions
chmod -R 755 /path/to/kali-dragon
```

**Run with appropriate permissions:**
```bash
# Usually avoid sudo, but if needed:
sudo ./setup.sh
```

### 4. Terminal Commands Not Working

**Symptoms:**
- Commands typed in web terminal don't execute
- No output from commands
- API errors in browser console

**Solutions:**

**Check server status:**
```bash
# Verify server is running
curl http://localhost:8000/api/status

# Check server logs (if running in terminal)
# Look for any error messages
```

**Browser console debugging:**
```javascript
// Open browser developer tools (F12)
// Check console for errors like:
// - Network errors
// - CORS errors  
// - API connection failures
```

**Clear browser cache:**
```bash
# Hard refresh: Ctrl+F5 or Cmd+Shift+R
# Or clear browser cache completely
```

### 5. SSH Connection to Kali VM Fails

**Symptoms:**
- "Connection refused" when testing SSH
- "Permission denied" errors
- "Host key verification failed"

**Solutions:**

**Check SSH service on Kali VM:**
```bash
# In Kali VM terminal
sudo systemctl status ssh
sudo systemctl start ssh
sudo systemctl enable ssh
```

**Test network connectivity:**
```bash
# From host machine
ping 192.168.1.100  # Replace with your VM IP

# Test SSH port
telnet 192.168.1.100 22
nc -zv 192.168.1.100 22
```

**Fix SSH host key issues:**
```bash
# Remove old host key
ssh-keygen -R 192.168.1.100

# Accept new host key
ssh -o StrictHostKeyChecking=no kali@192.168.1.100
```

**Check SSH configuration:**
```bash
# In Kali VM
sudo nano /etc/ssh/sshd_config

# Ensure these settings:
# Port 22
# PasswordAuthentication yes
# PubkeyAuthentication yes
# PermitRootLogin no (recommended)

# Restart SSH after changes
sudo systemctl restart ssh
```

### 6. Web Interface Loading Issues

**Symptoms:**
- Blank white page
- CSS/JS not loading
- Interface appears broken

**Solutions:**

**Check browser compatibility:**
- Use modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Disable ad blockers temporarily
- Try incognito/private mode

**Clear browser data:**
```bash
# Clear cache, cookies, local storage
# Or try different browser
```

**Check network/firewall:**
```bash
# Disable firewall temporarily (for testing)
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Linux (Ubuntu)
sudo ufw disable

# Windows
# Disable Windows Firewall temporarily
```

### 7. Docker Not Working

**Symptoms:**
- "docker: command not found"
- "Cannot connect to the Docker daemon"
- Permission denied errors

**Solutions:**

**Install Docker (macOS):**
```bash
# Install OrbStack (recommended)
brew install orbstack

# Or Docker Desktop
brew install --cask docker
```

**Install Docker (Linux):**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Test Docker:**
```bash
docker --version
docker run hello-world
```

### 8. Python Issues

**Symptoms:**
- "python3: command not found"
- Package installation failures
- Import errors

**Solutions:**

**Install Python 3:**
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3 python3-pip

# CentOS/RHEL
sudo yum install python3 python3-pip
```

**Fix pip issues:**
```bash
# Upgrade pip
python3 -m pip install --upgrade pip

# Fix PATH issues
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

## Performance Issues

### Slow Web Interface

**Symptoms:**
- Slow page loading
- Delayed command execution
- Unresponsive interface

**Solutions:**

**Check system resources:**
```bash
# Monitor CPU and memory usage
top
htop  # If available

# Check disk space
df -h

# Check network usage
iftop  # If available
```

**Optimize browser:**
- Close unused tabs
- Disable unnecessary extensions
- Increase browser memory limits

**Optimize Node.js server:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
./setup.sh
```

### High CPU Usage

**Solutions:**

```bash
# Find resource-intensive processes
ps aux --sort=-%cpu | head -10

# Kill unnecessary processes
kill <PID>

# Restart Kali Dragon
./setup.sh
```

## Network Issues

### Cannot Access from Other Devices

**Symptoms:**
- Kali Dragon works on localhost but not from other devices
- Connection timeout from mobile/tablet

**Solutions:**

**Bind to all interfaces:**
```bash
# Edit server.js to bind to 0.0.0.0 instead of localhost
# Or set environment variable
export HOST=0.0.0.0
./setup.sh
```

**Check firewall:**
```bash
# Allow port 8000 through firewall
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp node

# Linux
sudo ufw allow 8000
```

### DNS Resolution Issues

**Solutions:**

```bash
# Use IP address instead of hostname
# Instead of: ssh kali@kali-vm
# Use: ssh kali@192.168.1.100

# Add to /etc/hosts if needed
echo "192.168.1.100 kali-vm" | sudo tee -a /etc/hosts
```

## Advanced Debugging

### Enable Debug Mode

**For server debugging:**
```bash
# Set debug environment variables
export DEBUG=*
export NODE_ENV=development
./setup.sh
```

**For network debugging:**
```bash
# Enable verbose SSH
ssh -vvv kali@192.168.1.100

# Monitor network traffic
sudo tcpdump -i any port 22
sudo tcpdump -i any port 8000
```

### Log Analysis

**Check system logs:**
```bash
# macOS
tail -f /var/log/system.log

# Linux
journalctl -f
tail -f /var/log/syslog
```

**Application logs:**
```bash
# If running server manually, logs appear in terminal
# For daemon mode, check application-specific logs
```

### Memory Debugging

**Monitor memory usage:**
```bash
# Real-time memory monitoring
watch -n 1 'free -m'  # Linux
watch -n 1 'vm_stat'   # macOS

# Check for memory leaks
valgrind --tool=memcheck node server.js  # Linux only
```

---

## 🤖 Claude Desktop Integration Issues

### ❌ "Claude Desktop not found"

**Solutions:**

1. **Install Claude Desktop:**
   - Download from: [claude.ai/desktop](https://claude.ai/desktop)
   - Install the application
   - Launch it once to initialize

2. **Check installation path:**
   ```bash
   # Verify installation
   ls -la "/Applications/Claude.app"
   
   # If not found, check alternative paths
   find /Applications -name "*Claude*" 2>/dev/null
   ```

### ❌ "MCP server not connecting to Claude"

**Symptoms:**
- Claude Desktop can't execute Kali commands
- "Server unavailable" errors
- Commands timeout

**Solutions:**

1. **Check MCP server status:**
   ```bash
   # Check if server is running
   curl http://localhost:3000/health
   
   # Check server logs
   tail -f kali-dragon.log
   ```

2. **Restart MCP server:**
   ```bash
   # Kill existing server
   pkill -f "kali_mcp_server"
   
   # Start server manually
   node kali_mcp_server_fixed.js
   ```

3. **Check Claude Desktop configuration:**
   ```bash
   # Check Claude config directory
   ls ~/Library/Application\ Support/Claude/
   
   # Verify MCP configuration
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

### ❌ "Tools not available in Claude"

**Solutions:**

1. **Restart Claude Desktop:**
   - Quit Claude completely
   - Restart the application
   - Wait for MCP server connection

2. **Check MCP configuration:**
   ```bash
   # Verify config file exists
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Should contain kali-dragon server config
   ```

3. **Test MCP connection manually:**
   ```bash
   # Test server health
   curl -X POST http://localhost:3000/mcp/list_tools
   ```

---

## 🔍 Advanced Debugging

### Enable Debug Mode

```bash
# Start server with debug logging
DEBUG=* node kali_mcp_server_fixed.js

# Or set environment variable
export DEBUG=kali-dragon:*
./setup.sh
```

### Check System Logs

```bash
# macOS logs
tail -f /var/log/system.log | grep kali-dragon

# Linux logs  
journalctl -f | grep kali-dragon

# Custom logs
tail -f kali-dragon.log
```

### Network Debugging

```bash
# Check all listening ports
netstat -tuln

# Monitor network traffic
sudo tcpdump -i any host YOUR_KALI_IP

# Check routing table
route -n get YOUR_KALI_IP
```

---

## 📞 Getting Help

### Before Asking for Help

Please collect this information:

```bash
# System information
uname -a
node --version
npm --version

# Network information  
ifconfig | grep inet
ping -c 3 YOUR_KALI_IP

# Process information
ps aux | grep kali
lsof -i :8000
lsof -i :3000

# Log files
cat kali-dragon.log | tail -50
```

### Where to Get Help

1. **GitHub Issues**: [kali-dragon/issues](https://github.com/HeyChristian/kali-dragon/issues)
2. **Documentation**: Check other guides in `/docs/`
3. **Discord/Community**: (Link when available)

### Creating Good Bug Reports

Include:
- **Operating System**: macOS/Linux version
- **Node.js Version**: `node --version`
- **Kali VM Type**: UTM/VMware/VirtualBox
- **Error Messages**: Full error output
- **Steps to Reproduce**: What you did before the error
- **Expected vs Actual**: What should vs did happen

---

## 🛠️ Emergency Recovery

### Complete Reset

If everything fails, try a complete reset:

```bash
# 1. Stop all processes
pkill -f "node.*kali"
pkill -f "kali_mcp"

# 2. Clean up ports
sudo lsof -ti:8000 | xargs sudo kill -9
sudo lsof -ti:3000 | xargs sudo kill -9

# 3. Remove temporary files
rm -rf /tmp/kali-dragon*
rm -f kali-dragon.log

# 4. Reset SSH keys
rm ~/.ssh/id_rsa*
ssh-keygen -t rsa -b 4096

# 5. Start fresh
./setup.sh
```

### VM Reset

If your Kali VM is corrupted:

1. **Take a snapshot** before making changes (UTM/VMware)
2. **Reinstall Kali** using the UTM guide
3. **Restore from known-good snapshot**
4. **Use Docker alternative** temporarily

## Getting Additional Help

### Report Issues

1. **GitHub Issues**: https://github.com/HeyChristian/kali-dragon/issues
2. **Include**: System info, error messages, steps to reproduce
3. **Attach**: Screenshots if interface issue
4. **Specify**: Your environment (macOS/Linux/Windows)

### Community Support

- **Discussions**: https://github.com/HeyChristian/kali-dragon/discussions
- **Stack Overflow**: Tag questions with `kali-dragon`
- **Reddit**: r/KaliLinux community

---

<div align="center">

## 💡 Still Having Issues?

**Don't give up!** Most issues have simple solutions.

1. **Check this guide thoroughly**
2. **Search GitHub issues** 
3. **Ask the community**
4. **Create a detailed bug report**

**🐉 We're here to help you get Kali Dragon working!**

</div>
