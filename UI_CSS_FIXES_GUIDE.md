# 🔧 UI/CSS FIXES & DASHBOARD FUNCTIONALITY GUIDE

## Part A: CSS CLASSES TO ADD

Add the following CSS to [src/styles/recruiter.css](src/styles/recruiter.css):

```css
/* === APPLICANTS LIST & TABLE STYLES === */

.applicants-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #0b0b0e;
    min-height: 100vh;
    color: white;
}

.applicants-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.applicants-nav h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
}

.applicants-nav h2 span {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.btn-return {
    background: rgba(100, 108, 255, 0.1);
    color: #646cff;
    border: 1.5px solid #646cff;
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.btn-return:hover {
    background: rgba(100, 108, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(100, 108, 255, 0.3);
}

.search-container {
    display: flex;
    gap: 12px;
    align-items: center;
}

.search-container input {
    flex: 1;
    min-width: 250px;
    padding: 14px 18px;
    background: rgba(30, 30, 38, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    outline: none;
}

.search-container input:focus {
    border-color: #6366f1;
    background: rgba(30, 30, 38, 0.8);
}

.search-container input::placeholder {
    color: #64748b;
}

.results-count {
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 500;
}

.activity-feed {
    background: rgba(30, 30, 38, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 30px;
    display: flex;
    gap: 20px;
    align-items: center;
}

.activity-feed h4 {
    margin: 0;
    color: #e2e8f0;
    font-size: 0.9rem;
    min-width: 100px;
}

.activity-feed div {
    flex: 1;
    color: #cbd5e1;
    font-size: 0.85rem;
    padding: 8px 12px;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 8px;
}

.table-responsive-wrapper {
    overflow-x: auto;
    border-radius: 16px;
    margin-bottom: 30px;
}

.ranking-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
    background: transparent;
    border: none;
}

.ranking-table th {
    padding: 16px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #818cf8;
    border-bottom: 2px solid rgba(100, 108, 255, 0.2);
    background: rgba(15, 23, 42, 0.5);
}

.ranking-table tbody tr {
    background: rgba(30, 30, 38, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.ranking-table tbody tr:hover {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-1px);
}

.ranking-table td {
    padding: 16px;
    color: #e2e8f0;
    vertical-align: middle;
}

.rank-badge {
    background: rgba(99, 102, 241, 0.1);
    color: #818cf8;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
}

.candidate-cell-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.candidate-primary-name {
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
}

.ranking-subtext {
    color: #94a3b8;
    font-size: 0.8rem;
}

.role-title-badge {
    background: rgba(139, 92, 246, 0.1);
    color: #d8b4fe;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
}

.score-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.score-percentage-value {
    color: #22c55e;
    font-size: 0.95rem;
}

.score-track-bg {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    display: block;
}

.score-track-bg i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #84cc16);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.ranking-status {
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: inline-block;
}

.ranking-status.accepted {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.ranking-status.pending {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.ranking-status.rejected {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.ranking-status.reviewed {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.action-buttons button {
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.approve-btn {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.approve-btn:hover {
    background: rgba(16, 185, 129, 0.25);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.reject-btn {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.reject-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.ai-inference-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 300px;
}

.ai-inference-title {
    font-size: 0.8rem;
    color: #94a3b8;
    font-weight: 600;
}

.ai-inference-text {
    font-size: 0.8rem;
    color: #cbd5e1;
    line-height: 1.4;
}

/* Pagination styles */
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-btn {
    padding: 10px 16px;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
}

.pagination-btn:hover {
    background: rgba(99, 102, 241, 0.2);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    color: #94a3b8;
    font-size: 0.85rem;
}

/* Toast Notification Styles */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease;
}

.toast.success {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.toast.error {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Responsive Table */
@media (max-width: 1024px) {
    .applicants-wrapper {
        padding: 20px 10px;
    }

    .ranking-table th,
    .ranking-table td {
        padding: 12px 8px;
        font-size: 0.8rem;
    }

    .activity-feed {
        flex-direction: column;
        gap: 12px;
    }

    .action-buttons {
        flex-direction: column;
    }

    .action-buttons button {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .applicants-nav {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .btn-return {
        width: 100%;
        text-align: center;
    }

    .table-responsive-wrapper {
        overflow-x: auto;
    }

    .ranking-table {
        min-width: 900px;
    }
}
```

---

## Part B: CSS CLASSES FOR CANDIDATE DASHBOARD

Add to [src/styles/candidate.css](src/styles/candidate.css):

