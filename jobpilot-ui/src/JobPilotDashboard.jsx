import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:3001";

const PLATFORM_META = {
  LinkedIn: { color: "#0A66C2", bg: "#E8F1FB", emoji: "in" },
  Naukri: { color: "#FF6B35", bg: "#FFF0EB", emoji: "N" },
  Indeed: { color: "#2557A7", bg: "#EBF0FF", emoji: "I" },
  Glassdoor: { color: "#0CAA41", bg: "#E6F6EB", emoji: "G" },
  Monster: { color: "#6A4595", bg: "#F0Ecf4", emoji: "M" },
  Shine: { color: "#FFA100", bg: "#FFF5E5", emoji: "S" },
};

function RadialScore({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;

  const color = score >= 80 ? "#00e5a0" : score >= 60 ? "#f5a623" : "#ff5c5c";

  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#1e1e35"
          strokeWidth="4"
        />

        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

function PlatformBadge({ platform }) {
  const meta = PLATFORM_META[platform] || {
    color: "#888",
    bg: "#f0f0f0",
    emoji: "?",
  };
  return (
    <span
      style={{
        background: meta.bg,
        color: meta.color,
        fontSize: 10,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 20,
        letterSpacing: 0.5,
        border: `1px solid ${meta.color}33`,
      }}
    >
      {platform.toUpperCase()}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span
      style={{
        background: "#ffffff08",
        color: "#8888bb",
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 5,
        border: "1px solid #ffffff0d",
      }}
    >
      {label}
    </span>
  );
}

function JobCard({ job, status, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const score = job.score || 0;
  const isApplied = status === "applied";
  const isSkipped = status === "skipped";

  return (
    <div
      style={{
        background: isSkipped ? "#0f0f1c" : "#13132b",
        border: `1px solid ${isApplied ? "#00e5a033" : isSkipped ? "#1a1a28" : "#22224a"}`,
        borderRadius: 14,
        padding: "18px 20px",
        opacity: isSkipped ? 0.45 : 1,
        transition: "all 0.25s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isApplied && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #00e5a0, #00b8d4)",
          }}
        />
      )}

      <div
        className="job-card-layout"
        style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
      >
        <RadialScore score={score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 3,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "#e8e8ff",
                fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
              }}
              onClick={() =>
                job.url && job.url !== "#" && window.open(job.url, "_blank")
              }
            >
              {job.title}
            </h3>
            <PlatformBadge platform={job.platform} />
            {isApplied && (
              <span
                style={{
                  fontSize: 10,
                  color: "#00e5a0",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                ✓ APPLIED
              </span>
            )}
          </div>

          <div style={{ color: "#9090c0", fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: "#c0c0e8", fontWeight: 600 }}>
              {job.company}
            </span>
            {job.location && <> · {job.location}</>}
            {job.salary && job.salary !== "Not disclosed" && (
              <>
                {" "}
                · <span style={{ color: "#f5a623" }}>{job.salary}</span>
              </>
            )}
            {job.posted && (
              <>
                {" "}
                · <span style={{ color: "#555580" }}>{job.posted}</span>
              </>
            )}
          </div>

          {job.tags?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {job.tags.map((t, i) => (
                <Tag key={i} label={t} />
              ))}
            </div>
          )}

          {job.reasoning && (
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: "#7070a0",
                lineHeight: 1.65,
                display: expanded ? "block" : "-webkit-box",
                WebkitLineClamp: expanded ? "unset" : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {job.reasoning}
            </p>
          )}
          {job.reasoning?.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "#6060a0",
                fontSize: 11,
                cursor: "pointer",
                padding: "2px 0",
                marginTop: 2,
              }}
            >
              {expanded ? "show less" : "read more"}
            </button>
          )}
        </div>

        {!isApplied && !isSkipped && (
          <div
            className="job-card-buttons"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => onAction(job.id, "applied")}
              style={{
                background: "linear-gradient(135deg, #00e5a0, #00b8d4)",
                color: "#0a0a1a",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Apply ✓
            </button>
            <button
              onClick={() => onAction(job.id, "skipped")}
              style={{
                background: "#ffffff06",
                color: "#7070a0",
                border: "1px solid #ffffff0d",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Skip
            </button>
          </div>
        )}
        {(isApplied || isSkipped) && (
          <button
            className="job-card-undo"
            onClick={() => onAction(job.id, null)}
            style={{
              background: "none",
              color: "#444468",
              border: "1px solid #222240",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div
      className="stat-pill"
      style={{
        background: "#13132b",
        border: `1px solid ${color}22`,
        borderRadius: 12,
        padding: "14px 20px",
        textAlign: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#6060a0",
          fontWeight: 500,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function JobPilotDashboard() {
  const [jobs, setJobs] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [profile, setProfile] = useState({
    name: "Your Name",
    initials: "NM",
    role: "Your Role",
    location: "Your Location",
    skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7"],
  });
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [serverOnline, setServerOnline] = useState(null);
  const [progress, setProgress] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);
  const progressInterval = useRef(null);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [filter, platformFilter, jobs]);

  // Check server health on load
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  const startProgress = () => {
    const steps = [
      "Launching browser...",
      "Scraping Naukri for Java Developer roles...",
      "Scraping Indeed for Full Stack Developer roles...",
      "Scraping LinkedIn for Backend Engineer roles...",
      "Scraping platforms for Frontend Developer roles...",
      "Deduplicating results...",
      "Running AI match scoring...",
      "Ranking by fit score...",
    ];
    let i = 0;
    setProgress(steps[0]);
    progressInterval.current = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setProgress(steps[i]);
    }, 4000);
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    setFetched(false);
    startProgress();
    try {
      const [jobsRes, summaryRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/jobs`).then((r) => r.json()),
        fetch(`${API_BASE}/api/profile-summary`).then((r) => r.json()),
      ]);
      if (jobsRes.status === "fulfilled" && jobsRes.value.success) {
        setJobs(jobsRes.value.jobs);
        setFetched(true);
      } else {
        setError(
          jobsRes.value?.error ||
            "Failed to fetch jobs. Is the server running?",
        );
      }
      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.summary);
        if (summaryRes.value.profile) {
          setProfile(summaryRes.value.profile);
        }
      }
    } catch (e) {
      setError(
        "Cannot reach backend. Make sure server is running on port 3001.",
      );
    } finally {
      clearInterval(progressInterval.current);
      setLoading(false);
    }
  };

  const handleAction = (id, status) => {
    setStatuses((prev) => {
      const next = { ...prev };
      if (status === null) delete next[id];
      else next[id] = status;
      return next;
    });
  };

  const appliedCount = Object.values(statuses).filter(
    (s) => s === "applied",
  ).length;
  const skippedCount = Object.values(statuses).filter(
    (s) => s === "skipped",
  ).length;
  const pendingCount = jobs.length - appliedCount - skippedCount;

  const filtered = jobs.filter((j) => {
    const s = statuses[j.id];
    const matchStatus =
      filter === "all" || (filter === "pending" ? !s : s === filter);
    const matchPlatform =
      platformFilter === "all" || j.platform === platformFilter;
    return matchStatus && matchPlatform;
  });

  const avgScore = jobs.length
    ? Math.round(jobs.reduce((a, b) => a + b.score, 0) / jobs.length)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0b0b18",
        color: "#e0e0f8",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0b0b18; }
        ::-webkit-scrollbar-thumb { background: #22224a; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }
        .job-card-enter { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        .btn-scan:hover { filter: brightness(1.1); transform: scale(1.02); }
        .btn-load-more:hover { background: #1a1a3a !important; }
        .filter-pill:hover { background: #ffffff14 !important; }

        .main-container { padding: 32px 4vw; width: 100%; margin: 0 auto; }
        .topbar { padding: 18px 4vw; }
        @media (max-width: 768px) {
          .main-container { padding: 24px 16px; }
          .topbar { padding: 16px; flex-direction: column; align-items: flex-start !important; gap: 16px; }
          .stat-pills { flex-wrap: wrap; }
          .stat-pill { min-width: calc(50% - 10px) !important; flex: 1 1 calc(50% - 10px) !important; }
          .profile-card { flex-direction: column; }
          .profile-card > button { width: 100%; }
          .filters-right { margin-left: 0 !important; width: 100%; justify-content: flex-start; margin-top: 10px; }
          .job-card-layout { flex-direction: column; }
          .job-card-buttons { width: 100%; flex-direction: row !important; }
          .job-card-buttons button { flex: 1; }
          .job-card-undo { width: 100%; }
        }
      `}</style>

      {/* Topbar */}
      <div
        className="topbar"
        style={{
          background: "#0e0e22",
          borderBottom: "1px solid #1a1a35",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #00e5a0, #00b8d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: "#e8e8ff",
                letterSpacing: -0.5,
              }}
            >
              JobPilot<span style={{ color: "#00e5a0" }}>.ai</span>
            </div>
            <div style={{ fontSize: 11, color: "#555580" }}>
              Powered by Puppeteer + Claude AI
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color:
                serverOnline === null
                  ? "#777"
                  : serverOnline
                    ? "#00e5a0"
                    : "#ff5c5c",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  serverOnline === null
                    ? "#777"
                    : serverOnline
                      ? "#00e5a0"
                      : "#ff5c5c",
              }}
            />
            {serverOnline === null
              ? "Checking server..."
              : serverOnline
                ? "Server online"
                : "Server offline"}
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Profile card */}
        <div
          style={{
            background: "#13132b",
            border: "1px solid #1e1e40",
            borderRadius: 18,
            padding: 22,
            marginBottom: 20,
          }}
        >
          <div
            className="profile-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "white",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {profile.initials}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#f0f0ff",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {profile.name}
                </div>
                <div style={{ color: "#7070a0", fontSize: 12, marginTop: 2 }}>
                  {profile.role}
                  {profile.location ? ` · ${profile.location}` : ""}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#6366f120",
                        color: "#a5b4fc",
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 5,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {!loading && (
              <button
                className="btn-scan"
                onClick={fetchJobs}
                disabled={!serverOnline}
                style={{
                  background: serverOnline
                    ? "linear-gradient(135deg, #00e5a0, #00b8d4)"
                    : "#1e1e35",
                  color: serverOnline ? "#0a0a1a" : "#555580",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: serverOnline ? "pointer" : "not-allowed",
                  fontFamily: "'Outfit', sans-serif",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {fetched ? "🔄 Re-scan Jobs" : "🔍 Scan Jobs"}
              </button>
            )}
          </div>

          {summary && (
            <div
              style={{
                marginTop: 16,
                background: "#6366f110",
                border: "1px solid #6366f125",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#818cf8",
                  fontWeight: 700,
                  marginBottom: 4,
                  letterSpacing: 0.8,
                }}
              >
                AI PROFILE SUMMARY
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: "#b0b0d8",
                  lineHeight: 1.7,
                }}
              >
                {summary}
              </p>
            </div>
          )}
        </div>

        {/* Server offline warning */}
        {serverOnline === false && (
          <div
            style={{
              background: "#ff5c5c10",
              border: "1px solid #ff5c5c30",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                color: "#ff5c5c",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              ⚠ Backend server is not running
            </div>
            <div style={{ color: "#aa6060", fontSize: 12, lineHeight: 1.6 }}>
              Start the server first:
              <br />
              <code
                style={{
                  background: "#ffffff0d",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                cd jobpilot-server && npm install && ANTHROPIC_API_KEY=your_key
                node server.js
              </code>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #1e1e35",
                borderTopColor: "#00e5a0",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 13,
                color: "#00e5a0",
                marginBottom: 8,
              }}
            >
              {progress}
            </div>
            <div style={{ fontSize: 12, color: "#444468" }}>
              This may take 30–60 seconds
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 5,
                marginTop: 16,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#00e5a0",
                    animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#ff5c5c08",
              border: "1px solid #ff5c5c22",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              color: "#ff8888",
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Stats */}
        {fetched && !loading && (
          <div
            className="stat-pills"
            style={{ display: "flex", gap: 10, marginBottom: 20 }}
          >
            <StatPill label="Jobs Found" value={jobs.length} color="#6366f1" />
            <StatPill
              label="Avg Match Score"
              value={`${avgScore}%`}
              color="#00e5a0"
            />
            <StatPill label="Pending" value={pendingCount} color="#f5a623" />
            <StatPill label="Applied" value={appliedCount} color="#00e5a0" />
          </div>
        )}

        {/* Filters */}
        {fetched && !loading && (
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["applied", "Applied ✓"],
              ["skipped", "Skipped"],
            ].map(([val, label]) => (
              <button
                key={val}
                className="filter-pill"
                onClick={() => setFilter(val)}
                style={{
                  background: filter === val ? "#00e5a0" : "#ffffff08",
                  color: filter === val ? "#0a0a1a" : "#8080b0",
                  border: `1px solid ${filter === val ? "#00e5a0" : "#ffffff0d"}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
            <div
              className="filters-right"
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              {["all", ...new Set(jobs.map((j) => j.platform))].map((p) => (
                <button
                  key={p}
                  className="filter-pill"
                  onClick={() => setPlatformFilter(p)}
                  style={{
                    background:
                      platformFilter === p
                        ? PLATFORM_META[p]?.color || "#6366f1"
                        : "#ffffff08",
                    color: platformFilter === p ? "white" : "#8080b0",
                    border: `1px solid ${platformFilter === p ? PLATFORM_META[p]?.color || "#6366f1" : "#ffffff0d"}`,
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {p === "all" ? "All Platforms" : p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Jobs */}
        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.slice(0, visibleCount).map((job, i) => (
              <div
                key={job.id}
                className="job-card-enter"
                style={{ animationDelay: `${(i % 15) * 0.04}s` }}
              >
                <JobCard
                  job={job}
                  status={statuses[job.id]}
                  onAction={handleAction}
                />
              </div>
            ))}

            {visibleCount < filtered.length && (
              <button
                className="btn-load-more"
                onClick={() => setVisibleCount((v) => v + 15)}
                style={{
                  marginTop: 10,
                  padding: "14px",
                  background: "#13132b",
                  border: "1px solid #22224a",
                  color: "#00e5a0",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  transition: "background 0.2s",
                }}
              >
                Load More Jobs ({filtered.length - visibleCount} remaining) ↓
              </button>
            )}

            {fetched && filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#444468",
                  fontSize: 14,
                }}
              >
                No jobs in this category.
              </div>
            )}
            {!fetched && !loading && !error && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#444468",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
                <div style={{ fontSize: 14 }}>
                  Click <strong style={{ color: "#00e5a0" }}>Scan Jobs</strong>{" "}
                  to find real listings
                </div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#333355" }}>
                  Searches LinkedIn · Naukri · Indeed in real time
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
