#!/usr/bin/env bash
# 🐉 KALI DRAGON - Direct Web Server using netcat

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to find free port
find_free_port() {
    local port
    for port in 8000 8080 8888 9000 3000 5000; do
        if ! lsof -i :$port >/dev/null 2>&1; then
            echo $port
            return 0
        fi
    done
    echo 8000  # fallback
}

# HTML content
create_html() {
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>🐉 Kali Dragon - The Ultimate MCP Tool</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 3em; margin: 0; }
        .card { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .button { 
            background: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px;
            display: inline-block;
            margin: 5px;
        }
        .button:hover { background: #45a049; }
        .step { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐉 KALI DRAGON</h1>
            <p>The Ultimate Kali Linux MCP Tool</p>
        </div>
        
        <div class="card">
            <h2>🚀 Setup Guide</h2>
            <div class="step">📱 <strong>Step 1:</strong> Install UTM - <a href="https://mac.getutm.app/" target="_blank" class="button">Visit UTM</a></div>
            <div class="step">🐧 <strong>Step 2:</strong> Download Kali Linux - <a href="https://www.kali.org/get-kali/" target="_blank" class="button">Get Kali</a></div>
            <div class="step">🐳 <strong>Step 3:</strong> Install OrbStack - <a href="https://orbstack.dev/" target="_blank" class="button">Get OrbStack</a></div>
            <div class="step">🤖 <strong>Step 4:</strong> Install Claude Desktop - <a href="https://claude.ai/desktop" target="_blank" class="button">Get Claude</a></div>
        </div>
        
        <div class="card">
            <h2>🌐 Quick Access</h2>
            <p>Click to open all setup websites:</p>
            <a href="javascript:openAll()" class="button">🚀 Open All Websites</a>
        </div>
        
        <div class="card">
            <h2>📋 Next Steps</h2>
            <ul>
                <li>Create VM in UTM with 4GB RAM minimum</li>
                <li>Use 'Shared Network' in UTM settings</li>
                <li>Enable SSH in Kali: <code>sudo systemctl enable ssh</code></li>
                <li>Find VM IP: <code>ip addr show</code></li>
                <li>Run Kali Dragon setup wizard</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <p><strong>⚠️ IMPORTANT:</strong> Always hack ethically and responsibly!</p>
            <p>🐉 Happy Ethical Hacking! ⚔️</p>
        </div>
    </div>
    
    <script>
        function openAll() {
            const websites = [
                'https://mac.getutm.app/',
                'https://www.kali.org/get-kali/', 
                'https://orbstack.dev/',
                'https://claude.ai/desktop'
            ];
            
            websites.forEach(url => {
                window.open(url, '_blank');
            });
        }
    </script>
</body>
</html>
EOF
}

# Main function
main() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║          🐉 KALI DRAGON - WEB SERVER DIRECT 🐉              ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Find free port
    PORT=$(find_free_port)
    URL="http://localhost:$PORT"
    
    echo -e "${CYAN}🚀 Starting Kali Dragon Web Server...${NC}"
    echo -e "${BLUE}📡 Port: $PORT${NC}"
    echo -e "${GREEN}🌐 URL: $URL${NC}"
    echo ""
    
    # Create HTML file
    create_html
    
    echo -e "${YELLOW}🔥 COPY THIS URL AND OPEN IN BROWSER:${NC}"
    echo -e "${CYAN}$URL${NC}"
    echo ""
    echo -e "${BLUE}📱 Server starting in 3 seconds...${NC}"
    sleep 3
    
    # Start simple HTTP server
    if command -v python3 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Starting Python HTTP server...${NC}"
        python3 -m http.server $PORT
    else
        echo -e "${RED}❌ Python3 not found${NC}"
        exit 1
    fi
}

main "$@"