#!/usr/bin/env python3
"""
🐉 KALI DRAGON - Hybrid GUI/CLI Version
Automatically detects if GUI is possible, otherwise uses CLI
"""

import sys
import os
import webbrowser
import platform
import subprocess

def can_use_gui():
    """Test if GUI is actually possible"""
    try:
        import tkinter as tk
        # Try to create a test window
        test_root = tk.Tk()
        test_root.withdraw()  # Hide immediately
        test_root.destroy()   # Clean up
        return True
    except Exception:
        return False

def run_cli_interface():
    """Run the CLI interface"""
    print("\n🐉 KALI DRAGON - CLI Interface")
    print("═" * 50)
    print(f"Running on {platform.system()} {platform.release()}")
    print("═" * 50)
    
    while True:
        print("\n📋 Main Menu:")
        print("1. 🚀 Full Setup Wizard")
        print("2. 📚 Setup Guide")  
        print("3. 🌐 Open Important Websites")
        print("4. 🔧 System Check")
        print("5. ❓ Help")
        print("6. 🚪 Exit")
        
        try:
            choice = input("\n🐉 Select option (1-6): ").strip()
            
            if choice == "1":
                print("\n🚀 Full Setup Wizard")
                print("Coming in the next update!")
                input("\nPress Enter to continue...")
                
            elif choice == "2":
                show_setup_guide_cli()
                
            elif choice == "3":
                open_websites()
                print("✅ All websites opened in your browser!")
                input("\nPress Enter to continue...")
                
            elif choice == "4":
                system_check()
                input("\nPress Enter to continue...")
                
            elif choice == "5":
                show_help_cli()
                
            elif choice == "6":
                print("\n🐉 Thanks for using Kali Dragon!")
                break
                
            else:
                print("❌ Invalid option. Please select 1-6.")
                
        except KeyboardInterrupt:
            print("\n\n🐉 Thanks for using Kali Dragon!")
            break
        except EOFError:
            print("\n\n🐉 Thanks for using Kali Dragon!")
            break

def show_setup_guide_cli():
    """Show setup guide in CLI"""
    print("\n📚 Setup Guide for Beginners")
    print("═" * 50)
    
    guide_content = """
🐉 Welcome, Future Dragon Master!

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
Only test systems you own or have explicit permission to test.
"""
    
    print(guide_content)
    
    while True:
        choice = input("\nOptions: [o]pen websites, [b]ack to menu: ").lower().strip()
        if choice in ['o', 'open']:
            open_websites()
            print("✅ All websites opened!")
            break
        elif choice in ['b', 'back', '']:
            break
        else:
            print("Invalid option. Type 'o' or 'b'")

def open_websites():
    """Open all setup websites"""
    links = [
        "https://mac.getutm.app/",
        "https://www.kali.org/get-kali/", 
        "https://orbstack.dev/",
        "https://claude.ai/desktop"
    ]
    
    print("\n🌐 Opening websites...")
    for link in links:
        print(f"  • {link}")
        try:
            webbrowser.open(link)
        except:
            print(f"    ❌ Could not open {link}")
    
def system_check():
    """Check system requirements"""
    print("\n🔧 System Check")
    print("═" * 30)
    
    checks = []
    
    # Check Python
    checks.append(f"✅ Python: {sys.version.split()[0]}")
    
    # Check if Docker is available
    try:
        result = subprocess.run(["docker", "--version"], capture_output=True, check=True)
        checks.append("✅ Docker: Available")
    except:
        checks.append("❌ Docker: Not found (install OrbStack or Docker Desktop)")
        
    # Check system
    checks.append(f"✅ OS: {platform.system()} {platform.release()}")
    
    # Check GUI capability
    if can_use_gui():
        checks.append("✅ GUI: Available")
    else:
        checks.append("⚠️ GUI: Limited (using CLI mode)")
    
    for check in checks:
        print(check)

def show_help_cli():
    """Show help in CLI"""
    help_text = """
🐉 KALI DRAGON HELP
═══════════════════

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

Happy Ethical Hacking! 🐉⚔️
"""
    print(help_text)
    input("\nPress Enter to continue...")

