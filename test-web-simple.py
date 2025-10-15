#!/usr/bin/env python3
"""
Prueba simple de servidor web para Kali Dragon
"""
import http.server
import socketserver
import sys

def main():
    print("🐉 Testing Kali Dragon Web Server")
    print("=" * 40)
    
    port = 8000
    
    try:
        # Simple server test
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"✅ Server started on port {port}")
            print(f"🌐 Open browser to: http://localhost:{port}")
            print("📱 Press Ctrl+C to stop")
            print("\n🚀 Server is running...")
            httpd.serve_forever()
    except OSError as e:
        print(f"❌ Port {port} is busy, trying {port + 1}")
        port = port + 1
        try:
            with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
                print(f"✅ Server started on port {port}")
                print(f"🌐 Open browser to: http://localhost:{port}")
                httpd.serve_forever()
        except Exception as e:
            print(f"❌ Server error: {e}")
    except KeyboardInterrupt:
        print("\n🐉 Server stopped!")

if __name__ == "__main__":
    main()