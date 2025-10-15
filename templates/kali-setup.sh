#!/bin/bash
# Automated Kali Linux MCP Server Setup
# This script is executed on the Kali VM to prepare it for MCP server

set -e

echo "🐉 Setting up Kali Linux for MCP Server..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system (handle broken repositories gracefully)
log "Updating package lists..."
if ! sudo apt update 2>/dev/null; then
    warn "Package update failed - continuing with existing packages"
fi

# Check if SSH is already running
log "Checking SSH service..."
if systemctl is-active --quiet ssh; then
    log "SSH service is already running"
else
    log "Starting SSH service..."
    sudo systemctl enable ssh 2>/dev/null || true
    sudo systemctl start ssh 2>/dev/null || true
fi

# Install Node.js if not present
log "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
    log "Node.js already installed: $(node --version)"
else
    log "Installing Node.js..."
    if curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -; then
        sudo apt-get install -y nodejs
        log "Node.js installed: $(node --version)"
    else
        error "Failed to install Node.js"
        exit 1
    fi
fi

# Verify npm is working
if ! npm --version >/dev/null 2>&1; then
    error "NPM is not working properly"
    exit 1
fi

# Create necessary directories
log "Creating directories..."
mkdir -p ~/mcp-server ~/.ssh ~/workspace
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Create workspace welcome file
log "Setting up workspace..."
cat > ~/workspace/README.md << 'EOF'
# Welcome to your Kali Linux MCP Workspace

This workspace is accessible from Claude Desktop via the MCP protocol.

## What you can do:
- Ask Claude to list files: "Show me what's in the workspace"
- Read files: "Read the contents of README.md" 
- Browse directories: "List the files in the workspace directory"

## Security:
- Only this workspace directory is accessible
- Text files only (binary files are blocked)
- Maximum file size: 10MB

Happy hacking! 🐉
EOF

# Create a sample script
log "Creating sample files..."
cat > ~/workspace/sample-script.sh << 'EOF'
#!/bin/bash
# Sample script for Kali Linux

echo "Hello from Kali Linux!"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Date: $(date)"

# Show some system information
echo ""
echo "=== System Information ==="
uname -a
echo ""
echo "=== Disk Usage ==="
df -h | head -5
EOF

chmod +x ~/workspace/sample-script.sh

# Create a tools inventory
cat > ~/workspace/kali-tools.txt << 'EOF'
# Kali Linux Tools Available

## Network Tools
- nmap: Network exploration and security auditing
- wireshark: Network protocol analyzer
- netcat: Network utility for reading/writing network connections

## Web Application Testing
- burpsuite: Web application security testing platform
- sqlmap: SQL injection detection and exploitation
- nikto: Web server scanner

## Password Tools  
- john: John the Ripper password cracker
- hashcat: Advanced password recovery
- hydra: Network logon cracker

## Information Gathering
- recon-ng: Web reconnaissance framework  
- theharvester: Information gathering tool
- maltego: Link analysis and data mining

Note: This is just a sample list. Kali Linux contains 600+ tools.
Use 'apt list --installed | grep kali-tools' to see what's actually installed.
EOF

# Final verification
log "Final verification..."
echo ""
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"  
echo "✅ SSH status: $(systemctl is-active ssh)"
echo "✅ Workspace created: ~/workspace"
echo "✅ Files in workspace:"
ls -la ~/workspace/

echo ""
log "Kali Linux MCP setup complete!"
log "Ready for MCP server deployment from your Mac."
echo ""
echo "🔐 Don't forget to:"
echo "  1. Add your SSH public key to ~/.ssh/authorized_keys"
echo "  2. Ensure this VM's IP is accessible from your Mac"
echo "  3. Test SSH connection from your Mac"