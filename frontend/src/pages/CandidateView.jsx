import React, { useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const CandidateView = () => {
    const [jobs, setJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchThreshold, setMatchThreshold] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const quickFilters = ["Full-time", "Remote", "Entry", "Internship", "Senior", "MERN Stack", "Data Science", "Python", "Node.js", "Office", "R"];

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth'; // Send them back to the login page
    };
    
    const handleSearch = async (e, queryOverride) => {
        if (e) e.preventDefault();
        const targetQuery = queryOverride || searchQuery;
        setLoading(true);
        try {
            const res = await axios.get(`/api/jobs/search?q=${targetQuery}`);
            // Logic Fix: For manual searches, we ensure matchScore is 100 so they aren't hidden by the slider
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


    return (
        <div className="candidate-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom:'30px',
                paddingBottom: '15px',
                borderBottom: '1px solid rgba(255,255,255,0.1)' 
            }}>
                <h2 style={{margin: '0'}}>Qollabb Jobs</h2>
                <button 
                    onClick={handleLogout} 
                    className="btn-secondary" 
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
                    Logout
                </button>
            </nav>
            {/* 1. HERO SECTION: Search & Chips */}
            <section style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '40px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
                    Find Your <span style={{ color: '#646cff' }}>Perfect</span> Match
                </h1>
                
                <form onSubmit={handleSearch} style={{ maxWidth: '700px', margin: '0 auto 30px', position: 'relative' }}>
                    <input 
                        id='job-form'
                        type="text" placeholder="Search by skill, level, or location..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '20px 30px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1.1rem', outline: 'none', backdropFilter: 'blur(10px)' }}
                    />
                    <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', padding: '12px 25px', borderRadius: '40px', border: 'none', background: '#646cff', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                </form>

                {/* 2. FLOATING CHIPS (Infinite Marquee Style) */}
                <div className="chip-container">
                    <div className="chip-track">
                        {/* First set of chips */}
                        {quickFilters.map(filter => (
                            <button 
                                key={filter} 
                                onClick={() => {setSearchQuery(filter); handleSearch(null, filter);}}
                                className="filter-chip"
                            >
                                {filter}
                            </button>
                        ))}
                        {/* Duplicate set for seamless looping */}
                        {quickFilters.map(filter => (
                            <button 
                                key={`${filter}-dup`} 
                                onClick={() => {setSearchQuery(filter); handleSearch(null, filter);}}
                                className="filter-chip"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. RESUME MATCHER (Now Full Width & Prominent) */}
            <section 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processUpload(e.dataTransfer.files[0]); }}
                style={{ 
                    border: `2px dashed ${isDragging ? '#646cff' : 'rgba(255,255,255,0.1)'}`, 
                    borderRadius: '24px', padding: '40px', textAlign: 'center', 
                    background: isDragging ? 'rgba(100, 108, 255, 0.05)' : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                    marginBottom: '40px'
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
                <h3>AI Resume Matcher</h3>
                <p style={{ color: '#888', marginBottom: '20px' }}>Drop your resume here to instantly see which jobs match your skills</p>
                <label style={{ padding: '12px 30px', borderRadius: '12px', border: '1px solid #646cff', color: '#646cff', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}>
                    Upload PDF
                    <input type="file" hidden accept=".pdf" onChange={(e) => processUpload(e.target.files[0])} />
                </label>
            </section>

            {/* 4. FILTER SLIDER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <span style={{ minWidth: '180px' }}>Match Quality: <strong>{matchThreshold}%</strong></span>
                <input type="range" min="0" max="100" value={matchThreshold} onChange={(e) => setMatchThreshold(e.target.value)} style={{ flex: 1, accentColor: '#646cff' }} />
            </div>

            {/* 5. RESULTS */}
            <div className="results-grid" style={{ display: 'grid', gap: '20px' }}>
                {loading ? <p style={{ textAlign: 'center' }}>Matching...</p> : 
                    jobs.filter(j => j.matchScore >= matchThreshold).length > 0 ? (
                        jobs.filter(j => j.matchScore >= matchThreshold).map(job => <JobCard key={job._id} job={job} />)
                    ) : <p style={{ textAlign: 'center', color: '#555' }}>No jobs meet this match percentage. Try lowering the slider!</p>
                }
            </div>

        </div>
    );
};

export default CandidateView;