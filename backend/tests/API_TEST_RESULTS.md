# API Testing Results

## 1. Job Posting API

Endpoint:
POST /api/jobs

Status:
PASS

Tested Features:
- Recruiter authentication
- Job creation
- Required skills parsing
- Salary handling

Expected Result:
Job should be saved in MongoDB.

Actual Result:
Job successfully created and returned in response.

---

## 2. Resume Matching API

Endpoint:
POST /api/jobs/match-pdf

Status:
PASS

Tested Features:
- PDF upload
- Resume parsing
- NLP keyword extraction
- AI score generation
- Skill matching

Expected Result:
Relevant jobs should return sorted by matchScore.

Actual Result:
Jobs returned successfully with:
- matchScore
- matchedSkills
- missingSkills
- rankingReason
- aiSummary

---

## 3. Candidate Apply API

Endpoint:
POST /api/jobs/apply

Status:
PASS

Tested Features:
- Candidate authentication
- Duplicate application prevention
- AI score storage

Expected Result:
Application should be stored once.

Actual Result:
Application successfully stored.

---

## 4. Recruiter Applicant Retrieval

Endpoint:
GET /api/jobs/applicants

Status:
PASS

Tested Features:
- Recruiter-only access
- Candidate ranking
- Match score sorting

Expected Result:
Recruiter should see ranked candidates.

Actual Result:
Applications successfully ranked and displayed.

---

## 5. Application Status Update

Endpoint:
PATCH /api/jobs/applicants/:id

Status:
PASS

Tested Features:
- Accept/reject update
- Recruiter authorization

Expected Result:
Application status should update.

Actual Result:
Status updated successfully.

---

## 6. Error Handling Tests

Tested Scenarios:
- Invalid routes
- Missing PDF upload
- Unauthorized access
- Duplicate applications
- Large file upload

Result:
All handled successfully with proper error responses.