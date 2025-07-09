import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging
import re
import json

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    """Advanced emotion and urgency analyzer using HuggingFace models"""
    
    _instance = None
    _model_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmotionAnalyzer, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            
            try:
                # Initialize emotion detection pipeline
                self.emotion_pipeline = pipeline(
                    "text-classification",
                    model="j-hartmann/emotion-english-distilroberta-base",
                    device=0 if torch.cuda.is_available() else -1
                )
                
                # Initialize sentiment analysis for urgency detection
                self.sentiment_pipeline = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                    device=0 if torch.cuda.is_available() else -1
                )
                
                # Emergency keywords with severity levels
                self.emergency_keywords = {
                    'critical': {
                        'medical': ['heart attack', 'stroke', 'can\'t breathe', 'choking', 'bleeding', 'overdose', 'seizure', 'unconscious', 'dying'],
                        'safety': ['fire', 'emergency', 'danger', 'attack', 'threat', 'violent', 'weapon', 'bomb'],
                        'distress': ['help me', 'save me', 'urgent', 'immediate', 'now', 'quick', 'hurry']
                    },
                    'high': {
                        'pain': ['pain', 'hurt', 'ache', 'agony', 'suffering', 'injury', 'wound'],
                        'emotional': ['panic', 'scared', 'terrified', 'afraid', 'anxious', 'worried', 'stressed'],
                        'needs': ['need help', 'assistance', 'support', 'aid', 'rescue']
                    },
                    'medium': {
                        'discomfort': ['uncomfortable', 'upset', 'bothered', 'concerned', 'troubled'],
                        'requests': ['please', 'could you', 'would you', 'can you', 'help'],
                        'problems': ['problem', 'issue', 'difficulty', 'trouble', 'challenge']
                    }
                }
                
                # Emotion mapping for better understanding
                self.emotion_mapping = {
                    'anger': {'weight': 0.8, 'urgency_boost': 0.3},
                    'fear': {'weight': 0.9, 'urgency_boost': 0.5},
                    'sadness': {'weight': 0.6, 'urgency_boost': 0.2},
                    'joy': {'weight': 0.2, 'urgency_boost': -0.3},
                    'surprise': {'weight': 0.4, 'urgency_boost': 0.1},
                    'disgust': {'weight': 0.5, 'urgency_boost': 0.2},
                    'neutral': {'weight': 0.3, 'urgency_boost': 0.0}
                }
                
                # Context patterns for better understanding
                self.context_patterns = {
                    'location_emergency': r'\b(hospital|ambulance|police|fire department|emergency room|911|999|112)\b',
                    'time_urgency': r'\b(now|immediately|urgent|asap|quickly|fast|hurry|rush)\b',
                    'pain_indicators': r'\b(hurt|pain|ache|burning|sharp|throbbing|stabbing)\b',
                    'help_requests': r'\b(help|assist|aid|support|rescue|save)\b',
                    'negation': r'\b(not|no|never|can\'t|cannot|won\'t|don\'t)\b'
                }
                
                EmotionAnalyzer._model_loaded = True
                logger.info("Emotion Analyzer initialized successfully")
                
            except Exception as e:
                logger.error(f"Failed to initialize emotion analyzer: {str(e)}")
                # Fallback to rule-based approach
                self.emotion_pipeline = None
                self.sentiment_pipeline = None
                EmotionAnalyzer._model_loaded = False
    
    @classmethod
    def is_model_loaded(cls) -> bool:
        return cls._model_loaded
    
    def analyze_emotion(self, text: str) -> Dict:
        """Analyze emotion from text using both ML models and rules"""
        try:
            if not text or not text.strip():
                return self._default_analysis()
            
            cleaned_text = self._preprocess_text(text)
            
            # Get ML-based analysis if models are available
            ml_emotion = self._get_ml_emotion(cleaned_text)
            ml_sentiment = self._get_ml_sentiment(cleaned_text)
            
            # Get rule-based analysis
            rule_analysis = self._get_rule_based_analysis(cleaned_text)
            
            # Combine analyses
            final_analysis = self._combine_analyses(ml_emotion, ml_sentiment, rule_analysis, cleaned_text)
            
            return final_analysis
            
        except Exception as e:
            logger.error(f"Error in emotion analysis: {str(e)}")
            return self._default_analysis()
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for analysis"""
        # Convert to lowercase
        text = text.lower().strip()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Handle common abbreviations
        text = text.replace("i'm", "i am")
        text = text.replace("can't", "cannot")
        text = text.replace("won't", "will not")
        text = text.replace("don't", "do not")
        
        return text
    
    def _get_ml_emotion(self, text: str) -> Optional[Dict]:
        """Get emotion analysis from ML model"""
        try:
            if not self.emotion_pipeline:
                return None
            
            results = self.emotion_pipeline(text)
            
            if results and len(results) > 0:
                top_emotion = results[0]
                return {
                    'emotion': top_emotion['label'].lower(),
                    'confidence': top_emotion['score'],
                    'all_emotions': [(r['label'].lower(), r['score']) for r in results[:3]]
                }
            
            return None
            
        except Exception as e:
            logger.warning(f"ML emotion analysis failed: {str(e)}")
            return None
    
    def _get_ml_sentiment(self, text: str) -> Optional[Dict]:
        """Get sentiment analysis from ML model"""
        try:
            if not self.sentiment_pipeline:
                return None
            
            results = self.sentiment_pipeline(text)
            
            if results and len(results) > 0:
                sentiment = results[0]
                return {
                    'sentiment': sentiment['label'].lower(),
                    'confidence': sentiment['score']
                }
            
            return None
            
        except Exception as e:
            logger.warning(f"ML sentiment analysis failed: {str(e)}")
            return None
    
    def _get_rule_based_analysis(self, text: str) -> Dict:
        """Get rule-based emotion and urgency analysis"""
        urgency_score = 0.0
        urgency_level = 'low'
        detected_keywords = []
        context_flags = {}
        
        # Check context patterns
        for pattern_name, pattern in self.context_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                context_flags[pattern_name] = len(matches)
        
        # Check emergency keywords
        for severity, categories in self.emergency_keywords.items():
            severity_multiplier = {'critical': 1.0, 'high': 0.7, 'medium': 0.4}[severity]
            
            for category, keywords in categories.items():
                for keyword in keywords:
                    if keyword.lower() in text:
                        detected_keywords.append({
                            'keyword': keyword,
                            'category': category,
                            'severity': severity,
                            'score': severity_multiplier
                        })
                        urgency_score += severity_multiplier
        
        # Determine urgency level
        if urgency_score >= 1.0 or context_flags.get('location_emergency', 0) > 0:
            urgency_level = 'critical'
        elif urgency_score >= 0.5 or context_flags.get('time_urgency', 0) > 0:
            urgency_level = 'high'
        elif urgency_score >= 0.2 or context_flags.get('help_requests', 0) > 0:
            urgency_level = 'medium'
        
        # Adjust for negation
        if context_flags.get('negation', 0) > 0 and urgency_level != 'critical':
            urgency_score *= 0.5
            if urgency_level == 'high':
                urgency_level = 'medium'
            elif urgency_level == 'medium':
                urgency_level = 'low'
        
        return {
            'urgency_score': min(urgency_score, 1.0),
            'urgency_level': urgency_level,
            'keywords': detected_keywords,
            'context_flags': context_flags
        }
    
    def _combine_analyses(self, ml_emotion: Optional[Dict], ml_sentiment: Optional[Dict], 
                         rule_analysis: Dict, text: str) -> Dict:
        """Combine ML and rule-based analyses"""
        
        # Start with rule-based urgency
        urgency_level = rule_analysis['urgency_level']
        urgency_score = rule_analysis['urgency_score']
        
        # Primary emotion
        primary_emotion = 'neutral'
        emotion_confidence = 0.5
        
        if ml_emotion:
            primary_emotion = ml_emotion['emotion']
            emotion_confidence = ml_emotion['confidence']
            
            # Boost urgency based on emotion
            if primary_emotion in self.emotion_mapping:
                emotion_data = self.emotion_mapping[primary_emotion]
                urgency_boost = emotion_data['urgency_boost']
                urgency_score = min(urgency_score + urgency_boost, 1.0)
                
                # Recalculate urgency level
                if urgency_score >= 0.8:
                    urgency_level = 'critical'
                elif urgency_score >= 0.5:
                    urgency_level = 'high'
                elif urgency_score >= 0.2:
                    urgency_level = 'medium'
        
        # Calculate overall confidence
        overall_confidence = self._calculate_confidence(ml_emotion, ml_sentiment, rule_analysis, text)
        
        # Determine if emergency mode should be triggered
        should_trigger_emergency = self._should_trigger_emergency(urgency_level, urgency_score, 
                                                                primary_emotion, overall_confidence)
        
        return {
            'emotion': primary_emotion,
            'emotion_confidence': round(emotion_confidence * 100, 1),
            'urgency_level': urgency_level,
            'urgency_score': round(urgency_score * 100, 1),
            'overall_confidence': round(overall_confidence * 100, 1),
            'should_trigger_emergency': should_trigger_emergency,
            'detected_keywords': rule_analysis['keywords'],
            'context_flags': rule_analysis['context_flags'],
            'ml_available': ml_emotion is not None,
            'analysis_details': {
                'ml_emotion': ml_emotion,
                'ml_sentiment': ml_sentiment,
                'rule_based': rule_analysis
            }
        }
    
    def _calculate_confidence(self, ml_emotion: Optional[Dict], ml_sentiment: Optional[Dict], 
                            rule_analysis: Dict, text: str) -> float:
        """Calculate overall confidence in the analysis"""
        confidence_factors = []
        
        # ML model confidence
        if ml_emotion:
            confidence_factors.append(ml_emotion['confidence'])
        
        if ml_sentiment:
            confidence_factors.append(ml_sentiment['confidence'])
        
        # Rule-based confidence
        keyword_count = len(rule_analysis['keywords'])
        context_count = sum(rule_analysis['context_flags'].values())
        text_length = len(text.split())
        
        rule_confidence = min((keyword_count + context_count) / max(text_length, 1), 1.0)
        confidence_factors.append(rule_confidence)
        
        # Calculate weighted average
        if confidence_factors:
            return np.mean(confidence_factors)
        
        return 0.5
    
    def _should_trigger_emergency(self, urgency_level: str, urgency_score: float, 
                                emotion: str, confidence: float) -> bool:
        """Determine if emergency mode should be triggered"""
        
        # Always trigger for critical urgency with good confidence
        if urgency_level == 'critical' and confidence > 0.7:
            return True
        
        # Trigger for high urgency with very good confidence
        if urgency_level == 'high' and confidence > 0.8:
            return True
        
        # Trigger for fear emotion with high urgency
        if emotion == 'fear' and urgency_level in ['high', 'critical']:
            return True
        
        # Trigger for high urgency score regardless of level
        if urgency_score > 0.9:
            return True
        
        return False
    
    def _default_analysis(self) -> Dict:
        """Return default analysis when processing fails"""
        return {
            'emotion': 'neutral',
            'emotion_confidence': 50.0,
            'urgency_level': 'low',
            'urgency_score': 0.0,
            'overall_confidence': 30.0,
            'should_trigger_emergency': False,
            'detected_keywords': [],
            'context_flags': {},
            'ml_available': False,
            'analysis_details': {}
        }
    
    def batch_analyze(self, texts: List[str]) -> List[Dict]:
        """Analyze multiple texts efficiently"""
        results = []
        
        for text in texts:
            result = self.analyze_emotion(text)
            results.append(result)
        
        return results
    
    def get_emotion_summary(self, texts: List[str]) -> Dict:
        """Get summary of emotions across multiple texts"""
        if not texts:
            return {'dominant_emotion': 'neutral', 'average_urgency': 0.0, 'emergency_count': 0}
        
        analyses = self.batch_analyze(texts)
        
        # Count emotions
        emotion_counts = {}
        urgency_scores = []
        emergency_count = 0
        
        for analysis in analyses:
            emotion = analysis['emotion']
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            urgency_scores.append(analysis['urgency_score'] / 100.0)
            
            if analysis['should_trigger_emergency']:
                emergency_count += 1
        
        # Find dominant emotion
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else 'neutral'
        average_urgency = np.mean(urgency_scores) if urgency_scores else 0.0
        
        return {
            'dominant_emotion': dominant_emotion,
            'emotion_distribution': emotion_counts,
            'average_urgency': round(average_urgency * 100, 1),
            'emergency_count': emergency_count,
            'total_analyzed': len(texts)
        }