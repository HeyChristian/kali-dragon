#!/usr/bin/env bash
set -euo pipefail

# Colors for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global variables
KALI_VM_IP=""
KALI_USERNAME="kali"
SSH_PORT="22"
WIZARD_STATE_FILE=".kali_wizard_state"

# Wizard state tracking - simple variable-based approach for compatibility

# Simple state management functions
get_state() {
    local key="$1"
    if [ -f "$WIZARD_STATE_FILE" ]; then
        grep "^${key}=" "$WIZARD_STATE_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d "'"
    fi
}

set_state() {
    local key="$1"
    local value="$2"
    
    # Create state file if it doesn't exist
    touch "$WIZARD_STATE_FILE"
    
    # Remove existing entry for this key
    if [ -f "$WIZARD_STATE_FILE" ]; then
        grep -v "^${key}=" "$WIZARD_STATE_FILE" > "${WIZARD_STATE_FILE}.tmp" 2>/dev/null || true
        mv "${WIZARD_STATE_FILE}.tmp" "$WIZARD_STATE_FILE"
    fi
    
    # Add new entry
    echo "${key}='${value}'" >> "$WIZARD_STATE_FILE"
}

# Load previous wizard state if exists
load_wizard_state() {
    if [ -f "$WIZARD_STATE_FILE" ]; then
        source "$WIZARD_STATE_FILE" 2>/dev/null || true
        if [ -n "$(get_state "welcome")" ]; then
            echo -e "${GREEN}📋 Found previous wizard session${NC}"
        fi
    fi
}

# Save wizard state
save_wizard_state() {
    touch "$WIZARD_STATE_FILE"
    {
        echo "KALI_VM_IP='$KALI_VM_IP'"
        echo "KALI_USERNAME='$KALI_USERNAME'"
        echo "SSH_PORT='$SSH_PORT'"
    } >> "$WIZARD_STATE_FILE"
}

# Print section header
print_header() {
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# Print step header
print_step() {
    echo ""
    echo -e "${CYAN}🔹 $1${NC}"
    echo ""
}

# Ask yes/no question
ask_yes_no() {
    local prompt="$1"
    local default="${2:-n}"
    local response
    
    while true; do
        if [[ "$default" == "y" ]]; then
            read -p "$prompt [Y/n]: " response
            response=${response:-y}
        else
            read -p "$prompt [y/N]: " response
            response=${response:-n}
        fi
        
        case $response in
            [Yy]|[Yy][Ee][Ss]) return 0 ;;
            [Nn]|[Nn][Oo]) return 1 ;;
            *) echo "Please answer yes or no." ;;
        esac
    done
}

# Wait for user to continue
wait_continue() {
    echo ""
    read -p "Press ENTER to continue..."
    echo ""
}

# Test command availability
test_command() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Welcome and prerequisites
step_welcome() {
    if [[ "$(get_state welcome)" == "done" ]]; then
        if ask_yes_no "Skip welcome step (already completed)?"; then
            return 0
        fi
    fi
    
    print_header "🐉 Kali Linux MCP Server Setup Wizard"
    
    echo -e "${GREEN}Welcome to the complete Kali Linux MCP Server setup!${NC}"
    echo ""
    echo "This wizard will help you:"
    echo "• Install UTM (if needed)"
    echo "• Download and setup Kali Linux VM"
    echo "• Configure SSH and MCP server"
    echo "• Connect everything to Claude Desktop"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "• macOS (you have this ✅)"
    echo "• Admin access (for software installation)"
    echo "• Internet connection"
    echo "• Claude Desktop installed"
    echo ""
    
    if ask_yes_no "Ready to start the setup?"; then
        set_state welcome done
        save_wizard_state
    else
        echo "Setup cancelled. Run this script again when ready!"
        exit 0
    fi
}

