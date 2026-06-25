import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
    Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import API from '../api';
import { getResumeUrl } from '../utils/getResumeUrl';

const STATUS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];
const SKILL_COLORS  = ["#6366f1", "#8b5cf6", "#06b6d4", "#14b8a6", "#f97316", "#ec4899"];

const RecruiterView = () => {
    const navigate = useNavigate(); 
    const token = localStorage.getItem('token');

    // --- FORM & UI STATES ---
    const [formData, setFormData] = useState({
        title: '', company: '', location: '', workMode: 'Office', description: '', 
        requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level', salary: 'Negotiable'});
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [trendsData, setTrendsData] = useState([]);
    useEffect(() => {
    console.log("TRENDS DATA:", trendsData);
}, [trendsData]);
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);
    
    // --- VIEW INTERACTION SYSTEM TOGGLES ---
    const [dashboardViewMode, setDashboardViewMode] = useState("analytics"); // "analytics" | "applicants"
    const [activeRecruiterTab, setActiveRecruiterTab] = useState("all");
    const [sortBy, setSortBy] = useState("highest");
    const [searchTerm, setSearchTerm] = useState("");
    const [chartFilter, setChartFilter] = useState(null);
    const [skillFilter, setSkillFilter] = useState(null);
    const [selectedJobFilter, setSelectedJobFilter] = useState(null);
    
    // Pagination Controls
    const [currentPage, setCurrentPage] = useState(1);
    const applicantsPerPage = 8;
    const [currentJobPage, setCurrentJobPage] = useState(1);
    const jobsPerPage = 5; 

    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, activeRecruiterTab, searchTerm, chartFilter, skillFilter]);

    // --- TOAST NOTIFICATION CONTROL ---
    const notify = (message, type = 'success') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    };

    // --- BACKEND API COMMUNICATIONS ---
    const fetchAdminJobs = useCallback(async () => {
        const sessionToken = localStorage.getItem('token');
        if (!sessionToken) return;
        try {
            const res = await API.get('/api/jobs/search?q=', {
                headers: { Authorization: `Bearer ${sessionToken}` }
            });
            console.log("Jobs API Response 1:", res.data);
            setJobs(res.data);
        } catch (err) {}
    }, []); 

    const fetchApplicants = useCallback(async () => {
        const sessionToken = localStorage.getItem('token');
        if (!sessionToken) return;
        try {
            const timestamp = new Date().getTime();
            const res = await API.get(`/api/jobs/applicants?t=${timestamp}`, {
                headers: { Authorization: `Bearer ${sessionToken}` }
            });
            console.log("Applicants API Response:", res.data);
            setApplicants(res.data.map(app => ({ ...app, refreshKey: Math.random() })));
        } catch (err) {}
    }, []); 

    // const fetchAnalytics = useCallback(async () => {
    //     const sessionToken = localStorage.getItem('token');
    //     if (!sessionToken) return;
    //     try {
    //         const headers = { Authorization: `Bearer ${sessionToken}` };
    //         const res = await API.get("/api/analytics/application-trends", { headers });
    //         console.log("Analytics API Response:", res.data);
    //         setTrendsData(Array.isArray(res.data)
    //             ? res.data
    //             : []);
    //     } catch (err) {
    //         console.error("Analytics Fetch Error:", err);
    //     }
    // }, []); 

    // --- FIXED: ONE-WAY ISOLATED MOUNT LIFECYCLE WRAPPER ---
