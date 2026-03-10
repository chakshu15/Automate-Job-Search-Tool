# Automate Job Search Tool

A powerful tool that aggregates job opportunities from global job platforms using the JSearch API and evaluates how well they match your profile using keyword and skill-based compatibility scoring powered by Anthropic's Claude AI.

## ⚙️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **Anthropic API Key** (Get it from [Anthropic Console](https://console.anthropic.com))
- **JSearch API Key** (Get it from [RapidAPI](https://rapidapi.com/letscrape-6bRBa3QG1q/api/jsearch))

---

## 🛠️ Setup & Run Instructions

### 1. Backend Server (`jobpilot-server`)

Navigate to the server directory, install dependencies, and configure your environment:

```bash
cd jobpilot-server
npm install
```

**Environment Variables Configuration**
Create a `.env` file in the `jobpilot-server` directory. It requires the following keys:

```env
# Anthropic API Key for AI Scoring
VITE_ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# JSearch API Key from RapidAPI
VITE_JSEARCH_API_KEY="your_jsearch_api_key_here"

# Your Resume Summary for AI to score against
RESUME_SUMMARY="Name: Your Name
Role: Full-Stack Software Engineer
Skills: Java, React, Node.js...
Experience:
- Company X (Dates): role details...
Education: B.E. Computer Science...
Location: Open to Remote/Office
Seniority: Junior to Mid level"
```

Start the backend development server:

```bash
npm run dev
# OR for production
npm start
```

The backend API will run on **http://localhost:3001**.
_(Main endpoints: `GET /api/jobs` and `GET /api/profile-summary`)_

### 2. Frontend UI (`jobpilot-ui`)

Open a new terminal window, navigate to the frontend directory, and start the Vite app:

```bash
cd jobpilot-ui
npm install
npm run dev
```

The frontend will typically run on **http://localhost:5173**. Open this URL in your browser to view the dashboard!

---

## 🔍 Customization

- **Change Search Logistics:** Edit `INDIA_CITIES` or `ROLE_QUERIES` arrays inside `jobpilot-server/server.js` to modify the targeted locations and job roles.
- **Change Resume Outline:** Update the `RESUME_SUMMARY` in the `.env` file to customize the candidate profile the AI uses to compute match scores.

## 📝 Notes

- Ensure both the backend server and frontend server are running concurrently.
- Depending on the number of queries batched, the JSearch API may take a few seconds to return the aggregated role data before Claude AI scores them. Give the dashboard a moment to load the scored jobs.
