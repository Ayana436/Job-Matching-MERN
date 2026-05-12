import React, { useState } from 'react';

const JobCard = ({ job, onApply }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [applied, setApplied] = useState(false); // Local state to show immediate feedback

    // Color logic for the match score gauge
    const getScoreColor = (score) => {
        if (score >= 80) return '#4caf50'; // Green
        if (score >= 50) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    const handleApplyClick = async () => {
    const isSuccess = await onApply(); // This calls the function in CandidateView
    if (isSuccess) {
        setApplied(true); // Now it will turn green/Applied
    }
};

    return (
        <div className="job-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{job.title}</h3>
                        {/* Work Mode Badge */}
                        <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '3px 8px', 
                            background: 'rgba(100, 108, 255, 0.2)', 
                            color: '#818cf8', 
                            borderRadius: '6px', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {job.workMode || 'Office'}
                        </span>
                    </div>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>📍 {job.location}</p>
                </div>
                
                {/* Match Score Gauge */}
                <div style={{ textAlign: 'center', marginLeft: '20px' }}>
                    <div style={{
                        width: '55px',
                        height: '55px',
                        borderRadius: '50%',
                        border: `4px solid ${getScoreColor(job.matchScore)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        {job.matchScore}%
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>Match</span>
                </div>
            </div>

            {/* Skill Analysis Section */}
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.matchedSkills?.map((skill, index) => (
                        <span key={`match-${index}`} style={{
                            padding: '5px 12px',
                            background: 'rgba(76, 175, 80, 0.12)',
                            color: '#81c784',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            fontWeight: '500'
                        }}>
                            ✔ {skill}
                        </span>
                    ))}
                    {job.missingSkills?.map((skill, index) => (
                        <span key={`miss-${index}`} style={{
                            padding: '5px 12px',
                            background: 'rgba(244, 67, 54, 0.12)',
                            color: '#ef5350',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            fontWeight: '500'
                        }}>
                            ✘ {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* AI Summary Section */}
            {job.aiSummary && (
                <div style={{ 
                    marginTop: '18px', 
                    padding: '14px', 
                    background: 'rgba(100, 108, 255, 0.08)', 
                    borderRadius: '14px',
                    borderLeft: '4px solid #646cff',
                    fontSize: '0.88rem',
                    lineHeight: '1.4',
                    color: '#ddd'
                }}>
                    <strong style={{ color: '#818cf8' }}>AI Insights:</strong> {job.aiSummary}
                </div>
            )}

            {/* Action Buttons Row */}
            <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center' 
            }}>
                <button 
    // Check this line for the 'joapplied' typo!
    className={job.applied ? "applied-btn" : "quick-apply-btn"}
    disabled={job.applied}
    onClick={() => !job.applied && onApply(job._id, job.matchScore)}
>
    {job.applied ? "Applied ✓" : "Quick Apply 🚀"}
</button>

                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc',
                        padding: '12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: '0.3s'
                    }}
                >
                    {isExpanded ? 'Hide Info' : 'Details'}
                </button>
            </div>

            {/* Description Deatils */}
            {/* Description Details (Ensure the field name matches your MongoDB "description") */}
{isExpanded && (
    <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '12px',
        display: 'block', // Force display
        maxHeight: 'none', // Remove any restrictions
        overflow: 'visible'
    }}>
        <p style={{ 
            fontSize: '0.95rem', 
            color: '#eee', 
            lineHeight: '1.6', 
            margin: 0,
            whiteSpace: 'pre-wrap' // Keeps formatting
        }}>
            {job.description || "No description provided for this position."}
        </p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
            <span style={{color: '#888'}}>Type: <b style={{color: '#ccc'}}>{job.jobType}</b></span>
            <span style={{color: '#888'}}>Level: <b style={{color: '#ccc'}}>{job.experienceLevel}</b></span>
        </div>
    </div>
)}
        </div>
    );
};

export default JobCard;