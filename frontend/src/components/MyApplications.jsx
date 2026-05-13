import { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
    const navigate = useNavigate();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?._id;

    useEffect(() => {
        const fetchMyApps = async () => {
            try {
                if (!userId) return;
                const res = await API.get(`/api/jobs/my-applications/${userId}`);
                setApps(res.data);
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyApps();
    }, [userId]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Accepted': return { color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)' };
            case 'Rejected': return { color: '#f44336', background: 'rgba(244, 67, 54, 0.1)' };
            default: return { color: '#646cff', background: 'rgba(100, 108, 255, 0.1)' };
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2>My <span style={{ color: '#646cff' }}>Applications</span></h2>
            <button 
                onClick={() => navigate('/')} 
                className="btn-back-home"
                style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#646cff22',
                    color: '#646cff',
                    border: '1px solid #646cff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                ← Back to Job Feed
            </button>
</header>
            <p style={{ color: '#888', marginBottom: '30px', fontSize:'1rem' }}>Track the status of your recent job applications.</p>
            {loading ? <p>Loading history...</p> : apps.length === 0 ? <p>You haven't applied to any jobs yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {apps.map(app => (
                        <div key={app._id} style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            padding: '20px', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{app.jobId?.title}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>📍 {app.jobId?.location}</span>
                            </div>
                            <div style={{ 
                                padding: '6px 15px', 
                                borderRadius: '20px', 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold',
                                ...getStatusStyle(app.status)
                            }}>
                                {app.status.toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
