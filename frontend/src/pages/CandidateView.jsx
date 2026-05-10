import { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateView = () => {
    // Start loading as false so initial fetch works silently
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [matches, setMatches] = useState([]);
    const [viewMode, setViewMode] = useState("all");

    // 1. Fetch Jobs on initial load
    useEffect(() => { 
        fetchJobs(); 
    }, []);

    // 2. Search Function
    const fetchJobs = async (query = "") => {
        try {
            console.log("Fetching jobs for:", query);
            const res = await axios.get(`/api/jobs/search?q=${query}`);
            setJobs(res.data);
            setViewMode("all"); // Switch back to 'all' view when searching
            console.log("Jobs found:", res.data.length);
        } catch (err) { 
            console.error("Search Failed:", err); 
        }
    };

    // 3. PDF Match Function with simulated delay for UX
    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true); 
        console.log("AI Analysis started...");

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await axios.post('/api/jobs/match-pdf', formData);
            
            // Artificial delay so the user sees the cool spinner
            setTimeout(() => {
                setMatches(res.data);
                setViewMode("matches");
                setLoading(false);
                console.log("AI Analysis complete.");
            }, 2000); 

        } catch (err) {
            console.error("Upload failed:", err);
            setLoading(false);
            alert("Failed to process resume. Please try again.");
        }
    };

    return (
        <div className="fade-in">
            {/* HERO SECTION */}
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

            {/* SEARCH SECTION */}
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

                {/* DYNAMIC RESULTS AREA */}
                {loading ? (
                    /* SPINNER VIEW */
                    <div className="loader-overlay">
                        <div className="spinner"></div>
                        <h2 className="loading-text">AI Scanning Engine Active...</h2>
                        <p>Analyzing your resume against Cluster0 database</p>
                    </div>
                ) : (
                    /* RESULTS LIST */
                    <div className="results-list">
                        {(viewMode === "matches" ? matches : jobs).length > 0 ? (
                            (viewMode === "matches" ? matches : jobs).map((job) => (
                                <div key={job._id} className="job-card">
                                    <div className="job-header">
                                        <h4>{job.title}</h4>
                                        {/* Show Match Progress Bar only in Match Mode */}
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
                                                    {/* Green Checks for Matched Skills */}
                                                    {job.matchedSkills?.map(skill => (
                                                        <span key={skill} className="chip match">✔ {skill}</span>
                                                    ))}
                                                    {/* Red Crosses for Missing Skills */}
                                                    {job.missingSkills?.map(skill => (
                                                        <span key={skill} className="chip missing">✘ {skill}</span>
                                                    ))}
                                                </>
                                            ) : (
                                                /* Default Gray Chips for Browsing Mode */
                                                job.requiredSkills?.map(skill => (
                                                    <span key={skill} className="chip">{skill}</span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* EMPTY STATE */
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