# Step 2: UTM Installation
step_utm_install() {
    if [[ "$(get_state utm)" == "done" ]]; then
        if ask_yes_no "Skip UTM installation (already completed)?"; then
            return 0
        fi
    fi
    
    print_header "📦 Step 1: UTM Installation"
    
    # Check if UTM is already installed
    if [ -d "/Applications/UTM.app" ]; then
        echo -e "${GREEN}✅ UTM is already installed!${NC}"
        set_state utm done
        save_wizard_state
        return 0
    fi
    
    echo "UTM is a free virtualization software for macOS."
    echo ""
    echo -e "${YELLOW}Choose installation method:${NC}"
    echo "1. App Store (Free, recommended)"
    echo "2. Direct download from GitHub"
    echo "3. Homebrew"
    echo "4. I'll install it manually"
    echo ""
    
    read -p "Choose option [1-4]: " utm_choice
    
    case $utm_choice in
        1)
            echo ""
            echo -e "${BLUE}📱 Opening App Store...${NC}"
            open "https://apps.apple.com/us/app/utm-virtual-machines/id1538878817"
            echo ""
            echo "Please install UTM from the App Store and return here."
            wait_continue
            ;;
        2)
            echo ""
            echo -e "${BLUE}🌐 Opening UTM download page...${NC}"
            open "https://github.com/utmapp/UTM/releases/latest"
            echo ""
            echo "Please download and install the latest UTM.dmg, then return here."
            wait_continue
            ;;
        3)
            if test_command brew; then
                echo ""
                echo -e "${BLUE}🍺 Installing UTM via Homebrew...${NC}"
                brew install --cask utm
            else
                echo -e "${RED}❌ Homebrew not found. Please choose another option.${NC}"
                return 1
            fi
            ;;
        4)
            echo ""
            echo "Please install UTM manually and return here when done."
            wait_continue
            ;;
        *)
            echo -e "${RED}Invalid choice. Please run the wizard again.${NC}"
            exit 1
            ;;
    esac
    
    # Verify installation
    echo -e "${YELLOW}🔍 Verifying UTM installation...${NC}"
    if [ -d "/Applications/UTM.app" ]; then
        echo -e "${GREEN}✅ UTM installation verified!${NC}"
        set_state utm done
        save_wizard_state
    else
        echo -e "${RED}❌ UTM not found. Please install it and run the wizard again.${NC}"
        exit 1
    fi
}

# Step 3: Kali Linux VM Setup
step_kali_vm_setup() {
    if [[ "$(get_state kali_vm)" == "done" ]]; then
        if ask_yes_no "Skip Kali VM setup (already have a working VM)?"; then
            return 0
        fi
    fi
    
    print_header "🐧 Step 2: Kali Linux VM Setup"
    
    echo -e "${GREEN}Setting up Kali Linux Virtual Machine${NC}"
    echo ""
    echo "You have two options:"
    echo ""
    echo -e "${YELLOW}Option A: Quick Setup (Recommended)${NC}"
    echo "• Download pre-configured Kali Linux VM"
    echo "• Import directly into UTM"
    echo "• Ready to use in minutes"
    echo ""
    echo -e "${YELLOW}Option B: Manual Setup${NC}"
    echo "• Download Kali Linux ISO"
    echo "• Create new VM manually"
    echo "• Install and configure yourself"
    echo ""
    
    if ask_yes_no "Use Quick Setup (download pre-configured VM)?"; then
        echo ""
        echo -e "${BLUE}🌐 Opening Kali Linux VM downloads...${NC}"
        open "https://www.kali.org/get-kali/#kali-virtual-machines"
        echo ""
        echo -e "${YELLOW}Instructions:${NC}"
        echo "1. Download 'Kali Linux UTM' from the page that just opened"
        echo "2. Extract the downloaded file"
        echo "3. Open UTM and import the VM"
        echo "4. Start the VM and note the login credentials"
        echo ""
        echo -e "${GREEN}Default Kali credentials:${NC}"
        echo "Username: kali"
        echo "Password: kali"
        echo ""
        wait_continue
    else
        echo ""
        echo -e "${BLUE}🌐 Opening Kali Linux ISO downloads...${NC}"
        open "https://www.kali.org/get-kali/#kali-installer-images"
        echo ""
        echo -e "${YELLOW}Manual setup instructions:${NC}"
        echo "1. Download Kali Linux ISO"
        echo "2. Open UTM"
        echo "3. Create new VM → Virtualize"
        echo "4. Select Linux and browse for the ISO"
        echo "5. Configure: 4GB RAM, 64GB storage minimum"
        echo "6. Install Kali Linux in the VM"
        echo ""
        wait_continue
    fi
    
    set_state kali_vm done
    save_wizard_state
}

