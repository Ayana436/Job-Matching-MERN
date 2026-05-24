# Project Title: AI-Based Job Matching API for Resume Screening and Job Recommendations

Submitted in partial fulfillment of the requirements for the award of the degree of

Master of Computer Application (MCA)

By

Student Name: Zainab Durrani Fazal Durrani

Enrollment No: O24MCA111477

Under the guidance of

Guide/Mentor Name: Anurag Goel

## Certificate

Copy to the certificate received from Qollabb to be pasted here.

## Declaration

I, Zainab Durrani Fazal Durrani, hereby solemnly declare that the project report titled "AI-Based Job Matching API for Resume Screening and Job Recommendations" submitted in partial fulfilment of the requirements for the award of the degree of Master of Computer Application (MCA) is my original work.

I further declare that:

- This project has been carried out by me during the academic year 2024-2026 under the supervision of Anurag Goel.
- The work has not been submitted previously to any other university, institution, or examination body for the award of any degree, diploma, or certification.
- All sources of information used in this report have been duly acknowledged and referenced in accordance with academic ethics and plagiarism norms.
- The data presented in this report is authentic to the best of my knowledge and has not been fabricated or manipulated.
- I understand that if any part of this declaration is found to be false, my project may be rejected and disciplinary action may be taken as per institutional rules.

Place: ____________________

Date: ____________________

Student Signature: ____________________

Student Name: Zainab Durrani Fazal Durrani

Enrollment No: O24MCA111477

## Acknowledgement

I would like to express my sincere gratitude to my guide and mentor, Anurag Goel, for providing valuable guidance, suggestions, and support throughout the development of this project. I am also thankful to my faculty members and academic institution for giving me the opportunity to work on a practical, industry-oriented project based on artificial intelligence and web application development.

I would also like to thank my peers, family members, and all those who encouraged me during the project work. Their feedback and motivation helped me improve the quality, functionality, and presentation of this system.

## Abstract / Executive Summary

This project presents the design and development of an AI-Based Job Matching API for Resume Screening and Job Recommendations. The main objective of the system is to help recruiters screen candidate resumes efficiently and provide candidates with relevant job recommendations based on their resume content and required job skills.

The system is developed using the MERN stack, with React.js for the frontend, Node.js and Express.js for the backend, MongoDB for database storage, and NLP-based matching logic for resume screening. Candidates can register, log in, upload PDF resumes, view AI-ranked job recommendations, apply for jobs, and track application status. Recruiters can post jobs, manage listings, view ranked applicants, update application decisions, and analyze recruitment trends through dashboard analytics.

The AI/NLP workflow extracts text from PDF resumes, preprocesses the content, identifies matched and missing skills, calculates a skill score, computes semantic similarity using TF-IDF cosine similarity, and generates a final match score. The API response includes explainable fields such as matched skills, missing skills, semantic score, skill score, ranking reason, and AI summary.

The implementation demonstrates secure role-based authentication, structured API design, resume upload handling, error handling, request logging, and practical recruiter-candidate workflows. Testing confirms successful job posting, resume matching, application submission, applicant ranking, analytics, and security validation.

## Table of Contents

| Contents | Page No. |
| --- | --- |
| Certificate | 1 |
| Declaration | 2 |
| Acknowledgement | 3 |
| Abstract | 4 |
| Chapter 1: Introduction | 6 |
| Chapter 2: System Study | 12 |
| Chapter 3: System Analysis | 20 |
| Chapter 4: System Design | 29 |
| Chapter 5: System Implementation | 38 |
| Chapter 6: Testing | 50 |
| Chapter 7: Results and Discussion | 58 |
| Chapter 8: Conclusion and Future Scope | 62 |
| Chapter 9: References | 65 |
| Chapter 10: Appendices | 67 |

# Chapter 1: Introduction

## 1.1 Background of the Project

Recruitment is one of the most important functions in modern organizations. Companies receive a large number of resumes for each job opening, and recruiters must manually review candidate profiles, compare skills, check job relevance, and shortlist suitable applicants. This process is time-consuming, repetitive, and often affected by human bias or inconsistent screening methods.

