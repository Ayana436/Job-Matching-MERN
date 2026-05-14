import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import JobCard from "../components/JobCard";

const defaultChips = [
    "AI",
    "Frontend",
    "Backend",
    "Cloud",
    "AWS",
    "React",
    "Python",
    "Java",
    "Remote",
    "Internship",
    "Full-time",
];

const chipSuggestions = {
    AI: ["AI Chatbot", "Machine Learning", "NLP", "LLM Engineer"],
    Frontend: ["React Developer", "UI/UX", "Next.js", "TypeScript"],
    Backend: ["Node.js", "MongoDB", "Express", "REST API"],
    Cloud: ["AWS", "Azure", "Docker", "Kubernetes"],
    AWS: ["EC2", "Lambda", "DevOps", "Cloud Engineer"],
    React: ["Redux", "React Native", "Tailwind", "Vite"],
    Python: ["Django", "Flask", "Data Science", "FastAPI"],
    Java: ["Spring Boot", "Microservices", "Hibernate"],
};

const getStoredJson = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
};

const enrichJobsWithApplications = (jobList, appList = []) => {
    const appliedIds = new Set(appList.map((app) => String(app.jobId?._id || app.jobId)));

    return jobList.map((job) => ({
        ...job,
        applied: appliedIds.has(String(job._id)),
        confidence: job.matchScore > 0 ? Math.min(98, Math.max(52, job.matchScore + 8)) : null,
    }));
};

