# 🎙️ HearMeOut

**Give them a voice, even when they can't use one.**

HearMeOut is a revolutionary communication web app designed for people who are deaf, hard of hearing, or can't speak. It helps them communicate instantly in real-life situations like stores, hospitals, buses, or emergencies without the need for signups or complicated setups.

![HearMeOut Demo](https://img.shields.io/badge/Status-Development-yellow)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🤖 AI-Powered Communication
- **ASL Recognition**: Real-time American Sign Language detection using MediaPipe
- **Emotion Analysis**: Detect urgency and distress in text using HuggingFace models
- **Speech Synthesis**: Text-to-speech with multiple languages and voices
- **Speech Recognition**: Voice-to-text using Whisper and Google Speech API

### 🌍 Multi-Language Support
- **20+ Languages**: Support for major world languages
- **Emergency Phrases**: Pre-translated critical phrases for emergencies
- **Auto-Detection**: Intelligent language detection from text input

### 🚨 Emergency Features
- **Emergency Mode**: Instant alert system for critical situations
- **Quick Commands**: One-tap buttons for "Help", "Water", "Toilet", etc.
- **Real-time Alerts**: WebSocket-based emergency broadcasting
- **Emergency Contacts**: Quick access to emergency services

### 💬 Communication Modes
- **Guest Access**: Use immediately without any registration
- **Two-Way Kiosk**: Digital interpreter between user and staff
- **Offline Mode**: Core features work without internet connection
- **Smart Glasses Simulation**: Optimized for wearable devices

### 👥 User Experience
- **Mobile-First**: Responsive design optimized for smartphones
- **Accessibility**: Full WCAG compliance with screen reader support
- **No Training Required**: Intuitive interface that works immediately
- **High-Pressure Ready**: Designed for stressful, real-world situations

## 🚀 Quick Start

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/hearmeout.git
cd hearmeout

# Start both frontend and backend
python start_development.py
```

That's it! The app will be available at `http://localhost:5173`

### Manual Setup

#### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Git**

#### Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start React development server
npm run dev
```

#### Backend Setup
```bash
# Install Python dependencies
cd backend
python install_dependencies.py

# Start Flask backend server
python start_backend.py
```

## 📦 Installation Options

### Development Installation
```bash
# Full development environment
npm run start              # Starts both frontend and backend
npm run dev               # Frontend only
npm run backend           # Backend only
npm run backend:install   # Install backend dependencies
```

### Production Installation
```bash
# Build for production
npm run build

# Deploy frontend to Vercel/Netlify
# Deploy backend to Render/Heroku
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── context/            # State management
├── utils/              # Utilities and API client
├── styles/             # CSS and styling
└── types/              # TypeScript definitions
```

### Backend (Flask + Python)
```
backend/
├── src/
│   ├── api/            # REST API endpoints
│   ├── models/         # AI/ML models
│   └── utils/          # Backend utilities
├── requirements.txt    # Python dependencies
└── start_backend.py   # Server startup script
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Flask, Socket.IO, OpenCV, MediaPipe
- **AI/ML**: TensorFlow, HuggingFace Transformers, Whisper
- **Speech**: gTTS, pyttsx3, SpeechRecognition
- **Real-time**: WebSocket connections for live features

## 🎯 Usage

### For Users

#### Instant Communication
1. **Open the app** - No signup required
2. **Choose your method**: 
   - Type your message
   - Use sign language with camera
   - Tap quick command buttons
3. **The app speaks** your message out loud
4. **Staff can respond** using the two-way kiosk mode

#### Emergency Situations
1. **Tap Emergency** button for instant alerts
2. **Type urgent messages** - emotion detection triggers emergency mode automatically
3. **Use ASL emergency signs** - "help" and "emergency" are prioritized
4. **Quick emergency phrases** in multiple languages

#### Sign Language Recognition
1. **Enable camera** when prompted
2. **Sign clearly** in front of the camera
3. **Wait for detection** - the app speaks what it recognizes
4. **History tracking** shows recent signs detected

### For Staff and Businesses

#### Kiosk Mode Setup
1. **Open Kiosk Mode** on a tablet or computer
2. **Position screen** so both user and staff can see
3. **User types/signs** on one side
4. **Staff responds** on the other side
5. **Everything is spoken** out loud automatically

#### Emergency Response
1. **Emergency alerts** appear prominently on all connected devices
2. **Contact information** is displayed automatically
3. **Response tracking** helps manage emergency situations
4. **Staff training** module teaches basic sign language and etiquette

## 🔧 Configuration

### Environment Variables
Create `.env` files for configuration:

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_ENABLE_OFFLINE=true
VITE_DEBUG=true
```

#### Backend (backend/.env)
```bash
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Features Configuration
```javascript
// Customize features in src/config.js
export const config = {
  enableASL: true,
  enableEmotionAnalysis: true,
  enableOfflineMode: true,
  supportedLanguages: ['en', 'es', 'fr', 'de'],
  emergencyContacts: {
    general: '911',
    medical: '911'
  }
};
```

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure accessibility compliance
- Test on mobile devices

## 🔒 Privacy & Security

- **No Data Collection**: Guest mode stores nothing on servers
- **Local Storage**: User preferences stored locally only
- **Optional Accounts**: Registration is completely optional
- **Emergency Privacy**: Emergency data is only kept for safety purposes
- **HIPAA Considerations**: Designed with healthcare privacy in mind

## 📱 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend.render.com
```

### Backend Deployment (Render)
```bash
# Connect your GitHub repository to Render
# Set build command: pip install -r requirements.txt
# Set start command: python start_backend.py
```

### Environment Variables for Production
- Set `FLASK_DEBUG=False` for production
- Configure proper CORS origins
- Set secure secret keys
- Configure logging

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
cd backend
pip install -r requirements.txt

# Check for missing system dependencies
python install_dependencies.py
```

#### Camera Not Working
- Ensure HTTPS in production (camera requires secure context)
- Check browser permissions
- Try different browsers
- Verify camera is not used by other applications

#### Speech Not Working
- Check browser audio permissions
- Verify microphone/speaker functionality
- Try different speech engines (gTTS vs pyttsx3)
- Check internet connection for online features

#### WebSocket Connection Issues
- Verify backend is running on correct port
- Check firewall settings
- Ensure CORS is properly configured
- Try different network connections

### Getting Help

1. **Check the [Issues](https://github.com/yourusername/hearmeout/issues)** for similar problems
2. **Search the documentation** for relevant information
3. **Create a new issue** with detailed information:
   - Operating system
   - Browser version
   - Error messages
   - Steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Deaf and Hard of Hearing Community** for inspiration and feedback
- **MediaPipe Team** for excellent computer vision tools
- **HuggingFace** for democratizing AI/ML
- **OpenAI** for Whisper speech recognition
- **React and Flask Communities** for amazing frameworks

## 🌟 Supporting the Project

If HearMeOut helps you or someone you know, consider:

- ⭐ **Starring the repository**
- 🐛 **Reporting bugs** and suggesting features
- 💡 **Contributing code** or documentation
- 📢 **Sharing with others** who might benefit
- 💝 **Sponsoring development** (GitHub Sponsors)

---

**HearMeOut** - Because everyone deserves to be heard.

Made with ❤️ for the deaf, hard of hearing, and non-speaking community.