# Step 4: Get VM Connection Details
step_vm_connection() {
    if [[ "$(get_state vm_connection)" == "done" ]] && [[ -n "$KALI_VM_IP" ]]; then
        if ask_yes_no "Skip VM connection setup (IP: $KALI_VM_IP)?"; then
            return 0
        fi
    fi
    
    print_header "🔗 Step 3: VM Connection Setup"
    
    echo -e "${GREEN}Setting up connection to your Kali VM${NC}"
    echo ""
    echo "We need to get your Kali VM's network details."
    echo ""
    echo -e "${YELLOW}In your Kali VM terminal, run this command:${NC}"
    echo -e "${BLUE}ip addr show | grep 'inet ' | grep -v '127.0.0.1'${NC}"
    echo ""
    echo "This will show you the VM's IP address."
    echo ""
    
    wait_continue
    
    while true; do
        read -p "Enter your Kali VM IP address: " KALI_VM_IP
        if [[ $KALI_VM_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            break
        else
            echo -e "${RED}Invalid IP format. Please try again.${NC}"
        fi
    done
    
    read -p "Enter VM username (default: kali): " vm_user_input
    KALI_USERNAME=${vm_user_input:-kali}
    
    read -p "Enter SSH port (default: 22): " ssh_port_input
    SSH_PORT=${ssh_port_input:-22}
    
    echo ""
    echo -e "${GREEN}✅ Connection details:${NC}"
    echo "IP: $KALI_VM_IP"
    echo "Username: $KALI_USERNAME"
    echo "SSH Port: $SSH_PORT"
    echo ""
    
    if ask_yes_no "Are these details correct?"; then
        set_state vm_connection done
        save_wizard_state
    else
        return 1
    fi
}

# Step 5: Generate and copy setup scripts
step_generate_scripts() {
    if [[ "$(get_state scripts)" == "done" ]]; then
        if ask_yes_no "Skip script generation (already done)?"; then
            return 0
        fi
    fi
    
    print_header "📄 Step 4: Generating Setup Scripts"
    
    echo -e "${GREEN}Generating customized setup scripts...${NC}"
    
    # Generate the VM setup script
    cat > kali_vm_setup.sh <<EOF
#!/bin/bash
# Kali Linux VM MCP Server Setup
# Generated by Kali MCP Wizard

set -e

echo "🐉 Setting up Kali Linux VM for MCP Server..."
echo "=============================================="

# Update system
echo ""
echo "📦 Updating system packages..."
sudo apt update

# Install required packages
echo ""
echo "📦 Installing required packages..."
sudo apt install -y curl openssh-server

# Enable SSH
echo ""
echo "🔐 Configuring SSH service..."
sudo systemctl enable ssh
sudo systemctl start ssh

# Install Node.js
echo ""
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: \$(node --version)"
fi

echo "✅ Node.js version: \$(node --version)"
echo "✅ NPM version: \$(npm --version)"

# Create directories
mkdir -p ~/mcp-server ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "✅ Kali VM Setup Complete!"
echo "Ready for MCP server deployment!"
EOF
    
    chmod +x kali_vm_setup.sh
    
    # Generate MCP server files
    if [ ! -d "kali-mcp-project" ]; then
        echo -e "${BLUE}📦 Generating MCP server files...${NC}"
        mkdir -p kali-mcp-project/server workspace
        
        # Create package.json
        cat > kali-mcp-project/server/package.json <<'PKG'
{
  "name": "kali-mcp-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {}
}
PKG

        # Create package-lock.json
        cat > kali-mcp-project/server/package-lock.json <<'LOCK'
{
  "name": "kali-mcp-server",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "": {
      "name": "kali-mcp-server",
      "version": "1.0.0"
    }
  }
}
LOCK

        # Create MCP server index.js - Simple and robust implementation
        cat > kali-mcp-project/server/index.js <<'JS'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const WORKSPACE_DIR = path.join(os.homedir(), 'workspace');
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

// Ensure workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Create a simple test file if workspace is empty
const testFile = path.join(WORKSPACE_DIR, 'welcome.txt');
if (!fs.existsSync(testFile)) {
  fs.writeFileSync(testFile, 'Welcome to your Kali Linux MCP workspace!\n\nThis directory is accessible from Claude Desktop.\n');
}

class SimpleKaliMCPServer {
  constructor() {
    this.initialized = false;
  }

  // Safe JSON-RPC response
  sendResponse(id, result = null, error = null) {
    const response = { jsonrpc: '2.0', id };
    
    if (error) {
      response.error = { code: -32000, message: String(error) };
    } else {
      response.result = result;
    }
    
    console.log(JSON.stringify(response));
  }

  // Handle initialize request
  handleInitialize(id, params) {
    this.initialized = true;
    this.sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {
          subscribe: false,
          listChanged: false
        }
      },
      serverInfo: {
        name: 'kali-mcp-server',
        version: '1.0.0'
      }
    });
  }

  // Handle resources/list
  handleResourcesList(id) {
    const resources = [{
      uri: `file://${WORKSPACE_DIR}`,
      name: 'Kali Workspace',
      description: 'Kali Linux workspace directory',
      mimeType: 'inode/directory'
    }];
    
    this.sendResponse(id, { resources });
  }

  // Handle resources/read
  handleResourcesRead(id, params) {
    try {
      if (!params || !params.uri) {
        throw new Error('Missing URI parameter');
      }
      
      const uri = params.uri;
      if (!uri.startsWith('file://')) {
        throw new Error('Only file:// URIs are supported');
      }
      
      let filePath = uri.replace('file://', '');
      
      // Security: ensure path is within workspace
      if (!filePath.startsWith(WORKSPACE_DIR)) {
        // If relative path, resolve against workspace
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(WORKSPACE_DIR, filePath);
        } else {
          throw new Error('Access denied: path outside workspace');
        }
      }
      
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
        throw new Error('Access denied: path outside workspace');
      }
      
      if (!fs.existsSync(resolvedPath)) {
        throw new Error('File not found');
      }
      
      const stat = fs.statSync(resolvedPath);
      
      if (stat.isDirectory()) {
        // List directory contents
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
        const listing = items.map(item => {
          const itemPath = path.join(resolvedPath, item.name);
          const itemStat = fs.statSync(itemPath);
          return {
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file',
            size: itemStat.size,
            modified: itemStat.mtime.toISOString()
          };
        });
        
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(listing, null, 2)
          }]
        });
      } else {
        // Read file
        if (stat.size > MAX_FILE_SIZE) {
          throw new Error(`File too large (${stat.size} bytes, max ${MAX_FILE_SIZE})`);
        }
        
        const content = fs.readFileSync(resolvedPath, 'utf8');
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: content
          }]
        });
      }
    } catch (error) {
      this.sendResponse(id, null, error.message);
    }
  }

  // Handle ping (for testing)
  handlePing(id) {
    this.sendResponse(id, 'pong');
  }

  // Main message handler
  handleMessage(message) {
    try {
      const { jsonrpc, id, method, params } = message;
      
      // Validate JSON-RPC 2.0
      if (jsonrpc !== '2.0') {
        this.sendResponse(id, null, 'Invalid jsonrpc version');
        return;
      }
      
      if (!method) {
        this.sendResponse(id, null, 'Missing method');
        return;
      }
      
      // Handle methods
      switch (method) {
        case 'initialize':
          this.handleInitialize(id, params);
          break;
        case 'resources/list':
          this.handleResourcesList(id, params);
          break;
        case 'resources/read':
          this.handleResourcesRead(id, params);
          break;
        case 'ping':
          this.handlePing(id);
          break;
        default:
          this.sendResponse(id, null, `Unknown method: ${method}`);
      }
    } catch (error) {
      this.sendResponse(message.id, null, `Server error: ${error.message}`);
    }
  }
}