def run_gui_interface():
    """Run the GUI interface"""
    try:
        import tkinter as tk
        from tkinter import ttk, messagebox
        
        class KaliDragonGUI:
            def __init__(self, root):
                self.root = root
                self.root.title("🐉 Kali Dragon - The Ultimate MCP Tool")
                
                # Force window to front on macOS
                self.root.lift()
                self.root.attributes('-topmost', True)
                self.root.after_idle(self.root.attributes, '-topmost', False)
                
                # Center window and set size
                self.center_window(600, 500)
                self.root.minsize(500, 400)
                
                # Create GUI
                self.create_gui()
                self.root.focus_force()
                
            def center_window(self, width, height):
                screen_width = self.root.winfo_screenwidth()
                screen_height = self.root.winfo_screenheight()
                x = (screen_width - width) // 2
                y = (screen_height - height) // 2
                self.root.geometry(f"{width}x{height}+{x}+{y}")
                
            def create_gui(self):
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
                buttons_frame.columnconfigure(0, weight=1)
                
                # Buttons
                buttons = [
                    ("🚀 Full Setup Wizard", self.setup_wizard),
                    ("📚 Setup Guide", self.show_guide),
                    ("🌐 Open Important Websites", self.open_websites),
                    ("🔧 System Check", self.system_check),
                    ("❓ Help", self.show_help),
                    ("🚪 Exit", self.exit_app)
                ]
                
                for i, (text, command) in enumerate(buttons):
                    btn = tk.Button(
                        buttons_frame,
                        text=text,
                        command=command,
                        bg="#f0f0f0" if i % 2 == 0 else "#e8e8e8",
                        relief="raised",
                        width=40,
                        font=('Arial', 12, 'bold'),
                        pady=10
                    )
                    btn.grid(row=i, column=0, pady=8, sticky="ew")
                
                # Status bar
                self.status_var = tk.StringVar(value="Ready to unleash the Dragon! 🐉")
                status_label = tk.Label(
                    main_frame,
                    textvariable=self.status_var,
                    font=("Arial", 10),
                    fg="green"
                )
                status_label.pack(side=tk.BOTTOM, pady=(20, 0))
                
            def setup_wizard(self):
                messagebox.showinfo("Setup Wizard", "🚀 Full Setup Wizard\n\nComing in the next update!")
                
            def show_guide(self):
                messagebox.showinfo("Setup Guide", "📚 Opening setup guide and websites...")
                open_websites()
                
            def open_websites(self):
                self.status_var.set("Opening websites...")
                open_websites()
                self.status_var.set("✅ All websites opened!")
                
            def system_check(self):
                system_check()
                messagebox.showinfo("System Check", "Check completed - see terminal output")
                
            def show_help(self):
                help_text = """🐉 KALI DRAGON HELP

This is the Ultimate Kali Linux MCP Tool!

WHAT IT DOES:
• Automates Kali Linux MCP server setup
• Connects your Kali VM to Claude Desktop
• Provides secure SSH-based access

HOW TO USE:
1. Follow the Setup Guide
2. Run the Setup Wizard
3. Provide your Kali VM credentials

Happy Ethical Hacking! 🐉⚔️"""
                messagebox.showinfo("Help", help_text)
                
            def exit_app(self):
                if messagebox.askyesno("Exit Dragon", "Are you sure you want to quit Kali Dragon?"):
                    self.root.quit()
        
        # Try to create and run GUI
        root = tk.Tk()
        app = KaliDragonGUI(root)
        root.mainloop()
        return True
        
    except Exception as e:
        print(f"GUI Error: {e}")
        return False

def main():
    """Main function with auto-detection"""
    print("🐉 KALI DRAGON - Starting...")
    
    # Check if GUI is possible
    gui_available = can_use_gui()
    
    if gui_available and len(sys.argv) == 1:  # No arguments, try GUI
        print("🎨 Attempting to launch GUI...")
        if run_gui_interface():
            print("✅ GUI session completed")
            return 0
        else:
            print("❌ GUI failed, falling back to CLI...")
            
    # Use CLI interface
    print("💻 Using CLI interface")
    run_cli_interface()
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n🐉 Thanks for using Kali Dragon!")
        sys.exit(0)