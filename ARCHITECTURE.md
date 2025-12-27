# Social Media Automation - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DAG GPT Platform                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SocialMediaAutomation.js                              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │  Setup   │ │ Calendar │ │Analytics │ │ Settings │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP POST
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Vercel Serverless)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  /api/social-media-create-campaign                     │    │
│  │                                                         │    │
│  │  1. Fetch Website HTML                                 │    │
│  │  2. Extract Brand Data (Cheerio)                       │    │
│  │  3. Build AI Prompt                                    │    │
│  │  4. Call OpenAI GPT-4o-mini                            │    │
│  │  5. Parse JSON Response                                │    │
│  │  6. Return Campaign Data                               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Campaign Data
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      n8n Workflow Automation                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Flow 1: Campaign Creation                              │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     │   │
│  │  │Webhook│→│Fetch │→│Extract│→│OpenAI│→│Sheets│     │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Flow 2: Daily Posting (Cron: 8 AM UTC)                │   │
│  │  ┌──────┐  ┌──────┐  ┌──────────────────────────┐      │   │
│  │  │ Cron │→│Sheets│→│  Pick Next Unposted       │      │   │
│  │  └──────┘  └──────┘  └──────────────────────────┘      │   │
│  │                              │                           │   │
│  │              ┌───────────────┼───────────────┐          │   │
│  │              ▼               ▼               ▼          │   │
│  │         ┌────────┐      ┌────────┐      ┌────────┐     │   │
│  │         │Facebook│      │Twitter │      │Instagram│     │   │
│  │         └────────┘      └────────┘      └────────┘     │   │
│  │              │               │               │          │   │
│  │              └───────────────┼───────────────┘          │   │
│  │                              ▼                           │   │
│  │                      ┌──────────────┐                   │   │
│  │                      │ Mark Posted  │                   │   │
│  │                      └──────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  OpenAI  │  │  Google  │  │ Facebook │  │ Twitter  │       │
│  │   API    │  │  Sheets  │  │   API    │  │   API    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐                                    │
│  │Instagram │  │  TikTok  │                                    │
│  │   API    │  │   API    │                                    │
│  └──────────┘  └──────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Campaign Creation Flow

```
User Input (Website URL)
         │
         ▼
┌─────────────────────┐
│  Frontend Dashboard │
│  - Validate URL     │
│  - Show loading     │
└─────────────────────┘
         │
         │ POST /api/social-media-create-campaign
         ▼
┌─────────────────────┐
│   Backend API       │
│  1. Fetch HTML      │ ──→ HTTP Request to Website
│  2. Parse HTML      │ ──→ Cheerio extraction
│  3. Build Prompt    │ ──→ Construct AI prompt
│  4. Call OpenAI     │ ──→ GPT-4o-mini API
│  5. Parse Response  │ ──→ JSON validation
└─────────────────────┘
         │
         │ Campaign Data (JSON)
         ▼
┌─────────────────────┐
│  Frontend Dashboard │
│  - Display calendar │
│  - Show 14 posts    │
│  - Enable posting   │
└─────────────────────┘
         │
         │ (Optional) Trigger n8n webhook
         ▼
┌─────────────────────┐
│   n8n Workflow      │
│  - Save to Sheets   │
│  - Schedule posts   │
└─────────────────────┘
```

### Daily Posting Flow

```
Cron Trigger (8:00 AM UTC)
         │
         ▼
┌─────────────────────┐
│  Read Google Sheets │
│  - Get all posts    │
│  - Filter unposted  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Pick Next Post     │
│  - Day 1, 2, 3...   │
│  - Check status     │
└─────────────────────┘
         │
         ├─────────────┬─────────────┬─────────────┐
         ▼             ▼             ▼             ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │Facebook│    │Twitter │    │Instagram│    │TikTok │
    │  API   │    │  API   │    │  API   │    │  API  │
    └────────┘    └────────┘    └────────┘    └────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Update Sheets  │
              │  - Mark posted  │
              │  - Add timestamp│
              └─────────────────┘
                       │
                       ▼
                   [Repeat Tomorrow]
```

