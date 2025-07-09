import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from typing import Dict, List, Tuple, Optional
import logging
import json
import os

logger = logging.getLogger(__name__)

class ASLDetector:
    """Advanced ASL (American Sign Language) detector using MediaPipe and custom models"""
    
    _instance = None
    _model_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ASLDetector, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.initialized = True
            self.mp_hands = mp.solutions.hands
            self.mp_pose = mp.solutions.pose
            self.mp_drawing = mp.solutions.drawing_utils
            
            # Initialize MediaPipe models
            self.hands = self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.7,
                min_tracking_confidence=0.5
            )
            
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                min_detection_confidence=0.7,
                min_tracking_confidence=0.5
            )
            
            # ASL alphabet and common signs dictionary
            self.asl_signs = {
                'A': [0.1, 0.9, 0.8, 0.2, 0.1],  # Simplified gesture vectors
                'B': [0.9, 0.9, 0.9, 0.9, 0.1],
                'C': [0.7, 0.3, 0.3, 0.3, 0.2],
                'D': [0.2, 0.9, 0.1, 0.1, 0.1],
                'E': [0.1, 0.1, 0.1, 0.1, 0.1],
                'F': [0.1, 0.1, 0.9, 0.9, 0.9],
                'G': [0.5, 0.9, 0.1, 0.1, 0.1],
                'H': [0.5, 0.9, 0.9, 0.1, 0.1],
                'I': [0.1, 0.1, 0.1, 0.1, 0.9],
                'J': [0.1, 0.1, 0.1, 0.1, 0.8],
                'K': [0.5, 0.9, 0.7, 0.1, 0.1],
                'L': [0.9, 0.9, 0.1, 0.1, 0.1],
                'M': [0.2, 0.2, 0.2, 0.2, 0.9],
                'N': [0.2, 0.2, 0.9, 0.9, 0.9],
                'O': [0.5, 0.5, 0.5, 0.5, 0.5],
                'P': [0.5, 0.9, 0.7, 0.1, 0.1],
                'Q': [0.3, 0.7, 0.1, 0.1, 0.9],
                'R': [0.1, 0.9, 0.7, 0.1, 0.1],
                'S': [0.1, 0.1, 0.1, 0.1, 0.1],
                'T': [0.2, 0.1, 0.1, 0.1, 0.9],
                'U': [0.1, 0.9, 0.9, 0.1, 0.1],
                'V': [0.1, 0.9, 0.9, 0.1, 0.1],
                'W': [0.1, 0.9, 0.9, 0.9, 0.1],
                'X': [0.2, 0.7, 0.1, 0.1, 0.1],
                'Y': [0.9, 0.1, 0.1, 0.1, 0.9],
                'Z': [0.8, 0.9, 0.1, 0.1, 0.1],
            }
            
            # Common words and phrases
            self.common_signs = {
                'hello': {'gesture': [0.5, 0.8, 0.3, 0.2, 0.1], 'movement': 'wave'},
                'thank you': {'gesture': [0.7, 0.2, 0.1, 0.1, 0.1], 'movement': 'forward'},
                'please': {'gesture': [0.6, 0.4, 0.2, 0.1, 0.1], 'movement': 'circular'},
                'help': {'gesture': [0.8, 0.9, 0.1, 0.1, 0.1], 'movement': 'upward'},
                'water': {'gesture': [0.3, 0.7, 0.2, 0.1, 0.1], 'movement': 'drinking'},
                'food': {'gesture': [0.4, 0.6, 0.3, 0.2, 0.1], 'movement': 'eating'},
                'bathroom': {'gesture': [0.9, 0.1, 0.1, 0.1, 0.1], 'movement': 'shake'},
                'emergency': {'gesture': [0.9, 0.9, 0.9, 0.1, 0.1], 'movement': 'urgent'},
                'pain': {'gesture': [0.8, 0.8, 0.1, 0.1, 0.1], 'movement': 'pointing'},
                'yes': {'gesture': [0.1, 0.1, 0.1, 0.1, 0.1], 'movement': 'nodding'},
                'no': {'gesture': [0.5, 0.9, 0.1, 0.1, 0.1], 'movement': 'shaking'},
                'sorry': {'gesture': [0.6, 0.3, 0.1, 0.1, 0.1], 'movement': 'circular'},
                'excuse me': {'gesture': [0.7, 0.5, 0.2, 0.1, 0.1], 'movement': 'tapping'},
                'goodbye': {'gesture': [0.5, 0.8, 0.3, 0.2, 0.1], 'movement': 'wave'},
                'where': {'gesture': [0.8, 0.9, 0.1, 0.1, 0.1], 'movement': 'questioning'},
            }
            
            self.detection_history = []
            self.current_gesture = None
            self.gesture_stability_count = 0
            self.min_stability_frames = 5
            
            ASLDetector._model_loaded = True
            logger.info("ASL Detector initialized successfully")
    
    @classmethod
    def is_model_loaded(cls) -> bool:
        return cls._model_loaded
    
    def extract_hand_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """Extract hand landmarks from image using MediaPipe"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_image)
            
            if results.multi_hand_landmarks:
                landmarks_data = []
                for hand_landmarks in results.multi_hand_landmarks:
                    # Extract 21 landmark points for each hand
                    landmarks = []
                    for landmark in hand_landmarks.landmark:
                        landmarks.extend([landmark.x, landmark.y, landmark.z])
                    landmarks_data.append(landmarks)
                
                return {
                    'landmarks': landmarks_data,
                    'hand_count': len(results.multi_hand_landmarks),
                    'handedness': [hand.classification[0].label for hand in results.multi_handedness] if results.multi_handedness else []
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting hand landmarks: {str(e)}")
            return None
    
    def extract_pose_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """Extract pose landmarks for full-body ASL signs"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_image)
            
            if results.pose_landmarks:
                landmarks = []
                for landmark in results.pose_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
                
                return {
                    'landmarks': landmarks,
                    'pose_detected': True
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting pose landmarks: {str(e)}")
            return None
    
    def calculate_gesture_features(self, hand_landmarks: List[float]) -> List[float]:
        """Calculate simplified gesture features from hand landmarks"""
        if len(hand_landmarks) < 63:  # 21 landmarks * 3 coordinates
            return [0.0] * 5
        
        features = []
        
        # Finger tip positions (simplified)
        thumb_tip = hand_landmarks[12:15]  # Landmark 4
        index_tip = hand_landmarks[24:27]  # Landmark 8
        middle_tip = hand_landmarks[36:39]  # Landmark 12
        ring_tip = hand_landmarks[48:51]   # Landmark 16
        pinky_tip = hand_landmarks[60:63]  # Landmark 20
        
        # Simplified feature extraction
        # Feature 1: Thumb extension
        features.append(thumb_tip[1])  # Y coordinate
        
        # Feature 2: Index finger extension
        features.append(1.0 - index_tip[1])  # Inverted Y
        
        # Feature 3: Middle finger extension
        features.append(1.0 - middle_tip[1])
        
        # Feature 4: Ring finger extension
        features.append(1.0 - ring_tip[1])
        
        # Feature 5: Pinky extension
        features.append(1.0 - pinky_tip[1])
        
        return features
    
    def recognize_sign(self, features: List[float]) -> Tuple[str, float]:
        """Recognize ASL sign from gesture features"""
        if not features or len(features) < 5:
            return "unknown", 0.0
        
        best_match = "unknown"
        best_confidence = 0.0
        
        # Check alphabet signs
        for sign, pattern in self.asl_signs.items():
            confidence = self.calculate_similarity(features, pattern)
            if confidence > best_confidence:
                best_confidence = confidence
                best_match = sign
        
        # Check common word signs
        for sign, data in self.common_signs.items():
            confidence = self.calculate_similarity(features, data['gesture'])
            if confidence > best_confidence:
                best_confidence = confidence
                best_match = sign
        
        # Only return results with reasonable confidence
        if best_confidence > 0.6:
            return best_match, best_confidence
        
        return "unknown", 0.0
    
    def calculate_similarity(self, features1: List[float], features2: List[float]) -> float:
        """Calculate similarity between two gesture feature vectors"""
        if len(features1) != len(features2):
            return 0.0
        
        # Euclidean distance similarity
        distance = np.sqrt(sum((a - b) ** 2 for a, b in zip(features1, features2)))
        max_distance = np.sqrt(len(features1))  # Maximum possible distance
        similarity = 1.0 - (distance / max_distance)
        
        return max(0.0, similarity)
    
    def detect_from_frame(self, frame: np.ndarray) -> Dict:
        """Detect ASL signs from a single frame"""
        try:
            # Extract hand landmarks
            hand_data = self.extract_hand_landmarks(frame)
            
            if not hand_data or not hand_data['landmarks']:
                return {
                    'detected': False,
                    'sign': 'none',
                    'confidence': 0.0,
                    'message': 'No hands detected'
                }
            
            # Use the first detected hand for recognition
            primary_hand = hand_data['landmarks'][0]
            features = self.calculate_gesture_features(primary_hand)
            
            # Recognize the sign
            sign, confidence = self.recognize_sign(features)
            
            # Stability checking for better accuracy
            if sign == self.current_gesture:
                self.gesture_stability_count += 1
            else:
                self.current_gesture = sign
                self.gesture_stability_count = 1
            
            # Only return stable detections
            if self.gesture_stability_count >= self.min_stability_frames:
                stable_detection = True
                final_confidence = min(confidence * 100, 95.0)  # Cap at 95%
            else:
                stable_detection = False
                final_confidence = confidence * 100 * 0.7  # Reduced confidence for unstable
            
            result = {
                'detected': True,
                'sign': sign,
                'confidence': round(final_confidence, 1),
                'stable': stable_detection,
                'hand_count': hand_data['hand_count'],
                'handedness': hand_data.get('handedness', []),
                'features': features[:3]  # Return first 3 features for debugging
            }
            
            # Add to history
            if stable_detection and sign != 'unknown':
                self.detection_history.append({
                    'sign': sign,
                    'confidence': final_confidence,
                    'timestamp': np.datetime64('now')
                })
                
                # Keep only recent history
                if len(self.detection_history) > 10:
                    self.detection_history = self.detection_history[-10:]
            
            return result
            
        except Exception as e:
            logger.error(f"Error in ASL detection: {str(e)}")
            return {
                'detected': False,
                'sign': 'error',
                'confidence': 0.0,
                'message': f'Detection error: {str(e)}'
            }
    
    def get_detection_history(self) -> List[Dict]:
        """Get recent detection history"""
        return self.detection_history.copy()
    
    def reset_detection(self):
        """Reset detection state"""
        self.current_gesture = None
        self.gesture_stability_count = 0
        self.detection_history.clear()
        logger.info("ASL detection state reset")
    
    def draw_landmarks(self, image: np.ndarray, landmarks_data: Dict) -> np.ndarray:
        """Draw hand landmarks on image for visualization"""
        try:
            if not landmarks_data or not landmarks_data['landmarks']:
                return image
            
            # Convert landmarks back to MediaPipe format for drawing
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_image)
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
            
            return image
            
        except Exception as e:
            logger.error(f"Error drawing landmarks: {str(e)}")
            return image
    
    def __del__(self):
        """Cleanup resources"""
        try:
            if hasattr(self, 'hands'):
                self.hands.close()
            if hasattr(self, 'pose'):
                self.pose.close()
        except:
            pass