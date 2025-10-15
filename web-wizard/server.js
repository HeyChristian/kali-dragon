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

// Serve the main HTML page with Apple-style modern UI
function serveHTML(res) {
    const state = checkSystemState();
    
    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon Setup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        apple: {
                            bg: '#000000',
                            surface: '#1c1c1e',
                            card: '#2c2c2e', 
                            accent: '#007aff',
                            success: '#34c759',
                            warning: '#ff9500',
                            error: '#ff3b30',
                            text: '#ffffff',
                            secondary: '#98989a'
                        }
                    },
                    fontFamily: {
                        'system': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'Arial', 'sans-serif'],
                        'mono': ['SF Mono', 'Monaco', 'Menlo', 'Consolas', 'monospace']
                    },
                    borderRadius: {
                        'apple': '12px',
                        'apple-lg': '16px'
                    }
                }
            }
        }
    </script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .glass-effect {
            background: rgba(28, 28, 30, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .progress-bar {
            transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .step-card {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .step-card:hover {
            transform: translateY(-2px);
        }
        
        .terminal-window {
            background: #1e1e1e;
            border: 1px solid #333;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }
        
        .terminal-header {
            background: linear-gradient(to bottom, #404040, #2a2a2a);
            border-bottom: 1px solid #333;
        }
        
        .traffic-light {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .red { background: #ff5f57; }
        .yellow { background: #ffbd2e; }
        .green { background: #28ca42; }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-in {
            animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .pulse-glow {
            animation: pulseGlow 2s infinite;
        }
        
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 122, 255, 0.3); }
            50% { box-shadow: 0 0 30px rgba(0, 122, 255, 0.5); }
        }
        
        .scrollbar-hidden::-webkit-scrollbar {
            display: none;
        }
        
        .scrollbar-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>

<body class="bg-apple-bg text-apple-text min-h-screen font-system" x-data="kaliDragon()">
    <!-- Modern Header -->
    <header class="glass-effect sticky top-0 z-50 border-b border-gray-700">
        <div class="max-w-6xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="text-3xl">🐉</div>
                    <div>
                        <h1 class="text-2xl font-semibold text-apple-text">Kali Dragon</h1>
                        <p class="text-apple-secondary text-sm">Automated MCP Setup Assistant</p>
                    </div>
                </div>
                
                <!-- Progress Overview -->
                <div class="hidden md:flex items-center space-x-6">
                    <div class="text-right">
                        <div class="text-sm font-medium" x-text="`Step ${currentStep} of ${totalSteps}`"></div>
                        <div class="text-xs text-apple-secondary" x-text="steps[currentStep - 1]?.title || 'Getting Started'"></div>
                    </div>
                    <div class="w-24 bg-gray-700 rounded-full h-2">
                        <div class="bg-apple-accent h-2 rounded-full progress-bar" :style="`width: ${(currentStep / totalSteps) * 100}%`"></div>
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
                    this.showDocumentationMenu();
                },
                
                showDocumentationMenu() {
                    const docs = [
                        { name: 'Quick Start Guide', file: 'QUICK_START.md', desc: 'Get up and running in minutes' },
                        { name: 'Kali VM Setup', file: 'KALI_VM_SETUP.md', desc: 'Complete Kali Linux VM configuration' },
                        { name: 'MCP Server Setup', file: 'MCP_SERVER_SETUP.md', desc: 'Install and configure MCP server' },
                        { name: 'Troubleshooting Guide', file: 'TROUBLESHOOTING.md', desc: 'Solve common issues' },
                        { name: 'Documentation Index', file: 'README.md', desc: 'Complete documentation index' }
                    ];
                    
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    this.appendToTerminal('📚 AVAILABLE DOCUMENTATION', 'info');
                    this.appendToTerminal('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
                    
                    docs.forEach((doc, index) => {
                        this.appendToTerminal((index + 1) + '. ' + doc.name + ' - ' + doc.desc, 'output');
                    });
                    
                    this.appendToTerminal('', 'output');
                    this.appendToTerminal('💡 Click any document name to open, or type: docs <number>', 'warning');
                    this.appendToTerminal('   Example: docs 1  (opens Quick Start Guide)', 'warning');
                    this.appendToTerminal('', 'output');
                    
                    // Add clickable links in terminal
                    docs.forEach((doc, index) => {
                        const link = document.createElement('div');
                        link.className = 'text-terminal-success cursor-pointer hover:text-green-300 transition-colors';
                        link.textContent = '🔗 ' + doc.name + ' - Click to open';
                        link.onclick = () => this.openDocumentation(doc.file);
                        document.getElementById('terminal-output').appendChild(link);
                    });
                    
                    document.getElementById('terminal-output').scrollTop = document.getElementById('terminal-output').scrollHeight;
                },
                
                openDocumentation(filename) {
                    this.appendToTerminal('📖 Opening ' + filename + '...', 'info');
                    window.open('/api/docs/' + filename, '_blank');
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
                    output.innerHTML = [
                        '<div class="text-terminal-success mb-1">🐉 Kali Dragon MCP Terminal v4.0 - Dark Mode</div>',
                        '<div class="text-terminal-info mb-1">💡 Main control interface for Kali Linux MCP setup</div>',
                        '<div class="text-terminal-warning mb-1">⚡ Powered by pure Node.js - no dependencies!</div>',
                        '<div class="text-gray-500 mb-2">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>',
                        '<div class="text-terminal-text mb-1">🚀 Ready to start your Kali Linux MCP setup</div>',
                        '<div class="text-gray-400 mb-4">   Type \'help\' for available commands or use Quick Actions below</div>'
                    ].join('\n');
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

// Serve documentation files
function serveDocumentation(res, docPath) {
    const fs = require('fs');
    const path = require('path');
    
    // Security: prevent directory traversal
    const safePath = path.join(__dirname, '..', 'docs', path.basename(docPath));
    
    try {
        const content = fs.readFileSync(safePath, 'utf8');
        
        // Create HTML page to display markdown - using string concatenation to avoid template literal issues
        const htmlContent = '<!DOCTYPE html>' +
        '<html lang="en" class="dark">' +
        '<head>' +
        '    <meta charset="UTF-8">' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '    <title>📚 Kali Dragon Documentation</title>' +
        '    <script src="https://cdn.tailwindcss.com"></script>' +
        '    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>' +
        '    <style>' +
        '        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }' +
        '        .glass-dark { background: rgba(17, 17, 17, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }' +
        '        .markdown-content { line-height: 1.6; color: #ffffff; }' +
        '        .markdown-content h1 { font-size: 2.5rem; margin: 1.5rem 0; color: #00ff41; font-weight: bold; }' +
        '        .markdown-content h2 { font-size: 2rem; margin: 1.5rem 0; color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 0.5rem; }' +
        '        .markdown-content h3 { font-size: 1.5rem; margin: 1rem 0; color: #81C784; font-weight: 600; }' +
        '        .markdown-content h4 { font-size: 1.25rem; margin: 1rem 0; color: #A5D6A7; font-weight: 600; }' +
        '        .markdown-content p { margin: 1rem 0; }' +
        '        .markdown-content code { background: rgba(0,255,65,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; color: #00ff41; font-family: "JetBrains Mono", monospace; }' +
        '        .markdown-content pre { background: #1e1e1e; padding: 1.5rem; border-radius: 8px; overflow-x: auto; margin: 1.5rem 0; border: 1px solid #333; }' +
        '        .markdown-content pre code { background: transparent; color: #00ff41; }' +
        '        .markdown-content a { color: #4CAF50; text-decoration: underline; transition: color 0.3s; }' +
        '        .markdown-content a:hover { color: #66BB6A; }' +
        '        .markdown-content ul, .markdown-content ol { margin: 1rem 0; padding-left: 2rem; }' +
        '        .markdown-content li { margin: 0.5rem 0; }' +
        '        .markdown-content blockquote { border-left: 4px solid #4CAF50; margin: 1rem 0; padding-left: 1rem; font-style: italic; background: rgba(76, 175, 80, 0.1); border-radius: 4px; padding: 1rem; }' +
        '        .markdown-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }' +
        '        .markdown-content th, .markdown-content td { border: 1px solid #333; padding: 0.75rem; text-align: left; }' +
        '        .markdown-content th { background: rgba(76, 175, 80, 0.2); font-weight: 600; }' +
        '        .markdown-content strong { color: #00ff41; font-weight: 600; }' +
        '        .markdown-content em { color: #81C784; font-style: italic; }' +
        '    </style>' +
        '</head>' +
        '<body class="gradient-bg min-h-screen text-white font-mono">' +
        '    <div class="max-w-5xl mx-auto px-4 py-8">' +
        '        <div class="glass-dark rounded-xl p-8">' +
        '            <div class="flex items-center justify-between mb-6">' +
        '                <div class="flex items-center space-x-3">' +
        '                    <div class="text-2xl">📚</div>' +
        '                    <h1 class="text-2xl font-bold text-terminal-text">Kali Dragon Documentation</h1>' +
        '                </div>' +
        '                <div class="flex space-x-2">' +
        '                    <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">' +
        '                        🖨️ Print' +
        '                    </button>' +
        '                    <button onclick="window.close()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors">' +
        '                        ← Back' +
        '                    </button>' +
        '                </div>' +
        '            </div>' +
        '            <div id="markdown-content" class="markdown-content"></div>' +
        '        </div>' +
        '    </div>' +
        '    <script>' +
        '        // Convert markdown to HTML' +
        '        const markdownContent = ' + JSON.stringify(content) + ';' +
        '        document.getElementById("markdown-content").innerHTML = marked.parse(markdownContent);' +
        '        ' +
        '        // Open external links in new tab' +
        '        document.querySelectorAll("#markdown-content a[href^=\"http\"]").forEach(link => {' +
        '            link.target = "_blank";' +
        '            link.rel = "noopener noreferrer";' +
        '        });' +
        '        ' +
        '        // Handle internal documentation links' +
        '        document.querySelectorAll("#markdown-content a[href$=\".md\"]").forEach(link => {' +
        '            const href = link.getAttribute("href");' +
        '            if (!href.startsWith("http")) {' +
        '                link.onclick = (e) => {' +
        '                    e.preventDefault();' +
        '                    window.open("/api/docs/" + href, "_blank");' +
        '                };' +
        '            }' +
        '        });' +
        '        ' +
        '        // Add syntax highlighting for code blocks' +
        '        document.querySelectorAll("pre code").forEach(block => {' +
        '            block.style.fontSize = "14px";' +
        '            block.style.lineHeight = "1.4";' +
        '        });' +
        '    </script>' +
        '</body>' +
        '</html>';
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    } catch (error) {
        // Return 404 with styled error page
        const errorHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Not Found</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>.gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }</style>
</head>
<body class="gradient-bg min-h-screen text-white font-mono flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">😵 404</h1>
        <p class="text-xl mb-4">Documentation not found</p>
        <button onclick="window.close()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            ← Back to Kali Dragon
        </button>
    </div>
</body>
</html>`;
        
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
    }
}

// Handle API requests
function handleAPI(req, res, pathname) {
    if (pathname.startsWith('/api/docs/')) {
        const docName = pathname.replace('/api/docs/', '');
        serveDocumentation(res, docName);
    } else if (pathname === '/api/execute' && req.method === 'POST') {
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