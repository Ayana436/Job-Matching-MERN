import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const notify = (message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2400);
    };

    const fetchApplicants = useCallback(async () => {
        const res = await API.get('/api/jobs/applicants');
        setApplicants(res.data);
    }, []);

    useEffect(() => {
        fetchApplicants().catch((err) => {
            console.error("Fetch applicants failed:", err);
        });
    }, [fetchApplicants]);

const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
        await API.patch(`/api/jobs/applicants/${applicationId}`, {
            status: newStatus 
        });
        
        // ✨ MANUAL UI UPDATE:
        // Assuming your state variable for the list is called 'applicants'
        // This find the specific row and flips the status without a page reload.
        setApplicants(prev => prev.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
        ));

        notify(`Application ${newStatus}.`);

        await fetchApplicants();
    } catch (err) {
        console.error("Status update failed:", err);
        notify("Failed to update status.", "error");
    }
};

const filteredApplicants = applicants.filter((app) =>
    app.candidateId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateSkills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
);


    return (
        <div className="applicants-wrapper">
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            <div className="applicants-nav">
                <h2 style={{color: 'white', margin: 0}}>Incoming <span style={{color: '#646cff'}}>Applications</span></h2>
                <button className="btn-return" onClick={() => navigate('/admin')}>
                    ← Back to Dashboard
                </button>
            </div>

        
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <div className="search-container" style={{ marginBottom: '20px', width:'60%' }}>
            <input
                type="text"
                placeholder="🔍 Search by candidate name..."
                className="auth-input" // Reusing your existing input style
                // style={{ maxWidth: '400px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="results-count">
        Showing {filteredApplicants.length} applications
    </div>

            </div>

            <table className='incoming applicants-table' style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>Candidate</th>
                        <th style={{ padding: '15px' }}>Role</th>
                        <th style={{ padding: '15px' }}>Match</th>
                        <th style={{ padding: '15px' }}>Status</th>
                        <th style={{ padding: '15px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredApplicants.map(app => (
                        <tr key={app._id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '15px' }}><div style={{ fontWeight: 'bold' }}>
                                {app.candidateId?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#646cff', marginTop: '4px' }}>
                                    {app.candidateSkills && app.candidateSkills.length > 0 
                                        ? app.candidateSkills.join(', ') 
                                        : 'Processing skills...'}
                                </div>
                                </td>
                            <td style={{ padding: '15px' }}>{app.jobId?.title}</td>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#6366f1' }}>
                                {app.matchScore}%
                            </td>
                            <td style={{ padding: '15px' }}>{app.status}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="approve-btn" onClick={() => handleStatusUpdate(app._id, 'Accepted')}style={{ background: '#4caf5022', color: '#4caf50', border: '1px solid #4caf50', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleStatusUpdate(app._id, 'Rejected')}style={{ background: '#f4433622', color: '#f44336', border: '1px solid #f44336', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApplicantsList;
