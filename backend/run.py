#!/usr/bin/env python3
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, init_db

if __name__ == '__main__':
    # Initialize database
    init_db()
    print("✅ Database initialized successfully")
    print("🚀 Starting HearMeOut Flask server...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🔗 Frontend should connect to this backend")
    
    # Run the Flask app
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )