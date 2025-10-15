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

// Serve the main HTML page with modern Tailwind UI
function serveHTML(res) {
    const state = checkSystemState();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon Web Wizard</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js for interactivity -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- Icons from Heroicons -->
    <script src="https://unpkg.com/heroicons@2.0.16/24/outline/index.js" type="module"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'dragon': {
                            50: '#f0f4ff',
                            500: '#667eea',
                            600: '#5a67d8',
                            700: '#4c51bf',
                            900: '#2d3748'
                        }
                    },
                    fontFamily: {
                        'mono': ['JetBrains Mono', 'Fira Code', 'monospace']
                    }
                }
            }
        }
    </script>
    
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); }
        .terminal-glow { box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); }
    </style>
</head>

<body class="gradient-bg min-h-screen text-white" x-data="kaliDragon()">
    <!-- Navigation -->
    <nav class="glass border-b border-white/20 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-4">
                    <div class="text-2xl animate-pulse">🐉</div>
                    <h1 class="text-xl font-bold">Kali Dragon</h1>
                    <span class="text-sm bg-white/20 px-2 py-1 rounded-full">v4.0</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2 text-sm">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Server Active</span>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome & Status Section -->
        <div class="glass rounded-2xl p-8 mb-8">
            <div class="text-center mb-8">
                <h2 class="text-4xl font-bold mb-4">Welcome to Kali Dragon Setup</h2>
                <p class="text-lg text-white/80 mb-6">Your ultimate Kali Linux MCP management interface</p>
                
                <!-- Progress Steps -->
                <div class="flex justify-center items-center space-x-4 mb-8">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <span class="ml-2 text-sm">Check System</span>
                    </div>
                    <div class="w-8 h-px bg-white/30"></div>
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <span class="ml-2 text-sm">Install Dependencies</span>
                    </div>
                    <div class="w-8 h-px bg-white/30"></div>
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <span class="ml-2 text-sm">Configure Kali</span>
                    </div>
                    <div class="w-8 h-px bg-white/30"></div>
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <span class="ml-2 text-sm">Start MCP</span>
                    </div>
                </div>

                <!-- Start Button -->
                <button @click="startSetup" class="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg">
                    🚀 Start Setup Process
                </button>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- System Status -->
            <div class="lg:col-span-1">
                <div class="glass rounded-xl p-6">
                    <h3 class="text-xl font-bold mb-6 flex items-center">
                        <div class="w-6 h-6 mr-2">📊</div>
                        System Status
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Operating System
                            </span>
                            <span class="text-sm font-mono bg-green-500/20 text-green-300 px-2 py-1 rounded">${state.os}</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                Node.js
                            </span>
                            <span class="text-sm font-mono bg-green-500/20 text-green-300 px-2 py-1 rounded">${state.nodeVersion}</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                Python 3
                            </span>
                            <span class="text-sm font-mono bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Check Required</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                Docker
                            </span>
                            <span class="text-sm font-mono bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Check Required</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                SSH Client
                            </span>
                            <span class="text-sm font-mono bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Check Required</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span class="flex items-center">
                                <span class="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                                Kali Connection
                            </span>
                            <span class="text-sm font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded">Not Connected</span>
                        </div>
                    </div>
                    
                    <button @click="runSystemCheck" class="w-full mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        🔍 Run System Check
                    </button>
                </div>
            </div>

            <!-- Actions Panel -->
            <div class="lg:col-span-2">
                <div class="glass rounded-xl p-6">
                    <h3 class="text-xl font-bold mb-6">Quick Actions</h3>
                    
                    <!-- Category Tabs -->
                    <div class="flex space-x-1 mb-6 bg-white/10 p-1 rounded-lg">
                        <button 
                            @click="activeCategory = 'setup'" 
                            :class="activeCategory === 'setup' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'"
                            class="flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium"
                        >
                            🏗️ Setup
                        </button>
                        <button 
                            @click="activeCategory = 'manage'" 
                            :class="activeCategory === 'manage' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'"
                            class="flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium"
                        >
                            ⚙️ Manage
                        </button>
                        <button 
                            @click="activeCategory = 'tools'" 
                            :class="activeCategory === 'tools' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'"
                            class="flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium"
                        >
                            🛠️ Tools
                        </button>
                    </div>

                    <!-- Setup Actions -->
                    <div x-show="activeCategory === 'setup'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="installDependencies">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">📦 Install Dependencies</h4>
                                    <p class="text-sm text-white/80 mt-1">Check and install Python, Docker, SSH</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="configureKali">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">🐧 Configure Kali VM</h4>
                                    <p class="text-sm text-white/80 mt-1">Setup connection to Kali Linux</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="setupMCP">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">🚀 Setup MCP Server</h4>
                                    <p class="text-sm text-white/80 mt-1">Initialize MCP on Kali Linux</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="runTests">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">🧪 Test Connection</h4>
                                    <p class="text-sm text-white/80 mt-1">Verify everything works</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Management Actions -->
                    <div x-show="activeCategory === 'manage'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="startMCP">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">▶️ Start MCP Server</h4>
                                    <p class="text-sm text-white/80 mt-1">Launch MCP services</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="stopMCP">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">⏹️ Stop MCP Server</h4>
                                    <p class="text-sm text-white/80 mt-1">Shutdown MCP services</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="viewLogs">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">📋 View Logs</h4>
                                    <p class="text-sm text-white/80 mt-1">Check system logs</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="restart">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">🔄 Restart Services</h4>
                                    <p class="text-sm text-white/80 mt-1">Restart all components</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Tools Actions -->
                    <div x-show="activeCategory === 'tools'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="openDocs">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">📚 Documentation</h4>
                                    <p class="text-sm text-white/80 mt-1">Setup guides and tutorials</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-pink-600 to-pink-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="exportConfig">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">💾 Export Config</h4>
                                    <p class="text-sm text-white/80 mt-1">Save current configuration</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="importConfig">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">📥 Import Config</h4>
                                    <p class="text-sm text-white/80 mt-1">Load saved configuration</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer" @click="resetConfig">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold">🔧 Reset Setup</h4>
                                    <p class="text-sm text-white/80 mt-1">Start fresh configuration</p>
                                </div>
                                <div class="text-2xl">→</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Terminal Always Visible -->
        <div class="glass rounded-xl p-6 mt-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold flex items-center">
                    <div class="w-6 h-6 mr-2">💻</div>
                    Kali Dragon Terminal
                </h3>
                <div class="flex items-center space-x-2">
                    <button @click="clearTerminal" class="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm">Clear</button>
                    <div class="flex items-center space-x-2 text-sm">
                        <div class="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></div>
                        <span>Ready</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-terminal-bg rounded-lg p-4 terminal-glow">
                <div id="terminal-output" class="font-mono text-sm text-terminal-green min-h-64 max-h-96 overflow-y-auto mb-4">
                    <div class="text-terminal-green">🐉 Kali Dragon Terminal v4.0 Ready</div>
                    <div class="text-blue-400">💡 Use the action buttons above or type commands below</div>
                    <div class="text-yellow-400">⚡ Powered by pure Node.js - no npm dependencies!</div>
                    <div class="text-white">─────────────────────────────────────────────</div>
                </div>
                
                <div class="flex items-center space-x-2">
                    <span class="text-terminal-green font-mono text-sm">$</span>
                    <input 
                        id="command-input" 
                        type="text" 
                        @keydown.enter="executeCommand"
                        class="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm"
                        placeholder="Enter command..."
                        x-model="currentCommand"
                    >
                    <button @click="executeCommand" class="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-medium">
                        Execute
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function kaliDragon() {
            return {
                activeCategory: 'setup',
                currentCommand: '',
                
                startSetup() {
                    this.appendToTerminal('🐉 Starting Kali Dragon setup process...', 'info');
                    this.appendToTerminal('📋 Step 1: Run system check first', 'warning');
                    this.runSystemCheck();
                },
                
                async runSystemCheck() {
                    this.appendToTerminal('🔍 Running comprehensive system check...', 'info');
                    await this.runCommand('echo "📊 Checking system requirements..."');
                    await this.sleep(500);
                    await this.runCommand('echo "🐍 Checking Python3..." && which python3 && python3 --version || echo "❌ Python3 not found"');
                    await this.sleep(500);
                    await this.runCommand('echo "🐳 Checking Docker..." && which docker && docker --version || echo "❌ Docker not found"');
                    await this.sleep(500);
                    await this.runCommand('echo "🔑 Checking SSH..." && which ssh && ssh -V || echo "❌ SSH client not found"');
                    await this.sleep(500);
                    this.appendToTerminal('✅ System check completed. Review results above.', 'success');
                },
                
                async installDependencies() {
                    this.appendToTerminal('📦 Installing required dependencies...', 'info');
                    const commands = [
                        'echo "🐉 Kali Dragon Dependency Installer"',
                        'echo "📍 Checking Python3..." && which python3 || echo "❌ Install Python3 from: https://python.org"',
                        'echo "📍 Checking Docker..." && which docker || echo "❌ Install Docker/OrbStack from: https://orbstack.dev"',
                        'echo "📍 Checking SSH..." && which ssh || echo "❌ SSH should be pre-installed on macOS"',
                        'echo "✅ Dependency check complete! Install missing components before proceeding."'
                    ];
                    
                    for (const cmd of commands) {
                        await this.runCommand(cmd);
                        await this.sleep(1000);
                    }
                },
                
                configureKali() {
                    this.appendToTerminal('🐧 Kali VM configuration wizard will be implemented here...', 'info');
                    this.runCommand('echo "🔧 This will help you configure SSH connection to Kali Linux VM"');
                },
                
                setupMCP() {
                    this.appendToTerminal('🚀 MCP Server setup will be implemented here...', 'info');
                    this.runCommand('echo "⚙️ This will install and configure MCP on your Kali VM"');
                },
                
                runTests() {
                    this.appendToTerminal('🧪 Running connection tests...', 'info');
                    this.runCommand('echo "🔬 Testing all connections and configurations"');
                },
                
                startMCP() {
                    this.runCommand('echo "▶️ Starting MCP Server... (will be implemented)"');
                },
                
                stopMCP() {
                    this.runCommand('echo "⏹️ Stopping MCP Server... (will be implemented)"');
                },
                
                viewLogs() {
                    this.runCommand('echo "📋 Displaying system logs..." && ls -la /var/log/ | head -10 || echo "No logs found"');
                },
                
                restart() {
                    this.runCommand('echo "🔄 Restarting services... (will be implemented)"');
                },
                
                openDocs() {
                    window.open('https://github.com/your-repo/kali-dragon', '_blank');
                },
                
                exportConfig() {
                    this.runCommand('echo "💾 Exporting configuration... (will be implemented)"');
                },
                
                importConfig() {
                    this.runCommand('echo "📥 Importing configuration... (will be implemented)"');
                },
                
                resetConfig() {
                    this.runCommand('echo "🔧 Resetting configuration... (will be implemented)"');
                },
                
                async executeCommand() {
                    if (!this.currentCommand.trim()) return;
                    
                    this.appendToTerminal('$ ' + this.currentCommand, 'command');
                    await this.runCommand(this.currentCommand);
                    this.currentCommand = '';
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
                        'command': 'text-blue-400',
                        'output': 'text-terminal-green',
                        'error': 'text-red-400',
                        'warning': 'text-yellow-400',
                        'info': 'text-blue-300',
                        'success': 'text-green-400'
                    };
                    
                    div.className = colors[type] || 'text-terminal-green';
                    div.textContent = text;
                    output.appendChild(div);
                    output.scrollTop = output.scrollHeight;
                },
                
                clearTerminal() {
                    const output = document.getElementById('terminal-output');
                    output.innerHTML = \`
                        <div class="text-terminal-green">🐉 Kali Dragon Terminal v4.0 Ready</div>
                        <div class="text-blue-400">💡 Use the action buttons above or type commands below</div>
                        <div class="text-yellow-400">⚡ Powered by pure Node.js - no npm dependencies!</div>
                        <div class="text-white">─────────────────────────────────────────────</div>
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
    console.log('\n🐉 KALI DRAGON WEB WIZARD v4.0 (MODERN UI)');
    console.log('════════════════════════════════════════');
    console.log(`🚀 Server running at: ${url}`);
    console.log('🎨 Modern UI with Tailwind CSS');
    console.log('⚡ No npm install needed - Pure Node.js!');
    console.log('📱 Opening browser automatically...');
    console.log('🐉 Press Ctrl+C to stop the server');
    console.log('════════════════════════════════════════\n');
    
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