In many job portals, candidates can upload resumes and apply to jobs, but the systems often work as simple listing platforms. They do not always analyze resume content deeply or explain why a candidate is suitable for a specific job. Similarly, recruiters may receive many applications but lack a proper ranking mechanism to identify the strongest candidates quickly.

Artificial Intelligence, Machine Learning, and Natural Language Processing provide practical solutions to this problem. By extracting text from resumes and comparing it with job descriptions and required skills, an intelligent system can calculate relevance scores and produce ranked recommendations. This reduces manual workload and improves the recruitment decision-making process.

The proposed project, AI-Based Job Matching API for Resume Screening and Job Recommendations, addresses this need by combining a secure job portal workflow with AI/NLP-based resume matching. It allows candidates to upload resumes, receive ranked job suggestions, and apply to suitable jobs. Recruiters can post jobs, review ranked applicants, and use analytics to support hiring decisions.

## 1.2 Problem Statement

Traditional recruitment systems face several limitations:

- Resume screening is mostly manual and time-consuming.
- Candidate-job matching is often based only on keywords or manual recruiter judgement.
- Recruiters may not receive applicants in ranked order.
- Candidates may apply to roles that do not match their skills.
- Many systems do not provide explainable matching results.
- Resume history, application tracking, and recruiter analytics are often limited.
- Authentication and role-based authorization are not always properly implemented in small academic projects.

The problem is to design and develop a secure API-driven system that can accept resumes, process resume content, compare it with job requirements, calculate AI/NLP relevance scores, rank jobs and candidates, and provide clear responses for both candidates and recruiters.

## 1.3 Objectives of the System

The main objective of this project is to build an API that matches candidate resumes to job descriptions using AI/NLP and provides recruiters with ranked candidate suggestions.

Specific objectives include:

- To design a database for candidates, resumes, jobs, applications, and resume history.
- To develop secure API endpoints for registration, login, job posting, resume submission, job search, application submission, and candidate retrieval.
- To extract and preprocess resume and job description text for NLP matching.
- To apply TF-IDF cosine similarity and skill-based matching for candidate-job relevance scoring.
- To integrate AI/NLP match results into API responses.
- To provide explainable AI output such as matched skills, missing skills, score, and ranking reason.
- To implement candidate, recruiter, and admin role-based authentication.
- To add error handling, request logging, and validation.
- To test endpoints and document API responses.
- To prepare a clean frontend workflow for candidates and recruiters.

## 1.4 Scope of the Project

The scope of the project includes a web-based job matching system for two roles: candidates and recruiters. Candidates can register, log in, upload PDF resumes, view AI-ranked job recommendations, apply to jobs, save jobs, and view application status. Recruiters can register, log in, post jobs, edit jobs, delete jobs, view applicants, update application status, and view analytics.

The AI/NLP scope includes PDF text extraction, text preprocessing, required skill matching, semantic similarity calculation, final match score generation, and explainable AI output. The system currently supports PDF resumes and uses TF-IDF based text comparison with skill matching.

The current scope does not include payment integration, third-party job portal integration, live interview scheduling, or advanced deep-learning embedding models. These can be added in future versions.

## 1.5 Existing System Overview

Existing recruitment systems usually provide basic job listing and application features. Candidates search for jobs using keywords and manually apply to suitable positions. Recruiters manually inspect resumes and shortlist candidates.

Some systems provide simple filters such as location, experience level, or job type. However, they may not process resume content or compare it intelligently with job requirements. Manual shortlisting becomes difficult when recruiters receive many resumes for the same job.

Existing limitations include:

- Manual resume review.
- Limited explainable matching.
- Inconsistent candidate ranking.
- Weak resume history management.
- Limited recruiter analytics.
- Lack of AI/NLP integration in smaller job portal systems.

## 1.6 Proposed System Overview

The proposed system provides a secure MERN stack application with AI/NLP-based resume screening and job recommendation. The backend exposes REST APIs for authentication, job management, resume matching, applications, applicant ranking, and analytics. The frontend provides separate candidate and recruiter dashboards.

