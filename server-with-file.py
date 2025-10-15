#!/usr/bin/env python3
"""
Server that writes port info to file
"""
import http.server
import socketserver
import sys
import os
import signal
import time

def main():
    # Try to find free port
    port = 8000
    for try_port in [8000, 8080, 8888, 9000, 3000, 5000]:
        try:
            with socketserver.TCPServer(("", try_port), http.server.SimpleHTTPRequestHandler) as httpd:
                port = httpd.server_address[1]
                url = f"http://localhost:{port}"
                
                # Write info to file
                with open('server-info.txt', 'w') as f:
                    f.write(f"🐉 KALI DRAGON WEB SERVER\n")
                    f.write(f"=" * 40 + "\n")
                    f.write(f"✅ Server started successfully!\n")
                    f.write(f"🔥 Port: {port}\n")
                    f.write(f"🌐 URL: {url}\n")
                    f.write(f"📱 Open your browser to: {url}\n")
                    f.write(f"⏹️  Server is running...\n")
                
                # Also print to stdout (might work)
                print(f"🔥 Server running on port {port}", flush=True)
                print(f"🌐 URL: {url}", flush=True)
                
                # Handle Ctrl+C gracefully
                def signal_handler(sig, frame):
                    with open('server-info.txt', 'a') as f:
                        f.write(f"🛑 Server stopped by user\n")
                    sys.exit(0)
                
                signal.signal(signal.SIGINT, signal_handler)
                signal.signal(signal.SIGTERM, signal_handler)
                
                # Run server
                httpd.serve_forever()
                break
                
        except OSError:
            continue  # Try next port
        except Exception as e:
            with open('server-error.txt', 'w') as f:
                f.write(f"❌ Server error: {e}\n")
            break

if __name__ == "__main__":
    main()