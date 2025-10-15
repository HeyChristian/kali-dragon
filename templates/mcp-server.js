#!/usr/bin/env node
/**
 * Kali Linux MCP Server
 * Provides secure file system access to Kali Linux workspace via MCP protocol
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
  }

  // Initialize workspace
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
      // Silently handle errors to avoid contaminating JSON-RPC output
    }
  }

  // Send JSON-RPC 2.0 response
  sendResponse(id, result = null, error = null) {
    const response = { jsonrpc: '2.0', id };
    
    if (error) {
      response.error = { 
        code: typeof error === 'object' ? error.code || -32000 : -32000,
        message: typeof error === 'object' ? error.message : String(error)
      };
    } else {
      response.result = result;
    }
    
    process.stdout.write(JSON.stringify(response) + '\n');
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
      this.sendResponse(id, null, `Failed to list resources: ${error.message}`);
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
      this.sendResponse(id, null, error.message);
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

  // Main message handler
  handleMessage(message) {
    try {
      const { jsonrpc, id, method, params } = message;
      
      // Validate JSON-RPC 2.0
      if (jsonrpc !== '2.0') {
        this.sendResponse(id, null, 'Invalid jsonrpc version, expected "2.0"');
        return;
      }
      
      if (typeof method !== 'string') {
        this.sendResponse(id, null, 'Missing or invalid method field');
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
          this.sendResponse(id, null, `Unknown method: ${method}`);
      }
    } catch (error) {
      this.sendResponse(message.id || null, null, `Server error: ${error.message}`);
    }
  }
}

// Main execution
const server = new KaliMCPServer();

// Process input line by line
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newlineIndex;
  
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    
    if (line) {
      try {
        const message = JSON.parse(line);
        server.handleMessage(message);
      } catch (error) {
        // Send error response for invalid JSON
        const response = {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error: Invalid JSON' }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    }
  }
});

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// MCP Server started silently - no logs to prevent JSON-RPC contamination
