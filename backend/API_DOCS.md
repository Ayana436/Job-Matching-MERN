# Job Matching MERN API Docs

This project includes an OpenAPI starter file at `backend/openapi.json`.

You can import it into Swagger Editor, Postman, or Insomnia to document and test:

- Auth: register and login
- Jobs: list, search, create, update, delete
- Resume matching: PDF upload and ranked matching
- Applications: apply, view own applications, recruiter applicant ranking

Protected endpoints use a JWT bearer token:

```text
Authorization: Bearer <token>
```

Recruiter-only endpoints include job creation/update/delete and applicant review.
Candidate-only endpoints include resume matching and applying to jobs.
