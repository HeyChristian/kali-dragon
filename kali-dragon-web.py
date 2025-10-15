#!/usr/bin/env python3
"""
🐉 KALI DRAGON - Web Interface
Universal GUI that works on macOS, Windows & Linux
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import platform
import subprocess
import sys
import os
import json
from urllib.parse import parse_qs, urlparse

class KaliDragonHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_main_page()
        elif parsed_path.path == '/api/system-check':
            self.send_system_check()
        elif parsed_path.path == '/api/open-websites':
            self.open_websites()
        elif parsed_path.path == '/api/guide':
            self.send_guide()
        else:
            self.send_error(404)
            
    def send_main_page(self):
        """Send the main HTML page"""
        html_content = self.get_main_html()
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
        
    def send_system_check(self):
        """Send system check results"""
        system_info = self.get_system_info()
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(system_info).encode('utf-8'))
        
    def open_websites(self):
        """Open important websites"""
        websites = [
            "https://mac.getutm.app/",
            "https://www.kali.org/get-kali/",
            "https://orbstack.dev/",
            "https://claude.ai/desktop"
        ]
        
        for site in websites:
            webbrowser.open(site)
            time.sleep(0.5)  # Small delay between opens
            
        response = {"status": "success", "message": "All websites opened!"}
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
        
    def send_guide(self):
        """Send the setup guide"""
        guide = {
            "title": "🐉 Kali Dragon Setup Guide",
            "steps": [
                {
                    "step": 1,
                    "title": "📱 Install UTM (Virtual Machine)",
                    "description": "Download UTM for running Kali Linux on macOS",
                    "url": "https://mac.getutm.app/",
                    "details": [
                        "Visit the UTM website",
                        "Download from Mac App Store (recommended)",
                        "UTM provides excellent Apple Silicon support"
                    ]
                },
                {
                    "step": 2,
                    "title": "🐧 Download Kali Linux",
                    "description": "Get the official Kali Linux installer",
                    "url": "https://www.kali.org/get-kali/",
                    "details": [
                        "Download Kali Linux 64-Bit (Installer)",
                        "Create VM in UTM with 4GB RAM minimum",
                        "Allocate at least 64GB storage"
                    ]
                },
                {
                    "step": 3,
                    "title": "🔧 Configure VM Network",
                    "description": "Set up networking for your Kali VM",
                    "details": [
                        "Use 'Shared Network' in UTM settings",
                        "Enable SSH in Kali: sudo systemctl enable ssh",
                        "Find VM IP: ip addr show"
                    ]
                },
                {
                    "step": 4,
                    "title": "🐳 Install Docker (OrbStack)",
                    "description": "Get the best Docker experience on macOS",
                    "url": "https://orbstack.dev/",
                    "details": [
                        "OrbStack is faster and uses less resources",
                        "Perfect for Dragon containers",
                        "Better than Docker Desktop on macOS"
                    ]
                },
                {
                    "step": 5,
                    "title": "🤖 Install Claude Desktop",
                    "description": "Get the Claude Desktop app",
                    "url": "https://claude.ai/desktop",
                    "details": [
                        "Download and install Claude Desktop",
                        "Sign in with your Anthropic account",
                        "This will connect to your Kali Dragon"
                    ]
                },
                {
                    "step": 6,
                    "title": "🚀 Run Kali Dragon",
                    "description": "Execute the setup wizard",
                    "details": [
                        "Run the Kali Dragon setup wizard",
                        "Provide your Kali VM SSH credentials",
                        "Enjoy your legendary pentesting workspace!"
                    ]
                }
            ],
            "warning": "⚠️ IMPORTANT: Always hack ethically and responsibly! Only test systems you own or have explicit permission to test."
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(guide).encode('utf-8'))
        
    def get_system_info(self):
        """Get system information"""
        info = {
            "os": f"{platform.system()} {platform.release()}",
            "architecture": platform.machine(),
            "python": f"{sys.version.split()[0]}",
            "checks": []
        }
        
        # Check Python
        info["checks"].append({
            "name": "Python",
            "status": "success",
            "message": f"Python {sys.version.split()[0]} ✅"
        })
        
        # Check Docker
        try:
            result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                info["checks"].append({
                    "name": "Docker",
                    "status": "success", 
                    "message": f"Docker available ✅"
                })
            else:
                raise Exception("Docker not found")
        except:
            info["checks"].append({
                "name": "Docker",
                "status": "warning",
                "message": "Docker not found ⚠️ (install OrbStack or Docker Desktop)"
            })
            
        # Check SSH
        try:
            subprocess.run(["ssh", "-V"], capture_output=True, check=True)
            info["checks"].append({
                "name": "SSH",
                "status": "success",
                "message": "SSH available ✅"
            })
        except:
            info["checks"].append({
                "name": "SSH", 
                "status": "error",
                "message": "SSH not found ❌"
            })
            
        return info
        
    def get_main_html(self):
        """Generate the main HTML page"""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon - The Ultimate MCP Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: rgba(255,255,255,0.15);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .card:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.2);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .card h3 {
            font-size: 1.5em;
            margin-bottom: 15px;
            color: #fff;
        }
        
        .card p {
            opacity: 0.9;
            line-height: 1.6;
        }
        
        .system-info {
            background: rgba(0,0,0,0.2);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .check-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .check-item:last-child {
            border-bottom: none;
        }
        
        .status {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        
        .success { background: rgba(76, 175, 80, 0.3); }
        .warning { background: rgba(255, 193, 7, 0.3); }
        .error { background: rgba(244, 67, 54, 0.3); }
        
        .guide-container {
            display: none;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            margin-top: 20px;
        }
        
        .step {
            background: rgba(255,255,255,0.1);
            margin: 15px 0;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #00ff88;
        }
        
        .step h4 {
            margin-bottom: 10px;
            color: #00ff88;
        }
        
        .step-details {
            margin-top: 10px;
        }
        
        .step-details li {
            margin: 5px 0;
            opacity: 0.9;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        
        .spinner {
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐉 KALI DRAGON</h1>
            <p>The Ultimate Kali Linux MCP Tool</p>
            <p><em>Universal Web Interface - Works on macOS, Windows & Linux</em></p>
        </div>
        
        <div class="grid">
            <div class="card" onclick="showSetupWizard()">
                <h3>🚀 Full Setup Wizard</h3>
                <p>Complete automated installation and configuration of your Kali Dragon workspace.</p>
            </div>
            
            <div class="card" onclick="showGuide()">
                <h3>📚 Setup Guide</h3>
                <p>Step-by-step guide for beginners to set up UTM, Kali Linux, and all required tools.</p>
            </div>
            
            <div class="card" onclick="openWebsites()">
                <h3>🌐 Open Important Websites</h3>
                <p>Quickly open all the websites you need: UTM, Kali Linux, OrbStack, and Claude Desktop.</p>
            </div>
            
            <div class="card" onclick="systemCheck()">
                <h3>🔧 System Check</h3>
                <p>Check your system requirements and verify that all necessary tools are installed.</p>
            </div>
            
            <div class="card" onclick="showHelp()">
                <h3>❓ Help & Support</h3>
                <p>Get help, learn about Kali Dragon features, and find troubleshooting information.</p>
            </div>
        </div>
        
        <div id="systemInfo" class="system-info" style="display: none;">
            <h3>🔧 System Information</h3>
            <div id="systemChecks"></div>
        </div>
        
        <div id="guideContainer" class="guide-container">
            <h3>📚 Kali Dragon Setup Guide</h3>
            <div id="guideSteps"></div>
        </div>
        
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
        
        <div class="footer">
            <p>🐉 <strong>Kali Dragon v3.0</strong> - Web Edition</p>
            <p><em>Always hack ethically and responsibly! 🛡️</em></p>
        </div>
    </div>
    
    <div id="notification" class="notification">
        <span id="notificationText"></span>
    </div>
    
    <script>
        function showNotification(message) {
            const notification = document.getElementById('notification');
            document.getElementById('notificationText').textContent = message;
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
        }
        
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }
        
        function showSetupWizard() {
            showNotification('🚀 Setup Wizard feature coming in next update! Use Setup Guide for now.');
        }
        
        async function showGuide() {
            showLoading();
            try {
                const response = await fetch('/api/guide');
                const guide = await response.json();
                
                let html = `<p><strong>${guide.title}</strong></p>`;
                
                guide.steps.forEach(step => {
                    html += `
                        <div class="step">
                            <h4>${step.title}</h4>
                            <p>${step.description}</p>
                            ${step.url ? `<p><strong>🔗 <a href="${step.url}" target="_blank" style="color: #00ff88;">${step.url}</a></strong></p>` : ''}
                            <div class="step-details">
                                <ul>
                                    ${step.details.map(detail => `<li>${detail}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                });
                
                html += `<p style="color: #ff6b6b; margin-top: 20px;"><strong>${guide.warning}</strong></p>`;
                
                document.getElementById('guideSteps').innerHTML = html;
                document.getElementById('guideContainer').style.display = 'block';
                document.getElementById('systemInfo').style.display = 'none';
                
            } catch (error) {
                showNotification('❌ Error loading guide');
            }
            hideLoading();
        }
        
        async function openWebsites() {
            showLoading();
            showNotification('🌐 Opening websites in your browser...');
            
            try {
                const response = await fetch('/api/open-websites');
                const result = await response.json();
                showNotification(result.message);
            } catch (error) {
                showNotification('❌ Error opening websites');
            }
            hideLoading();
        }
        
        async function systemCheck() {
            showLoading();
            try {
                const response = await fetch('/api/system-check');
                const info = await response.json();
                
                let html = `
                    <div class="check-item">
                        <span><strong>Operating System:</strong></span>
                        <span>${info.os}</span>
                    </div>
                    <div class="check-item">
                        <span><strong>Architecture:</strong></span>
                        <span>${info.architecture}</span>
                    </div>
                    <div class="check-item">
                        <span><strong>Python Version:</strong></span>
                        <span>${info.python}</span>
                    </div>
                `;
                
                info.checks.forEach(check => {
                    html += `
                        <div class="check-item">
                            <span><strong>${check.name}:</strong></span>
                            <span class="status ${check.status}">${check.message}</span>
                        </div>
                    `;
                });
                
                document.getElementById('systemChecks').innerHTML = html;
                document.getElementById('systemInfo').style.display = 'block';
                document.getElementById('guideContainer').style.display = 'none';
                
            } catch (error) {
                showNotification('❌ Error performing system check');
            }
            hideLoading();
        }
        
        function showHelp() {
            const helpText = `
🐉 KALI DRAGON HELP

This is the Ultimate Kali Linux MCP Tool!

WHAT IT DOES:
• Automates Kali Linux MCP server setup
• Connects your Kali VM to Claude Desktop  
• Provides secure SSH-based access
• Creates comprehensive pentesting workspace

HOW TO USE:
1. Click "Setup Guide" to see step-by-step instructions
2. Follow the guide to install UTM, Kali Linux, OrbStack, etc.
3. Run the Setup Wizard when ready
4. Enjoy your Dragon-powered workspace!

FEATURES:
• Universal web interface
• Works on macOS, Windows, Linux
• No installation required
• Opens websites automatically
• System requirement checks

Happy Ethical Hacking! 🐉⚔️
            `;
            
            alert(helpText);
        }
        
        // Initialize
        window.addEventListener('load', () => {
            showNotification('🐉 Kali Dragon Web Interface Ready!');
        });
    </script>
</body>
</html>
        """

