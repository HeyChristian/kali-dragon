#!/usr/bin/env python3
"""
Test GUI functionality on macOS
"""

import tkinter as tk
from tkinter import messagebox
import sys
import os

def test_gui():
    print("🔍 Testing GUI functionality on macOS...")
    
    try:
        # Create root window
        root = tk.Tk()
        root.withdraw()  # Hide initially
        
        print("✅ Tkinter imported successfully")
        print("✅ Root window created")
        
        # Test basic window
        root.deiconify()  # Show window
        root.title("🐉 Kali Dragon - GUI Test")
        root.geometry("400x300")
        
        # Force to front on macOS
        root.lift()
        root.call('wm', 'attributes', '.', '-topmost', True)
        root.after_idle(root.call, 'wm', 'attributes', '.', '-topmost', False)
        
        # Add content
        label = tk.Label(
            root, 
            text="🐉 Can you see this window?\n\nKali Dragon GUI Test",
            font=("Arial", 16, "bold"),
            fg="purple"
        )
        label.pack(expand=True)
        
        # Test messagebox
        def show_message():
            messagebox.showinfo("Success!", "GUI is working! 🎉")
            root.quit()
            
        button = tk.Button(
            root,
            text="Click me if you can see this!",
            command=show_message,
            font=("Arial", 12, "bold"),
            bg="lightgreen",
            padx=20,
            pady=10
        )
        button.pack(pady=20)
        
        # Auto close after 10 seconds
        root.after(10000, root.quit)
        
        print("✅ Window should be visible now...")
        print("⏱️  Will auto-close in 10 seconds or click the button")
        
        # Start GUI
        root.mainloop()
        
        print("✅ GUI test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ GUI Error: {e}")
        return False

if __name__ == "__main__":
    success = test_gui()
    if success:
        print("\n🎉 GUI functionality confirmed!")
    else:
        print("\n❌ GUI has issues on this system")
        
    sys.exit(0 if success else 1)