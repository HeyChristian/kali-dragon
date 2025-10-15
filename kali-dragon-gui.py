#!/usr/bin/env python3
"""
🐉 KALI DRAGON GUI - Cross-platform GUI for Kali Dragon
Works on macOS, Windows, and Linux with built-in tkinter
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import sys
import os
import platform
import webbrowser
from pathlib import Path

class KaliDragonGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🐉 Kali Dragon - The Ultimate MCP Tool")
        self.root.geometry("800x600")
        
        # Set icon and styling based on OS
        self.setup_styling()
        
        # Main container
        main_frame = ttk.Frame(root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        self.create_header(main_frame)
        self.create_menu_buttons(main_frame)
        self.create_output_area(main_frame)
        self.create_status_bar(main_frame)
        
    def setup_styling(self):
        """Setup OS-specific styling"""
        style = ttk.Style()
        
        # Try to use native themes
        if platform.system() == "Darwin":  # macOS
            try:
                style.theme_use("aqua")
            except:
                style.theme_use("default")
        elif platform.system() == "Windows":
            try:
                style.theme_use("vista")
            except:
                style.theme_use("default")
        
        # Custom styling
        style.configure("Dragon.TLabel", font=("Arial", 16, "bold"))
        style.configure("Title.TLabel", font=("Arial", 12, "bold"))
        style.configure("Dragon.TButton", font=("Arial", 10, "bold"))
        
    def create_header(self, parent):
        """Create the header with dragon logo"""
        header_frame = ttk.Frame(parent)
        header_frame.grid(row=0, column=0, columnspan=2, pady=(0, 20), sticky=(tk.W, tk.E))
        
        # Dragon title
        title_label = ttk.Label(
            header_frame, 
            text="🐉 KALI DRAGON",
            style="Dragon.TLabel",
            foreground="#8B00FF"
        )
        title_label.grid(row=0, column=0, pady=5)
        
        subtitle_label = ttk.Label(
            header_frame,
            text="The Ultimate Kali Linux MCP Tool",
            style="Title.TLabel",
            foreground="#4B0082"
        )
        subtitle_label.grid(row=1, column=0, pady=5)
        
        # System info
        system_info = f"Running on {platform.system()} {platform.release()}"
        info_label = ttk.Label(header_frame, text=system_info, font=("Arial", 9))
        info_label.grid(row=2, column=0, pady=5)
        
    def create_menu_buttons(self, parent):
        """Create the main menu buttons"""
        menu_frame = ttk.LabelFrame(parent, text="Dragon Options", padding="15")
        menu_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N), padx=(0, 10))
        
        # Button configurations
        buttons = [
            ("🚀 Full Setup Wizard", "Complete automated installation", self.run_wizard, "#28a745"),
            ("🔧 Repair/Fix", "Fix existing configuration issues", self.run_repair, "#007bff"),
            ("🧹 Clean/Reset", "Remove all configurations and start fresh", self.run_clean, "#dc3545"),
            ("📚 Setup Guide", "Install UTM and Kali Linux (for beginners)", self.run_guide, "#6f42c1"),
            ("❓ Help", "Show detailed help and documentation", self.run_help, "#17a2b8"),
            ("🌐 Open Websites", "Quick access to important sites", self.show_websites, "#fd7e14"),
        ]
        
        for i, (text, tooltip, command, color) in enumerate(buttons):
            btn = ttk.Button(
                menu_frame,
                text=text,
                command=command,
                style="Dragon.TButton",
                width=25
            )
            btn.grid(row=i, column=0, pady=8, padx=5, sticky=(tk.W, tk.E))
            
            # Add tooltip
            self.create_tooltip(btn, tooltip)
            
        # Exit button
        exit_btn = ttk.Button(
            menu_frame,
            text="🚪 Exit Dragon",
            command=self.exit_app,
            style="Dragon.TButton",
            width=25
        )
        exit_btn.grid(row=len(buttons), column=0, pady=15, padx=5, sticky=(tk.W, tk.E))
        
    def create_output_area(self, parent):
        """Create the output/log area"""
        output_frame = ttk.LabelFrame(parent, text="Dragon Output", padding="10")
        output_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        # Configure grid
        output_frame.columnconfigure(0, weight=1)
        output_frame.rowconfigure(0, weight=1)
        
        # Text area with scrollbar
        self.output_text = scrolledtext.ScrolledText(
            output_frame,
            wrap=tk.WORD,
            width=50,
            height=25,
            font=("Consolas", 10),
            bg="#f8f9fa",
            fg="#212529"
        )
        self.output_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Welcome message
        self.log_message("🐉 Welcome to Kali Dragon GUI!")
        self.log_message("Ready to automate your Kali Linux MCP setup.")
        self.log_message("Select an option from the menu to get started.")
        self.log_message("=" * 50)
        
    def create_status_bar(self, parent):
        """Create status bar"""
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        
        status_frame = ttk.Frame(parent)
        status_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(10, 0))
        
        status_label = ttk.Label(status_frame, text="Status:")
        status_label.grid(row=0, column=0, padx=(0, 10))
        
        status_value = ttk.Label(status_frame, textvariable=self.status_var, foreground="#28a745")
        status_value.grid(row=0, column=1)
        
        # Progress bar
        self.progress = ttk.Progressbar(status_frame, mode='indeterminate')
        self.progress.grid(row=0, column=2, padx=(20, 0), sticky=(tk.W, tk.E))
        status_frame.columnconfigure(2, weight=1)
        
    def create_tooltip(self, widget, text):
        """Create tooltip for widget"""
        def on_enter(event):
            tooltip = tk.Toplevel()
            tooltip.wm_overrideredirect(True)
            tooltip.wm_geometry(f"+{event.x_root+10}+{event.y_root+10}")
            
            label = ttk.Label(tooltip, text=text, background="#ffffe0", 
                             relief="solid", borderwidth=1, font=("Arial", 9))
            label.pack()
            
            widget.tooltip = tooltip
            
        def on_leave(event):
            if hasattr(widget, 'tooltip'):
                widget.tooltip.destroy()
                del widget.tooltip
                
        widget.bind("<Enter>", on_enter)
        widget.bind("<Leave>", on_leave)
    
    def log_message(self, message):
        """Add message to output area"""
        self.output_text.insert(tk.END, f"{message}\n")
        self.output_text.see(tk.END)
        self.root.update()
        
    def run_script_command(self, command, description):
        """Run a kali-dragon command"""
        self.status_var.set(f"Running {description}...")
        self.progress.start(10)
        self.log_message(f"\n🐉 {description}")
        self.log_message("-" * 40)
        
        try:
            # Get script path
            script_path = Path(__file__).parent / "kali-dragon.sh"
            
            if not script_path.exists():
                self.log_message("❌ Error: kali-dragon.sh not found!")
                self.log_message("Make sure kali-dragon.sh is in the same directory as this GUI.")
                return
                
            # Run command
            if platform.system() == "Windows":
                # On Windows, we might need different handling
                cmd = ["bash", str(script_path), command] if command else ["bash", str(script_path)]
            else:
                cmd = [str(script_path), command] if command else [str(script_path)]
            
            self.log_message(f"Executing: {' '.join(cmd)}")
            
            # For now, show placeholder message
            self.log_message(f"✅ {description} functionality ready!")
            self.log_message("Note: Full CLI integration coming in next update.")
            
        except Exception as e:
            self.log_message(f"❌ Error: {str(e)}")
        finally:
            self.progress.stop()
            self.status_var.set("Ready")
            
    def run_wizard(self):
        """Run full setup wizard"""
        self.run_script_command("--wizard", "Full Setup Wizard")
        
    def run_repair(self):
        """Run repair function"""
        self.run_script_command("--repair", "Repair/Fix Configuration")
        
    def run_clean(self):
        """Run clean function"""
        result = messagebox.askyesno(
            "Clean Confirmation",
            "This will remove ALL Kali Dragon configurations.\nAre you sure you want to continue?"
        )
        if result:
            self.run_script_command("--clean", "Clean/Reset All Configurations")
            
    def run_guide(self):
        """Show setup guide"""
        self.show_setup_guide()
        
    def run_help(self):
        """Show help"""
        self.run_script_command("--help", "Help & Documentation")
        
    def show_websites(self):
        """Show quick access to websites"""
        sites_window = tk.Toplevel(self.root)
        sites_window.title("🌐 Quick Access - Important Sites")
        sites_window.geometry("500x400")
        sites_window.transient(self.root)
        
        frame = ttk.Frame(sites_window, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="🌐 Quick Access Links", font=("Arial", 14, "bold")).pack(pady=(0, 20))
        
        sites = [
            ("📱 UTM for macOS", "https://mac.getutm.app/"),
            ("🐧 Kali Linux Downloads", "https://www.kali.org/get-kali/"),
            ("🐳 OrbStack (Docker Alternative)", "https://orbstack.dev/"),
            ("🤖 Claude Desktop", "https://claude.ai/desktop"),
            ("🔗 Model Context Protocol", "https://modelcontextprotocol.io/"),
            ("📚 Docker Desktop", "https://www.docker.com/products/docker-desktop/")
        ]
        
        for name, url in sites:
            btn = ttk.Button(
                frame,
                text=name,
                command=lambda u=url: self.open_url(u),
                width=40
            )
            btn.pack(pady=5, fill=tk.X)
            
    def show_setup_guide(self):
        """Show interactive setup guide"""
        guide_window = tk.Toplevel(self.root)
        guide_window.title("📚 Kali Dragon Setup Guide")
        guide_window.geometry("600x500")
        guide_window.transient(self.root)
        
        frame = ttk.Frame(guide_window, padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="📚 Dragon Setup Guide", font=("Arial", 14, "bold")).pack(pady=(0, 20))
        
        guide_text = scrolledtext.ScrolledText(frame, wrap=tk.WORD, height=20, width=70)
        guide_text.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        guide_content = """
