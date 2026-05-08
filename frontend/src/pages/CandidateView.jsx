import { useState, useEffect } from 'react';
import axios from 'axios';

    const CandidateView = () => {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [matches, setMatches] = useState([]);
    const [viewMode, setViewMode] = useState("all");

    // 1. FeatchJobs on Load:
    useEffect(() => { fetchJobs(); }, []);

    // 2. THE SEARCH FUNCTION, Handles calling the backend
    const fetchJobs = async (query = "") => {
        try {
            console.log("Fetching jobs for:", query);
        const res = await axios.get(`/api/jobs/search?q=${query}`);

        // 3. STATE UPDATE (Writing down message)
        setJobs(res.data);
        setViewMode("all"); //swicth back to all view while researching
        console.log("Jobs found:", res.data.length);
        } catch (err) { console.error("Search Failed:", err); }
    };

    const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true); // START LOADING
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const res = await axios.post('/api/jobs/match-pdf', formData);
        // MANUALLY DELAY THE SUCCESS BY 2 SECONDS
        setTimeout(() =>{
        setMatches(res.data);
        setViewMode("matches");
        setLoading(false); //Stop loading after 2 second
        }, 2000);
    } catch (err) {
        console.log("Upload Failed:", err);
        alert("Error matching PDF");
        setLoading(false);
    // } finally {
    //     setLoading(false); // STOP LOADING
    // }
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
                onKeyDown={(e) => e.key === 'Enter' && fetchJobs(searchTerm)}/>

                <button className="btn-search" onClick={() => fetchJobs(searchTerm)}>Search</button>
            </div>
            
            {/* JOB ITEM */}
            {/* Replace your job-item mapping with this enhanced version */}
        <div className="card">
            <h3>{viewMode === "matches" ? "🎯 Top Matches for You" : "💼 Available Positions"}</h3>
            {/* WAITING TIME */}
            {loading && (
                <div className="loader-container">
                <div className="spinner"></div>
                <p>AI is analyzing your resume...</p>
                </div>
                )}
                <div className="results-list">
    {(viewMode === "matches" ? matches : jobs).map((job) => (
        <div key={job._id} className="job-card">
            <div className="job-header">
                <h4>{job.title}</h4>

                {/* Check for matchScore properly */}

                {job.matchScore !== undefined && (
                    <div className="match-container">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${job.matchScore}%` }}></div>
                        </div>
                        <span className="match-text">{job.matchScore}% Match</span>
                    </div>
                )}
            </div>
            
            <p className="job-location">📍 {job.location}</p>

            <div className="skills-analysis">
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Skill Analysis:</p>
                <div className="skill-chips">
                    {/* Mode: Match Results */}
                    {/* Render matched skills if they exist | show GREEN/RED if we have matches */}
                    {viewMode === "matches" && (
                        <>
                    {job.matchedSkills?.map(skill => (
                        <span key={skill} className="chip match">✔ {skill}</span>
                    ))}
                    
                    {/* Render missing skills if they exist */}
                    {job.missingSkills?.map(skill => (
                        <span key={skill} className="chip missing">✘ {skill}</span>
                    ))}
                        </>
                    )}
                    {/* MODE: General Browsing */}
                    {/* Default view when just browsing (no PDF uploaded) | if we are not in match mode, just show regular skill tag */}
                    {viewMode === "all" && job.requiredSkills?.map(skill => (
                        <span key={skill} className="chip">{skill}</span>
                    ))}
                </div>
            </div>
        </div>
    ))}
    { (viewMode === "matches" ? matches : jobs).length === 0 && (
            <p className="no-results">No jobs found matching your criteria.</p>
        )}
</div>
            </div>
        </div>
    </div>
    );
    };

export default CandidateView;