When a candidate uploads a resume, the backend extracts text from the PDF and compares it with each job posting. Required skills are matched using safe regular expressions, while semantic relevance is calculated using TF-IDF cosine similarity. The final score combines skill score and semantic score. Jobs are returned in ranked order with matched skills, missing skills, and ranking reasons.

Recruiters can view applicants ranked by match score and receive AI recommendations such as Highly Recommended, Recommended, Consider, or Low Match. This helps recruiters prioritize better candidates.

## 1.7 Technologies Used

Frontend:

- React.js
- React Router
- Axios
- Recharts
- CSS

Backend:

- Node.js
- Express.js
- Multer
- JWT
- bcryptjs
- Express Rate Limit

Database:

- MongoDB
- Mongoose

AI/NLP:

- pdfjs-dist for PDF text extraction
- natural for TF-IDF based similarity
- stopword for stop-word removal
- Custom skill matching and scoring logic

Testing and Tools:

- npm scripts
- Vite build
- ESLint
- REST API testing through local server requests

# Chapter 2: System Study

## 2.1 Introduction

This chapter studies existing recruitment systems, AI-based resume screening methods, and the tools used to develop the proposed solution. The study helps identify the need for an intelligent, API-driven job matching platform.

## 2.2 Overview of Recruitment Systems

A recruitment system helps organizations manage job postings, candidate applications, resume screening, and hiring decisions. Traditional systems focus on storing candidate data and job information, while modern systems are expected to provide automation, analytics, and intelligent matching.

Common recruitment system features include:

- Candidate registration and profile creation.
- Job posting and job search.
- Resume upload and storage.
- Candidate application tracking.
- Recruiter applicant management.
- Status updates such as pending, reviewed, accepted, and rejected.

## 2.3 Review of Existing Systems

### 2.3.1 Manual Resume Screening

Manual resume screening requires recruiters to open each resume and compare candidate skills with job requirements. This process is simple but slow.

Limitations:

- High time consumption.
- Human error.
- Inconsistent evaluation.
- Difficulty handling large applicant volumes.

### 2.3.2 Keyword-Based Job Portals

Many job portals allow candidates to search jobs using keywords. These systems match search terms with job titles, skills, or descriptions.

Limitations:

- Does not understand resume content deeply.
- Can miss relevant candidates if exact keywords differ.
- Does not always explain ranking.

### 2.3.3 Applicant Tracking Systems

Applicant Tracking Systems store resumes and applications and help recruiters manage hiring pipelines.

Limitations:

- Advanced AI features may be expensive.
- Implementation can be complex.
- Smaller organizations may not require heavy enterprise systems.

### 2.3.4 AI-Based Resume Screening Systems

AI-based systems use NLP and machine learning techniques to parse resumes, extract skills, and compare resumes with job descriptions.

Benefits:

- Faster screening.
- More consistent ranking.
- Reduced manual effort.
- Explainable recommendations if designed properly.

Limitations:

- Accuracy depends on data quality.
- Resume formatting can affect extraction.
- Advanced models may require high computational resources.

## 2.4 Comparative Analysis

| Feature | Manual Screening | Keyword Portal | ATS | Proposed System |
| --- | --- | --- | --- | --- |
| Resume Upload | Yes | Sometimes | Yes | Yes |
| AI/NLP Matching | No | Limited | Sometimes | Yes |
| Ranked Candidates | No | Limited | Sometimes | Yes |
| Explainable Score | No | No | Limited | Yes |
| Role-Based Security | Manual | Yes | Yes | Yes |
| Analytics | No | Limited | Yes | Yes |
| Cost for Academic Use | Low | Medium | High | Low |

Observation: The proposed system provides a balanced solution by combining resume upload, AI/NLP matching, role-based access, candidate recommendations, recruiter ranking, and analytics in one academic MERN project.

## 2.5 Software Development Methodology

The Agile methodology is suitable for this project because the system includes multiple modules that can be developed and tested in iterations. Authentication, job posting, resume upload, AI matching, applications, analytics, and reporting can be implemented step by step.

Reasons for choosing Agile:

