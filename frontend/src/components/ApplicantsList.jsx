import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const applicantsPerPage = 8;
    const navigate = useNavigate();

    const notify = (message, type = "success") => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 2400);
    };

    const fetchApplicants = useCallback(async () => {
        const token = localStorage.getItem("token");

        const res = await API.get(`/api/jobs/applicants?t=${Date.now()}`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache"
        }
    });
        setApplicants(res.data);
    }, []);

useEffect(() => {

    fetchApplicants().catch((err) => {
        console.error("Fetch applicants failed:", err);
    });

    // AUTO REFRESH
    const interval = setInterval(() => {

        fetchApplicants().catch((err) => {
            console.error("Auto refresh failed:", err);
        });

    }, 15000);

    return () => clearInterval(interval);

}, [fetchApplicants]);

const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
        await API
        patch(`/api/jobs/applicants/${applicationId}`, {
            status: newStatus.toLowerCase()
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

const totalPages = Math.ceil(
    filteredApplicants.length / applicantsPerPage
);

const startIndex =
    (currentPage - 1) * applicantsPerPage;

const paginatedApplicants =
    filteredApplicants.slice(
        startIndex,
        startIndex + applicantsPerPage
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                        <th style={{ padding: '15px', textAlign:'center' }}>Resume</th>
                        <th style={{ padding: '15px' }}>Status</th>
                        <th style={{ padding: '15px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedApplicants.map(app => (
                        <tr key={app._id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '15px' }}><div style={{ fontWeight: 'bold' }}>
                                {app.candidateId?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#646cff', marginTop: '4px' }}>
                                    {app.candidateSkills && app.candidateSkills?.length > 0 
                                        ? app.candidateSkills.join(', ') 
                                        : 'No extracted skills...'}
                                </div>
                                </td>
                            <td style={{ padding: '15px' }}>{app.jobId?.title}</td>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#6366f1' }}>
                                {app.matchScore}%
                            </td>
                            <td style={{ padding: '15px'}}>

{app.candidateId?.resume?.filePath ? (

    <div
        style={{
            display: "flex",
            gap: "10px"
        }}
    >

        <button
            onClick={() => {

                const resumeUrl =
                    app.candidateId.resume.filePath
                        .replaceAll("\\", "/");

                window.open(
                    `http://localhost:5000/${resumeUrl}`,
                    "_blank"
                );
            }}
            style={{
                background: "#1e293b",
                color: "white",
                border: "1px solid #334155",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
            }}
        >
            View
        </button>

        <button
            onClick={() => {

                const resumeUrl =
                    app.candidateId.resume.filePath
                        .replaceAll("\\", "/");

                const link =
                    document.createElement("a");

                link.href =
                    `http://localhost:5000/${resumeUrl}`;

                link.download =
                    app.candidateId.resume.fileName ||
                    "resume.pdf";

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);
            }}
            style={{
                background: "#4caf5022",
                color: "#4caf50",
                border: "1px solid #4caf50",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
            }}
        >
            Download
        </button>

    </div>

) : (

    <span style={{ color: "#888" }}>
        No Resume
    </span>

)}

</td>
                            <td style={{ padding: '15px' }}>{app.status}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="approve-btn" onClick={() => handleStatusUpdate(app._id, 'accepted')}style={{ background: '#4caf5022', color: '#4caf50', border: '1px solid #4caf50', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleStatusUpdate(app._id, 'rejected')}style={{ background: '#f4433622', color: '#f44336', border: '1px solid #f44336', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                <div className="pagination-controls">

                <button
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage(prev => prev - 1)
                    }
                >
                    ← Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                        setCurrentPage(prev => prev + 1)
                    }
                >
                    Next →
                </button>

                </div>
        </div>
    );
};

export default ApplicantsList;
