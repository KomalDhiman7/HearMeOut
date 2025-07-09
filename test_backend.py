#!/usr/bin/env python3
"""
HearMeOut Backend Test Script

This script tests the backend API endpoints to ensure everything is working correctly.
"""

import requests
import json
import time

API_BASE_URL = 'http://localhost:5000'

def test_endpoint(endpoint, method='GET', data=None, description=""):
    """Test a single API endpoint"""
    url = f"{API_BASE_URL}{endpoint}"
    
    print(f"Testing {description or endpoint}...")
    
    try:
        if method == 'GET':
            response = requests.get(url)
        elif method == 'POST':
            response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            print(f"  ✅ {endpoint} - Status: {response.status_code}")
            try:
                result = response.json()
                if result.get('success'):
                    print(f"     Success: {result.get('message', 'OK')}")
                else:
                    print(f"     API Error: {result.get('error', 'Unknown')}")
            except:
                print("     Response: OK (non-JSON)")
            return True
        else:
            print(f"  ❌ {endpoint} - Status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"  ❌ {endpoint} - Connection failed (is backend running?)")
        return False
    except Exception as e:
        print(f"  ❌ {endpoint} - Error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🎙️ HearMeOut Backend Test Suite")
    print("=" * 50)
    
    # Check if backend is running
    print("\n🔍 Checking backend connectivity...")
    if not test_endpoint('/api/health', description='Health Check'):
        print("\n❌ Backend is not running or not accessible")
        print("Please start the backend with: python backend/start_backend.py")
        return False
    
    print("\n✅ Backend is running!")
    
    # Test basic endpoints
    tests = [
        ('/api/status', 'GET', None, 'System Status'),
        ('/api/auth/status', 'GET', None, 'Auth System Status'),
        ('/api/asl/status', 'GET', None, 'ASL System Status'),
        ('/api/emotion/status', 'GET', None, 'Emotion System Status'),
        ('/api/speech/status', 'GET', None, 'Speech System Status'),
        ('/api/translate/languages', 'GET', None, 'Translation Languages'),
        ('/api/emergency/contacts', 'GET', None, 'Emergency Contacts'),
    ]
    
    print("\n🧪 Testing API endpoints...")
    passed = 0
    total = len(tests)
    
    for endpoint, method, data, description in tests:
        if test_endpoint(endpoint, method, data, description):
            passed += 1
        time.sleep(0.1)  # Small delay between tests
    
    # Test some POST endpoints
    print("\n🧪 Testing POST endpoints...")
    
    # Test emotion analysis
    emotion_data = {"text": "I need help immediately!"}
    if test_endpoint('/api/emotion/analyze', 'POST', emotion_data, 'Emotion Analysis'):
        passed += 1
    total += 1
    
    # Test translation
    translate_data = {"phrase": "help", "target_language": "es"}
    if test_endpoint('/api/translate/phrase', 'POST', translate_data, 'Translation'):
        passed += 1
    total += 1
    
    # Test TTS
    tts_data = {"text": "Hello, this is a test"}
    if test_endpoint('/api/speech/tts', 'POST', tts_data, 'Text-to-Speech'):
        passed += 1
    total += 1
    
    # Test emergency system (test mode)
    if test_endpoint('/api/emergency/test', 'POST', {}, 'Emergency System Test'):
        passed += 1
    total += 1
    
    # Results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is fully functional.")
        print("\n🚀 You can now start the frontend with: npm run dev")
        print("   Or start both with: python start_development.py")
    else:
        print(f"⚠️  {total - passed} tests failed. Some features may not work correctly.")
        print("\n🔧 Check the error messages above for troubleshooting.")
    
    print("\n📱 Next steps:")
    print("  1. Start the frontend: npm run dev")
    print("  2. Open browser: http://localhost:5173")
    print("  3. Test ASL camera, text-to-speech, and emergency features")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)