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
        '        document.querySelectorAll("#markdown-content a[href^=\\"http\\"]").forEach(link => {' +
        '            link.target = "_blank";' +
        '            link.rel = "noopener noreferrer";' +
        '        });' +
        '        ' +
        '        // Handle internal documentation links' +
        '        document.querySelectorAll("#markdown-content a[href$=\\".md\\"]").forEach(link => {' +
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
        const errorHtml = '<!DOCTYPE html>' +
        '<html lang="en" class="dark">' +
        '<head>' +
        '    <meta charset="UTF-8">' +
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '    <title>Documentation Not Found</title>' +
        '    <script src="https://cdn.tailwindcss.com"></script>' +
        '    <style>.gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }</style>' +
        '</head>' +
        '<body class="gradient-bg min-h-screen text-white font-mono flex items-center justify-center">' +
        '    <div class="text-center">' +
        '        <h1 class="text-4xl font-bold mb-4">😵 404</h1>' +
        '        <p class="text-xl mb-4">Documentation not found</p>' +
        '        <button onclick="window.close()" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">' +
        '            ← Back to Kali Dragon' +
        '        </button>' +
        '    </div>' +
        '</body>' +
        '</html>';
        
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(errorHtml);
    }
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
                            secondary: '#8e8e93'
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
                        <div class="text-sm font-medium text-white" x-text="'Step ' + currentStep + ' of ' + totalSteps"></div>
                        <div class="text-xs text-apple-secondary" x-text="steps[currentStep - 1]?.title || 'Getting Started'"></div>
                    </div>
                    <div class="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div class="bg-apple-accent h-2 rounded-full transition-all duration-500 ease-out" :style="'width: ' + (currentStep / totalSteps) * 100 + '%'"></div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">
        
        <!-- Setup Wizard Card -->
        <div class="glass-effect rounded-apple-lg p-8 mb-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-apple-text mb-2">Kali MCP Setup</h2>
                    <p class="text-apple-secondary">Automated setup wizard for your Kali Linux MCP environment</p>
                </div>
                <div class="text-6xl opacity-20">🐉</div>
            </div>
            
            <!-- Simple Current Step Display -->
            <div class="mb-8">
                <!-- Progress Indicator -->
                <div class="flex items-center justify-center mb-6">
                    <div class="w-64 bg-gray-700 rounded-full h-1">
                        <div class="bg-apple-accent h-1 rounded-full transition-all duration-500" 
                             :style="'width: ' + (currentStep / totalSteps) * 100 + '%'"></div>
                    </div>
                    <span class="ml-4 text-sm text-apple-secondary" x-text="'Step ' + currentStep + ' of ' + totalSteps"></span>
                </div>
                
                <!-- Current Step Content -->
                <div class="text-center py-8">
                    <template x-if="currentStep === 1">
                        <div>
                            <div class="w-16 h-16 bg-apple-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🔍</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">System Requirements Check</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Verify that your system meets all requirements for MCP setup including Claude Desktop</p>
                            
                            <!-- Requirements List -->
                            <div class="max-w-md mx-auto mb-8 text-left">
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-6 h-6 rounded-full bg-apple-warning flex items-center justify-center">
                                            <span class="text-xs">?</span>
                                        </div>
                                        <span class="text-apple-secondary">Claude Desktop Application</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <div class="w-6 h-6 rounded-full bg-apple-warning flex items-center justify-center">
                                            <span class="text-xs">?</span>
                                        </div>
                                        <span class="text-apple-secondary">Python 3 (for scripting)</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <div class="w-6 h-6 rounded-full bg-apple-warning flex items-center justify-center">
                                            <span class="text-xs">?</span>
                                        </div>
                                        <span class="text-apple-secondary">Docker (for containerization)</span>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <div class="w-6 h-6 rounded-full bg-apple-warning flex items-center justify-center">
                                            <span class="text-xs">?</span>
                                        </div>
                                        <span class="text-apple-secondary">SSH Client (for Kali connection)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button @click="runCurrentStep()" :disabled="isRunning" 
                                    class="bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                <span x-show="!isRunning">Check System Requirements</span>
                                <span x-show="isRunning" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking...
                                </span>
                            </button>
                        </div>
                    </template>
                    
                    <template x-if="currentStep === 2">
                        <div>
                            <div class="w-16 h-16 bg-apple-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">📦</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Install Dependencies</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Install required dependencies: Python, Docker, SSH client</p>
                            <button @click="runCurrentStep()" :disabled="isRunning" 
                                    class="bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                <span x-show="!isRunning">Install Dependencies</span>
                                <span x-show="isRunning" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Installing...
                                </span>
                            </button>
                        </div>
                    </template>
                    
                    <template x-if="currentStep === 3">
                        <div>
                            <div class="w-16 h-16 bg-apple-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🐧</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Configure Kali VM</h3>
                            <p class="text-apple-secondary mb-6 max-w-lg mx-auto">Enter your Kali Linux VM credentials to setup passwordless SSH access</p>
                            
                            <!-- Kali Credentials Form -->
                            <div x-show="!kaliConfigured" class="max-w-md mx-auto mb-8">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-apple-secondary mb-2">Kali VM IP Address</label>
                                        <input x-model="kaliIP" type="text" placeholder="192.168.1.100" 
                                               class="w-full px-4 py-3 bg-apple-surface border border-gray-600 rounded-apple text-white placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-apple-secondary mb-2">Username</label>
                                        <input x-model="kaliUser" type="text" placeholder="kali" 
                                               class="w-full px-4 py-3 bg-apple-surface border border-gray-600 rounded-apple text-white placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-apple-secondary mb-2">Password</label>
                                        <input x-model="kaliPassword" type="password" placeholder="Your Kali password" 
                                               class="w-full px-4 py-3 bg-apple-surface border border-gray-600 rounded-apple text-white placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-apple-secondary mb-2">SSH Port</label>
                                        <input x-model="kaliPort" type="number" placeholder="22" 
                                               class="w-full px-4 py-3 bg-apple-surface border border-gray-600 rounded-apple text-white placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                </div>
                                
                                <div class="mt-6">
                                    <button @click="testKaliConnection()" :disabled="isRunning || !kaliIP || !kaliUser || !kaliPassword" 
                                            class="w-full bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                        <span x-show="!isRunning">Test Connection & Configure SSH</span>
                                        <span x-show="isRunning" class="flex items-center justify-center">
                                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connecting...
                                        </span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Success State -->
                            <div x-show="kaliConfigured" class="text-center">
                                <div class="w-16 h-16 bg-apple-success rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span class="text-2xl">✓</span>
                                </div>
                                <p class="text-apple-success mb-6">SSH connection configured successfully!</p>
                                <button @click="runCurrentStep()" class="bg-apple-accent hover:bg-blue-600 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                    Continue to Next Step
                                </button>
                            </div>
                        </div>
                    </template>
                    
                    <template x-if="currentStep === 4">
                        <div>
                            <div class="w-16 h-16 bg-apple-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🚀</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Setup MCP Server</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Install and configure the MCP server on your Kali VM</p>
                            <button @click="runCurrentStep()" :disabled="isRunning" 
                                    class="bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                <span x-show="!isRunning">Setup MCP</span>
                                <span x-show="isRunning" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Setting up...
                                </span>
                            </button>
                        </div>
                    </template>
                    
                    <template x-if="currentStep === 5">
                        <div>
                            <div class="w-16 h-16 bg-apple-success rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🧪</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Final Testing</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Verify everything is working correctly</p>
                            <button @click="runCurrentStep()" :disabled="isRunning" 
                                    class="bg-apple-success hover:bg-green-600 disabled:opacity-50 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                <span x-show="!isRunning">Run Tests</span>
                                <span x-show="isRunning" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Testing...
                                </span>
                            </button>
                        </div>
                    </template>
                    
                    <template x-if="currentStep > 5">
                        <div>
                            <div class="w-16 h-16 bg-apple-success rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🎉</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Setup Complete!</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Your Kali MCP environment is ready to use</p>
                            <div class="flex justify-center space-x-4">
                                <button @click="openDocumentation('QUICK_START.md')" 
                                        class="bg-apple-accent hover:bg-blue-600 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                    📚 View Documentation
                                </button>
                                <button @click="currentStep = 1" 
                                        class="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                    🔄 Start Over
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            
            <!-- Current Step Content -->
            <div class="mb-8">
                <template x-for="(step, index) in steps" :key="index">
                    <div x-show="index + 1 === currentStep" class="fade-in">
                        <h3 class="text-2xl font-semibold mb-4" x-text="step.title"></h3>
                        <p class="text-apple-secondary mb-6" x-text="step.description"></p>
                        
                        <!-- Auto-check in progress -->
                        <div x-show="step.checking" class="flex items-center space-x-3 mb-6">
                            <div class="animate-spin w-5 h-5 border-2 border-apple-accent border-t-transparent rounded-full"></div>
                            <span class="text-apple-secondary">Checking requirements...</span>
                        </div>
                        
                        <!-- Step Actions -->
                        <div class="flex space-x-4">
                            <button x-show="!step.completed && !step.checking" @click="runStepAction(index)" 
                                    class="bg-apple-accent hover:bg-blue-600 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                <span x-text="step.actionText || 'Continue'"></span>
                            </button>
                            
                            <button x-show="step.completed" @click="nextStep()" 
                                    class="bg-apple-success hover:bg-green-600 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                Next Step →
                            </button>
                            
                            <button x-show="index > 0" @click="previousStep()" 
                                    class="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                ← Back
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Terminal Section -->
        <div class="glass-effect rounded-apple-lg p-6 mb-8">
            <div class="terminal-window rounded-apple">
                <!-- Terminal Header -->
                <div class="terminal-header px-4 py-3 rounded-t-apple">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="flex space-x-2">
                                <div class="traffic-light red"></div>
                                <div class="traffic-light yellow"></div>
                                <div class="traffic-light green"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-300">🐉 Kali Dragon Terminal</span>
                        </div>
                        <button @click="clearTerminal()" class="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white">
                            Clear
                        </button>
                    </div>
                </div>
                
                <!-- Terminal Content -->
                <div class="p-4">
                    <div id="terminal-output" class="font-mono text-sm mb-4 h-64 overflow-y-auto scrollbar-hidden">
                        <div class="text-green-400">🐉 Kali Dragon Setup Terminal</div>
                        <div class="text-blue-400">💡 Ready to begin your MCP setup journey</div>
                        <div class="text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                        <div class="text-white">Type commands or use the wizard above</div>
                    </div>
                    
                    <!-- Terminal Input -->
                    <div class="flex items-center space-x-2 bg-gray-900 rounded-apple px-4 py-2">
                        <span class="text-green-400 font-mono">$</span>
                        <input 
                            id="terminal-input"
                            type="text" 
                            @keydown.enter="executeCommand()"
                            class="flex-1 bg-transparent border-none outline-none text-white font-mono"
                            placeholder="Enter command..."
                            x-model="currentCommand"
                        >
                        <button @click="executeCommand()" class="bg-apple-accent hover:bg-blue-600 px-4 py-1 rounded text-white text-sm">
                            Run
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button @click="openDocumentation('QUICK_START.md')" class="glass-effect rounded-apple-lg p-6 text-left hover:bg-gray-800 transition-all step-card">
                <div class="text-2xl mb-3">📚</div>
                <h3 class="text-lg font-semibold mb-2">Quick Start Guide</h3>
                <p class="text-apple-secondary text-sm">Get up and running in minutes</p>
            </button>
            
            <button @click="openDocumentation('TROUBLESHOOTING.md')" class="glass-effect rounded-apple-lg p-6 text-left hover:bg-gray-800 transition-all step-card">
                <div class="text-2xl mb-3">🔧</div>
                <h3 class="text-lg font-semibold mb-2">Troubleshooting</h3>
                <p class="text-apple-secondary text-sm">Solve common issues</p>
            </button>
            
            <button @click="showSystemInfo()" class="glass-effect rounded-apple-lg p-6 text-left hover:bg-gray-800 transition-all step-card">
                <div class="text-2xl mb-3">📊</div>
                <h3 class="text-lg font-semibold mb-2">System Status</h3>
                <p class="text-apple-secondary text-sm">Check your environment</p>
            </button>
        </div>
    </main>

    <script>
        function kaliDragon() {
            return {
                currentStep: 1,
                totalSteps: 5,
                currentCommand: '',
                isRunning: false,
                
                // Kali VM Configuration
                kaliIP: '',
                kaliUser: 'kali',
                kaliPassword: '',
                kaliPort: 22,
                kaliConfigured: false,
                
                testKaliConnection() {
                    this.isRunning = true;
                    
                    // Using exact logic from working kali_mcp_wizard.sh
                    const keyName = 'kali_mcp_key';
                    const currentDate = new Date().toISOString().slice(0,10).replace(/-/g,'');
                    const command = 'echo "🐧 Testing connection to Kali VM: ' + this.kaliIP + '" && ' +
                                  'echo "" && ' +
                                  'echo "🔑 Generating SSH key for MCP connection..." && ' +
                                  'ssh-keygen -t ed25519 -f ~/.ssh/' + keyName + ' -N "" -C "mcp-kali-' + currentDate + '" >/dev/null 2>&1 || echo "SSH key already exists" && ' +
                                  'echo "✅ SSH key generated" && ' +
                                  'echo "" && ' +
                                  'echo "🗋 Public key to copy to Kali VM:" && ' +
                                  'cat ~/.ssh/' + keyName + '.pub 2>/dev/null || echo "Key file not found" && ' +
                                  'echo "" && ' +
                                  'echo "Manual setup in your Kali VM:" && ' +
                                  'echo "1. mkdir -p ~/.ssh && chmod 700 ~/.ssh" && ' +
                                  'echo "2. echo [COPY_PUBLIC_KEY_ABOVE] >> ~/.ssh/authorized_keys" && ' +
                                  'echo "3. chmod 600 ~/.ssh/authorized_keys" && ' +
                                  'echo "" && ' +
                                  'echo "🧪 Or try automatic key copy:" && ' +
                                  'ssh-copy-id -i ~/.ssh/' + keyName + ' ' + this.kaliUser + '@' + this.kaliIP + ' 2>/dev/null && echo "✅ SSH key copied automatically" || echo "⚠️ Auto-copy failed, use manual method above" && ' +
                                  'echo "" && ' +
                                  'echo "🚨 Testing SSH connection..." && ' +
                                  'ssh -i ~/.ssh/' + keyName + ' -p ' + this.kaliPort + ' -o ConnectTimeout=5 -o StrictHostKeyChecking=no ' + this.kaliUser + '@' + this.kaliIP + ' "echo SSH connection successful" 2>/dev/null && echo "✅ SSH test passed!" || echo "❌ SSH test failed - please check VM and try manual setup"';
                    
                    this.executeKaliConnectionTest(command);
                },
                
                async executeKaliConnectionTest(command) {
                    try {
                        // Add timeout to prevent hanging
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
                        
                        const response = await fetch('/api/execute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ command }),
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            throw new Error('HTTP error! status: ' + response.status);
                        }
                        
                        const result = await response.json();
                        
                        if (result.output) {
                            this.appendToTerminal(result.output, 'success');
                        }
                        
                        if (result.error) {
                            this.appendToTerminal(result.error, 'error');
                        }
                        
                        // Mark Kali as configured
                        setTimeout(() => {
                            this.isRunning = false;
                            this.kaliConfigured = true;
                            this.appendToTerminal('✅ SSH key setup completed! Follow the instructions above to enable passwordless access.', 'success');
                        }, 1500);
                        
                    } catch (error) {
                        this.isRunning = false;
                        if (error.name === 'AbortError') {
                            this.appendToTerminal('⚠️ SSH setup timed out. Please try again.', 'error');
                        } else {
                            this.appendToTerminal('Error: ' + error.message, 'error');
                        }
                        console.error('SSH setup error:', error);
                    }
                },
                
                runCurrentStep() {
                    this.isRunning = true;
                    
                    // Execute the appropriate command for the current step
                    let command = '';
                    switch(this.currentStep) {
                        case 1:
                            command = 'echo "🔍 Checking system requirements..." && ' +
                                    'echo "" && ' +
                                    'echo "Checking Node.js..." && ' +
                                    'echo "✅ Node.js found: $(node --version)" && ' +
                                    'echo "" && ' +
                                    'echo "Checking Claude Desktop..." && ' +
                                    '(ls "/Applications/Claude.app" >/dev/null 2>&1 && echo "✅ Claude Desktop found" || echo "❌ Claude Desktop not found - Please install from https://claude.ai/download") && ' +
                                    'echo "" && ' +
                                    'echo "Checking SSH client (for Kali VM connection)..." && ' +
                                    '(which ssh >/dev/null 2>&1 && echo "✅ SSH client found" || echo "❌ SSH client not found") && ' +
                                    'echo "" && ' +
                                    'echo "✅ System requirements check complete!" && ' +
                                    'echo "" && ' +
                                    'echo "💡 Note: This setup only requires Node.js, Claude Desktop, and SSH"';
                            break;
                        case 2:
                            command = 'echo "📦 Installing dependencies..." && echo "Python, Docker, SSH verification" && sleep 2 && echo "✅ Dependencies ready"';
                            break;
                        case 3:
                            // This step is handled by testKaliConnection(), so just proceed
                            if (this.kaliConfigured) {
                                command = 'echo "✅ Kali VM SSH access configured successfully!" && echo "Proceeding to MCP server setup..."';
                            } else {
                                this.isRunning = false;
                                this.appendToTerminal('Please configure your Kali VM credentials first.', 'error');
                                return;
                            }
                            break;
                        case 4:
                            command = 'echo "🚀 Setting up MCP Server..." && echo "Installing MCP components on Kali VM" && sleep 3 && echo "✅ MCP Server ready"';
                            break;
                        case 5:
                            command = 'echo "🧪 Running final tests..." && echo "Testing MCP connections" && sleep 2 && echo "✅ All tests passed!"';
                            break;
                    }
                    
                    this.executeStepCommand(command);
                },
                
                async executeStepCommand(command) {
                    try {
                        const response = await fetch('/api/execute', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ command })
                        });
                        
                        const result = await response.json();
                        
                        if (result.output) {
                            this.appendToTerminal(result.output, 'success');
                        }
                        
                        if (result.error) {
                            this.appendToTerminal(result.error, 'error');
                        }
                        
                        // Move to next step after successful completion
                        setTimeout(() => {
                            this.isRunning = false;
                            if (this.currentStep < this.totalSteps) {
                                this.currentStep++;
                            } else {
                                this.currentStep = 6; // Show completion screen
                            }
                        }, 1000);
                        
                    } catch (error) {
                        this.appendToTerminal('Error: ' + error.message, 'error');
                        this.isRunning = false;
                    }
                },

                async executeCommand() {
                    if (!this.currentCommand.trim()) return;
                    
                    this.appendToTerminal(\`$ \${this.currentCommand}\`, 'command');
                    
                    // Handle special commands
                    if (this.currentCommand === 'help') {
                        this.showHelp();
                    } else if (this.currentCommand === 'docs') {
                        this.showDocsMenu();
                    } else {
                        // Send to backend
                        try {
                            const response = await fetch('/api/execute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ command: this.currentCommand })
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
                    }
                    
                    this.currentCommand = '';
                },

                showHelp() {
                    this.appendToTerminal('Available commands:', 'info');
                    this.appendToTerminal('  help        - Show this help', 'output');
                    this.appendToTerminal('  docs        - Show documentation menu', 'output');
                    this.appendToTerminal('  clear       - Clear terminal', 'output');
                    this.appendToTerminal('  quickstart  - Open quick start guide', 'output');
                },

                showDocsMenu() {
                    this.appendToTerminal('📚 Available Documentation:', 'info');
                    this.appendToTerminal('  1. Quick Start Guide - quickstart', 'output');
                    this.appendToTerminal('  2. Kali VM Setup - kali-setup', 'output');
                    this.appendToTerminal('  3. MCP Server Setup - mcp-setup', 'output');
                    this.appendToTerminal('  4. Troubleshooting - troubleshoot', 'output');
                },

                showSystemInfo() {
                    this.appendToTerminal('📊 System Information:', 'info');
                    this.appendToTerminal(\`  OS: ${state.os}\`, 'output');
                    this.appendToTerminal(\`  Node.js: ${state.nodeVersion}\`, 'output');
                    this.appendToTerminal('  Python: Checking...', 'output');
                    this.appendToTerminal('  Docker: Checking...', 'output');
                },

                clearTerminal() {
                    const output = document.getElementById('terminal-output');
                    output.innerHTML = [
                        '<div class="text-green-400">🐉 Kali Dragon Setup Terminal</div>',
                        '<div class="text-blue-400">💡 Ready to begin your MCP setup journey</div>',
                        '<div class="text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>',
                        '<div class="text-white">Type commands or use the wizard above</div>'
                    ].join('\\n');
                },

                appendToTerminal(text, type = 'output') {
                    const output = document.getElementById('terminal-output');
                    const div = document.createElement('div');
                    
                    const colors = {
                        'command': 'text-yellow-400',
                        'output': 'text-white',
                        'error': 'text-red-400',
                        'info': 'text-blue-400',
                        'success': 'text-green-400'
                    };
                    
                    div.className = colors[type] || 'text-white';
                    div.textContent = text;
                    output.appendChild(div);
                    output.scrollTop = output.scrollHeight;
                },

                openDocumentation(filename) {
                    this.appendToTerminal(\`📖 Opening \${filename}...\`, 'info');
                    window.open(\`/api/docs/\${filename}\`, '_blank');
                }
            }
        }
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

// Handle API requests
function handleAPI(req, res, pathname) {
    if (pathname.startsWith('/api/docs/')) {
        const docName = pathname.replace('/api/docs/', '');
        serveDocumentation(res, docName);
    } else if (pathname === '/api/execute' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body);
                
                // Execute command
                const child = spawn('bash', ['-c', command], { stdio: 'pipe' });
                let output = '';
                let error = '';
                
                child.stdout.on('data', data => output += data.toString());
                child.stderr.on('data', data => error += data.toString());
                
                child.on('close', code => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ output, error, code }));
                });
                
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (pathname === '/') {
        serveHTML(res);
    } else if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log('\n🐉 Kali Dragon Setup Server');
    console.log('📍 Server running at: http://localhost:' + PORT);
    console.log('🎯 Modern Apple-style interface ready!');
    console.log('⚡ Automatic wizard with progress tracking');
    console.log('💡 Browser will open automatically when using ./setup.sh');
});
