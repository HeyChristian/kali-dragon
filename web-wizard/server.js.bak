#!/usr/bin/env node

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8000;

// System state checker
function checkSystemState() {
    const state = {
        os: os.platform(),
        nodeVersion: process.version,
        pythonInstalled: false,
        dockerInstalled: false,
        sshAvailable: false,
        kaliConnected: false,
        mcpServerRunning: false
    };
    
    // These checks are sync/simplified for immediate response
    // In a real scenario, you'd want async checks
    return state;
}

// Serve the main HTML page with embedded CSS/JS
function serveHTML(res) {
    const state = checkSystemState();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon Web Wizard v4.0</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js for interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'dragon-purple': '#764ba2',
                        'dragon-blue': '#667eea',
                        'terminal-bg': '#1e1e1e',
                        'terminal-green': '#00ff00'
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s infinite',
                        'bounce-gentle': 'bounce 2s infinite'
                    }
                }
            }
        }
    </script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .terminal-font {
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐉 KALI DRAGON</h1>
            <p>Web Wizard Dashboard v4.0</p>
            <p><em>Ultimate Kali Linux MCP Management Interface</em></p>
            <p><strong>⚡ No npm install needed - Pure Node.js!</strong></p>
        </div>

        <div class="dashboard-grid">
            <!-- System Status -->
            <div class="card">
                <h3>📊 System Status</h3>
                <div class="status-item">
                    <span>Operating System</span>
                    <span class="status-indicator status-success">${state.os}</span>
                </div>
                <div class="status-item">
                    <span>Node.js</span>
                    <span class="status-indicator status-success">${state.nodeVersion}</span>
                </div>
                <div class="status-item">
                    <span>Python</span>
                    <span class="status-indicator status-warning">⚠️ Check Required</span>
                </div>
                <div class="status-item">
                    <span>Docker</span>
                    <span class="status-indicator status-warning">⚠️ Check Required</span>
                </div>
                <div class="status-item">
                    <span>SSH</span>
                    <span class="status-indicator status-warning">⚠️ Check Required</span>
                </div>
                <div class="status-item">
                    <span>Kali Connection</span>
                    <span class="status-indicator status-warning">⚠️ Not Connected</span>
                </div>
                <div class="status-item">
                    <span>MCP Server</span>
                    <span class="status-indicator status-warning">⚠️ Stopped</span>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <h3>🚀 Quick Actions</h3>
                <div class="actions-grid">
                    <button class="action-button" onclick="runCommand('echo \\"🐧 Starting Kali Linux setup...\\" && echo \\"This will execute your Kali setup scripts\\"')">
                        <span>🐧</span>
                        <span>Setup Kali Linux</span>
                    </button>
                    <button class="action-button secondary" onclick="checkSystem()">
                        <span>🔍</span>
                        <span>System Check</span>
                    </button>
                    <button class="action-button secondary" onclick="toggleTerminal()">
                        <span>💻</span>
                        <span>Open Terminal</span>
                    </button>
                    <button class="action-button warning" onclick="installDependencies()">
                        <span>📦</span>
                        <span>Install Dependencies</span>
                    </button>
                    <button class="action-button" onclick="runCommand('echo \\"🚀 MCP Server functionality coming soon...\\" && echo \\"Will integrate with your existing MCP scripts\\"')">
                        <span>🚀</span>
                        <span>Start MCP Server</span>
                    </button>
                    <button class="action-button secondary" onclick="window.open('https://github.com/your-repo/kali-dragon', '_blank')">
                        <span>📚</span>
                        <span>Documentation</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Terminal -->
        <div class="card terminal-container" id="terminal">
            <h3>💻 Kali Dragon Terminal</h3>
            <div class="terminal-output" id="terminal-output">
                <div style="color: #4CAF50;">🐉 Kali Dragon Terminal Ready</div>
                <div style="color: #2196F3;">Type commands below or use Quick Actions above</div>
                <div style="color: #FFC107;">⚡ No external dependencies needed - Pure Node.js power!</div>
                <div>─────────────────────────────────────</div>
            </div>
            <div class="command-input">
                <input type="text" id="command-input" placeholder="Enter command..." onkeypress="handleKeyPress(event)">
                <button onclick="executeCommand()">Execute</button>
            </div>
        </div>
    </div>

    <script>
        let terminalVisible = false;

        // Terminal functions
        function toggleTerminal() {
            const terminal = document.getElementById('terminal');
            terminal.style.display = terminalVisible ? 'none' : 'block';
            terminalVisible = !terminalVisible;
            
            if (terminalVisible) {
                document.getElementById('command-input').focus();
            }
        }

        function appendToTerminal(text, color = '#00ff00') {
            const output = document.getElementById('terminal-output');
            const div = document.createElement('div');
            div.style.color = color;
            div.textContent = text;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                executeCommand();
            }
        }

        async function executeCommand() {
            const input = document.getElementById('command-input');
            const command = input.value.trim();
            
            if (!command) return;
            
            appendToTerminal('$ ' + command, '#4CAF50');
            input.value = '';
            
            try {
                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ command })
                });
                
                const result = await response.json();
                
                if (result.output) {
                    appendToTerminal(result.output);
                }
                
                if (result.error) {
                    appendToTerminal(result.error, '#ff6b6b');
                }
                
            } catch (error) {
                appendToTerminal('Error: ' + error.message, '#ff6b6b');
            }
        }

        function runCommand(command) {
            if (!terminalVisible) toggleTerminal();
            
            document.getElementById('command-input').value = command;
            setTimeout(executeCommand, 100);
        }

        async function checkSystem() {
            runCommand('echo "🔍 Checking system requirements..." && which python3 && which docker && which ssh');
            
            setTimeout(() => {
                location.reload();
            }, 3000);
        }

        function installDependencies() {
            if (!terminalVisible) toggleTerminal();
            
            const commands = [
                'echo "🐉 Checking Kali Dragon dependencies..."',
                'echo "📍 Checking Python3..." && which python3 || echo "❌ Python3 not found - install from https://python.org"',
                'echo "📍 Checking Docker..." && which docker || echo "❌ Docker not found - install OrbStack from https://orbstack.dev"', 
                'echo "📍 Checking SSH..." && which ssh || echo "❌ SSH not found"',
                'echo "✅ Dependency check complete!"'
            ];
            
            commands.forEach((cmd, index) => {
                setTimeout(() => runCommand(cmd), index * 2000);
            });
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

// Handle API requests
function handleAPI(req, res, pathname) {
    if (pathname === '/api/execute' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body);
                
                const child = spawn('bash', ['-c', command], {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                
                let output = '';
                let error = '';
                
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    error += data.toString();
                });
                
                child.on('close', (code) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        output: output.trim(),
                        error: error.trim(),
                        exitCode: code
                    }));
                });
                
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (pathname === '/api/status') {
        const state = checkSystemState();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, state }));
    } else {
        res.writeHead(404);
        res.end('API endpoint not found');
    }
}

// Create simple HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Route handling
    if (pathname === '/' || pathname === '/dashboard') {
        serveHTML(res);
    } else if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Open browser automatically
function openBrowser(url) {
    const platform = os.platform();
    const command = platform === 'darwin' ? 'open' :
                   platform === 'win32' ? 'start' : 'xdg-open';
    
    spawn(command, [url], { stdio: 'ignore', detached: true }).unref();
}

// Start server
server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log('\n🐉 KALI DRAGON WEB WIZARD v4.0');
    console.log('═══════════════════════════════════');
    console.log(`🚀 Server running at: ${url}`);
    console.log('⚡ No npm install needed - Pure Node.js!');
    console.log('📱 Opening browser automatically...');
    console.log('🐉 Press Ctrl+C to stop the server');
    console.log('═══════════════════════════════════\n');
    
    // Open browser after a short delay
    setTimeout(() => openBrowser(url), 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🐉 Kali Dragon Web Wizard shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🐉 Kali Dragon Web Wizard shutting down gracefully...');
    process.exit(0);
});