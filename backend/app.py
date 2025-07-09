from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from dotenv import load_dotenv
import logging

from src.api.auth import auth_bp
from src.api.asl import asl_bp
from src.api.speech import speech_bp
from src.api.emotion import emotion_bp
from src.api.emergency import emergency_bp
from src.api.translation import translation_bp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'hearmeout-dev-key-2024')
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize CORS
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "https://hearmeout.vercel.app"])
    
    # Initialize SocketIO for real-time communication
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(asl_bp, url_prefix='/api/asl')
    app.register_blueprint(speech_bp, url_prefix='/api/speech')
    app.register_blueprint(emotion_bp, url_prefix='/api/emotion')
    app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
    app.register_blueprint(translation_bp, url_prefix='/api/translate')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'message': 'HearMeOut Backend is running',
            'version': '1.0.0'
        })
    
    @app.route('/api/status', methods=['GET'])
    def status():
        """System status endpoint"""
        try:
            # Check if ML models are loaded
            from src.models.asl_detector import ASLDetector
            from src.models.emotion_analyzer import EmotionAnalyzer
            
            asl_status = ASLDetector.is_model_loaded()
            emotion_status = EmotionAnalyzer.is_model_loaded()
            
            return jsonify({
                'status': 'running',
                'models': {
                    'asl_detector': asl_status,
                    'emotion_analyzer': emotion_status
                },
                'features': {
                    'asl_recognition': True,
                    'emotion_detection': True,
                    'speech_synthesis': True,
                    'translation': True,
                    'emergency_mode': True
                }
            })
        except Exception as e:
            logger.error(f"Status check failed: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    # SocketIO events for real-time communication
    @socketio.on('connect')
    def handle_connect():
        logger.info('Client connected')
        emit('connected', {'message': 'Connected to HearMeOut backend'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        logger.info('Client disconnected')
    
    @socketio.on('emergency')
    def handle_emergency(data):
        """Handle emergency alerts"""
        logger.warning(f"Emergency alert received: {data}")
        # Broadcast emergency to all connected clients
        emit('emergency_alert', data, broadcast=True)
    
    @socketio.on('kiosk_message')
    def handle_kiosk_message(data):
        """Handle kiosk mode messages"""
        logger.info(f"Kiosk message: {data}")
        # Broadcast to kiosk participants
        emit('kiosk_response', data, broadcast=True)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Store socketio instance in app for access in other modules
    app.socketio = socketio
    
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    
    # Run with SocketIO
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True,
        allow_unsafe_werkzeug=True
    )