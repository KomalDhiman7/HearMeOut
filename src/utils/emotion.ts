import { EmotionAnalysis } from '../types';

const URGENCY_KEYWORDS = {
  critical: ['help', 'emergency', 'urgent', 'panic', 'pain', 'hurt', 'dying', 'bleeding', 'stop', 'fire', 'police', 'ambulance', 'danger', 'attack', 'sick', 'cannot breathe', 'choking', 'heart attack', 'stroke', 'overdose'],
  high: ['need', 'please', 'important', 'quickly', 'fast', 'now', 'immediate', 'scared', 'worried', 'stressed', 'anxious', 'trouble', 'problem', 'wrong', 'bad', 'serious'],
  medium: ['want', 'would like', 'prefer', 'better', 'good', 'okay', 'fine', 'maybe', 'think', 'feel', 'hope', 'wish'],
  low: ['thank', 'thanks', 'hello', 'hi', 'goodbye', 'bye', 'nice', 'pleasant', 'great', 'wonderful', 'excellent'],
};

const EMOTION_KEYWORDS = {
  angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'upset', 'annoyed', 'frustrated', 'irritated'],
  fearful: ['scared', 'afraid', 'terrified', 'frightened', 'worried', 'anxious', 'nervous', 'panic'],
  sad: ['sad', 'depressed', 'unhappy', 'disappointed', 'hurt', 'lonely', 'miserable', 'grief'],
  happy: ['happy', 'excited', 'joy', 'glad', 'cheerful', 'pleased', 'delighted', 'thrilled'],
  surprised: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'sudden'],
  disgusted: ['disgusted', 'sick', 'revolted', 'appalled', 'horrified', 'repulsed'],
};

export const analyzeEmotion = (text: string): EmotionAnalysis => {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  // Detect urgency
  let urgency: EmotionAnalysis['urgency'] = 'low';
  let urgencyScore = 0;
  const foundKeywords: string[] = [];
  
  Object.entries(URGENCY_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        foundKeywords.push(keyword);
        const score = level === 'critical' ? 4 : level === 'high' ? 3 : level === 'medium' ? 2 : 1;
        urgencyScore = Math.max(urgencyScore, score);
      }
    });
  });
  
  urgency = urgencyScore >= 4 ? 'critical' : urgencyScore >= 3 ? 'high' : urgencyScore >= 2 ? 'medium' : 'low';
  
  // Detect emotion
  let emotion: EmotionAnalysis['emotion'] = 'neutral';
  let emotionScore = 0;
  
  Object.entries(EMOTION_KEYWORDS).forEach(([emotionType, keywords]) => {
    const matches = keywords.filter(keyword => normalizedText.includes(keyword));
    if (matches.length > emotionScore) {
      emotionScore = matches.length;
      emotion = emotionType as EmotionAnalysis['emotion'];
      foundKeywords.push(...matches);
    }
  });
  
  // Calculate confidence based on keyword matches and text length
  const confidence = Math.min(
    (foundKeywords.length / Math.max(words.length, 1)) * 100 + 
    (foundKeywords.length * 10),
    100
  );
  
  return {
    emotion,
    urgency,
    confidence: Math.round(confidence),
    keywords: [...new Set(foundKeywords)],
  };
};

export const shouldTriggerEmergency = (analysis: EmotionAnalysis): boolean => {
  return analysis.urgency === 'critical' || 
         (analysis.urgency === 'high' && analysis.confidence > 70) ||
         (analysis.emotion === 'fearful' && analysis.confidence > 80);
};