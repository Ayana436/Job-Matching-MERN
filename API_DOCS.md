# Job Matching MERN API Docs

# AI Resume Matching Workflow

## Overview

The system uses AI/NLP-based resume matching to compare uploaded candidate resumes against job descriptions and required skills.

The workflow extracts text from PDF resumes, preprocesses content, identifies matching skills, calculates AI relevance scores, and ranks jobs accordingly.

---

# Workflow Steps

## 1. Resume Upload

Candidates upload resumes in PDF format using:

POST /api/jobs/match-pdf

The backend accepts only PDF files using Multer middleware.

---

## 2. PDF Text Extraction

The uploaded resume is parsed using:

pdfjs-dist

Text content from all PDF pages is extracted into a single string for NLP processing.

---

## 3. NLP Skill Matching

The system compares resume text against:

- requiredSkills
- job title
- keywords

Regex-based keyword matching is used to identify relevant technical skills.

Example:
- React
- Node.js
- MongoDB
- AWS
- Python

---

## 4. Match Score Calculation

The AI relevance score is calculated using:

matchScore =
(matchedSkills / totalRequiredSkills) * 100

The score determines candidate-job relevance.

---

## 5. Explainable AI Output

The API also generates:

- matchedSkills
- missingSkills
- rankingReason
- aiSummary

Example:

{
  "matchScore": 75,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["Docker"],
  "rankingReason": "Strong candidate with most required skills."
}

---

## 6. Recruiter Candidate Ranking

Recruiters can retrieve ranked applicants using:

GET /api/jobs/applicants

Applications are sorted by:
- matchScore
- AI relevance

This helps recruiters identify the best candidates quickly.

---

# Security Features

- JWT Authentication
- Role-based authorization
- Recruiter-only routes
- Candidate-only routes
- File upload restrictions
- Centralized error handling

---

# Technologies Used

Frontend:
- React.js
- CSS
- Axios

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose

AI/NLP:
- pdfjs-dist
- Regex-based NLP matching
- Skill ranking algorithm

Authentication:
- JWT
- bcrypt

## AI Matching Algorithm

The system uses:
- TF-IDF Vectorization
- Cosine Similarity
- Keyword Extraction
- NLP Preprocessing

to calculate resume-job relevance scores.

## Error Handling & Security

The backend includes:

- JWT authentication
- Role-based authorization
- Protected recruiter routes
- Protected candidate routes
- PDF upload validation
- File size restrictions
- Centralized error middleware
- Invalid route handling
- API error responses