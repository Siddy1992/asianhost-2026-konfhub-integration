#!/usr/bin/env python3
"""Run the AsianHOST static website locally for editing and preview."""
from __future__ import annotations
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

def main():
    parser = argparse.ArgumentParser(description="Launch AsianHOST 2026 locally.")
    parser.add_argument("--port", type=int, default=8000, help="Preferred port (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(folder))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError:
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    url = f"http://127.0.0.1:{server.server_port}/"
    print("\nAsianHOST 2026 local website is running.")
    print(f"Open: {url}")
    print("Edit HTML, CSS and JS files, then refresh your browser to preview changes.")
    print("Press Ctrl+C to stop. This is a local preview, not a payment-verification server.\n")
    if not args.no_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local preview...")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
