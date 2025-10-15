#!/usr/bin/env bash
# 🐉 KALI DRAGON - The Ultimate MCP Tool

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║          🐉 KALI DRAGON - THE ULTIMATE MCP TOOL 🐉          ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║                    WEB INTERFACE v3.0                      ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🌐 Universal Web Interface - Works everywhere!${NC}"
    echo ""
}

# Handle help
case "${1:-}" in
    --help|-h)
        print_header
        echo -e "${GREEN}🐉 KALI DRAGON HELP${NC}"
        echo ""
        echo -e "${CYAN}USAGE:${NC}"
        echo "  ./kali-dragon.sh          # Launch web interface"
        echo "  ./kali-dragon.sh --help   # Show help"
        echo ""
        echo -e "${CYAN}WHAT IT DOES:${NC}"
        echo "  • Starts a beautiful web interface"
        echo "  • Provides step-by-step setup guide"  
        echo "  • Opens important websites automatically"
        echo "  • Works on macOS, Windows, Linux"
        echo ""
        echo -e "${PURPLE}Ready to unleash the Dragon? Run: ./kali-dragon.sh${NC}"
        exit 0
        ;;
    --version|-v)
        print_header
        echo -e "${GREEN}🐉 Kali Dragon v3.0 - Web Edition${NC}"
        exit 0
        ;;
esac

# Main execution
print_header

# Check Python
if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}❌ Python3 not found!${NC}"
    echo -e "${BLUE}ℹ️  Install Python from: https://www.python.org/downloads/${NC}"
    exit 1
fi

# Check web file
if [ ! -f "kali-dragon-web.py" ]; then
    echo -e "${RED}❌ Web interface file missing!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python3 found${NC}"
echo -e "${GREEN}✅ Web interface ready${NC}"
echo ""

echo -e "${CYAN}🚀 CHOOSE YOUR DRAGON MODE:${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}1)${NC} 🌐 Launch Web Interface (Interactive GUI)"
echo -e "${YELLOW}2)${NC} 📚 Quick Setup Guide (Open websites)"
echo -e "${YELLOW}3)${NC} 🚪 Exit"
echo ""

read -p "$(echo -e "${CYAN}Select option [1-3]: ${NC}")" choice

case "$choice" in
    1)
        echo ""
        echo -e "${CYAN}🌐 LAUNCHING WEB INTERFACE...${NC}"
        echo "════════════════════════════════════════════════════════════"
        echo ""
        echo -e "${BLUE}ℹ️  Starting server... Look for the URL below:${NC}"
        echo -e "${YELLOW}📱 Copy the URL and open it in your browser${NC}"
        echo ""
        
        # Clean old server info
        rm -f server-info.txt server-error.txt 2>/dev/null
        
        # Launch web server in background
        python3 server-with-file.py &
        SERVER_PID=$!
        
        # Wait for server to start and write info
        echo -e "${BLUE}⏳ Starting server...${NC}"
        sleep 2
        
        # Check if server info file was created
        if [ -f "server-info.txt" ]; then
            echo -e "${GREEN}✅ Server started successfully!${NC}"
            echo ""
            cat server-info.txt
            echo ""
            echo -e "${CYAN}🚀 Server is running in background (PID: $SERVER_PID)${NC}"
            echo -e "${YELLOW}⏹️  To stop: kill $SERVER_PID${NC}"
        elif [ -f "server-error.txt" ]; then
            echo -e "${RED}❌ Server error:${NC}"
            cat server-error.txt
        else
            echo -e "${YELLOW}⚠️  Server may be starting... Check for server-info.txt file${NC}"
            echo -e "${BLUE}ℹ️  Try: cat server-info.txt${NC}"
        fi
        ;;
    2)
        echo ""
        echo -e "${CYAN}📚 QUICK SETUP GUIDE${NC}"
        echo "════════════════════════════════════════════════════════════"
        echo ""
        echo -e "${GREEN}✅ SETUP GUIDE FOR BEGINNERS:${NC}"
        echo ""
        echo -e "${YELLOW}📱 STEP 1: Install UTM${NC}"
        echo "   Visit: https://mac.getutm.app/"
        echo ""
        echo -e "${YELLOW}🐧 STEP 2: Download Kali Linux${NC}"
        echo "   Visit: https://www.kali.org/get-kali/"
        echo ""
        echo -e "${YELLOW}🐳 STEP 3: Install OrbStack${NC}"
        echo "   Visit: https://orbstack.dev/"
        echo ""
        echo -e "${YELLOW}🤖 STEP 4: Install Claude Desktop${NC}"
        echo "   Visit: https://claude.ai/desktop"
        echo ""
        echo -e "${CYAN}🌐 Opening all websites automatically...${NC}"
        echo ""
        
        # Open websites
        if command -v open >/dev/null 2>&1; then
            open "https://mac.getutm.app/"
            open "https://www.kali.org/get-kali/"
            open "https://orbstack.dev/"
            open "https://claude.ai/desktop"
            echo -e "${GREEN}✅ All setup websites opened in your browser!${NC}"
        else
            echo -e "${BLUE}ℹ️  Please visit these websites manually:${NC}"
            echo "   • https://mac.getutm.app/"
            echo "   • https://www.kali.org/get-kali/"
            echo "   • https://orbstack.dev/"
            echo "   • https://claude.ai/desktop"
        fi
        ;;
    3)
        echo ""
        echo -e "${GREEN}🐉 Thanks for using Kali Dragon!${NC}"
        echo -e "${PURPLE}May your dragons be legendary! ⚔️${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid choice. Please run again and select 1, 2, or 3.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${PURPLE}🐉 Kali Dragon complete!${NC}"
echo -e "${CYAN}Happy Ethical Hacking! ⚔️${NC}"