// Start server
const server = new SimpleKaliMCPServer();

// Process input line by line
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newlineIndex;
  
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    
    if (line) {
      try {
        const message = JSON.parse(line);
        server.handleMessage(message);
      } catch (error) {
        // Send error for invalid JSON
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' }
        }));
      }
    }
  }
});

// Handle shutdown gracefully
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Log startup to stderr (not stdout which is used for JSON-RPC)
process.stderr.write(`Kali MCP Server started - workspace: ${WORKSPACE_DIR}\n`);
JS
        echo -e "${GREEN}✅ MCP server files generated${NC}"
    fi
    
    # Generate SSH keys if needed
    if [ ! -f "$HOME/.ssh/kali_mcp_key" ]; then
        echo -e "${BLUE}🔐 Generating SSH key pair...${NC}"
        ssh-keygen -t ed25519 -f "$HOME/.ssh/kali_mcp_key" -N "" -C "mcp-kali-$(date +%Y%m%d)" >/dev/null
    fi
    
    echo -e "${GREEN}✅ Scripts generated successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next: Copy the VM setup script to your Kali VM${NC}"
    echo ""
    
    set_state scripts done
    save_wizard_state
}

# Step 6: VM Setup Instructions
step_vm_setup_instructions() {
    if [[ "$(get_state vm_setup)" == "done" ]]; then
        if ask_yes_no "Skip VM setup instructions (already completed)?"; then
            return 0
        fi
    fi
    
    print_header "⚙️ Step 5: Configure Your Kali VM"
    
    echo -e "${GREEN}Now we'll prepare your Kali VM${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Copy and run these commands in your Kali VM:${NC}"
    echo ""
    echo -e "${BLUE}# Update system (skip broken packages)${NC}"
    echo "sudo apt update"
    echo "# Skip openssh-server if repositories are broken - SSH is usually pre-installed"
    echo "sudo systemctl enable ssh 2>/dev/null || true"
    echo "sudo systemctl start ssh 2>/dev/null || true"
    echo ""
    echo -e "${BLUE}# Install Node.js (if not already installed)${NC}"
    echo "if ! command -v node >/dev/null 2>&1; then"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo "fi"
    echo ""
    echo -e "${BLUE}# Create directories${NC}"
    echo "mkdir -p ~/mcp-server ~/.ssh ~/workspace"
    echo "chmod 700 ~/.ssh"
    echo "touch ~/.ssh/authorized_keys"
    echo "chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo -e "${BLUE}# Create a welcome file in workspace${NC}"
    echo "echo 'Welcome to your Kali Linux MCP workspace!' > ~/workspace/welcome.txt"
    echo ""
    echo -e "${BLUE}# Add SSH key${NC}"
    echo "echo '$(cat "$HOME/.ssh/kali_mcp_key.pub")' >> ~/.ssh/authorized_keys"
    echo ""
    echo -e "${BLUE}# Verify installation${NC}"
    echo "node --version"
    echo "npm --version"
    echo "ls -la ~/workspace/"
    echo ""
    
    echo -e "${YELLOW}Copy these commands to your Kali VM and run them.${NC}"
    echo ""
    wait_continue
    
    # Try to automatically copy SSH key
    echo -e "${BLUE}🔑 Attempting to automatically copy SSH key...${NC}"
    if ssh-copy-id -i "$HOME/.ssh/kali_mcp_key" "$KALI_USERNAME@$KALI_VM_IP" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH key copied automatically!${NC}"
    else
        echo -e "${YELLOW}⚠️ Automatic key copy failed. Please add the key manually.${NC}"
        echo "In your Kali VM, run:"
        echo "echo '$(cat "$HOME/.ssh/kali_mcp_key.pub")' >> ~/.ssh/authorized_keys"
        echo "chmod 600 ~/.ssh/authorized_keys"
        echo ""
        wait_continue
    fi
    
    set_state vm_setup done
    save_wizard_state
}

