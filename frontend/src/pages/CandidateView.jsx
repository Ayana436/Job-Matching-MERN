import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';

const CandidateView = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchThreshold, setMatchThreshold] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // 1. ADDED THIS STATE: To store skills extracted from PDF
    const [extractedSkills, setExtractedSkills] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const quickFilters = ["Full-time", "Remote", "Entry", "Internship", "Senior", "MERN Stack", "Data Science", "Python", "Node.js", "Office", "R"];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };
    
    const handleSearch = async (e, queryOverride) => {
        if (e) e.preventDefault();
        const targetQuery = queryOverride || searchQuery;
        setLoading(true);
        try {
            const res = await axios.get(`/api/jobs/search?q=${targetQuery}`);
            setJobs(res.data);
        } catch (err) {
            console.error("Search Failed:", err);
        } finally {
            setLoading(false);
        }
    };

const processUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') return;
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    try {
        const res = await axios.post('/api/jobs/match-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log("AI Response Data:", res.data);

        // 1. Set the jobs as usual
        setJobs(res.data);

        // 2. THE FIX: Grab skills from the first job's match data 
        // If the AI matched 100%, it means it 'found' these skills in your PDF.
        if (res.data.length > 0 && res.data[0].matchedSkills) {
            setExtractedSkills(res.data[0].matchedSkills);
        } else {
            // Fallback: If your backend has a specific field for this, use it
            setExtractedSkills(res.data.skills || []);
        }
        
    } catch (err) {
        console.error("PDF Match Failed:", err);
    } finally {
        setLoading(false);
    }
};

    // 3. UPDATED LOGIC: No more ReferenceErrors
    const handleQuickApply = async (jobId, scoreFromUI) => {
        try {
            const finalScore = scoreFromUI || 0;
            const finalSkills = extractedSkills || [];

            const response = await axios.post('/api/jobs/apply', {
                jobId,
                candidateId: user.id || user._id,
                matchScore: finalScore,
                candidateSkills: finalSkills
            });

            if (response.data.alreadyApplied) {
                alert("Already applied for this role!");
                return false;
            } else {
                alert(`Applied successfully! AI Match: ${finalScore}% saved to database.`);
                return true; 
            }
        } catch (err) {
            console.error("Apply Error:", err);
            return false;
        }
    };

    return (
        <div className="main-layout">
        {/* --- SIDEBAR SECTION --- */}
        <aside className="sidebar">
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h4 style={{ margin: '10px 0 0' }}>{user?.name}</h4>
        <div className="profile-badge">Candidate Account</div>
    </div>

    {/* --- USEFUL SECTION: STATS --- */}
    <div className="sidebar-stats">
        <div className="stat-box">
            <span className="stat-num">{jobs.filter(j => j.applied).length || 1}</span>
            <span className="stat-label">Applied</span>
        </div>
        <div className="stat-box">
            <span className="stat-num">0</span>
            <span className="stat-label">Interviews</span>
        </div>
    </div>

    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '20px 0' }} />

    {/* --- NAVIGATION TABS --- */}
    <nav className="sidebar-nav">
        <button className="nav-item active" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>🔍 Find Jobs</button>
        <button className="nav-item" onClick={() => navigate('/my-applications')}>📑 My Applications</button>
        <button className="nav-item" onClick={() => alert("Profile Settings coming soon!")}>👤 Profile Settings</button>
    </nav>

    {/* --- RECENTLY APPLIED SECTION --- */}
    <div style={{ marginTop: '30px' }}>
        <h5 className="sidebar-subtitle">Recently Applied</h5>
        <div className="history-item">
            <strong>Teaching Assistant</strong>
            <div className="status-pending">Status: Pending</div>
        </div>
    </div>

        {/* Profile Strength Section: */}
        <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
        <span>Profile Strength</span>
        <span style={{ color: '#646cff' }}>{extractedSkills.length > 0 ? '100%' : '40%'}</span>
    </div>
    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <div style={{ 
            width: extractedSkills.length > 0 ? '100%' : '40%', 
            height: '100%', 
            background: '#646cff', 
            borderRadius: '10px',
            transition: '0.5s' 
        }}></div>
    </div>
</div>

    {/* ONLY ONE LOGOUT - AT THE BOTTOM */}
    <footer style={{position:'static'}}>
        <button onClick={handleLogout} className="sidebar-logout">
        🚪 Logout
    </button>
    </footer>
</aside>
        <main>
        <div className="candidate-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'30px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{margin: '0'}}>Qollabb Jobs</h2>
                {/* <div>
                    <button 
                        onClick={() => window.location.href = '/my-applications'} 
                        style={{ background: 'transparent', color: '#646cff', border: '1px solid #646cff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
                        My Applications
                    </button>
                    <button onClick={handleLogout} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Logout
                    </button>
                </div> */}
            </nav>

            {/* <section style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '30px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '70px', height: '70px', background: 'linear-gradient(45deg, #646cff, #535bf2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '800' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Welcome back, {user?.name || 'Candidate'}!</h3>
                    <p style={{ margin: '5px 0 0', color: '#888' }}>{user?.role?.toUpperCase()} ACCOUNT • {user?.email}</p>
                </div>
            </section> */}
            
            <section style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
                    Find Your <span style={{ color: '#646cff' }}>Perfect</span> Match
                </h1>
                
                <form onSubmit={handleSearch} style={{ maxWidth: '700px', margin: '0 auto 30px', position: 'relative' }}>
                    <input 
                        type="text" placeholder="Search by skill, level, or location..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '20px 30px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                    />
                    <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', padding: '12px 25px', borderRadius: '40px', border: 'none', background: '#646cff', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                </form>
                {/* Add this right below your search form in CandidateView.jsx */}
<div className="chip-container" style={{ marginTop: '20px', overflow: 'hidden' }}>
    <div className="chip-track" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {quickFilters.map((filter, i) => (
            <button 
                key={i} 
                onClick={() => {setSearchQuery(filter); handleSearch(null, filter);}} 
                className="filter-chip"
                style={{
                    background: 'rgba(100, 108, 255, 0.1)',
                    color: '#646cff',
                    border: '1px solid rgba(100, 108, 255, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: '0.3s'
                }}
            >
                {filter}
            </button>
        ))}
    </div>
</div>
            </section>

            <section onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); processUpload(e.dataTransfer.files[0]); }}
                style={{ border: `2px dashed ${isDragging ? '#646cff' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', padding: '40px', textAlign: 'center', background: isDragging ? 'rgba(100, 108, 255, 0.05)' : 'rgba(255,255,255,0.02)', marginBottom: '40px' }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
                <h3>AI Resume Matcher</h3>
                <p style={{ color: '#888', marginBottom: '20px' }}>Drop your resume here to instantly see which jobs match your skills</p>
                <label style={{ padding: '12px 30px', borderRadius: '12px', border: '1px solid #646cff', color: '#646cff', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}>
                    Upload PDF
                    <input type="file" hidden accept=".pdf" onChange={(e) => processUpload(e.target.files[0])} />
                </label>
            </section>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <span style={{ minWidth: '180px' }}>Match Quality: <strong>{matchThreshold}%</strong></span>
                <input type="range" min="0" max="100" value={matchThreshold} onChange={(e) => setMatchThreshold(e.target.value)} style={{ flex: 1, accentColor: '#646cff' }} />
            </div>

            <div className="results-grid" style={{ display: 'grid', gap: '20px' }}>
                {loading ? <p style={{ textAlign: 'center' }}>Matching...</p> : 
                    jobs.filter(j => (j.matchScore || 0) >= matchThreshold).length > 0 ? (
                        jobs.filter(j => (j.matchScore || 0) >= matchThreshold).map(job => (
                            <JobCard 
                                key={job._id} 
                                job={job} 
                                // 4. CRITICAL FIX: Pass the score from the job object into the apply function
                                onApply={() => handleQuickApply(job._id, job.matchScore)} 
                            />
                        ))
                    ) : <p style={{ textAlign: 'center', color: '#555' }}>No jobs meet this match percentage.</p>
                }
            </div>
        </div>
        </main>
        </div>
    );
};

export default CandidateView;