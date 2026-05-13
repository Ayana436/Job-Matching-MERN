import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const CandidateView = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [resume, setResume] = useState(null);
    const [error, setError] = useState('');

    // Logged-in user
    const user = JSON.parse(localStorage.getItem('user'));

    // Fetch all jobs on page load
    useEffect(() => {
        fetchJobs();
    }, []);

    // ---------------- FETCH ALL JOBS ----------------
    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/jobs');

            // Fetch candidate applications
            let appliedJobIds = [];

            if (user?.id) {
                try {
                    const appRes = await axios.get(`/api/jobs/my-applications/${user.id}`);
                    appliedJobIds = appRes.data.map(app => app.jobId?._id || app.jobId);
                } catch (err) {
                    console.error('Application fetch error:', err);
                }
            }

            const updatedJobs = res.data.map(job => ({
                ...job,
                applied: appliedJobIds.includes(job._id)
            }));

            setJobs(updatedJobs);
        } catch (err) {
            console.error(err);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    // ---------------- SEARCH JOBS ----------------
    const handleSearch = async () => {
        try {
            setLoading(true);

            const res = await axios.get(`/api/jobs/search?q=${search}`);

            let appliedJobIds = [];

            if (user?.id) {
                const appRes = await axios.get(`/api/jobs/my-applications/${user.id}`);
                appliedJobIds = appRes.data.map(app => app.jobId?._id || app.jobId);
            }

            const updatedJobs = res.data.map(job => ({
                ...job,
                applied: appliedJobIds.includes(job._id)
            }));

            setJobs(updatedJobs);
        } catch (err) {
            console.error(err);
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    // ---------------- RESUME MATCHING ----------------
    const handleResumeUpload = async () => {
        if (!resume) {
            alert('Please upload a PDF resume');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('resume', resume);

            const res = await axios.post('/api/jobs/match-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            let appliedJobIds = [];

            if (user?.id) {
                const appRes = await axios.get(`/api/jobs/my-applications/${user.id}`);
                appliedJobIds = appRes.data.map(app => app.jobId?._id || app.jobId);
            }

            const updatedJobs = res.data.map(job => ({
                ...job,
                applied: appliedJobIds.includes(job._id)
            }));

            setJobs(updatedJobs);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Resume matching failed');
        } finally {
            setLoading(false);
        }
    };

    // ---------------- QUICK APPLY ----------------
    const handleApply = async (jobId, matchScore) => {
        try {
            if (!user?.id) {
                alert('Please login first');
                return false;
            }

            const selectedJob = jobs.find(job => job._id === jobId);

            const payload = {
                jobId,
                candidateId: user.id,
                matchScore: matchScore || 0,
                candidateSkills: selectedJob?.matchedSkills || []
            };

            const res = await axios.post('/api/jobs/apply', payload);

            // Update UI instantly
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job._id === jobId
                        ? { ...job, applied: true }
                        : job
                )
            );

            alert(res.data.message);
            return true;
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Application failed');
            return false;
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0f172a',
                padding: '30px',
                color: '#fff'
            }}
        >
            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <h1
                    style={{
                        fontSize: '2.5rem',
                        marginBottom: '10px',
                        background: 'linear-gradient(to right, #60a5fa, #818cf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    AI Smart Job Matching Portal
                </h1>

                <p style={{ color: '#aaa' }}>
                    Upload your resume or search jobs manually
                </p>
            </div>

            {/* SEARCH + RESUME */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    marginBottom: '30px',
                    justifyContent: 'center'
                }}
            >
                <input
                    type='text'
                    placeholder='Search by skills, title, location...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        background: '#1e293b',
                        color: '#fff',
                        width: '320px',
                        outline: 'none'
                    }}
                />

                <button
                    onClick={handleSearch}
                    style={{
                        padding: '14px 22px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#6366f1',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Search
                </button>

                <input
                    type='file'
                    accept='.pdf'
                    onChange={(e) => setResume(e.target.files[0])}
                    style={{
                        color: '#fff'
                    }}
                />

                <button
                    onClick={handleResumeUpload}
                    style={{
                        padding: '14px 22px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#10b981',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Upload Resume
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div
                    style={{
                        background: '#7f1d1d',
                        color: '#fecaca',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}
                >
                    {error}
                </div>
            )}

            {/* LOADING */}
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>Loading jobs...</h2>
                </div>
            ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>No jobs found</h2>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                        gap: '20px'
                    }}
                >
                    {jobs.map(job => (
                        <JobCard
                            key={job._id}
                            job={job}
                            onApply={handleApply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateView;