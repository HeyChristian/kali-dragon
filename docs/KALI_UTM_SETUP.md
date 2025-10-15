# 🐧 Kali Linux UTM Setup Guide

Complete guide to install and configure Kali Linux using UTM on macOS for MCP integration.

## 📋 Prerequisites

- **macOS** (Intel or Apple Silicon)
- **UTM** (Universal Turing Machine) - Free virtualization software
- **4GB+ RAM** available for the VM
- **20GB+ free disk space**
- **Internet connection** for downloads

## 🚀 Quick Setup Overview

1. [Install UTM](#1-install-utm)
2. [Download Kali Linux ISO](#2-download-kali-linux-iso)
3. [Create Kali VM in UTM](#3-create-kali-vm-in-utm)
4. [Install Kali Linux](#4-install-kali-linux)
5. [Configure SSH Access](#5-configure-ssh-access)
6. [Test Connection](#6-test-connection)

---

## 1. Install UTM

### Option A: Mac App Store (Recommended)
1. Open **Mac App Store**
2. Search for **"UTM Virtual Machines"**
3. Click **Get/Install** (it's free)
4. Wait for installation to complete

### Option B: Direct Download
1. Visit [https://mac.getutm.app](https://mac.getutm.app)
2. Download **UTM.dmg**
3. Open the DMG file and drag UTM to Applications
4. Open UTM from Applications folder

---

## 2. Download Kali Linux ISO

1. Go to [https://www.kali.org/get-kali/](https://www.kali.org/get-kali/)
2. Click **"Installer Images"**
3. Choose your architecture:
   - **Apple Silicon (M1/M2/M3)**: `kali-linux-2024.1-installer-arm64.iso`
   - **Intel Mac**: `kali-linux-2024.1-installer-amd64.iso`
4. Download the ISO file (approximately 3.9GB)

---

## 3. Create Kali VM in UTM

### Step 1: Create New Virtual Machine
1. Open **UTM**
2. Click **"+"** (Create a New Virtual Machine)
3. Select **"Virtualize"**
4. Choose **"Linux"**

### Step 2: Configure VM Settings

#### Operating System
- **Boot ISO Image**: Browse and select your downloaded Kali ISO file
- **Memory**: 4096 MB (4GB) minimum, 8192 MB (8GB) recommended
- **CPU Cores**: 2-4 cores (depending on your Mac's capability)

#### Storage
- **Storage**: 60GB minimum, 100GB recommended
- **Format**: Leave as default

#### Network
- **Network Mode**: Shared Network
- **Hardware**: Leave as default

#### System
- **Architecture**: 
  - Apple Silicon: **ARM64**
  - Intel: **x86_64**
- **System**: **Standard PC (Q35 + ICH9, 2009)** or **QEMU 7.0 ARM Virtual Machine**

### Step 3: Finish Creation
1. **Name**: "Kali Linux MCP"
2. Click **"Save"**

---

## 4. Install Kali Linux

### Start Installation
1. Select your **"Kali Linux MCP"** VM
2. Click **▶️ Play** button
3. VM will boot from the ISO

### Installation Process
1. **Boot Menu**: Select **"Graphical install"**
2. **Language**: Select your preferred language
3. **Location**: Choose your location
4. **Keyboard**: Select keyboard layout
5. **Network**: Configure hostname (e.g., "kali-mcp")
6. **Users and Passwords**:
   - **Full name**: Your name
   - **Username**: `kali` (recommended)
   - **Password**: **Strong password** (you'll need this for SSH)
7. **Partitioning**: 
   - Select **"Guided - use entire disk"**
   - Select **"All files in one partition"**
   - Confirm partitioning
8. **Software Selection**:
   - Keep **"Debian desktop environment"**
   - Keep **"Kali-linux-default"**
   - Ensure **"SSH server"** is selected ✅
9. **GRUB Bootloader**: Install to master boot record
10. **Finish Installation**: Remove ISO and reboot

---

## 5. Configure SSH Access

### Step 1: Boot into Kali
1. After installation, boot your Kali VM
2. Login with the credentials you created

### Step 2: Enable and Start SSH
Open terminal in Kali and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install SSH server if not installed
sudo apt install openssh-server -y

# Enable SSH service
sudo systemctl enable ssh

# Start SSH service
sudo systemctl start ssh

# Check SSH status
sudo systemctl status ssh
```

### Step 3: Configure SSH for Security
```bash
# Create backup of SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

**Important SSH Settings:**
```bash
# Find and modify these lines:
Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
```

**Save and restart SSH:**
```bash
# Save file (Ctrl+X, Y, Enter)
# Restart SSH service
sudo systemctl restart ssh
```

### Step 4: Find Kali IP Address
```bash
# Get IP address
ip addr show | grep inet
```

**Note the IP address** (usually starts with 192.168.x.x or 10.0.x.x)

---

## 6. Test Connection

### From macOS Terminal
```bash
# Test SSH connection (replace with your Kali IP)
ssh kali@192.168.64.3

# If successful, you'll see:
# kali@kali-mcp:~$
```

### Set Up SSH Key (Optional but Recommended)
```bash
# On macOS, generate SSH key
ssh-keygen -t rsa -b 4096 -C "kali-mcp"

# Copy key to Kali VM (replace IP address)
ssh-copy-id kali@192.168.64.3
```

---

## 🔧 Troubleshooting

### VM Won't Boot
- **Check ISO file**: Ensure it's not corrupted
- **Increase memory**: Try allocating more RAM
- **Architecture mismatch**: Ensure ARM64 for Apple Silicon, x86_64 for Intel

### Can't Connect via SSH
```bash
# Check if SSH is running in Kali
sudo systemctl status ssh

# Check firewall status
sudo ufw status

# If firewall is active, allow SSH
sudo ufw allow ssh
```

### Network Issues
1. **UTM Network**: Ensure "Shared Network" is selected
2. **VM Settings**: Check network adapter is connected
3. **Restart VM**: Sometimes network needs a restart

### Performance Issues
1. **Increase RAM**: Allocate more memory to VM
2. **More CPU cores**: Assign additional cores
3. **Hardware acceleration**: Ensure UTM hardware acceleration is enabled

---

## 🎯 Next Steps

Once your Kali VM is running and SSH is configured:

1. **✅ Note your Kali VM details:**
   - IP Address: `192.168.64.x`
   - Username: `kali`
   - Password: `your_password`
   - SSH Port: `22`

2. **🔄 Return to Kali Dragon Setup:**
   - Go back to the Kali Dragon web interface
   - Enter your VM credentials in Step 3
   - Complete the MCP server setup

3. **📚 Additional Configuration:**
   - Install additional Kali tools as needed
   - Configure firewall rules
   - Set up shared folders (optional)

---

## 🆘 Getting Help

- **UTM Issues**: [UTM Documentation](https://docs.getutm.app/)
- **Kali Linux**: [Official Kali Documentation](https://www.kali.org/docs/)
- **SSH Problems**: [SSH Troubleshooting Guide](../docs/TROUBLESHOOTING.md#ssh-connection-issues)

---

## 💡 Pro Tips

### UTM Performance Optimization
- **Enable hardware acceleration** in UTM settings
- **Allocate sufficient RAM** (8GB recommended)
- **Use SSD storage** for better performance

### Kali Linux Optimization
- **Disable unnecessary services** to save resources
- **Use lightweight desktop** (XFCE) if performance is an issue
- **Take VM snapshots** before major changes

### Security Best Practices
- **Use SSH keys** instead of passwords
- **Change default SSH port** if needed
- **Keep Kali updated** regularly
- **Configure firewall** appropriately

---

<div align="center">

**🐉 Ready for MCP Setup!**

*Once your Kali VM is running, return to Kali Dragon and proceed with Step 3*

**Next: [Configure MCP Server](MCP_SERVER_SETUP.md)**

</div>