---

## 🗄️ Data Structure

### Campaign Data (from API)

```json
{
  "status": "success",
  "campaign_id": "campaign_1704960000000",
  "website_url": "https://example.com",
  "created_at": "2025-01-11T08:00:00.000Z",
  
  "brand_profile": {
    "tone": ["professional", "innovative", "friendly"],
    "selling_points": [
      "Industry-leading technology",
      "User-friendly design",
      "24/7 customer support"
    ],
    "target_audiences": [
      "Tech enthusiasts",
      "Small business owners",
      "Digital marketers"
    ],
    "voice_examples": [
      "We're revolutionizing the way you work",
      "Simple, powerful, and built for you",
      "Join thousands of happy customers"
    ]
  },
  
  "posts": [
    {
      "day": 1,
      "platformVariants": {
        "instagram": {
          "caption": "✨ Introducing our latest innovation...",
          "hashtags": ["#Innovation", "#TechLife", "#NewProduct"],
          "suggested_image_prompt": "Modern tech product on clean white background, professional lighting, minimalist style"
        },
        "facebook": {
          "post": "We're excited to announce our newest product! After months of development..."
        },
        "x": {
          "tweet": "🚀 Big news! Our latest product is here. Simple, powerful, game-changing. Learn more: [link]"
        },
        "tiktok": {
          "caption": "You asked, we delivered! 🎉",
          "video_prompt": "Quick product reveal with upbeat music, show key features in 15 seconds",
          "sound_suggestion": "Trending upbeat electronic music"
        }
      },
      "call_to_action": "Visit our website to learn more",
      "suggested_post_time": "08:00",
      "content_type": "image",
      "mood": ["exciting", "innovative", "professional"]
    }
    // ... 13 more days
  ]
}
```

### Google Sheets Structure

| Column | Type | Description |
|--------|------|-------------|
| campaign_id | Text | Unique campaign identifier |
| day | Number | Day number (1-14) |
| instagram_caption | Text | Instagram post caption |
| instagram_hashtags | Text | Comma-separated hashtags |
| instagram_image_prompt | Text | Image generation prompt |
| facebook_post | Text | Facebook post content |
| x_tweet | Text | Twitter/X tweet (max 280 chars) |
| tiktok_caption | Text | TikTok caption |
| tiktok_video_prompt | Text | Video concept description |
| tiktok_sound_suggestion | Text | Suggested audio/music |
| call_to_action | Text | CTA for the post |
| suggested_post_time | Text | HH:MM in UTC |
| content_type | Text | image/video/carousel/reel |
| mood | Text | Comma-separated mood words |
| posted | Boolean | TRUE/FALSE |
| posted_at | DateTime | Timestamp when posted |
| created_at | DateTime | Timestamp when created |

---

## 🔌 API Integrations

### 1. OpenAI API
```javascript
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer sk-...
  Content-Type: application/json
Body:
  {
    "model": "gpt-4o-mini",
    "messages": [...],
    "temperature": 0.8,
    "max_tokens": 4000
  }
```

### 2. Facebook Graph API
```javascript
POST https://graph.facebook.com/v18.0/{page-id}/feed
Headers:
  Authorization: Bearer {access-token}
Body:
  {
    "message": "Post content here",
    "published": true
  }
```

### 3. Instagram Graph API
```javascript
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
Headers:
  Authorization: Bearer {access-token}
Body:
  {
    "image_url": "https://...",
    "caption": "Post caption here"
  }
```

### 4. X (Twitter) API v2
```javascript
POST https://api.twitter.com/2/tweets
Headers:
  Authorization: Bearer {bearer-token}
  Content-Type: application/json
Body:
  {
    "text": "Tweet content here (max 280 chars)"
  }
```

### 5. TikTok API
```javascript
POST https://open.tiktokapis.com/v2/post/publish/video/init/
Headers:
  Authorization: Bearer {access-token}
  Content-Type: application/json
Body:
  {
    "post_info": {
      "title": "Video title",
      "description": "Video description"
    }
  }
```

