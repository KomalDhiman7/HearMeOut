from flask import Blueprint, request, jsonify
import logging
from typing import Dict, List

from ..models.emotion_analyzer import EmotionAnalyzer

logger = logging.getLogger(__name__)

emotion_bp = Blueprint('emotion', __name__)

# Initialize emotion analyzer
emotion_analyzer = EmotionAnalyzer()

@emotion_bp.route('/analyze', methods=['POST'])
def analyze_emotion():
    """Analyze emotion and urgency from text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text data required'}), 400
        
        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Non-empty text required'}), 400
        
        # Analyze emotion
        result = emotion_analyzer.analyze_emotion(text)
        
        return jsonify({
            'success': True,
            'analysis': result,
            'input_text': text
        })
        
    except Exception as e:
        logger.error(f"Emotion analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emotion_bp.route('/batch', methods=['POST'])
def batch_analyze_emotion():
    """Analyze emotion for multiple texts"""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({'error': 'Texts array required'}), 400
        
        texts = data['texts']
        if not isinstance(texts, list):
            return jsonify({'error': 'Texts must be an array'}), 400
        
        if len(texts) > 50:  # Limit batch size
            return jsonify({'error': 'Maximum 50 texts per batch'}), 400
        
        # Analyze all texts
        results = emotion_analyzer.batch_analyze(texts)
        
        # Get summary
        summary = emotion_analyzer.get_emotion_summary(texts)
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': summary,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Batch emotion analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emotion_bp.route('/urgency', methods=['POST'])
def check_urgency():
    """Check urgency level of text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text data required'}), 400
        
        text = data['text']
        analysis = emotion_analyzer.analyze_emotion(text)
        
        # Extract urgency-specific information
        urgency_info = {
            'urgency_level': analysis['urgency_level'],
            'urgency_score': analysis['urgency_score'],
            'should_trigger_emergency': analysis['should_trigger_emergency'],
            'detected_keywords': analysis['detected_keywords'],
            'context_flags': analysis['context_flags']
        }
        
        return jsonify({
            'success': True,
            'urgency': urgency_info,
            'input_text': text
        })
        
    except Exception as e:
        logger.error(f"Urgency check error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emotion_bp.route('/status', methods=['GET'])
def get_emotion_status():
    """Get emotion analysis system status"""
    try:
        status = {
            'model_loaded': EmotionAnalyzer.is_model_loaded(),
            'analyzer_ready': emotion_analyzer is not None,
            'ml_models_available': emotion_analyzer.emotion_pipeline is not None,
            'supported_emotions': ['anger', 'fear', 'sadness', 'joy', 'surprise', 'disgust', 'neutral'],
            'urgency_levels': ['low', 'medium', 'high', 'critical'],
            'features': {
                'emotion_detection': True,
                'urgency_analysis': True,
                'batch_processing': True,
                'emergency_detection': True
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error getting emotion status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emotion_bp.route('/keywords', methods=['GET'])
def get_emotion_keywords():
    """Get list of emotion and urgency keywords"""
    try:
        keywords = {
            'emergency_keywords': emotion_analyzer.emergency_keywords,
            'context_patterns': list(emotion_analyzer.context_patterns.keys()),
            'emotion_mapping': emotion_analyzer.emotion_mapping
        }
        
        return jsonify({
            'success': True,
            'keywords': keywords
        })
        
    except Exception as e:
        logger.error(f"Error getting emotion keywords: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@emotion_bp.route('/test', methods=['POST'])
def test_emotion_detection():
    """Test emotion detection with sample texts"""
    try:
        # Sample test texts with different emotions and urgency levels
        test_texts = [
            "I need help immediately!",
            "I'm having a heart attack",
            "Thank you for your assistance",
            "I'm feeling anxious and worried",
            "Emergency! Call 911 now!",
            "Please help me find the bathroom",
            "I'm having trouble with my order",
            "This is urgent, I need a doctor"
        ]
        
        results = []
        for text in test_texts:
            analysis = emotion_analyzer.analyze_emotion(text)
            results.append({
                'text': text,
                'emotion': analysis['emotion'],
                'urgency_level': analysis['urgency_level'],
                'confidence': analysis['overall_confidence'],
                'emergency_trigger': analysis['should_trigger_emergency']
            })
        
        summary = emotion_analyzer.get_emotion_summary(test_texts)
        
        return jsonify({
            'success': True,
            'test_results': results,
            'summary': summary
        })
        
    except Exception as e:
        logger.error(f"Emotion test error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500