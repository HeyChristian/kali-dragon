#!/usr/bin/env bash
# 🐉 KALI DRAGON - Simple Working Version

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
    echo -e "${PURPLE}║          🐉 KALI DRAGON - THE ULTIMATE MCP TOOL 🐉          ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║                      SIMPLE VERSION                         ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Try to launch GUI first, fallback to menu
main() {
    print_header
    
    echo -e "${CYAN}🔍 Checking for GUI capabilities...${NC}"
    
    # Check if we can launch GUI
    if command -v python3 >/dev/null 2>&1 && python3 -c "import tkinter" 2>/dev/null; then
        if [ -f "kali-dragon-gui.py" ]; then
            echo -e "${GREEN}🎨 Launching GUI...${NC}"
            python3 kali-dragon-gui.py
            return
        fi
    fi
    
    # Fallback to simple menu
    echo -e "${YELLOW}⚠️  GUI not available, showing menu...${NC}"
    echo ""
    
    while true; do
        echo -e "${CYAN}What would you like to do?${NC}"
        echo ""
        echo -e "${YELLOW}1)${NC} 🚀 Setup Wizard (Coming Soon)"
        echo -e "${YELLOW}2)${NC} 📚 Setup Guide"
        echo -e "${YELLOW}3)${NC} 🌐 Open Important Websites"
        echo -e "${YELLOW}4)${NC} ❓ Help"
        echo -e "${YELLOW}5)${NC} 🚪 Exit"
        echo ""
        
        read -p "$(echo -e "${CYAN}Enter choice [1-5]: ${NC}")" choice
        
        case $choice in
            1)
                print_success "Setup Wizard functionality coming soon!"
                ;;
            2)
                show_guide
                ;;
            3)
                open_websites
                ;;
            4)
                show_help
                ;;
            5)
                echo -e "${GREEN}🐉 Thanks for using Kali Dragon!${NC}"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-5."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        print_header
    done
}

# Show setup guide
show_guide() {
    print_header
    echo -e "${GREEN}📚 KALI DRAGON SETUP GUIDE${NC}"
    echo ""
    echo "1. 📱 Install UTM: https://mac.getutm.app/"
    echo "2. 🐧 Download Kali: https://www.kali.org/get-kali/"
    echo "3. 🐳 Install Docker: https://orbstack.dev/"
    echo "4. 🤖 Get Claude Desktop: https://claude.ai/desktop"
    echo ""
    echo "Once you have these installed, run the full wizard!"
}

# Open websites
open_websites() {
    echo -e "${CYAN}🌐 Opening important websites...${NC}"
    
    open "https://mac.getutm.app/"
    open "https://www.kali.org/get-kali/"
    open "https://orbstack.dev/"
    open "https://claude.ai/desktop"
    
    print_success "All websites opened in your browser!"
}

# Show help
show_help() {
    print_header
    echo -e "${GREEN}🐉 KALI DRAGON HELP${NC}"
    echo ""
    echo "This is a simple version that works!"
    echo ""
    echo "Features:"
    echo "• Auto-detects GUI capability"
    echo "• Falls back to terminal menu"
    echo "• Opens important websites"
    echo "• Setup guidance"
    echo ""
    echo "To use: just run ./kali-dragon-simple.sh"
}

# Run main function
main "$@"