// --- FIXED BULLETPROOF INITIALIZATION LIFECYCLE ---
// --- FIXED: ONE-WAY ISOLATED MOUNT LIFECYCLE WRAPPER ---
useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const executeBatchLoad = async () => {
        if (!isMounted) return;
        try {
            const sessionToken = localStorage.getItem('token');
            if (!sessionToken) return;

            const headers = { Authorization: `Bearer ${sessionToken}` };
            const timestamp = new Date().getTime();

            // Run concurrent execution pipelines cleanly
            const [jobsRes, appsRes, trendsRes] = await Promise.all([
                API.get('/api/jobs/search?q=', { headers }).catch(() => ({ data: [] })),
                API.get(`/api/jobs/applicants?t=${timestamp}`, { headers }).catch(() => ({ data: [] })),
                API.get("/api/analytics/application-trends", { headers }).catch(() => ({ data: [] }))
            ]);

            if (isMounted) {
                // FIXED: Direct mapping straight to your active view arrays
                if (jobsRes?.data) setJobs(jobsRes.data);
                if (appsRes?.data) setApplicants(appsRes.data.map(app => ({ ...app, refreshKey: Math.random() })));
//                 console.log(
//     "TRENDS RESPONSE:",
//     trendsRes
// );

console.log(
    "TRENDS DATA:",
    trendsRes.data
);
                if (trendsRes?.data) setTrendsData(trendsRes.data || []);
            }
        } catch (e) {
            console.warn("Polling interrupted safely:", e.message);
        }
    };

    // 1. Initial fire execution window
    executeBatchLoad();

    // 2. Clear out network loops by polling strictly every 30 seconds
    intervalId = setInterval(executeBatchLoad, 30000);

    return () => {
        isMounted = false;
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
    // Keep empty to avoid infinite rendering cycles
}, []); // Keep completely empty to ensure exactly one running timer instance

        const advancedFilteredApplicants = useMemo(() => {
        let result = [...applicants];

        // 1. Filter by the main recruiter status tab selections
        if (activeRecruiterTab === "accepted") {
            result = result.filter(app => String(app.status || '').toLowerCase().trim() === "accepted");
        } else if (activeRecruiterTab === "pending") {
            result = result.filter(app => ['pending', 'applied', 'reviewed'].includes(String(app.status || '').toLowerCase().trim()));
        }

        if (skillFilter) {

    result = result.filter(app =>
        (app.candidateSkills || [])
            .some(skill =>
                skill.toLowerCase() ===
                skillFilter.toLowerCase()
            )
    );
}

        // 2. Cross-filter over active user chart interaction parameters
        if (selectedJobFilter) {
            result = result.filter(app => String(app.jobId?.title || '').toLowerCase().trim() === String(selectedJobFilter).toLowerCase().trim());
        }
        if (chartFilter) {
            result = result.filter(app => String(app.status || '').toLowerCase().trim() === String(chartFilter).toLowerCase().trim());
        }

        // 3. Match against lookahead text entry criteria
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            result = result.filter(app => 
                String(app.candidateId?.name || '').toLowerCase().includes(query) ||
                String(app.jobId?.title || '').toLowerCase().includes(query) ||
                (app.candidateSkills || []).some(skill => String(skill).toLowerCase().includes(query))
            );
        }

        return result;
    }, [applicants, activeRecruiterTab, searchTerm, chartFilter, selectedJobFilter]);

    // --- DATA TRANSFORMATION COMPUTE ENGINES ---
    const analytics = useMemo(() => {
        const accepted = advancedFilteredApplicants.filter(a => String(a.status || '').toLowerCase().trim() === 'accepted').length;
        const rejected = advancedFilteredApplicants.filter(a => String(a.status || '').toLowerCase().trim() === 'rejected').length;
        const pending  = advancedFilteredApplicants.filter(a => ['pending', 'applied'].includes(String(a.status || '').toLowerCase().trim())).length;
        const reviewed = advancedFilteredApplicants.filter(a => String(a.status || '').toLowerCase().trim() === 'reviewed').length;
        
        return { accepted, rejected, pending, reviewed }; 
    }, [advancedFilteredApplicants]);

    const averageMatch = useMemo(() => {
        if (!advancedFilteredApplicants.length) return 0;
        return Math.round(advancedFilteredApplicants.reduce((sum, app) => sum + (app.matchScore || 0), 0) / advancedFilteredApplicants.length);
    }, [advancedFilteredApplicants]);


    const filteredAnalytics = useMemo(() => {

    return {
        accepted: advancedFilteredApplicants.filter(
            a => a.status?.toLowerCase() === "accepted"
        ).length,

        rejected: advancedFilteredApplicants.filter(
            a => a.status?.toLowerCase() === "rejected"
        ).length,

        pending: advancedFilteredApplicants.filter(
            a => a.status?.toLowerCase() === "pending"
        ).length,

        reviewed: advancedFilteredApplicants.filter(
            a => a.status?.toLowerCase() === "reviewed"
        ).length
    };

}, [advancedFilteredApplicants]);

    const acceptanceRate = useMemo(() => {
        if (applicants.length === 0) return 0;
        return Math.round((filteredAnalytics.accepted / applicants.length) * 100);
    }, [filteredAnalytics.accepted, applicants.length]);


    const sortedFilteredApplicants = useMemo(() => {
        const list = [...advancedFilteredApplicants];
        switch (sortBy) {
            case "highest":
                return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            case "lowest":
                return list.sort((a, b) => (a.matchScore || 0) - (b.matchScore || 0));
            case "newest":
                return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case "accepted":
                return list.sort((a, b) => (String(b.status).toLowerCase() === "accepted") - (String(a.status).toLowerCase() === "accepted"));
            case "rejected":
                return list.sort((a, b) => (String(b.status).toLowerCase() === "rejected") - (String(a.status).toLowerCase() === "rejected"));
            default:
                return list;
        }
    }, [advancedFilteredApplicants, sortBy]);
    
    const liveMetrics = useMemo(() => {
        const strongCount = advancedFilteredApplicants.filter(app => Number(app.matchScore || 0) >= 60).length;
        const processedRatio = advancedFilteredApplicants.length > 0 
            ? Math.round((advancedFilteredApplicants.filter(a => String(a.status || '').toLowerCase().trim() !== 'pending').length / advancedFilteredApplicants.length) * 100) 
            : 0;
        
        if (!advancedFilteredApplicants.length) return { strongCount, processedRatio, mostFrequentRole: "N/A" };

        const roleFrequency = {};
        advancedFilteredApplicants.forEach(app => {
            const role = app.jobId?.title?.trim();
            if (!role) return;
            roleFrequency[role] = (roleFrequency[role] || 0) + 1;
        });

        const mostFrequentRole = Object.entries(roleFrequency)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "No Data";

        return { strongCount, processedRatio, mostFrequentRole };
    }, [advancedFilteredApplicants]);

    const { topSkillsData, topMissingSkills } = useMemo(() => {
        const skillsMap = {};
        const missingSkillsMap = {};

        advancedFilteredApplicants.forEach((app) => {
            const candidateSkills = Array.isArray(app.candidateSkills) ? app.candidateSkills : [];
            const requiredSkills = Array.isArray(app.jobId?.requiredSkills) ? app.jobId.requiredSkills : [];

            candidateSkills.forEach(skill => {
                const normalized = skill.trim();
                if (!normalized) return;
                skillsMap[normalized] = (skillsMap[normalized] || 0) + 1;
            });

            const candidateSet = new Set(candidateSkills.map(skill => skill.toLowerCase().trim()));

            requiredSkills.forEach(skill => {
                const normalized = skill.trim();
                if (!normalized) return;
                if (!candidateSet.has(normalized.toLowerCase())) {
                    missingSkillsMap[normalized] = (missingSkillsMap[normalized] || 0) + 1;
                }
            });
        });

        return {
            topSkillsData: Object.entries(skillsMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6),
            topMissingSkills: Object.entries(missingSkillsMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6)
        };
    }, [advancedFilteredApplicants]);

