import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios';
import JobCard from '../components/JobCard';

const CandidateView = () => {
    const [jobs, setJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchThreshold, setMatchThreshold] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Get user data from storage for the Profile Section
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
            const logicFixedJobs = res.data.map(j => ({
                ...j,
                matchScore: j.matchScore || 100 
            }));
            setJobs(logicFixedJobs);
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
            setJobs(res.data);
        } catch (err) {
            console.error("PDF Match Failed:", err);
        } finally {
            setLoading(false);
        }
    };

const handleQuickApply = async (jobId) => {
    try {
        const res = await axios.post('/api/jobs/apply', { jobId, candidateId: user.id });
        if (res.data.alreadyApplied) {
            alert("You've already applied for this!");
        } else {
            alert("Applied Successfully!");
        }
        return true; // Turns button green without console errors
    } catch (err) {
        return false;
    }
};

    return (
        <div className="candidate-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'30px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{margin: '0'}}>Qollabb Jobs</h2>
                <button onClick={handleLogout} className="btn-secondary" style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Logout
                </button>
            </nav>

            {/* --- NEW PROFILE SECTION --- */}
            <section style={{ 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '24px', 
                padding: '30px', 
                marginBottom: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                border: '1px solid rgba(255,255,255,0.05)' 
            }}>
                <div style={{ width: '70px', height: '70px', background: 'linear-gradient(45deg, #646cff, #535bf2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '800' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Welcome back, {user?.name || 'Candidate'}!</h3>
                    <p style={{ margin: '5px 0 0', color: '#888' }}>{user?.role?.toUpperCase()} ACCOUNT • {user?.email}</p>
                </div>
            </section>
            
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

                <div className="chip-container">
                    <div className="chip-track">
                        {quickFilters.map((filter, i) => (
                            <button key={i} onClick={() => {setSearchQuery(filter); handleSearch(null, filter);}} className="filter-chip">{filter}</button>
                        ))}
                        {quickFilters.map((filter, i) => (
                            <button key={`dup-${i}`} onClick={() => {setSearchQuery(filter); handleSearch(null, filter);}} className="filter-chip">{filter}</button>
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
                    jobs.filter(j => j.matchScore >= matchThreshold).length > 0 ? (
                        jobs.filter(j => j.matchScore >= matchThreshold).map(job => (
                            <JobCard 
                                key={job._id} 
                                job={job} 
                                onApply={() => handleQuickApply(job._id)} // PASSING FUNCTION TO JOBCARD
                            />
                        ))
                    ) : <p style={{ textAlign: 'center', color: '#555' }}>No jobs meet this match percentage.</p>
                }
            </div>
        </div>
    );
};

export default CandidateView;