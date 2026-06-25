# AI Job Matching API Endpoint Testing Guide

Base URL:

```text
http://localhost:5000
```

Frontend URL:

```text
http://localhost:5173
```

## Before Testing

1. Start MongoDB or confirm MongoDB Atlas connection is active.
2. Start backend:

```bash
cd backend
npm start
```

3. Start frontend:

```bash
cd frontend
npm run dev
```

4. Keep these variables from responses:

```text
RECRUITER_TOKEN
CANDIDATE_TOKEN
ADMIN_TOKEN
JOB_ID
CANDIDATE_ID
APPLICATION_ID
RESUME_HISTORY_ID
RESUME_FILENAME
```

## Recommended Testing Order

### 1. Health Check

Method: `GET`

Endpoint:

```text
/api/health
```

Expected:

```json
{
  "api": "running",
  "database": "connected"
}
```

### 2. Register Recruiter

Method: `POST`

Endpoint:

```text
/api/auth/register
```

Body:

```json
{
  "name": "Test Recruiter",
  "email": "recruiter@test.com",
  "password": "Password123",
  "role": "recruiter"
}
```

Expected: `201 Created`

### 3. Register Candidate

Method: `POST`

Endpoint:

```text
/api/auth/register
```

Body:

```json
{
  "name": "Test Candidate",
  "email": "candidate@test.com",
  "password": "Password123",
  "role": "candidate"
}
```

Expected: `201 Created`

### 4. Optional Admin Registration

Only test this if `ADMIN_SIGNUP_CODE` is set in backend environment.

Method: `POST`

Endpoint:

```text
/api/auth/register
```

Body:

```json
{
  "name": "Test Admin",
  "email": "admin@test.com",
  "password": "Password123",
  "role": "admin",
  "adminCode": "YOUR_ADMIN_SIGNUP_CODE"
}
```

Expected: `201 Created`

### 5. Login Recruiter

Method: `POST`

Endpoint:

```text
/api/auth/login
```

Body:

```json
{
  "email": "recruiter@test.com",
  "password": "Password123"
}
```

Save `token` as `RECRUITER_TOKEN`.

### 6. Login Candidate

Method: `POST`

Endpoint:

```text
/api/auth/login
```

Body:

```json
{
  "email": "candidate@test.com",
  "password": "Password123"
}
```

Save:

```text
CANDIDATE_TOKEN = token
CANDIDATE_ID = user.id
```

### 7. Create Job Posting

Role: Recruiter or Admin

Method: `POST`

Endpoint:

```text
/api/jobs
```

Header:

```text
Authorization: Bearer RECRUITER_TOKEN
```

Body:

```json
{
  "title": "MERN Full Stack Developer",
  "company": "Test Company",
  "description": "Build REST APIs with Node.js, Express, MongoDB and React user interfaces.",
  "requiredSkills": ["React", "Node.js", "Express", "MongoDB"],
  "location": "Remote",
  "workMode": "Remote",
  "jobType": "Full-time",
  "experienceLevel": "Entry Level",
  "salary": "INR 50,000"
}
```

Save `_id` as `JOB_ID`.

### 8. Get All Jobs

Method: `GET`

Endpoint:

```text
/api/jobs
```

Expected: Array of jobs.

### 9. Search Jobs

Method: `GET`

Endpoint:

```text
/api/jobs/search?q=React,Node.js
```

Expected:

```json
[
  {
    "title": "MERN Full Stack Developer",
    "matchScore": 50,
    "matchedSkills": ["React", "Node.js"]
  }
]
```

## Six Important Remaining API Checks

Use these six if you already tested login, job creation, and basic job listing.

### 10. Resume PDF Match

Role: Candidate

Method: `POST`

Endpoint:

```text
/api/jobs/match-pdf
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Body type: `form-data`

Field:

```text
resume = your PDF file
```

Expected:

```json
[
  {
    "matchScore": 69,
    "skillScore": 100,
    "semanticScore": 22,
    "matchedSkills": ["React", "Node.js", "Express", "MongoDB"],
    "missingSkills": [],
    "rankingReason": "Strong candidate with relevant experience."
  }
]
```

### 11. Get Resume History

Role: Candidate

Method: `GET`

Endpoint:

```text
/api/jobs/resume-history
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Expected:

```json
{
  "history": [
    {
      "_id": "RESUME_HISTORY_ID",
      "fileName": "resume.pdf",
      "filePath": "/uploads/filename.pdf",
      "topMatchScore": 69,
      "totalMatches": 1
    }
  ]
}
```

Save:

```text
RESUME_HISTORY_ID = history[0]._id
RESUME_FILENAME = filePath last segment
```

### 12. Apply For Job

Role: Candidate

Method: `POST`

Endpoint:

```text
/api/jobs/apply
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Body:

```json
{
  "jobId": "JOB_ID",
  "matchScore": 69,
  "candidateSkills": ["React", "Node.js", "Express", "MongoDB"]
}
```

Expected:

```json
{
  "success": true,
  "message": "Application submitted successfully!"
}
```

### 13. Candidate Application History

Role: Candidate

Method: `GET`

Endpoint:

```text
/api/jobs/my-applications/CANDIDATE_ID
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Expected: Candidate's applications with populated job data.

### 14. Recruiter Applicant Ranking

Role: Recruiter or Admin

Method: `GET`

Endpoint:

```text
/api/jobs/applicants
```

Header:

```text
Authorization: Bearer RECRUITER_TOKEN
```

Expected: Ranked applicant array.

Save:

```text
APPLICATION_ID = response[0]._id
```

### 15. Update Application Status

Role: Recruiter or Admin

Method: `PATCH`

Endpoint:

```text
/api/jobs/applicants/APPLICATION_ID
```

Header:

```text
Authorization: Bearer RECRUITER_TOKEN
```

Body:

```json
{
  "status": "reviewed"
}
```

Other valid statuses:

```text
pending
reviewed
accepted
rejected
```

Expected: Updated application object.

### 16. Delete Resume History Item

Role: Candidate

Method: `DELETE`

Endpoint:

```text
/api/jobs/resume/RESUME_HISTORY_ID
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Expected:

```json
{
  "message": "Resume deleted successfully",
  "deletedResumeId": "RESUME_HISTORY_ID"
}
```

UI expected result: deleted resume card disappears immediately.

## Analytics Endpoints

### 17. Applicants Per Job

Role: Recruiter or Admin

Method: `GET`

Endpoint:

```text
/api/analytics/applicants-per-job
```

Expected:

```json
[
  {
    "jobTitle": "MERN Full Stack Developer",
    "applicants": 1
  }
]
```

### 18. Acceptance Ratio

Role: Recruiter or Admin

Method: `GET`

Endpoint:

```text
/api/analytics/acceptance-ratio
```

Expected:

```json
{
  "total": 1,
  "accepted": 0,
  "rejected": 0,
  "pending": 0,
  "reviewed": 1
}
```

### 19. Top Skills

Role: Recruiter or Admin

Method: `GET`

Endpoint:

```text
/api/analytics/top-skills
```

Expected:

```json
[
  {
    "skill": "React",
    "count": 1,
    "name": "React",
    "value": 1
  }
]
```

### 20. Application Trends

Role: Recruiter or Admin

Method: `GET`

Endpoint:

```text
/api/analytics/application-trends
```

Expected:

```json
[
  {
    "date": "7/6/2026",
    "applications": 1
  }
]
```

## Negative Tests For Report

### Candidate Cannot Post Job

Method: `POST`

Endpoint:

```text
/api/jobs
```

Header:

```text
Authorization: Bearer CANDIDATE_TOKEN
```

Expected: `403 Forbidden`

### Invalid Application Status

Method: `PATCH`

Endpoint:

```text
/api/jobs/applicants/APPLICATION_ID
```

Body:

```json
{
  "status": "bad-status"
}
```

Expected: `400 Bad Request`

### Apply Without Resume Skills

Method: `POST`

Endpoint:

```text
/api/jobs/apply
```

Body:

```json
{
  "jobId": "JOB_ID",
  "matchScore": 0,
  "candidateSkills": []
}
```

Expected: `400 Bad Request`

## Report Evidence Checklist

For each endpoint, capture:

- Endpoint and method.
- Request body.
- Status code.
- Response JSON.
- Screenshot from Postman/Thunder Client/browser console.

Recommended report order:

1. Health check.
2. Auth register/login.
3. Recruiter job posting.
4. Candidate resume match.
5. Candidate apply.
6. Recruiter applicant ranking.
7. Status update.
8. Analytics.
9. Negative tests.
