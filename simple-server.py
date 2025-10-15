#!/usr/bin/env python3
"""
Ultra simple server that WILL show the port
"""
import http.server
import socketserver
import sys
import os

def main():
    # Force output immediately
    print("🐉 KALI DRAGON - Simple Web Server", flush=True)
    print("=" * 50, flush=True)
    
    # Try different ports
    for port in [8000, 8080, 8888, 9000]:
        try:
            print(f"🔍 Trying port {port}...", flush=True)
            
            with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
                actual_port = httpd.server_address[1]
                url = f"http://localhost:{actual_port}"
                
                print(f"", flush=True)
                print(f"🔥 SUCCESS! Server started on port {actual_port}", flush=True)
                print(f"🌐 OPEN YOUR BROWSER TO: {url}", flush=True)
                print(f"📱 URL to copy: {url}", flush=True)
                print(f"", flush=True)
                print(f"⏹️  Press Ctrl+C to stop server", flush=True)
                print(f"", flush=True)
                
                # Force all output to display
                sys.stdout.flush()
                sys.stderr.flush()
                
                # Start server
                httpd.serve_forever()
                break
                
        except OSError as e:
            print(f"❌ Port {port} busy: {e}", flush=True)
            continue
        except KeyboardInterrupt:
            print(f"\n🐉 Server stopped!", flush=True)
            break
        except Exception as e:
            print(f"❌ Error: {e}", flush=True)
            continue
    else:
        print("❌ Could not find free port!", flush=True)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🐉 Server stopped!", flush=True)