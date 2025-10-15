#!/usr/bin/env python3
"""
Debug script that writes to file
"""
import sys
import os

# Write to file
with open('debug-output.txt', 'w') as f:
    f.write("🐉 KALI DRAGON DEBUG OUTPUT\n")
    f.write("=" * 40 + "\n")
    f.write(f"Python version: {sys.version}\n")
    f.write(f"Python executable: {sys.executable}\n")
    f.write(f"Current directory: {os.getcwd()}\n")
    f.write("✅ Python is working correctly!\n")

print("Debug info written to debug-output.txt")