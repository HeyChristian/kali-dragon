#!/usr/bin/env bash
# 🐉 KALI DRAGON - Direct Launch Version

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
echo -e "${PURPLE}║          🐉 KALI DRAGON - THE ULTIMATE MCP TOOL 🐉          ║${NC}"
echo -e "${PURPLE}║                                                              ║${NC}"
echo -e "${PURPLE}║                      DIRECT LAUNCH                          ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}🚀 KALI DRAGON SETUP GUIDE${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📱 STEP 1: Install UTM (Virtual Machine)${NC}"
echo "   Visit: https://mac.getutm.app/"
echo "   Download from Mac App Store (recommended)"
echo ""
echo -e "${YELLOW}🐧 STEP 2: Download Kali Linux${NC}"
echo "   Visit: https://www.kali.org/get-kali/"
echo "   Download: Kali Linux 64-Bit (Installer)"
echo ""
echo -e "${YELLOW}🐳 STEP 3: Install OrbStack (Better Docker)${NC}"
echo "   Visit: https://orbstack.dev/"
echo "   Faster and uses less resources than Docker Desktop"
echo ""
echo -e "${YELLOW}🤖 STEP 4: Install Claude Desktop${NC}"
echo "   Visit: https://claude.ai/desktop"
echo "   Sign in with your Anthropic account"
echo ""
echo -e "${YELLOW}🚀 STEP 5: Setup VM${NC}"
echo "   • Create VM in UTM with 4GB RAM minimum"
echo "   • Use 'Shared Network' in UTM settings"
echo "   • Enable SSH in Kali: sudo systemctl enable ssh"
echo ""
echo -e "${CYAN}🌐 Opening all setup websites in your browser...${NC}"
echo ""

# Open all websites
open "https://mac.getutm.app/"
sleep 1
open "https://www.kali.org/get-kali/"
sleep 1  
open "https://orbstack.dev/"
sleep 1
open "https://claude.ai/desktop"

echo -e "${GREEN}✅ All websites opened!${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT ETHICAL HACKING NOTICE:${NC}"
echo "Only test systems you own or have explicit permission to test!"
echo ""
echo -e "${PURPLE}🐉 Kali Dragon setup complete!${NC}"
echo -e "${CYAN}Happy Ethical Hacking! ⚔️${NC}"