from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import io
import base64
import wave
import logging
from typing import Dict, Optional
import threading
import time

try:
    from gtts import gTTS
    import pyttsx3
    import whisper
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Speech libraries not available: {e}")
    SPEECH_AVAILABLE = False

logger = logging.getLogger(__name__)

speech_bp = Blueprint('speech', __name__)

# Initialize speech engines
class SpeechManager:
    def __init__(self):
        self.pyttsx_engine = None
        self.whisper_model = None
        self.speech_recognizer = None
        self.initialize_engines()
    
    def initialize_engines(self):
        """Initialize speech engines"""
        if not SPEECH_AVAILABLE:
            logger.warning("Speech engines not available")
            return
        
        try:
            # Initialize pyttsx3
            self.pyttsx_engine = pyttsx3.init()
            self.pyttsx_engine.setProperty('rate', 150)
            self.pyttsx_engine.setProperty('volume', 0.8)
            
            # Initialize Whisper (small model for faster processing)
            self.whisper_model = whisper.load_model("base")
            
            # Initialize speech recognition
            self.speech_recognizer = sr.Recognizer()
            
            logger.info("Speech engines initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize speech engines: {e}")

speech_manager = SpeechManager()

@speech_bp.route('/tts', methods=['POST'])
def text_to_speech():
    """Convert text to speech using gTTS"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text data required'}), 400
        
        text = data['text']
        language = data.get('language', 'en')
        slow = data.get('slow', False)
        
        if not text.strip():
            return jsonify({'error': 'Non-empty text required'}), 400
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=language, slow=slow)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            tts.save(temp_file.name)
            
            # Read file content
            with open(temp_file.name, 'rb') as audio_file:
                audio_content = audio_file.read()
            
            # Clean up
            os.unlink(temp_file.name)
        
        # Convert to base64 for JSON response
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_data': audio_base64,
            'format': 'mp3',
            'text': text,
            'language': language
        })
        
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/tts/pyttsx', methods=['POST'])
def text_to_speech_pyttsx():
    """Convert text to speech using pyttsx3 (offline)"""
    try:
        if not speech_manager.pyttsx_engine:
            return jsonify({'error': 'pyttsx3 engine not available'}), 503
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text data required'}), 400
        
        text = data['text']
        rate = data.get('rate', 150)
        volume = data.get('volume', 0.8)
        voice_id = data.get('voice_id', None)
        
        # Configure engine
        speech_manager.pyttsx_engine.setProperty('rate', rate)
        speech_manager.pyttsx_engine.setProperty('volume', volume)
        
        if voice_id:
            voices = speech_manager.pyttsx_engine.getProperty('voices')
            if voice_id < len(voices):
                speech_manager.pyttsx_engine.setProperty('voice', voices[voice_id].id)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            speech_manager.pyttsx_engine.save_to_file(text, temp_file.name)
            speech_manager.pyttsx_engine.runAndWait()
            
            # Read file content
            with open(temp_file.name, 'rb') as audio_file:
                audio_content = audio_file.read()
            
            # Clean up
            os.unlink(temp_file.name)
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_data': audio_base64,
            'format': 'wav',
            'text': text,
            'settings': {
                'rate': rate,
                'volume': volume,
                'voice_id': voice_id
            }
        })
        
    except Exception as e:
        logger.error(f"pyttsx3 TTS error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/stt/whisper', methods=['POST'])
def speech_to_text_whisper():
    """Convert speech to text using Whisper"""
    try:
        if not speech_manager.whisper_model:
            return jsonify({'error': 'Whisper model not available'}), 503
        
        data = request.get_json()
        
        if not data or 'audio' not in data:
            return jsonify({'error': 'Audio data required'}), 400
        
        audio_data = data['audio']
        if audio_data.startswith('data:audio/'):
            audio_data = audio_data.split(',')[1]
        
        # Decode audio
        audio_bytes = base64.b64decode(audio_data)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe with Whisper
            result = speech_manager.whisper_model.transcribe(temp_file_path)
            
            transcription = result['text'].strip()
            language = result.get('language', 'unknown')
            
            # Clean up
            os.unlink(temp_file_path)
            
            return jsonify({
                'success': True,
                'transcription': transcription,
                'language': language,
                'confidence': 1.0  # Whisper doesn't provide confidence scores
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
        
    except Exception as e:
        logger.error(f"Whisper STT error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/stt/google', methods=['POST'])
def speech_to_text_google():
    """Convert speech to text using Google Speech Recognition"""
    try:
        if not speech_manager.speech_recognizer:
            return jsonify({'error': 'Speech recognizer not available'}), 503
        
        data = request.get_json()
        
        if not data or 'audio' not in data:
            return jsonify({'error': 'Audio data required'}), 400
        
        audio_data = data['audio']
        language = data.get('language', 'en-US')
        
        if audio_data.startswith('data:audio/'):
            audio_data = audio_data.split(',')[1]
        
        # Decode audio
        audio_bytes = base64.b64decode(audio_data)
        
        # Convert to AudioData object
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        try:
            with sr.AudioFile(temp_file_path) as source:
                audio = speech_manager.speech_recognizer.record(source)
            
            # Recognize speech
            text = speech_manager.speech_recognizer.recognize_google(audio, language=language)
            
            # Clean up
            os.unlink(temp_file_path)
            
            return jsonify({
                'success': True,
                'transcription': text,
                'language': language,
                'confidence': 1.0  # Google API doesn't always provide confidence
            })
            
        except sr.UnknownValueError:
            os.unlink(temp_file_path)
            return jsonify({
                'success': False,
                'error': 'Could not understand audio'
            }), 400
            
        except sr.RequestError as e:
            os.unlink(temp_file_path)
            return jsonify({
                'success': False,
                'error': f'Speech recognition service error: {str(e)}'
            }), 503
        
    except Exception as e:
        logger.error(f"Google STT error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/voices', methods=['GET'])
def get_available_voices():
    """Get list of available TTS voices"""
    try:
        voices = []
        
        if speech_manager.pyttsx_engine:
            pyttsx_voices = speech_manager.pyttsx_engine.getProperty('voices')
            for i, voice in enumerate(pyttsx_voices):
                voices.append({
                    'id': i,
                    'name': voice.name,
                    'language': getattr(voice, 'languages', ['unknown'])[0] if hasattr(voice, 'languages') else 'unknown',
                    'gender': getattr(voice, 'gender', 'unknown'),
                    'engine': 'pyttsx3'
                })
        
        # Add gTTS supported languages
        gtts_languages = [
            {'id': 'en', 'name': 'English', 'engine': 'gTTS'},
            {'id': 'es', 'name': 'Spanish', 'engine': 'gTTS'},
            {'id': 'fr', 'name': 'French', 'engine': 'gTTS'},
            {'id': 'de', 'name': 'German', 'engine': 'gTTS'},
            {'id': 'it', 'name': 'Italian', 'engine': 'gTTS'},
            {'id': 'pt', 'name': 'Portuguese', 'engine': 'gTTS'},
            {'id': 'ru', 'name': 'Russian', 'engine': 'gTTS'},
            {'id': 'ja', 'name': 'Japanese', 'engine': 'gTTS'},
            {'id': 'ko', 'name': 'Korean', 'engine': 'gTTS'},
            {'id': 'zh', 'name': 'Chinese', 'engine': 'gTTS'}
        ]
        
        voices.extend(gtts_languages)
        
        return jsonify({
            'success': True,
            'voices': voices,
            'count': len(voices)
        })
        
    except Exception as e:
        logger.error(f"Error getting voices: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/status', methods=['GET'])
def get_speech_status():
    """Get speech system status"""
    try:
        status = {
            'speech_available': SPEECH_AVAILABLE,
            'engines': {
                'gtts': True,  # Always available if speech_available
                'pyttsx3': speech_manager.pyttsx_engine is not None,
                'whisper': speech_manager.whisper_model is not None,
                'google_stt': speech_manager.speech_recognizer is not None
            },
            'features': {
                'text_to_speech': True,
                'speech_to_text': True,
                'offline_tts': speech_manager.pyttsx_engine is not None,
                'offline_stt': speech_manager.whisper_model is not None,
                'multiple_languages': True
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error getting speech status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/test/tts', methods=['POST'])
def test_tts():
    """Test text-to-speech functionality"""
    try:
        test_text = "Hello! This is a test of the HearMeOut text-to-speech system."
        
        # Test with gTTS
        tts = gTTS(text=test_text, lang='en')
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            tts.save(temp_file.name)
            file_size = os.path.getsize(temp_file.name)
            os.unlink(temp_file.name)
        
        return jsonify({
            'success': True,
            'message': 'TTS test completed successfully',
            'test_text': test_text,
            'audio_generated': True,
            'file_size_bytes': file_size
        })
        
    except Exception as e:
        logger.error(f"TTS test error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@speech_bp.route('/emergency/speak', methods=['POST'])
def emergency_speak():
    """Emergency speech synthesis with high priority"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text data required'}), 400
        
        text = data['text']
        urgent = data.get('urgent', True)
        
        # Use faster settings for emergency
        rate = 180 if urgent else 150  # Faster speech for urgent messages
        
        # Generate speech quickly
        tts = gTTS(text=text, lang='en', slow=False)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            tts.save(temp_file.name)
            
            with open(temp_file.name, 'rb') as audio_file:
                audio_content = audio_file.read()
            
            os.unlink(temp_file.name)
        
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_data': audio_base64,
            'format': 'mp3',
            'text': text,
            'emergency': True,
            'urgent': urgent
        })
        
    except Exception as e:
        logger.error(f"Emergency speech error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500