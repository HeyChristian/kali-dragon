#!/usr/bin/env python3
"""
Debug version to see what's happening
"""
import sys
import socket

def find_free_port():
    """Find a free port"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        port = s.getsockname()[1]
        return port

def main():
    print("🔍 DEBUGGING KALI DRAGON WEB SERVER")
    print("=" * 50)
    
    # Test Python version
    print(f"✅ Python version: {sys.version}")
    print(f"✅ Python executable: {sys.executable}")
    
    # Test port finding
    try:
        port = find_free_port()
        print(f"✅ Found free port: {port}")
        print(f"🌐 Would start server at: http://localhost:{port}")
    except Exception as e:
        print(f"❌ Port error: {e}")
    
    # Test socket creation
    try:
        import http.server
        import socketserver
        print("✅ HTTP server modules available")
        
        # Try to create server (but don't start it)
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"✅ Server can be created on port {port}")
            actual_port = httpd.server_address[1]
            print(f"✅ Server address: {httpd.server_address}")
            print(f"✅ Actual port: {actual_port}")
            
    except Exception as e:
        print(f"❌ Server creation error: {e}")
    
    print("\n🚀 Debug complete!")

if __name__ == "__main__":
    main()