def find_free_port():
    """Find a free port to use"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def open_browser(url):
    """Open browser after a small delay"""
    time.sleep(1.5)  # Wait for server to start
    print(f"\n🌐 OPEN YOUR BROWSER TO: {url}", flush=True)
    print(f"🔗 Copy and paste this URL: {url}", flush=True)
    print(f"🚀 Kali Dragon Web Interface is ready!", flush=True)
    print("\n" + "=" * 50, flush=True)
    
    try:
        webbrowser.open(url)
        print(f"✅ Attempted to auto-open browser", flush=True)
    except Exception as e:
        print(f"⚠️  Auto-open failed: {e}", flush=True)
        print(f"📱 Please manually open: {url}", flush=True)

def main():
    """Main function to start the web server"""
    print("\n🐉 KALI DRAGON - Web Interface", flush=True)
    print("=" * 60, flush=True)
    
    # Find free port
    try:
        port = find_free_port()
        url = f"http://localhost:{port}"
        
        print(f"🚀 Starting web server on port {port}...", flush=True)
        print(f"🌐 Server will be available at: {url}", flush=True)
        print(f"🔗 Compatible with: macOS, Windows, Linux", flush=True)
        print("=" * 60, flush=True)
        print("📱 Press Ctrl+C to stop the server", flush=True)
        print(f"\n⏳ Starting server on {url}...", flush=True)
    except Exception as e:
        print(f"❌ Error finding port: {e}", flush=True)
        return
    
    # Start web server
    try:
        with socketserver.TCPServer(("", port), KaliDragonHandler) as httpd:
            actual_port = httpd.server_address[1]
            actual_url = f"http://localhost:{actual_port}"
            
            print(f"✅ Server started successfully on port {actual_port}", flush=True)
            print(f"🔥 Kali Dragon is now running at {actual_url}", flush=True)
            print(f"🎆 Ready to accept connections!\n", flush=True)
            
            # Start browser thread with correct URL
            browser_thread = threading.Thread(target=open_browser, args=(actual_url,))
            browser_thread.daemon = True
            browser_thread.start()
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🐉 Thanks for using Kali Dragon!", flush=True)
        print("🛑 Server stopped.", flush=True)
    except Exception as e:
        print(f"\n❌ Server error: {e}", flush=True)
        print(f"🔍 Check if port is available", flush=True)

if __name__ == "__main__":
    main()