#!/usr/bin/env python3
"""
Persistent server that stays running and logs status
"""
import http.server
import socketserver
import os
import sys
import signal
import time
import threading
from datetime import datetime

def write_status(status, port=None):
    """Write server status to file"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    with open('server-status.txt', 'a') as f:
        if port:
            f.write(f"[{timestamp}] {status} - Port: {port}\n")
        else:
            f.write(f"[{timestamp}] {status}\n")

def cleanup_and_exit():
    """Clean exit handler"""
    write_status("🛑 Server stopped")
    sys.exit(0)

def main():
    # Clean old status file
    if os.path.exists('server-status.txt'):
        os.remove('server-status.txt')
    
    write_status("🐉 Kali Dragon Server Starting...")
    
    port = 8000
    try:
        # Create HTML file
        html_content = '''<!DOCTYPE html>
<html>
<head>
    <title>🐉 Kali Dragon - Live Server</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh;
        }
        .container { max-width: 800px; margin: 50px auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 4em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .status { 
            background: rgba(76, 175, 80, 0.2); 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center;
            margin: 20px 0;
            border: 2px solid #4CAF50;
        }
        .card { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            margin: 20px 0; 
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .button { 
            background: #4CAF50; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px;
            display: inline-block;
            margin: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .button:hover { 
            background: #45a049; 
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐉 KALI DRAGON</h1>
            <p style="font-size: 1.5em;">The Ultimate Kali Linux MCP Tool</p>
        </div>
        
        <div class="status pulse">
            <h2>✅ SERVER IS LIVE!</h2>
            <p>🔥 Web interface is running successfully</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>🚀 Quick Setup</h2>
                <p>Open all required setup websites:</p>
                <a href="https://mac.getutm.app/" target="_blank" class="button">📱 UTM</a>
                <a href="https://www.kali.org/get-kali/" target="_blank" class="button">🐧 Kali Linux</a>
                <a href="https://orbstack.dev/" target="_blank" class="button">🐳 OrbStack</a>
                <a href="https://claude.ai/desktop" target="_blank" class="button">🤖 Claude</a>
            </div>
            
            <div class="card">
                <h2>📋 Setup Guide</h2>
                <ol style="text-align: left;">
                    <li><strong>Install UTM</strong> - Virtual machine for macOS</li>
                    <li><strong>Download Kali Linux</strong> - Get the installer image</li>
                    <li><strong>Install OrbStack</strong> - Better Docker for macOS</li>
                    <li><strong>Install Claude Desktop</strong> - AI assistant</li>
                    <li><strong>Configure VM</strong> - 4GB RAM, shared network</li>
                    <li><strong>Enable SSH</strong> - sudo systemctl enable ssh</li>
                    <li><strong>Run Dragon Wizard</strong> - Complete setup</li>
                </ol>
            </div>
        </div>
        
        <div class="card">
            <h2>🔧 Advanced Options</h2>
            <p>For advanced users:</p>
            <button onclick="openAll()" class="button">🌐 Open All Links</button>
            <button onclick="showIP()" class="button">📡 Show Network Info</button>
            <button onclick="refresh()" class="button">🔄 Refresh Page</button>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 10px;">
            <p><strong>⚠️ ETHICAL HACKING REMINDER</strong></p>
            <p>Always hack ethically and responsibly. Only test systems you own or have explicit permission to test.</p>
            <p style="font-size: 1.2em;"><strong>🐉 Happy Ethical Hacking! ⚔️</strong></p>
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
            websites.forEach(url => window.open(url, '_blank'));
            alert('🌐 All setup websites opened!');
        }
        
        function showIP() {
            alert('🌐 Server running on: http://localhost:''' + str(port) + '''\n📡 Access from local network: http://[your-ip]:''' + str(port) + '''');
        }
        
        function refresh() {
            location.reload();
        }
        
        // Show connection status
        setInterval(() => {
            document.title = '🐉 Kali Dragon - Live Server (' + new Date().toLocaleTimeString() + ')';
        }, 1000);
    </script>
</body>
</html>'''
        
        with open('dragon-live.html', 'w') as f:
            f.write(html_content)
        
        write_status("✅ HTML file created")
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, lambda s, f: cleanup_and_exit())
        signal.signal(signal.SIGTERM, lambda s, f: cleanup_and_exit())
        
        # Create and start server
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            actual_port = httpd.server_address[1]
            write_status(f"🔥 Server started successfully", actual_port)
            
            # Heartbeat thread
            def heartbeat():
                while True:
                    time.sleep(30)
                    write_status("💓 Server heartbeat - still running")
            
            heartbeat_thread = threading.Thread(target=heartbeat)
            heartbeat_thread.daemon = True
            heartbeat_thread.start()
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                cleanup_and_exit()
                
    except Exception as e:
        write_status(f"❌ Server error: {e}")

if __name__ == "__main__":
    main()