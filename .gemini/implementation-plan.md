# Platform Enhancement Implementation Plan

## Overview
This document outlines the phased implementation plan for three major platform upgrades:
1. **Trainer / Instructor Portal Enhancement**
2. **AI Interview Engine Enhancement**  
3. **Employer / Interviewer Dashboard Enhancement**

---

## Phase 1: Trainer Portal Enhancement ✅ IN PROGRESS

### Database Schema Changes (DONE)
- [x] `Batch` model - Groups students under an instructor for a course
- [x] `Announcement` model - Course/Batch level announcements
- [x] `LessonComment` model - Discussion threads per lesson
- [x] Updated `Enrollment` with `batchId` relation
- [x] Updated `User` with trainer relations

### Backend Services (DONE)
- [x] `trainer.service.js` - Core trainer logic
  - `getTrainerStats()` - Dashboard KPIs
  - `getTrainerBatches()` - Assigned batches
  - `getTrainerStudents()` - Students across batches
  - `getStudentDetailedProgress()` - Drill-down progress

### Backend Routes (DONE)
- [x] `trainer.routes.js` registered at `/api/trainer`
  - `GET /batches` - List trainer's batches
  - `POST /batches` - Create new batch
  - `GET /students` - List students (filterable by batch)
  - `GET /students/:id/progress` - Detailed student progress
  - `GET /stats` - Dashboard statistics
  - `POST /assessments/grade` - Grade assignment submissions

### Frontend (TODO)
- [ ] `/instructor/dashboard` - Teaching Workspace
- [ ] `/instructor/batches` - Batch Management
- [ ] `/instructor/students` - Student Progress Monitoring
- [ ] `/instructor/assessments` - Evaluation Center
- [ ] `/instructor/announcements` - Communication Hub

---

## Phase 2: AI Interview Engine Enhancement

### Current State Analysis
- Existing: Interview scheduling, questions, responses, evaluations
- Existing: `InterviewEvaluation` with scores (overall, technical, communication, etc.)
- Existing: Question types (TECHNICAL, BEHAVIORAL, SITUATIONAL, HR, CODING)

### Schema Enhancements (TODO)
- [ ] `SkillTaxonomy` model - Domain -> Skills hierarchy
- [ ] `QuestionSkillMapping` - Link questions to skills
- [ ] `InterviewAttemptHistory` - Track multiple attempts
- [ ] `SkillScore` - Per-skill scoring history
- [ ] `InterviewRecommendation` - AI-generated learning paths

### Service Enhancements (TODO)
- [ ] Adaptive Question Selection Algorithm
- [ ] Answer Analysis Engine (MCQ auto-grading, text analysis)
- [ ] Skill Gap Detection
- [ ] Smart Report Generation
- [ ] Practice Mode Logic

### API Endpoints (TODO)
- [ ] `POST /interviews/adaptive/start` - Begin adaptive session
- [ ] `POST /interviews/adaptive/answer` - Submit answer, get next question
- [ ] `GET /interviews/:id/skill-report` - Skill-wise breakdown
- [ ] `GET /users/:id/interview-trends` - Performance over time
- [ ] `POST /interviews/practice` - Practice mode sessions

---

## Phase 3: Employer Dashboard Enhancement

### Current State Analysis
- Existing: `EmployerProfile`, `Job`, `JobApplication` models
- Existing: Application status tracking
- Existing: Basic job management routes

### Schema Enhancements (TODO)
- [ ] `ApplicationStage` enum expansion (SHORTLISTED, INTERVIEW_SCHEDULED, etc.)
- [ ] `CandidateNote` - Recruiter notes per applicant
- [ ] `CandidateTag` - Custom tagging
- [ ] `HiringFunnel` - Analytics aggregation
- [ ] Multi-user employer accounts

### Service Enhancements (TODO)
- [ ] Candidate Ranking Algorithm (AI scores + skill match + certifications)
- [ ] Pipeline Analytics
- [ ] Bulk Operations
- [ ] Auto-screening Rules

### API Endpoints (TODO)
- [ ] `GET /employers/pipeline/:jobId` - Full pipeline view
- [ ] `POST /employers/candidates/bulk-action` - Bulk stage changes
- [ ] `GET /employers/analytics/funnel` - Hiring funnel data
- [ ] `POST /employers/candidates/:id/rate` - Rate candidate
- [ ] `GET /employers/candidates/:id/ai-match` - Skill match analysis

---

## RBAC Matrix

| Feature | Student | Trainer | Inst Admin | Admin | Super Admin | Employer |
|---------|---------|---------|------------|-------|-------------|----------|
| Own Progress | ✅ | - | - | - | - | - |
| Batch Students | - | Own | Institute | All | All | - |
| Interview Data | Own | Assigned | Institute | All | All | Applicants |
| Course Content | View | Edit Assigned | Manage | All | All | - |
| Job Management | Apply | - | - | View | All | Own |
| Grading | - | Own Courses | Override | Override | Override | - |

---

## Priority Order

1. **Complete Trainer Portal Frontend** (Current Sprint)
2. **Admin Panel Audit & Stabilization** (Critical - No Broken Features)
3. **AI Interview Adaptive Algorithm** (High Impact)
4. **Employer Pipeline & Ranking** (Revenue Driver)

---

## Phase 4: Admin Panel Audit & Enhancement

### Audit Checklist (TODO)
- [ ] Inventory all Admin routes/pages
- [ ] Check each page: loads, permissions, actions work
- [ ] Categorize: ✅ Working | ⚠️ Partial | ❌ Broken

### Dashboard KPIs (TODO)
- [ ] Total: Students, Trainers, Employers, Courses, Batches
- [ ] New leads (today/month)
- [ ] Enrollments, Completions, Certificates
- [ ] Job applications, Placements
- [ ] System alerts (errors, pending approvals)

### User & RBAC Management (TODO)
- [ ] Manage all user roles
- [ ] Assign permissions
- [ ] Activate/Deactivate users
- [ ] Activity logs

### Course & LMS Management (TODO)
- [ ] CRUD for Courses, Modules, Lessons
- [ ] Assign Trainers to Courses
- [ ] View enrollment/completion metrics
- [ ] Certificate eligibility rules

### AI Interview Management (TODO)
- [ ] Question bank CRUD
- [ ] Skill taxonomy management
- [ ] Scoring rules configuration
- [ ] Interview session audit

### Employer & Job Management (TODO)
- [ ] Approve/Suspend Employers
- [ ] Approve/Reject Jobs
- [ ] Monitor applications & placements

### Reports & Analytics (TODO)
- [ ] Lead funnel reports
- [ ] Enrollment vs completion
- [ ] AI interview performance
- [ ] Placement stats
- [ ] CSV/Excel export

### System Health (TODO)
- [ ] Error log viewer
- [ ] 404 tracker
- [ ] API error monitoring

---

## Tech Debt / Safety Notes

- All updates use UPSERT, not DELETE-RECREATE
- Soft deletes for content (add `deletedAt` fields where needed)
- Version tracking for assessments (allow re-evaluation)
- Audit logging for grading changes
- Raw answer storage for AI re-analysis
