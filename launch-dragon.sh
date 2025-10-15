#!/usr/bin/env bash
# 🐉 KALI DRAGON - Persistent Server Launcher

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}║          🐉 KALI DRAGON - PERSISTENT SERVER 🐉              ║${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}║                    LAUNCHING IN BACKGROUND                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing server
echo -e "${CYAN}🧹 Cleaning up any existing servers...${NC}"
pkill -f "persistent-server.py" 2>/dev/null || true
rm -f server-status.txt 2>/dev/null

# Make server executable
chmod +x persistent-server.py

# Launch server in background
echo -e "${CYAN}🚀 Starting Kali Dragon server in background...${NC}"
nohup python3 persistent-server.py > /dev/null 2>&1 &
SERVER_PID=$!

echo -e "${GREEN}✅ Server launched with PID: $SERVER_PID${NC}"
echo ""

# Wait a moment for server to initialize
echo -e "${BLUE}⏳ Initializing server...${NC}"
sleep 3

# Check if server status file exists
if [ -f "server-status.txt" ]; then
    echo -e "${GREEN}✅ Server is running! Status log:${NC}"
    echo "────────────────────────────────────────"
    cat server-status.txt
    echo "────────────────────────────────────────"
    echo ""
    echo -e "${YELLOW}🔥 COPY THIS URL AND OPEN IN BROWSER:${NC}"
    echo -e "${CYAN}http://localhost:8000/dragon-live.html${NC}"
    echo ""
    echo -e "${BLUE}📋 Server Management:${NC}"
    echo "  • Check status: cat server-status.txt"
    echo "  • Stop server:  kill $SERVER_PID"
    echo "  • View processes: ps aux | grep persistent-server"
    echo ""
    echo -e "${GREEN}🎉 Kali Dragon Web Interface is LIVE!${NC}"
else
    echo -e "${YELLOW}⚠️  Server may still be starting...${NC}"
    echo -e "${BLUE}💡 Try these commands:${NC}"
    echo "  • Wait 10 seconds then: cat server-status.txt"
    echo "  • Check if running: ps aux | grep persistent-server"
    echo "  • Manual URL: http://localhost:8000/dragon-live.html"
fi

echo ""
echo -e "${PURPLE}🐉 Happy Ethical Hacking! ⚔️${NC}"