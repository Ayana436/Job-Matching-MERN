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

const enrichJobsWithApplications = (jobList, applications = []) => {
    return jobList.map((job) => {
        const application = applications.find(
            (app) => String(app.jobId?._id || app.jobId) === String(job._id)
        );

        return {
            ...job,
            applied: Boolean(application),
            applicationStatus: application?.status || null,
            applicationId: application?._id || null,
            confidence: job.matchScore > 0 ? Math.min(98, Math.max(50, job.matchScore + 8)) : null,
            matchedSkills: job.matchedSkills || [],
            missingSkills: job.missingSkills || []
        };
    });
};

const CandidateView = () => {
    const navigate = useNavigate();
    const user = getStoredJson("user", null);
    const userId = user?.id || user?._id;

    const [allJobs, setAllJobs] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [hasMatchedResults, setHasMatchedResults] = useState(false);
    const [applications, setApplications] = useState([]);
    const [resume, setResume] = useState(null);
    const [resumeHistory, setResumeHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChips, setSelectedChips] = useState([]);
    const [suggestedChips, setSuggestedChips] = useState([]);
    const [recentSearches, setRecentSearches] = useState(() => getStoredJson("recentSearches", []));
    const [savedSearches, setSavedSearches] = useState(() => getStoredJson("savedSearches", []));
    const [savedJobs, setSavedJobs] = useState(() => getStoredJson("savedJobs", []));
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [activeTab, setActiveTab] = useState("all");
    const [jobsPage, setJobsPage] = useState(1);
    const [resumeCurrentPage, setResumeCurrentPage] = useState(1);
    const [toast, setToast] = useState(null);

    const jobsPerPage = 6;
    const resumesPerPage = 3;

    const notify = useCallback((message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    }, []);

    // --- DECOUPLED CANDIDATE API OPERATIONS ---
    const fetchJobs = useCallback(async (preserveMatched = false) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await API.get("/api/jobs", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && Array.isArray(res.data)) {
                setApplications(currentApps => {
                    const enrichedJobs = enrichJobsWithApplications(res.data || [], currentApps);
                    setAllJobs(enrichedJobs);
                    if (!preserveMatched) {
                        setJobs(enrichedJobs);
                    }
                    return currentApps;
                });
            }
        } catch {
            setJobs([]);
        }
    }, []); 

    const fetchResumeHistory = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await API.get("/api/jobs/resume-history", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumeHistory(res.data.history || []);
        } catch {
            setResumeHistory([]);
        }
    }, []); 

    const fetchApplications = useCallback(async () => {
        if (!userId) return [];
        try {
            const token = localStorage.getItem("token");
            if (!token) return [];
            const res = await API.get(`/api/jobs/my-applications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && Array.isArray(res.data)) {
                setApplications(res.data);
                setAllJobs(prev => enrichJobsWithApplications(prev, res.data));
                setJobs(prev => enrichJobsWithApplications(prev, res.data));
            }
            return res.data;
        } catch {
            return [];
        }
    }, [userId]); 

    // --- INITIALIZATION LIFECYCLE ---
    useEffect(() => {
        let isMounted = true;

        const loadInitialCandidateData = async () => {
            if (hasMatchedResults) return;
            setJobsLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };

                const [jobsRes, appsRes] = await Promise.all([
                    API.get("/api/jobs", { headers: {
                        Authorization: `Bearer ${token}`
                    } }).catch(() => ({ data: [] })),
                    userId ? API.get(`/api/jobs/my-applications/${userId}`, { headers }).catch(() => ({ data: [] })) : { data: [] }
                ]);

                if (isMounted) {
                    const appsData = appsRes.data || [];
                    setApplications(appsData);

                    if (jobsRes.data && Array.isArray(jobsRes.data) && jobsRes.data.length > 0) {
                        const enrichedJobs = enrichJobsWithApplications(jobsRes.data, appsData);
                        setAllJobs(enrichedJobs);
                        setJobs(enrichedJobs);
                    }
                }
            } catch {
                if (isMounted) {
                    setApplications([]);
                }
            } finally {
                if (isMounted) setJobsLoading(false);
            }
        };

        loadInitialCandidateData();
        fetchResumeHistory();

        return () => {
            isMounted = false;
        };
    }, [fetchResumeHistory, hasMatchedResults, userId]); 

    // --- BACKGROUND SYNCER (30-SECOND POOL) ---
    useEffect(() => {
        let isMounted = true;
        let intervalId = null;

        const executePollBatch = async () => {
            if (!isMounted) return;
            if (!hasMatchedResults && (!selectedChips || selectedChips.length === 0) && !searchQuery) {
                await fetchJobs(true);
            }
            await fetchApplications();
        };

        intervalId = setInterval(executePollBatch, 30000);

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [hasMatchedResults, selectedChips, searchQuery, fetchApplications, fetchJobs]);

    useEffect(() => {
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
    }, [savedJobs]);

    useEffect(() => {
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }, [recentSearches]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    // LOGOUT + TOKEN EXPIRY
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiry = payload.exp * 1000;

            if (Date.now() >= expiry) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                notify("Session expired. Please login again.", "error");
                navigate("/auth");
                return;
            }

            const timeout = expiry - Date.now();
            const logoutTimer = setTimeout(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                notify("Session expired. Logged out.", "error");
                navigate("/auth");
            }, timeout);

            return () => clearTimeout(logoutTimer);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/auth");
        }
    }, [navigate, notify]);

    const saveRecentSearch = (query) => {
        if (!query.trim()) return;
        setRecentSearches((prev) => [query, ...prev.filter((item) => item !== query)].slice(0, 5));
    };

    const saveSearch = () => {
        if (!searchQuery.trim()) return;

        const updated = [
            searchQuery,
            ...savedSearches.filter((item) => item !== searchQuery)
        ].slice(0, 10);

        setSavedSearches(updated);
        localStorage.setItem("savedSearches", JSON.stringify(updated));
        notify("Search saved");
    };

    const runSearch = async (query = searchQuery) => {
        const cleanQuery = query.trim();
        if (!cleanQuery) {
            setJobsPage(1);
            setJobs(allJobs);
            return;
        }

        try {
            setJobsLoading(true);
            const res = await API.get(`/api/jobs/search?q=${encodeURIComponent(cleanQuery)}`);
            setJobsPage(1);
            setJobs(enrichJobsWithApplications(res.data, applications));
            saveRecentSearch(cleanQuery);
        } catch {
            notify("Search failed.", "error");
        } finally {
            setJobsLoading(false);
        }
    };

    const handleChipSelect = async (chip) => {
        let updatedChips = [];
        if (selectedChips.includes(chip)) {
            updatedChips = selectedChips.filter((c) => c !== chip);
        } else {
            updatedChips = [...selectedChips, chip];
        }

        setSelectedChips(updatedChips);
        const query = updatedChips.join(", ");
        setSearchQuery(query);

        const newSuggestions = updatedChips.flatMap((selected) => chipSuggestions[selected] || []);
        setSuggestedChips([...new Set(newSuggestions)].filter((item) => !updatedChips.includes(item)));

        if (updatedChips.length === 0) {
            setHasMatchedResults(false);
            setJobsPage(1);
            setJobs(allJobs);
            return;
        }

        try {
            setJobsLoading(true);
            const res = await API.get(`/api/jobs/search?q=${encodeURIComponent(query)}`);
            setJobs(enrichJobsWithApplications(res.data, applications));
            setJobsPage(1);
        } catch {
            notify("Skill search failed.", "error");
        } finally {
            setJobsLoading(false);
        }
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
            const matchedJobs = enrichJobsWithApplications(res.data, applications);

            setJobsPage(1);
            setJobs([...matchedJobs]);
            setHasMatchedResults(true);

            await fetchResumeHistory();
            notify("Resume analyzed. Best matches are ranked first.");
        } catch {
            notify("Failed to upload resume.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId, matchScore, candidateSkills) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await API.post("/api/jobs/apply", {
                jobId,
                matchScore,
                candidateSkills
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200 || res.status === 201) {
                notify("Application submitted successfully!");
                fetchApplications();
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                notify(err.response.data?.message || "You have already applied for this job!", "error");
            } else {
                notify("Failed to apply for the job. Please try again.", "error");
            }
        }
    };

    const toggleSavedJob = (jobId) => {
        const alreadySaved = savedJobs.includes(jobId);
        setSavedJobs((prev) => alreadySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]);
        notify(alreadySaved ? "Removed from saved jobs" : "Job saved successfully", "success");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    const handleDeleteResume = async (resumeItem) => {
        try {
            if (!resumeItem?._id) {
                notify("Resume record is missing. Refresh and try again.", "error");
                return;
            }

            const shouldDelete = window.confirm(`Delete ${resumeItem.fileName || "this resume"}?`);
            if (!shouldDelete) return;

            await API.delete(`/api/jobs/resume/${resumeItem._id}`);

            setResume(null);
            setResumeHistory((prev) => prev.filter((item) => item._id !== resumeItem._id));
            setResumeCurrentPage((prev) =>
                Math.max(1, Math.min(prev, Math.ceil((resumeHistory.length - 1) / resumesPerPage) || 1))
            );
            setJobsPage(1);
            setJobs(allJobs);
            setHasMatchedResults(false);

            notify("Resume deleted successfully");
        } catch (err) {
            notify(err.response?.data?.message || err.response?.data?.error || "Failed to delete resume", "error");
        }
    };

    const appliedJobs = useMemo(() => allJobs.filter((job) => job.applied), [allJobs]);

    const pendingJobs = useMemo(() => appliedJobs.filter((job) => {
        const s = String(job.applicationStatus || '').toLowerCase().trim();
        return s === "pending" || s === "reviewed" || s === "applied";
    }), [appliedJobs]);

    const acceptedJobs = useMemo(() => appliedJobs.filter((job) => {
        const s = String(job.applicationStatus || '').toLowerCase().trim();
        return s === "accepted" || s === "decision";
    }), [appliedJobs]);

    const rejectedJobs = useMemo(() => appliedJobs.filter(
        (job) => String(job.applicationStatus || '').toLowerCase().trim() === "rejected"
    ), [appliedJobs]);

    // --- PRECISE FILTERING FIX ---
    const filteredJobs = useMemo(() => {
        const applicationTabs = ["saved", "applications", "pending", "accepted", "rejected"];
        let filtered = applicationTabs.includes(activeTab) ? [...allJobs] : [...jobs];
        const isMainTab = !applicationTabs.includes(activeTab);

        const hasActiveFilters = 
            (selectedChips && selectedChips.length > 0) || 
            (searchQuery && searchQuery.trim() !== "") ||
            hasMatchedResults;

        if (isMainTab && !hasActiveFilters) {
            return filtered;
        }

        if (activeTab === "saved") {
            return filtered.filter(job => savedJobs.includes(job._id));
        }
        if (activeTab === "applications") {
            return filtered.filter(job => job.applied);
        }
        if (activeTab === "pending") {
            return filtered.filter(job => {
                const status = String(job.applicationStatus || '').toLowerCase().trim();
                return status === "pending" || status === "applied" || status === "reviewed" || status === "review";
            });
        }
        if (activeTab === "accepted") {
            return filtered.filter(job => {
                const status = String(job.applicationStatus || '').toLowerCase().trim();
                return status === "accepted" || status === "decision";
            });
        }
        if (activeTab === "rejected") {
            return filtered.filter(job => {
                const status = String(job.applicationStatus || '').toLowerCase().trim();
                return status === "rejected";
            });
        }

        if (isMainTab && hasActiveFilters) {
            return filtered.filter(job => {
                const matchesSearch = searchQuery.trim() 
                    ? String(job.title || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                    String(job.company || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
                    : true;
                
                const jobSkillsArray = job.requiredSkills || job.matchedSkills || job.skills || [];
                const matchesChips = selectedChips && selectedChips.length > 0
                    ? selectedChips.some(chip => 
                        jobSkillsArray.some(skill => 
                            String(skill.name || skill).toLowerCase().trim() === String(chip).toLowerCase().trim()
                        )
                    )
                    : true;

                return matchesSearch && matchesChips;
            });
        }

        return filtered;
    }, [allJobs, jobs, savedJobs, activeTab, searchQuery, selectedChips, hasMatchedResults]);

    useEffect(() => {
        setJobsPage(1);
    }, [activeTab, searchQuery, selectedChips.length, hasMatchedResults]);

    const profileCompletion = useMemo(() => {
        let score = 0;
        if (user?.name) score += 25;
        if (user?.email) score += 25;
        if (resumeHistory.length > 0) score += 25;
        if (applications.length > 0) score += 25;
        return score;
    }, [user, resumeHistory, applications]);
        
    const averageMatch = jobs.length
        ? Math.round(jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / jobs.length)
        : 0;

    const totalResumePages = Math.ceil(resumeHistory.length / resumesPerPage);
    const resumeStartIndex = (resumeCurrentPage - 1) * resumesPerPage;
    const paginatedResumeHistory = resumeHistory.slice(resumeStartIndex, resumeStartIndex + resumesPerPage);

    const jobsStartIndex = (jobsPage - 1) * jobsPerPage;
    const visibleJobs = filteredJobs.slice(jobsStartIndex, jobsStartIndex + jobsPerPage);

    const getResumeUrl = (filePath) => {
        if (!filePath) return "";
        const cleanedPath = filePath.replace(/\\/g, "/");
        const filename = cleanedPath.split("/").pop();
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${baseUrl}/uploads/${filename}`;
    };

    const getStatusClass = (statusStr) => {
        const status = String(statusStr || '').toLowerCase().trim();
        if (status === 'accepted' || status === 'decision') return 'accepted';
        if (status === 'rejected') return 'rejected';
        return 'pending';
    };

    const getTimelineStep = (statusStr) => {
        const status = String(statusStr || '').toLowerCase().trim();
        if (status === 'accepted' || status === 'rejected' || status === 'decision') return 3;
        if (status === 'reviewed' || status === 'review') return 2;
        return 1;
    };

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
                <button className={`stat-filter ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab(activeTab === "applications" ? "all" : "applications")}>
                    <strong>{appliedJobs.length}</strong>
                    <span>Applications</span>
                </button>
                <button className={`stat-filter ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab(activeTab === "saved" ? "all" : "saved")}>
                    <strong>{savedJobs.length}</strong>
                    <span>Saved Jobs</span>
                </button>
                <button className={`stat-filter ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab(activeTab === "pending" ? "all" : "pending")}>
                    <strong>{pendingJobs.length}</strong>
                    <span>Pending</span>
                </button>
                <button className={`stat-filter ${activeTab === "accepted" ? "active" : ""}`} onClick={() => setActiveTab(activeTab === "accepted" ? "all" : "accepted")}>
                    <strong>{acceptedJobs.length}</strong>
                    <span>Accepted</span>
                </button>
                <button className={`stat-filter ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab(activeTab === "rejected" ? "all" : "rejected")}>
                    <strong>{rejectedJobs.length}</strong>
                    <span>Rejected</span>
                </button>
                <div className="stat-filter-static">
                    <strong>{averageMatch}%</strong>
                    <span>Avg Match</span>
                </div>
                <div className="stat-filter-static">
                    <strong>{profileCompletion}%</strong>
                    <span>Profile</span>
                </div>
            </section>

            <section className="candidate-panel">
                <div className="search-row">
                    <input
                        id="search"
                        name="search"
                        type="text"
                        placeholder="Search jobs, skills, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runSearch()}
                    />
                    <button className="primary-btn" onClick={() => runSearch()}>Search</button>
                    <button className="ghost-btn" onClick={saveSearch}>Save Search</button>
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

                {savedSearches.length > 0 && (
                    <div className="recent-searches">
                        <span>Saved Searches:</span>
                        {savedSearches.map((item) => (
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
                                {chip}
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
                    <label className="custom-file-upload" htmlFor="hidden-file-input">
                        Choose Resume PDF
                    </label>
                    <input
                        id="hidden-file-input"
                        name="resume"
                        className="hidden-file-input"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResume(e.target.files?.[0] || null)}
                    />
                    <span className="selected-file-name">{resume ? resume.name : "No file selected"}</span>
                    <button type="button" className="success-btn" disabled={loading} onClick={handleResumeUpload}>
                        {loading ? "Analyzing..." : "Upload & Match"}
                    </button>
                </div>
            </section>

            <section className="resume-history-panel">
                {resumeHistory.length === 0 ? (
                    <div className="empty-state">No resumes uploaded yet.</div>
                ) : (
                    <>
                        <div className="resume-history-list">
                            {paginatedResumeHistory.map((resumeItem, index) => (
                                <div key={resumeItem._id || index} className="resume-history-card">
                                    <div>
                                        <strong>{resumeItem.fileName}</strong>
                                        <p>Uploaded on {resumeItem.uploadedAt ? new Date(resumeItem.uploadedAt).toLocaleString() : "Recently uploaded"}</p>
                                    </div>
                                    {resumeItem?.filePath ? (
                                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                            <button
                                                className="primary-btn"
                                                onClick={() => window.open(`${getResumeUrl(resumeItem.filePath)}#toolbar=1&navpanes=0&scrollbar=1`, "_blank")}
                                                style={{ background: "#1e293b", color: "white", border: "1px solid #334155", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                                            >
                                                View Resume
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement("a");
                                                    link.href = getResumeUrl(resumeItem.filePath);
                                                    link.download = resumeItem.fileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                style={{ background: "#4caf5022", color: "#4caf50", border: "1px solid #4caf50", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                                            >
                                                Download Resume
                                            </button>
                                            <button className="delete-resume-btn" onClick={() => handleDeleteResume(resumeItem)}>
                                                Delete Resume
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: "#888" }}>No Resume</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pagination-controls">
                            <button disabled={resumeCurrentPage === 1} onClick={() => setResumeCurrentPage(prev => prev - 1)}>
                                ← Previous
                            </button>
                            <span>Page {resumeCurrentPage} of {totalResumePages || 1}</span>
                            <button disabled={resumeCurrentPage >= totalResumePages} onClick={() => setResumeCurrentPage(prev => prev + 1)}>
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section>
                <div className="section-title-row">
                    <h2>
                        {activeTab === "saved" ? "Saved Jobs"
                        : activeTab === "applications" ? "My Applications"
                        : activeTab === "accepted" ? "Accepted Jobs"
                        : activeTab === "pending" ? "Pending Jobs"
                        : activeTab === "rejected" ? "Rejected Jobs"
                        : "Available Jobs"}
                    </h2>
                    <div className="title-actions">
                        {hasMatchedResults && (
                            <button className="ghost-btn compact" onClick={() => { setJobs(allJobs); setHasMatchedResults(false); }}>
                                View all jobs
                            </button>
                        )}
                        <span>{filteredJobs.length} results</span>
                    </div>
                </div>

<div style={{color:"red"}}>

<p>activeTab : {activeTab}</p>

<p>allJobs : {allJobs.length}</p>

<p>jobs : {jobs.length}</p>

<p>filteredJobs : {filteredJobs.length}</p>

<p>applications : {applications.length}</p>

<p>selectedChips : {selectedChips.length}</p>

<p>searchQuery : {searchQuery}</p>

<p>hasMatchedResults : {String(hasMatchedResults)}</p>

</div>

                {jobsLoading ? (
                    <div className="results-grid">
                        {[1, 2, 3, 4].map((item) => <div className="job-skeleton" key={item} />)}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="empty-state">
                        {activeTab === "saved" ? "No saved jobs yet."
                        : activeTab === "applications" ? "You haven't applied to any jobs yet."
                        : "No jobs found."}
                    </div>
                ) : (
                    <>
                        <div className="results-grid">
                            {visibleJobs.map((job, index) => {
                                const currentStatus = String(job.applicationStatus || '').toLowerCase().trim();
                                const currentStep = getTimelineStep(currentStatus);

                                return (
                                    <div key={job._id || index} className="job-wrapper" style={{ marginTop: '20px', display: 'block' }}>
                                        <JobCard
                                            job={job}
                                            onApply={() => handleApply(job._id, job.matchScore || 0, job.matchedSkills || [])}
                                            isSaved={savedJobs.includes(job._id)}
                                            onToggleSave={toggleSavedJob}
                                            applicationStatus={currentStatus} 
                                        />

                                        {job.applied && (
                                            <div className="application-status-container" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginTop: '-15px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none', borderTopLeftRadius: '0', borderTopRightRadius: '0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tracking Status:</span>
                                                        <div className={`status-badge ${getStatusClass(currentStatus)}`}>
                                                            {currentStatus === 'reviewed' ? 'Under Review' : currentStatus || 'Applied'}
                                                        </div>
                                                    </div>

                                                    <div className="application-timeline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div className="timeline-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div className="timeline-dot completed" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#646cff', boxShadow: '0 0 8px #646cff' }} />
                                                            <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>Applied</span>
                                                        </div>

                                                        <div className="timeline-line" style={{ width: '30px', height: '2px', background: currentStep >= 2 ? '#646cff' : 'rgba(255,255,255,0.1)' }} />

                                                        <div className="timeline-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div className={`timeline-dot ${currentStep >= 2 ? 'completed' : ''}`} style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentStep >= 2 ? '#fffc64' : 'rgba(255,255,255,0.2)', boxShadow: currentStep >= 2 ? '0 0 8px #e3ff64' : 'none' }} />
                                                            <span style={{ fontSize: '0.8rem', color: currentStep >= 2 ? '#fff' : '#666', fontWeight: '500' }}>Review</span>
                                                        </div>

                                                        <div className="timeline-line" style={{ width: '30px', height: '2px', background: currentStep >= 3 ? (currentStatus === 'accepted' ? '#22c55e' : currentStatus === 'rejected' ? '#ef4444' : '#646cff') : 'rgba(255,255,255,0.1)' }} />

                                                        <div className="timeline-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <div 
                                                                className={`timeline-dot ${currentStep >= 3 ? currentStatus : ''}`} 
                                                                style={{ 
                                                                    width: '10px', height: '10px', borderRadius: '50%', 
                                                                    background: currentStep >= 3 ? (currentStatus === 'accepted' ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.2)',
                                                                    boxShadow: currentStep >= 3 ? `0 0 8px ${currentStatus === 'accepted' ? '#22c55e' : '#ef4444'}` : 'none'
                                                                }} 
                                                            />
                                                            <span style={{ fontSize: '0.8rem', color: currentStep >= 3 ? (currentStatus === 'accepted' ? '#22c55e' : '#ef4444') : '#666', fontWeight: '700', textTransform: 'capitalize' }}>
                                                                {currentStatus === 'accepted' ? 'Accepted' : currentStatus === 'rejected' ? 'Rejected' : 'Decision'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {filteredJobs.length > jobsPerPage && (
                            <div className="pagination-wrapper" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
                                <button 
                                    disabled={jobsPage === 1} 
                                    onClick={() => setJobsPage(prev => Math.max(prev - 1, 1))}
                                    className="pagination-btn"
                                >
                                    ← Previous
                                </button>
                                <span className="page-indicator">
                                    Page {jobsPage} of {Math.ceil(filteredJobs.length / jobsPerPage)}
                                </span>
                                <button 
                                    disabled={jobsPage >= Math.ceil(filteredJobs.length / jobsPerPage)} 
                                    onClick={() => setJobsPage(prev => prev + 1)}
                                    className="pagination-btn"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default CandidateView;
