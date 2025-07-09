from flask import Blueprint, request, jsonify
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

translation_bp = Blueprint('translation', __name__)

# Supported languages with their codes
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'pl': 'Polish'
}

# Common emergency phrases in multiple languages
EMERGENCY_PHRASES = {
    'help': {
        'en': 'Help',
        'es': 'Ayuda',
        'fr': 'Aide',
        'de': 'Hilfe',
        'it': 'Aiuto',
        'pt': 'Ajuda',
        'ru': 'Помощь',
        'ja': '助けて',
        'ko': '도움',
        'zh': '帮助',
        'ar': 'مساعدة',
        'hi': 'मदद'
    },
    'emergency': {
        'en': 'Emergency',
        'es': 'Emergencia',
        'fr': 'Urgence',
        'de': 'Notfall',
        'it': 'Emergenza',
        'pt': 'Emergência',
        'ru': 'Экстренная ситуация',
        'ja': '緊急事態',
        'ko': '응급',
        'zh': '紧急情况',
        'ar': 'طارئ',
        'hi': 'आपातकाल'
    },
    'water': {
        'en': 'Water',
        'es': 'Agua',
        'fr': 'Eau',
        'de': 'Wasser',
        'it': 'Acqua',
        'pt': 'Água',
        'ru': 'Вода',
        'ja': '水',
        'ko': '물',
        'zh': '水',
        'ar': 'ماء',
        'hi': 'पानी'
    },
    'bathroom': {
        'en': 'Bathroom',
        'es': 'Baño',
        'fr': 'Toilettes',
        'de': 'Badezimmer',
        'it': 'Bagno',
        'pt': 'Banheiro',
        'ru': 'Туалет',
        'ja': 'トイレ',
        'ko': '화장실',
        'zh': '洗手间',
        'ar': 'حمام',
        'hi': 'स्नानघर'
    },
    'pain': {
        'en': 'Pain',
        'es': 'Dolor',
        'fr': 'Douleur',
        'de': 'Schmerz',
        'it': 'Dolore',
        'pt': 'Dor',
        'ru': 'Боль',
        'ja': '痛み',
        'ko': '고통',
        'zh': '疼痛',
        'ar': 'ألم',
        'hi': 'दर्द'
    },
    'thank_you': {
        'en': 'Thank you',
        'es': 'Gracias',
        'fr': 'Merci',
        'de': 'Danke',
        'it': 'Grazie',
        'pt': 'Obrigado',
        'ru': 'Спасибо',
        'ja': 'ありがとう',
        'ko': '감사합니다',
        'zh': '谢谢',
        'ar': 'شكرا',
        'hi': 'धन्यवाद'
    },
    'please': {
        'en': 'Please',
        'es': 'Por favor',
        'fr': 'S\'il vous plaît',
        'de': 'Bitte',
        'it': 'Per favore',
        'pt': 'Por favor',
        'ru': 'Пожалуйста',
        'ja': 'お願いします',
        'ko': '제발',
        'zh': '请',
        'ar': 'من فضلك',
        'hi': 'कृपया'
    },
    'where': {
        'en': 'Where',
        'es': 'Dónde',
        'fr': 'Où',
        'de': 'Wo',
        'it': 'Dove',
        'pt': 'Onde',
        'ru': 'Где',
        'ja': 'どこ',
        'ko': '어디',
        'zh': '哪里',
        'ar': 'أين',
        'hi': 'कहाँ'
    },
    'hospital': {
        'en': 'Hospital',
        'es': 'Hospital',
        'fr': 'Hôpital',
        'de': 'Krankenhaus',
        'it': 'Ospedale',
        'pt': 'Hospital',
        'ru': 'Больница',
        'ja': '病院',
        'ko': '병원',
        'zh': '医院',
        'ar': 'مستشفى',
        'hi': 'अस्पताल'
    },
    'medicine': {
        'en': 'Medicine',
        'es': 'Medicina',
        'fr': 'Médecine',
        'de': 'Medizin',
        'it': 'Medicina',
        'pt': 'Medicina',
        'ru': 'Лекарство',
        'ja': '薬',
        'ko': '약',
        'zh': '药',
        'ar': 'دواء',
        'hi': 'दवा'
    }
}

