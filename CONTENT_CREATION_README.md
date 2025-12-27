# 🎬 AI Video Creator - Content Creation Feature

## Overview
A comprehensive multi-step AI video generation tool that transforms user ideas into professional videos with AI-generated scripts, images, voiceovers, and animations.

---

## 🏗️ Architecture

### **Tech Stack**
- **Orchestrator:** Supabase (PostgreSQL)
- **Scripting:** Grok 4.1 Fast Reasoning
- **Images:** Flux Kontext (KIE.AI API)
- **Animation:** Veo Model (KIE.AI API) - Image-to-Video
- **Voice:** HuggingFace TTS (NihalGazi/Text-To-Speech-Unlimited)
- **Editing:** Shotstack API (Video Stitching)

### **Database Schema**

#### **video_projects**
```sql
- id: UUID (Primary Key)
- user_id: TEXT (Firebase UID)
- prompt: TEXT (User's video topic)
- status: TEXT ('scripting', 'awaiting_selection', 'rendering', 'done', 'error')
- final_video_url: TEXT
- error_message: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **video_scenes**
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → video_projects)
- order_index: INTEGER
- script_text: TEXT (Narrator script)
- visual_prompt: TEXT (Image generation prompt)
- selected_image_url: TEXT
- video_clip_url: TEXT
- audio_url: TEXT
- duration_seconds: DECIMAL (default: 5.0)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **video_image_options**
```sql
- id: UUID (Primary Key)
- scene_id: UUID (Foreign Key → video_scenes)
- url: TEXT (Image URL)
- is_selected: BOOLEAN (default: false)
- created_at: TIMESTAMP
```

---

## 🔄 Workflow

### **Step 1: Topic Input**
- User enters video topic/idea
- Examples: "Product launch video for smartphone", "Recipe tutorial for chocolate cake"

### **Step 2: Script Generation**
1. Create project in database (status: 'scripting')
2. Call Grok 4.1 with system prompt:
   - Act as Video Producer
   - Create 4-6 scenes (30-60 seconds total)
   - Each scene: narrator_script + image_generation_prompt
   - Output: Valid JSON only
3. Save scenes to database
4. Trigger image generation (4 variations per scene)
5. Update status to 'awaiting_selection'

### **Step 3: Storyboard Selection**
- Display scenes with 4 image options each
- User selects 1 image per scene
- Update database with selected images
- Enable "Generate Video" button when all selected

### **Step 4: Video Rendering** (Coming Soon)
1. **Voice Generation:**
   - Loop through scenes
   - Send script_text to HuggingFace TTS
   - Save MP3 files to Supabase storage
   
2. **Animation:**
   - Loop through scenes
   - Send selected_image_url to Veo API
   - Wait for video clip generation
   - Save video URLs
   
3. **Stitching:**
   - Construct Shotstack JSON payload
   - Track 1: Audio files (sequenced)
   - Track 2: Video clips (sequenced)
   - Poll until status = "done"
   - Update project with final_video_url

---

## 📁 File Structure

```
e:\projects\dgpt1\
├── supabase/
│   └── migrations/
│       └── create_video_projects.sql          # Database schema
├── server/
│   └── routes/
│       └── videoGenerator.js                  # Backend API routes
├── src/
│   ├── components/
│   │   └── ContentCreation.js                 # Main UI component
│   ├── services/
│   │   ├── kieAiService.js                   # Flux Kontext & Veo integration
│   │   └── ttsService.js                     # HuggingFace TTS integration
│   └── pages/
│       └── TestDashboard.js                   # Dashboard integration
└── server.js                                  # Express server with routes
```

---

## 🔌 API Endpoints

### **POST /api/video/generate-script**
Generate video script from user prompt.

**Request:**
```json
{
  "prompt": "Create a promotional video about eco-friendly products",
  "userId": "firebase-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "title": "Eco-Friendly Products",
    "prompt": "...",
    "status": "awaiting_selection",
    "scenes": [
      {
        "id": "uuid",
        "order_index": 0,
        "script_text": "Narrator script...",
        "visual_prompt": "Image generation prompt...",
        "duration_seconds": 5
      }
    ]
  }
}
```

### **GET /api/video/project/:projectId**
Get project details with scenes and image options.

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "prompt": "...",
    "status": "awaiting_selection",
    "scenes": [
      {
        "id": "uuid",
        "script_text": "...",
        "image_options": [
          { "id": "uuid", "url": "https://...", "is_selected": false }
        ]
      }
    ]
  }
}
```

