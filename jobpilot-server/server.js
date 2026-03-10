/**
 * JobPilot AI - Backend Server (JSearch API Edition)
 * Uses JSearch API via RapidAPI for real, structured job data
 * Run: node server.js
 * Env vars required: ANTHROPIC_API_KEY, JSEARCH_API_KEY
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Config ──────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;
const JSEARCH_API_KEY = process.env.VITE_JSEARCH_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY");
  process.exit(1);
}
if (!JSEARCH_API_KEY) {
  console.error("❌ Missing JSEARCH_API_KEY");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const RESUME_SUMMARY = process.env.RESUME_SUMMARY || "";

if (!RESUME_SUMMARY) {
  console.warn("⚠️ Warning: Missing RESUME_SUMMARY in your .env file.");
}

// ─── Search Strategy ──────────────────────────────────────────────────────────
// Target India's top tech hubs with role-specific queries
// Using "site:linkedin.com" hint in query forces LinkedIn results in JSearch

const INDIA_CITIES = [
  "Gurugram",
  "Delhi",
  "Noida",
  "Bangalore",
  "Bengaluru",
  "Hyderabad",
  "Mohali",
  "Chandigarh",
  "Pune",
  "Chennai",
  "Mumbai",
];

const skills = ["Java", "Spring Boot", "React", "Microservices", "REST API"];


  const ROLE_QUERIES = [
  // Generic Entry Level
  "Software Engineer",
  "Associate Software Engineer",
  "Junior Software Engineer",
  "Software Developer",
  "Associate Developer",
  "Junior Developer",
  "SDE I",
  "Entry Level Software Engineer",

  // Backend Focus
  "Java Developer",
  "Java Spring Boot Developer",
  "Backend Developer Java",
  "Backend Engineer Spring Boot",
  "Java Microservices Developer",

  // Frontend Focus
  "Frontend Developer React",
  "React Developer",
  "React JavaScript Developer",

  // Full Stack
  "Full Stack Developer",
  "Full Stack Developer React Java",
  "Full Stack Engineer",
  "Full Stack Software Engineer",

  // Modern Titles Companies Use
  "Application Developer",
  "Software Engineer I",
  "Product Engineer",
  "Platform Engineer",

  `${skills[0]} ${skills[1]} Developer`,
  `Full Stack Developer ${skills[0]} ${skills[2]}`,
  `Backend Engineer ${skills[0]} ${skills[1]} ${skills[3]}`,
  `${skills[2]} Frontend Developer`,
  `Software Engineer ${skills[0]} ${skills[4]}`,
  `Software Engineer`,
  `Java Developer`,
  'Associated Software Engineer',
];

// Build targeted query list: each role × top 3 cities + remote
function buildSearchQueries() {
  const queries = [];

  // City-targeted queries for top roles
  const topRoles = ROLE_QUERIES.slice(0, ROLE_QUERIES.length - 1);
  const topCities = INDIA_CITIES.slice(0, INDIA_CITIES.length - 1); // Bengaluru, Noida, Hyderabad

  for (const role of topRoles) {
    for (const city of topCities) {
      queries.push({ query: `${role} ${city} India`, city, role });
    }
  }

  // Remote-targeted for all roles
  for (const role of ROLE_QUERIES) {
    queries.push({ query: `${role} remote India`, city: "Remote", role });
  }

  return queries;
}

// ─── JSearch API ─────────────────────────────────────────────────────────────

async function fetchJSearchJobs(query, city) {
  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "1"); // 1 page per targeted query = faster
  url.searchParams.set("date_posted", "month");
  url.searchParams.set("employment_types", "FULLTIME,CONTRACTOR,PARTTIME");
  url.searchParams.set(
    "job_requirements",
    "no_experience,under_3_years_experience",
  ); // filter for junior/mid

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": JSEARCH_API_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSearch ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const jobs = data.data || [];

  // ── India filter: keep only jobs that mention India in location fields ──
  const indiaJobs = jobs.filter((j) => {
    const loc = [
      j.job_country,
      j.job_city,
      j.job_state,
      j.job_location,
      j.employer_company_type,
    ]
      .join(" ")
      .toLowerCase();
    const isIndia =
      loc.includes("india") ||
      loc.includes("bengaluru") ||
      loc.includes("bangalore") ||
      loc.includes("mumbai") ||
      loc.includes("hyderabad") ||
      loc.includes("pune") ||
      loc.includes("noida") ||
      loc.includes("gurugram") ||
      loc.includes("gurgaon") ||
      loc.includes("chennai") ||
      loc.includes("delhi") ||
      loc.includes("kolkata") ||
      loc.includes("mohali") ||
      loc.includes("chandigarh") ||
      loc.includes("remote"); // remote is ok
    return isIndia || j.job_is_remote; // always keep remote jobs
  });

  return indiaJobs.map((j) => ({
    title: j.job_title || "",
    company: j.employer_name || "",
    location: buildLocation(j),
    salary: formatSalary(j),
    posted: formatPosted(j.job_posted_at_datetime_utc),
    url: j.job_apply_link || j.job_google_link || "",
    platform: detectPlatform(j),
    description: (j.job_description || "").slice(0, 800),
    remote: j.job_is_remote || false,
    employment: j.job_employment_type || "FULLTIME",
    highlights: j.job_highlights || {},
    city,
  }));
}

function buildLocation(j) {
  if (j.job_is_remote) return "Remote";
  return (
    [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", ") ||
    "India"
  );
}

function detectPlatform(j) {
  const src = (j.job_publisher || j.job_apply_link || "").toLowerCase();
  if (src.includes("linkedin")) return "LinkedIn";
  if (src.includes("indeed")) return "Indeed";
  if (src.includes("glassdoor")) return "Glassdoor";
  if (src.includes("naukri")) return "Naukri";
  if (src.includes("monster")) return "Monster";
  if (src.includes("shine")) return "Shine";
  return j.job_publisher || "Indeed";
}

function formatSalary(j) {
  if (j.job_min_salary && j.job_max_salary) {
    const cur = j.job_salary_currency || "INR";
    const per = (j.job_salary_period || "YEAR").toLowerCase();
    const min = Number(j.job_min_salary).toLocaleString("en-IN");
    const max = Number(j.job_max_salary).toLocaleString("en-IN");
    return `${cur} ${min}–${max} / ${per}`;
  }
  return "Not disclosed";
}

function formatPosted(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter((j) => {
    const key = `${j.title}__${j.company}`.toLowerCase().replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── AI Scoring ───────────────────────────────────────────────────────────────

async function scoreJobsWithAI(jobs) {
  const BATCH_SIZE = 12;
  const allScores = {};

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    const prompt = `You are a senior technical recruiter AI specializing in Indian tech hiring. Score each job 0-100 for candidate fit.

Scoring guide:
- 85-100: Excellent match — skills align, seniority fits (junior/mid), India location
- 70-84:  Good match — most skills match, minor gaps
- 50-69:  Partial match — some relevant skills, role adjacent
- 0-49:   Poor fit — wrong domain, too senior, irrelevant stack

IMPORTANT: Penalize heavily if job requires 5+ years experience (candidate has ~1.5 yrs).
Boost score if job mentions Spring Boot, Java, React, Node.js, Microservices, AWS, Docker, Kafka.
Boost if location is Noida, Bengaluru, Hyderabad, or Remote.

Return ONLY a JSON array — no markdown, no extra text:
[{"id":<number>,"score":<0-100>,"reasoning":"<max 15 words>","tags":["skill1","skill2","skill3"]}]

CANDIDATE:
${RESUME_SUMMARY}

JOBS:
${batch
  .map((j, idx) => {
    const qualReqs = j.highlights?.Qualifications?.slice(0, 2).join("; ") || "";
    return `ID ${i + idx}: "${j.title}" at ${j.company}
Location: ${j.location} | ${j.remote ? "Remote" : "On-site"} | ${j.employment}
Platform: ${j.platform}
Description: ${j.description.slice(0, 350)}
${qualReqs ? `Requirements: ${qualReqs}` : ""}`;
  })
  .join("\n\n---\n\n")}`;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content[0].text.replace(/```json|```/g, "").trim();
      const scores = JSON.parse(text);
      scores.forEach((s) => {
        allScores[s.id] = s;
      });
      console.log(`  ✓ Scored batch ${i}–${i + batch.length - 1}`);
    } catch (e) {
      console.error(`  ✗ Batch ${i} failed:`, e.message);
      batch.forEach((_, idx) => {
        allScores[i + idx] = {
          id: i + idx,
          score: 50,
          reasoning: "Score unavailable.",
          tags: [],
        };
      });
    }
  }

  return jobs.map((j, i) => {
    const s = allScores[i] || { score: 50, reasoning: "", tags: [] };
    return {
      ...j,
      id: i,
      score: s.score,
      reasoning: s.reasoning,
      tags: s.tags || [],
    };
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/health", (_, res) =>
  res.json({ status: "ok", version: "v3-linkedin-india" }),
);

app.get("/api/jobs", async (req, res) => {
  console.log("\n🔍 Starting India-focused LinkedIn job search...");
  let allJobs = [];

  try {
    const queries = buildSearchQueries();
    console.log(`   Running ${queries.length} targeted queries...`);

    // Run in batches of 5 parallel to avoid rate limiting
    const PARALLEL = 5;
    for (let i = 0; i < queries.length; i += PARALLEL) {
      const batch = queries.slice(i, i + PARALLEL);
      const results = await Promise.allSettled(
        batch.map(({ query, city }) =>
          fetchJSearchJobs(query, city)
            .then((jobs) => {
              if (jobs.length)
                console.log(`  ✓ "${query}" → ${jobs.length} India jobs`);
              return jobs;
            })
            .catch((e) => {
              console.error(`  ✗ "${query}":`, e.message);
              return [];
            }),
        ),
      );
      results.forEach((r) => {
        if (r.status === "fulfilled") allJobs.push(...r.value);
      });

      // Small delay between batches to respect rate limits
      if (i + PARALLEL < queries.length) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    allJobs = dedupe(allJobs);
    console.log(`\n📦 ${allJobs.length} unique India jobs found.`);

    if (allJobs.length === 0) {
      return res.json({
        success: true,
        count: 0,
        jobs: [],
        message: "No India jobs found. Try again.",
      });
    }

    console.log("🤖 Scoring with Claude AI...");
    const scored = await scoreJobsWithAI(allJobs);
    const sorted = scored.sort((a, b) => b.score - a.score);

    // Stats
    const platforms = {};
    sorted.forEach((j) => {
      platforms[j.platform] = (platforms[j.platform] || 0) + 1;
    });
    console.log("\n📊 Platform breakdown:", platforms);
    console.log(
      `🏆 Top match: "${sorted[0]?.title}" at ${sorted[0]?.company} (${sorted[0]?.score}%)\n`,
    );

    res.json({
      success: true,
      count: sorted.length,
      jobs: sorted,
      meta: { platforms, queriesRun: queries.length },
    });
  } catch (e) {
    console.error("Fatal:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/profile-summary", async (req, res) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Write a 2-sentence punchy professional summary for a job search profile targeting the Indian tech market. Be specific about skills and target roles.\n\nRESUME:\n${RESUME_SUMMARY}`,
        },
      ],
    });
    res.json({ summary: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 JobPilot AI v3 (India-focused) → http://localhost:${PORT}`);
  console.log(
    `   Strategy: ${ROLE_QUERIES.length} roles × ${INDIA_CITIES.slice(0, 3).length} cities + remote`,
  );
  console.log(`   GET /health`);
  console.log(`   GET /api/jobs`);
  console.log(`   GET /api/profile-summary\n`);
});
