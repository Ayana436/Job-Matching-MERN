import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import API from '../api';


const RecruiterView = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', location: '', workMode: 'Office', description: '', 
        requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level', salary: 'Negotiable'
    });
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [visibleApplicants, setVisibleApplicants] = useState(6);
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeRecruiterTab, setActiveRecruiterTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [chartFilter, setChartFilter] = useState(null);
    const [skillFilter, setSkillFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const applicantsPerPage = 8;
    const token = localStorage.getItem('token');

    

    const notify = (message, type = 'success') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2600);
    };

    const fetchAdminJobs = useCallback(async () => {
        try {
            const res = await API.get('/api/jobs/search?q=', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    }, [token]);

    const fetchApplicants = useCallback(async () => {
        try {
            const timestamp = new Date().getTime();

            const res = await API.get(
                `/api/jobs/applicants?t=${timestamp}`,
                {
                    headers:{
                        Authorization: `Bearer ${token}`,
                        "Cache-Control":"no-cache"
                    }
                }
            );
            setApplicants(
    res.data.map(app => ({
        ...app,
        refreshKey: Math.random()
    }))
);
        } catch (err) {
            console.error("Applicants fetch failed:", err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchAdminJobs();
            fetchApplicants();
        }
    }, [fetchAdminJobs, fetchApplicants, token]);

useEffect(() => {

    if (!token) return;

    // INITIAL FETCH
    fetchAdminJobs();
    fetchApplicants();

    const interval = setInterval(() => {

        fetchAdminJobs();
        fetchApplicants();

    }, 15000);

    return () => clearInterval(interval);

}, [token, fetchAdminJobs, fetchApplicants]);

    const analytics = useMemo(() => {
        const accepted = applicants.filter(
            app => String(app.status).toLowerCase() === 'accepted'
        ).length;

        const pending = applicants.filter(
            app => String(app.status).toLowerCase() === 'pending'
        ).length;
        const averageMatch = applicants.length
            ? Math.round(applicants.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applicants.length)
            : 0;

        return {
            jobs: jobs.length,
            applicants: [...new Set(applicants.map(app => app._id))].length,
            accepted,
            pending,
            averageMatch
        };
    }, [applicants, jobs.length]);

    // ANALYTICS

    const filteredApplicants = applicants.filter((app) =>
    app.candidateId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

    app.candidateSkills?.some(skill =>
        skill
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    )
);

// INTERACTIVE CHART FILTERS
let advancedFilteredApplicants = [...filteredApplicants];

// STATUS FILTER
if (chartFilter) {

    advancedFilteredApplicants =
        advancedFilteredApplicants.filter(
            app =>
                String(app.status).toLowerCase() ===
                chartFilter.toLowerCase()
        );
}

// SKILL FILTER
if (skillFilter) {

    advancedFilteredApplicants =
        advancedFilteredApplicants.filter(
            app =>
                app.candidateSkills?.includes(skillFilter)
        );
}

// PAGINATION
const totalPages = Math.ceil(
    advancedFilteredApplicants.length /
    applicantsPerPage
);

const startIndex =
    (currentPage - 1) * applicantsPerPage;

const paginatedApplicants =
    advancedFilteredApplicants.slice(
        startIndex,
        startIndex + applicantsPerPage
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
            notify(editingId ? "Job updated." : "Job published.");
        } catch (err) {
            console.error("Save job failed:", err);
            notify(err.response?.data?.error || "Action failed.", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await API.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAdminJobs();
            notify("Job deleted.");
        } catch (err) {
            console.error("Delete job failed:", err);
            notify("Delete failed.", "error");
        }
    };

    // Analytics variables
    const totalApplications = applicants.length;

const acceptedApplications =
    applicants.filter(
        app => String(app.status).toLowerCase() === "accepted"
    ).length;

const rejectedApplications =
    applicants.filter(
        app => String(app.status).toLowerCase() === "rejected"
    ).length;

const pendingApplications =
    applicants.filter(
        app => String(app.status).toLowerCase() === "pending"
    ).length;

const averageMatchScore =
    applicants.length > 0
        ? Math.round(
            applicants.reduce(
                (sum, app) => sum + (app.matchScore || 0),
                0
            ) / applicants.length
        )
        : 0;

        // TOP SKILLS AI Analytics
        const skillsMap = {};

advancedFilteredApplicants.forEach((app) => {

    (app.candidateSkills || []).forEach((skill) => {

        skillsMap[skill] =
            (skillsMap[skill] || 0) + 1;

    });

});

const skillsData = Object.entries(skillsMap)
    .map(([name, value]) => ({
        name,
        value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);


const topSkillsData =
    Object.entries(skillsMap)
        .map(([name, value]) => ({
            name,
            value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    // PIE CHART DATA
    const statusData = [
    {
        name: "Accepted",
        value: acceptedApplications
    },
    {
        name: "Rejected",
        value: rejectedApplications
    },
    {
        name: "Pending",
        value: pendingApplications
    }
];

const STATUS_COLORS = [
    "#22c55e", // accepted
    "#ef4444", // rejected
    "#f59e0b", // pending
];

const SKILL_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#14b8a6",
    "#f97316",
    "#ec4899",
];

const getResumeUrl = (filePath) => {

    if (!filePath) return "";

    let cleanedPath = filePath
        .replaceAll("\\", "/")
        .trim();

    // remove leading slashes
    cleanedPath = cleanedPath.replace(/^\/+/, "");

    // fix malformed uploads path
    if (cleanedPath.startsWith("uploads")) {

        cleanedPath = cleanedPath.replace(
            /^uploads/,
            "uploads/"
        );
    }

    // ensure uploads exists
    if (!cleanedPath.startsWith("uploads/")) {

        cleanedPath = `uploads/${cleanedPath}`;
    }

    return `http://localhost:5000/${cleanedPath}`;
};
    console.log(applicants);

    return (
        <div className="recruiter-container">
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {/* Header / Nav */}
            <header className="recruiter-header">
                <h1 className="header-title">Recruiter <span>Dashboard</span></h1>
                
                <nav className="header-nav">
                    <button className="btn-applicants" onClick={() => navigate('/admin/applicants')}>
                        📂 View Applicants
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

<section className="analytics-grid">

    <div className="analytics-card">
        <strong>{analytics.jobs}</strong>
        <span>Active Jobs</span>
    </div>

<button
    className="analytics-card active-card"
    onClick={() => setActiveRecruiterTab("all")}
>
    <strong>{applicants.length}</strong>
    <span>Total Applicants</span>
</button>

    <div className="analytics-card">
        <strong>{analytics.averageMatch}%</strong>
        <span>Avg Match</span>
    </div>

    <button
        className={
            activeRecruiterTab === "accepted"
                ? "analytics-card active-card"
                : "analytics-card"
        }
        onClick={() =>
            setActiveRecruiterTab(
                activeRecruiterTab === "accepted"
                    ? "none"
                    : "accepted"
            )
        }
    >
        <strong>{analytics.accepted}</strong>
        <span>Accepted</span>
    </button>

    <button
        className={
            activeRecruiterTab === "pending"
                ? "analytics-card active-card"
                : "analytics-card"
        }
        onClick={() =>
            setActiveRecruiterTab(
                activeRecruiterTab === "pending"
                    ? "none"
                    : "pending"
            )
        }
    >
        <strong>{analytics.pending}</strong>
        <span>Pending Review</span>
    </button>

</section>

            {/* JOB FORM */}
            <div className="job-form-card">
                <h2>{editingId ? "📝 Edit Job" : "🚀 Post a New Role"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label>Job Title</label>
                            <input className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Location (City)</label>
                            <input className="input-field" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>
                            Required Skills (Comma separated: e.g. React, Node, Python)
                        </label>
                        <input 
                            className="input-field"
                            required 
                            placeholder="React, Node, MongoDB..."
                            value={formData.requiredSkills} 
                            onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
                        />
                    </div>

                    <div className="form-grid-3">
                        <div className="input-group">
                            <label>Work Mode</label>
                            <select className="input-field" value={formData.workMode} onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
                                <option value="Office">Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Job Type</label>
                            <select className="input-field" value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Experience</label>
                            <select className="input-field" value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior Level">Senior Level</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Salary</label>
                            <select className="input-field" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})}>
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
                        <label>Description</label>
                        <textarea className="input-field" required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary">
                            {editingId ? "Save Changes" : "Publish Job"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <section className="ranking-section">
                <div className="section-title-row">
                    <h3>Candidate Ranking</h3>
                    <button className="btn-applicants" onClick={() => navigate('/admin/applicants')}>Manage All</button>
                </div>

                    <div className="analytics-grid">

    <div className="analytics-card">
        <h3>Total Applications</h3>
        <h1>{totalApplications}</h1>
    </div>

    <div className="analytics-card">
        <h3>Average Match Score</h3>
        <h1>{averageMatchScore}%</h1>
    </div>

    <div className="analytics-card">
        <h3>Accepted Candidates</h3>
        <h1>{acceptedApplications}</h1>
    </div>

    <div className="analytics-card">
        <h3>Rejected Candidates</h3>
        <h1>{rejectedApplications}</h1>
    </div>

</div>

<div
    style={{
        marginBottom: "20px"
    }}
>

    <input
        type="text"
        placeholder="Search candidate or skill..."
        value={searchTerm}
        onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
        }}
        style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white"
        }}
    />

</div>

<div className="charts-wrapper">

    <div className="chart-box">

        <h3>Application Status</h3>

        <ResponsiveContainer width="100%" height={300}>

            <PieChart>

<Pie
    data={statusData}
    dataKey="value"
    isAnimationActive={true}
    animationDuration={900}
    outerRadius={110}
    innerRadius={55}
    paddingAngle={4}
    label
    onClick={(data) => {

        if (
            chartFilter ===
            data.name.toLowerCase()
        ) {

            setChartFilter(null);

        } else {

            setChartFilter(
                data.name.toLowerCase()
            );
        }
    }}
>

    {statusData.map((entry, index) => (

        <Cell
            key={index}
            fill={
                STATUS_COLORS[
                    index % STATUS_COLORS.length
                ]
            }
        />

    ))}

</Pie>

                <Tooltip
    contentStyle={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "12px",
        color: "white"
    }}
/>

                <Legend />

            </PieChart>

        </ResponsiveContainer>

    </div>

    <div className="chart-box">

        <h3>Top Candidate Skills</h3>

        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={topSkillsData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip
    contentStyle={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "12px",
        color: "white"
    }}
/>

                <Bar
    dataKey="value"
    radius={[10, 10, 0, 0]}
    isAnimationActive={true}
    animationDuration={900}
    onClick={(data) => {

        if (skillFilter === data.name) {

            setSkillFilter(null);

        } else {

            setSkillFilter(data.name);
        }
    }}
>

    {skillsData.map((entry, index) => (

        <Cell
            key={index}
            fill={
                SKILL_COLORS[
                    index % SKILL_COLORS.length
                ]
            }
        />

    ))}

</Bar>
            </BarChart>

        </ResponsiveContainer>

    </div>

</div>

{/* Active FILTER CHIPs */}
            <div
    style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap"
    }}