# Step 7: Test SSH connection
step_test_ssh() {
    if [[ "$(get_state ssh_test)" == "done" ]]; then
        if ask_yes_no "Skip SSH test (already working)?"; then
            return 0
        fi
    fi
    
    print_header "🧪 Step 6: Testing SSH Connection"
    
    echo -e "${GREEN}Testing connection to your Kali VM...${NC}"
    echo ""
    
    echo -e "${YELLOW}🔍 Testing SSH connection to $KALI_USERNAME@$KALI_VM_IP...${NC}"
    
    if ssh -i "$HOME/.ssh/kali_mcp_key" -p "$SSH_PORT" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$KALI_USERNAME@$KALI_VM_IP" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection working!${NC}"
        set_state ssh_test done
        save_wizard_state
    else
        echo -e "${RED}❌ SSH connection failed${NC}"
        echo ""
        echo -e "${YELLOW}Troubleshooting:${NC}"
        echo "1. Ensure your Kali VM is running"
        echo "2. Check that SSH service is started: sudo systemctl status ssh"
        echo "3. Verify the IP address hasn't changed"
        echo "4. Make sure you added the SSH key to authorized_keys"
        echo ""
        
        if ask_yes_no "Try the connection again?"; then
            return 1  # Retry this step
        else
            echo "Please fix the SSH connection and run the wizard again."
            exit 1
        fi
    fi
}

