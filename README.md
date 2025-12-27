# DAGGPT - AI-Powered Creative Platform

A comprehensive AI platform for content creation, website building, video generation, and social media automation.

## 📁 Project Structure

```
daggpt/
├── api/                    # Backend API endpoints
├── database/              # SQL schemas and migrations
├── docs/                  # Documentation files
├── logs/                  # Build logs and test outputs (gitignored)
├── public/                # Static assets
├── scripts/               # Utility scripts and workflows
├── src/                   # Frontend React application
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services and utilities
│   └── styles/           # Styling files
├── supabase/             # Supabase configuration
└── server.js             # Express server

```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/dagchain-official/daggpt-website.git
   cd daggpt-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Add your API keys (see docs/QUICK_START.md)

4. **Run development server**
   ```bash
   npm start
   ```

## 📚 Documentation

All documentation is located in the `/docs` folder:
- [Quick Start Guide](docs/QUICK_START.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Social Media Automation](docs/SOCIAL_MEDIA_AUTOMATION_README.md)
- [Video Generation](docs/GENERATE_VIDEO_TOOL_README.md)

## 🗄️ Database Setup

SQL files for Supabase setup are in the `/database` folder:
- `SIMPLE_SUPABASE_SETUP.sql` - Basic setup
- `RUN_THIS_IN_SUPABASE.sql` - Complete schema
- Other migration files for specific features

## 🛠️ Features

- **AI Website Builder** - Generate complete websites with AI
- **Video Generation** - Multi-model video creation pipeline
- **Social Media Automation** - Automated content generation and scheduling
- **Image Generation** - Multiple AI models for image creation
- **Content Creation** - AI-powered content writing and optimization

## 🔐 Security

- All `.env` files are gitignored
- Sensitive documentation excluded from repository
- API keys managed through environment variables

## 📦 Deployment

Deployed on Vercel. See `vercel.json` for configuration.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved
