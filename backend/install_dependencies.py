#!/usr/bin/env python3
"""
HearMeOut Backend Dependencies Installer

This script installs all required and optional dependencies for the HearMeOut backend.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and return success status"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def install_dependencies():
    """Install all dependencies"""
    print("🎙️ HearMeOut Backend Dependencies Installer")
    print("=" * 50)
    
    # Upgrade pip first
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️ Warning: Could not upgrade pip, continuing anyway...")
    
    # Core dependencies (required)
    core_deps = [
        "Flask==3.0.0",
        "Flask-CORS==4.0.0", 
        "Flask-SocketIO==5.3.6",
        "python-socketio==5.11.0",
        "python-dotenv==1.0.0",
        "requests==2.31.0",
        "Pillow==10.1.0",
        "numpy==1.24.3"
    ]
    
    print("\n🔧 Installing core dependencies...")
    for dep in core_deps:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep.split('==')[0]}"):
            print(f"❌ Failed to install {dep}")
            return False
    
    # AI/ML dependencies (optional but recommended)
    ai_deps = [
        "opencv-python==4.8.1.78",
        "mediapipe==0.10.8"
    ]
    
    print("\n🤖 Installing AI/ML dependencies...")
    ai_success = True
    for dep in ai_deps:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep.split('==')[0]}"):
            print(f"⚠️ Warning: Could not install {dep}")
            ai_success = False
    
    # Speech dependencies (optional)
    speech_deps = [
        "gTTS==2.4.0",
        "SpeechRecognition==3.10.0",
        "pydub==0.25.1"
    ]
    
    print("\n🗣️ Installing speech dependencies...")
    speech_success = True
    for dep in speech_deps:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep.split('==')[0]}"):
            print(f"⚠️ Warning: Could not install {dep}")
            speech_success = False
    
    # Try to install pyttsx3 (may fail on some systems)
    try:
        run_command(f"{sys.executable} -m pip install pyttsx3==2.90", "Installing pyttsx3")
    except:
        print("⚠️ Warning: Could not install pyttsx3 (text-to-speech may not work offline)")
    
    # Try to install advanced ML libraries (may fail without proper setup)
    advanced_deps = [
        "transformers",
        "torch --index-url https://download.pytorch.org/whl/cpu"
    ]
    
    print("\n🧠 Installing advanced AI dependencies (optional)...")
    for dep in advanced_deps:
        try:
            run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep.split('==')[0] if '==' in dep else dep.split()[0]}")
        except:
            print(f"⚠️ Warning: Could not install {dep}")
    
    # Try to install Whisper (may require additional setup)
    try:
        run_command(f"{sys.executable} -m pip install openai-whisper", "Installing Whisper")
    except:
        print("⚠️ Warning: Could not install Whisper (speech recognition may be limited)")
    
    print("\n" + "=" * 50)
    print("✅ Installation completed!")
    
    if not ai_success:
        print("⚠️ Some AI features may not work due to missing dependencies")
    
    if not speech_success:
        print("⚠️ Some speech features may not work due to missing dependencies")
    
    print("\n📋 Installation Summary:")
    print("  ✅ Core Flask backend: Ready")
    print(f"  {'✅' if ai_success else '⚠️'} AI/ML features: {'Ready' if ai_success else 'Partial'}")
    print(f"  {'✅' if speech_success else '⚠️'} Speech features: {'Ready' if speech_success else 'Partial'}")
    
    print("\n🚀 You can now start the backend with:")
    print("   python start_backend.py")
    print("\n   or")
    print("   python -m backend.start_backend")
    
    return True

if __name__ == "__main__":
    success = install_dependencies()
    if not success:
        print("\n❌ Installation failed. Please check the error messages above.")
        sys.exit(1)
    
    print("\n🎉 Ready to run HearMeOut backend!")
    
    # Ask if user wants to start the server now
    try:
        start_now = input("\nWould you like to start the backend server now? (y/N): ").lower().strip()
        if start_now in ['y', 'yes']:
            print("\n🚀 Starting backend server...")
            os.system(f"{sys.executable} start_backend.py")
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")