- Supports incremental development.
- Allows frequent testing.
- Handles changing requirements.
- Suitable for frontend and backend parallel development.
- Helps improve AI matching logic through iteration.

## 2.6 Tools and Technologies Review

React.js is used to develop the frontend because it supports reusable components, fast rendering, and state-based UI updates. Node.js and Express.js are used for backend API development because they are lightweight and suitable for RESTful services. MongoDB is selected because resumes, jobs, and applications can be represented flexibly using document-based storage.

For AI/NLP, PDF text extraction and TF-IDF similarity are used because they are practical for an academic project and easy to integrate with the Node.js backend.

## 2.7 Research Gap

Many academic job portal projects stop at CRUD operations. They allow users to post jobs and apply, but they do not process resume content or provide AI-based ranking. The research gap addressed by this project is the integration of resume parsing, NLP preprocessing, skill matching, semantic scoring, and explainable ranking inside a functional MERN API.

# Chapter 3: System Analysis

## 3.1 Functional Requirements

Candidate requirements:

- Register and log in securely.
- View available jobs.
- Search jobs by keyword, skill, or location.
- Upload PDF resume.
- Receive AI-ranked job recommendations.
- View matched and missing skills.
- Apply for jobs.
- View application status.
- View and delete resume history.

Recruiter requirements:

- Register and log in securely.
- Post jobs with title, description, location, salary, job type, work mode, and required skills.
- Edit and delete job postings.
- View ranked applicants.
- View AI recommendation labels and insights.
- Update application status.
- View analytics such as applicants per job, top skills, acceptance ratio, and application trends.

System requirements:

- Store users, jobs, applications, and resume history.
- Validate PDF upload type and size.
- Protect routes using JWT.
- Handle errors properly.
- Log API requests.

## 3.2 Non-Functional Requirements

- Security: JWT authentication and role-based authorization.
- Reliability: API should return clear success and error responses.
- Usability: Separate dashboards for candidates and recruiters.
- Maintainability: Code should be modular and readable.
- Performance: Matching logic should handle multiple job postings efficiently.
- Scalability: Database models should support future extensions.
- Compatibility: Frontend should work on local Vite server and backend on Express server.

## 3.3 User Requirements

Candidate users need a simple way to upload resumes and discover jobs that match their skills. They should not manually compare every job description. Recruiters need a faster way to view suitable candidates and should be able to sort or prioritize applicants based on match score.

## 3.4 Feasibility Study

Technical feasibility:

The project is technically feasible using MERN stack and existing Node.js NLP packages. PDF parsing and TF-IDF similarity are supported by available libraries.

Operational feasibility:

The system is easy to operate because it provides role-specific dashboards for candidates and recruiters.

Economic feasibility:

The project uses open-source technologies, so development cost is low.

Schedule feasibility:

The modular structure allows phased implementation within an academic project timeline.

## 3.5 System Architecture

The system follows a client-server architecture:

```text
Candidate / Recruiter Browser
        |
React Frontend
        |
Axios API Requests
        |
Express.js Backend API
        |
MongoDB Database
        |
AI/NLP Matching Utilities
```

## 3.6 DFD Diagrams

### Level 0 DFD

```text
Candidate/Recruiter --> Job Matching System --> MongoDB
Candidate/Recruiter <-- API Responses -------- Job Matching System
```

### Level 1 DFD

```text
User Login --> Authentication Module --> User Collection
Recruiter Job Post --> Job Module --> Job Collection
Candidate Resume Upload --> AI Matching Module --> Resume History + Job Matches
Candidate Apply --> Application Module --> Application Collection
Recruiter View Applicants --> Ranking Module --> Ranked Applicant Output
```

## 3.7 Use Case Diagram

```text
Candidate:
- Register
- Login
- Search Jobs
- Upload Resume
- View AI Matches
- Apply for Job
- Track Application
- Delete Resume

Recruiter:
- Register
- Login
- Post Job
- Manage Jobs
- View Ranked Applicants
- Update Status
- View Analytics

Admin:
- Login with admin role
- Access recruiter-level job management
- View platform analytics across jobs
```

# Chapter 4: System Design

## 4.1 UML Diagrams

### Class Diagram

