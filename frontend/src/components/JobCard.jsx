import React, { useState } from 'react';

const JobCard = ({ job }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Color logic for the match score gauge
    const getScoreColor = (score) => {
        if (score >= 80) return '#4caf50'; // Green for high match
        if (score >= 50) return '#ff9800'; // Orange for partial
        return '#f44336'; // Red for low
    };

    return (
        <div className="job-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            color: '#fff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{job.title}</h3>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>📍 {job.location}</p>
                </div>
                
                {/* Match Score Gauge */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: `4px solid ${getScoreColor(job.matchScore)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {job.matchScore}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Match</span>
                </div>
            </div>

           {/* // ... inside your JobCard return, update the Skill Analysis section: */}
<div style={{ marginTop: '15px' }}>
    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>Skill Analysis:</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {/* Render Matched Skills (Green) */}
        {job.matchedSkills?.map((skill, index) => (
            <span key={`match-${index}`} style={{
                padding: '4px 12px',
                background: 'rgba(76, 175, 80, 0.15)',
                color: '#81c784',
                borderRadius: '20px',
                fontSize: '0.8rem',
                border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
                ✔ {skill}
            </span>
        ))}

        {/* NEW: Render Missing Skills (Red) */}
        {job.missingSkills?.map((skill, index) => (
            <span key={`miss-${index}`} style={{
                padding: '4px 12px',
                background: 'rgba(244, 67, 54, 0.15)',
                color: '#ef5350',
                borderRadius: '20px',
                fontSize: '0.8rem',
                border: '1px solid rgba(244, 67, 54, 0.3)'
            }}>
                ✘ {skill}
            </span>
        ))}
    </div>
</div>

            {/* AI Summary Section */}
            {job.aiSummary && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '12px', 
                    background: 'rgba(100, 108, 255, 0.1)', 
                    borderRadius: '10px',
                    borderLeft: '4px solid #646cff',
                    fontSize: '0.9rem'
                }}>
                    {job.aiSummary}
                </div>
            )}

            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    marginTop: '15px',
                    background: 'none',
                    border: 'none',
                    color: '#646cff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: 0
                }}
            >
                {isExpanded ? '🔼 Show Less' : '🔽 View Details'}
            </button>

            {isExpanded && (
                <div style={{ 
                    marginTop: '15px', 
                    paddingTop: '15px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}>
                    <p style={{ color: '#ccc', lineHeight: '1.5' }}>{job.description}</p>
                    <div style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        marginTop: '10px', 
                        fontSize: '0.85rem', 
                        color: '#aaa' 
                    }}>
                        <span><strong>Type:</strong> {job.jobType || 'Full-time'}</span>
                        <span><strong>Level:</strong> {job.experienceLevel || 'Entry'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;