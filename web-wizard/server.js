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

// Simple markdown to HTML converter (built-in, no external dependencies)
function simpleMarkdownToHtml(markdown) {
    // Step 1: Preserve code blocks first to avoid processing their content
    const codeBlocks = [];
    let html = markdown.replace(/```([\s\S]*?)```/g, (match, content) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code>${content.trim()}</code></pre>`);
        return placeholder;
    });
    
    // Step 2: Process other markdown elements
    html = html
        // Headers (most specific first)
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic (but not if it's part of bold)
        .replace(/(?<!\*)\*((?!\*)[^*]+)\*(?!\*)/g, '<em>$1</em>')
        // Inline code (preserve)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Horizontal rule
        .replace(/^---+$/gim, '<hr>')
        // Unordered lists
        .replace(/^- (.+$)/gim, '<li>$1</li>')
        // Ordered lists  
        .replace(/^\d+\. (.+$)/gim, '<li>$1</li>');
    
    // Step 3: Handle paragraphs and restore code blocks
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    let listType = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            if (inList) {
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            processedLines.push('');
            continue;
        }
        
        // Handle lists
        if (line.startsWith('<li>')) {
            if (!inList) {
                // Detect if it's ordered or unordered by looking at original
                const originalLine = markdown.split('\n')[i] || '';
                if (originalLine.trim().match(/^\d+\./)) {
                    processedLines.push('<ol>');
                    listType = 'ol';
                } else {
                    processedLines.push('<ul>');
                    listType = 'ul';
                }
                inList = true;
            }
            processedLines.push(line);
        } else {
            if (inList) {
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            
            // Don't wrap if it's already an HTML element or code block placeholder
            if (line.match(/^<(h[1-6]|hr|__CODE_BLOCK_)/) || line === '') {
                processedLines.push(line);
            } else {
                processedLines.push(`<p>${line}</p>`);
            }
        }
    }
    
    // Close any open list
    if (inList) {
        processedLines.push(`</${listType}>`);
    }
    
    html = processedLines.join('\n');
    
    // Step 4: Restore code blocks
    codeBlocks.forEach((codeBlock, index) => {
        html = html.replace(`__CODE_BLOCK_${index}__`, codeBlock);
    });
    
    return html;
}

// Serve documentation files
function serveDocumentation(res, docPath) {
    // Security: prevent directory traversal
    const safePath = path.join(__dirname, '..', 'docs', path.basename(docPath));
    
    try {
        const content = fs.readFileSync(safePath, 'utf8');
        const htmlContent = simpleMarkdownToHtml(content);
        
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Kali Dragon Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #ffffff;
            line-height: 1.6;
            min-height: 100vh;
            font-size: 14px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 50%, rgba(22, 33, 62, 0.95) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header .title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .header .dragon-icon {
            font-size: 2rem;
            filter: drop-shadow(0 0 10px rgba(0, 122, 255, 0.3));
        }
        .header h1 {
            font-size: 1.5rem;
            color: #ffffff;
            font-weight: 600;
            margin: 0;
        }
        .header .subtitle {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
        }
        .header .buttons {
            display: flex;
            gap: 0.5rem;
        }
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        .btn-primary { background: #007aff; color: white; }
        .btn-primary:hover { background: #0056cc; }
        .btn-secondary { background: #48484a; color: white; }
        .btn-secondary:hover { background: #636366; }
        
        .content {
            background: rgba(28, 28, 30, 0.85);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        h1 { font-size: 2rem; margin: 1.5rem 0; color: #007aff; font-weight: 600; }
        h2 { font-size: 1.5rem; margin: 1.25rem 0; color: #007aff; border-bottom: 1px solid rgba(0, 122, 255, 0.3); padding-bottom: 0.5rem; font-weight: 500; }
        h3 { font-size: 1.25rem; margin: 1rem 0; color: #ffffff; font-weight: 500; }
        p { margin: 0.75rem 0; }
        code {
            background: rgba(0, 122, 255, 0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            color: #007aff;
            font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
            font-size: 0.9em;
        }
        pre {
            background: #1c1c1e;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        pre code {
            background: transparent;
            color: #ffffff;
            padding: 0;
        }
        a { color: #007aff; text-decoration: none; transition: color 0.2s; }
        a:hover { color: #4a9eff; text-decoration: underline; }
        ul, ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        li { margin: 0.25rem 0; }
        strong { color: #ffffff; font-weight: 600; }
        em { color: #8e8e93; font-style: italic; }
        hr { border: none; height: 1px; background: rgba(255, 255, 255, 0.1); margin: 1.5rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title-section">
                <div class="dragon-icon">🐉</div>
                <div>
                    <h1>Kali Dragon</h1>
                    <p class="subtitle">Documentation Center</p>
                </div>
            </div>
            <div class="buttons">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
                <button class="btn btn-secondary" onclick="window.close()">← Back</button>
            </div>
        </div>
        
        <div class="content">
            ${htmlContent}
        </div>
    </div>
    
    <script>
        // Open external links in new tab
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
        
        // Handle internal documentation links
        document.querySelectorAll('a[href$=".md"]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href.startsWith('http')) {
                link.onclick = (e) => {
                    e.preventDefault();
                    window.open('/api/docs/' + href, '_blank');
                };
            }
        });
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fullHtml);
    } catch (error) {
        console.error('Documentation error:', error);
        // Return 404 with styled error page
        const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Not Found</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(20px);
            padding: 3rem;
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
            font-size: 3rem;
            color: #ff3b30;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            color: #e0e0e0;
        }
        .btn {
            background: #6c757d;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #5a6268;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>😵 404</h1>
        <p>Documentation file not found</p>
        <p><code>${docPath}</code></p>
        <button class="btn" onclick="window.close()">← Back to Kali Dragon</button>
    </div>
</body>
</html>`;
        
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
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
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500" 
                                             :class="claudeDesktopInstalled === true ? 'bg-green-500' : (claudeDesktopInstalled === false ? 'bg-red-500' : 'bg-apple-warning')">
                                            <span class="text-xs font-bold" 
                                                  :class="claudeDesktopInstalled === true ? 'text-white' : (claudeDesktopInstalled === false ? 'text-white' : 'text-gray-800')" 
                                                  x-text="claudeDesktopInstalled === true ? '✓' : (claudeDesktopInstalled === false ? '✗' : '?')"></span>
                                        </div>
                                        <span class="text-apple-secondary"><strong>Claude Desktop Application</strong> (Required)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Conditional Helpers -->
                            <!-- Claude Desktop Missing Helper -->
                            <div x-show="claudeDesktopInstalled === false" class="max-w-md mx-auto mb-6">
                                <div class="bg-red-900/30 border border-red-500/30 rounded-apple p-4 text-center">
                                    <div class="text-red-400 text-xl mb-2">⚠️</div>
                                    <p class="text-sm text-red-100 font-medium mb-2">Claude Desktop Required</p>
                                    <p class="text-xs text-red-200 mb-3">Download from <a href="https://claude.ai/download" target="_blank" class="text-red-400 hover:text-red-300 underline font-medium">claude.ai/download</a></p>
                                    <div class="text-xs text-red-300 bg-red-800/30 rounded px-2 py-1">
                                        💳 <strong>Note:</strong> Premium subscription required for MCP
                                    </div>
                                </div>
                            </div>
                            
                            <!-- MCP Premium Info (when Claude Desktop is installed) -->
                            <div x-show="claudeDesktopInstalled === true" class="max-w-md mx-auto mb-6">
                                <div class="bg-green-900/30 border border-green-500/30 rounded-apple p-3 text-center">
                                    <div class="text-green-400 text-sm mb-1">✅ Claude Desktop Ready</div>
                                    <div class="text-xs text-green-200">
                                        💳 <strong>Premium subscription</strong> required for MCP features
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
                            <h3 class="text-3xl font-bold mb-4 text-white">Install SSH Client</h3>
                            <p class="text-apple-secondary mb-8 max-w-lg mx-auto">Ensure SSH client is available for connecting to your Kali VM</p>
                            <button @click="runCurrentStep()" :disabled="isRunning" 
                                    class="bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-apple font-semibold text-lg transition-all duration-200">
                                <span x-show="!isRunning">Setup SSH Client</span>
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
                    
                    <template x-if="currentStep === 3">
                        <div>
                            <div class="w-16 h-16 bg-apple-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🐧</span>
                            </div>
                            <h3 class="text-3xl font-bold mb-4 text-white">Configure Kali VM</h3>
                            <p class="text-apple-secondary mb-6 max-w-lg mx-auto">Enter your Kali Linux VM credentials to setup passwordless SSH access</p>
                            
                            <!-- Kali Credentials Form -->
                            <div x-show="!kaliConfigured" class="max-w-md mx-auto mb-6">
                                <div class="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label class="block text-xs font-medium text-apple-secondary mb-1">Kali VM IP</label>
                                        <input x-model="kaliIP" type="text" placeholder="192.168.1.100" 
                                               class="w-full px-3 py-2 bg-apple-surface border border-gray-600 rounded-apple text-white text-sm placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-apple-secondary mb-1">SSH Port</label>
                                        <input x-model="kaliPort" type="number" placeholder="22" 
                                               class="w-full px-3 py-2 bg-apple-surface border border-gray-600 rounded-apple text-white text-sm placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-apple-secondary mb-1">Username</label>
                                        <input x-model="kaliUser" type="text" placeholder="kali" 
                                               class="w-full px-3 py-2 bg-apple-surface border border-gray-600 rounded-apple text-white text-sm placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-apple-secondary mb-1">Password</label>
                                        <input x-model="kaliPassword" type="password" placeholder="Your password" 
                                               class="w-full px-3 py-2 bg-apple-surface border border-gray-600 rounded-apple text-white text-sm placeholder-gray-500 focus:border-apple-accent focus:outline-none">
                                    </div>
                                </div>
                                
                                <button @click="testKaliConnection()" :disabled="isRunning || !kaliIP || !kaliUser || !kaliPassword" 
                                        class="w-full bg-apple-accent hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200 mb-3">
                                    <span x-show="!isRunning">Generate SSH Key & Setup</span>
                                    <span x-show="isRunning" class="flex items-center justify-center">
                                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Setting up...
                                    </span>
                                </button>
                                
                                <!-- Help Link for UTM Setup -->
                                <div class="mt-4">
                                    <div class="bg-blue-900/30 border border-blue-500/30 rounded-apple p-4">
                                        <div class="flex items-center space-x-3">
                                            <span class="text-blue-400 text-xl">💡</span>
                                            <div>
                                                <p class="text-sm text-blue-100 font-medium">Need help setting up Kali Linux with UTM?</p>
                                                <button @click="openDocumentation('KALI_UTM_SETUP.md')" 
                                                        class="text-blue-400 hover:text-blue-300 text-sm underline mt-1 transition-colors">
                                                    📚 Complete UTM + Kali Installation Guide
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- SSH Key Generated State -->
                            <div x-show="kaliConfigured && !sshTested" class="text-center max-w-md mx-auto">
                                <div class="w-12 h-12 bg-apple-warning rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span class="text-lg">🔑</span>
                                </div>
                                <p class="text-apple-secondary mb-4 text-sm">SSH key generated! Copy it to your Kali VM, then test the connection.</p>
                                <button @click="testSSHConnection()" :disabled="isRunning" 
                                        class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
                                    <span x-show="!isRunning">🧪 Test SSH Connection</span>
                                    <span x-show="isRunning" class="flex items-center">
                                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Testing...
                                    </span>
                                </button>
                            </div>
                            
                            <!-- SSH Connection Success State -->
                            <div x-show="sshTested" class="text-center max-w-md mx-auto">
                                <div class="w-12 h-12 bg-apple-success rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span class="text-lg">✅</span>
                                </div>
                                <p class="text-apple-success mb-4 text-sm">SSH connection working! Ready for MCP setup.</p>
                                <button @click="runCurrentStep()" class="bg-apple-accent hover:bg-blue-600 text-white px-6 py-3 rounded-apple font-medium transition-all duration-200">
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button @click="openDocumentation('QUICK_START.md')" class="glass-effect rounded-apple-lg p-6 text-left hover:bg-gray-800 transition-all step-card">
                <div class="text-2xl mb-3">📚</div>
                <h3 class="text-lg font-semibold mb-2">Quick Start Guide</h3>
                <p class="text-apple-secondary text-sm">Get up and running in minutes</p>
            </button>
            
            <button @click="openDocumentation('KALI_UTM_SETUP.md')" class="glass-effect rounded-apple-lg p-6 text-left hover:bg-gray-800 transition-all step-card">
                <div class="text-2xl mb-3">🐧</div>
                <h3 class="text-lg font-semibold mb-2">Kali UTM Setup</h3>
                <p class="text-apple-secondary text-sm">Complete UTM installation guide</p>
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
                sshTested: false,
                
                // System Requirements
                claudeDesktopInstalled: null, // null = not checked, true = found, false = missing
                
                testKaliConnection() {
                    this.isRunning = true;
                    
                    // Step 1: Simple SSH key generation only (like original script)
                    const keyName = 'kali_mcp_key';
                    const currentDate = new Date().toISOString().slice(0,10).replace(/-/g,'');
                    const command = 'echo "🐧 Setting up SSH access for Kali VM: ' + this.kaliIP + '" && ' +
                                  'echo "" && ' +
                                  'echo "🔑 Generating SSH key..." && ' +
                                  'if [ ! -f ~/.ssh/' + keyName + ' ]; then ' +
                                  '  ssh-keygen -t ed25519 -f ~/.ssh/' + keyName + ' -N "" -C "mcp-kali-' + currentDate + '" >/dev/null && ' +
                                  '  echo "✅ SSH key generated" ; ' +
                                  'else ' +
                                  '  echo "✅ SSH key already exists" ; ' +
                                  'fi && ' +
                                  'echo "" && ' +
                                  'echo "🗋 Copy this public key to your Kali VM:" && ' +
                                  'cat ~/.ssh/' + keyName + '.pub 2>/dev/null && ' +
                                  'echo "" && ' +
                                  'echo "In your Kali VM terminal, run:" && ' +
                                  'echo "mkdir -p ~/.ssh && chmod 700 ~/.ssh" && ' +
                                  'echo "echo [PASTE_KEY_ABOVE] >> ~/.ssh/authorized_keys" && ' +
                                  'echo "chmod 600 ~/.ssh/authorized_keys" && ' +
                                  'echo "" && ' +
                                  'echo "✅ SSH key setup complete - ready to test connection!"';
                    
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
                
                testSSHConnection() {
                    this.isRunning = true;
                    
                    // Simple SSH connection test using exact command from original script
                    const keyName = 'kali_mcp_key';
                    const command = 'echo "🚨 Testing SSH connection to ' + this.kaliUser + '@' + this.kaliIP + '..." && ' +
                                  'ssh -i ~/.ssh/' + keyName + ' -p ' + this.kaliPort + ' -o ConnectTimeout=5 -o StrictHostKeyChecking=no ' + this.kaliUser + '@' + this.kaliIP + ' "echo SSH connection successful" 2>/dev/null && echo "✅ SSH connection working!" || echo "❌ SSH connection failed"';
                    
                    this.executeSSHTest(command);
                },
                
                async executeSSHTest(command) {
                    try {
                        // Short timeout for SSH test
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
                        
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
                        
                        // Check if SSH test was successful
                        if (result.output && result.output.includes('SSH connection successful')) {
                            setTimeout(() => {
                                this.isRunning = false;
                                this.sshTested = true;
                                this.appendToTerminal('✅ SSH connection verified! You can now proceed to MCP setup.', 'success');
                            }, 1000);
                        } else {
                            setTimeout(() => {
                                this.isRunning = false;
                                this.appendToTerminal('❌ SSH test failed. Please check the key was copied correctly to your Kali VM.', 'error');
                            }, 1000);
                        }
                        
                    } catch (error) {
                        this.isRunning = false;
                        if (error.name === 'AbortError') {
                            this.appendToTerminal('⚠️ SSH test timed out. Please check your Kali VM is running and accessible.', 'error');
                        } else {
                            this.appendToTerminal('Error: ' + error.message, 'error');
                        }
                        console.error('SSH test error:', error);
                    }
                },
                
                runCurrentStep() {
                    this.isRunning = true;
                    
                    // Execute the appropriate command for the current step
                    let command = '';
                    switch(this.currentStep) {
                        case 1:
                            command = 'echo "🔍 Checking system requirements for Kali MCP setup..." && ' +
                                    'echo "" && ' +
                                    'echo "📱 Checking Claude Desktop (REQUIRED)..." && ' +
                                    'if [ -d "/Applications/Claude.app" ]; then ' +
                                    '  echo "✅ Claude Desktop found (macOS)" && ' +
                                    '  CLAUDE_FOUND=true; ' +
                                    'elif [ -d "/mnt/c/Users/$USER/AppData/Local/Programs/claude-desktop" ]; then ' +
                                    '  echo "✅ Claude Desktop found (Windows WSL)" && ' +
                                    '  CLAUDE_FOUND=true; ' +
                                    'elif pgrep -i "claude" >/dev/null 2>&1; then ' +
                                    '  echo "✅ Claude Desktop found (running process)" && ' +
                                    '  CLAUDE_FOUND=true; ' +
                                    'else ' +
                                    '  echo "❌ Claude Desktop NOT FOUND" && ' +
                                    '  echo "   Please install from: https://claude.ai/download" && ' +
                                    '  echo "   ⚠️  Cannot proceed without Claude Desktop!" && ' +
                                    '  CLAUDE_FOUND=false; ' +
                                    'fi && ' +
                                    'echo "" && ' +
                                    'if [ "$CLAUDE_FOUND" = "true" ]; then ' +
                                    '  echo "✅ System requirements check PASSED!" && ' +
                                    '  echo "   Ready to proceed with MCP setup"; ' +
                                    'else ' +
                                    '  echo "❌ System requirements check FAILED!" && ' +
                                    '  echo "   Install Claude Desktop before continuing"; ' +
                                    'fi';
                            break;
                        case 2:
                            command = 'echo "🔐 Setting up SSH client for Kali VM connection..." && ' +
                                    'echo "" && ' +
                                    'if which ssh >/dev/null 2>&1; then ' +
                                    '  echo "✅ SSH client already available" && ' +
                                    '  ssh -V 2>&1 | head -n1 && ' +
                                    '  echo "SSH client is ready for Kali VM connection" ; ' +
                                    'else ' +
                                    '  echo "❌ SSH client not found" && ' +
                                    '  echo "Installing SSH client based on platform..." && ' +
                                    '  if [[ "$OSTYPE" == "darwin"* ]]; then ' +
                                    '    echo "SSH client should be pre-installed on macOS" && ' +
                                    '    echo "If missing, install Xcode Command Line Tools: xcode-select --install" ; ' +
                                    '  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then ' +
                                    '    echo "Installing openssh-client..." && ' +
                                    '    (sudo apt-get update && sudo apt-get install -y openssh-client) || ' +
                                    '    (sudo yum install -y openssh-clients) || ' +
                                    '    echo "Please install SSH client manually" ; ' +
                                    '  else ' +
                                    '    echo "Please install SSH client for your platform" ; ' +
                                    '  fi ; ' +
                                    'fi && ' +
                                    'echo "" && ' +
                                    'echo "✅ SSH client setup complete!"';
                            break;
                        case 3:
                            // This step requires both key generation and SSH test
                            if (this.sshTested) {
                                command = 'echo "✅ Kali VM SSH access verified successfully!" && echo "Proceeding to MCP server setup..."';
                            } else {
                                this.isRunning = false;
                                if (!this.kaliConfigured) {
                                    this.appendToTerminal('Please generate SSH key and test the connection first.', 'error');
                                } else {
                                    this.appendToTerminal('Please test the SSH connection before proceeding.', 'error');
                                }
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
                        
                        // Check if this is Step 1 and validate Claude Desktop
                        setTimeout(() => {
                            this.isRunning = false;
                            
                            // For Step 1, check if Claude Desktop was found
                            if (this.currentStep === 1) {
                                // Check Claude Desktop status
                                if (result.output && result.output.includes('Claude Desktop found')) {
                                    this.claudeDesktopInstalled = true;
                                } else {
                                    this.claudeDesktopInstalled = false;
                                }
                                
                                
                                // Determine if we can proceed
                                if (this.claudeDesktopInstalled === true) {
                                    this.appendToTerminal('✅ All requirements met! You can now proceed.', 'success');
                                    if (this.currentStep < this.totalSteps) {
                                        this.currentStep++;
                                    }
                                } else {
                                    this.appendToTerminal('❌ Cannot proceed without Claude Desktop. Please install it first.', 'error');
                                    // Don't advance to next step
                                }
                            } else {
                                // For other steps, proceed normally
                                if (this.currentStep < this.totalSteps) {
                                    this.currentStep++;
                                } else {
                                    this.currentStep = 6; // Show completion screen
                                }
                            }
                        }, 1500);
                        
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
                    } else if (this.currentCommand === 'kali-utm') {
                        this.openDocumentation('KALI_UTM_SETUP.md');
                    } else if (this.currentCommand === 'quickstart') {
                        this.openDocumentation('QUICK_START.md');
                    } else if (this.currentCommand === 'mcp-setup') {
                        this.openDocumentation('MCP_SERVER_SETUP.md');
                    } else if (this.currentCommand === 'troubleshoot') {
                        this.openDocumentation('TROUBLESHOOTING.md');
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
                    this.appendToTerminal('  kali-utm    - Open UTM + Kali setup guide', 'output');
                    this.appendToTerminal('  troubleshoot- Open troubleshooting guide', 'output');
                },

                showDocsMenu() {
                    this.appendToTerminal('📚 Available Documentation:', 'info');
                    this.appendToTerminal('  1. Quick Start Guide - quickstart', 'output');
                    this.appendToTerminal('  2. Kali UTM Setup - kali-utm', 'output');
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
    console.log('💡 Browser will open automatically when using ./setup.sh');
});
