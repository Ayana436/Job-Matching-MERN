import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Applicants on Load
    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const res = await axios.get('/api/jobs/applicants');
                setApplicants(res.data);
            } catch (err) {
                console.error("Error fetching applicants", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, []);

    // 2. THE MISSING FUNCTION: handleStatusUpdate
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            // Update Backend
            await axios.patch(`/api/jobs/applicants/${id}`, { status: newStatus });
            
            // Update Frontend State (Optimistic UI)
            setApplicants(prev => 
                prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
            );
            
            alert(`Application ${newStatus}!`);
        } catch (err) {
            console.error("Update failed", err);
            alert("Error updating status.");
        }
    };

    return (
        <div className="admin-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ marginBottom: '30px' }}>Incoming <span style={{ color: '#646cff' }}>Applications</span></h1>
            
            {loading ? <p>Loading Applicants...</p> : (
                <div className="job-card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: '20px' }}>Candidate</th>
                                <th style={{ padding: '20px' }}>Job Role</th>
                                <th style={{ padding: '20px' }}>Status</th>
                                <th style={{ padding: '20px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(app => (
                                <tr key={app._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{app.candidateId?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{app.candidateId?.email}</div>
                                    </td>
                                    <td style={{ padding: '20px' }}>{app.jobId?.title || 'Job Deleted'}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold',
                                            background: app.status === 'Accepted' ? '#4caf5022' : app.status === 'Rejected' ? '#f4433622' : '#646cff22',
                                            color: app.status === 'Accepted' ? '#4caf50' : app.status === 'Rejected' ? '#f44336' : '#646cff'
                                        }}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <button 
                                            onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                                            style={{ background: '#4caf50', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' }}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                            style={{ background: '#f44336', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;