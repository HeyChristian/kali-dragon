#!/usr/bin/env zsh
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
KALI_PASSWORD=""
SSH_PORT="22"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_IMAGE_NAME="kali-mcp-server"

# Print header
print_header() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║          🐉 KALI DRAGON - THE ULTIMATE MCP TOOL 🐉          ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║  $1${NC}"
    printf "${PURPLE}║%*s║${NC}\\n" $((62 - ${#1})) ""
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Ask yes/no question
ask_yes_no() {
    local prompt="$1"
    local default="${2:-y}"
    local response
    
    while true; do
        if [[ "$default" == "y" ]]; then
            echo -e "${CYAN}$prompt [Y/n]: ${NC}"
            read response
            response=${response:-y}
        else
            echo -e "${CYAN}$prompt [y/N]: ${NC}"
            read response
            response=${response:-n}
        fi
        
        case $response in
            [Yy]|[Yy][Ee][Ss]) return 0 ;;
            [Nn]|[Nn][Oo]) return 1 ;;
            *) echo "Please answer yes or no." ;;
        esac
    done
}

# Main menu selection
show_main_menu() {
    print_header "MAIN MENU - SELECT YOUR OPTION"
    
    echo -e "${GREEN}🐉 Welcome to Kali Dragon - The Ultimate MCP Tool!${NC}"
    echo ""
    echo -e "${CYAN}What would you like to do?${NC}"
    echo ""
    echo -e "${YELLOW}1)${NC} 🚀 ${GREEN}Full Setup Wizard${NC} - Complete automated installation"
    echo -e "${YELLOW}2)${NC} 🔧 ${BLUE}Repair/Fix${NC} - Fix existing configuration issues"
    echo -e "${YELLOW}3)${NC} 🧹 ${RED}Clean/Reset${NC} - Remove all configurations and start fresh"
    echo -e "${YELLOW}4)${NC} 📚 ${PURPLE}Setup Guide${NC} - Install UTM and Kali Linux (for beginners)"
    echo -e "${YELLOW}5)${NC} ❓ ${CYAN}Help${NC} - Show detailed help and documentation"
    echo -e "${YELLOW}6)${NC} 🚪 Exit${NC} - Quit Kali Dragon"
    echo ""
}

# Get menu choice - SIMPLIFIED VERSION
get_menu_choice() {
    local choice
    printf "${CYAN}Enter your choice [1-6]: ${NC}"
    read choice
    echo $choice
}

# Show help
show_help() {
    print_header "KALI DRAGON - HELP & DOCUMENTATION"
    
    echo -e "${GREEN}🐉 Kali Dragon - The Ultimate Kali Linux MCP Tool${NC}"
    echo ""
    echo -e "${CYAN}DESCRIPTION:${NC}"
    echo "  Kali Dragon automates the complete setup of a Kali Linux MCP server"
    echo "  for Claude Desktop, enabling secure SSH-based access to your Kali VM."
    echo ""
    echo -e "${CYAN}FEATURES:${NC}"
    echo "  🔑 Automated SSH key generation and deployment"
    echo "  🐳 Optimized Docker MCP server with health checks"
    echo "  📁 Pre-configured workspace with tools and documentation"
    echo "  ⚙️  Automatic Claude Desktop configuration"
    echo "  🧪 End-to-end testing and validation"
    echo "  🔧 Built-in repair and cleanup functions"
    echo ""
    echo -e "${CYAN}USAGE:${NC}"
    echo "  ./kali-dragon.sh          - Interactive main menu"
    echo "  ./kali-dragon.sh --wizard - Direct to full setup wizard"
    echo "  ./kali-dragon.sh --clean  - Direct to cleanup mode"
    echo "  ./kali-dragon.sh --repair - Direct to repair mode"
    echo "  ./kali-dragon.sh --guide  - Show beginner's setup guide"
    echo "  ./kali-dragon.sh --help   - Show this help"
    echo ""
    echo -e "${GREEN}Happy Ethical Hacking! 🐉⚡${NC}"
    echo ""
    
    echo -e "${CYAN}Press any key to return to main menu...${NC}"
    read -k1
}