🐉 Welcome, Future Dragon Master!

This guide will help you set up everything from scratch:

📱 STEP 1: Install UTM (Virtual Machine)
• Visit: https://mac.getutm.app/
• Option 1: Mac App Store (recommended)
• Option 2: Direct download (free)
• UTM provides excellent Apple Silicon support

🐧 STEP 2: Download and Setup Kali Linux
• Visit: https://www.kali.org/get-kali/
• Download: Kali Linux 64-Bit (Installer)
• Size: ~3.6 GB (be patient!)
• Create VM in UTM with 4GB RAM, 64GB storage

🔧 STEP 3: Configure VM Network Settings
• Use 'Shared Network' in UTM settings
• Enable SSH in Kali: sudo systemctl enable ssh
• Find VM IP: ip addr show
• Test from Mac: ping <kali-ip>

🐳 STEP 4: Install Docker (OrbStack Recommended)
• Visit: https://orbstack.dev/
• OrbStack is 2x faster than Docker Desktop
• Uses less memory and battery
• Perfect for Dragon containers

🤖 STEP 5: Install Claude Desktop
• Visit: https://claude.ai/desktop
• Download and install Claude Desktop
• Sign in with your Anthropic account

🚀 STEP 6: Run Kali Dragon
• Execute: ./kali-dragon.sh
• Select 'Full Setup Wizard'
• Provide SSH credentials when prompted
• Enjoy your legendary pentesting workspace!