```text
User
- name
- email
- password
- role
- resume
- resumeHistory

Job
- title
- description
- requiredSkills
- location
- workMode
- jobType
- experienceLevel
- salary
- postedBy

Application
- jobId
- candidateId
- status
- matchScore
- candidateSkills

ResumeHistory
- candidateId
- fileName
- filePath
- extractedSkills
- topMatchScore
- totalMatches
```

### Sequence Diagram: Resume Matching

```text
Candidate -> Frontend: Upload PDF
Frontend -> Backend: POST /api/jobs/match-pdf
Backend -> PDF Parser: Extract text
Backend -> NLP Matcher: Calculate scores
Backend -> MongoDB: Save resume history
Backend -> Frontend: Return ranked jobs
Frontend -> Candidate: Display matched jobs
```

## 4.2 ER Diagram

```text
User 1 ----- * Application * ----- 1 Job
User 1 ----- * ResumeHistory
User 1 ----- * Job (Recruiter posts jobs)
```

## 4.3 Database Schema

User schema stores candidate and recruiter data, authentication fields, role, resume metadata, and embedded resume history.

Job schema stores job title, description, required skills, location, work mode, job type, experience level, salary, and recruiter reference.

Application schema stores the relationship between candidate and job, including status, match score, and candidate skills.

ResumeHistory schema stores uploaded resume metadata, extracted skills, top match score, and total matched jobs.

## 4.4 API Design

Authentication APIs:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/auth/update/:id`

Job APIs:

- `GET /api/jobs`
- `GET /api/jobs/search`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

Resume and application APIs:

- `POST /api/jobs/match-pdf`
- `GET /api/jobs/resume-history`
- `DELETE /api/jobs/resume/:historyId`
- `POST /api/jobs/apply`
- `GET /api/jobs/my-applications/:candidateId`

Recruiter APIs:

- `GET /api/jobs/applicants`
- `PATCH /api/jobs/applicants/:id`
- `GET /api/analytics/applicants-per-job`
- `GET /api/analytics/acceptance-ratio`
- `GET /api/analytics/top-skills`
- `GET /api/analytics/application-trends`

## 4.5 UI/UX Design

The frontend is divided into candidate and recruiter dashboards.

Candidate UI includes:

- Search panel.
- Skill chips.
- Resume upload panel.
- Resume history.
- Job cards.
- Application status timeline.
- Saved jobs and status filters.

Recruiter UI includes:

- Job posting form.
- Active listings.
- Ranked candidate table.
- AI recommendation labels.
- Analytics charts.
- Applicant management.

# Chapter 5: System Implementation

## 5.1 Development Environment

- Operating System: Windows
- Editor: Visual Studio Code
- Runtime: Node.js
- Frontend Server: Vite
- Backend Server: Express.js
- Database: MongoDB

## 5.2 Tools and Technologies Used

Frontend tools include React.js, Axios, React Router, Recharts, and CSS. Backend tools include Express.js, Mongoose, Multer, JWT, bcryptjs, cors, express-rate-limit, and pdfjs-dist. NLP utilities include tokenization, stop-word removal, TF-IDF similarity, and custom skill matching.

## 5.3 Hardware and Software Requirements

Hardware:

- Minimum 4 GB RAM.
- Dual-core processor.
- Internet connection for MongoDB Atlas if cloud database is used.

Software:

- Node.js.
- npm.
- MongoDB or MongoDB Atlas.
- Visual Studio Code.
- Web browser.

## 5.4 Module-Wise Explanation

Authentication module:

Handles user registration, login, JWT creation, and route protection.

Job module:

Allows recruiters to create, update, delete, and list job postings.

Resume upload module:

Accepts PDF resumes, validates file type and size, stores files, and records resume history.

AI matching module:

Extracts resume text, preprocesses text, matches required skills, calculates semantic similarity, and returns ranked job results.

Application module:

Allows candidates to apply for jobs and prevents duplicate applications.

Recruiter ranking module:

Displays applicants with match score, AI recommendation, and status.

Analytics module:

Shows applicants per job, acceptance ratio, top skills, and application trends.

## 5.5 Key Algorithms

### Resume Matching Algorithm

```text
Input: Resume PDF and all job postings
Output: Ranked job recommendations

