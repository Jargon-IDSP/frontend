# Jargon

A gamified learning platform designed to help users master industry-specific terminology through interactive quizzes, badges, and social features.

## Overview

Jargon is a Progressive Web App (PWA) that makes learning technical terminology engaging and rewarding. Users progress through apprenticeship levels, earn badges, compete on leaderboards, and connect with friends while mastering industry-specific jargon.

## Features

### Learning System
- **Apprenticeship Levels**: Progress through 4 levels of increasing difficulty
- **Industry-Specific Content**: Learn terminology across multiple industries
- **Quiz System**:
  - Practice quizzes for each level
  - Boss challenges to unlock new levels
  - Score tracking and retake capabilities
- **Study Modes**:
  - Term lists with definitions
  - Category-based learning
  - Custom quiz creation
  - AI-powered document upload for generating quizzes

### Gamification
- **Badge System**: Earn badges by completing levels and challenges
- **Leaderboards**: Compete with friends and the community
- **Daily Check-ins**: Build learning streaks
- **Progress Tracking**: Monitor your learning journey with detailed analytics

### Social Features
- **Friends**: Connect with other learners
- **Share Progress**: Share quizzes and achievements
- **Community Page**: View leaderboards and friend activities
- **Lesson Requests**: Request custom lessons from peers

### AI Integration
- **Camera Tool Identifier**: Use TensorFlow.js for real-world object recognition
- **AI-Powered Quiz Generation**: Upload documents to automatically generate quizzes
- **Google Generative AI**: Powered by Gemini for intelligent content generation

### Additional Features
- **QR Code Scanning**: Quick sharing and friend connections
- **Dark Mode Support**: Theme customization
- **Notifications**: Stay updated on friend activities and challenges
- **Responsive Design**: Optimized for mobile and desktop

## Tech Stack

### Frontend Framework
- **React 19** with **TypeScript**
- **Vite** for blazing-fast development and builds
- **React Router** for navigation

### State Management & Data Fetching
- **TanStack Query (React Query)** for server state management
- **React Context** for global state (notifications, user preferences)

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **SASS/SCSS** for component-specific styles
- **Radix UI** for accessible component primitives
- **Lucide React** for icons
- **Vaul** for drawer components
- **canvas-confetti** for celebration effects

### Authentication & User Management
- **Clerk** for authentication and user management

### AI & Machine Learning
- **TensorFlow.js** for client-side ML (camera tool identification)
- **Google Generative AI (Gemini)** for quiz generation

### Additional Libraries
- **QRCode.react** for QR code generation
- **html5-qrcode** for QR code scanning
- **date-fns** for date formatting

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```env
REACT_APP_API_URL=<your-api-url>
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-key>
VITE_BACKEND_URL=<your-backend-url>
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build for production (processes sprites and compiles TypeScript)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally
- `npm run process-sprites` - Process avatar sprites for optimization

## Project Structure

```
frontend/
├── public/               # Static assets
│   ├── avatar-sprites.svg
│   ├── learningFolders/
│   ├── models/          # TensorFlow.js models
│   └── manifest.json    # PWA manifest
├── src/
│   ├── assets/          # Images, icons, badges
│   ├── components/      # Reusable React components
│   │   ├── avatar/
│   │   ├── learning/
│   │   ├── onboarding/
│   │   ├── settings/
│   │   └── ui/
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and routes
│   ├── mounting/        # App initialization
│   ├── pages/           # Page components
│   │   ├── community/
│   │   ├── documents/
│   │   ├── drawers/
│   │   ├── learning/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   └── users/
│   ├── styles/          # SCSS stylesheets
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── scripts/             # Build scripts
└── package.json
```

## Key Pages

- **Splash** - Landing page with animations
- **LoggedInHome** - Dashboard with learning options and daily check-in
- **Levels** - Browse apprenticeship levels by industry
- **BossPage** - Challenge quiz for level progression
- **CommunityPage** - Social features and leaderboards
- **InstantHelpPage** - Quick access to camera tool identifier
- **Onboarding** - New user onboarding flow

## PWA Support

Jargon is a Progressive Web App with:
- Offline capability
- Install to home screen
- Optimized for mobile devices
- Responsive design with viewport handling
- Custom app icons and splash screens

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 12+)
- Modern mobile browsers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team or open an issue in the repository.

---

Built with React, TypeScript, and powered by AI