@translation_bp.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    try:
        return jsonify({
            'success': True,
            'languages': SUPPORTED_LANGUAGES,
            'count': len(SUPPORTED_LANGUAGES)
        })
        
    except Exception as e:
        logger.error(f"Error getting languages: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/phrases', methods=['GET'])
def get_common_phrases():
    """Get common phrases in all supported languages"""
    try:
        target_language = request.args.get('language', 'en')
        
        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400
        
        translated_phrases = {}
        for phrase_key, translations in EMERGENCY_PHRASES.items():
            if target_language in translations:
                translated_phrases[phrase_key] = translations[target_language]
            else:
                translated_phrases[phrase_key] = translations['en']  # Fallback to English
        
        return jsonify({
            'success': True,
            'language': target_language,
            'language_name': SUPPORTED_LANGUAGES[target_language],
            'phrases': translated_phrases
        })
        
    except Exception as e:
        logger.error(f"Error getting phrases: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/phrase', methods=['POST'])
def translate_phrase():
    """Translate a specific phrase to target language"""
    try:
        data = request.get_json()
        
        if not data or 'phrase' not in data or 'target_language' not in data:
            return jsonify({'error': 'Phrase and target_language required'}), 400
        
        phrase_key = data['phrase'].lower()
        target_language = data['target_language']
        
        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported target language'}), 400
        
        if phrase_key in EMERGENCY_PHRASES:
            translations = EMERGENCY_PHRASES[phrase_key]
            if target_language in translations:
                translated_text = translations[target_language]
            else:
                translated_text = translations['en']  # Fallback
            
            return jsonify({
                'success': True,
                'original_phrase': phrase_key,
                'target_language': target_language,
                'translated_text': translated_text,
                'available_languages': list(translations.keys())
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Phrase not found in common phrases'
            }), 404
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/emergency', methods=['GET'])
def get_emergency_phrases():
    """Get emergency phrases in specific language"""
    try:
        target_language = request.args.get('language', 'en')
        
        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400
        
        emergency_phrases = []
        emergency_keys = ['help', 'emergency', 'pain', 'hospital', 'medicine']
        
        for phrase_key in emergency_keys:
            if phrase_key in EMERGENCY_PHRASES:
                translations = EMERGENCY_PHRASES[phrase_key]
                if target_language in translations:
                    emergency_phrases.append({
                        'key': phrase_key,
                        'text': translations[target_language],
                        'category': 'emergency'
                    })
        
        return jsonify({
            'success': True,
            'language': target_language,
            'language_name': SUPPORTED_LANGUAGES[target_language],
            'emergency_phrases': emergency_phrases,
            'count': len(emergency_phrases)
        })
        
    except Exception as e:
        logger.error(f"Error getting emergency phrases: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/detect', methods=['POST'])
def detect_language():
    """Detect language of input text (basic implementation)"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text required'}), 400
        
        text = data['text'].lower()
        
        # Simple keyword-based language detection
        language_scores = {}
        
        for phrase_key, translations in EMERGENCY_PHRASES.items():
            for lang_code, translation in translations.items():
                if translation.lower() in text:
                    language_scores[lang_code] = language_scores.get(lang_code, 0) + 1
        
        if language_scores:
            detected_language = max(language_scores, key=language_scores.get)
            confidence = language_scores[detected_language] / len(text.split())
        else:
            detected_language = 'en'  # Default to English
            confidence = 0.1
        
        return jsonify({
            'success': True,
            'detected_language': detected_language,
            'language_name': SUPPORTED_LANGUAGES.get(detected_language, 'Unknown'),
            'confidence': min(confidence, 1.0),
            'all_scores': language_scores
        })
        
    except Exception as e:
        logger.error(f"Language detection error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/quick-commands', methods=['GET'])
def get_quick_commands():
    """Get quick command translations for target language"""
    try:
        target_language = request.args.get('language', 'en')
        
        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400
        
        quick_commands = []
        command_keys = ['help', 'water', 'bathroom', 'thank_you', 'please']
        
        for command_key in command_keys:
            if command_key in EMERGENCY_PHRASES:
                translations = EMERGENCY_PHRASES[command_key]
                if target_language in translations:
                    quick_commands.append({
                        'key': command_key,
                        'text': translations[target_language],
                        'english': translations['en'],
                        'category': 'common'
                    })
        
        return jsonify({
            'success': True,
            'language': target_language,
            'language_name': SUPPORTED_LANGUAGES[target_language],
            'quick_commands': quick_commands,
            'count': len(quick_commands)
        })
        
    except Exception as e:
        logger.error(f"Error getting quick commands: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/batch', methods=['POST'])
def batch_translate():
    """Translate multiple phrases at once"""
    try:
        data = request.get_json()
        
        if not data or 'phrases' not in data or 'target_language' not in data:
            return jsonify({'error': 'Phrases array and target_language required'}), 400
        
        phrases = data['phrases']
        target_language = data['target_language']
        
        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported target language'}), 400
        
        if len(phrases) > 20:  # Limit batch size
            return jsonify({'error': 'Maximum 20 phrases per batch'}), 400
        
        results = []
        
        for phrase in phrases:
            phrase_key = phrase.lower()
            if phrase_key in EMERGENCY_PHRASES:
                translations = EMERGENCY_PHRASES[phrase_key]
                if target_language in translations:
                    translated_text = translations[target_language]
                else:
                    translated_text = translations['en']
                
                results.append({
                    'original': phrase,
                    'translated': translated_text,
                    'found': True
                })
            else:
                results.append({
                    'original': phrase,
                    'translated': phrase,  # Return original if not found
                    'found': False
                })
        
        return jsonify({
            'success': True,
            'target_language': target_language,
            'language_name': SUPPORTED_LANGUAGES[target_language],
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Batch translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@translation_bp.route('/status', methods=['GET'])
def get_translation_status():
    """Get translation system status"""
    try:
        status = {
            'available': True,
            'supported_languages': len(SUPPORTED_LANGUAGES),
            'phrase_database_size': len(EMERGENCY_PHRASES),
            'features': {
                'phrase_translation': True,
                'language_detection': True,
                'batch_translation': True,
                'emergency_phrases': True,
                'quick_commands': True
            },
            'languages': list(SUPPORTED_LANGUAGES.keys())
        }
        
        return jsonify({
            'success': True,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error getting translation status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500