# Setup Guide for beginners
show_setup_guide() {
    print_header "KALI DRAGON - BEGINNER'S SETUP GUIDE"
    
    echo -e "${GREEN}🐉 Welcome, Future Dragon Master!${NC}"
    echo ""
    echo -e "${CYAN}This guide will help you set up everything from scratch.${NC}"
    echo ""
    
    while true; do
        echo -e "${YELLOW}Setup Guide Options:${NC}"
        echo -e "${YELLOW}1)${NC} 📱 ${BLUE}Install UTM (Virtual Machine)${NC}"
        echo -e "${YELLOW}2)${NC} 🐧 ${GREEN}Download and Setup Kali Linux${NC}"
        echo -e "${YELLOW}3)${NC} 🔧 ${PURPLE}Configure VM Network Settings${NC}"
        echo -e "${YELLOW}4)${NC} 🐳 ${CYAN}Install Docker (Orbstack)${NC}"
        echo -e "${YELLOW}5)${NC} 🤖 ${YELLOW}Install Claude Desktop${NC}"
        echo -e "${YELLOW}6)${NC} 🔙 Back to Main Menu${NC}"
        echo ""
        
        echo -e "${CYAN}Choose setup step [1-6]: ${NC}"
        read guide_choice
        
        case $guide_choice in
            1) 
                echo -e "${GREEN}📱 UTM Installation Guide${NC}"
                echo "Visit: https://mac.getutm.app/"
                if ask_yes_no "🚀 Open UTM website now?"; then
                    open "https://mac.getutm.app/"
                    print_success "UTM website opened in your browser"
                fi
                ;;
            2) 
                echo -e "${GREEN}🐧 Kali Linux Download Guide${NC}"
                echo "Visit: https://www.kali.org/get-kali/"
                if ask_yes_no "🚀 Open Kali website now?"; then
                    open "https://www.kali.org/get-kali/"
                    print_success "Kali website opened in your browser"
                fi
                ;;
            3)
                echo -e "${GREEN}🔧 Network Configuration Tips${NC}"
                echo "• Use 'Shared Network' in UTM"
                echo "• Enable SSH in Kali: sudo systemctl enable ssh"
                echo "• Find IP: ip addr show"
                ;;
            4)
                echo -e "${GREEN}🐳 Docker Installation${NC}"
                echo "Recommended: OrbStack (https://orbstack.dev/)"
                if ask_yes_no "🚀 Open OrbStack website now?"; then
                    open "https://orbstack.dev/"
                    print_success "OrbStack website opened"
                fi
                ;;
            5)
                echo -e "${GREEN}🤖 Claude Desktop${NC}"
                echo "Visit: https://claude.ai/desktop"
                if ask_yes_no "🚀 Open Claude website now?"; then
                    open "https://claude.ai/desktop"
                    print_success "Claude website opened"
                fi
                ;;
            6) return ;; # Return to main menu
            *) echo -e "${RED}Invalid choice. Please enter 1-6.${NC}" ;;
        esac
        
        echo ""
        echo -e "${CYAN}Press any key to continue...${NC}"
        read -k1
        clear
        print_header "KALI DRAGON - BEGINNER'S SETUP GUIDE"
    done
}

# Placeholder functions
run_full_wizard() {
    print_header "FULL SETUP WIZARD"
    echo -e "${YELLOW}🚧 Full wizard functionality coming soon!${NC}"
    echo -e "${CYAN}This will include complete SSH setup, Docker building, and Claude configuration.${NC}"
    echo ""
    echo -e "${CYAN}Press any key to return to main menu...${NC}"
    read -k1
}

repair_configuration() {
    print_header "REPAIR CONFIGURATION"
    echo -e "${BLUE}🔧 Repair functionality coming soon!${NC}"
    echo -e "${CYAN}This will detect and fix common configuration issues.${NC}"
    echo ""
    echo -e "${CYAN}Press any key to return to main menu...${NC}"
    read -k1
}

clean_all_configurations() {
    print_header "CLEAN ALL CONFIGURATIONS"
    echo -e "${RED}🧹 Clean functionality coming soon!${NC}"
    echo -e "${CYAN}This will safely remove all Dragon configurations with backups.${NC}"
    echo ""
    echo -e "${CYAN}Press any key to return to main menu...${NC}"
    read -k1
}

# Main function with menu system - FIXED VERSION
main() {
    # Check for command line arguments
    case "${1:-}" in
        --wizard|-w)
            run_full_wizard
            exit 0
            ;;
        --clean|-c)
            clean_all_configurations
            exit 0
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        --repair|-r)
            repair_configuration
            exit 0
            ;;
        --guide|-g)
            show_setup_guide
            exit 0
            ;;
    esac
    
    # Main menu loop - FIXED VERSION
    while true; do
        show_main_menu
        
        local choice
        choice=$(get_menu_choice)
        
        case $choice in
            1)
                # Full Setup Wizard
                run_full_wizard
                ;;
            2)
                # Repair/Fix
                repair_configuration
                ;;
            3)
                # Clean/Reset
                clean_all_configurations
                ;;
            4)
                # Setup Guide
                show_setup_guide
                ;;
            5)
                # Help
                show_help
                ;;
            6)
                # Exit
                print_header "GOODBYE FROM KALI DRAGON!"
                echo -e "${GREEN}🐉 Thanks for using Kali Dragon!${NC}"
                echo -e "${CYAN}💡 Remember: Always hack ethically and responsibly${NC}"
                echo ""
                exit 0
                ;;
        esac
    done
}

# Run Kali Dragon
main "$@"