const CandidateView = () => {
    const navigate = useNavigate();
    const user = getStoredJson("user", null);
    const userId = user?.id || user?._id;

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChips, setSelectedChips] = useState([]);
    const [suggestedChips, setSuggestedChips] = useState([]);
    const [recentSearches, setRecentSearches] = useState(() => getStoredJson("recentSearches", []));
    const [savedJobs, setSavedJobs] = useState(() => getStoredJson("savedJobs", []));
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [visibleCount, setVisibleCount] = useState(6);
    const [toast, setToast] = useState(null);
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    const notify = useCallback((message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    }, []);

    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const res = await API.get("/api/jobs");
            setJobs(enrichJobsWithApplications(res.data, applications));
        } catch (err) {
            console.error("Error fetching jobs:", err);
            notify("Could not load jobs.", "error");
        } finally {
            setJobsLoading(false);
        }
    }, [applications, notify]);

    const fetchApplications = useCallback(async () => {
        if (!userId) return [];

        try {
            const res = await API.get(`/api/jobs/my-applications/${userId}`);
            setApplications(res.data);
            setJobs((prevJobs) => enrichJobsWithApplications(prevJobs, res.data));
            return res.data;
        } catch (err) {
            console.error("Error fetching applications:", err);
            notify("Could not refresh applications.", "error");
            return [];
        }
    }, [notify, userId]);

    useEffect(() => {
        const loadInitialData = async () => {
            setJobsLoading(true);
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    API.get("/api/jobs"),
                    userId ? API.get(`/api/jobs/my-applications/${userId}`) : Promise.resolve({ data: [] }),
                ]);

                setApplications(appsRes.data);
                setJobs(enrichJobsWithApplications(jobsRes.data, appsRes.data));
            } catch (err) {
                console.error("Error loading candidate data:", err);
                notify("Could not load candidate dashboard.", "error");
            } finally {
                setJobsLoading(false);
            }
        };

        loadInitialData();
    }, [notify, userId]);


    useEffect(() => {
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
    }, [savedJobs]);

    useEffect(() => {
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }, [recentSearches]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const saveRecentSearch = (query) => {
        if (!query.trim()) return;
        setRecentSearches((prev) => [query, ...prev.filter((item) => item !== query)].slice(0, 5));
    };

    const runSearch = async (query = searchQuery) => {
        const cleanQuery = query.trim();
        setVisibleCount(6);

        if (!cleanQuery) {
            await fetchJobs();
            return;
        }

        try {
            setJobsLoading(true);
            const res = await API.get(`/api/jobs/search?q=${encodeURIComponent(cleanQuery)}`);
            setJobs(enrichJobsWithApplications(res.data, applications));
            saveRecentSearch(cleanQuery);
        } catch (err) {
            console.error("Search failed:", err);
            notify("Search failed.", "error");
        } finally {
            setJobsLoading(false);
        }
    };

    const handleChipSelect = (chip) => {
        const updatedChips = selectedChips.includes(chip) ? selectedChips : [...selectedChips, chip];
        const query = updatedChips.join(", ");

        setSelectedChips(updatedChips);
        setSearchQuery(query);
        setSuggestedChips((chipSuggestions[chip] || []).filter((item) => !updatedChips.includes(item)));
        runSearch(query);
    };

    const handleResumeUpload = async () => {
        if (!resume) {
            notify("Please choose a PDF file first.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resume);

        try {
            setLoading(true);
            const res = await API.post("/api/jobs/match-pdf", formData);
            setJobs(enrichJobsWithApplications(res.data, applications));
            setVisibleCount(6);
            notify("Resume analyzed. Best matches are ranked first.");
        } catch (err) {
            console.error("Resume upload failed:", err);
            notify("Failed to upload resume.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId, matchScore) => {
        if (!userId) {
            notify("Please login first.", "error");
            navigate("/auth");
            return false;
        }

        try {
            const res = await API.post("/api/jobs/apply", {
                jobId,
                matchScore,
                candidateSkills: selectedChips,
            });

            notify(res.data.message || "Application submitted.");
            await fetchApplications();
            return true;
        } catch (err) {
            console.error("Apply failed:", err);
            notify(err.response?.data?.error || "Application failed.", "error");
            return false;
        }
    };

    const toggleSavedJob = (jobId) => {
        setSavedJobs((prev) =>
            prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    const filteredJobs = useMemo(
        () => showSavedOnly ? jobs.filter((job) => savedJobs.includes(job._id)) : jobs,
        [jobs, savedJobs, showSavedOnly]
    );
    const visibleJobs = useMemo(() => filteredJobs.slice(0, visibleCount), [filteredJobs, visibleCount]);
    const acceptedCount = applications.filter((app) => app.status === "Accepted").length;
    const averageMatch = jobs.length
        ? Math.round(jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / jobs.length)
        : 0;

    return (
        <div className={`candidate-page ${theme === "light" ? "light-mode" : ""}`}>
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            <header className="candidate-header">
                <div>
                    <h1>Welcome, {user?.name || "Candidate"}</h1>
                    <p>Find jobs, compare AI scores, and track applications.</p>
                </div>

                <div className="candidate-actions">
                    <button className="ghost-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button className="danger-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <section className="candidate-stats">
                <div><strong>{applications.length}</strong><span>Applications</span></div>
                <div><strong>{acceptedCount}</strong><span>Accepted</span></div>
                <button className={showSavedOnly ? "stat-filter active" : "stat-filter"} onClick={() => { setShowSavedOnly((value) => !value); setVisibleCount(6); }}>
                    <strong>{savedJobs.length}</strong><span>{showSavedOnly ? "Showing Saved" : "Saved Jobs"}</span>
                </button>
                <div><strong>{averageMatch}%</strong><span>Avg Match</span></div>
            </section>

            <section className="candidate-panel">
                <div className="search-row">
                    <input
                        type="text"
                        placeholder="Search jobs, skills, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runSearch()}
                    />
                    <button className="primary-btn" onClick={() => runSearch()}>Search</button>
                </div>

                {recentSearches.length > 0 && (
                    <div className="recent-searches">
                        <span>Recent:</span>
                        {recentSearches.map((item) => (
                            <button key={item} onClick={() => { setSearchQuery(item); runSearch(item); }}>
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                <div className="chips-marquee">
                    <div className="chips-track smooth-scroll">
                        {[...defaultChips, ...defaultChips].map((chip, index) => (
                            <button
                                key={`${chip}-${index}`}
                                className={selectedChips.includes(chip) ? "moving-chip selected" : "moving-chip"}
                                onClick={() => handleChipSelect(chip)}
                            >
                                {chip}{selectedChips.includes(chip) ? " selected" : ""}
                            </button>
                        ))}
                    </div>
                </div>

                {suggestedChips.length > 0 && (
                    <div className="ai-suggestions">
                        <h3>AI Suggestions</h3>
                        <div>
                            {suggestedChips.map((chip) => (
                                <button key={chip} onClick={() => handleChipSelect(chip)}>
                                    {chip} +
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="resume-panel">
                <div>
                    <h2>Upload Resume for AI Matching</h2>
                    <p>PDF resumes are matched against required skills and ranked by score.</p>
                </div>
                <div className="resume-upload-wrapper">
                    <label className="custom-file-upload">
                        Choose Resume PDF
                        <input
                            className="hidden-file-input"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setResume(e.target.files?.[0] || null)}
                        />
                    </label>
                    <span className="selected-file-name">{resume ? resume.name : "No file selected"}</span>
                    <button className="success-btn" disabled={loading} onClick={handleResumeUpload}>
                        {loading ? "Analyzing..." : "Upload & Match"}
                    </button>
                </div>
            </section>

            <section>
                <div className="section-title-row">
                    <h2>{showSavedOnly ? "Saved Jobs" : "Available Jobs"}</h2>
                    <div className="title-actions">
                        {showSavedOnly && (
                            <button className="ghost-btn compact" onClick={() => setShowSavedOnly(false)}>
                                View all jobs
                            </button>
                        )}
                        <span>{filteredJobs.length} results</span>
                    </div>
                </div>

                {jobsLoading ? (
                    <div className="results-grid">
                        {[1, 2, 3, 4].map((item) => <div className="job-skeleton" key={item} />)}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <p className="empty-state">{showSavedOnly ? "No saved jobs yet. Use the Save button on jobs you like." : "No jobs found."}</p>
                ) : (
                    <>
                        <div className="results-grid">
                            {visibleJobs.map((job) => (
                                <JobCard
                                    key={job._id}
                                    job={job}
                                    onApply={handleApply}
                                    isSaved={savedJobs.includes(job._id)}
                                    onToggleSave={toggleSavedJob}
                                />
                            ))}
                        </div>

                        {visibleCount < filteredJobs.length && (
                            <button className="load-more-btn" onClick={() => setVisibleCount((count) => count + 6)}>
                                Load more jobs
                            </button>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default CandidateView;