# Step 8: Deploy MCP Server
step_deploy_mcp() {
    if [[ "$(get_state mcp_deploy)" == "done" ]]; then
        if ask_yes_no "Skip MCP server deployment (already done)?"; then
            return 0
        fi
    fi
    
    print_header "🚀 Step 7: Deploying MCP Server"
    
    echo -e "${GREEN}Deploying MCP server to your Kali VM...${NC}"
    echo ""
    
    # Prepare VM environment
    print_step "💾 Preparing VM environment..."
    ssh -i "$HOME/.ssh/kali_mcp_key" -p "$SSH_PORT" "$KALI_USERNAME@$KALI_VM_IP" "mkdir -p ~/mcp-server ~/workspace && echo 'Welcome to your Kali Linux MCP workspace!' > ~/workspace/welcome.txt" 2>/dev/null
    
    # Copy MCP server files
    print_step "📤 Copying MCP server files..."
    if scp -i "$HOME/.ssh/kali_mcp_key" -P "$SSH_PORT" kali-mcp-project/server/* "$KALI_USERNAME@$KALI_VM_IP:~/mcp-server/" 2>/dev/null; then
        echo -e "${GREEN}✅ Files copied successfully${NC}"
    else
        echo -e "${RED}❌ Failed to copy files${NC}"
        exit 1
    fi
    
    # Test MCP server
    print_step "🧪 Testing MCP server..."
        if echo '{"jsonrpc":"2.0","id":"test","method":"ping"}' | ssh -i "$HOME/.ssh/kali_mcp_key" -p "$SSH_PORT" "$KALI_USERNAME@$KALI_VM_IP" "cd ~/mcp-server && timeout 5 node index.js" 2>/dev/null | grep -q '"result":"pong"'; then
        echo -e "${GREEN}✅ MCP server is working!${NC}"
        set_state mcp_deploy done
        save_wizard_state
    else
        echo -e "${RED}❌ MCP server test failed${NC}"
        echo "Please check Node.js installation on your Kali VM"
        exit 1
    fi
}

# Step 9: Configure Claude Desktop
step_configure_claude() {
    if [[ "$(get_state claude_config)" == "done" ]]; then
        if ask_yes_no "Skip Claude Desktop configuration (already done)?"; then
            return 0
        fi
    fi
    
    print_header "⚙️ Step 8: Configuring Claude Desktop"
    
    echo -e "${GREEN}Adding Kali MCP server to Claude Desktop...${NC}"
    echo ""
    
    local claude_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    local backup_config="${claude_config}.backup.wizard.$(date +%Y%m%d_%H%M%S)"
    
    # Backup existing config
    if [ -f "$claude_config" ]; then
        cp "$claude_config" "$backup_config"
        echo -e "${GREEN}✅ Backup created: $(basename "$backup_config")${NC}"
    fi
    
    # Update configuration
    python3 -c "
import json
import os

config_path = '$claude_config'

# Read existing config
try:
    with open(config_path, 'r') as f:
        config = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    config = {'mcpServers': {}}

if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Add Kali MCP server
config['mcpServers']['kali-mcp-ssh'] = {
    'command': 'ssh',
    'args': [
        '-i', '$HOME/.ssh/kali_mcp_key',
        '-p', '$SSH_PORT',
        '$KALI_USERNAME@$KALI_VM_IP',
        'cd ~/mcp-server && node index.js'
    ],
    'env': {
        'MCP_SERVER_MODE': 'stdio'
    }
}

# Write updated config
os.makedirs(os.path.dirname(config_path), exist_ok=True)
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print('Claude Desktop configuration updated')
" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Claude Desktop configured successfully!${NC}"
        set_state claude_config done
        save_wizard_state
    else
        echo -e "${RED}❌ Failed to configure Claude Desktop${NC}"
        exit 1
    fi
}

# Step 9.5: Optional Docker Container Setup
step_docker_container() {
    if [[ "$(get_state docker_container)" == "done" ]]; then
        if ask_yes_no "Skip Docker container setup (already done)?"; then
            return 0
        fi
    fi
    
    print_header "🐳 Step 8.5: Optional Docker Container (Bonus)"
    
    echo -e "${GREEN}Your VM-based MCP server is working!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Bonus: Want a Docker container too?${NC}"
    echo ""
    echo "We can also create a Docker container with Kali Linux that runs locally."
    echo "This gives you:"
    echo "• 🚀 Faster startup than VM"
    echo "• 💾 Easier to backup/restore"
    echo "• 🏠 Runs directly on your Mac"
    echo "• 🗑️ Easy to clean up"
    echo ""
    echo "This will create a separate MCP server: 'kali-mcp-docker'"
    echo ""
    
    if ! ask_yes_no "Create Docker container too?"; then
        echo "Skipping Docker container setup."
        set_state docker_container skipped
        return 0
    fi
    
    echo -e "${BLUE}📦 Creating Docker-based Kali MCP server...${NC}"
    
    # Create workspace directory for Docker
    mkdir -p kali-mcp-project/workspace
    echo 'Welcome to your Docker Kali Linux MCP workspace!' > kali-mcp-project/workspace/welcome.txt
    
    # Create Dockerfile
    cat > kali-mcp-project/Dockerfile <<'DOCKER'
FROM kalilinux/kali-rolling

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sudo \
    tini \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && useradd -ms /bin/bash app \
    && mkdir -p /app /workspace && chown -R app:app /app /workspace

# Switch to app user
USER app
WORKDIR /app

# Copy server files
COPY server/ ./server/

# Install dependencies
RUN cd server && npm ci --omit=dev

# Back to root for entrypoint, then switch to app
USER root
ENTRYPOINT ["/usr/bin/tini", "--"]
USER app

# Start the server
CMD ["node", "/app/server/index.js"]
DOCKER

    # Create docker-compose.yml
    cat > kali-mcp-project/docker-compose.yml <<'COMPOSE'
services:
  mcp-kali:
    build: .
    container_name: kali-mcp-docker
    tty: true
    stdin_open: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - NET_RAW
    user: "1000:1000"
    volumes:
      - ./workspace:/home/app/workspace
      - ./server:/app/server:ro
COMPOSE
    
    echo -e "${BLUE}🔨 Building Docker container...${NC}"
    
    if (cd kali-mcp-project && docker compose up -d --build 2>/dev/null); then
        echo -e "${GREEN}✅ Docker container built and started successfully!${NC}"
        
        # Test the Docker MCP server
        echo -e "${YELLOW}🧪 Testing Docker MCP server...${NC}"
        sleep 3  # Wait for container to fully start
        
        if echo '{"jsonrpc":"2.0","id":"test","method":"ping"}' | docker exec -i kali-mcp-docker node /app/server/index.js 2>/dev/null | grep -q '"result":"pong"'; then
            echo -e "${GREEN}✅ Docker MCP server is working!${NC}"
            
            # Add Docker MCP server to Claude Desktop config
            local claude_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
            
            python3 -c "
import json
import os

config_path = '$claude_config'

# Read existing config
try:
    with open(config_path, 'r') as f:
        config = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    config = {'mcpServers': {}}

if 'mcpServers' not in config:
    config['mcpServers'] = {}

# Add Docker MCP server
config['mcpServers']['kali-mcp-docker'] = {
    'command': 'docker',
    'args': [
        'exec', '-i', 'kali-mcp-docker', 
        'node', '/app/server/index.js'
    ],
    'env': {
        'MCP_SERVER_MODE': 'stdio'
    }
}

# Write updated config
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print('Docker MCP server added to Claude Desktop')
" 2>/dev/null && echo -e "${GREEN}✅ Docker server added to Claude Desktop${NC}" || echo -e "${YELLOW}⚠️ Could not update Claude config for Docker${NC}"
            
            set_state docker_container done
        else
            echo -e "${RED}❌ Docker MCP server test failed${NC}"
            echo "Container is running but server is not responding properly."
        fi
    else
        echo -e "${RED}❌ Failed to build Docker container${NC}"
        echo "Please check Docker is installed and running."
    fi
}

# Step 10: Final verification and completion
step_completion() {
    print_header "🎉 Setup Complete!"
    
    echo -e "${GREEN}Congratulations! Your Kali MCP Server is ready!${NC}"
    echo ""
    echo -e "${YELLOW}✅ What we've accomplished:${NC}"
    echo "• UTM virtualization software installed"
    echo "• Kali Linux VM configured and running"
    echo "• SSH connection established"
    echo "• Node.js and MCP server deployed"
    echo "• Claude Desktop configured"
    echo ""
    echo -e "${YELLOW}🔄 Next steps:${NC}"
    echo "1. Restart Claude Desktop to load the new servers"
    if [[ "$(get_state docker_container)" == "done" ]]; then
        echo "2. Look for 'kali-mcp-ssh' and 'kali-mcp-docker' in your MCP servers"
        echo "3. Use SSH server for full Kali environment, Docker for quick access"
    else
        echo "2. Look for 'kali-mcp-ssh' in your MCP servers"
    fi
    echo ""
    echo -e "${YELLOW}💡 Usage tips:${NC}"
    echo "• SSH Server: Kali VM needs to be running"
    if [[ "$(get_state docker_container)" == "done" ]]; then
        echo "• Docker Server: Runs locally, start with 'docker start kali-mcp-docker'"
    fi
    echo "• If VM IP changes, run: ./kali_mcp_wizard.sh to update"
    echo "• VM server files are in ~/mcp-server on your Kali VM"
    echo ""
    echo -e "${YELLOW}🔍 Testing the connection:${NC}"
    echo "Try asking Claude: 'Can you list the files in the workspace?'"
    echo ""
    echo -e "${GREEN}🎊 Happy hacking with your Kali MCP server!${NC}"
    
    # Clean up wizard state
    rm -f "$WIZARD_STATE_FILE"
}

# Main wizard flow
main() {
    # Load any previous state
    load_wizard_state
    
    # Run wizard steps
    local current_step=1
    local total_steps=10
    
    while true; do
        case $current_step in
            1) step_welcome && ((current_step++)) || continue ;;
            2) step_utm_install && ((current_step++)) || continue ;;
            3) step_kali_vm_setup && ((current_step++)) || continue ;;
            4) step_vm_connection && ((current_step++)) || continue ;;
            5) step_generate_scripts && ((current_step++)) || continue ;;
            6) step_vm_setup_instructions && ((current_step++)) || continue ;;
            7) step_test_ssh && ((current_step++)) || continue ;;
            8) step_deploy_mcp && ((current_step++)) || continue ;;
            9) step_configure_claude && ((current_step++)) || continue ;;
            10) step_docker_container && ((current_step++)) || continue ;;
            11) step_completion && break ;;
            *) echo "Invalid step"; exit 1 ;;
        esac
    done
}

# Handle interruption gracefully
trap 'echo -e "\n${YELLOW}⚠️ Wizard interrupted. Run again to continue where you left off.${NC}"; exit 1' INT

# Clean function - removes all generated files and configurations
clean_installation() {
    print_header "🧹 Cleaning Kali MCP Installation"
    
    echo -e "${YELLOW}This will clean up all files created by the wizard:${NC}"
    echo "• Generated scripts and configurations"
    echo "• SSH keys"
    echo "• Wizard state files"
    echo "• Docker containers and images"
    echo "• Claude Desktop MCP server entry"
    echo ""
    
    if [[ "$(get_state uninstall)" != "true" ]]; then
        if ! ask_yes_no "Are you sure you want to clean everything?"; then
            echo "Clean cancelled."
            return 0
        fi
    fi
    
    echo -e "${BLUE}🧹 Cleaning up files...${NC}"
    
    # Remove generated files
    rm -f kali_vm_setup.sh
    rm -f deploy_mcp_to_kali.sh
    rm -f KALI_VM_SETUP_INSTRUCTIONS.md
    rm -f .kali_wizard_state
    rm -rf kali-mcp-project
    
    # Remove SSH keys
    if [ -f "$HOME/.ssh/kali_mcp_key" ]; then
        rm -f "$HOME/.ssh/kali_mcp_key"*
        echo -e "${GREEN}✅ SSH keys removed${NC}"
    fi
    
    # Clean Docker containers and images
    echo -e "${BLUE}🐳 Cleaning Docker containers...${NC}"
    if command -v docker >/dev/null 2>&1; then
        # Stop and remove containers
        docker ps -q --filter "name=kali-mcp" | xargs -r docker stop 2>/dev/null || true
        docker ps -aq --filter "name=kali-mcp" | xargs -r docker rm 2>/dev/null || true
        
        # Remove images
        docker images -q "*kali-mcp*" | xargs -r docker rmi 2>/dev/null || true
        docker images -q "kali-mcp-project*" | xargs -r docker rmi 2>/dev/null || true
        
        echo -e "${GREEN}✅ Docker containers cleaned${NC}"
    fi
    
    # Clean Claude Desktop configuration
    local claude_config="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    if [ -f "$claude_config" ]; then
        echo -e "${BLUE}⚙️ Cleaning Claude Desktop configuration...${NC}"
        
        # Create backup before cleaning
        local backup_config="${claude_config}.backup.clean.$(date +%Y%m%d_%H%M%S)"
        cp "$claude_config" "$backup_config"
        
        # Remove kali-mcp entries
        python3 -c "
import json
import os

config_path = '$claude_config'

try:
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    if 'mcpServers' in config:
        # Remove any kali-mcp related servers
        keys_to_remove = [k for k in config['mcpServers'].keys() if 'kali-mcp' in k.lower()]
        for key in keys_to_remove:
            del config['mcpServers'][key]
            print(f'Removed server: {key}')
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print('Claude Desktop configuration cleaned')
except Exception as e:
    print(f'Error cleaning Claude config: {e}')
" 2>/dev/null && echo -e "${GREEN}✅ Claude Desktop configuration cleaned${NC}" || echo -e "${YELLOW}⚠️ Could not clean Claude Desktop config${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Clean complete!${NC}"
    echo -e "${YELLOW}Backup created:${NC} $(basename "$backup_config")"
    echo "You can now run the wizard fresh or restore from backup if needed."
}

# Uninstall function - removes everything including UTM recommendation
uninstall_everything() {
    print_header "🗑️ Complete Uninstall"
    
    echo -e "${RED}⚠️ WARNING: This will completely remove everything!${NC}"
    echo ""
    echo -e "${YELLOW}This will:${NC}"
    echo "• Clean all wizard files and configurations"
    echo "• Remove SSH keys and Docker containers"
    echo "• Clean Claude Desktop configuration"
    echo "• Provide instructions to remove UTM (optional)"
    echo "• Remove Kali VM files (you'll do this manually)"
    echo ""
    
    if ! ask_yes_no "Are you ABSOLUTELY sure you want to uninstall everything?"; then
        echo "Uninstall cancelled."
        return 0
    fi
    
    # First run the clean function
    echo -e "${BLUE}🧹 Running cleanup...${NC}"
    set_state uninstall true  # Skip the confirmation in clean
    clean_installation
    
    echo ""
    print_header "🗑️ Manual Cleanup Instructions"
    
    echo -e "${YELLOW}Additional manual steps (optional):${NC}"
    echo ""
    echo -e "${BLUE}1. Remove UTM (if you want):${NC}"
    echo "   • Delete /Applications/UTM.app"
    echo "   • Or: brew uninstall --cask utm"
    echo ""
    echo -e "${BLUE}2. Remove Kali VM files:${NC}"
    echo "   • Open UTM and delete the Kali Linux VM"
    echo "   • This will free up several GB of disk space"
    echo ""
    echo -e "${BLUE}3. Remove this wizard:${NC}"
    echo "   • Delete this entire directory if you want"
    echo "   • rm -rf '$(pwd)'"
    echo ""
    
    if ask_yes_no "Open UTM now to remove Kali VM?"; then
        if [ -d "/Applications/UTM.app" ]; then
            open -a UTM
            echo "UTM opened. Please manually delete your Kali Linux VM."
        else
            echo "UTM not found in Applications."
        fi
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Uninstall complete!${NC}"
    echo "Thanks for trying the Kali MCP Wizard!"
}

# Show usage information
show_usage() {
    echo -e "${PURPLE}🐉 Kali Linux MCP Server Setup Wizard${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0                 # Run the interactive setup wizard"
    echo "  $0 clean           # Clean all generated files and configs"
    echo "  $0 uninstall       # Complete uninstall (removes everything)"
    echo "  $0 --help          # Show this help message"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  clean      - Removes generated files, SSH keys, Docker containers,"
    echo "               and Claude Desktop MCP server entries"
    echo "  uninstall  - Complete removal including UTM/VM cleanup instructions"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    "clean")
        clean_installation
        exit 0
        ;;
    "uninstall")
        uninstall_everything
        exit 0
        ;;
    "--help"|"-h"|"help")
        show_usage
        exit 0
        ;;
    "")
        # No arguments, run the wizard
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        show_usage
        exit 1
        ;;
esac

# Run the wizard
main "$@"
