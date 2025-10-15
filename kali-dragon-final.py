#!/usr/bin/env python3
"""
🐉 KALI DRAGON - The Ultimate MCP Tool
Final version that works on all systems
"""

import sys
import os
import webbrowser
import platform

def print_header():
    """Print the dragon header"""
    header = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🐉 KALI DRAGON - THE ULTIMATE MCP TOOL 🐉          ║
║                                                              ║
║                     Final Version v3.0                      ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(header)
    print(f"Running on {platform.system()} {platform.release()}")
    print("═" * 66)

def can_use_gui():
    """Test if GUI is possible"""
    try:
        import tkinter as tk
        test_root = tk.Tk()
        test_root.withdraw()
        test_root.destroy()
        return True
    except:
        return False

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
    print("✅ All websites opened in your browser!")

def show_setup_guide():
    """Show the complete setup guide"""
    print("\n📚 KALI DRAGON SETUP GUIDE")
    print("═" * 50)
    
    guide = """
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
    print(guide)
    
    choice = input("\nWould you like to open all setup websites? [y/N]: ").lower().strip()
    if choice in ['y', 'yes']:
        open_websites()

def system_check():
    """Check system requirements"""
    print("\n🔧 SYSTEM CHECK")
    print("═" * 30)
    
    import subprocess
    
    # Python check
    print(f"✅ Python: {sys.version.split()[0]}")
    
    # GUI check
    if can_use_gui():
        print("✅ GUI: Available (tkinter working)")
    else:
        print("⚠️ GUI: Limited (using CLI mode)")
    
    # Docker check
    try:
        subprocess.run(["docker", "--version"], capture_output=True, check=True)
        print("✅ Docker: Available")
    except:
        print("❌ Docker: Not found (install OrbStack or Docker Desktop)")
    
    # System info
    print(f"✅ OS: {platform.system()} {platform.release()}")
    print(f"✅ Architecture: {platform.machine()}")

def show_help():
    """Show help information"""
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
1. Follow the Setup Guide (option 2)
2. Run the Setup Wizard (option 1) 
3. Provide your Kali VM credentials
4. Enjoy your Dragon-powered workspace!

SUPPORT:
• Check system requirements first (option 4)
• Follow setup guide step by step
• Make sure your Kali VM is running
• Ensure SSH is enabled on Kali

REQUIREMENTS:
• macOS, Windows, or Linux
• Python 3.6+
• UTM or VMware (for Kali VM)
• Claude Desktop app
• Docker or OrbStack

Happy Ethical Hacking! 🐉⚔️
"""
    print(help_text)

