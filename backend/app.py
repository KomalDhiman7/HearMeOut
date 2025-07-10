from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import datetime
import os
import cv2
import mediapipe as mp
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
CORS(app, supports_credentials=True)

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Database initialization
def init_db():
    conn = sqlite3.connect('hearmeout.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT NOT NULL,
            gesture_type TEXT,
            confidence REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Saved phrases table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            phrase TEXT NOT NULL,
            category TEXT DEFAULT 'personal',
            frequency INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Gesture mappings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gesture_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            gesture_name TEXT NOT NULL,
            custom_text TEXT,
            confidence_threshold REAL DEFAULT 0.7,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Gesture recognition functions
def calculate_distance(point1, point2):
    return np.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2)

def detect_gesture(landmarks):
    """Detect basic gestures from hand landmarks"""
    if not landmarks:
        return None, 0
    
    # Get key points
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    index_tip = landmarks[8]
    index_pip = landmarks[6]
    middle_tip = landmarks[12]
    middle_pip = landmarks[10]
    ring_tip = landmarks[16]
    ring_pip = landmarks[14]
    pinky_tip = landmarks[20]
    pinky_pip = landmarks[18]
    wrist = landmarks[0]
    
    # Thumbs up detection
    if (thumb_tip.y < thumb_ip.y and 
        index_tip.y > index_pip.y and 
        middle_tip.y > middle_pip.y and 
        ring_tip.y > ring_pip.y and 
        pinky_tip.y > pinky_pip.y):
        return "thumbs_up", 0.9
    
    # Thumbs down detection
    if (thumb_tip.y > thumb_ip.y and 
        index_tip.y > index_pip.y and 
        middle_tip.y > middle_pip.y and 
        ring_tip.y > ring_pip.y and 
        pinky_tip.y > pinky_pip.y):
        return "thumbs_down", 0.9
    
    # Peace sign (V) detection
    if (index_tip.y < index_pip.y and 
        middle_tip.y < middle_pip.y and 
        ring_tip.y > ring_pip.y and 
        pinky_tip.y > pinky_pip.y and
        abs(index_tip.x - middle_tip.x) > 0.05):
        return "peace", 0.85
    
    # OK sign detection
    thumb_index_distance = calculate_distance(thumb_tip, index_tip)
    if (thumb_index_distance < 0.05 and 
        middle_tip.y < middle_pip.y and 
        ring_tip.y < ring_pip.y and 
        pinky_tip.y < pinky_pip.y):
        return "ok", 0.8
    
    # Open palm detection
    if (thumb_tip.y < thumb_ip.y and 
        index_tip.y < index_pip.y and 
        middle_tip.y < middle_pip.y and 
        ring_tip.y < ring_pip.y and 
        pinky_tip.y < pinky_pip.y):
        return "open_palm", 0.75
    
    # Fist detection
    if (index_tip.y > index_pip.y and 
        middle_tip.y > middle_pip.y and 
        ring_tip.y > ring_pip.y and 
        pinky_tip.y > pinky_pip.y):
        return "fist", 0.7
    
    # Pointing detection
    if (index_tip.y < index_pip.y and 
        middle_tip.y > middle_pip.y and 
        ring_tip.y > ring_pip.y and 
        pinky_tip.y > pinky_pip.y):
        return "pointing", 0.8
    
    return "unknown", 0.3

def gesture_to_text(gesture_name):
    """Convert gesture to meaningful text"""
    gesture_map = {
        "thumbs_up": "Yes",
        "thumbs_down": "No", 
        "peace": "Peace / Victory",
        "ok": "OK / Good",
        "open_palm": "Hello / Stop",
        "fist": "Stop / Angry",
        "pointing": "Look / That way",
        "unknown": "Unknown gesture"
    }
    return gesture_map.get(gesture_name, "Unknown gesture")

# Helper functions
def get_db_connection():
    conn = sqlite3.connect('hearmeout.db')
    conn.row_factory = sqlite3.Row
    return conn

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Routes
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        
        # Check if user already exists
        existing_user = conn.execute(
            'SELECT id FROM users WHERE email = ?', (email,)
        ).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        password_hash = generate_password_hash(password)
        cursor = conn.execute(
            'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
            (email, password_hash, name)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate token
        token = generate_token(user_id)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE email = ?', (email,)
        ).fetchone()
        conn.close()
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/history', methods=['GET'])
def get_user_history():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        conn = get_db_connection()
        
        # Get chat history
        history = conn.execute(
            '''SELECT message, gesture_type, confidence, timestamp 
               FROM chat_history 
               WHERE user_id = ? 
               ORDER BY timestamp DESC 
               LIMIT 50''',
            (user_id,)
        ).fetchall()
        
        # Get saved phrases
        phrases = conn.execute(
            '''SELECT phrase, category, frequency 
               FROM saved_phrases 
               WHERE user_id = ? 
               ORDER BY frequency DESC''',
            (user_id,)
        ).fetchall()
        
        conn.close()
        
        return jsonify({
            'history': [dict(row) for row in history],
            'saved_phrases': [dict(row) for row in phrases]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/gesture/recognize', methods=['POST'])
def recognize_gesture():
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = image_data.split(',')[1]  # Remove data:image/jpeg;base64, prefix
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Convert PIL image to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Process with MediaPipe
        rgb_image = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_image)
        
        detected_gestures = []
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                gesture_name, confidence = detect_gesture(hand_landmarks.landmark)
                if gesture_name and confidence > 0.5:
                    text = gesture_to_text(gesture_name)
                    detected_gestures.append({
                        'gesture': gesture_name,
                        'text': text,
                        'confidence': confidence
                    })
        
        # Save to database if user is authenticated
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]
            user_id = verify_token(token)
            if user_id and detected_gestures:
                conn = get_db_connection()
                for gesture in detected_gestures:
                    conn.execute(
                        '''INSERT INTO chat_history (user_id, message, gesture_type, confidence) 
                           VALUES (?, ?, ?, ?)''',
                        (user_id, gesture['text'], gesture['gesture'], gesture['confidence'])
                    )
                conn.commit()
                conn.close()
        
        return jsonify({
            'gestures': detected_gestures,
            'timestamp': datetime.datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tts', methods=['POST'])
def text_to_speech():
    try:
        data = request.get_json()
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # For now, return success - TTS will be handled on frontend
        # In production, you could use gTTS or pyttsx3 here
        return jsonify({
            'message': 'Text processed for speech',
            'text': text,
            'timestamp': datetime.datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user/save-phrase', methods=['POST'])
def save_phrase():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        phrase = data.get('phrase')
        category = data.get('category', 'personal')
        
        if not phrase:
            return jsonify({'error': 'No phrase provided'}), 400
        
        conn = get_db_connection()
        conn.execute(
            '''INSERT INTO saved_phrases (user_id, phrase, category) 
               VALUES (?, ?, ?)''',
            (user_id, phrase, category)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Phrase saved successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'mediapipe_loaded': 'hands' in globals()
    }), 200

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully")
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)