### **POST /api/video/select-image**
User selects an image for a scene.

**Request:**
```json
{
  "sceneId": "uuid",
  "imageOptionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image selected successfully"
}
```

---

## 🎨 UI/UX Design

### **Design Principles**
- **Clean & Professional:** Light theme with indigo/purple gradients
- **Step Indicator:** Visual progress through 5 stages
- **Responsive:** Mobile-first design
- **Interactive:** Hover effects, smooth transitions
- **Accessible:** Clear labels, high contrast

### **Color Palette**
- Primary: Indigo (#6366f1)
- Secondary: Purple (#8b5cf6)
- Success: Green (#10b981)
- Background: Light gray gradients
- Text: Gray scale (#111827 → #9ca3af)

### **Components**
1. **Header:** Logo + Title + Description
2. **Step Indicator:** 5 stages with icons
3. **Input Stage:** Large textarea + examples
4. **Generating Stage:** Loading animation + progress
5. **Storyboard Stage:** Scene cards + image grid
6. **Action Button:** Gradient CTA with disabled state

---

## 🚀 Deployment

### **1. Database Setup**
```bash
# Run migration in Supabase SQL Editor
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/create_video_projects.sql
```

### **2. Environment Variables**
Add to `.env`:
```env
# KIE.AI API (Flux Kontext + Veo)
REACT_APP_KIE_API_KEY=your_kie_api_key

# Grok API (Script Generation)
GROK_API_KEY=your_grok_api_key

# Supabase
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Install Dependencies**
```bash
npm install @supabase/supabase-js lucide-react
```

### **4. Start Development Server**
```bash
# Terminal 1: Backend API
node server.js

# Terminal 2: React App
npm start
```

### **5. Deploy to Vercel**
```bash
vercel --prod
```

---

## 📊 Status & Progress

### **✅ Completed**
- [x] Database schema with RLS policies
- [x] Backend API routes (script generation, image selection)
- [x] KIE.AI service integration (Flux Kontext + Veo)
- [x] HuggingFace TTS service
- [x] Frontend UI component (Steps 1-3)
- [x] Step indicator with visual progress
- [x] Storyboard with image selection
- [x] Server integration

### **🚧 In Progress**
- [ ] Video rendering pipeline (Step 4)
- [ ] Shotstack API integration
- [ ] Final video download
- [ ] Project history/management

### **📋 Backlog**
- [ ] Script editing capability
- [ ] Voice selection (multiple voices)
- [ ] Background music addition
- [ ] Transition effects
- [ ] Text overlay customization
- [ ] Export formats (MP4, MOV, WebM)

---

## 🧪 Testing

### **Manual Testing Steps**
1. Navigate to `/testdashboard/content-creation`
2. Enter video topic: "Product launch video for smartphone"
3. Click "Generate Video Script"
4. Wait for script generation (~10-15 seconds)
5. Wait for image generation (~30-60 seconds for all scenes)
6. Select one image per scene
7. Click "Generate Video" (when implemented)

### **API Testing**
```bash
# Test script generation
curl -X POST http://localhost:3001/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test video","userId":"test-user-123"}'

# Test project retrieval
curl http://localhost:3001/api/video/project/{projectId}

# Test image selection
curl -X POST http://localhost:3001/api/video/select-image \
  -H "Content-Type: application/json" \
  -d '{"sceneId":"uuid","imageOptionId":"uuid"}'
```

---

## 🐛 Troubleshooting

### **Issue: Images not generating**
- Check KIE.AI API key in `.env`
- Verify API quota/limits
- Check console for error messages
- Ensure Supabase connection is active

### **Issue: Script generation fails**
- Verify Grok API key
- Check prompt length (not too short/long)
- Review Grok API response in console
- Ensure JSON parsing is working

### **Issue: Database errors**
- Run migration script
- Check RLS policies
- Verify user authentication
- Review Supabase logs

---

## 📚 Resources

- **KIE.AI Docs:** https://kie.ai/docs
- **Grok API:** https://console.x.ai/
- **HuggingFace TTS:** https://huggingface.co/spaces/NihalGazi/Text-To-Speech-Unlimited
- **Shotstack API:** https://shotstack.io/docs/
- **Supabase Docs:** https://supabase.com/docs

---

## 👥 Support

For issues or questions:
1. Check console logs for errors
2. Review API responses
3. Verify environment variables
4. Check database connection
5. Contact development team

---

**Built with ❤️ by DAG GPT Team**