```css
/* === JOB CARD IMPROVEMENTS === */

.job-card {
    background: rgba(30, 30, 38, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
}

.job-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.1);
}

.job-card-top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.job-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.job-title-row h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
}

.job-mode-badge {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.muted-text {
    color: #94a3b8;
    font-size: 0.9rem;
    margin: 6px 0;
}

.salary-text {
    color: #10b981;
    font-weight: 600;
    font-size: 0.95rem;
}

.match-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
    min-width: 120px;
}

.save-job-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #cbd5e1;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 1.2rem;
}

.save-job-btn:hover {
    border-color: rgba(255, 193, 7, 0.5);
    color: #ffc107;
}

.save-job-btn.saved {
    background: rgba(255, 193, 7, 0.1);
    border-color: #ffc107;
    color: #ffc107;
}

.quick-apply-btn,
.status-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.quick-apply-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.quick-apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.status-btn {
    background: rgba(100, 108, 255, 0.1);
    color: #6366f1;
    border: 1px solid #6366f1;
    cursor: not-allowed;
}

.status-btn.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: #f59e0b;
}

.status-btn.accepted {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-color: #10b981;
}

.status-btn.rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: #ef4444;
}

/* Match Circle */
.match-circle {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.4rem;
    border: 3px solid;
}

.match-circle.high {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-color: #10b981;
}

.match-circle.medium {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: #f59e0b;
}

.match-circle.low {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: #ef4444;
}

/* Skills Display */
.skill-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-badge {
    background: rgba(99, 102, 241, 0.1);
    color: #818cf8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.skill-badge.matched {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.skill-badge.missing {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    text-decoration: line-through;
}
```

---

## Part C: FUNCTIONAL ISSUES TO CHECK

### **Dashboard 1: Recruiter Dashboard**

#### Analytics Section
- ✅ **Applicants Per Job**: Shows count correctly
- ✅ **Acceptance Ratio**: Displays percentage
- ✅ **Top Skills**: Lists skills with frequency
- ✅ **Application Trends**: Line chart displays over time

#### Applicants Section
- [ ] **Sorting**: Highest/Lowest match score works
- [ ] **Filtering**: Active/Pending/Accepted tabs work
- [ ] **Search**: Search by candidate name, job title, or skills
- [ ] **Pagination**: Loads 8 per page, navigation works
- [ ] **Status Updates**: Accept/Reject buttons work
- [ ] **Resume Viewing**: "View Resume" button opens PDF
- [ ] **Activity Feed**: Shows recent actions

#### Job Management Section
- [ ] **Create Job**: New jobs appear immediately
- [ ] **Edit Job**: Changes reflect in list
- [ ] **Delete Job**: Job disappears from list
- [ ] **Form Validation**: Required fields enforced

---

### **Dashboard 2: Candidate Dashboard**

#### Job Search & Listing
- [ ] **Display All Jobs**: All jobs load on page load
- [ ] **Search Functionality**: Filter by keywords works
- [ ] **Chip Filters**: Click chips to add search terms
- [ ] **Recent Searches**: Saved and clickable
- [ ] **Job Card Display**: Match scores, salary, location visible

#### Resume Upload
- [ ] **PDF Upload**: Only PDFs accepted
- [ ] **File Size**: Max 5MB enforced
- [ ] **AI Matching**: Match scores calculated
- [ ] **Resume History**: Previous uploads listed
- [ ] **Delete Resume**: Can remove from history

#### Applications
- [ ] **Quick Apply**: Sends application
- [ ] **Application Status**: Shows pending/accepted/rejected
- [ ] **My Applications Page**: Lists all applications
- [ ] **Status Updates**: Real-time updates

---

## Part D: SPECIFIC FIXES REQUIRED

### **Fix 1**: ApplicantsList Missing Button Styling
```jsx
// In ApplicantsList.jsx, make sure button in View Resume cell has proper styling
<button
    onClick={() => { window.open(...) }}
    style={{
        padding: '8px 14px',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'all 0.2s ease'
    }}
>
    View Resume
</button>
```

### **Fix 2**: MyApplications Responsive Layout
```jsx
// Add media query to MyApplications.jsx wrapper
style={{
    padding: 'clamp(20px, 5vw, 40px)',
    maxWidth: '900px',
    margin: '0 auto',
    color: '#fff'
}}
```

### **Fix 3**: JobCard Match Circle Color Logic
```jsx
const getMatchCircleClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
};
```

### **Fix 4**: Tooltip/AI Explanation Display
Ensure `.ai-explanation-box` is visible in job cards when expanded.

### **Fix 5**: Mobile Table Overflow
Add horizontal scroll container with proper styling for mobile tables.

---

## Part E: FINAL CHECKLIST

### UI Components
- [ ] All buttons have hover states
- [ ] All inputs have focus states
- [ ] All modals have proper z-index
- [ ] All animations are smooth (no jank)
- [ ] All text is readable (color contrast ✓)
- [ ] All icons are properly sized

### Responsive Design
- [ ] ✅ Desktop (1200px+): Full layout
- [ ] Mobile (768px-): Single column, stacked elements
- [ ] Tablet (768px-1024px): 2-column where appropriate
- [ ] Tables: Horizontal scroll on mobile
- [ ] Forms: Full width on mobile

### Dashboard Functionality
- [ ] ✅ Recruiter Analytics: All 4 charts functional
- [ ] ✅ Recruiter Applicants: Sorting, filtering, pagination working
- [ ] ✅ Candidate Job Search: Search, filters, chips working
- [ ] ✅ Candidate Resume: Upload, history, delete working
- [ ] ✅ Applications: Track status, apply, view history working

---

**Total CSS to Add**: ~800 lines
**Total Fixes**: 5-8 functional issues
**Expected Time**: 30-45 minutes