⚠️  IMPORTANT: Always hack ethically and responsibly!
Only test systems you own or have explicit permission to test.

Happy Dragon Mastery! 🐉⚔️
"""
        
        guide_text.insert(tk.END, guide_content)
        guide_text.config(state=tk.DISABLED)
        
        # Buttons
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(btn_frame, text="🌐 Open All Links", 
                  command=self.open_all_setup_links).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(btn_frame, text="✅ Close", 
                  command=guide_window.destroy).pack(side=tk.RIGHT)
    
    def open_all_setup_links(self):
        """Open all setup-related websites"""
        links = [
            "https://mac.getutm.app/",
            "https://www.kali.org/get-kali/",
            "https://orbstack.dev/",
            "https://claude.ai/desktop"
        ]
        for link in links:
            webbrowser.open(link)
        self.log_message("🌐 Opened all setup links in your browser!")
        
    def open_url(self, url):
        """Open URL in browser"""
        webbrowser.open(url)
        self.log_message(f"🌐 Opened: {url}")
        
    def exit_app(self):
        """Exit application"""
        result = messagebox.askyesno("Exit Dragon", "Are you sure you want to quit Kali Dragon?")
        if result:
            self.log_message("🐉 Thanks for using Kali Dragon!")
            self.root.destroy()

def main():
    """Main function"""
    # Check if Python tkinter is available
    try:
        import tkinter as tk
    except ImportError:
        print("❌ Error: tkinter not available!")
        print("Please install Python with tkinter support.")
        sys.exit(1)
    
    # Create and run GUI
    root = tk.Tk()
    app = KaliDragonGUI(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("\n🐉 Kali Dragon GUI closed by user")
        sys.exit(0)

if __name__ == "__main__":
    main()