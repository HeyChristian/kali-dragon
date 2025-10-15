# 🐧 Kali VM Setup Guide

This guide will help you configure a Kali Linux virtual machine for use with Kali Dragon MCP.

## VM Requirements

### Minimum System Requirements
- **RAM**: 4GB (8GB recommended)
- **Storage**: 20GB free space (40GB recommended)
- **CPU**: 2 cores (4 cores recommended)
- **Network**: NAT or Bridged adapter

### Supported Virtualization Platforms
- ✅ **VMware Workstation/Fusion** (Recommended)
- ✅ **VirtualBox** (Free option)
- ✅ **Parallels Desktop** (macOS)
- ✅ **UTM** (macOS Apple Silicon)

## Kali Linux Installation

### Download Kali Linux
1. Visit: https://www.kali.org/get-kali/
2. Choose appropriate image:
   - **VMware**: Pre-built VMware image
   - **VirtualBox**: VirtualBox image
   - **ISO**: For manual installation

### Quick VM Setup (Pre-built Images)

**VMware:**
```bash
# Download VMware image
wget https://cdimage.kali.org/kali-2023.3/kali-linux-2023.3-vmware-amd64.7z

# Extract and import
7z x kali-linux-2023.3-vmware-amd64.7z
# Open .vmx file in VMware
```

**VirtualBox:**
```bash
# Download VirtualBox image
wget https://cdimage.kali.org/kali-2023.3/kali-linux-2023.3-virtualbox-amd64.7z

# Extract and import
7z x kali-linux-2023.3-virtualbox-amd64.7z
# Import .ova file in VirtualBox
```

### Default Credentials
- **Username**: `kali`
- **Password**: `kali`

⚠️ **Change default password immediately after first boot!**

## Network Configuration

### Option 1: Bridged Network (Recommended)
Gives VM direct access to your network:

1. **VMware**: VM Settings → Network Adapter → Bridged
2. **VirtualBox**: VM Settings → Network → Attached to: Bridged Adapter

### Option 2: NAT with Port Forwarding
More secure but requires port forwarding:

**VirtualBox Example:**
```bash
# Forward SSH port
VBoxManage modifyvm "Kali-Linux" --natpf1 "SSH,tcp,,2222,,22"
```

## SSH Configuration

### Enable SSH Service
```bash
# In Kali VM terminal
sudo systemctl enable ssh
sudo systemctl start ssh

# Verify SSH is running
sudo systemctl status ssh
```

### Configure SSH (Optional but Recommended)
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# Port 22
# PermitRootLogin no
# PasswordAuthentication yes
# PubkeyAuthentication yes

# Restart SSH service
sudo systemctl restart ssh
```

### Find Kali VM IP Address
```bash
# In Kali VM
ip addr show
# or
hostname -I
```

### Test SSH Connection
From your host machine:
```bash
# Replace with your Kali VM IP
ssh kali@192.168.1.100

# If using NAT with port forwarding
ssh -p 2222 kali@localhost
```

## Security Hardening

### Change Default Password
```bash
# In Kali VM
passwd kali
# Enter new secure password
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt dist-upgrade -y
```

### Install Essential Packages
```bash
# Install commonly needed packages
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    python3-pip \
    docker.io \
    docker-compose
```

### Configure Firewall
```bash
# Install and configure UFW
sudo apt install ufw
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 8000  # For MCP server
sudo ufw status
```

## MCP Prerequisites

### Install Python Dependencies
```bash
# Update pip
python3 -m pip install --upgrade pip

# Install common MCP dependencies
pip3 install \
    paramiko \
    requests \
    flask \
    socketio \
    psutil
```

### Configure Docker (if needed)
```bash
# Add kali user to docker group
sudo usermod -aG docker kali

# Start docker service
sudo systemctl enable docker
sudo systemctl start docker

# Test docker
docker run hello-world
```

### Create MCP Directory Structure
```bash
# Create directories for MCP
mkdir -p ~/mcp/{logs,configs,scripts,data}

# Set permissions
chmod 755 ~/mcp
chmod 755 ~/mcp/*
```

## Testing Connection from Kali Dragon

### SSH Connection Test
1. Open Kali Dragon web interface
2. Navigate to **🏗️ Setup** tab
3. Click **"🐧 Configure Kali VM"**
4. Enter your Kali VM details:
   - **Host**: Your VM IP (e.g., 192.168.1.100)
   - **Username**: kali
   - **Password**: Your new password

### Manual Connection Test
In Kali Dragon terminal:
```bash
# Test SSH connection
ssh kali@192.168.1.100

# Test with key authentication (if configured)
ssh -i ~/.ssh/kali_key kali@192.168.1.100
```

## Troubleshooting

### Connection Refused
```bash
# Check SSH service in Kali VM
sudo systemctl status ssh
sudo systemctl restart ssh

# Check firewall
sudo ufw status
sudo ufw allow ssh
```

### Permission Denied
```bash
# Check SSH configuration
sudo nano /etc/ssh/sshd_config
# Ensure: PasswordAuthentication yes

# Restart SSH
sudo systemctl restart ssh
```

### Network Issues
```bash
# Check network connectivity
ping google.com

# Check IP configuration
ip addr show
ip route show

# Restart network service
sudo systemctl restart networking
```

### VM Performance Issues
1. **Increase RAM**: Allocate more memory to VM
2. **Enable VT-x/AMD-V**: Enable virtualization in BIOS
3. **Install VM Tools**: VMware Tools or VirtualBox Guest Additions
4. **Disable Visual Effects**: Use lightweight desktop environment

## Advanced Configuration

### SSH Key Authentication
```bash
# On host machine, generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/kali_key

# Copy public key to Kali VM
ssh-copy-id -i ~/.ssh/kali_key.pub kali@192.168.1.100

# Test key authentication
ssh -i ~/.ssh/kali_key kali@192.168.1.100
```

### Static IP Configuration
```bash
# In Kali VM, edit network config
sudo nano /etc/network/interfaces

# Add static IP configuration
auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4

# Restart networking
sudo systemctl restart networking
```

### Snapshot Configuration
After completing setup:
1. **VMware**: VM → Snapshot → Take Snapshot
2. **VirtualBox**: Machine → Take Snapshot
3. **Name**: "Clean Kali Setup - Ready for MCP"

This allows quick recovery if issues occur.

## Next Steps

1. ✅ **Verify SSH Connection**: Ensure Kali Dragon can connect
2. ✅ **Install MCP Server**: Run MCP setup from Kali Dragon
3. ✅ **Test Services**: Verify all components work together
4. ✅ **Create Backup**: Take VM snapshot after successful setup

---

🐉 **Your Kali VM is ready!** Proceed to MCP server installation through the Kali Dragon interface.