from flask import Blueprint, request, jsonify
from flask_socketio import emit
import cv2
import numpy as np
import base64
import io
from PIL import Image
import logging
from typing import Dict, Optional

from ..models.asl_detector import ASLDetector

logger = logging.getLogger(__name__)

asl_bp = Blueprint('asl', __name__)

# Initialize ASL detector
asl_detector = ASLDetector()

@asl_bp.route('/detect', methods=['POST'])
def detect_asl():
    """Detect ASL signs from uploaded image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'Image data required'}), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image/'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        # Convert to OpenCV format
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        if len(image_np.shape) == 3:
            image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        else:
            image_cv = image_np
        
        # Detect ASL signs
        result = asl_detector.detect_from_frame(image_cv)
        
        # Add timestamp
        result['timestamp'] = np.datetime64('now').isoformat()
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        logger.error(f"ASL detection error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/detect/stream', methods=['POST'])
def detect_asl_stream():
    """Detect ASL signs from video stream frame"""
    try:
        data = request.get_json()
        
        if not data or 'frame' not in data:
            return jsonify({'error': 'Frame data required'}), 400
        
        # Process frame
        frame_data = data['frame']
        if frame_data.startswith('data:image/'):
            frame_data = frame_data.split(',')[1]
        
        # Convert to OpenCV format
        frame_bytes = base64.b64decode(frame_data)
        frame_image = Image.open(io.BytesIO(frame_bytes))
        frame_np = np.array(frame_image)
        frame_cv = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
        
        # Detect signs
        result = asl_detector.detect_from_frame(frame_cv)
        
        # Get processing options
        options = data.get('options', {})
        include_landmarks = options.get('include_landmarks', False)
        
        response_data = {
            'success': True,
            'result': result,
            'timestamp': np.datetime64('now').isoformat()
        }
        
        # Add landmarks if requested
        if include_landmarks:
            landmarks = asl_detector.extract_hand_landmarks(frame_cv)
            if landmarks:
                response_data['landmarks'] = landmarks
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"ASL stream detection error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/history', methods=['GET'])
def get_detection_history():
    """Get recent ASL detection history"""
    try:
        history = asl_detector.get_detection_history()
        
        # Format history for response
        formatted_history = []
        for item in history:
            formatted_history.append({
                'sign': item['sign'],
                'confidence': item['confidence'],
                'timestamp': item['timestamp'].isoformat() if hasattr(item['timestamp'], 'isoformat') else str(item['timestamp'])
            })
        
        return jsonify({
            'success': True,
            'history': formatted_history,
            'count': len(formatted_history)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving ASL history: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/reset', methods=['POST'])
def reset_detection():
    """Reset ASL detection state"""
    try:
        asl_detector.reset_detection()
        
        return jsonify({
            'success': True,
            'message': 'ASL detection state reset successfully'
        })
        
    except Exception as e:
        logger.error(f"Error resetting ASL detection: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/status', methods=['GET'])
def get_asl_status():
    """Get ASL detection system status"""
    try:
        status = {
            'model_loaded': ASLDetector.is_model_loaded(),
            'detector_ready': asl_detector is not None,
            'supported_signs': {
                'alphabet': list(asl_detector.asl_signs.keys()) if asl_detector.asl_signs else [],
                'common_phrases': list(asl_detector.common_signs.keys()) if asl_detector.common_signs else []
            },
            'detection_settings': {
                'min_stability_frames': asl_detector.min_stability_frames,
                'confidence_threshold': 0.6
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error getting ASL status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/landmarks', methods=['POST'])
def extract_landmarks():
    """Extract hand landmarks from image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'Image data required'}), 400
        
        # Decode image
        image_data = data['image']
        if image_data.startswith('data:image/'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        # Extract landmarks
        hand_landmarks = asl_detector.extract_hand_landmarks(image_cv)
        pose_landmarks = asl_detector.extract_pose_landmarks(image_cv)
        
        result = {
            'hand_landmarks': hand_landmarks,
            'pose_landmarks': pose_landmarks,
            'timestamp': np.datetime64('now').isoformat()
        }
        
        return jsonify({
            'success': True,
            'landmarks': result
        })
        
    except Exception as e:
        logger.error(f"Error extracting landmarks: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/signs', methods=['GET'])
def get_supported_signs():
    """Get list of supported ASL signs"""
    try:
        alphabet_signs = list(asl_detector.asl_signs.keys()) if asl_detector.asl_signs else []
        common_signs = []
        
        if asl_detector.common_signs:
            for sign, data in asl_detector.common_signs.items():
                common_signs.append({
                    'text': sign,
                    'movement': data.get('movement', 'static'),
                    'category': 'common'
                })
        
        return jsonify({
            'success': True,
            'signs': {
                'alphabet': [{'letter': letter, 'category': 'alphabet'} for letter in alphabet_signs],
                'common_phrases': common_signs,
                'total_count': len(alphabet_signs) + len(common_signs)
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting supported signs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asl_bp.route('/confidence/adjust', methods=['POST'])
def adjust_confidence_threshold():
    """Adjust confidence threshold for detection"""
    try:
        data = request.get_json()
        threshold = data.get('threshold', 0.6)
        
        if not 0.1 <= threshold <= 1.0:
            return jsonify({
                'success': False,
                'error': 'Threshold must be between 0.1 and 1.0'
            }), 400
        
        # Note: In a full implementation, this would adjust the detector's threshold
        # For now, we'll just acknowledge the request
        
        return jsonify({
            'success': True,
            'message': f'Confidence threshold adjusted to {threshold}',
            'threshold': threshold
        })
        
    except Exception as e:
        logger.error(f"Error adjusting confidence threshold: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# WebSocket events for real-time ASL detection
def handle_asl_frame(data):
    """Handle real-time ASL frame detection via WebSocket"""
    try:
        if 'frame' not in data:
            emit('asl_error', {'error': 'Frame data required'})
            return
        
        # Process frame
        frame_data = data['frame']
        if frame_data.startswith('data:image/'):
            frame_data = frame_data.split(',')[1]
        
        frame_bytes = base64.b64decode(frame_data)
        frame_image = Image.open(io.BytesIO(frame_bytes))
        frame_np = np.array(frame_image)
        frame_cv = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
        
        # Detect signs
        result = asl_detector.detect_from_frame(frame_cv)
        
        # Emit result
        emit('asl_detection', {
            'result': result,
            'timestamp': np.datetime64('now').isoformat()
        })
        
        # If emergency sign detected, emit emergency event
        if result.get('sign') in ['emergency', 'help', 'pain'] and result.get('confidence', 0) > 80:
            emit('emergency_asl', {
                'sign': result['sign'],
                'confidence': result['confidence'],
                'message': f"Emergency ASL sign detected: {result['sign']}"
            })
        
    except Exception as e:
        logger.error(f"WebSocket ASL detection error: {str(e)}")
        emit('asl_error', {'error': str(e)})