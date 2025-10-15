#!/usr/bin/env node
/**
 * Kali Linux MCP Server - Ultra Robust Version
 * Optimized for SSH connections and Claude Desktop compatibility
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const WORKSPACE_DIR = path.join(os.homedir(), 'workspace');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.js', '.py', '.sh', '.yaml', '.yml', '.log'];

class KaliMCPServer {
  constructor() {
    this.initialized = false;
    this.setupWorkspace();
    
    // Disable all TTY-related features for SSH compatibility
    if (process.stdin.setRawMode) {
      try {
        process.stdin.setRawMode(false);
      } catch (e) {
        // Ignore if not TTY
      }
    }
    
    // Set binary mode for Windows compatibility
    if (process.platform === 'win32') {
      process.stdin.setEncoding(null);
      process.stdout.setEncoding(null);
    } else {
      process.stdin.setEncoding('utf8');
      process.stdout.setEncoding('utf8');
    }
  }

  // Initialize workspace silently
  setupWorkspace() {
    try {
      if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
      }
      
      // Create welcome file
      const welcomeFile = path.join(WORKSPACE_DIR, 'README.md');
      if (!fs.existsSync(welcomeFile)) {
        const welcomeContent = `# Welcome to Kali Linux MCP Workspace

This workspace is accessible via Claude Desktop through the MCP (Model Context Protocol).

## Available Commands
- List files and directories
- Read text files (up to ${MAX_FILE_SIZE / 1024 / 1024}MB)
- Browse directory contents

## Security
- Access is restricted to this workspace directory only
- Only text files with safe extensions are readable
- Binary files are blocked for security

## Getting Started
You can ask Claude to:
- "List the files in the workspace"
- "Read the contents of README.md"
- "Show me what's in the workspace directory"

Happy hacking! 🐉
`;
        fs.writeFileSync(welcomeFile, welcomeContent);
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  // Send JSON-RPC 2.0 response with strict formatting
  sendResponse(id, result = null, error = null) {
    const response = { 
      jsonrpc: '2.0',
      id: id
    };
    
    if (error) {
      response.error = { 
        code: typeof error === 'object' ? (error.code || -32000) : -32000,
        message: typeof error === 'object' ? (error.message || String(error)) : String(error)
      };
    } else {
      response.result = result || {};
    }
    
    try {
      const jsonString = JSON.stringify(response);
      // Write with explicit newline and flush
      process.stdout.write(jsonString + '\n');
      if (process.stdout.flush) {
        process.stdout.flush();
      }
    } catch (writeError) {
      // If we can't send response, log to stderr
      process.stderr.write(`Error sending response: ${writeError.message}\n`);
    }
  }

  // Handle initialize request
  handleInitialize(id, params) {
    this.initialized = true;
    const result = {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {
          subscribe: false,
          listChanged: false
        },
        tools: {},
        prompts: {}
      },
      serverInfo: {
        name: 'kali-mcp-server',
        version: '1.0.0',
        description: 'Kali Linux MCP Server for secure workspace access'
      }
    };
    this.sendResponse(id, result);
  }

  // Handle resources/list
  handleResourcesList(id, params) {
    try {
      const resources = [{
        uri: `file://${WORKSPACE_DIR}`,
        name: 'Kali Workspace',
        description: 'Kali Linux secure workspace directory',
        mimeType: 'inode/directory'
      }];
      
      this.sendResponse(id, { resources });
    } catch (error) {
      this.sendResponse(id, null, { 
        code: -32603,
        message: `Failed to list resources: ${error.message}`
      });
    }
  }

  // Handle resources/read
  handleResourcesRead(id, params) {
    try {
      if (!params || !params.uri) {
        throw new Error('Missing URI parameter');
      }
      
      const uri = params.uri;
      if (!uri.startsWith('file://')) {
        throw new Error('Only file:// URIs are supported');
      }
      
      let filePath = uri.replace('file://', '');
      
      // Security: ensure path is within workspace
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(WORKSPACE_DIR, filePath);
      }
      
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
        throw new Error('Access denied: path outside workspace');
      }
      
      if (!fs.existsSync(resolvedPath)) {
        throw new Error('File not found');
      }
      
      const stat = fs.statSync(resolvedPath);
      
      if (stat.isDirectory()) {
        // List directory contents
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
        const listing = items.map(item => {
          const itemPath = path.join(resolvedPath, item.name);
          const itemStat = fs.statSync(itemPath);
          return {
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file',
            size: item.isFile() ? itemStat.size : null,
            modified: itemStat.mtime.toISOString(),
            readable: item.isFile() ? this.isReadableFile(item.name) : null
          };
        });
        
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(listing, null, 2)
          }]
        });
      } else {
        // Read file
        if (stat.size > MAX_FILE_SIZE) {
          throw new Error(`File too large (${stat.size} bytes, max ${MAX_FILE_SIZE})`);
        }
        
        if (!this.isReadableFile(path.basename(resolvedPath))) {
          throw new Error('File type not allowed for reading');
        }
        
        const content = fs.readFileSync(resolvedPath, 'utf8');
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: this.getMimeType(path.extname(resolvedPath)),
            text: content
          }]
        });
      }
    } catch (error) {
      this.sendResponse(id, null, {
        code: -32603,
        message: error.message
      });
    }
  }

  // Check if file is readable based on extension
  isReadableFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext) || ext === '';
  }

  // Get MIME type for file extension
  getMimeType(ext) {
    const mimeTypes = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.js': 'text/javascript',
      '.py': 'text/x-python',
      '.sh': 'text/x-shellscript',
      '.yaml': 'text/yaml',
      '.yml': 'text/yaml',
      '.log': 'text/plain'
    };
    return mimeTypes[ext] || 'text/plain';
  }

  // Handle ping (for testing)
  handlePing(id) {
    this.sendResponse(id, {
      message: 'pong',
      server: 'kali-mcp-server',
      workspace: WORKSPACE_DIR,
      timestamp: new Date().toISOString()
    });
  }

  // Main message handler with better error handling
  handleMessage(message) {
    try {
      // Validate message structure
      if (typeof message !== 'object' || message === null) {
        this.sendResponse(null, null, {
          code: -32600,
          message: 'Invalid Request: not a valid object'
        });
        return;
      }

      const { jsonrpc, id, method, params } = message;
      
      // Validate JSON-RPC 2.0
      if (jsonrpc !== '2.0') {
        this.sendResponse(id || null, null, {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"'
        });
        return;
      }
      
      if (typeof method !== 'string') {
        this.sendResponse(id || null, null, {
          code: -32600,
          message: 'Invalid Request: method must be a string'
        });
        return;
      }
      
      // Route methods
      switch (method) {
        case 'initialize':
          this.handleInitialize(id, params);
          break;
        case 'resources/list':
          this.handleResourcesList(id, params);
          break;
        case 'resources/read':
          this.handleResourcesRead(id, params);
          break;
        case 'ping':
          this.handlePing(id);
          break;
        default:
          this.sendResponse(id, null, {
            code: -32601,
            message: `Method not found: ${method}`
          });
      }
    } catch (error) {
      this.sendResponse(message.id || null, null, {
        code: -32603,
        message: `Internal error: ${error.message}`
      });
    }
  }
}

// Main execution with enhanced error handling
const server = new KaliMCPServer();

// Robust input processing
let buffer = '';
process.stdin.on('data', (chunk) => {
  try {
    buffer += chunk.toString('utf8');
    let newlineIndex;
    
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      
      if (line) {
        try {
          const message = JSON.parse(line);
          server.handleMessage(message);
        } catch (parseError) {
          // Send parse error response
          server.sendResponse(null, null, {
            code: -32700,
            message: `Parse error: ${parseError.message}`
          });
        }
      }
    }
  } catch (dataError) {
    // Critical error handling
    process.stderr.write(`Critical data error: ${dataError.message}\n`);
  }
});

// Error handling
process.stdin.on('error', (error) => {
  process.stderr.write(`Stdin error: ${error.message}\n`);
});

process.stdout.on('error', (error) => {
  process.stderr.write(`Stdout error: ${error.message}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('uncaughtException', (error) => {
  process.stderr.write(`Uncaught exception: ${error.message}\n`);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
});

// Silent startup - no logs to stdout