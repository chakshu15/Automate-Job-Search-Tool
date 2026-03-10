# JobPilot AI 🚀

Real-time job scraper + AI match scorer built with Puppeteer & Claude AI.

## What It Does
- Scrapes **LinkedIn**, **Naukri**, and **Indeed** for live job listings
- Searches for: Java Developer, Full Stack Developer, Backend Engineer, Frontend Developer
- Scores each job 0–100 using Claude AI based on your resume
- Shows a dashboard where you can review, apply, or skip each job

## Project Structure
```
jobpilot-server/
├── server.js          ← Express + Puppeteer backend
├── package.json
└── README.md

jobpilot-dashboard/
└── JobPilotDashboard.jsx  ← React frontend (connect to any React app)
```

## Setup & Run

### 1. Backend Server

```bash
mkdir jobpilot-server
cd jobpilot-server

# Copy server.js and package.json here, then:
npm install

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Start the server
node server.js
```

Server runs on **http://localhost:3001**

### 2. Frontend (React)

Option A — Add to existing React app (Vite / CRA):
```bash
# Copy JobPilotDashboard.jsx into your src/ folder
# Import and render it in App.jsx:
import JobPilotDashboard from './JobPilotDashboard';
export default function App() { return <JobPilotDashboard />; }
npm run dev
```

Option B — Create a fresh Vite app:
```bash
npm create vite@latest jobpilot-ui -- --template react
cd jobpilot-ui
npm install
cp ../JobPilotDashboard.jsx src/App.jsx
npm run dev
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Server health check |
| GET | /api/jobs | Scrape all platforms + AI score |
| GET | /api/profile-summary | Generate AI profile summary |

## Notes
- First scrape takes **30–60 seconds** (browser automation across 3 platforms × 4 keywords)
- Some platforms may block scrapers periodically — results may vary
- LinkedIn may require login for full results; public listings still work
- Naukri tends to have the most reliable scraping

## Customization
Edit `SEARCH_KEYWORDS` in `server.js` to change job search terms.
Edit `RESUME_SUMMARY` in `server.js` to update your profile for AI scoring.

## Requirements
- Node.js 18+
- Anthropic API key (https://console.anthropic.com)