const dynamicTrendsFallback = useMemo(() => {

    return Array.isArray(trendsData)
        ? trendsData
        : [{ date: "No Data", applications: 0 }];

}, [trendsData]);

const finalTrendsChartData = useMemo(() => {
    // If the backend successfully supplied trend analytics array data, use it!
    if (Array.isArray(trendsData) && trendsData.length > 0) {
        return trendsData;
    }

    // FALLBACK ENGINE: Process your 46 active live applicants directly by date
    if (!Array.isArray(applicants) || applicants.length === 0) return [];

    const timelineMap = {};
    applicants.forEach(app => {
        const dateObj = app.createdAt ? new Date(app.createdAt) : new Date();
        const dateString = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        timelineMap[dateString] = (timelineMap[dateString] || 0) + 1;
    });

    return Object.entries(timelineMap).map(([date, applications]) => ({
        date,
        applications
    }));
}, [trendsData, applicants]);

useEffect(() => {
    console.log("selectedJobFilter", selectedJobFilter);
}, [selectedJobFilter]);

useEffect(() => {
    console.log("chartFilter", chartFilter);
}, [chartFilter]);

useEffect(() => {
    console.log("skillFilter", skillFilter);
}, [skillFilter]);

    const applicantsPerJobChart = useMemo(() => {
        const counts = {};
        applicants.forEach(app => {
            const title = app.jobId?.title || "Active Role Openings".trim();
            if (!title) return;
            counts[title] = (counts[title] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([jobTitle, applicants]) => ({ jobTitle, applicants }))
            .sort((a, b) => b.applicants - a.applicants);
    }, [applicants]);


    // --- PAGINATION LOOPS ---
    const totalPages = Math.ceil(sortedFilteredApplicants.length / applicantsPerPage);
    const paginatedApplicants = sortedFilteredApplicants.slice((currentPage - 1) * applicantsPerPage, currentPage * applicantsPerPage);

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
        setFormData({ title: '', company: '', location: '', workMode: 'Office', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level', salary: 'Negotiable' });
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
            notify(editingId ? "Job listing parameters updated." : "Job opening parameters published globally.");
        } catch (err) {
            notify(err.response?.data?.error || "Transaction dropped.", "error");
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            const sessionToken = localStorage.getItem("token");
            await API.patch(`/api/jobs/applicants/${applicationId}`, { status }, {
                headers: { Authorization: `Bearer ${sessionToken}` }
            });
            fetchApplicants();
            notify(`Application status routed as ${status}.`);
        } catch (error) {
            notify("Failed to update status tracking vector.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await API.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAdminJobs();
            notify("Listing deleted successfully.");
        } catch (err) {
            notify("Delete transaction failure.", "error");
        }
    };

    console.log("APPLICANTS:", applicants.length);
console.log("FILTERED:", advancedFilteredApplicants.length);
console.log("TRENDS:", trendsData);
console.log("FILTERS:", {
    selectedJobFilter,
    chartFilter,
    skillFilter
});

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

{/* --- OPTIMIZED ACTIVE KPI METRICS CONTROLLER STRIP --- */}
<div style={{ display: "flex", gap: "16px", marginBottom: "30px", flexWrap: "wrap" }}>
    
    {/* CARD 1: TOTAL INTAKE COOLDOWN NODES */}
    <div 
        className="kpi-badge-card" 
        onClick={() => setActiveRecruiterTab("all")}
        style={{ flex: 1, minWidth: "200px", cursor: 'pointer', border: activeRecruiterTab === "all" ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.05)', background: activeRecruiterTab === "all" ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', transition: 'all 0.2s ease' }}
    >
        <strong className='kpi-indicator-value' style={{ color: '#fff' }}>{applicants.length}</strong>
        <span className='stat-label' style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>Total Intake Count</span>
    </div>

    {/* CARD 2: AVG EVALUATION INDEX */}
    <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px", background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <strong className='kpi-indicator-value' style={{ color: '#6366f1' }}>{averageMatch}%</strong>
        <span className='stat-label' style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>Avg Match Index</span>
    </div>

    {/* CARD 3: ACCEPTED PIPELINE STAGES */}
    <div 
        className="kpi-badge-card" 
        onClick={() => setActiveRecruiterTab("accepted")}
        style={{ flex: 1, minWidth: "200px", cursor: 'pointer', border: activeRecruiterTab === "accepted" ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.05)', background: activeRecruiterTab === "accepted" ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', transition: 'all 0.2s ease' }}
    >
        <strong className='kpi-indicator-value' style={{ color: '#22c55e' }}>{filteredAnalytics.accepted}</strong>
        <span className='stat-label' style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>Accepted Candidates</span>
    </div>

    {/* CARD 4: AWAITING ACTIVE REVIEWS */}
    <div 
        className="kpi-badge-card" 
        onClick={() => setActiveRecruiterTab("pending")}
        style={{ flex: 1, minWidth: "200px", cursor: 'pointer', border: activeRecruiterTab === "pending" ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)', background: activeRecruiterTab === "pending" ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', transition: 'all 0.2s ease' }}
    >
        <strong className='kpi-indicator-value' style={{ color: '#f59e0b' }}>{filteredAnalytics.pending}</strong>
        <span className='stat-label' style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>Awaiting Review</span>
    </div>

    {/* CARD 5: ACCEPTANCE PROBABILITY RATE */}
    <div className="kpi-badge-card" style={{ flex: 1, minWidth: "200px", background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <strong className="kpi-indicator-value" style={{ color: '#94a3b8' }}>{acceptanceRate}%</strong>
        <span className="stat-label" style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginTop: '4px' }}>Acceptance Rate</span>
    </div>

