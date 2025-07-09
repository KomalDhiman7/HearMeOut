from flask import Blueprint, request, jsonify, session
import hashlib
import uuid
import time
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Simple in-memory user store (in production, use a proper database)
users_db = {
    'demo@hearmeout.com': {
        'id': '1',
        'email': 'demo@hearmeout.com',
        'name': 'Demo User',
        'password_hash': hashlib.sha256('demo123'.encode()).hexdigest(),
        'created_at': '2024-01-01T00:00:00Z',
        'preferences': {
            'language': 'en-US',
            'voice_speed': 1.2,
            'voice_volume': 0.8,
            'emergency_contacts': [],
            'accessibility_mode': True
        },
        'saved_phrases': [],
        'gesture_shortcuts': []
    }
}

# Active sessions
active_sessions = {}

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    """Generate a unique session token"""
    return str(uuid.uuid4())

def validate_email(email: str) -> bool:
    """Basic email validation"""
    return '@' in email and '.' in email.split('@')[1]

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Registration data required'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        # Validation
        if not email or not validate_email(email):
            return jsonify({'error': 'Valid email required'}), 400
        
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if not name:
            return jsonify({'error': 'Name required'}), 400
        
        # Check if user already exists
        if email in users_db:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user_id = str(len(users_db) + 1)
        password_hash = hash_password(password)
        
        new_user = {
            'id': user_id,
            'email': email,
            'name': name,
            'password_hash': password_hash,
            'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'preferences': {
                'language': 'en-US',
                'voice_speed': 1.0,
                'voice_volume': 0.8,
                'emergency_contacts': [],
                'accessibility_mode': True
            },
            'saved_phrases': [],
            'gesture_shortcuts': []
        }
        
        users_db[email] = new_user
        
        # Create session
        session_token = generate_session_token()
        active_sessions[session_token] = {
            'user_id': user_id,
            'email': email,
            'created_at': time.time(),
            'last_activity': time.time()
        }
        
        logger.info(f"New user registered: {email}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'preferences': new_user['preferences']
            },
            'session_token': session_token
        })
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Login data required'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Check user exists
        user = users_db.get(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        password_hash = hash_password(password)
        if password_hash != user['password_hash']:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create session
        session_token = generate_session_token()
        active_sessions[session_token] = {
            'user_id': user['id'],
            'email': email,
            'created_at': time.time(),
            'last_activity': time.time()
        }
        
        logger.info(f"User logged in: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'preferences': user['preferences'],
                'saved_phrases': user['saved_phrases'],
                'gesture_shortcuts': user['gesture_shortcuts']
            },
            'session_token': session_token
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if session_token in active_sessions:
            del active_sessions[session_token]
            
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not session_token or session_token not in active_sessions:
            return jsonify({'error': 'Not authenticated'}), 401
        
        session_data = active_sessions[session_token]
        email = session_data['email']
        user = users_db.get(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update last activity
        session_data['last_activity'] = time.time()
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'preferences': user['preferences'],
                'saved_phrases': user['saved_phrases'],
                'gesture_shortcuts': user['gesture_shortcuts'],
                'created_at': user['created_at']
            }
        })
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not session_token or session_token not in active_sessions:
            return jsonify({'error': 'Not authenticated'}), 401
        
        session_data = active_sessions[session_token]
        email = session_data['email']
        user = users_db.get(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Update data required'}), 400
        
        # Update allowed fields
        if 'name' in data:
            user['name'] = data['name'].strip()
        
        if 'preferences' in data:
            user['preferences'].update(data['preferences'])
        
        if 'saved_phrases' in data:
            user['saved_phrases'] = data['saved_phrases']
        
        if 'gesture_shortcuts' in data:
            user['gesture_shortcuts'] = data['gesture_shortcuts']
        
        # Update last activity
        session_data['last_activity'] = time.time()
        
        logger.info(f"Profile updated for user: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'preferences': user['preferences'],
                'saved_phrases': user['saved_phrases'],
                'gesture_shortcuts': user['gesture_shortcuts']
            }
        })
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not session_token or session_token not in active_sessions:
            return jsonify({'error': 'Not authenticated'}), 401
        
        session_data = active_sessions[session_token]
        email = session_data['email']
        user = users_db.get(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Password data required'}), 400
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        # Verify current password
        current_hash = hash_password(current_password)
        if current_hash != user['password_hash']:
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        user['password_hash'] = hash_password(new_password)
        
        logger.info(f"Password changed for user: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/validate', methods=['GET'])
def validate_session():
    """Validate session token"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not session_token or session_token not in active_sessions:
            return jsonify({
                'success': False,
                'valid': False,
                'error': 'Invalid session'
            }), 401
        
        session_data = active_sessions[session_token]
        
        # Check if session is expired (24 hours)
        if time.time() - session_data['created_at'] > 86400:
            del active_sessions[session_token]
            return jsonify({
                'success': False,
                'valid': False,
                'error': 'Session expired'
            }), 401
        
        # Update last activity
        session_data['last_activity'] = time.time()
        
        return jsonify({
            'success': True,
            'valid': True,
            'user_id': session_data['user_id'],
            'email': session_data['email']
        })
        
    except Exception as e:
        logger.error(f"Session validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/status', methods=['GET'])
def get_auth_status():
    """Get authentication system status"""
    try:
        # Clean up expired sessions
        current_time = time.time()
        expired_sessions = [
            token for token, data in active_sessions.items()
            if current_time - data['created_at'] > 86400
        ]
        
        for token in expired_sessions:
            del active_sessions[token]
        
        status = {
            'total_users': len(users_db),
            'active_sessions': len(active_sessions),
            'features': {
                'registration': True,
                'login': True,
                'profile_management': True,
                'password_change': True,
                'session_validation': True
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error getting auth status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500