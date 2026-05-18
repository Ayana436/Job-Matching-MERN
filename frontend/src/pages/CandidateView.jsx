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

            applicationStatus:
                application?.status || null,

            applicationId:
                application?._id || null,

                confidence:
                job.matchScore > 0
                    ? Math.min(
                            98,
                            Math.max(50, job.matchScore + 8)
                        )
                    : null,

                    matchedSkills:
                        job.matchedSkills || [],

                    missingSkills:
                        job.missingSkills || []
        };
    });
};

const CandidateView = () => {
    console.log("CandidateView rendered");
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
    const [savedJobs, setSavedJobs] = useState(() => getStoredJson("savedJobs", []));
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [activeTab, setActiveTab] = useState("all");
    // const [visibleCount, setVisibleCount] = useState(6);
    const [jobsPage, setJobsPage] =useState(1);
    const [resumeCurrentPage, setResumeCurrentPage] = useState(1);
    const [applicationsPage, setApplicationsPage] = useState(1);
    const [toast, setToast] = useState(null);
    

    const jobsPerPage = 6;
    const resumesPerPage = 3;
    const applicationsPerPage = 5;
    const notify = useCallback((message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    }, []);

const fetchJobs = useCallback(async (preserveMatched = false) => {
    try {
        const res = await API.get("/api/jobs");

        const enrichedJobs = enrichJobsWithApplications(
            res.data,
            applications
        );

        setAllJobs(enrichedJobs);

        // ONLY overwrite visible jobs when not preserving AI matched jobs
        if (!preserveMatched) {
            setJobs(enrichedJobs);
        }

    } catch (err) {
        console.error("Error fetching jobs:", err);
    }
}, [applications]);

const fetchResumeHistory = useCallback(async () => {

    try {
        const token = localStorage.getItem("token");

        const res = await API.get(
            "/api/jobs/resume-history",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setResumeHistory(
            res.data.history || []
        );
    } catch (err) {
        console.error(
            "Resume history fetch failed:",
            err
        );
    }
}, []);


const fetchApplications = useCallback(async () => {
    if (!userId) return [];

    try {
        const token = localStorage.getItem("token");

        const res = await API.get(
            `/api/jobs/my-applications/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setApplications(res.data);

        // IMPORTANT:
        // refresh ALL jobs using latest applications
        setAllJobs((prev) =>
            enrichJobsWithApplications(prev, res.data)
        );

        setJobs((prev) =>
            enrichJobsWithApplications(prev, res.data)
        );

        return res.data;

    } catch (err) {
        console.error("Error fetching applications:", err);
        notify("Could not refresh applications.", "error");
        return [];
    }
}, [notify, userId]);

useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
        console.log("INITIAL FETCH RUNNING")
        if (hasMatchedResults) return;

        setJobsLoading(true);

        try {
            const jobsRes = await API.get("/api/jobs");

            let appsData = [];

            if (userId) {
                const appsRes = await API.get(
                    `/api/jobs/my-applications/${userId}`
                );

                appsData = appsRes.data;

                if (isMounted) {
                    setApplications(appsData);
                }
            }

            if (isMounted) {
                const enrichedJobs = enrichJobsWithApplications(
    jobsRes.data,
    appsData
);

setAllJobs(enrichedJobs);
setJobs(enrichedJobs);
            }
        } catch (err) {
            console.error("Error loading candidate data:", err);
        } finally {
            if (isMounted) {
                setJobsLoading(false);
            }
        }
    };

    loadInitialData();

    fetchResumeHistory();

    console.log("iFR")

    return () => {
        isMounted = false;
    };
}, []);

useEffect(() => {
    const interval = setInterval(() => {

        if (!hasMatchedResults && selectedChips.length === 0) {
            fetchJobs();
        }

        fetchApplications();

    }, 5000);

    return () => clearInterval(interval);

}, [fetchJobs, fetchApplications, hasMatchedResults, selectedChips.length]);

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
        // setVisibleCount(8);

        if (!cleanQuery) {
            setJobs(allJobs);
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

const handleChipSelect = async (chip) => {

    let updatedChips = [];

    // REMOVE chip if already selected
    if (selectedChips.includes(chip)) {
        updatedChips = selectedChips.filter((c) => c !== chip);
    } else {
        // ADD chip
        updatedChips = [...selectedChips, chip];
    }

    setSelectedChips(updatedChips);

    const query = updatedChips.join(", ");

    setSearchQuery(query);

    // update suggestions
    const newSuggestions = updatedChips.flatMap(
        (selected) => chipSuggestions[selected] || []
    );

    setSuggestedChips(
        [...new Set(newSuggestions)].filter(
            (item) => !updatedChips.includes(item)
        )
    );

    // IF NO CHIPS SELECTED
    if (updatedChips.length === 0) {

        setHasMatchedResults(false);

        setJobs(allJobs);

        return;
    }

    // SEARCH USING CHIPS
    try {

        setJobsLoading(true);

        const res = await API.get(
            `/api/jobs/search?q=${encodeURIComponent(query)}`
        );

        setJobs(
            enrichJobsWithApplications(res.data, applications)
        );

    } catch (err) {

        console.error("Chip search failed:", err);

    } finally {

        setJobsLoading(false);
    }
};

const handleResumeUpload = async () => {
    console.log("Resume upload triggered");
    

    if (!resume) {
        notify("Please choose a PDF file first.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await API.post(
    "/api/jobs/match-pdf",
    formData,
    {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    }
);
        console.log(res.data);

        const matchedJobs = enrichJobsWithApplications(
            res.data,
            applications
        );

        console.log("Matched jobs after upload:", matchedJobs);

        // ONLY update displayed jobs
        setJobs([...matchedJobs]);

        // keep track that AI matched results are active
        setHasMatchedResults(true);

        await fetchResumeHistory();

        // reset visible cards count
        // setVisibleCount(8);

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
            const token = localStorage.getItem("token");

            const res = await API.post(
                "/api/jobs/apply", 
            {
                jobId,
                matchScore,
                candidateSkills: jobs.find((job) => job._id === jobId)
                    ?.matchedSkills || [],
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

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
    const alreadySaved = savedJobs.includes(jobId);

    setSavedJobs((prev) =>
        alreadySaved
            ? prev.filter((id) => id !== jobId)
            : [...prev, jobId]
    );

    notify(
        alreadySaved
            ? "Removed from saved jobs"
            : "Job saved successfully",
        "success"
    );
};

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

        const pendingJobs = applications.filter(
            (app) =>
                String(app.status).toLowerCase() === "pending"
        );

        const acceptedJobs = applications.filter(
            (app) =>
                String(app.status).toLowerCase() === "accepted"
        );

        const rejectedJobs = applications.filter(
            (app) =>
                String(app.status).toLowerCase() === "rejected"
        );

const filteredJobs = useMemo(() => {

    let filtered = [...jobs];

    // SAVED JOBS
    if (activeTab === "saved") {
        filtered = filtered.filter(
            (job) =>
                savedJobs.includes(job._id)
        );
    }

    // ALL APPLIED JOBS
    if (activeTab === "applications") {
        filtered = filtered.filter(
            (job) => job.applied
        );
    }

    // PENDING
    if (activeTab === "pending") {
        filtered = filtered.filter(
            (job) =>
                String(
                job.applicationStatus).toLowerCase() === "pending"
        );
    
    }

    // ACCEPTED
    if (activeTab === "accepted") {
        filtered = filtered.filter(
            (job) =>
                String(
                    job.applicationStatus).toLowerCase() === "accepted"
        );
    }

    // REJECTED
    if (activeTab === "rejected") {
        filtered = filtered.filter(
            (job) =>
                String(job.applicationStatus
                ).toLowerCase() === "rejected"
        );
    }

    // DEFAULT
    return filtered;

}, [jobs, savedJobs, activeTab]);

    // return filtered;

// }, [jobs, savedJobs, showSavedOnly, applicationFilter]);
    // const visibleJobs = useMemo(() => filteredJobs.slice(0, visibleCount), [filteredJobs, visibleCount]);
    const acceptedCount = applications.filter((app) => app.status === "Accepted").length;
    const averageMatch = jobs.length
        ? Math.round(jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / jobs.length)
        : 0;

// RESUME HISTORY PAGINATION
const totalResumePages = Math.ceil(
    resumeHistory.length / resumesPerPage
);

const resumeStartIndex =
    (resumeCurrentPage - 1) * resumesPerPage;

const paginatedResumeHistory =
    resumeHistory
        .slice()
        .reverse()
        .slice(
            resumeStartIndex,
            resumeStartIndex + resumesPerPage
        );

// Applied JOBS PAGINATION
const totalApplicationPages = Math.ceil(
    applications.length / applicationsPerPage
);

const applicationStartIndex =
    (applicationsPage - 1) * applicationsPerPage;

const paginatedApplications =
    applications.slice(
        applicationStartIndex,
        applicationStartIndex + applicationsPerPage
    );

    const totalJobPages = Math.ceil(
    filteredJobs.length / jobsPerPage
);

const jobsStartIndex =
    (jobsPage - 1) * jobsPerPage;

const visibleJobs =
    filteredJobs.slice(
        jobsStartIndex,
        jobsStartIndex + jobsPerPage
    );

const getResumeUrl = (filePath) => {

    if (!filePath) return "";

    let cleanedPath = filePath
        .replaceAll("\\", "/")
        .trim();

    cleanedPath = cleanedPath.replace(/^\/+/, "");

    if (!cleanedPath.startsWith("uploads/")) {

        cleanedPath =
            `uploads/${cleanedPath.replace("uploads", "")}`;
    }

    return `http://localhost:5000/${cleanedPath}`;
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

    <button
        className={
            activeTab === "applications"
                ? "stat-filter active"
                : "stat-filter"
        }
        onClick={() => {
            setActiveTab(
                activeTab === "applications"
                    ? "all"
                    : "applications"
            );

            // setVisibleCount(8);
        }}
    >
        <strong>{applications.length}</strong>
        <span>Applications</span>
    </button>

    <button
        className={
            activeTab === "saved"
                ? "stat-filter active"
                : "stat-filter"
        }
        onClick={() => {
            setActiveTab(
                activeTab === "saved"
                    ? "all"
                    : "saved"
            );

            // setVisibleCount(8);
        }}
    >
        <strong>{savedJobs.length}</strong>
        <span>Saved Jobs</span>
    </button>

    <button
        className={
            activeTab === "pending"
                ? "stat-filter active"
                : "stat-filter"
        }
        onClick={() => {
            setActiveTab(
                activeTab === "pending"
                    ? "all"
                    : "pending"
            );

            // setVisibleCount(8);
        }}
    >
        <strong>{pendingJobs.length}</strong>
        <span>Pending</span>
    </button>

    <button
        className={
            activeTab === "accepted"
                ? "stat-filter active accepted-filter"
                : "stat-filter"
        }
        onClick={() => {
            setActiveTab(
                activeTab === "accepted"
                    ? "all"
                    : "accepted"
            );

            // setVisibleCount(8);
        }}
    >
        <strong>{acceptedJobs.length}</strong>
        <span>Accepted</span>
    </button>

    <button
        className={
            activeTab === "rejected"
                ? "stat-filter active rejected-filter"
                : "stat-filter"
        }
        onClick={() => {
            setActiveTab(
                activeTab === "rejected"
                    ? "all"
                    : "rejected"
            );

            // setVisibleCount(8);
        }}
    >
        <strong>{rejectedJobs.length}</strong>
        <span>Rejected</span>
    </button>

    <div>
        <strong>{averageMatch}%</strong>
        <span>Avg Match</span>
    </div>

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

<section className="resume-history-panel">

    <div className="section-title-row">
        <h2>Resume History</h2>

        <span>
            {resumeHistory.length} uploads
        </span>
    </div>

    {resumeHistory.length === 0 ? (

        <p className="empty-state">
            No resumes uploaded yet.
        </p>

    ) : (

        <>
            <div className="resume-history-list">

                {paginatedResumeHistory.map(
                    (resumeItem, index) => {

                    const resumeUrl =
                        resumeItem.filePath
                            ?.replaceAll("\\", "/");

                    return (

                        <div
                            key={index}
                            className="resume-history-card"
                        >

                            <div>
                                <strong>
                                    {resumeItem.fileName}
                                </strong>

                                <p>
                                    Uploaded on{" "}
                                    {resumeItem.uploadedAt
                                        ? new Date(
                                            resumeItem.uploadedAt
                                        ).toLocaleString()
                                        : "Recently uploaded"}
                                </p>
                            </div>

{resumeItem?.filePath ? (

    <div
        style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px"
        }}
    >

        <button
            onClick={() => {

                window.open(
                    getResumeUrl(
                        resumeItem.filePath
                    ),
                    "_blank"
                );

            }}
            style={{
                background: "#1e293b",
                color: "white",
                border: "1px solid #334155",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
            }}
        >
            View Resume
        </button>

        <button
            onClick={() => {

                const link =
                    document.createElement("a");

                link.href =
                    getResumeUrl(
                        resumeItem.filePath
                    );

                link.download =
                    resumeItem.fileName ||
                    "resume.pdf";

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

            }}
            style={{
                background: "#4caf5022",
                color: "#4caf50",
                border: "1px solid #4caf50",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
            }}
        >
            Download Resume
        </button>

    </div>

) : (

    <span style={{ color: "#888" }}>
        No Resume
    </span>

)}
                        </div>
                    );
                })}
            </div>

            <div className="pagination-controls">

                <button
                    disabled={resumeCurrentPage === 1}
                    onClick={() =>
                        setResumeCurrentPage(prev => prev - 1)
                    }
                >
                    ← Previous
                </button>

                <span>
                    Page {resumeCurrentPage} of{" "}
                    {totalResumePages || 1}
                </span>

                <button
                    disabled={
                        resumeCurrentPage >= totalResumePages
                    }
                    onClick={() =>
                        setResumeCurrentPage(prev => prev + 1)
                    }
                >
                    Next →
                </button>

            </div>
        </>
    )}
</section>

            <section>
                <div className="section-title-row">
                    <h2>
    {
        activeTab === "saved"
            ? "Saved Jobs"
            : activeTab === "applications"
            ? "My Applications"
            : activeTab === "accepted"
            ? "Accepted Jobs"
            : activeTab === "pending"
            ? "Pending Jobs"
            : activeTab === "rejected"
            ? "Rejected Jobs"
            : "Available Jobs"
    }
</h2>
                    <div className="title-actions">
                        {hasMatchedResults && (
                            <button className="ghost-btn compact" onClick={() => {setJobs(allJobs); setHasMatchedResults(false);}}>
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
                    <p className="empty-state">
    {
        activeTab === "saved"
            ? "No saved jobs yet."
            : activeTab === "applications"
            ? "You haven't applied to any jobs yet."
            : "No jobs found."
    }
</p>
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
                applicationStatus={job.applicationStatus}
            />

        ))}

    </div>

    <div className="pagination-controls">

        <button
            disabled={jobsPage === 1}
            onClick={() =>
                setJobsPage(prev => prev - 1)
            }
        >
            ← Previous
        </button>

        <span>
            Page {jobsPage} of{" "}
            {totalJobPages || 1}
        </span>

        <button
            disabled={jobsPage >= totalJobPages}
            onClick={() =>
                setJobsPage(prev => prev + 1)
            }
        >
            Next →
        </button>

    </div>
                        {/* {visibleCount < filteredJobs.length && (
                            <button className="load-more-btn" onClick={() => setVisibleCount((count) => count + 8)}>
                                Load more jobs
                            </button>
                        )} */}
                    </>
                )}
            </section>
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </div>
    
);
};

export default CandidateView;