</div>

            {/* Live Activity Feed */}
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

            {/* Interactive Pipeline Metrics Node */}
            <section className="dashboard-card-glow" style={{ marginTop: '30px' }}>
                <div className="insight-header">
                    <h3>Dynamic Algorithmic Pipeline Insights {(selectedJobFilter || chartFilter || skillFilter) && <span style={{ color: '#6366f1', fontSize: '0.9rem', marginLeft: '10px' }}>[Active Intersect Filter Filters Triggered]</span>}</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {(selectedJobFilter || chartFilter || skillFilter) && (
                            <button onClick={() => { setSelectedJobFilter(null); setChartFilter(null); setSkillFilter(null); }} style={{ background: 'rgba(255,255,255,0.05)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Reset Active Overlays ✕</button>
                        )}
                        <span className="live-badge">Live AI Stream</span>
                    </div>
                </div>
                
                <div className="insight-pills-row">
                    <div className="insight-pill-container">
                        <div className="insight-pill-icon"></div>
                        <div className="insight-pill-text">
                            The sorting engine identified <strong>{liveMetrics.strongCount} high-correlation nodes</strong> (&gt;60% match score) within the active workspace layer.
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
                    <div className="insight-pill-container">
                        <div className="insight-pill-icon" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}></div>
                        <div className="insight-pill-text">
                            Highest recurring skill gap: <strong>{topMissingSkills[0]?.name || "No gaps detected"}</strong>.
                        </div>
                    </div>
                </div>
            </section>

            {/* View Mode Switching Controls */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '14px', marginBottom: '35px', maxWidth: '550px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                    onClick={() => setDashboardViewMode("analytics")}
                    className={`role-option ${dashboardViewMode === "analytics" ? "active" : ""}`}
                    style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', background: dashboardViewMode === "analytics" ? "#6366f1" : "transparent", color: 'white', transition: 'all 0.3s ease' }}
                >
                    Analytics & AI
                </button>
                <button 
                    onClick={() => setDashboardViewMode("applicants")}
                    className={`role-option ${dashboardViewMode === "applicants" ? "active" : ""}`}
                    style={{ flex: 1, border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', background: dashboardViewMode === "applicants" ? "#6366f1" : "transparent", color: 'white', transition: 'all 0.3s ease' }}
                >
                    Applicant Matrix
                </button>
            </div>

            {dashboardViewMode === "analytics" ? (
                <section className="analytics-grid">
                    <div className="analytics-card chart-card">
                        <h3>Applicants Per Job Position</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={applicantsPerJobChart.length ? applicantsPerJobChart : [{ jobTitle: "No Data Available", applicants: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="jobTitle" interval={0} angle={-20} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip cursor={false} contentStyle={{background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "white"}} />
                                <Bar 
                                    dataKey="applicants" 
                                    radius={[8, 8, 0, 0]}
                                    onClick={(data) => data && setSelectedJobFilter(prev => prev === data.jobTitle ? null : data.jobTitle)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {applicantsPerJobChart.map((entry, index) => (
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
                                        { name: "Accepted", value: filteredAnalytics.accepted },
                                        { name: "Rejected", value: filteredAnalytics.rejected },
                                        { name: "Pending", value: filteredAnalytics.pending },
                                        { name: "Reviewed", value: filteredAnalytics.reviewed }
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
                            <LineChart data={finalTrendsChartData.length === 0 ? [{ date: "No Data Available", applications: 0 }] : finalTrendsChartData}>
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
            ) : (
                /* Matrix Data Tables Layer Viewport */
                <section className="ranking-section" style={{ width: '100%', display: 'block', clear: 'both' }}>
                    <div className="section-title-row">
                        <h3>Active Applicant Matching Vector Hierarchy</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className={`filter-chip ${activeRecruiterTab === "all" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("all")}>All ({applicants.length})</button>
                            <button className={`filter-chip ${activeRecruiterTab === "accepted" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("accepted")}>Accepted ({filteredAnalytics.accepted})</button>
                            <button className={`filter-chip ${activeRecruiterTab === "pending" ? "active" : ""}`} onClick={() => setActiveRecruiterTab("pending")}>Pending ({filteredAnalytics.pending})</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <input id='searchS' type="text" placeholder="Search candidate profile names or technical skill variables..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #334155", background: "#0f172a", color: "white", outline: 'none'}} />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                        {chartFilter && <button className="filter-chip" onClick={() => setChartFilter(null)}>Pipeline Status Overlay: {chartFilter} ✕</button>}
                        {skillFilter && <button className="filter-chip" onClick={() => setSkillFilter(null)}>Skill Parameter Vector: {skillFilter} ✕</button>}
                        {selectedJobFilter && <button className="filter-chip" onClick={() => setSelectedJobFilter(null)}>Job Role Focus: {selectedJobFilter} ✕</button>}
                    </div>

                    {advancedFilteredApplicants.length === 0 ? (
                        <p className="empty-state">No matching candidate profile records found.</p>
                    ) : (
                        <div className="table-responsive-wrapper filter-toolbar">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{marginBottom: "15px", padding: "8px", background: "#0f172a", color: "white", borderRadius: "6px", borderColor: "#334155"}}>
                                <option value="highest">Highest Match Score %</option>
                                <option value="lowest">Lowest Match Score %</option>
                                <option value="newest">Newest Intake Influx</option>
                                <option value="accepted">Status: Approved Node First</option>
                                <option value="rejected">Status: Rejected Node First</option>
                            </select>
                            <table className="ranking-table" style={{ width: '100%', minWidth: '1100px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "8%" }}>Rank</th>
                                        <th style={{ width: "22%" }}>Candidate Entity</th>
                                        <th style={{ width: "22%" }}>Target Role Position</th>
                                        <th style={{ width: "12%" }}>AI Match</th>
                                        <th style={{ width: "14%" }}>Status Routing</th>
                                        <th style={{ width: "16%" }}>Action Center</th>
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
                                                    <div className="action-buttons">
                                                        <button className="view-btn" onClick={() => { 
                                                            const resumeData = app.candidateId?.resume || app.resume;
                                                            const resumePath = typeof resumeData === "object" ? resumeData.filePath : resumeData;
                                                            if (!resumePath) { alert("Resume profile attachment missing."); return; }
                                                            window.open(getResumeUrl(resumePath), "_blank"); 
                                                        }}>
                                                            📄 Resume
                                                        </button>
                                                        <button disabled={String(app.status).toLowerCase() === "accepted"} className="approve-btn" onClick={() => handleStatusUpdate(app._id, "accepted")}>✓ Approve</button>
                                                        <button disabled={String(app.status).toLowerCase() === "rejected"} className="reject-btn" onClick={() => handleStatusUpdate(app._id, "rejected")}>✕ Reject</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="ai-inference-container">
                                                        <span 
                                                            className="ai-pill-tag" 
                                                            style={{ 
                                                                background: app.matchScore >= 70 ? "rgba(34, 197, 94, 0.12)" : app.matchScore >= 40 ? "rgba(245, 158, 11, 0.12)" : "rgba(239, 68, 68, 0.12)", 
                                                                color: app.matchScore >= 70 ? "#22c55e" : app.matchScore >= 40 ? "#f59e0b" : "#ef4444" 
                                                            }}
                                                        >
                                                            {app.matchScore >= 80 ? "Highly Recommended" : app.matchScore >= 60 ? "Recommended" : app.matchScore > 0 ? "Consideration" : "No AI Match Data"}
                                                        </span>
                                                        <small className="ai-insight-text-block">
                                                            {Array.isArray(app.candidateSkills) && app.candidateSkills.length > 0 
                                                                ? `Matched Skills: ${app.candidateSkills.join(", ")}` 
                                                                : "No matching resume profile keywords stored for this record."}
                                                        </small>
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

            {/* JOB CREATION FORM CARD */}
            <section className="job-form-card" style={{ marginTop: '50px' }}>
                <h2>{editingId ? "📝 Edit Job Opening Parameters" : "🚀 Publish a New Corporate Role"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label htmlFor='job-title'>Job Title</label>
                            <input id="job-title" type='text' className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label htmlFor='company'>Company</label>
                            <input id="company" type='text' className="input-field" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
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

            {/* ACTIVE DATA LISTINGS CHANNEL */}
            <section className="listings-section" style={{ marginTop: '50px' }}>
                <h3>💼 Currently Administered Active Roles ({jobs.length})</h3>
                {paginatedJobs.length > 0 ? paginatedJobs.map(job => (
                    <div key={job._id} className="job-item">
                        <div>
                            <h4>{job.title}</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>Company: {job.company}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>Location: {job.location} ({job.workMode}) — {job.jobType} — Salary: {job.salary}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="edit-btn" onClick={() => { setEditingId(job._id); setFormData({...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills}); }}>Edit Job</button>
                            <button className="delete-btn" onClick={() => handleDelete(job._id)}>Delete</button>
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