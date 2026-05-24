# API Testing Results

Test date: 2026-05-24

Base URL: `http://127.0.0.1:5000`

## Summary

Overall result: PASS

The tested workflow confirms that the project supports recruiter authentication, candidate authentication, job posting, resume PDF upload, AI/NLP job matching, candidate application submission, recruiter applicant ranking, analytics, and role-based security.

## Evidence

### 1. Health Check

Endpoint: `GET /api/health`

Result:
```json
{
  "api": "running",
  "database": "connected"
}
```

### 2. Authentication

Endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`

Result:
```json
{
  "recruiterRole": "recruiter",
  "candidateRole": "candidate"
}
```

### 3. Recruiter Job Posting

Endpoint: `POST /api/jobs`

Authorization: Recruiter JWT

Result:
```json
{
  "status": "201 Created",
  "title": "MERN Full Stack Developer",
  "skills": ["React", "Node.js", "Express", "MongoDB"]
}
```

### 4. Job Search

Endpoint: `GET /api/jobs/search?q=React,Node.js`

Result:
```json
{
  "topTitle": "MERN Full Stack Developer",
  "topScore": 50,
  "matchedSkills": ["React", "Node.js"]
}
```

### 5. Resume PDF AI Matching

Endpoint: `POST /api/jobs/match-pdf`

Authorization: Candidate JWT

Uploaded PDF: `1778604306500-Zainab Duurani mern Fullstack Resume.pdf`

Result:
```json
{
  "topTitle": "MERN Full Stack Developer",
  "matchScore": 69,
  "skillScore": 100,
  "semanticScore": 22,
  "matchedSkills": ["React", "Node.js", "Express", "MongoDB"],
  "rankingReason": "Strong candidate with relevant experience."
}
```

### 6. Candidate Application

Endpoint: `POST /api/jobs/apply`

Authorization: Candidate JWT

Result:
```json
{
  "message": "Application submitted successfully!",
  "candidateApplicationCount": 1
}
```

### 7. Recruiter Applicant Ranking

Endpoint: `GET /api/jobs/applicants`

Authorization: Recruiter JWT

Result:
```json
{
  "candidate": "Report Candidate",
  "recommendation": "Consider",
  "matchScore": 69
}
```

### 8. Application Status Update

Endpoint: `PATCH /api/jobs/applicants/:id`

Authorization: Recruiter JWT

Result:
```json
{
  "statusAfterPatch": "reviewed"
}
```

### 9. Analytics

Endpoints:
- `GET /api/analytics/applicants-per-job`
- `GET /api/analytics/acceptance-ratio`
- `GET /api/analytics/top-skills`
- `GET /api/analytics/application-trends`

Result:
```json
{
  "applicantsPerJob": [
    {
      "jobTitle": "MERN Full Stack Developer",
      "applicants": 1
    }
  ],
  "acceptanceRatio": {
    "total": 1,
    "accepted": 0,
    "rejected": 0,
    "pending": 0,
    "reviewed": 1
  },
  "topSkills": ["React", "Node.js", "Express", "MongoDB"],
  "trends": [
    {
      "date": "24/5/2026",
      "applications": 1
    }
  ]
}
```

### 10. Error And Security Tests

Result:
```json
{
  "invalidStatusHttp": 400,
  "candidatePostJobHttp": 403
}
```

## Build Verification

Frontend production build:

```text
npm run build
Result: PASS
Vite built the React application successfully.
```

Backend syntax checks:

```text
node --check server.js
node --check routes/jobRoutes.js
node --check routes/authRoutes.js
node --check controllers/analyticsController.js
Result: PASS
```

## Notes

- The Vite build shows a chunk-size warning because the frontend bundle is larger than 500 kB. This is not a failure.
- The API tests used real local server requests and the configured MongoDB connection.
