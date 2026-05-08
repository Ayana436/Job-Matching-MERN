import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);
  const [viewMode, setViewMode] = useState("all"); 
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', skills: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (q = "") => {
    try {
      const res = await axios.get(`/api/jobs/search?q=${q}`);
      setJobs(res.data);
      setViewMode("all");
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleMatch = async () => {
    if (!resumeText) return alert("Paste resume text first!");
    try {
      const res = await axios.post('/api/jobs/match', { resumeText });
      setMatches(res.data);
      setViewMode("matches");
    } catch (err) {
      alert("Match failed");
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name); // Check 1

    const formData = new FormData();
    formData.append('resume', file);

    try {
        const res = await axios.post('/api/jobs/match-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log("Matches received from server:", res.data); // Check 2
        
        if (res.data.length === 0) {
            alert("PDF parsed, but 0 matches found for your skills.");
        }

        setMatches(res.data);
        setViewMode("matches");
    } catch (err) {
        console.error("Upload failed:", err);
        alert("Server error during PDF match.");
    }
};

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            title: newJob.title,
            location: newJob.location,
            description: "New job posted via Web UI", // Don't forget this!
            requiredSkills: newJob.skills.split(',').map(s => s.trim()).filter(s => s !== "")
        };

        await axios.post('/api/jobs/add', payload);
        alert("Job Posted!");
        setNewJob({ title: '', location: '', skills: '' });
        fetchJobs();
    } catch (err) {
        console.error("Post Error:", err.response?.data);
        alert(`Error: ${err.response?.data?.error || "Check Console"}`);
    }
};

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>Qollabb Matcher Pro</h1>
        <button className="toggle-btn" onClick={() => setIsRecruiter(!isRecruiter)}>
          {isRecruiter ? "Switch to Candidate" : "Switch to Recruiter"}
        </button>
      </nav>

      <main className="container">
        {isRecruiter ? (
          <div className="card full-width">
            <h2>Post a New Job</h2>
            <form onSubmit={handlePostJob} className="post-job-form">
              <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
              <input placeholder="Location" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} required />
              <input placeholder="Skills (comma separated)" value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} required />
              <button type="submit" className="btn-primary">Publish Job</button>
            </form>
          </div>
        ) : (
          <>
            <div className="card">
              <h3>Analyze Resume</h3>
              <textarea 
                placeholder="Paste resume text..." 
                value={resumeText} 
                onChange={(e) => setResumeText(e.target.value)} 
              />
              <div className="btn-group">
              {/* HIDDEN INPUT */}
                <input 
                type="file" 
                id="pdf-up" 
                hidden 
                onChange={handlePdfUpload} 
                accept=".pdf" />

                {/* BUTTON TRIGGERING HIDDEN INPUT */}
                <button className="btn-secondary" onClick={() => document.getElementById('pdf-up').click()}>
                  Upload PDF
                </button>
                <button onClick={handleMatch} className="btn-primary">Match Text</button>
              </div>
            </div>

            <div className="card">
              <div className="search-header">
                <input 
                  placeholder="Search jobs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-search" onClick={() => fetchJobs(searchTerm)}>Search</button>
              </div>
              
              <h3>{viewMode === "matches" ? "Smart Matches" : "All Jobs"}</h3>
              <div className="results-list">
                {(viewMode === "matches" ? matches : jobs).map(job => (
                  <div key={job._id} className="job-item">
                    <div className="job-row">
                      <strong>{job.title}</strong>
                      {job.matchScore !== undefined && <span className="match-badge">{job.matchScore}%</span>}
                    </div>
                    <p>{job.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;