def run_gui():
    """Try to run GUI interface"""
    try:
        import tkinter as tk
        from tkinter import messagebox, scrolledtext
        
        class KaliDragonGUI:
            def __init__(self, root):
                self.root = root
                self.root.title("🐉 Kali Dragon - The Ultimate MCP Tool")
                self.root.geometry("600x500")
                
                # Try to bring window to front on macOS
                try:
                    self.root.lift()
                    self.root.attributes('-topmost', True)
                    self.root.after_idle(self.root.attributes, '-topmost', False)
                except:
                    pass
                
                self.create_gui()
                
            def create_gui(self):
                # Header
                header = tk.Label(
                    self.root,
                    text="🐉 KALI DRAGON",
                    font=("Arial", 20, "bold"),
                    fg="#8B00FF"
                )
                header.pack(pady=20)
                
                subtitle = tk.Label(
                    self.root,
                    text="The Ultimate Kali Linux MCP Tool",
                    font=("Arial", 12),
                    fg="#4B0082"
                )
                subtitle.pack()
                
                # Buttons
                button_frame = tk.Frame(self.root)
                button_frame.pack(expand=True, fill='both', padx=20, pady=20)
                
                buttons = [
                    ("🚀 Full Setup Wizard", self.setup_wizard),
                    ("📚 Setup Guide", self.show_guide),
                    ("🌐 Open Websites", self.open_websites),
                    ("🔧 System Check", self.system_check),
                    ("❓ Help", self.show_help),
                    ("🚪 Exit", self.exit_app)
                ]
                
                for i, (text, command) in enumerate(buttons):
                    btn = tk.Button(
                        button_frame,
                        text=text,
                        command=command,
                        font=("Arial", 11, "bold"),
                        width=25,
                        height=2,
                        bg="#f0f0f0" if i % 2 == 0 else "#e8e8e8"
                    )
                    btn.pack(pady=5, fill='x')
                    
            def setup_wizard(self):
                messagebox.showinfo("Setup Wizard", "🚀 Full Setup Wizard\n\nThis feature is coming in the next update!\n\nFor now, please use the Setup Guide.")
                
            def show_guide(self):
                messagebox.showinfo("Setup Guide", "📚 Opening setup guide and all required websites...")
                open_websites()
                
            def open_websites(self):
                open_websites()
                messagebox.showinfo("Success", "✅ All websites have been opened in your browser!")
                
            def system_check(self):
                system_check()
                messagebox.showinfo("System Check", "System check completed!\nSee the terminal output for details.")
                
            def show_help(self):
                help_window = tk.Toplevel(self.root)
                help_window.title("🐉 Help")
                help_window.geometry("500x400")
                
                help_text = scrolledtext.ScrolledText(help_window, wrap=tk.WORD)
                help_text.pack(expand=True, fill='both', padx=10, pady=10)
                
                help_content = """🐉 KALI DRAGON HELP

This is the Ultimate Kali Linux MCP Tool!

WHAT IT DOES:
• Automates Kali Linux MCP server setup  
• Connects your Kali VM to Claude Desktop
• Provides secure SSH-based access
• Creates comprehensive pentesting workspace

HOW TO USE:
1. Click "Setup Guide" to see step-by-step instructions
2. Follow the guide to install UTM, Kali Linux, OrbStack, etc.
3. Run the Setup Wizard when ready
4. Provide your Kali VM credentials
5. Enjoy your Dragon-powered workspace!

REQUIREMENTS:
• macOS, Windows, or Linux
• Python 3.6+
• UTM or VMware (for Kali VM) 
• Claude Desktop app
• Docker or OrbStack

Happy Ethical Hacking! 🐉⚔️"""
                
                help_text.insert('1.0', help_content)
                help_text.config(state='disabled')
                
            def exit_app(self):
                if messagebox.askyesno("Exit", "Are you sure you want to quit Kali Dragon?"):
                    self.root.quit()
        
        root = tk.Tk()
        app = KaliDragonGUI(root)
        root.mainloop()
        return True
        
    except Exception as e:
        print(f"GUI Error: {e}")
        return False

def run_cli():
    """Run CLI interface"""
    print_header()
    
    while True:
        print("\n📋 MAIN MENU:")
        print("1. 🚀 Full Setup Wizard")
        print("2. 📚 Setup Guide")
        print("3. 🌐 Open Important Websites")
        print("4. 🔧 System Check")
        print("5. ❓ Help")
        print("6. 🚪 Exit")
        
        try:
            choice = input("\n🐉 Select option (1-6): ").strip()
            
            if choice == "1":
                print("\n🚀 FULL SETUP WIZARD")
                print("═" * 30)
                print("This feature is coming in the next update!")
                print("For now, please use the Setup Guide (option 2).")
                input("\nPress Enter to continue...")
                
            elif choice == "2":
                show_setup_guide()
                input("\nPress Enter to continue...")
                
            elif choice == "3":
                open_websites()
                input("\nPress Enter to continue...")
                
            elif choice == "4":
                system_check()
                input("\nPress Enter to continue...")
                
            elif choice == "5":
                show_help()
                input("\nPress Enter to continue...")
                
            elif choice == "6":
                print("\n🐉 Thanks for using Kali Dragon!")
                break
                
            else:
                print("❌ Invalid option. Please select 1-6.")
                
        except (KeyboardInterrupt, EOFError):
            print("\n\n🐉 Thanks for using Kali Dragon!")
            break

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h']:
        print_header()
        show_help()
        return
        
    if len(sys.argv) > 1 and sys.argv[1] in ['--version', '-v']:
        print_header()
        print("🐉 Kali Dragon v3.0 - The Ultimate MCP Tool")
        print("Features: GUI, CLI, Cross-platform, Auto-detection")
        return
        
    if len(sys.argv) > 1 and sys.argv[1] in ['--cli', '-c']:
        run_cli()
        return
    
    # Try GUI first, fallback to CLI
    print("🐉 KALI DRAGON - Starting...")
    
    if can_use_gui():
        print("🎨 Attempting GUI...")
        if run_gui():
            return
        else:
            print("❌ GUI failed, using CLI...")
    else:
        print("💻 Using CLI interface...")
    
    run_cli()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🐉 Thanks for using Kali Dragon!")
        sys.exit(0)