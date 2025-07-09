import { saveOfflinePhrases } from './storage';

const ESSENTIAL_PHRASES = [
  // Emergency
  'Help me',
  'Emergency',
  'Call 911',
  'I need help',
  'Medical emergency',
  'Call doctor',
  'I am in pain',
  'I cannot breathe',
  'I am choking',
  'Fire',
  
  // Basic needs
  'Water',
  'Food',
  'Toilet',
  'Bathroom',
  'Rest',
  'Sit down',
  'Lie down',
  'Medicine',
  'Hot',
  'Cold',
  
  // Communication
  'Thank you',
  'Please',
  'Yes',
  'No',
  'I understand',
  'I do not understand',
  'Repeat please',
  'Speak slower',
  'Write it down',
  'Show me',
  
  // Medical
  'I have diabetes',
  'I have allergies',
  'I take medication',
  'I have a heart condition',
  'I am pregnant',
  'I am epileptic',
  'I need my inhaler',
  'I am deaf',
  'I am hard of hearing',
  'I cannot speak',
  
  // Shopping/Services
  'How much',
  'Where is',
  'Can you help me',
  'I need assistance',
  'Check out',
  'Receipt',
  'Return',
  'Exchange',
  'Customer service',
  'Manager',
  
  // Transportation
  'Bus',
  'Train',
  'Taxi',
  'Stop',
  'Next stop',
  'Ticket',
  'Platform',
  'Direction',
  'Lost',
  'Address',
  
  // Courtesy
  'Excuse me',
  'Sorry',
  'Good morning',
  'Good afternoon',
  'Good evening',
  'Goodbye',
  'Nice to meet you',
  'How are you',
  'I am fine',
  'Take care',
];

export const initializeOfflineData = async () => {
  try {
    // Save essential phrases for offline use
    saveOfflinePhrases(ESSENTIAL_PHRASES);
    
    // You could also preload other essential data here
    // like common ASL gestures, emergency contacts format, etc.
    
    console.log('Offline data initialized successfully');
  } catch (error) {
    console.error('Error initializing offline data:', error);
  }
};

export const getOfflinePhrase = (category: string): string[] => {
  const phrases = {
    emergency: ESSENTIAL_PHRASES.filter(phrase => 
      ['Help me', 'Emergency', 'Call 911', 'I need help', 'Medical emergency'].includes(phrase)
    ),
    basic: ESSENTIAL_PHRASES.filter(phrase => 
      ['Water', 'Food', 'Toilet', 'Bathroom', 'Thank you', 'Please', 'Yes', 'No'].includes(phrase)
    ),
    medical: ESSENTIAL_PHRASES.filter(phrase => 
      phrase.includes('diabetes') || phrase.includes('allergies') || phrase.includes('medication')
    ),
    all: ESSENTIAL_PHRASES,
  };
  
  return phrases[category as keyof typeof phrases] || phrases.all;
};