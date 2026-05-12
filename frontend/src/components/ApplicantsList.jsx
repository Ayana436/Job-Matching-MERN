import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/jobs/applicants').then(res => setApplicants(res.data));
    }, []);

    return (
        <div className="applicants-wrapper">
            <div className="applicants-nav">
                <h2 style={{color: 'white', margin: 0}}>Incoming <span style={{color: '#646cff'}}>Applications</span></h2>
                <button className="btn-return" onClick={() => navigate('/admin')}>
                    ← Back to Dashboard
                </button>
            </div>

            <table className='incoming' style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
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
                    {applicants.map(app => (
                        <tr key={app._id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '15px' }}><div style={{ fontWeight: 'bold' }}>{app.candidateId?.name}</div>
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