# DAG GPT

A multi-modal AI platform for content creation, website generation, and mobile app development.

## Tech Stack

- **React 18.2.0** - Modern React with hooks
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **Google Gemini API** - Multi-modal AI capabilities:
  - **Gemini 2.0 Flash** - Website code generation
  - **Imagen 3.0** - Image generation
  - **Gemini Vision** - Video & image understanding
  - **Gemini Audio** - Audio analysis & transcription
- **Lottie React** - Smooth animations
- **Pure Dark Theme** - Elegant dark color scheme

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Google AI Studio API Key (Get it from https://makersuite.google.com/app/apikey)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google AI Studio (Gemini) API Configuration
REACT_APP_GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Features

### Website Creation Module
- 🤖 **AI-Powered Generation** - Uses Google Gemini 2.0 Flash
- 🎨 **Multiple Website Types** - Portfolio, Landing Page, Blog, E-Commerce, Dashboard, SaaS
- 🌈 **Color Schemes** - Modern, Professional, Vibrant, Minimal, Nature, Sunset
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- 💻 **Code Preview** - View and download generated HTML
- ⚡ **Real-time Preview** - See your website instantly

### Content Creation Module
- 🖼️ **Image Generation** - Powered by Google Imagen 3.0
  - Multiple styles (Cinematic, Anime, Realistic, Cartoon, etc.)
  - Custom aspect ratios (16:9, 9:16, 1:1, 4:3)
  - Batch generation (1-10 images)
- 🎬 **Video Understanding** - Analyze and describe videos
- 🎵 **Audio Analysis** - Transcribe and analyze audio files

### Mobile Apps Module (Coming Soon)
- 📱 Android & iOS app generation

### UI/UX
- ✨ Beautiful gradient animations
- 🎨 Pure dark theme design
- ⚡ Smooth transitions and hover effects
- 🎯 Modern UI/UX patterns

## Project Structure

```
dgpt1/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── LandingPage.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```
