#!/usr/bin/env python3
"""
🐉 KALI DRAGON GUI - Simple Version that works on macOS
"""

import tkinter as tk
from tkinter import ttk, messagebox
import webbrowser
import platform
import sys

class SimpleKaliDragonGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🐉 Kali Dragon - The Ultimate MCP Tool")
        
        # Force window to front on macOS
        self.root.lift()
        self.root.attributes('-topmost', True)
        self.root.after_idle(self.root.attributes, '-topmost', False)
        
        # Center window and set size
        self.center_window(600, 500)
        
        # Set minimum size
        self.root.minsize(500, 400)
        
        # Create GUI
        self.create_gui()
        
        # Focus window
        self.root.focus_force()
        
    def center_window(self, width, height):
        """Center the window on screen"""
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
    def create_gui(self):
        """Create the GUI elements"""
        
        # Main frame with padding
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header
        header_label = tk.Label(
            main_frame, 
            text="🐉 KALI DRAGON",
            font=("Arial", 24, "bold"),
            fg="#8B00FF"
        )
        header_label.pack(pady=(0, 10))
        
        subtitle_label = tk.Label(
            main_frame,
            text="The Ultimate Kali Linux MCP Tool",
            font=("Arial", 14),
            fg="#4B0082"
        )
        subtitle_label.pack(pady=(0, 20))
        
        # System info
        system_label = tk.Label(
            main_frame,
            text=f"Running on {platform.system()} {platform.release()}",
            font=("Arial", 10),
            fg="gray"
        )
        system_label.pack(pady=(0, 30))
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.pack(expand=True, fill=tk.BOTH)
        
        # Configure grid
        buttons_frame.columnconfigure(0, weight=1)
        
        # Button style
        button_style = {
            'width': 40,
            'font': ('Arial', 12, 'bold'),
            'pady': 10
        }
        
        # Buttons
        buttons = [
            ("🚀 Full Setup Wizard", "Complete automated installation", self.setup_wizard),
            ("📚 Setup Guide", "Step-by-step installation guide", self.show_guide),
            ("🌐 Open Important Websites", "Quick access to download sites", self.open_websites),
            ("🔧 System Check", "Check system requirements", self.system_check),
            ("❓ Help", "Get help and information", self.show_help),
            ("🚪 Exit", "Close Kali Dragon", self.exit_app)
        ]
        
        for i, (text, tooltip, command) in enumerate(buttons):
            btn = tk.Button(
                buttons_frame,
                text=text,
                command=command,
                bg="#f0f0f0" if i % 2 == 0 else "#e8e8e8",
                relief="raised",
                **button_style
            )
            btn.grid(row=i, column=0, pady=8, sticky="ew")
            
            # Add tooltip (simple)
            self.add_tooltip(btn, tooltip)
            
        # Status bar
        self.status_var = tk.StringVar(value="Ready to unleash the Dragon! 🐉")
        status_label = tk.Label(
            main_frame,
            textvariable=self.status_var,
            font=("Arial", 10),
            fg="green"
        )
        status_label.pack(side=tk.BOTTOM, pady=(20, 0))
        
    def add_tooltip(self, widget, text):
        """Add simple tooltip to widget"""
        def on_enter(event):
            self.status_var.set(text)
            
        def on_leave(event):
            self.status_var.set("Ready to unleash the Dragon! 🐉")
            
        widget.bind("<Enter>", on_enter)
        widget.bind("<Leave>", on_leave)
        
    def setup_wizard(self):
        """Setup wizard - placeholder"""
        messagebox.showinfo(
            "Setup Wizard",
            "🚀 Full Setup Wizard\n\nThis will be the complete automated setup.\nComing in the next update!"
        )
        
    def show_guide(self):
        """Show setup guide window"""
        guide_window = tk.Toplevel(self.root)
        guide_window.title("📚 Kali Dragon Setup Guide")
        guide_window.geometry("700x500")
        guide_window.transient(self.root)
        
        # Center the window
        guide_window.grab_set()
        
        # Content frame
        content_frame = ttk.Frame(guide_window, padding="20")
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = tk.Label(
            content_frame,
            text="📚 Setup Guide for Beginners",
            font=("Arial", 16, "bold"),
            fg="#4B0082"
        )
        title_label.pack(pady=(0, 20))
        
        # Guide text
        guide_text = tk.Text(
            content_frame,
            wrap=tk.WORD,
            font=("Arial", 11),
            padx=10,
            pady=10
        )
        guide_text.pack(fill=tk.BOTH, expand=True)
        
        guide_content = """🐉 Welcome, Future Dragon Master!

📱 STEP 1: Install UTM (Virtual Machine)
• Visit: https://mac.getutm.app/
• Download from Mac App Store (recommended) or direct download
• UTM provides excellent Apple Silicon support

🐧 STEP 2: Download and Setup Kali Linux  
• Visit: https://www.kali.org/get-kali/
• Download: Kali Linux 64-Bit (Installer)
• Create VM in UTM with 4GB RAM, 64GB storage

🔧 STEP 3: Configure VM Network
• Use 'Shared Network' in UTM settings
• Enable SSH in Kali: sudo systemctl enable ssh
• Find VM IP: ip addr show

🐳 STEP 4: Install Docker (OrbStack Recommended)
• Visit: https://orbstack.dev/
• OrbStack is faster and uses less resources
• Perfect for Dragon containers

🤖 STEP 5: Install Claude Desktop
• Visit: https://claude.ai/desktop
• Download and install Claude Desktop
• Sign in with your Anthropic account

🚀 STEP 6: Run Kali Dragon
• Execute the setup wizard
• Provide SSH credentials when prompted
• Enjoy your legendary pentesting workspace!

⚠️ IMPORTANT: Always hack ethically and responsibly!
Only test systems you own or have explicit permission to test."""
        
        guide_text.insert(tk.END, guide_content)
        guide_text.config(state=tk.DISABLED)
        
        # Buttons frame
        btn_frame = ttk.Frame(content_frame)
        btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        # Open links button
        open_btn = tk.Button(
            btn_frame,
            text="🌐 Open All Setup Links",
            command=self.open_all_links,
            font=("Arial", 10, "bold"),
            bg="#007bff",
            fg="white",
            padx=20
        )
        open_btn.pack(side=tk.LEFT)
        
        # Close button
        close_btn = tk.Button(
            btn_frame,
            text="✅ Close",
            command=guide_window.destroy,
            font=("Arial", 10, "bold"),
            bg="#28a745",
            fg="white",
            padx=20
        )
        close_btn.pack(side=tk.RIGHT)
        
    def open_websites(self):
        """Open important websites"""
        self.status_var.set("Opening websites...")
        self.open_all_links()
        
    def open_all_links(self):
        """Open all setup links"""
        links = [
            "https://mac.getutm.app/",
            "https://www.kali.org/get-kali/", 
            "https://orbstack.dev/",
            "https://claude.ai/desktop"
        ]
        
        for link in links:
            webbrowser.open(link)
            
        self.status_var.set("✅ All websites opened in your browser!")
        
    def system_check(self):
        """Check system requirements"""
        import subprocess
        
        checks = []
        
        # Check Python
        checks.append(f"✅ Python: {sys.version.split()[0]}")
        
        # Check if Docker is available
        try:
            subprocess.run(["docker", "--version"], capture_output=True, check=True)
            checks.append("✅ Docker: Available")
        except:
            checks.append("❌ Docker: Not found (install OrbStack or Docker Desktop)")
            
        # Check system
        checks.append(f"✅ OS: {platform.system()} {platform.release()}")
        
        messagebox.showinfo("System Check", "\n".join(checks))
        
    def show_help(self):
        """Show help information"""
        help_text = """🐉 KALI DRAGON HELP

This is the Ultimate Kali Linux MCP Tool!

WHAT IT DOES:
• Automates Kali Linux MCP server setup
• Connects your Kali VM to Claude Desktop
• Provides secure SSH-based access
• Creates comprehensive pentesting workspace

HOW TO USE:
1. Follow the Setup Guide
2. Run the Setup Wizard
3. Provide your Kali VM credentials
4. Enjoy your Dragon-powered workspace!

SUPPORT:
• Check system requirements first
• Follow setup guide step by step  
• Make sure your Kali VM is running
• Ensure SSH is enabled on Kali

Happy Ethical Hacking! 🐉⚔️"""

        messagebox.showinfo("Help", help_text)
        
    def exit_app(self):
        """Exit the application"""
        if messagebox.askyesno("Exit Dragon", "Are you sure you want to quit Kali Dragon?"):
            self.status_var.set("Thanks for using Kali Dragon! 🐉")
            self.root.quit()

def main():
    """Main function"""
    try:
        root = tk.Tk()
        app = SimpleKaliDragonGUI(root)
        
        # Start the GUI
        root.mainloop()
        
    except Exception as e:
        print(f"❌ GUI Error: {e}")
        print("Falling back to terminal interface...")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main())