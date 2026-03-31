# NeuraTrack Frontend

A modern, AI-powered epilepsy management web application. Built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [PWA Setup](#pwa-setup)
- [Offline Mode](#offline-mode)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [License](#license)

## 🧠 Overview

NeuraTrack is a comprehensive epilepsy management platform that helps users track seizures, manage medications, and gain insights through AI-powered analysis. The app works offline, sends medication reminders, and provides emergency SOS functionality.

## ✨ Features

### Core Features

- 🔐 **Authentication** - Secure JWT-based login and registration
- 📝 **AI Seizure Logger** - Natural language parsing with confidence scoring
- 📊 **Analytics Dashboard** - Interactive charts and insights
- 💊 **Medication Tracker** - Smart reminders and adherence tracking
- 💬 **AI Chat Assistant** - Personalized health insights
- 🚨 **Emergency SOS** - Instant alerts to selected contacts via SMS/WhatsApp
- 📄 **Reports & Export** - PDF reports and shareable links for doctors

### Mobile & Offline

- 📱 **PWA Support** - Installable on mobile devices
- 📴 **Offline Mode** - Log seizures without internet, sync when back online
- 🔔 **Push Notifications** - Medication reminders
- 📲 **Mobile-Optimized UI** - Bottom navigation, swipe gestures

## 🛠️ Tech Stack

| Technology            | Purpose                       |
| --------------------- | ----------------------------- |
| React 18              | UI framework                  |
| TypeScript            | Type safety                   |
| Tailwind CSS          | Styling                       |
| Vite                  | Build tool                    |
| TanStack Query        | Data fetching & caching       |
| React Router v6       | Navigation                    |
| React Hook Form + Zod | Form validation               |
| Recharts              | Data visualization            |
| Dexie.js              | IndexedDB for offline storage |
| jsPDF                 | PDF generation                |
| Lucide React          | Icons                         |
| Sentry                | Error tracking                |

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see [NeuraTrack Backend](https://github.com/yourusername/neuratrack-backend))

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/neuratrack-frontend.git
cd neuratrack-frontend
```

````

2. Install dependencies:

```bash
npm install
```

3. Create environment files (see [Environment Variables](#environment-variables))

4. Start the development server:

```bash
npm run dev
```

## 🌍 Environment Variables

Create `.env.development` for local development:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=NeuraTrack (Dev)
VITE_APP_ENV=development

# Debug Configuration
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_LOGGING=true
VITE_ENABLE_MOCK_API=false

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false

# Sentry (Error Tracking)
VITE_SENTRY_DSN=your_sentry_dsn
```

For production, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_APP_NAME=NeuraTrack
VITE_APP_ENV=production
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_LOGGING=false
VITE_ENABLE_ERROR_REPORTING=true
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🚀 Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze

# Lint code
npm run lint
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
neuratrack-frontend/
├── public/                 # Static assets
│   ├── icon-192.png       # PWA icons
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Base components (Button, Card, etc.)
│   │   ├── layout/        # Layout components (Header, BottomNav)
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── medications/   # Medication components
│   │   ├── insights/      # Chart components
│   │   └── chat/          # Chat components
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SeizureLogger.tsx
│   │   ├── Insights.tsx
│   │   ├── Medications.tsx
│   │   ├── Chat.tsx
│   │   ├── Emergency.tsx
│   │   ├── Reports.tsx
│   │   └── SharedReport.tsx
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React Context providers
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utilities (axios, react-query)
│   └── config/            # Configuration files
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 Key Features

### 1. AI Seizure Logger

- Natural language input with AI parsing
- Confidence score display
- Editable parsed data
- Example prompts for guidance

### 2. Medication Tracker

- Add, edit, and delete medications
- Schedule reminders with times
- Adherence tracking with calendar view
- AI-generated insights and suggestions

### 3. Dashboard

- Seizure summary statistics
- Risk prediction snapshot
- Recent seizure history
- Quick action buttons
- Seizure-free streak counter

### 4. Insights & Analytics

- Hourly seizure heatmap
- Day-of-week distribution chart
- Common triggers pie chart
- Interactive timeline

### 5. AI Chat Assistant

- Ask questions about seizure patterns
- Get medication adherence insights
- Receive personalized recommendations
- View conversation history

### 6. Emergency SOS

- Large, prominent SOS button
- Select which contacts to alert
- Share location (optional)
- Add custom message
- SMS/WhatsApp alerts via Twilio

### 7. Reports & Export

- Generate PDF reports
- Export seizure data to CSV
- Create shareable links for doctors
- Email reports (with mailto fallback)

## 📱 PWA Setup

The app is a Progressive Web App (PWA) that can be installed on devices:

### Features

- **Installable** - Add to home screen on mobile
- **Offline Capable** - Works without internet
- **Push Notifications** - Medication reminders
- **Automatic Updates** - Service worker updates

### Testing PWA

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open Chrome DevTools → Application tab
4. Check Manifest and Service Workers

## 📴 Offline Mode

### How It Works

- Seizures logged offline are saved to IndexedDB
- Pending items queue for sync
- Auto-sync when internet returns
- Visual offline indicator with pending count

### Features

- Seizure logging without internet
- Offline AI parsing fallback
- Sync status indicator
- Manual sync button

## 🧪 Testing

### Test Offline Mode

1. Open DevTools → Network tab
2. Check "Offline"
3. Log a seizure
4. Should save locally with offline message
5. Uncheck "Offline"
6. Watch auto-sync notification

### Test Notifications

1. Click the bell icon in header
2. Grant permission
3. Add medication with times
4. Wait for scheduled time
5. Notification appears

### Test PWA Install

1. Build the app
2. Preview with `npm run preview`
3. Click install button in address bar
4. App installs to device

## 🚢 Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

The build output will be in the `dist/` directory.

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Deploy to Netlify

1. Connect GitHub repository
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Set environment variables
4. Deploy

### Deploy to GitHub Pages

1. Update `vite.config.ts` with base URL
2. Run `npm run build`
3. Deploy `dist` folder to gh-pages branch

## 📊 Bundle Analysis

Run `npm run build` and check `dist/stats.html` for visual bundle analysis.

## 🔧 Troubleshooting

### Common Issues

**Q: Backend connection refused?**

- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` in `.env.development`

**Q: PWA not installing?**

- Use HTTPS (localhost counts as secure)
- Check manifest.json in Application tab

**Q: Offline sync not working?**

- Check IndexedDB in Application tab
- Look for console errors

**Q: Notifications not showing?**

- Check browser permissions
- Ensure permissions granted
- Test with manual trigger

## 📄 License

MIT License

---

**Built with ❤️ by Natasha Hinga** | [GitHub](https://github.com/slate299)
````