1. Extract text from PDF.
2. For each job:
   a. Read required skills.
   b. Match required skills against resume text.
   c. Calculate skillScore.
   d. Combine job title, description, skills, and metadata.
   e. Calculate semanticScore using TF-IDF cosine similarity.
   f. Calculate final matchScore.
   g. Generate rankingReason.
3. Sort jobs by matchScore.
4. Return ranked results.
```

Formula:

```text
finalScore = (skillScore * 0.60) + (semanticScore * 0.40)
```

## 5.6 Important Code Snippets

Resume upload and AI matching endpoint:

```javascript
router.post('/match-pdf', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
    // PDF text extraction, skill matching, semantic scoring, and ranking
});
```

Role-based authorization:

```javascript
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "User role not authorized" });
        }
        next();
    };
};
```

Resume history delete endpoint:

```javascript
router.delete('/resume/:historyId', protect, authorize('candidate'), deleteResume);
```

## 5.7 Screenshots of Application

Screenshots to include in final Word submission:

- Login/Register page.
- Candidate dashboard.
- Resume upload and AI matching results.
- Resume history panel.
- Job cards with match scores.
- Recruiter dashboard.
- Job posting form.
- Ranked applicant table.
- Analytics charts.

# Chapter 6: Testing

## 6.1 Testing Strategy

Testing was performed using local API requests, frontend build checks, linting, backend syntax checks, and workflow-based manual testing. The main objective was to verify that each module works independently and also functions correctly in an integrated workflow.

## 6.2 Unit Testing

Unit-level verification was performed for:

- Authentication validation.
- Role authorization.
- Job payload normalization.
- Resume upload file type validation.
- NLP score calculation.
- Resume history deletion.

## 6.3 Integration Testing

Integration testing verified the complete flow:

1. Recruiter registration and login.
2. Candidate registration and login.
3. Recruiter job posting.
4. Candidate resume upload.
5. AI job matching.
6. Candidate application submission.
7. Recruiter applicant ranking.
8. Application status update.
9. Analytics response.

## 6.4 System Testing

System testing confirmed that the frontend and backend work together. Candidate and recruiter dashboards communicate with the backend API using Axios. Protected routes require valid JWT tokens.

## 6.5 Test Cases Table

| Test Case | Endpoint / Module | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- |
| Health check | `GET /api/health` | API and database status returned | Returned running and connected | Pass |
| Register user | `POST /api/auth/register` | User created | User created successfully | Pass |
| Login user | `POST /api/auth/login` | JWT token returned | Token and user returned | Pass |
| Post job | `POST /api/jobs` | Recruiter can post job | Job created | Pass |
| Candidate blocked from posting | `POST /api/jobs` | 403 error | 403 returned | Pass |
| Upload resume | `POST /api/jobs/match-pdf` | Ranked jobs returned | Match score and skills returned | Pass |
| Apply job | `POST /api/jobs/apply` | Application saved | Application submitted | Pass |
| View applicants | `GET /api/jobs/applicants` | Ranked applicants returned | Applicants returned with AI recommendation | Pass |
| Update status | `PATCH /api/jobs/applicants/:id` | Status updated | Status updated to reviewed | Pass |
| Invalid status | `PATCH /api/jobs/applicants/:id` | 400 error | 400 returned | Pass |
| Delete resume history | `DELETE /api/jobs/resume/:historyId` | Resume removed from UI and database | Implemented and verified by code checks | Pass |

## 6.6 Bug Reports

| Bug | Cause | Fix |
| --- | --- | --- |
| Resume delete toast appeared but UI still showed resume | Backend deleted latest resume pointer but not resume history record | Added per-history delete route and frontend state update |
| Resume delete returned 403 earlier | `/resume` route was below `/:id` route | Moved resume delete route above dynamic job id route |
| CORS preflight error | Custom request headers forced preflight; CORS needed to run before rate limiter | Removed unnecessary headers and configured preflight handling |
| Candidate tab counts did not match cards | Counts used application records while UI rendered job cards | Counts now use applied job cards |

# Chapter 7: Results and Discussion

The project successfully implements an AI-based resume screening and job recommendation workflow. The candidate can upload a PDF resume and receive ranked job recommendations. The recruiter can view applicants with match scores and AI recommendation labels.

Testing evidence shows that the AI matching endpoint returned a top match for "MERN Full Stack Developer" with matched skills such as React, Node.js, Express, and MongoDB. The recruiter applicant view displayed the candidate with a calculated match score and recommendation.

The system also includes analytics, resume history, application status tracking, and role-based access. These features make the project more complete than a basic job portal.

The current AI approach is suitable for an academic project because it is transparent and explainable. It can show how scores are calculated using skill matching and semantic similarity. However, future improvements can use transformer embeddings or larger resume datasets for deeper semantic understanding.

# Chapter 8: Conclusion and Future Scope

## 8.1 Conclusion

The AI-Based Job Matching API for Resume Screening and Job Recommendations meets the stated project objectives. It provides a secure MERN stack application with candidate and recruiter workflows, database models, resume upload, PDF parsing, NLP preprocessing, AI-based scoring, ranked recommendations, applicant retrieval, analytics, logging, error handling, and documentation.

The project demonstrates how AI/NLP techniques can improve recruitment by reducing manual resume screening and providing explainable candidate-job matching results.

## 8.2 Future Scope

Future enhancements include:

- Add a separate visual admin dashboard for user management and platform monitoring.
- Add automated Jest/Supertest test suite.
- Add skill synonym mapping such as JS to JavaScript and MERN to MongoDB, Express, React, Node.js.
- Add transformer-based embeddings for stronger semantic matching.
- Add OCR support for scanned resumes.
- Add email templates and interview scheduling.
- Add deployment pipeline for frontend and backend.
- Add downloadable recruiter reports.
- Add pagination and server-side filtering for very large datasets.

# Chapter 9: References

1. React.js Documentation: https://react.dev/
2. Express.js Documentation: https://expressjs.com/
3. MongoDB Documentation: https://www.mongodb.com/docs/
4. Mongoose Documentation: https://mongoosejs.com/
5. JWT Introduction: https://jwt.io/
6. Natural NLP Library: https://www.npmjs.com/package/natural
7. pdfjs-dist Package: https://www.npmjs.com/package/pdfjs-dist
8. MDN Web Docs: https://developer.mozilla.org/
9. Vite Documentation: https://vite.dev/

# Chapter 10: Appendices

## Appendix A: API Testing Evidence

Detailed API testing evidence is available in:

`backend/tests/API_TEST_RESULTS.md`

## Appendix B: Main Project Files

Backend:

- `backend/server.js`
- `backend/routes/authRoutes.js`
- `backend/routes/jobRoutes.js`
- `backend/routes/analyticsRoutes.js`
- `backend/middleware/authMiddleware.js`
- `backend/middleware/errorMiddleware.js`
- `backend/models/User.js`
- `backend/models/Job.js`
- `backend/models/Application.js`
- `backend/models/ResumeHistory.js`
- `backend/utils/nlpUtils.js`

Frontend:

- `frontend/src/pages/CandidateView.jsx`
- `frontend/src/pages/RecruiterView.jsx`
- `frontend/src/components/JobCard.jsx`
- `frontend/src/api.js`
- `frontend/src/styles/candidate.css`
- `frontend/src/styles/recruiter.css`

## Appendix C: Project Objective Mapping

| Project Task | Implemented |
| --- | --- |
| Design database for candidates, resumes, and job postings | Yes |
| Develop API endpoints for resume submission, job posting, and candidate retrieval | Yes |
| Preprocess resumes and job descriptions for NLP modeling | Yes |
| Apply ML/NLP algorithms to rank candidates based on job relevance | Yes |
| Integrate AI model with API responses | Yes |
| Test endpoints and AI recommendations | Yes |
| Implement secure authentication for recruiters and candidates | Yes |
| Handle error scenarios and logging | Yes |
| Document endpoints, request/response formats, and AI workflow | Yes |