>

    {chartFilter && (
        <button
            className="filter-chip"
            onClick={() =>
                setChartFilter(null)
            }
        >
            Status: {chartFilter} ✕
        </button>
    )}

    {skillFilter && (
        <button
            className="filter-chip"
            onClick={() =>
                setSkillFilter(null)
            }
        >
            Skill: {skillFilter} ✕
        </button>
    )}

</div>

                {applicants.length === 0 ? (
                    <p className="empty-state">No applicants yet.</p>
                ) : (
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Candidate</th>
                                <th>Role</th>
                                <th>Match</th>
                                <th>Status</th>
                                <th>AI Recommendation</th>
                                <th style={{textAlign:'center'}}>Resume Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...paginatedApplicants]
                                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                                .map((app, index) => (
                                    <tr key={`${app._id}-${app.refreshKey}`}>
                                        <td><span className="rank-badge">#{index + 1}</span></td>
                                        <td>
                                            <strong>{app.candidateId?.name || 'Candidate'}</strong>
                                            <span className="ranking-subtext">{app.candidateId?.email || 'No email'}</span>
                                        </td>
                                        <td>{app.jobId?.title || 'Role'}</td>
                                        <td>
                                            <div className="score-cell">
                                                <b>{app.matchScore || 0}%</b>
                                                <span><i style={{ width: `${Math.min(app.matchScore || 0, 100)}%` }} /></span>
                                            </div>
                                        </td>
                                        <td>
    <span className={`ranking-status ${String(app.status).toLowerCase()}`}>
        {app.status}
    </span>
</td>

<td>

    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px"
        }}
    >

        <span
            style={{
                background:
                    app.recommendationColor || "#334155",

                color: "white",

                padding: "6px 10px",

                borderRadius: "999px",

                fontSize: "12px",

                fontWeight: "bold",

                width: "fit-content"
            }}
        >
            {app.aiRecommendation || "Pending"}
        </span>

        <small
            style={{
                color: "#cbd5e1",
                lineHeight: "1.4"
            }}
        >
            {app.aiInsight || "No AI insight"}
        </small>

    </div>

</td>

<td>

{app.candidateId?.resume?.filePath ? (

    <div
        style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center"
        }}
    >

        <button
            onClick={() => {

    window.open(
        getResumeUrl(app.candidateId.resume.filePath),
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
            View
        </button>

        <button
            onClick={() => {

    const link = document.createElement("a");

    link.href = getResumeUrl(
        app.candidateId.resume.filePath
    );

    link.download =
        app.candidateId.resume.fileName ||
        "resume.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}}
        >
            Download
        </button>

    </div>

) : (

    <span style={{ color: "#888" }}>
        No Resume
    </span>

)}

</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    
                )}
                <div className="pagination-controls">

    <button
        disabled={currentPage === 1}
        onClick={() =>
            setCurrentPage(prev => prev - 1)
        }
    >
        ← Previous
    </button>

    <span>
        Page {currentPage} of {totalPages || 1}
    </span>

    <button
        disabled={currentPage >= totalPages}
        onClick={() =>
            setCurrentPage(prev => prev + 1)
        }
    >
        Next →
    </button>

</div>

            </section>

            {/* Active Listings Section */}
            <div className="listings-section">
                <h3>💼 Active Listings ({jobs.length})</h3>
                {jobs.map(job => (
                    <div key={job._id} className="job-item">
                        <div>
                            <h4>{job.title}</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>
                                Location: {job.location} ({job.workMode}) - {job.jobType} - {job.salary || 'Negotiable'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="edit-btn" onClick={() => {
                                setEditingId(job._id); 
                                setFormData({...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills});
                            }}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(job._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecruiterView;
