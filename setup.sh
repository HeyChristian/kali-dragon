#!/usr/bin/env bash
# 🐉 KALI DRAGON WEB WIZARD - Instant Launcher v4.0
# No dependencies! Uses CDN libraries - starts immediately

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Print dragon header
print_header() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║          🐉 KALI DRAGON WEB WIZARD v4.0 🐉                  ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║          ⚡ INSTANT LAUNCH - NO INSTALL NEEDED ⚡            ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Check if Node.js is installed
check_node() {
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        print_success "Node.js found: $node_version"
        return 0
    else
        print_error "Node.js not found"
        print_warning "Please install Node.js from: https://nodejs.org"
        exit 1
    fi
}

# Open browser
open_browser() {
    local url="http://localhost:8000"
    print_info "Opening browser at $url"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$url" || sensible-browser "$url" || x-www-browser "$url"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "$url"
    fi
}

# Main function
main() {
    print_header
    
    print_info "Checking Node.js installation..."
    check_node
    
    echo ""
    print_info "Creating project structure..."
    mkdir -p web-wizard/{views,public,logs}
    
    cd web-wizard
    
    print_success "Ready to launch Kali Dragon Web Wizard!"
    echo ""
    echo -e "${CYAN}🚀 Starting server at http://localhost:8000${NC}"
    echo -e "${YELLOW}📱 Opening browser automatically...${NC}"
    echo -e "${PURPLE}🐉 Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Wait a moment then open browser
    sleep 2 && open_browser &
    
    # Start the Node.js server
    node server.js
}

# Run main function
main "$@"
