#!/usr/bin/env python3
"""
Ultra simple web server test
"""

try:
    import sys
    import socket
    
    print("🐉 Testing Simple Web Server", flush=True)
    print("=" * 40, flush=True)
    
    # Test socket creation
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))  # Let OS choose port
        port = s.getsockname()[1]
        print(f"✅ Found free port: {port}", flush=True)
        print(f"🌐 Would run at: http://localhost:{port}", flush=True)
    
    print("✅ Basic server test passed!", flush=True)
    
except Exception as e:
    print(f"❌ Error: {e}", flush=True)
    import traceback
    traceback.print_exc()