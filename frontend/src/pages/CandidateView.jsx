import { useState, useEffect } from 'react';
import axios from 'axios';

    const CandidateView = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [matches, setMatches] = useState([]);
    const [viewMode, setViewMode] = useState("all");

    useEffect(() => { fetchJobs(); }, []);

    const fetchJobs = async (q = "") => {
        try {
        const res = await axios.get(`/api/jobs/search?q=${q}`);
        setJobs(res.data);
        setViewMode("all");
        } catch (err) { console.error(err); }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('resume', file);
        try {
        const res = await axios.post('/api/jobs/match-pdf', formData);
        setMatches(res.data);
        setViewMode("matches");
        } catch (err) { alert("PDF Match Failed"); }
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
                placeholder="Search by title or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-search" onClick={() => fetchJobs(searchTerm)}>Search</button>
            </div>
            
            <h3>{viewMode === "matches" ? "🎯 Top Matches for You" : "💼 Available Positions"}</h3>
            <div className="results-list">
            {(viewMode === "matches" ? matches : jobs).map(job => (
                <div key={job._id} className="job-item">
                <div className="job-row">
                    <strong>{job.title}</strong>
                    {job.matchScore && <span className="match-badge">{job.matchScore}% Match</span>}
                </div>
                <p className="job-loc">{job.location}</p>
                <div className="skill-tags">
                    {job.matchedSkills?.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
    };

export default CandidateView;