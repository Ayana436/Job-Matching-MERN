import { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterView = () => {
    const [formData, setFormData] = useState({
        title: '', location: '', workMode: 'Office', description: '', 
        requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level'
    });
    const [jobs, setJobs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => { if (token) fetchAdminJobs(); }, [token]);

    const fetchAdminJobs = async () => {
        try {
            const res = await axios.get('/api/jobs/search?q=', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const recruiterId = user?.id || user?._id;
        const payload = { ...formData, postedBy: recruiterId, 
            requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()) 
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingId) {
                await axios.put(`/api/jobs/${editingId}`, payload, config);
            } else {
                await axios.post('/api/jobs', payload, config);
            }
            setFormData({ title: '', location: '', workMode: 'Office', description: '', requiredSkills: '', jobType: 'Full-time', experienceLevel: 'Entry Level' });
            setEditingId(null);
            fetchAdminJobs();
        } catch (err) { alert("Action failed. Check console."); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this listing?")) return;
        try {
            await axios.delete(`/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAdminJobs();
        } catch (err) { alert("Delete failed."); }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', color: 'white', fontFamily: 'sans-serif' }}>
            {/* Header with Styled Logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.5rem', opacity: 0.7 }}>Recruiter Dashboard</h1>
                <button onClick={handleLogout} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
                    Logout
                </button>
            </div>

            <div style={{ background: '#1e1e26', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h2 style={{ marginBottom: '30px' }}>{editingId ? "📝 Edit Job" : "🚀 Post a New Role"}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Job Title</label>
                            <input required style={inputStyle} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Location (City)</label>
                            <input required style={inputStyle} value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Work Mode</label>
                            <select style={inputStyle} value={formData.workMode} onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
                                <option value="Office">Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Job Type</label>
                            <select style={inputStyle} value={formData.jobType} onChange={(e) => setFormData({...formData, jobType: e.target.value})}>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Experience</label>
                            <select style={inputStyle} value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior Level">Senior Level</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Description</label>
                        <textarea required rows="4" style={inputStyle} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        {editingId ? "Save Changes" : "Publish Job"}
                    </button>
                </form>
            </div>

            {/* Active Listings Section */}
            <div style={{ marginTop: '50px' }}>
                <h3 style={{ marginBottom: '20px' }}>💼 Active Listings ({jobs.length})</h3>
                {jobs.map(job => (
                    <div key={job._id} style={{ background: '#252530', padding: '20px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>{job.title}</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>
                                📍 {job.location} ({job.workMode || 'Office'}) • {job.jobType}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => {setEditingId(job._id); setFormData({...job, requiredSkills: job.requiredSkills.join(', ')});}} style={actionBtnStyle('#4caf50')}>Edit</button>
                            <button onClick={() => handleDelete(job._id)} style={actionBtnStyle('#f44336')}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Internal CSS Styles
const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', 
    background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', boxSizing: 'border-box'
};

const actionBtnStyle = (color) => ({
    background: `${color}1A`, color: color, border: `1px solid ${color}`, 
    padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
});

export default RecruiterView;