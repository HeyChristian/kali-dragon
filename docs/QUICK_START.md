# 🚀 Quick Start Guide

Get your Kali Dragon MCP environment up and running in **15 minutes** or less!

## ⚡ TL;DR - Super Quick Setup

```bash
# 1. Clone and run setup wizard
git clone https://github.com/HeyChristian/kali-dragon.git
cd kali-dragon
./setup.sh

# 2. Follow the web wizard at http://localhost:8000
# 3. Configure your Kali VM in step 3
# 4. Done! 🎉
```

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **macOS** (Intel or Apple Silicon)  
- ✅ **Node.js** installed (`node --version`)
- ✅ **Claude Desktop** ([Download here](https://claude.ai/desktop))
- ✅ **Kali Linux VM** running in UTM/VMware/VirtualBox
- ✅ **SSH access** to your Kali VM
- ✅ **15 minutes** of your time

## 🎯 5-Step Setup Process

### Step 1: Download Kali Dragon

```bash
git clone https://github.com/HeyChristian/kali-dragon.git
cd kali-dragon
```

### Step 2: Run the Setup Wizard

```bash
./setup.sh
```

This will:
- Start the web wizard server
- Open your browser automatically
- Begin the guided setup process

### Step 3: Use the Web Interface

The browser will open to `http://localhost:8000` with a beautiful setup wizard:

1. **System Check**: Verify prerequisites
2. **Dependencies**: Install required packages
3. **Kali VM Config**: Enter your VM credentials
4. **MCP Server**: Install and configure
5. **Testing**: Verify everything works

### Step 4: Configure Your Kali VM

In **Step 3** of the wizard:

- Enter your Kali VM IP address (e.g., `192.168.64.3`)
- Username: `kali` (or your custom username)
- Password: Your Kali VM password
- SSH Port: `22` (default)

🆘 **Need help with Kali VM setup?** Click the **"📖 Complete UTM + Kali Installation Guide"** link in the wizard.

### Step 5: Complete Setup

The wizard will:
- Test SSH connection to your Kali VM
- Install MCP server components
- Configure Claude Desktop integration
- Run connectivity tests

---

## 🎉 You're Done!

Once setup is complete, you can:

### Use Kali Tools in Claude Desktop

1. Open **Claude Desktop**
2. Start a new conversation
3. Try commands like:
   ```
   Can you run nmap on my local network?
   Show me my Kali system information
   What networking tools are available?
   ```

### Access the Control Panel

- Visit `http://localhost:8000` anytime
- Use the terminal interface
- Check system status
- View documentation

### Run Manual Commands

```bash
# Start the MCP server manually
node kali_mcp_server_fixed.js

# Check server status
curl http://localhost:3000/health

# View logs
tail -f kali-dragon.log
```

---

## 🚨 Common Issues & Quick Fixes

### ❌ "Cannot connect to Kali VM"

**Fix:**
```bash
# Test SSH manually
ssh kali@YOUR_KALI_IP

# If this fails, check:
# 1. VM is running
# 2. SSH service is active: sudo systemctl start ssh
# 3. IP address is correct: ip addr show
```

### ❌ "Claude Desktop not found"

**Fix:**
1. Download from [claude.ai/desktop](https://claude.ai/desktop)
2. Install the app
3. Restart the setup wizard

### ❌ "Node.js not found"

**Fix:**
```bash
# Install Node.js
brew install node

# Or download from nodejs.org
```

### ❌ "Permission denied"

**Fix:**
```bash
# Make setup script executable
chmod +x setup.sh

# Run with proper permissions
sudo ./setup.sh
```

---

## 🔧 Advanced Configuration

### Custom Kali VM Setup

If you don't have a Kali VM yet:

1. **UTM Method** (Recommended for Mac):
   - Click "📖 Complete UTM + Kali Installation Guide" in the wizard
   - Follow the detailed step-by-step guide

2. **Docker Method** (Alternative):
   ```bash
   docker run -it --rm kalilinux/kali-rolling
   ```

### Multiple Kali VMs

Edit the configuration to manage multiple VMs:

```bash
# Edit server configuration
nano kali_mcp_server_fixed.js

# Add additional VM configs
```

### Custom Tools

Add your own tools to the MCP server:

```bash
# Edit the tools directory
ls templates/tools/

# Add custom scripts
nano templates/tools/my-custom-tool.sh
```

---

## 📚 Next Steps

### Explore Documentation

- 🐧 **[Kali UTM Setup](KALI_UTM_SETUP.md)** - Detailed VM installation
- 🔧 **[Troubleshooting](TROUBLESHOOTING.md)** - Solve common problems  
- 🚀 **[MCP Server Setup](MCP_SERVER_SETUP.md)** - Advanced server config
- 📊 **[Architecture Guide](../ARQUITECTURA_KALI_MCP.md)** - Technical overview

### Join the Community

- 🐉 **GitHub**: [kali-dragon](https://github.com/HeyChristian/kali-dragon)
- 💬 **Issues**: Report bugs and request features
- ⭐ **Star**: Help others discover this tool

### Advanced Usage

- **Custom Tools**: Add your own security scripts
- **Multi-VM**: Manage multiple Kali environments  
- **Integration**: Connect with other security platforms
- **Automation**: Create automated security workflows

---

## 🎯 Success Indicators

You'll know everything is working when:

✅ **Web wizard completes without errors**  
✅ **Claude Desktop can execute Kali commands**  
✅ **SSH connection to Kali VM works**  
✅ **MCP server responds to health checks**  
✅ **All tests pass in the final step**

---

<div align="center">

## 🐉 Ready to Hack Ethically!

**Your Kali Dragon MCP environment is now ready for ethical security testing.**

*Remember: Always hack responsibly and only on systems you own or have explicit permission to test.*

**Need help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or open a GitHub issue.

</div>
