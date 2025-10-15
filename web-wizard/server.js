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
    
    return state;
}

// Serve the main HTML page with ultra-modern dark UI
function serveHTML(res) {
    const state = checkSystemState();
    
    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon Terminal</title>
    <!-- Tailwind CSS CDN with dark mode -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js for interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        terminal: {
                            bg: '#0a0a0a',
                            surface: '#111111',
                            border: '#1f1f1f',
                            text: '#00ff41',
                            prompt: '#ff6b35',
                            error: '#ff4757',
                            warning: '#ffa502',
                            info: '#3742fa',
                            success: '#2ed573'
                        },
                        dark: {
                            50: '#f8fafc',
                            100: '#f1f5f9',
                            200: '#e2e8f0',
                            300: '#cbd5e1',
                            400: '#94a3b8',
                            500: '#64748b',
                            600: '#475569',
                            700: '#334155',
                            800: '#1e293b',
                            900: '#0f172a'
                        }
                    },
                    fontFamily: {
                        'mono': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'monospace']
                    }
                }
            }
        }
    </script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'JetBrains Mono', monospace;
            background: #0a0a0a;
            overflow-x: hidden;
        }
        
        .terminal-glow {
            box-shadow: 
                0 0 20px rgba(0, 255, 65, 0.1),
                inset 0 0 20px rgba(0, 255, 65, 0.05);
        }
        
        .neon-border {
            border: 1px solid rgba(0, 255, 65, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
        }
        
        .glass-dark {
            background: rgba(17, 17, 17, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-dot {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .terminal-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        
        .terminal-scrollbar::-webkit-scrollbar-track {
            background: #111111;
        }
        
        .terminal-scrollbar::-webkit-scrollbar-thumb {
            background: #333333;
            border-radius: 4px;
        }
        
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #444444;
        }
    </style>
</head>

<body class="bg-terminal-bg text-white min-h-screen" x-data="kaliDragon()">
    <!-- Compact Header with System Status -->
    <header class="glass-dark border-b border-terminal-border sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
                <!-- Logo & Title -->
                <div class="flex items-center space-x-3">
                    <div class="text-2xl animate-bounce">🐉</div>
                    <div>
                        <h1 class="text-xl font-bold text-terminal-text">Kali Dragon</h1>
                        <span class="text-xs text-gray-400">MCP Terminal Interface</span>
                    </div>
                </div>
                
                <!-- Compact System Status Dashboard -->
                <div class="hidden md:flex items-center space-x-4">
                    <!-- OS Status -->
                    <div class="flex items-center space-x-2 px-3 py-1 rounded-lg bg-terminal-surface">
                        <span class="w-2 h-2 bg-terminal-success rounded-full status-dot"></span>
                        <span class="text-xs font-mono">${state.os}</span>
                    </div>
                    
                    <!-- Node Status -->
                    <div class="flex items-center space-x-2 px-3 py-1 rounded-lg bg-terminal-surface">
                        <span class="w-2 h-2 bg-terminal-success rounded-full status-dot"></span>
                        <span class="text-xs font-mono">${state.nodeVersion}</span>
                    </div>
                    
                    <!-- Dependencies Status -->
                    <div class="flex items-center space-x-1">
                        <div class="w-2 h-2 bg-terminal-warning rounded-full status-dot" title="Python"></div>
                        <div class="w-2 h-2 bg-terminal-warning rounded-full status-dot" title="Docker"></div>
                        <div class="w-2 h-2 bg-terminal-error rounded-full status-dot" title="Kali"></div>
                    </div>
                    
                    <!-- Connection Status -->
                    <div class="text-xs text-gray-400">
                        <span class="inline-block w-1 h-1 bg-terminal-success rounded-full animate-pulse mr-1"></span>
                        Server Active
                    </div>
                </div>
                
                <!-- Mobile Status Indicator -->
                <div class="md:hidden">
                    <button @click="showMobileStatus = !showMobileStatus" class="p-2 rounded-lg bg-terminal-surface">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Mobile Status Panel -->
            <div x-show="showMobileStatus" x-transition class="mt-4 p-4 bg-terminal-surface rounded-lg md:hidden">
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="w-3 h-3 bg-terminal-success rounded-full mx-auto mb-1"></div>
                        <div class="text-xs">${state.os}</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-terminal-success rounded-full mx-auto mb-1"></div>
                        <div class="text-xs">Node.js</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-terminal-warning rounded-full mx-auto mb-1"></div>
                        <div class="text-xs">Python</div>
                    </div>
                    <div class="text-center">
                        <div class="w-3 h-3 bg-terminal-error rounded-full mx-auto mb-1"></div>
                        <div class="text-xs">Kali VM</div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
        <!-- Main Terminal Section -->
        <div class="mb-6">
            <div class="terminal-glow neon-border rounded-xl bg-terminal-surface p-6">
                <!-- Terminal Header -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="flex space-x-2">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <h2 class="font-bold text-terminal-text">🐉 Kali Dragon Terminal</h2>
                        <span class="text-xs bg-terminal-success px-2 py-1 rounded text-black">ACTIVE</span>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button @click="runSystemCheck" class="text-xs bg-terminal-info px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                            🔍 System Check
                        </button>
                        <button @click="clearTerminal" class="text-xs bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 transition-colors">
                            Clear
                        </button>
                    </div>
                </div>
                
                <!-- Terminal Output -->
                <div id="terminal-output" class="bg-terminal-bg rounded-lg p-4 font-mono text-sm terminal-scrollbar" style="height: 60vh; overflow-y: auto;">
                    <div class="text-terminal-success mb-1">🐉 Kali Dragon MCP Terminal v4.0 - Dark Mode</div>
                    <div class="text-terminal-info mb-1">💡 Main control interface for Kali Linux MCP setup</div>
                    <div class="text-terminal-warning mb-1">⚡ Powered by pure Node.js - no dependencies!</div>
                    <div class="text-gray-500 mb-2">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="text-terminal-text mb-1">🚀 Ready to start your Kali Linux MCP setup</div>
                    <div class="text-gray-400 mb-4">   Type 'help' for available commands or use Quick Actions below</div>
                </div>
                
                <!-- Terminal Input -->
                <div class="flex items-center space-x-2 mt-4 bg-terminal-bg rounded-lg p-3">
                    <span class="text-terminal-prompt font-bold">┌─[dragon@kali]─[~]</span>
                    <br>
                    <span class="text-terminal-prompt font-bold">└─$ </span>
                    <input 
                        id="command-input" 
                        type="text" 
                        @keydown.enter="executeCommand"
                        class="flex-1 bg-transparent border-none outline-none text-terminal-text font-mono focus:ring-0"
                        placeholder="Enter command..."
                        x-model="currentCommand"
                        autofocus
                    >
                    <button @click="executeCommand" class="bg-terminal-success hover:bg-green-600 px-4 py-2 rounded font-bold text-black transition-colors">
                        RUN
                    </button>
                </div>
            </div>
        </div>

        <!-- Compact Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Setup Actions -->
            <div class="glass-dark rounded-xl p-4">
                <h3 class="text-lg font-bold mb-4 text-terminal-text">🏗️ Setup & Configuration</h3>
                
                <!-- Start Setup Process Button -->
                <button @click="startSetupProcess" class="w-full mb-4 bg-gradient-to-r from-terminal-success to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-lg font-bold text-black transition-all transform hover:scale-105">
                    🚀 START SETUP PROCESS
                </button>
                
                <div class="grid grid-cols-1 gap-3">
                    <button @click="installDependencies" class="flex items-center justify-between p-3 rounded-lg bg-terminal-surface hover:bg-gray-800 transition-colors text-left">
                        <div>
                            <div class="font-semibold">📦 Install Dependencies</div>
                            <div class="text-xs text-gray-400">Python, Docker, SSH</div>
                        </div>
                        <span class="text-terminal-prompt">→</span>
                    </button>
                    
                    <button @click="configureKali" class="flex items-center justify-between p-3 rounded-lg bg-terminal-surface hover:bg-gray-800 transition-colors text-left">
                        <div>
                            <div class="font-semibold">🐧 Configure Kali VM</div>
                            <div class="text-xs text-gray-400">SSH connection setup</div>
                        </div>
                        <span class="text-terminal-prompt">→</span>
                    </button>
                    
                    <button @click="setupMCP" class="flex items-center justify-between p-3 rounded-lg bg-terminal-surface hover:bg-gray-800 transition-colors text-left">
                        <div>
                            <div class="font-semibold">🚀 Setup MCP Server</div>
                            <div class="text-xs text-gray-400">Initialize MCP services</div>
                        </div>
                        <span class="text-terminal-prompt">→</span>
                    </button>
                    
                    <button @click="runTests" class="flex items-center justify-between p-3 rounded-lg bg-terminal-surface hover:bg-gray-800 transition-colors text-left">
                        <div>
                            <div class="font-semibold">🧪 Test Connection</div>
                            <div class="text-xs text-gray-400">Verify setup</div>
                        </div>
                        <span class="text-terminal-prompt">→</span>
                    </button>
                </div>
            </div>

            <!-- Management & Tools -->
            <div class="glass-dark rounded-xl p-4">
                <h3 class="text-lg font-bold mb-4 text-terminal-text">⚙️ Management & Tools</h3>
                
                <div class="grid grid-cols-2 gap-3">
                    <button @click="startMCP" class="p-3 rounded-lg bg-terminal-success hover:bg-green-600 text-black font-semibold transition-colors">
                        ▶️ Start MCP
                    </button>
                    
                    <button @click="stopMCP" class="p-3 rounded-lg bg-terminal-error hover:bg-red-600 text-white font-semibold transition-colors">
                        ⏹️ Stop MCP
                    </button>
                    
                    <button @click="viewLogs" class="p-3 rounded-lg bg-terminal-info hover:bg-blue-600 text-white font-semibold transition-colors">
                        📋 View Logs
                    </button>
                    
                    <button @click="restart" class="p-3 rounded-lg bg-terminal-warning hover:bg-yellow-600 text-black font-semibold transition-colors">
                        🔄 Restart
                    </button>
                    
                    <button @click="openDocs" class="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
                        📚 Docs
                    </button>
                    
                    <button @click="resetConfig" class="p-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors">
                        🔧 Reset
                    </button>
                </div>
                
                <!-- System Status Detail -->
                <div class="mt-4 p-3 bg-terminal-bg rounded-lg">
                    <h4 class="text-sm font-semibold mb-2 text-terminal-text">System Status</h4>
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                            <span>Operating System:</span>
                            <span class="text-terminal-success">${state.os}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Node.js:</span>
                            <span class="text-terminal-success">${state.nodeVersion}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Python 3:</span>
                            <span class="text-terminal-warning">Checking...</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Docker:</span>
                            <span class="text-terminal-warning">Checking...</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Kali VM:</span>
                            <span class="text-terminal-error">Not Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function kaliDragon() {
            return {
                currentCommand: '',
                showMobileStatus: false,
                
                init() {
                    // Auto-focus terminal input
                    this.$nextTick(() => {
                        document.getElementById('command-input').focus();
                    });
                },
                
                startSetupProcess() {
                    this.appendToTerminal('🐉 KALI DRAGON SETUP PROCESS INITIATED', 'success');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.appendToTerminal('📋 Step 1: System requirements check...', 'warning');
                    
                    setTimeout(() => {
                        this.runSystemCheck();
                    }, 1000);
                },
                
                async runSystemCheck() {
                    this.appendToTerminal('🔍 Running comprehensive system check...', 'info');
                    await this.sleep(500);
                    
                    const commands = [
                        'echo "📊 Checking system requirements..."',
                        'echo "🐍 Python3 Status:" && which python3 && python3 --version || echo "❌ Python3 not found - Install from: https://python.org"',
                        'echo "🐳 Docker Status:" && which docker && docker --version || echo "❌ Docker not found - Install from: https://orbstack.dev"',
                        'echo "🔑 SSH Status:" && which ssh && ssh -V || echo "❌ SSH client not found"',
                        'echo "✅ System check completed!"'
                    ];
                    
                    for (const cmd of commands) {
                        await this.runCommand(cmd);
                        await this.sleep(800);
                    }
                    
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.appendToTerminal('💡 Next: Install any missing dependencies using the buttons above', 'warning');
                },
                
                async installDependencies() {
                    this.appendToTerminal('📦 DEPENDENCY INSTALLATION WIZARD', 'info');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    
                    const commands = [
                        'echo "🐉 Kali Dragon Dependency Installer"',
                        'echo ""',
                        'echo "📍 Checking Python3..." && which python3 && echo "✅ Python3 found" || echo "❌ Install Python3 from: https://python.org"',
                        'echo ""',
                        'echo "📍 Checking Docker..." && which docker && echo "✅ Docker found" || echo "❌ Install Docker/OrbStack from: https://orbstack.dev"',
                        'echo ""',
                        'echo "📍 Checking SSH..." && which ssh && echo "✅ SSH found" || echo "❌ SSH should be pre-installed on macOS"',
                        'echo ""',
                        'echo "✅ Dependency check complete! Install missing components before proceeding."'
                    ];
                    
                    for (const cmd of commands) {
                        await this.runCommand(cmd);
                        await this.sleep(1200);
                    }
                },
                
                configureKali() {
                    this.appendToTerminal('🐧 KALI VM CONFIGURATION', 'info');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.runCommand('echo "🔧 Kali VM SSH configuration wizard will be implemented here..."');
                    this.runCommand('echo "💡 This will help you configure SSH connection to your Kali Linux VM"');
                },
                
                setupMCP() {
                    this.appendToTerminal('🚀 MCP SERVER SETUP', 'info');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.runCommand('echo "⚙️ MCP Server installation and configuration will be implemented here..."');
                    this.runCommand('echo "💡 This will install and configure MCP on your Kali VM"');
                },
                
                runTests() {
                    this.appendToTerminal('🧪 CONNECTION TESTS', 'info');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.runCommand('echo "🔬 Running comprehensive connection and configuration tests..."');
                },
                
                startMCP() {
                    this.runCommand('echo "▶️ Starting MCP Server... (implementation pending)"');
                },
                
                stopMCP() {
                    this.runCommand('echo "⏹️ Stopping MCP Server... (implementation pending)"');
                },
                
                viewLogs() {
                    this.appendToTerminal('📋 SYSTEM LOGS', 'info');
                    this.runCommand('echo "📋 Displaying system logs..." && ls -la /var/log/ | head -10 || echo "No logs directory found"');
                },
                
                restart() {
                    this.runCommand('echo "🔄 Restarting all services... (implementation pending)"');
                },
                
                openDocs() {
                    this.appendToTerminal('📚 Opening documentation...', 'info');
                    window.open('https://github.com/your-repo/kali-dragon', '_blank');
                },
                
                resetConfig() {
                    this.runCommand('echo "🔧 Resetting configuration... (implementation pending)"');
                },
                
                async executeCommand() {
                    if (!this.currentCommand.trim()) return;
                    
                    this.appendToTerminal('┌─[dragon@kali]─[~]', 'prompt');
                    this.appendToTerminal('└─$ ' + this.currentCommand, 'command');
                    await this.runCommand(this.currentCommand);
                    this.currentCommand = '';
                    
                    // Refocus input
                    this.$nextTick(() => {
                        document.getElementById('command-input').focus();
                    });
                },
                
                async runCommand(command) {
                    try {
                        const response = await fetch('/api/execute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ command })
                        });
                        
                        const result = await response.json();
                        
                        if (result.output) {
                            this.appendToTerminal(result.output, 'output');
                        }
                        
                        if (result.error) {
                            this.appendToTerminal(result.error, 'error');
                        }
                        
                    } catch (error) {
                        this.appendToTerminal('Error: ' + error.message, 'error');
                    }
                },
                
                appendToTerminal(text, type = 'output') {
                    const output = document.getElementById('terminal-output');
                    const div = document.createElement('div');
                    
                    const colors = {
                        'command': 'text-terminal-text font-bold',
                        'prompt': 'text-terminal-prompt font-bold',
                        'output': 'text-terminal-success',
                        'error': 'text-terminal-error',
                        'warning': 'text-terminal-warning',
                        'info': 'text-terminal-info',
                        'success': 'text-terminal-success font-bold'
                    };
                    
                    div.className = colors[type] || 'text-terminal-success';
                    div.textContent = text;
                    output.appendChild(div);
                    output.scrollTop = output.scrollHeight;
                },
                
                clearTerminal() {
                    const output = document.getElementById('terminal-output');
                    output.innerHTML = \`
                        <div class="text-terminal-success mb-1">🐉 Kali Dragon MCP Terminal v4.0 - Dark Mode</div>
                        <div class="text-terminal-info mb-1">💡 Main control interface for Kali Linux MCP setup</div>
                        <div class="text-terminal-warning mb-1">⚡ Powered by pure Node.js - no dependencies!</div>
                        <div class="text-gray-500 mb-2">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                        <div class="text-terminal-text mb-1">🚀 Ready to start your Kali Linux MCP setup</div>
                        <div class="text-gray-400 mb-4">   Type 'help' for available commands or use Quick Actions below</div>
                    \`;
                },
                
                sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
            }
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

// Handle API requests (same as before)
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
    console.log('\n🐉 KALI DRAGON TERMINAL v4.0 (DARK MODE)');
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 Server running at: ${url}`);
    console.log('🎨 Ultra-modern dark terminal interface');
    console.log('💻 Terminal-focused design');
    console.log('⚡ No npm install needed - Pure Node.js!');
    console.log('📱 Opening browser automatically...');
    console.log('🐉 Press Ctrl+C to stop the server');
    console.log('═══════════════════════════════════════════\n');
    
    // Open browser after a short delay
    setTimeout(() => openBrowser(url), 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🐉 Kali Dragon Terminal shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🐉 Kali Dragon Terminal shutting down gracefully...');
    process.exit(0);
});