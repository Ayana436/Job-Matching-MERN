import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';


const RecruiterView = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '', location: '', workMode: 'Office', description: '', 
        requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level'
    });
    const [jobs, setJobs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const token = localStorage.getItem('token');

    const fetchAdminJobs = useCallback(async () => {
        try {
            const res = await API.get('/api/jobs/search?q=', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    }, [token]);

    useEffect(() => { if (token) fetchAdminJobs(); }, [fetchAdminJobs, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const resetForm = () => {
        setFormData({ title: '', location: '', workMode: 'Office', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const recruiterId = user?.id || user?._id;
        const payload = { 
            ...formData, 
            postedBy: recruiterId, 
            requiredSkills: typeof formData.requiredSkills === 'string' ? formData.requiredSkills.split(',').map(s => s.trim()) : formData.requiredSkills
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingId) {
                await API.put(`/api/jobs/${editingId}`, payload, config);
            } else {
                await API.post('/api/jobs', payload, config);
            }
            resetForm();
            fetchAdminJobs();
        } catch (err) {
            console.error("Save job failed:", err);
            alert("Action failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await API.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAdminJobs();
        } catch (err) {
            console.error("Delete job failed:", err);
            alert("Delete failed.");
        }
    };

    return (
        <div className="recruiter-container">
            {/* Header / Nav */}
            <header className="recruiter-header">
                <h1 className="header-title">Recruiter <span>Dashboard</span></h1>
                
                <nav className="header-nav">
                    <button className="btn-applicants" onClick={() => navigate('/admin/applicants')}>
                        📂 View Applicants
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            {/* JOB FORM */}
            <div className="job-form-card">
                <h2>{editingId ? "📝 Edit Job" : "🚀 Post a New Role"}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="input-group">
                            <label>Job Title</label>
                            <input className="input-field" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Location (City)</label>
                            <input className="input-field" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>
                            Required Skills (Comma separated: e.g. React, Node, Python)
                        </label>
                        <input 
                            className="input-field"
                            required 
                            placeholder="React, Node, MongoDB..."
                            value={formData.requiredSkills} 
                            onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
                        />
                    </div>

                    <div className="form-grid-3">
                        <div className="input-group">
                            <label>Work Mode</label>
                            <select className="input-field" value={formData.workMode} onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
                                <option value="Office">Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Job Type</label>
                            <select className="input-field" value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Experience</label>
                            <select className="input-field" value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior Level">Senior Level</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Description</label>
                        <textarea className="input-field" required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary">
                            {editingId ? "Save Changes" : "Publish Job"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Active Listings Section */}
            <div className="listings-section">
                <h3>💼 Active Listings ({jobs.length})</h3>
                {jobs.map(job => (
                    <div key={job._id} className="job-item">
                        <div>
                            <h4>{job.title}</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>
                                📍 {job.location} {(job.workMode)} • {job.jobType}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="edit-btn" onClick={() => {
                                setEditingId(job._id); 
                                setFormData({...job, requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills});
                            }}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(job._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecruiterView;