---

## 🔐 Security Architecture

### API Key Management
```
Environment Variables (.env)
         │
         ▼
┌─────────────────────┐
│  Backend (Vercel)   │
│  - OPENAI_API_KEY   │
│  - Encrypted        │
│  - Never exposed    │
└─────────────────────┘

n8n Credentials Store
         │
         ▼
┌─────────────────────┐
│  n8n (Encrypted)    │
│  - OpenAI           │
│  - Google OAuth     │
│  - Facebook OAuth   │
│  - Twitter OAuth    │
└─────────────────────┘
```

### OAuth Flow
```
User → Frontend → Platform OAuth → Callback → Store Token → n8n
```

---

## 📊 Scalability Considerations

### Current Architecture (MVP)
- **Frontend**: React SPA (static hosting)
- **Backend**: Serverless functions (auto-scaling)
- **Storage**: Google Sheets (simple, free)
- **Automation**: n8n (single instance)
- **Capacity**: ~100 campaigns/month

### Scaled Architecture (Production)
```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    ┌────────┐        ┌────────┐        ┌────────┐
    │Frontend│        │Frontend│        │Frontend│
    │ Server │        │ Server │        │ Server │
    └────────┘        └────────┘        └────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   API Gateway   │
                  └─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    ┌────────┐        ┌────────┐        ┌────────┐
    │Backend │        │Backend │        │Backend │
    │Service │        │Service │        │Service │
    └────────┘        └────────┘        └────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Replicated)  │
                  └─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Redis Cache   │
                  └─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    ┌────────┐        ┌────────┐        ┌────────┐
    │  n8n   │        │  n8n   │        │  n8n   │
    │Worker 1│        │Worker 2│        │Worker 3│
    └────────┘        └────────┘        └────────┘
```

**Capacity**: 10,000+ campaigns/month

---

## 🎯 Performance Metrics

### Response Times
- Website analysis: 2-5 seconds
- AI content generation: 10-30 seconds
- Social media posting: 1-3 seconds per platform
- Total campaign creation: 15-40 seconds

### Throughput
- API requests: 100 req/min (Vercel limit)
- n8n executions: 5,000/month (Starter plan)
- OpenAI tokens: 1M tokens/month (Tier 1)

### Reliability
- Frontend uptime: 99.9% (Vercel SLA)
- Backend uptime: 99.9% (Vercel SLA)
- n8n uptime: 99.5% (self-hosted) / 99.9% (cloud)
- Social API uptime: 99.5% (platform dependent)

---

## 🔄 Future Enhancements

### Phase 2: Image Generation
```
AI Content → Image Prompt → Stability AI → Generated Image → Upload → Post
```

### Phase 3: Video Generation
```
AI Content → Video Prompt → Runway ML → Generated Video → Upload → Post
```

### Phase 4: Analytics
```
Posted Content → Platform APIs → Engagement Data → Analytics Dashboard → Insights
```

### Phase 5: Optimization
```
Analytics → ML Model → Content Optimization → Improved Posts → Better Results
```

---

## 📚 Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Routing**: React Router
- **HTTP**: Fetch API

### Backend
- **Runtime**: Node.js 18
- **Platform**: Vercel Serverless
- **Parsing**: Cheerio
- **AI**: OpenAI GPT-4o-mini

### Automation
- **Platform**: n8n
- **Triggers**: Webhook, Cron
- **Nodes**: 18 custom nodes
- **Storage**: Google Sheets

### APIs
- **AI**: OpenAI
- **Social**: Facebook, Instagram, X, TikTok
- **Storage**: Google Sheets
- **Auth**: OAuth 2.0

---

This architecture is designed to be:
- ✅ **Scalable**: Can handle growth from 10 to 10,000 campaigns
- ✅ **Reliable**: Multiple redundancy layers
- ✅ **Cost-effective**: Pay-as-you-grow model
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Extensible**: Easy to add new features

**Ready to build? Let's go! 🚀**
