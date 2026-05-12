import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';
import { skillMap } from '../data/skillMap'; // Import the object we created
import { useNavigate } from 'react-router-dom';

const CandidateView = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]); // Array for multi-search
    const [matchThreshold, setMatchThreshold] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState([]);
    
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const mainCategories = ["Full-time", "Remote", "Entry", "MERN Stack", "Data Science"];

    // Multi-select logic
    const toggleSkill = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    // Trigger search whenever selectedSkills change
    useEffect(() => {
        const fetchFilteredJobs = async () => {
            if (selectedSkills.length === 0) return;
            setLoading(true);
            try {
                // Joins skills into a string like "React,Node,Remote"
                const query = selectedSkills.join(',');
                const res = await axios.get(`/api/jobs/search?q=${query}`);
                setJobs(res.data);
            } catch (err) {
                console.error("Multi-search failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredJobs();
    }, [selectedSkills]);

    const processUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
        alert("Please upload a valid PDF file.");
        return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);

    try {
        const res = await axios.post('/api/jobs/match-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log("AI Match Data:", res.data);

        // Update the jobs list with the new match scores from AI
        setJobs(res.data);

        // Look for extracted skills in the first match or top-level key
        const skills = res.data[0]?.matchedSkills || res.data.skills || [];
        setExtractedSkills(skills);
        
        alert("Resume analyzed! Check your top matches.");
    } catch (err) {
        console.error("PDF Parsing Failed:", err);
        alert("AI parsing failed. Please try again.");
    } finally {
        setLoading(false);
    }
};

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
            setJobs(prev => prev.map(j => j._id === jobId ? {...j, applied: true} : j));
            return false;
        } else {
            alert(`Applied successfully! Match: ${finalScore}%`);
            // Update local state so UI reflects application
            setJobs(prev => prev.map(j => j._id === jobId ? {...j, applied: true} : j));
            return true; 
        }
    } catch (err) {
        console.error("Apply Error:", err);
        return false;
    }
};

    return (
        <div className="main-layout">
            {/* --- SIDEBAR: Now the ONLY place for User Info --- */}
            <aside className="sidebar">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <h4 style={{ margin: '10px 0 0' }}>{user?.name}</h4>
                    <span className="profile-badge">Candidate</span>
                </div>

                <div className="sidebar-stats">
                    <div className="stat-box">
                        <span className="stat-num">1</span>
                        <span className="stat-label">Applied</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">0</span>
                        <span className="stat-label">Interviews</span>
                    </div>
                </div>

                <nav className="sidebar-nav" style={{ marginTop: '30px' }}>
                    <button className="nav-item active">🔍 Find Jobs</button>
                    <button className="nav-item" onClick={() => navigate('/my-applications')}>📑 My Applications</button>
                    <button className="nav-item">👤 Profile Settings</button>
                </nav>

                <div style={{ marginTop: '30px' }}>
                    <h5 style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>Recently Applied</h5>
                    <div className="history-item">
                        <strong>Teaching Assistant</strong>
                        <div style={{ color: '#4caf50', fontSize: '0.75rem' }}>Status: Pending</div>
                    </div>
                </div>

                <button onClick={() => { localStorage.clear(); window.location.href='/auth'; }} className="sidebar-logout">🚪 Logout</button>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main style={{ padding: '20px' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Find Your <span style={{ color: '#646cff' }}>Perfect</span> Match</h1>
                    
                    {/* --- MULTI-SELECT SEARCH AREA --- */}
                    <div className="multi-search-wrapper">
                        <div className="selected-tags-area">
                            
                            <input 
                                type="text" 
                                placeholder="Type skill and press Enter..." 
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && e.target.value) {
                                        toggleSkill(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                        {selectedSkills.map(skill => (
                                <span key={skill} className="skill-tag">
                                    {skill} <i onClick={() => toggleSkill(skill)}>×</i>
                                </span>
                            ))}
                    </div>

                    {/* --- SMART DYNAMIC CHIPS --- */}
                    <div className="chip-logic-area" style={{ marginTop: '15px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>Suggested categories:</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {mainCategories.map(cat => (
                                <button 
                                    key={cat} 
                                    className={`filter-chip ${selectedSkills.includes(cat) ? 'active' : ''}`}
                                    onClick={() => toggleSkill(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        {/* Show sub-skills ONLY if a parent category is selected */}
                        {selectedSkills.some(s => skillMap[s]) && (
                            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(100,108,255,0.05)', borderRadius: '12px',display: 'flex', flexWrap: 'wrap' }}>
                                <p style={{ fontSize: '0.75rem', color: '#646cff' }}>Related Skills: </p>
                                {selectedSkills.filter(s => skillMap[s]).map(parent => 
                                    skillMap[parent].map(sub => (
                                        <button 
                                            key={sub} 
                                            className={`sub-chip ${selectedSkills.includes(sub) ? 'active-sub' : ''}`}
                                            onClick={() => toggleSkill(sub)}
                                            style={{ opacity: selectedSkills.includes(sub) ? 1 : 0.6 }}
                                        >
                                            + {sub}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* --- AI MATCHER SECTION --- */}
                <section className="ai-matcher-box" onDrop={(e) => { e.preventDefault(); processUpload(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}>
                    <h3>🚀 AI Resume Matcher</h3>
                    <p>Drop your resume to filter jobs by your actual expertise.</p>
                    <label className="upload-btn-label">
                        Upload PDF
                        <input type="file" hidden accept=".pdf" onChange={(e) => processUpload(e.target.files[0])} />
                    </label>
                </section>

                {/* Replace the old slider block with this */}
<div className="match-precision-box">
    <div className="slider-label-row">
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#aaa' }}>Match Precision Threshold</span>
        <span className="precision-badge">{matchThreshold}%</span>
    </div>
    
    <input 
        type="range" className="custom-slider"min="0" max="100" value={matchThreshold} onChange={(e) => setMatchThreshold(e.target.value)} />
    <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
        {matchThreshold > 70 
            ? "🔥 Showing high-quality matches based on your skills." 
            : "Showing all available opportunities."}
    </p>
</div>

                <div className="results-grid">
                    {loading ? <p>Finding matches...</p> : 
                        jobs.filter(j => (j.matchScore || 0) >= matchThreshold).map(job => (
                            <JobCard key={job._id} job={job} onApply={() => handleQuickApply(job._id, job.matchScore)} />
                        ))
                    }
                </div>
            </main>
        </div>
    );
};

export default CandidateView;