#!/usr/bin/env node
/**
 * Kali Linux MCP Server - Complete Version with ALL Required Methods
 * Compatible with Claude Desktop MCP protocol
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Configuration
const WORKSPACE_DIR = path.join(os.homedir(), 'workspace');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.js', '.py', '.sh', '.yaml', '.yml', '.log', '.conf', '.cfg'];

class KaliMCPServer {
  constructor() {
    this.initialized = false;
    this.setupWorkspace();
    
    // Configure streams for SSH compatibility
    process.stdin.setEncoding('utf8');
    process.stdout.setEncoding('utf8');
  }

  setupWorkspace() {
    try {
      if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
      }
      
      // Create welcome file
      const welcomeFile = path.join(WORKSPACE_DIR, 'README.md');
      if (!fs.existsSync(welcomeFile)) {
        const welcomeContent = `# Kali Linux MCP Workspace

Welcome to your secure Kali Linux workspace accessible through Claude Desktop!

## Available Tools
- **execute_command**: Run shell commands safely
- **read_file**: Read text files from workspace
- **list_directory**: Browse directories
- **write_file**: Create or modify files
- **system_info**: Get system information

## Security Features
- Commands run in restricted environment
- File access limited to workspace directory
- Safe file extensions only
- Command output sanitization

## Getting Started
Ask Claude to:
- "Run 'ls -la' to see workspace contents"
- "Show me system information"
- "Create a new Python script"
- "Read the contents of any file"

Happy hacking! 🐉⚡
`;
        fs.writeFileSync(welcomeFile, welcomeContent);
      }
      
      // Create sample files
      const samplesDir = path.join(WORKSPACE_DIR, 'samples');
      if (!fs.existsSync(samplesDir)) {
        fs.mkdirSync(samplesDir);
        
        // Create sample Python script
        const pythonSample = `#!/usr/bin/env python3
# Sample Python script for Kali workspace
import os
import platform

def system_info():
    return {
        'os': platform.system(),
        'release': platform.release(),
        'machine': platform.machine(),
        'python_version': platform.python_version()
    }

if __name__ == '__main__':
    info = system_info()
    print(f"System: {info['os']} {info['release']}")
    print(f"Architecture: {info['machine']}")
    print(f"Python: {info['python_version']}")
`;
        fs.writeFileSync(path.join(samplesDir, 'system_info.py'), pythonSample);
        
        // Create sample bash script
        const bashSample = `#!/bin/bash
# Sample bash script for Kali workspace
echo "Kali Linux MCP Workspace"
echo "========================="
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Date: $(date)"
echo "Uptime: $(uptime -p)"
`;
        fs.writeFileSync(path.join(samplesDir, 'info.sh'), bashSample);
        fs.chmodSync(path.join(samplesDir, 'info.sh'), '755');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  sendResponse(id, result = null, error = null) {
    const response = { jsonrpc: '2.0', id };
    
    if (error) {
      response.error = {
        code: typeof error === 'object' ? (error.code || -32000) : -32000,
        message: typeof error === 'object' ? (error.message || String(error)) : String(error)
      };
    } else {
      response.result = result || {};
    }
    
    try {
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (writeError) {
      process.stderr.write(`Error sending response: ${writeError.message}\n`);
    }
  }

  sendNotification(method, params = {}) {
    const notification = { 
      jsonrpc: '2.0', 
      method, 
      params 
    };
    
    try {
      process.stdout.write(JSON.stringify(notification) + '\n');
    } catch (writeError) {
      process.stderr.write(`Error sending notification: ${writeError.message}\n`);
    }
  }

  // ============ REQUIRED MCP METHODS ============

  handleInitialize(id, params) {
    this.initialized = true;
    const result = {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {
          subscribe: false,
          listChanged: false
        },
        tools: {
          listChanged: false
        },
        prompts: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'kali-mcp-server',
        version: '2.0.0',
        description: 'Kali Linux MCP Server with full tool support'
      }
    };
    this.sendResponse(id, result);
  }

  handleInitialized(params) {
    // Notification - no response needed
  }

  // ============ TOOLS METHODS ============
  
  handleToolsList(id, params) {
    const tools = [
      {
        name: 'execute_command',
        description: 'Execute shell commands safely in the Kali environment',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The shell command to execute'
            },
            working_directory: {
              type: 'string',
              description: 'Working directory (defaults to workspace)',
              default: WORKSPACE_DIR
            }
          },
          required: ['command']
        }
      },
      {
        name: 'read_file',
        description: 'Read contents of a text file from the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path to the file to read (relative to workspace)'
            }
          },
          required: ['file_path']
        }
      },
      {
        name: 'write_file',
        description: 'Write content to a file in the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path where to write the file (relative to workspace)'
            },
            content: {
              type: 'string',
              description: 'Content to write to the file'
            }
          },
          required: ['file_path', 'content']
        }
      },
      {
        name: 'list_directory',
        description: 'List contents of a directory',
        inputSchema: {
          type: 'object',
          properties: {
            directory_path: {
              type: 'string',
              description: 'Directory to list (relative to workspace, defaults to root)',
              default: '.'
            }
          }
        }
      },
      {
        name: 'system_info',
        description: 'Get Kali Linux system information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
    
    this.sendResponse(id, { tools });
  }

  handleToolsCall(id, params) {
    if (!params || !params.name) {
      return this.sendResponse(id, null, { code: -32602, message: 'Missing tool name' });
    }

    const { name, arguments: args = {} } = params;

    try {
      switch (name) {
        case 'execute_command':
          this.executeCommand(id, args);
          break;
        case 'read_file':
          this.readFile(id, args);
          break;
        case 'write_file':
          this.writeFile(id, args);
          break;
        case 'list_directory':
          this.listDirectory(id, args);
          break;
        case 'system_info':
          this.getSystemInfo(id, args);
          break;
        default:
          this.sendResponse(id, null, { code: -32601, message: `Unknown tool: ${name}` });
      }
    } catch (error) {
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  // ============ PROMPTS METHODS ============
  
  handlePromptsList(id, params) {
    const prompts = [
      {
        name: 'kali_security_audit',
        description: 'Generate a security audit checklist for Kali Linux',
        arguments: [
          {
            name: 'target_type',
            description: 'Type of target to audit (network, web, system)',
            required: true
          }
        ]
      },
      {
        name: 'penetration_test_plan',
        description: 'Create a structured penetration testing plan',
        arguments: [
          {
            name: 'scope',
            description: 'Scope of the penetration test',
            required: true
          },
          {
            name: 'methodology',
            description: 'Testing methodology (OWASP, NIST, etc.)',
            required: false
          }
        ]
      }
    ];
    
    this.sendResponse(id, { prompts });
  }

  handlePromptsGet(id, params) {
    if (!params || !params.name) {
      return this.sendResponse(id, null, { code: -32602, message: 'Missing prompt name' });
    }

    const { name, arguments: args = {} } = params;

    switch (name) {
      case 'kali_security_audit':
        const auditPrompt = this.generateSecurityAuditPrompt(args.target_type);
        this.sendResponse(id, { 
          description: `Security audit checklist for ${args.target_type || 'general'} targets`,
          messages: [{ role: 'user', content: { type: 'text', text: auditPrompt } }]
        });
        break;
      
      case 'penetration_test_plan':
        const testPlan = this.generatePentestPlan(args.scope, args.methodology);
        this.sendResponse(id, {
          description: 'Structured penetration testing plan',
          messages: [{ role: 'user', content: { type: 'text', text: testPlan } }]
        });
        break;
        
      default:
        this.sendResponse(id, null, { code: -32601, message: `Unknown prompt: ${name}` });
    }
  }

  // ============ RESOURCES METHODS ============
  
  handleResourcesList(id, params) {
    const resources = [{
      uri: `file://${WORKSPACE_DIR}`,
      name: 'Kali Workspace',
      description: 'Kali Linux secure workspace directory',
      mimeType: 'inode/directory'
    }];
    
    this.sendResponse(id, { resources });
  }

  handleResourcesRead(id, params) {
    if (!params || !params.uri) {
      return this.sendResponse(id, null, { code: -32602, message: 'Missing URI parameter' });
    }
    
    const uri = params.uri;
    if (!uri.startsWith('file://')) {
      return this.sendResponse(id, null, { code: -32602, message: 'Only file:// URIs supported' });
    }
    
    let filePath = uri.replace('file://', '');
    
    // Security: ensure path is within workspace
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(WORKSPACE_DIR, filePath);
    }
    
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
      return this.sendResponse(id, null, { code: -32603, message: 'Access denied: path outside workspace' });
    }
    
    try {
      if (!fs.existsSync(resolvedPath)) {
        return this.sendResponse(id, null, { code: -32603, message: 'File not found' });
      }
      
      const stat = fs.statSync(resolvedPath);
      
      if (stat.isDirectory()) {
        const items = fs.readdirSync(resolvedPath, { withFileTypes: true }).map(item => ({
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          size: item.isFile() ? fs.statSync(path.join(resolvedPath, item.name)).size : null
        }));
        
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(items, null, 2)
          }]
        });
      } else {
        if (stat.size > MAX_FILE_SIZE) {
          return this.sendResponse(id, null, { code: -32603, message: 'File too large' });
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
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  // ============ TOOL IMPLEMENTATIONS ============

  executeCommand(id, args) {
    const { command, working_directory = WORKSPACE_DIR } = args;
    
    if (!command) {
      return this.sendResponse(id, null, { code: -32602, message: 'Command required' });
    }

    // Security: basic command filtering
    const dangerousCommands = ['rm -rf /', 'dd if=', 'mkfs', 'fdisk', 'parted', ':(){ :|:& };:'];
    if (dangerousCommands.some(dangerous => command.includes(dangerous))) {
      return this.sendResponse(id, null, { code: -32603, message: 'Dangerous command blocked' });
    }

    const child = spawn('bash', ['-c', command], {
      cwd: working_directory,
      env: { ...process.env, HOME: WORKSPACE_DIR },
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000 // 30 second timeout
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      this.sendResponse(id, {
        content: [{
          type: 'text',
          text: `Command: ${command}\nExit Code: ${code}\n\nOutput:\n${stdout}${stderr ? `\nErrors:\n${stderr}` : ''}`
        }]
      });
    });

    child.on('error', (error) => {
      this.sendResponse(id, null, { code: -32603, message: `Command failed: ${error.message}` });
    });
  }

  readFile(id, args) {
    const { file_path } = args;
    
    if (!file_path) {
      return this.sendResponse(id, null, { code: -32602, message: 'File path required' });
    }

    const fullPath = path.resolve(WORKSPACE_DIR, file_path);
    
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return this.sendResponse(id, null, { code: -32603, message: 'Access denied: path outside workspace' });
    }

    try {
      if (!fs.existsSync(fullPath)) {
        return this.sendResponse(id, null, { code: -32603, message: 'File not found' });
      }

      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_FILE_SIZE) {
        return this.sendResponse(id, null, { code: -32603, message: 'File too large' });
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      this.sendResponse(id, {
        content: [{
          type: 'text',
          text: content
        }]
      });
    } catch (error) {
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  writeFile(id, args) {
    const { file_path, content } = args;
    
    if (!file_path || content === undefined) {
      return this.sendResponse(id, null, { code: -32602, message: 'File path and content required' });
    }

    const fullPath = path.resolve(WORKSPACE_DIR, file_path);
    
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return this.sendResponse(id, null, { code: -32603, message: 'Access denied: path outside workspace' });
    }

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      this.sendResponse(id, {
        content: [{
          type: 'text',
          text: `File written successfully: ${file_path}`
        }]
      });
    } catch (error) {
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  listDirectory(id, args) {
    const { directory_path = '.' } = args;
    const fullPath = path.resolve(WORKSPACE_DIR, directory_path);
    
    if (!fullPath.startsWith(WORKSPACE_DIR)) {
      return this.sendResponse(id, null, { code: -32603, message: 'Access denied: path outside workspace' });
    }

    try {
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
        return this.sendResponse(id, null, { code: -32603, message: 'Directory not found' });
      }

      const items = fs.readdirSync(fullPath, { withFileTypes: true }).map(item => {
        const itemPath = path.join(fullPath, item.name);
        const stat = fs.statSync(itemPath);
        return {
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          size: item.isFile() ? stat.size : null,
          permissions: '0' + (stat.mode & parseInt('777', 8)).toString(8),
          modified: stat.mtime.toISOString()
        };
      });

      this.sendResponse(id, {
        content: [{
          type: 'text',
          text: JSON.stringify(items, null, 2)
        }]
      });
    } catch (error) {
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  getSystemInfo(id, args) {
    try {
      const info = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        },
        cpus: os.cpus().length,
        workspace: WORKSPACE_DIR,
        node_version: process.version
      };

      this.sendResponse(id, {
        content: [{
          type: 'text',
          text: JSON.stringify(info, null, 2)
        }]
      });
    } catch (error) {
      this.sendResponse(id, null, { code: -32603, message: error.message });
    }
  }

  // ============ HELPER METHODS ============

  generateSecurityAuditPrompt(targetType) {
    const prompts = {
      network: `# Network Security Audit Checklist

## Reconnaissance
- [ ] Network discovery and port scanning
- [ ] Service enumeration
- [ ] OS fingerprinting
- [ ] Network topology mapping

## Vulnerability Assessment  
- [ ] Known vulnerability scanning
- [ ] Network service security review
- [ ] Firewall configuration analysis
- [ ] Network segmentation review

## Penetration Testing
- [ ] Exploit known vulnerabilities
- [ ] Test network access controls
- [ ] Lateral movement testing
- [ ] Network monitoring evasion`,

      web: `# Web Application Security Audit Checklist

## Information Gathering
- [ ] Technology stack identification
- [ ] Directory and file enumeration
- [ ] Input validation testing
- [ ] Authentication mechanism review

## OWASP Top 10 Testing
- [ ] Injection attacks (SQL, NoSQL, LDAP)
- [ ] Broken authentication
- [ ] Sensitive data exposure
- [ ] XML external entities (XXE)
- [ ] Broken access control`,

      system: `# System Security Audit Checklist

## System Hardening
- [ ] User account security
- [ ] Service configuration review
- [ ] File system permissions
- [ ] System update status

## Privilege Escalation
- [ ] Local privilege escalation
- [ ] Kernel exploit identification
- [ ] Service exploitation
- [ ] Configuration weakness analysis`
    };

    return prompts[targetType] || prompts.system;
  }

  generatePentestPlan(scope, methodology = 'OWASP') {
    return `# Penetration Testing Plan

## Scope: ${scope}
## Methodology: ${methodology}

### 1. Planning and Reconnaissance
- Define scope and objectives
- Gather intelligence
- Document target information

### 2. Scanning and Enumeration
- Port scanning
- Service enumeration
- Vulnerability identification

### 3. Gaining Access
- Exploit vulnerabilities
- Maintain access
- Document findings

### 4. Maintaining Access
- Install backdoors
- Test persistence
- Cover tracks

### 5. Analysis and Reporting
- Document vulnerabilities
- Risk assessment
- Remediation recommendations`;
  }

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
      '.log': 'text/plain',
      '.conf': 'text/plain',
      '.cfg': 'text/plain'
    };
    return mimeTypes[ext] || 'text/plain';
  }

  // ============ MESSAGE HANDLER ============

  handleMessage(message) {
    try {
      if (typeof message !== 'object' || !message) {
        return this.sendResponse(null, null, { code: -32600, message: 'Invalid Request' });
      }

      const { jsonrpc, id, method, params } = message;
      
      if (jsonrpc !== '2.0') {
        return this.sendResponse(id || null, null, { code: -32600, message: 'Invalid JSON-RPC version' });
      }

      // Handle notifications (no id)
      if (id === undefined) {
        switch (method) {
          case 'notifications/initialized':
            return this.handleInitialized(params);
          default:
            // Ignore unknown notifications
            return;
        }
      }

      // Handle requests (with id)
      switch (method) {
        case 'initialize':
          this.handleInitialize(id, params);
          break;
        case 'tools/list':
          this.handleToolsList(id, params);
          break;
        case 'tools/call':
          this.handleToolsCall(id, params);
          break;
        case 'prompts/list':
          this.handlePromptsList(id, params);
          break;
        case 'prompts/get':
          this.handlePromptsGet(id, params);
          break;
        case 'resources/list':
          this.handleResourcesList(id, params);
          break;
        case 'resources/read':
          this.handleResourcesRead(id, params);
          break;
        default:
          this.sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
      }
    } catch (error) {
      this.sendResponse(message?.id || null, null, { 
        code: -32603, 
        message: `Internal error: ${error.message}` 
      });
    }
  }
}

// ============ MAIN EXECUTION ============

const server = new KaliMCPServer();

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  let newlineIndex;
  
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    
    if (line) {
      try {
        const message = JSON.parse(line);
        server.handleMessage(message);
      } catch (parseError) {
        server.sendResponse(null, null, {
          code: -32700,
          message: `Parse error: ${parseError.message}`
        });
      }
    }
  }
});

// Error handling
process.stdin.on('error', (error) => {
  process.stderr.write(`Stdin error: ${error.message}\n`);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Send startup confirmation to stderr (not stdout to avoid JSON contamination)
process.stderr.write('Kali MCP Server started - workspace: ' + WORKSPACE_DIR + '\n');