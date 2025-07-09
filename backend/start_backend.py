#!/usr/bin/env python3
"""
HearMeOut Backend Startup Script

This script initializes and starts the HearMeOut Flask backend server
with all necessary AI/ML models and configurations.
"""

import os
import sys
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Import the Flask app
from app import create_app

def setup_logging():
    """Setup logging configuration"""
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/hearmeout.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Reduce noise from some libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)

def setup_directories():
    """Create necessary directories"""
    directories = ['uploads', 'logs', 'models_cache']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created directory: {directory}")

def check_dependencies():
    """Check if required dependencies are available"""
    required_packages = [
        'flask', 'flask_cors', 'flask_socketio', 
        'opencv-python', 'mediapipe', 'numpy'
    ]
    
    optional_packages = [
        'gtts', 'pyttsx3', 'whisper', 'transformers', 'torch'
    ]
    
    missing_required = []
    missing_optional = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✓ {package} available")
        except ImportError:
            missing_required.append(package)
            print(f"✗ {package} missing (REQUIRED)")
    
    for package in optional_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✓ {package} available")
        except ImportError:
            missing_optional.append(package)
            print(f"⚠ {package} missing (optional, some features may not work)")
    
    if missing_required:
        print(f"\nERROR: Missing required packages: {', '.join(missing_required)}")
        print("Please install them with: pip install " + " ".join(missing_required))
        return False
    
    if missing_optional:
        print(f"\nWARNING: Missing optional packages: {', '.join(missing_optional)}")
        print("Some features may not work. Install with: pip install " + " ".join(missing_optional))
    
    return True

def print_startup_info():
    """Print startup information"""
    print("\n" + "="*60)
    print("🎙️  HearMeOut Backend Server")
    print("="*60)
    print("A communication app for deaf, hard of hearing, and non-speaking users")
    print()
    print("Features:")
    print("  • ASL Sign Language Recognition")
    print("  • Real-time Emotion Analysis")
    print("  • Text-to-Speech & Speech-to-Text")
    print("  • Multi-language Translation")
    print("  • Emergency Alert System")
    print("  • Two-way Kiosk Mode")
    print("="*60)

def main():
    """Main startup function"""
    print_startup_info()
    
    # Setup logging
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # Setup directories
    print("\n📁 Setting up directories...")
    setup_directories()
    
    # Check dependencies
    print("\n📦 Checking dependencies...")
    if not check_dependencies():
        sys.exit(1)
    
    # Create Flask app
    print("\n🚀 Starting HearMeOut Backend...")
    try:
        app, socketio = create_app()
        
        # Get configuration
        host = '0.0.0.0'
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"\n✅ Server ready!")
        print(f"   🌐 URL: http://localhost:{port}")
        print(f"   🔧 Debug: {debug}")
        print(f"   📡 WebSocket: Enabled")
        print(f"   🔒 CORS: Configured")
        print("\nPress Ctrl+C to stop the server")
        print("="*60)
        
        # Start the server
        socketio.run(
            app,
            host=host,
            port=port,
            debug=debug,
            allow_unsafe_werkzeug=True
        )
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        logger.info("Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        logger.error(f"Server startup error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()