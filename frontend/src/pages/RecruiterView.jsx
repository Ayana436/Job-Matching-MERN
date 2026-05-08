import { useState } from 'react';
import axios from 'axios';

    const RecruiterView = () => {
    const [newJob, setNewJob] = useState({ title: '', location: '', skills: '', description: '' });

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
        const payload = {
            title: newJob.title,
            location: newJob.location,
            description: newJob.description || "No description provided",
            requiredSkills: newJob.skills.split(',').map(s => s.trim()).filter(s => s !== "")
        };
        await axios.post('/api/jobs/add', payload);
        alert("🚀 Job Published to Cluster0!");
        setNewJob({ title: '', location: '', skills: '', description: '' });
        } catch (err) {
        alert("Failed to post job. Check console.");
        }
    };

    return (
        <div className="fade-in">
        <div className="card">
            <h2>Recruiter Dashboard</h2>
            <p>Post a new opening to start matching with candidates.</p>
            <form onSubmit={handlePostJob} className="post-job-form">
            <label>Job Title</label>
            <input value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required placeholder="e.g. Senior MERN Developer" />
            
            <label>Location</label>
            <input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} required placeholder="e.g. Remote / New York" />
            
            <label>Skills (Comma Separated)</label>
            <input value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} required placeholder="e.g. React, Node.js, MongoDB" />
            
            <label>Description</label>
            <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role..." rows="4" />
            
            <button type="submit" className="btn-primary">Publish Position</button>
            </form>
        </div>
        </div>
    );
    };

export default RecruiterView;