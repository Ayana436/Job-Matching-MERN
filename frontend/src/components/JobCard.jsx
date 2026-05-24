import { useEffect, useState } from "react";

const JobCard = ({
    job,
    onApply,
    isSaved = false,
    onToggleSave,
    applicationStatus
}) => {

    const [isExpanded, setIsExpanded] = useState(false);

    const [currentStatus, setCurrentStatus] = useState(
        applicationStatus || (job.applied ? "Pending" : null)
    );

    useEffect(() => {
        setCurrentStatus(
            applicationStatus || (job.applied ? "Pending" : null)
        );
    }, [applicationStatus, job.applied]);

    const getScoreColor = (score = 0) => {
        if (score >= 80) return "#4caf50";
        if (score >= 50) return "#ff9800";
        return "#f44336";
    };

    const matchScore = job.matchScore ?? 0;

    const matchedCount = job.matchedSkills?.length || 0;

    const missingCount = job.missingSkills?.length || 0;

    const totalSkills =
        matchedCount + missingCount;

    const skillCoverage =
        totalSkills > 0
            ? Math.round(
                (matchedCount / totalSkills) * 100
            )
            : 0;

    const getButtonText = () => {
        if (!currentStatus) return "Quick Apply";

        if (currentStatus === "Pending") {
            return "Pending Review";
        }

        if (currentStatus === "Accepted") {
            return "Accepted";
        }

        if (currentStatus === "Rejected") {
            return "Rejected";
        }

        return "Applied";
    };

    const getButtonClass = () => {
        if (!currentStatus) return "quick-apply-btn";

        return `status-btn ${currentStatus.toLowerCase()}`;
    };

    return (
        <div className="job-card">

            <div className="job-card-top">

                <div>
                    <div className="job-title-row">
                        <h3>{job.title}</h3>

                        <span className="job-mode-badge">
                            {job.workMode || "Office"}
                        </span>
                    </div>

                    <p className="muted-text">
                        Location: {job.location}
                    </p>

                    <p className="salary-text">
                        Salary: {job.salary || "Negotiable"}
                    </p>
                </div>

                <div className="match-stack">

                    {onToggleSave && (
                        <button
                            type="button"
                            className={
                                isSaved
                                    ? "save-job-btn saved"
                                    : "save-job-btn"
                            }
                            onClick={() => onToggleSave(job._id)}
                            title={
                                isSaved
                                    ? "Remove saved job"
                                    : "Save job"
                            }
                        >
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    )}

                    <div
                        className="match-circle"
                        style={{
                            borderColor: getScoreColor(matchScore)
                        }}
                    >
                        {matchScore}%
                    </div>

                    <span className="match-label">
                        Match
                    </span>
                        <span className="ats-score-text">
                    {matchScore >= 80
                        ? "Strong Match"
                        : matchScore >= 60
                        ? "Good Match"
                        : matchScore >= 40
                        ? "Average Match"
                        : "Low Match"}
                        </span>

                    {job.confidence && (
                        <span className="confidence-pill">
                            {job.confidence}% confidence
                        </span>
                    )}
                </div>
            </div>

            {/* AI EXPLANATION SECTION */}

{job.matchScore > 0 && (

<div className="ai-explanation-box">

    <div className="ai-explanation-header">
        <h4>AI Match Analysis</h4>

        <span className="confidence-badge">
            {job.confidence || job.matchScore}% Confidence
        </span>
    </div>

    <p className="ai-ranking-reason">
        {job.rankingReason ||
            "This job matches your uploaded resume based on skills and semantic relevance."}
    </p>

    {/* MATCHED SKILLS */}
    {job.matchedSkills?.length > 0 && (

        <div className="skills-section">

            <h5>Matched Skills</h5>

            <div className="skills-tags">

                {job.matchedSkills.map((skill, index) => (

                <div
                    key={index}
                    className="skill-tag matched"
                >
                    {skill}
                </div>

                ))}

            </div>

        </div>
    )}

    {/* MISSING SKILLS */}
    {job.missingSkills?.length > 0 && (

        <div className="skills-section">

            <h5>Missing Skills</h5>

            <div className="skills-tags">

                {job.missingSkills
                    .slice(0, 5)
                    .map((skill, index) => (

                    <div
                            key={index}
                            className="skill-tag missing"
                        >
                            {skill}
                        </div>

                ))}

            </div>

        </div>
    )}

    {/* SCORE BARS */}

    <div className="score-breakdown">

        <div className="score-item">

            <span>Skill Match</span>

            <div className="score-bar">

                <div
                    className="score-fill skill-fill"
                    style={{
                        width: `${job.skillScore || 0}%`
                    }}
                />

            </div>

            <strong>
                {job.skillScore || 0}%
            </strong>

        </div>

        <div className="score-item">

            <span>Semantic Match</span>

            <div className="score-bar">

                <div
                    className="score-fill semantic-fill"
                    style={{
                        width: `${job.semanticScore || 0}%`
                    }}
                />

            </div>

            <strong>
                {job.semanticScore || 0}%
            </strong>

        </div>

    </div>

</div>

)}


            {(job.matchedSkills?.length > 0 ||
                job.missingSkills?.length > 0) && (

                <div className="ai-analysis-panel">

                    <div className="analysis-header">

                        <strong>AI Skill Analysis</strong>

                        <span className="coverage-pill">
                            {skillCoverage}% Skill Coverage
                        </span>

                    </div>

                {job.matchedSkills?.length > 0 && (
                        <div className="skills-group">

                            <p className="skills-title success">
                                Matched Skills ({matchedCount})
                            </p>

                            <div className="skill-chips">
                                {job.matchedSkills.map((skill) => (
                                    <span
                                        key={`match-${skill}`}
                                        className="chip match"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                        </div>
                    )}

                {job.missingSkills?.length > 0 && (
                        <div className="skills-group">

                            <p className="skills-title danger">
                                Missing Skills ({missingCount})
                            </p>

                            <div className="skill-chips">
                                {job.missingSkills.map((skill) => (
                                    <span
                                        key={`missing-${skill}`}
                                        className="chip missing"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                        </div>
                    )}

                </div>
            )}

            <div className="ai-summary">
                <div className="summary-header">
                    AI Recommendation
                </div>
                <p>
                    {job.aiSummary}
                </p>
            </div>

            <div className="job-card-actions">

                <button
                    className={getButtonClass()}
                    disabled={!!currentStatus}
                    onClick={async () => {

                        if (currentStatus) return;

                        const success = await onApply(
                            job._id,
                            matchScore
                        );

                        if (success) {
                            setCurrentStatus("Pending");
                        }
                    }}
                >
                    {getButtonText()}
                </button>

                <button
                    className="details-btn"
                    onClick={() =>
                        setIsExpanded((value) => !value)
                    }
                >
                    {isExpanded ? "Hide Info" : "Details"}
                </button>

            </div>

            {isExpanded && (
                <div className="details-panel">

                    <p>
                        {job.description ||
                            "No description provided for this position."}
                    </p>

                    <div className="job-meta-row">

                        <span>
                            Type: <b>{job.jobType}</b>
                        </span>

                        <span>
                            Level: <b>{job.experienceLevel}</b>
                        </span>

                        <span>
                            Salary: <b>{job.salary || "Negotiable"}</b>
                        </span>

                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;