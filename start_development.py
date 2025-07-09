#!/usr/bin/env python3
"""
HearMeOut Development Server Starter

This script starts both the React frontend and Flask backend servers
for local development.
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

# Store process references for cleanup
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n\n🛑 Shutting down development servers...")
    
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        except:
            pass
    
    print("✅ All servers stopped")
    sys.exit(0)

def run_frontend():
    """Start the React frontend development server"""
    print("🚀 Starting React frontend server...")
    
    # Check if node_modules exists
    if not Path("node_modules").exists():
        print("📦 Installing frontend dependencies...")
        install_process = subprocess.run(["npm", "install"], cwd=".")
        if install_process.returncode != 0:
            print("❌ Failed to install frontend dependencies")
            return None
    
    # Start the frontend server
    try:
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=".",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor frontend output
        def monitor_frontend():
            while True:
                line = process.stdout.readline()
                if not line:
                    break
                if "Local:" in line or "Network:" in line or "ready in" in line:
                    print(f"Frontend: {line.strip()}")
        
        thread = threading.Thread(target=monitor_frontend, daemon=True)
        thread.start()
        
        return process
        
    except FileNotFoundError:
        print("❌ npm not found. Please install Node.js and npm")
        return None
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def run_backend():
    """Start the Flask backend server"""
    print("🔧 Starting Flask backend server...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return None
    
    # Check if dependencies are installed
    try:
        # Try to import Flask to check if dependencies are available
        import flask
    except ImportError:
        print("📦 Installing backend dependencies...")
        install_process = subprocess.run([
            sys.executable, "backend/install_dependencies.py"
        ])
        if install_process.returncode != 0:
            print("❌ Failed to install backend dependencies")
            return None
    
    # Start the backend server
    try:
        process = subprocess.Popen(
            [sys.executable, "backend/start_backend.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Monitor backend output
        def monitor_backend():
            while True:
                line = process.stdout.readline()
                if not line:
                    break
                if any(keyword in line for keyword in ["Server ready", "Running on", "ERROR", "WARNING"]):
                    print(f"Backend: {line.strip()}")
        
        thread = threading.Thread(target=monitor_backend, daemon=True)
        thread.start()
        
        return process
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def check_ports():
    """Check if required ports are available"""
    import socket
    
    ports_to_check = [3000, 5173, 5000]  # Common frontend and backend ports
    used_ports = []
    
    for port in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('localhost', port))
            sock.close()
        except OSError:
            used_ports.append(port)
    
    if used_ports:
        print(f"⚠️ Ports {used_ports} are already in use")
        print("   The servers will try to use alternative ports")

def print_startup_info():
    """Print startup information"""
    print("\n" + "="*60)
    print("🎙️  HearMeOut Development Environment")
    print("="*60)
    print("Starting both frontend and backend servers...")
    print()
    print("Frontend (React + Vite):")
    print("  📱 Modern, responsive UI")
    print("  🎨 Tailwind CSS styling") 
    print("  ⚡ Hot module replacement")
    print()
    print("Backend (Flask + AI/ML):")
    print("  🤖 ASL recognition with MediaPipe")
    print("  😊 Emotion analysis with HuggingFace")
    print("  🗣️ Speech synthesis with gTTS")
    print("  🌍 Multi-language translation")
    print("  🚨 Emergency alert system")
    print("="*60)

def main():
    """Main function"""
    print_startup_info()
    
    # Setup signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Check port availability
    check_ports()
    
    print("\n🚀 Starting development servers...")
    
    # Start backend first
    print("\n1️⃣ Starting backend...")
    backend_process = run_backend()
    if backend_process:
        processes.append(backend_process)
        print("✅ Backend server starting...")
        time.sleep(3)  # Give backend time to start
    else:
        print("❌ Failed to start backend")
        return
    
    # Start frontend
    print("\n2️⃣ Starting frontend...")
    frontend_process = run_frontend()
    if frontend_process:
        processes.append(frontend_process)
        print("✅ Frontend server starting...")
        time.sleep(2)  # Give frontend time to start
    else:
        print("❌ Failed to start frontend")
        return
    
    print("\n" + "="*60)
    print("🎉 Development servers are running!")
    print()
    print("🌐 Frontend URLs:")
    print("   • http://localhost:5173 (Vite dev server)")
    print("   • http://localhost:3000 (alternative)")
    print()
    print("🔧 Backend URLs:")
    print("   • http://localhost:5000 (API server)")
    print("   • http://localhost:5000/api/health (health check)")
    print()
    print("📱 Features Available:")
    print("   • ASL Camera Recognition")
    print("   • Text-to-Speech & Speech-to-Text")
    print("   • Emotion Analysis")
    print("   • Emergency Mode")
    print("   • Multi-language Support")
    print("   • Two-way Kiosk Mode")
    print()
    print("Press Ctrl+C to stop all servers")
    print("="*60)
    
    # Keep the script running
    try:
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("❌ Backend process stopped unexpectedly")
                break
            if frontend_process.poll() is not None:
                print("❌ Frontend process stopped unexpectedly")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    
    # Cleanup
    signal_handler(None, None)

if __name__ == "__main__":
    main()