import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
    Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import API from '../api';

const STATUS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];
const SKILL_COLORS  = ["#6366f1", "#8b5cf6", "#06b6d4", "#14b8a6", "#f97316", "#ec4899"];

const RecruiterView = () => {
    const navigate = useNavigate(); 
    const token = localStorage.getItem('token');

    // --- FORM & UI STATES ---
    const [formData, setFormData] = useState({
        title: '', location: '', workMode: 'Office', description: '', 
        requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level', salary: 'Negotiable'
    });
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [applicantsData, setApplicantsData] = useState([]);
    const [trendsData, setTrendsData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);
    
    // --- VIEW INTERACTION SYSTEM TOGGLES ---
    const [dashboardViewMode, setDashboardViewMode] = useState("analytics"); // "analytics" | "applicants"
    const [activeRecruiterTab, setActiveRecruiterTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [chartFilter, setChartFilter] = useState(null);
    const [skillFilter, setSkillFilter] = useState(null);
    const [selectedJobFilter, setSelectedJobFilter] = useState(null);
    
    // Pagination Controls
    const [currentPage, setCurrentPage] = useState(1);
    const applicantsPerPage = 8;
    const [currentJobPage, setCurrentJobPage] = useState(1);
    const jobsPerPage = 5; 

    // --- TOAST NOTIFICATION CONTROL ---
    const notify = (message, type = 'success') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    };

    // --- BACKEND API COMMUNICATIONS ---
    const fetchAdminJobs = useCallback(async () => {
        if (!token) return;
        try {
            const res = await API.get('/api/jobs/search?q=', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) { 
            console.error("Fetch Jobs Error:", err); 
        }
    }, [token]);

    const fetchApplicants = useCallback(async () => {
        if (!token) return;
        try {
            const timestamp = new Date().getTime();
            const res = await API.get(`/api/jobs/applicants?t=${timestamp}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Cache-Control": "no-store, no-cache, must-revalidate"
                }
            });
            setApplicants(res.data.map(app => ({ ...app, refreshKey: Math.random() })));
        } catch (err) {
            console.error("Applicants fetch failed:", err);
        }
    }, [token]);

    const fetchAnalytics = useCallback(async () => {
        if (!token) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            // FIXED: Isolated try-catch wrappers inside individual promises so one endpoint error doesn't kill both
            const [applicantsRes, trendsRes] = await Promise.all([
                API.get("/api/analytics/applicants-per-job", { headers }).catch(e => {
                    console.error("Applicants analytics endpoint failed (500). Using empty state fallback.");
                    return { data: [] };
                }),
                API.get("/api/analytics/application-trends", { headers }).catch(e => {
                    console.error("Trends analytics endpoint failed (500). Using dynamic state fallback.");
                    return { data: [] };
                }),
            ]);
            
            setApplicantsData(applicantsRes?.data || []);
            setTrendsData(trendsRes?.data || []);
        } catch (err) {
            console.error("Global Analytics fetch encountered a layout violation:", err);
        }
    }, [token]);

// --- UNIFIED BACKGROUND POLLING LIFECYCLE ---
useEffect(() => {
    if (!token) return;

    // 1. Fire single synchronized batch on view mount
    fetchAdminJobs();
    fetchApplicants();
    fetchAnalytics();

    // 2. Poll background endpoints together safely every 10 seconds 
    // (Provides crisp real-time updates without hitting a 429 Rate Limit)
    const interval = setInterval(() => {
        // Only pool if a user isn't actively searching or filtering to avoid wiping input text
        if (!searchTerm && !selectedJobFilter && !chartFilter && !skillFilter) {
            fetchAdminJobs();
            fetchApplicants();
            fetchAnalytics();
        }
    }, 10000); 

    return () => clearInterval(interval);
}, [token, fetchAdminJobs, fetchApplicants, fetchAnalytics, searchTerm, selectedJobFilter, chartFilter, skillFilter]);

    // --- DATA TRANSFORMATION COMPUTE ENGINES ---
    const analytics = useMemo(() => {
        const accepted = applicants.filter(a => String(a.status).toLowerCase() === 'accepted').length;
        const rejected = applicants.filter(a => String(a.status).toLowerCase() === 'rejected').length;
        const pending  = applicants.filter(a => String(a.status).toLowerCase() === 'pending').length;
        const reviewed = applicants.filter(a => String(a.status).toLowerCase() === 'reviewed').length;
        
        const averageMatch = applicants.length
            ? Math.round(applicants.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applicants.length)
            : 0;

        return { jobs: jobs.length, accepted, rejected, pending, reviewed, averageMatch };
    }, [applicants, jobs.length]);

    const advancedFilteredApplicants = useMemo(() => {
        return applicants.filter(app => {
            const matchesSearch = !searchTerm || 
                app.candidateId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.candidateSkills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = !chartFilter || 
                String(app.status).toLowerCase() === chartFilter.toLowerCase();

            const matchesSkill = !skillFilter || 
                app.candidateSkills?.includes(skillFilter);

            let matchesTab = true;
            if (activeRecruiterTab === "accepted") matchesTab = String(app.status).toLowerCase() === "accepted";
            if (activeRecruiterTab === "pending") matchesTab = String(app.status).toLowerCase() === "pending";

            return matchesSearch && matchesStatus && matchesSkill && matchesTab;
        });
    }, [applicants, searchTerm, chartFilter, skillFilter, activeRecruiterTab]);

    const interactiveAppsList = useMemo(() => {
        let list = [...applicants];
        if (selectedJobFilter) {
            list = list.filter(app => app.jobId?.title === selectedJobFilter);
        }
        if (chartFilter) {
            list = list.filter(app => String(app.status).toLowerCase() === String(chartFilter).toLowerCase());
        }
        return list;
    }, [applicants, selectedJobFilter, chartFilter]);

    const liveMetrics = useMemo(() => {
        const strongCount = interactiveAppsList.filter(app => app.matchScore >= 70).length;
        const processedRatio = interactiveAppsList.length > 0 
            ? Math.round((interactiveAppsList.filter(a => a.status !== 'pending').length / interactiveAppsList.length) * 100) 
            : 0;
        
        if (!applicants.length) return { strongCount, processedRatio, mostFrequentRole: "N/A" };

        const counts = {};
        applicants.forEach(app => {
            const title = app.jobId?.title || "Unknown Role";
            counts[title] = (counts[title] || 0) + 1;
        });
        const mostFrequentRole = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "N/A");

        return { strongCount, processedRatio, mostFrequentRole };
    }, [interactiveAppsList, applicants]);

    const { topSkillsData, topMissingSkills } = useMemo(() => {
        const skillsMap = {};
        const missingSkillsMap = {};

        advancedFilteredApplicants.forEach((app) => {
            (app.candidateSkills || []).forEach(s => skillsMap[s] = (skillsMap[s] || 0) + 1);
            (app.missingSkills || []).forEach(s => missingSkillsMap[s] = (missingSkillsMap[s] || 0) + 1);
        });

        const sortAndSlice = (mapObj) => Object.entries(mapObj)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        return { topSkillsData: sortAndSlice(skillsMap), topMissingSkills: sortAndSlice(missingSkillsMap) };
    }, [advancedFilteredApplicants]);

    // Safe fallback generator if Trends collection endpoint outputs empty fields
    const dynamicTrendsFallback = useMemo(() => {
        if (trendsData.length) return trendsData;
        const map = {};
        applicants.forEach((app) => {
            const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
            map[date] = (map[date] || 0) + 1;
        });
        return Object.entries(map).map(([date, applications]) => ({ date, applications }));
    }, [applicants, trendsData]);

    // Safely transform your dynamic applicants state into aggregate fallback values if DB analytics array drops out
    const dynamicApplicantsFallback = useMemo(() => {
        if (applicantsData.length) return applicantsData;
        const counts = {};
        applicants.forEach(app => {
            const title = app.jobId?.title || "Active Listing";
            counts[title] = (counts[title] || 0) + 1;
        });
        return Object.entries(counts).map(([jobTitle, applicants]) => ({ jobTitle, applicants }));
    }, [applicants, applicantsData]);

    // --- PAGINATION CONTROL LOOPS ---
    const totalPages = Math.ceil(advancedFilteredApplicants.length / applicantsPerPage);
    const startIndex = (currentPage - 1) * applicantsPerPage;
    const paginatedApplicants = useMemo(() => {
        return advancedFilteredApplicants.slice(startIndex, startIndex + applicantsPerPage);
    }, [advancedFilteredApplicants, startIndex, applicantsPerPage]);

    const totalJobPages = Math.ceil(jobs.length / jobsPerPage);
    const paginatedJobs = useMemo(() => {
        const startJobIndex = (currentJobPage - 1) * jobsPerPage;
        return jobs.slice(startJobIndex, startJobIndex + jobsPerPage);
    }, [jobs, currentJobPage, jobsPerPage]);

    // --- OPERATION METHODS ---
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth';
    };

    const resetForm = () => {
        setFormData({ title: '', location: '', workMode: 'Office', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level', salary: 'Negotiable' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const recruiterId = user?.id || user?._id;
        const payload = { 
            ...formData, 
            postedBy: recruiterId, 
            requiredSkills: typeof formData.requiredSkills === 'string'
                ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
                : formData.requiredSkills
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingId) {
                await API.put(`/api/jobs/${editingId}`, payload, config);
            } else {
                await API.post('/api/jobs', payload, config);
            }
            resetForm();
            fetchAdminJobs();
            notify(editingId ? "Job updated listing details." : "Job opening parameters published globally.");
        } catch (err) {
            console.error("Save job failed:", err);
            notify(err.response?.data?.error || "Transaction dropped.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await API.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAdminJobs();
            notify("Listing deleted successfully.");
        } catch (err) {
            console.error("Delete job failed:", err);
            notify("Delete transaction failure.", "error");
        }
    };

    const getResumeUrl = (filePath) => {
        if (!filePath) return "";
        let cleanedPath = filePath.replaceAll("\\", "/").trim().replace(/^\/+/, "");
        if (cleanedPath.startsWith("uploads")) {
            cleanedPath = cleanedPath.replace(/^uploads/, "uploads/");
        }
        if (!cleanedPath.startsWith("uploads/")) {
            cleanedPath = `uploads/${cleanedPath}`;
        }
        return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${cleanedPath}`;
    };

    return (
        <div className="recruiter-container">
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            
            <header className="recruiter-header">
                <h1 className="header-title">Recruiter <span>Dashboard</span></h1>
                <nav className="header-nav">
                    <button className="btn-applicants" onClick={() => navigate('/admin/applicants')}>
                        📂 View Applicants
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            {/* Premium Metrics Summary Strip */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "30px", flexWrap: "wrap" }}>
                <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px" }}>
                    <strong className='kpi-indicator-value'>{applicants.length}</strong>
                    <span className='stat-label'>Total Intake Count</span>
                </div>
                <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px" }}>
                    <strong className='kpi-indicator-value'>{analytics.averageMatch}%</strong>
                    <span className='stat-label'>Avg Match Index</span>
                </div>
                <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px" }}>
                    <strong className='kpi-indicator-value'>{analytics.accepted}</strong>
                    <span className='stat-label'>Accepted Candidates</span>
                </div>
                <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px" }}>
                    <strong className='kpi-indicator-value'>{analytics.pending}</strong>
                    <span className='stat-label'>Awaiting Review</span>
                </div>
            </div>

{/* SEAMLESS GLASS SWITCH TAB CONTROLLER */}
<div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '14px', marginBottom: '35px', maxWidth: '550px', border: '1px solid rgba(255,255,255,0.05)' }}>
    <button 
        onClick={() => setDashboardViewMode("analytics")}
        className={`role-option ${dashboardViewMode === "analytics" ? "active" : ""}`}
        style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', background: dashboardViewMode === "analytics" ? "#6366f1" : "transparent", color: 'white', transition: 'all 0.3s ease' }}
    >
        📈 Analytics & AI
    </button>
    <button 
        onClick={() => setDashboardViewMode("applicants")}
        className={`role-option ${dashboardViewMode === "applicants" ? "active" : ""}`}
        style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', background: dashboardViewMode === "applicants" ? "#6366f1" : "transparent", color: 'white', transition: 'all 0.3s ease' }}
    >
        📋 Applicant Matrix
    </button>
</div>
{/* TAB CONTENT CONDITIONAL SWITCH BLOCKS */}
{dashboardViewMode === "analytics" ? (
    <>
        {/* Visual Charts Framework Grid */}
        <section className="analytics-grid">
            <div className="analytics-card chart-card">
                <h3>Applicants Per Job Position</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dynamicApplicantsFallback}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="jobTitle" />
                        <YAxis />
                        <Tooltip cursor={false} contentStyle={{background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "white"}} />
                        <Bar 
                            dataKey="applicants" 
                            radius={[8, 8, 0, 0]}
                            onClick={(data) => data && setSelectedJobFilter(prev => prev === data.jobTitle ? null : data.jobTitle)}
                            style={{ cursor: 'pointer' }}
                        >
                            {dynamicApplicantsFallback.map((entry, index) => (
                                <Cell 
                                    key={index} 
                                    fill={SKILL_COLORS[index % SKILL_COLORS.length]} 
                                    stroke={selectedJobFilter === entry.jobTitle ? '#ffffff' : 'none'}
                                    strokeWidth={selectedJobFilter === entry.jobTitle ? 2 : 0}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="analytics-card chart-card">
                <h3>Application Pipeline Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={[
                                { name: "Accepted", value: analytics.accepted },
                                { name: "Rejected", value: analytics.rejected },
                                { name: "Pending", value: analytics.pending },
                                { name: "Reviewed", value: analytics.reviewed }
                            ]}
                            dataKey="value"
                            outerRadius={95}
                            innerRadius={45}
                            paddingAngle={4}
                            label
                            style={{ cursor: 'pointer' }}
                            onClick={(data) => data && setChartFilter(prev => prev === data.name.toLowerCase() ? null : data.name.toLowerCase())}
                        >
                            {STATUS_COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                        </Pie>
                        <Tooltip cursor={false} contentStyle={{background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "white"}} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="analytics-card chart-card">
                <h3>Top Skills Demand Matrix</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topSkillsData.length ? topSkillsData : [{name: "No Profiles Loaded", value: 0}]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip cursor={false} contentStyle={{background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "white"}} />
                        <Bar 
                            dataKey="value" 
                            radius={[8, 8, 0, 0]} 
                            style={{ cursor: 'pointer' }}
                            onClick={(data) => data && setSkillFilter(prev => prev === data.name ? null : data.name)}
                        >
                            {topSkillsData.map((entry, index) => (
                                <Cell 
                                    key={index} 
                                    fill={SKILL_COLORS[index % SKILL_COLORS.length]}
                                    stroke={skillFilter === entry.name ? '#ffffff' : 'none'}
                                    strokeWidth={skillFilter === entry.name ? 2 : 0}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-span-wide">
                <h3>Application Submission Trends</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dynamicTrendsFallback}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip contentStyle={{background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "white"}} />
                        <Legend />
                        <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* Skill Gap Matrix Panel */}
        <section className="missing-skills-card" style={{ marginTop: '30px' }}>
            <div className="missing-header">
                <h3>Skill Gap Analytics</h3>
                <span>AI DETECTED</span>
            </div>
            {topMissingSkills.length > 0 ? (
                <div className="missing-skills-grid">
                    {topMissingSkills.map((skill, index) => (
                        <div key={index} className="missing-skill-item">
                            <strong>{skill.name}</strong>
                            <p>Missing in {skill.value} resumes</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: "#94a3b8" }}>No structural gaps identified across current candidate records.</p>
            )}
        </section>

        {/* Live Activity Feed - ONLY visible on the analytics tab! */}
        <section className="activity-feed-card" style={{ marginTop: '30px' }}>
            <div className="activity-header">
                <h3>Live Activity Feed</h3>
                <span className="activity-live">LIVE</span>
            </div>
            <div className="feed-scroll-box">
                {applicants.length > 0 ? [...applicants].slice(0, 8).map((app, index) => (
                    <div key={index} className="activity-item" style={{ minWidth: '280px' }}>
                        <div className="activity-dot" />
                        <div>
                            <strong>{app.candidateId?.name || "Candidate"}</strong>
                            <p>applied for <span>{app.jobId?.title || "Role"}</span></p>
                            <small>Match Score: {app.matchScore || 0}%</small>
                        </div>
                    </div>
                )) : <p style={{color: '#94a3b8', padding: '10px'}}>Awaiting streaming events pipeline logs...</p>}
            </div>
        </section>

        {/* Interactive Streaming Pipeline Box */}
        <section className="dashboard-card-glow" style={{ marginTop: '30px' }}>
            <div className="insight-header">
                <h3>Dynamic Algorithmic Pipeline Insights {selectedJobFilter && <span style={{ color: '#646cff', fontSize: '0.9rem', marginLeft: '10px' }}>[Filtered: {selectedJobFilter}]</span>}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {selectedJobFilter && (
                        <button onClick={() => setSelectedJobFilter(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Reset Filter ✕</button>
                    )}
                    <span className="live-badge">Live AI Stream</span>
                </div>
            </div>
            
            <div className="insight-pills-row">
                <div className="insight-pill-container">
                    <div className="insight-pill-icon"></div>
                    <div className="insight-pill-text">
                        The sorting engine identified <strong>{liveMetrics.strongCount} high-correlation nodes</strong> (&gt;70% match score) within the active workspace configuration layer.
                    </div>
                </div>
                <div className="insight-pill-container">
                    <div className="insight-pill-icon" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></div>
                    <div className="insight-pill-text">
                        The highest processing density volume trends directly towards <strong>{liveMetrics.mostFrequentRole}</strong> entries.
                    </div>
                </div>
                <div className="insight-pill-container">
                    <div className="insight-pill-icon" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                    <div className="insight-pill-text">
                        Review progress is tracking at <strong>{liveMetrics.processedRatio}% collection resolution</strong> against total incoming applications.
                    </div>
                </div>
            </div>
        </section>
    </>
) : (
    /* SECTION 2: FULL-WIDTH MATRIX VIEW (Isolates and gives the table maximum horizontal room) */
    <section className="ranking-section" style={{ width: '100%', display: 'block', clear: 'both' }}>
        <div className="section-title-row">
            <h3>Active Applicant Matching Vector Hierarchy</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`filter-chip ${activeRecruiterTab === "all" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("all")}>All ({applicants.length})</button>
                <button className={`filter-chip ${activeRecruiterTab === "accepted" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("accepted")}>Accepted ({analytics.accepted})</button>
                <button className={`filter-chip ${activeRecruiterTab === "pending" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("pending")}>Pending ({analytics.pending})</button>
            </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
            <input id='searchS' type="text" placeholder="Search candidate profile names or technical skill variables..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #334155", background: "#0f172a", color: "white", outline: 'none'}} />
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {chartFilter && <button className="filter-chip" onClick={() => setChartFilter(null)}>Pipeline Target: {chartFilter} ✕</button>}
            {skillFilter && <button className="filter-chip" onClick={() => setSkillFilter(null)}>Skill Vector: {skillFilter} ✕</button>}
        </div>

        {advancedFilteredApplicants.length === 0 ? (
            <p className="empty-state">No matching profile logs found.</p>
        ) : (
            <div className="table-responsive-wrapper">
                <table className="ranking-table" style={{ width: '100%', minWidth: '1100px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: "8%" }}>Rank</th>
                            <th style={{ width: "22%" }}>Candidate Entity</th>
                            <th style={{ width: "22%" }}>Target Role Position</th>
                            <th style={{ width: "12%" }}>AI Match</th>
                            <th style={{ width: "14%" }}>Status Routing</th>
                            <th style={{ width: "22%" }}>Recommendation Explanation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedApplicants.map((app, index) => {
                            const currentStartIndex = (currentPage - 1) * applicantsPerPage;
                            return (
                                <tr key={`${app._id}-${app.refreshKey || index}`}>
                                    <td><span className="rank-badge">#{currentStartIndex + index + 1}</span></td>
                                    <td>
                                        <div className="candidate-cell-info">
                                            <strong className="candidate-primary-name">{app.candidateId?.name || 'Anonymous User'}</strong>
                                            <span className="ranking-subtext">{app.candidateId?.email || 'No email shared'}</span>
                                        </div>
                                    </td>
                                    <td><span className="role-title-badge">{app.jobId?.title || 'Unresolved Entity'}</span></td>
                                    <td>
                                        <div className="score-cell">
                                            <b className="score-percentage-value">{app.matchScore || 0}%</b>
                                            <span className="score-track-bg">
                                                <i style={{ width: `${Math.min(app.matchScore || 0, 100)}%` }} />
                                            </span>
                                        </div>
                                    </td>
                                    <td><span className={`ranking-status ${String(app.status).toLowerCase()}`}>{app.status}</span></td>
                                    <td>
                                        <div className="ai-inference-container">
                                            <span className="ai-pill-tag" style={{ background: app.recommendationColor || "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                                                {app.aiRecommendation || "Pending Allocation"}
                                            </span>
                                            <small className="ai-insight-text-block">{app.aiInsight || "Analyzing portfolio parameters..."}</small>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {totalPages > 1 && (
            <div className="pagination-controls" style={{ marginTop: '24px' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>← Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next →</button>
            </div>
        )}
    </section>
)}

            {/* JOB CREATION FORM CARD (STAYS STABLE ON BASE OF VIEWPORTS) */}
            <section className="job-form-card" style={{ marginTop: '50px' }}>
                <h2>{editingId ? "📝 Edit Job Opening Parameters" : "🚀 Publish a New Corporate Role"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor='job-title'>Job Title</label>
                            <input id="job-title" type='text' className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label htmlFor='location'>Location (City)</label>
                            <input id="location" type='text' className="input-field" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label htmlFor='required-skills' style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Required Technical Skills (Comma separated strings)</label>
                        <input id='required-skills' type='text' className="input-field" required placeholder="React, Node, MongoDB, Python..." value={formData.requiredSkills} onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} />
                    </div>

                    <div className="form-grid-3">
                        <div className="input-group">
                            <label htmlFor='work-mode'>Work Mode</label>
                            <select id="work-mode" className="input-field" value={formData.workMode} onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
                                <option value="Office">Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor='job-type'>Job Type</label>
                            <select id="job-type" className="input-field" value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor='experience'>Experience Seniority Level</label>
                            <select id="experience" className="input-field" value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior Level">Senior Level</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor='salary'>Remuneration Salary Plan</label>
                            <select id="salary" className="input-field" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})}>
                                <option value="Negotiable">Negotiable</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="INR 25,000">INR 25,000</option>
                                <option value="INR 50,000">INR 50,000</option>
                                <option value="INR 75,000">INR 75,000</option>
                                <option value="INR 100,000">INR 100,000</option>
                                <option value="INR 150,000+">INR 150,000+</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor='description'>Role Description Specifications</label>
                        <textarea id="description" className="input-field" required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary">{editingId ? "Save Changes" : "Publish Job"}</button>
                        {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
                    </div>
                </form>
            </section>

            {/* PHYSICAL DATA LISTINGS LIST OUTPUT CHANNEL */}
            <section className="listings-section" style={{ marginTop: '50px' }}>
                <h3>💼 Currently Administered Active Roles ({jobs.length})</h3>
                {paginatedJobs.length > 0 ? paginatedJobs.map(job => (
                    <div key={job._id} className="job-item">
                        <div>
                            <h4>{job.title}</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>
                                Core Grid Perimeter Location: {job.location} ({job.workMode}) — {job.jobType} — Plan: {job.salary}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="edit-btn" onClick={() => { setEditingId(job._id); setFormData({...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills}); }}>Edit Job</button>
                            <button className="delete-btn" onClick={() => handleDelete(job._id)}>Delete </button>
                        </div>
                    </div>
                )) : <p style={{color: '#94a3b8'}}>No active corporate jobs published on this account.</p>}

                {totalJobPages > 1 && (
                    <div className="pagination-controls" style={{ marginTop: '20px' }}>
                        <button disabled={currentJobPage === 1} onClick={() => setCurrentJobPage(prev => Math.max(prev - 1, 1))}>← Previous Roles</button>
                        <span>Roles Page {currentJobPage} of {totalJobPages}</span>
                        <button disabled={currentJobPage >= totalJobPages} onClick={() => setCurrentJobPage(prev => Math.min(prev + 1, totalJobPages))}>Next Roles →</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default RecruiterView;