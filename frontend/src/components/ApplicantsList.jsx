import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { getResumeUrl } from '../utils/getResumeUrl';

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

    fetchApplicants().catch(() => {
        notify("Unable to refresh applications.", "error");
    });

    // AUTO REFRESH
    const interval = setInterval(() => {

        fetchApplicants().catch(() => {
            notify("Unable to refresh applications.", "error");
        });

    }, 15000);

    return () => clearInterval(interval);

}, [fetchApplicants]);

const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
        const token = localStorage.getItem("token");
        await API
        .patch(`/api/jobs/applicants/${applicationId}`, {
            status: String(newStatus).toLowerCase()
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        setApplicants(prev => prev.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
        ));

        notify(`Application ${newStatus}.`);

        await fetchApplicants();
    } catch {
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
                id='candidate-name'
                name='candidate-name'
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

        <div className="activity-feed" style={{display:'flex', justifyContent:'space-around'}}>

    <h4>Recent Activity</h4>

    <div>
        John applied for Frontend Developer
    </div>

    <div>
        Sarah was accepted
    </div>

    <div>
        AWS role received 5 applications
    </div>

</div>

            <div className="table-responsive-wrapper">
    <table className="ranking-table">
        <thead>
            <tr>
                <th style={{ width: "8%" }}>Rank</th>
                <th style={{ width: "20%" }}>Candidate Entity</th>
                <th style={{ width: "22%" }}>Target Role Position</th>
                <th style={{ width: "10%" }}>AI Match</th>
                <th style={{ width: "12%" }}>Status Routing</th>
                <th style={{ width: "12%" }}>Resume</th>
                <th style={{ width: "18%" }}>Action Center</th>
                <th style={{ width: "28%" }}>Inference Recommendation Explanation</th>
            </tr>
        </thead>
        <tbody>
            {paginatedApplicants.map((app, index) => {
                const currentStartIndex = (currentPage - 1) * applicantsPerPage;
                
                return (
                    <tr key={`${app._id}-${app.refreshKey || index}`}>
                        <td>
                            <span className="rank-badge">
                                #{currentStartIndex + index + 1}
                            </span>
                        </td>
                        <td>
                            <div className="candidate-cell-info">
                                <strong className="candidate-primary-name">
                                    {app.candidateId?.name || 'Anonymous User'}
                                </strong>
                                <span className="ranking-subtext">
                                    {app.candidateId?.email || 'No email log'}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span className="role-title-badge">
                                {app.jobId?.title || 'Unresolved Entity'}
                            </span>
                        </td>
                        <td>
                            <div className="score-cell">
                                <b className="score-percentage-value">{app.matchScore || 0}%</b>
                                <span className="score-track-bg">
                                    <i style={{ width: `${Math.min(app.matchScore || 0, 100)}%` }} />
                                </span>
                            </div>
                        </td>
                        <td>
    <span className={`ranking-status ${String(app.status).toLowerCase()}`}>
        {app.status}
    </span>
</td>

<td>
{
    app.candidateId?.resume ? (
        <button
        className='resume-btn'
            onClick={() => {
                const resume = typeof app.candidateId.resume === "object"
                    ? app.candidateId.resume.filePath
                    : app.candidateId.resume;

                window.open(
                    getResumeUrl(resume),
                    "_blank"
                );
            }}
        >
            View Resume
        </button>
    ) : (
        <span>No Resume</span>
    )
}
</td>

<td>
    <div className="action-buttons">
        <button
            className="approve-btn"
            onClick={() =>
                handleStatusUpdate(
                    app._id,
                    "accepted"
                )
            }
        >
            ✓ Approve
        </button>

        <button
            className="reject-btn"
            onClick={() =>
                handleStatusUpdate(
                    app._id,
                    "rejected"
                )
            }
        >
            ✕ Reject
        </button>
    </div>
</td>
                        <td>
                            <div className="ai-inference-container">
                                <span className="ai-pill-tag" style={{ background: app.recommendationColor || "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                                    {app.matchScore >= 80
                                    ? "Highly Recommended"
                                    : app.matchScore >= 60
                                    ? "Recommended"
                                    : app.matchScore > 0
                                    ? "Consider"
                                    : "No AI Data"}
                                </span>
                                <small className="ai-insight-text-block">
                                    {app.candidateSkills?.length > 0
        ? `Matched Skills: ${app.candidateSkills.join(", ")}`
        : "Resume matching data unavailable"
                                    }
                                </small>
                            </div>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
</div>
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
