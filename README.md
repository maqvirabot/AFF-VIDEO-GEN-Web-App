# Aff Video Gen - Web Application

AI Video Generator for Affiliate Marketing Content.

## Quick Start (Development)

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Docker Deployment

```bash
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Configuration

1. Open the app in browser
2. Click the Settings icon (⚙️) in header
3. Enter your API keys:
   - **Kie.ai API Key**: Your Kie.ai account API key
   - **Cloudinary Cloud Name**: Your Cloudinary cloud name
   - **Cloudinary Preset**: Unsigned upload preset name
4. Click "Save Configuration"

## Features

- 🎬 AI video generation using Kie.ai Sora 2
- 📤 Image upload via Cloudinary
- 🎨 Multiple video styles (Unboxing, Review, Tutorial, etc.)
- 👤 Multiple personas (Wanita Indo, Pria Indo, Hijabers, Product Only)
- 📱 Portrait (9:16) and Landscape (16:9) support
- 🔄 Batch generation (1-5 videos)
- 📊 Real-time progress tracking

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand
- **Backend**: Python FastAPI, httpx
- **External APIs**: Kie.ai, Cloudinary
