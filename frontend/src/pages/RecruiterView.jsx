import { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterView = () => {
    const [formData, setFormData] = useState({
        title: '', location: '', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry'
    });
    const [jobs, setJobs] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchAdminJobs(); }, []);

    const fetchAdminJobs = async () => {
        try {
            const res = await axios.get('/api/jobs/search?q=');
            setJobs(res.data);
        } catch (err) { console.error("Failed to fetch jobs:", err); }
    };

    const handleDelete = async (id) => {
        // First confirmation
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        
        try {
            const res = await axios.delete(`/api/jobs/${id}`);
            // Update the UI immediately by filtering out the deleted job
            setJobs(prev => prev.filter(job => job._id !== id));
            // Final confirmation alert
            window.alert(res.data.message || "Job deleted successfully!");
        } catch (err) {
            alert("Delete failed. Check if the backend route exists.");
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
                const res = await axios.put(`/api/jobs/${editingId}`, payload);
                window.alert("Changes saved successfully!");
            } else {
                const res = await axios.post('/api/jobs', payload);
                window.alert("Job posted successfully!");
            }
            setFormData({ title: '', location: '', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry' });
            setEditingId(null);
            fetchAdminJobs();
        } catch (err) {
            console.error("Submit failed:", err);
            alert("Action failed. Check console.");
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="job-card" style={{ padding: '40px' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>
                    {editingId ? "📝 Update Position" : "🚀 Post a New Role"}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Job Title</label>
                            <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Location</label>
                            <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Required Skills</label>
                        <input required value={formData.requiredSkills} onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', padding: '15px', width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="btn-primary">{editingId ? "Save Changes" : "Publish Job"}</button>
                        {editingId && <button type="button" onClick={() => setEditingId(null)} className="btn-text-only">Cancel Edit</button>}
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '50px' }}>
                <h3>💼 Active Listings ({jobs.length})</h3>
                <div className="results-list">
                    {jobs.map(job => (
                        <div key={job._id} className="job-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4>{job.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>📍 {job.location}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => startEdit(job)} className="btn-secondary">Edit</button>
                                <button onClick={() => handleDelete(job._id)} style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecruiterView;