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

                    {job.confidence && (
                        <span className="confidence-pill">
                            {job.confidence}% confidence
                        </span>
                    )}
                </div>
            </div>

            {(job.matchedSkills?.length > 0 ||
                job.missingSkills?.length > 0) && (
                <div className="skill-chips">

                    {job.matchedSkills?.map((skill) => (
                        <span
                            key={`match-${skill}`}
                            className="chip match"
                        >
                            Match: {skill}
                        </span>
                    ))}

                    {job.missingSkills?.map((skill) => (
                        <span
                            key={`missing-${skill}`}
                            className="chip missing"
                        >
                            Missing: {skill}
                        </span>
                    ))}
                </div>
            )}

            {job.aiSummary && (
                <div className="ai-summary">
                    <strong>AI Insights:</strong> {job.aiSummary}
                </div>
            )}

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