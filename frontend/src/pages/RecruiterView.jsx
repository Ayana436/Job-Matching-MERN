import { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterView = () => {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        description: '',
        requiredSkills: '',
        jobType: 'Full-time',
        experienceLevel: 'Entry'
    });

    const [jobs, setJobs] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAdminJobs();
    }, []);

    const fetchAdminJobs = async () => {
        try {
            const res = await axios.get('/api/jobs/search?q=');
            setJobs(res.data);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        try {
            await axios.delete(`/api/jobs/${id}`);
            fetchAdminJobs();
        } catch (err) {
            alert("Delete failed. Ensure your backend has a DELETE route!");
        }
    };

    const startEdit = (job) => {
        setEditingId(job._id);
        setFormData({
            title: job.title,
            location: job.location,
            description: job.description,
            requiredSkills: job.requiredSkills.join(', '),
            jobType: job.jobType || 'Full-time',
            experienceLevel: job.experienceLevel || 'Entry'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            requiredSkills: formData.requiredSkills.split(',').map(s => s.trim())
        };

        try {
            if (editingId) {
                await axios.put(`/api/jobs/${editingId}`, payload);
            } else {
                await axios.post('/api/jobs', payload);
            }
            setFormData({ title: '', location: '', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry' });
            setEditingId(null);
            fetchAdminJobs();
        } catch (err) {
            console.error("Submit failed:", err);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* 1. FORM SECTION */}
            <div className="job-card" style={{ padding: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>
                        {editingId ? "📝 Update Position" : "🚀 Post a New Role"}
                    </h2>
                    <p style={{ color: '#888' }}>
                        Define the requirements to attract the best AI-matched talent.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ fontSize: '0.75rem', color: '#646cff', fontWeight: 'bold', textTransform: 'uppercase' }}>Job Title</label>
                            <input 
                                required value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Senior MERN Developer" 
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.75rem', color: '#646cff', fontWeight: 'bold', textTransform: 'uppercase' }}>Location</label>
                            <input 
                                required value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="e.g. Remote or City" 
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ fontSize: '0.75rem', color: '#646cff', fontWeight: 'bold', textTransform: 'uppercase' }}>Required Skills (Comma Separated)</label>
                        <input 
                            required value={formData.requiredSkills}
                            onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                            placeholder="React, Node.js, MongoDB..." 
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ fontSize: '0.75rem', color: '#646cff', fontWeight: 'bold', textTransform: 'uppercase' }}>Job Description</label>
                        <textarea 
                            required rows="4" value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Tell candidates about the role..."
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', padding: '15px', width: '100%', outline: 'none' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '12px 30px', borderRadius: '100px' }}>
                            {editingId ? "Save Changes" : "Publish Job"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => setEditingId(null)} className="btn-text-only">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* 2. MANAGEMENT SECTION */}
            <div style={{ marginTop: '50px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    💼 Active Listings 
                    <span style={{ fontSize: '0.9rem', background: 'rgba(100, 108, 255, 0.2)', padding: '2px 10px', borderRadius: '20px', color: '#646cff' }}>
                        {jobs.length}
                    </span>
                </h3>
                
                <div className="results-list">
                    {jobs.map(job => (
                        <div key={job._id} className="job-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{job.title}</h4>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#888' }}>
                                    <span>📍 {job.location}</span>
                                    <span>🛠️ {job.requiredSkills.length} Skills</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => startEdit(job)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Edit</button>
                                <button onClick={() => handleDelete(job._id)} style={{ background: 'rgba(244, 67, 54, 0.1)', border: 'none', color: '#f44336', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecruiterView;