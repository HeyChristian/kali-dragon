# 🚀 Quick Start Guide

## Prerequisites

Before starting with Kali Dragon, ensure you have:

- **Node.js 14+** installed on your system
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Terminal/Command Line** access

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/HeyChristian/kali-dragon.git
cd kali-dragon
```

### 2. Launch Kali Dragon
```bash
./setup.sh
```

That's it! The setup script will:
- ✅ Check Node.js installation
- ✅ Create project structure  
- ✅ Start the web server on port 8000
- ✅ Open your browser automatically

## First Time Setup

### Initial System Check
1. Click the **"🚀 START SETUP PROCESS"** button
2. The system will automatically check for:
   - Python 3 installation
   - Docker availability
   - SSH client presence
   - System compatibility

### Install Missing Dependencies
Based on the system check results:

**For macOS:**
```bash
# Install Python 3
brew install python3

# Install Docker (OrbStack recommended)
# Download from: https://orbstack.dev
```

**For Linux:**
```bash
# Install Python 3
sudo apt install python3 python3-pip  # Ubuntu/Debian
sudo yum install python3 python3-pip  # CentOS/RHEL

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## Using the Web Interface

### Terminal Interface
- **Main Terminal**: 60% of screen height, authentic Kali-style prompts
- **Command Execution**: Type commands and press Enter or click "RUN"
- **Output Display**: Real-time command output with color coding
- **Auto-focus**: Terminal input is always ready for typing

### Quick Actions
Navigate using the tabbed interface:

**🏗️ Setup Tab:**
- Install Dependencies
- Configure Kali VM
- Setup MCP Server  
- Test Connection

**⚙️ Management Tab:**
- Start/Stop MCP Server
- View System Logs
- Restart Services
- Configuration Tools

### System Status
Monitor real-time status in the top header:
- Green dots: Service running/available
- Yellow dots: Requires attention
- Red dots: Service unavailable/error

## Common Commands

### System Information
```bash
# Check system info
uname -a
python3 --version
docker --version

# Check network connectivity
ping -c 3 google.com
```

### Kali VM Connection
```bash
# Test SSH connection to Kali VM
ssh kali@192.168.1.100

# Check Kali services
systemctl status ssh
systemctl status docker
```

### Docker Operations
```bash
# List running containers
docker ps

# Pull Kali Linux image
docker pull kalilinux/kali-rolling

# Run Kali container
docker run -it kalilinux/kali-rolling bash
```

## Troubleshooting

### Browser Won't Open
If the browser doesn't open automatically:
1. Manually navigate to: `http://localhost:8000`
2. Check if another service is using port 8000
3. Try a different browser

### Node.js Not Found
```bash
# Check Node.js installation
node --version

# Install Node.js (macOS)
brew install node

# Install Node.js (Linux)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Permission Errors
```bash
# Make setup script executable
chmod +x setup.sh

# Run with appropriate permissions
sudo ./setup.sh  # If needed
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process (replace PID)
kill -9 <PID>

# Start Kali Dragon again
./setup.sh
```

## Next Steps

1. **Complete System Check**: Ensure all dependencies are installed
2. **Configure Kali VM**: Set up SSH connection to your Kali Linux VM
3. **Setup MCP Server**: Initialize MCP services for advanced features
4. **Explore Documentation**: Check other guides in the docs/ folder

## Getting Help

- **Terminal Commands**: Type `help` in the terminal for available commands
- **GitHub Issues**: Report bugs at https://github.com/HeyChristian/kali-dragon/issues
- **Documentation**: Browse all guides in the web interface under "📚 Documentation"

---

🐉 **Ready to unleash the Dragon!** Your Kali Linux MCP setup is just a few clicks away.