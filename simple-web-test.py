#!/usr/bin/env python3
"""
Simple test of web server functionality
"""
import http.server
import socketserver
import threading
import time
import webbrowser

def start_server():
    port = 8000
    try:
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"🔥 Server running at http://localhost:{port}")
            print(f"📱 Open your browser to: http://localhost:{port}")
            print("⏱️  Server will run for 30 seconds...")
            
            # Run for 30 seconds
            def stop_server():
                time.sleep(30)
                httpd.shutdown()
            
            stop_thread = threading.Thread(target=stop_server)
            stop_thread.daemon = True
            stop_thread.start()
            
            httpd.serve_forever()
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🐉 Simple Web Server Test")
    print("=" * 30)
    start_server()
    print("✅ Server stopped")