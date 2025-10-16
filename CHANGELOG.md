# Changelog

All notable changes to Kali Dragon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-16

### 🎉 Initial Release

#### ✨ Added
- **Modern Web Interface**: Dark mode terminal with Apple-style design
- **Zero Dependencies**: Pure Node.js with CDN resources (Tailwind CSS, Alpine.js)
- **Kali MCP Setup Wizard**: 5-step guided setup process
  - Step 1: System requirements check (Claude Desktop validation)
  - Step 2: SSH client setup and verification  
  - Step 3: Kali VM configuration with SSH key generation
  - Step 4: MCP server installation
  - Step 5: Connection testing and validation
- **Interactive Terminal**: Real-time command execution with colored output
- **Documentation System**: Built-in docs with markdown rendering
- **Quick Actions**: Organized setup and management buttons
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Cross-Platform**: Supports macOS, Linux, and Windows

#### 🔧 Features
- **Automated SSH Key Generation**: Creates Ed25519 keys for Kali VM access
- **Real-time System Checks**: Validates Claude Desktop, SSH client, Node.js
- **UTM Integration Guide**: Complete setup documentation for UTM + Kali
- **Terminal Command History**: Full logging of command execution
- **Error Handling**: Comprehensive error messages and recovery suggestions
- **Branch Protection**: Configured for community contributions via PRs

#### 📚 Documentation
- Comprehensive README with usage examples
- Installation and setup guides
- Contributing guidelines for open source community
- Issue templates for bug reports and feature requests
- Troubleshooting documentation

#### 🎨 UI/UX
- Authentic terminal styling with Kali-inspired prompts
- Modern glassmorphism effects and smooth transitions
- Organized workflow with clear visual feedback
- Color-coded command output (success/error/info)
- Mobile-responsive design with touch-friendly controls

#### 🔐 Security
- No sensitive data storage
- Secure SSH key generation
- Input validation and sanitization
- Branch protection rules for code integrity

### 📋 System Requirements
- **Node.js 14+** (Required)
- **Claude Desktop** (Required for MCP functionality)  
- **Modern Browser** (Chrome, Firefox, Safari, Edge)
- **SSH Client** (Usually pre-installed)
- **Kali Linux VM** (Target for MCP setup)

### 🚀 Installation
```bash
git clone https://github.com/HeyChristian/kali-dragon.git
cd kali-dragon
./setup.sh
```

### 🎯 What's Next
- Enhanced Windows compatibility
- Additional Linux distribution support
- Performance optimizations
- Extended MCP server management
- Community feature requests

---

**Full Changelog**: https://github.com/HeyChristian/kali-dragon/commits/v1.0.0