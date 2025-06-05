📁 tech-news-app/
├── 📁 client/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📄 NewsCard.js
│   │   │   ├── 📄 CredibilityScore.js
│   │   │   ├── 📄 VoiceControls.js
│   │   │   ├── 📄 TechCalendar.js
│   │   │   ├── 📄 UserPreferences.js
│   │   │   └── 📄 FactCheckBadge.js
│   │   ├── 📁 services/
│   │   │   ├── 📄 newsService.js
│   │   │   ├── 📄 credibilityService.js
│   │   │   ├── 📄 speechService.js
│   │   │   ├── 📄 calendarService.js
│   │   │   └── 📄 factCheckService.js
│   │   ├── 📁 utils/
│   │   │   ├── 📄 voiceCommands.js
│   │   │   └── 📄 localStorage.js
│   │   └── 📁 hooks/
│   │       ├── 📄 useCredibility.js
│   │       ├── 📄 useSpeech.js
│   │       └── 📄 usePreferences.js
├── 📁 server/
│   ├── 📁 models/
│   │   ├── 📄 User.js
│   │   ├── 📄 Article.js
│   │   └── 📄 Preference.js
│   ├── 📁 routes/
│   │   ├── 📄 news.js
│   │   ├── 📄 credibility.js
│   │   └── 📄 events.js
│   ├── 📁 services/
│   │   ├── 📄 credibilityCheck.js
│   │   ├── 📄 factCheck.js
│   │   └── 📄 eventScraper.js
│   └── 📁 config/
│       └── 📄 apis.js 