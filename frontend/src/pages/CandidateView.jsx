import { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateView = () => {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [matches, setMatches] = useState([]);
    const [viewMode, setViewMode] = useState("all");

    // Separate component for the Job Card to handle individual "Expanded" states
    const JobCard = ({ job, viewMode }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div className="job-card">
                <div className="job-header">
                    <h4>{job.title}</h4>
                    {viewMode === "matches" && job.matchScore !== undefined && (
                        <div className="match-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${job.matchScore}%` }}></div>
                            </div>
                            <span className="match-text">{job.matchScore}% Match</span>
                        </div>
                    )}
                </div>
                
                <p className="job-location">📍 {job.location || "Remote"}</p>

                <div className="skills-analysis">
                    {viewMode === "matches" && (
                        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Skill Analysis:</p>
                    )}
                    <div className="skill-chips">
                        {viewMode === "matches" ? (
                            <>
                                {job.matchedSkills?.map(s => <span key={s} className="chip match">✔ {s}</span>)}
                                {job.missingSkills?.map(s => <span key={s} className="chip missing">✘ {s}</span>)}
                            </>
                        ) : (
                            job.requiredSkills?.map(s => <span key={s} className="chip">{s}</span>)
                        )}
                    </div>
                </div>

                {/* EXPANDABLE DETAILS SECTION */}
                <div className={`details-drawer ${isExpanded ? 'open' : ''}`}>
                    <div className="details-content">
                        <hr style={{ border: '0.5px solid #333', margin: '15px 0' }} />
                        <h5>Full Job Description</h5>
                        <p>{job.description || "No description provided."}</p>
                        
                        <div className="job-meta">
                            <span><strong>Type:</strong> {job.jobType || "Full-time"}</span>
                            <span><strong>Level:</strong> {job.experienceLevel || "Entry Level"}</span>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn-text-only" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '🔼 Show Less' : '🔽 View Details'}
                </button>
            </div>
        );
    };

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async (query = "") => {
        try {
            const res = await axios.get(`/api/jobs/search?q=${query}`);
            setJobs(res.data);
            setViewMode("all");
        } catch (err) { console.error("Search Failed:", err); }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);
        try {
            const res = await axios.post('/api/jobs/match-pdf', formData);
            setTimeout(() => {
                setMatches(res.data);
                setViewMode("matches");
                setLoading(false);
            }, 2000);
        } catch (err) {
            setLoading(false);
            alert("Error matching PDF");
        }
    };

    return (
        <div className="fade-in">
            <div className="card hero-card">
                <h2>Find Your Perfect Match</h2>
                <p>Upload your resume to see which jobs fit your skills best.</p>
                <div className="btn-group">
                    <input type="file" id="pdf-up" hidden onChange={handlePdfUpload} accept=".pdf" />
                    <button className="btn-primary" onClick={() => document.getElementById('pdf-up').click()}>
                        ✨ Upload Resume (PDF)
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="search-header">
                    <input 
                        placeholder="Search by title, location or skill..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchJobs(searchTerm)}
                    />
                    <button className="btn-search" onClick={() => fetchJobs(searchTerm)}>Search</button>
                </div>

                <h3>{viewMode === "matches" ? "🎯 Top Matches for You" : "💼 Available Positions"}</h3>

                {loading ? (
                    <div className="loader-overlay">
                        <div className="spinner"></div>
                        <h2 className="loading-text">AI Scanning Engine Active...</h2>
                        <p>Analyzing your resume against Cluster0 database</p>
                    </div>
                ) : (
                    <div className="results-list">
                        {(viewMode === "matches" ? matches : jobs).length > 0 ? (
                            (viewMode === "matches" ? matches : jobs).map((job) => (
                                <JobCard key={job._id} job={job} viewMode={viewMode} />
                            ))
                        ) : (
                            <div className="no-results">
                                <p>No jobs found. Try searching for "MERN" or "Developer".</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateView;