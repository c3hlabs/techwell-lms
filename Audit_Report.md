# TechWell Platform - Audit & Enhancement Report

## 1. Executive Summary
The current system has a strong foundation with a comprehensive Prisma schema and robust RBAC middleware. The core entities (Users, Courses, Interviews, Jobs) are well-defined. However, there are specific **critical logic gaps** in the connecting flows—specifically transitions between lifecycle stages (Lead -> Student and Student -> Placement).

## 2. Gap Analysis & Broken Flows

| Business Flow | Current State | Missing / Broken link | Severity |
| :--- | :--- | :--- | :--- |
| **Lead → Student** | Leads are captured and tracked. Status can be set to 'CONVERTED'. | **CRITICAL**: No automated conversion. Setting status to 'CONVERTED' does not create a User account. Staff must manually copy-paste data to "Create User". | 🔴 High |
| **AI Interview → Placement** | Interviews generate detailed scores and evaluations. | **CRITICAL**: Employers casting for jobs cannot see these AI Scores in the "Applicants" list. They only see basic profile info (Name, Email). The value of the AI interview is lost in the hiring process. | 🔴 High |
| **Course → Certificate** | Certificate generation logic exists (`/api/certificates/generate`). | **MINOR**: Requires explicit API call. Should be triggered automatically or have a very prominent "Claim Certificate" UI upon 100% progress. | 🟡 Medium |
| **Placement → Alumni** | Job Applications track status (`HIRED`). | **MAJOR**: No logic upgrades the User's role or status to "ALUMNI" upon successful placement. "Placed Students" reporting is likely manual. | 🟡 Medium |
| **RBAC** | Middleware `authorize` is used effectively. | **GOOD**: Most routes are properly protected. | 🟢 Low |

## 3. Detailed Audit Findings

### A. Lead & CRM Flow
-   **Routes**: `backend/src/routes/leads.routes.js`
-   **Issue**: The `PUT /:id` endpoint only updates the lead record.
-   **Fix Required**: Create a new endpoint `POST /api/leads/:id/convert` that:
    1.  Reads Lead data.
    2.  Creates a `User` (Role: STUDENT) with a temporary password.
    3.  Creates an `Enrollment` (optional, if they bought a course immediately).
    4.  Updates Lead status to `CONVERTED`.
    5.  Emails the student their credentials.

### B. Student & Course Flow
-   **Routes**: `backend/src/routes/course.routes.js`, `backend/src/routes/certificate.routes.js`
-   **Issue**: Certificate generation relies on the client knowing when to call it.
-   **Fix Required**: Ensure the Frontend "Course Completion" screen calls `POST /generate` immediately, or Backend triggers it via an Event Emitter when `progress` hits 100%.

### C. Job & Placement Flow
-   **Routes**: `backend/src/routes/jobs.routes.js`
-   **Issue**: The `GET /:id/applications` endpoint returns `applicant: { name, email, avatar }`.
-   **Fix Required**: Update the `include` clause in the Prisma query to fetch `interviews` (where source is AI) and aggregate the `averageScore`. Display this "TechScore" in the Employer Dashboard.

### D. Alumni Lifecycle
-   **Issue**: System doesn't "know" when a student is placed beyond a text status in `JobApplication`.
-   **Fix Required**: Add a trigger/hook: When `JobApplication` status changes to `HIRED` -> Update `User` metadata (e.g., `isAlumni: true` or change Group).

## 4. Implementation Plan

### Phase 1: High Impact Fixes (Immediate)
1.  **Implement `POST /api/leads/:id/convert`**: Close the gap between Sales and Delivery.
2.  **Enhance `GET /api/jobs/:id/applications`**: Expose AI Scores to Employers to drive value.

### Phase 2: Automation & Hardening
1.  **Automate Alumni Status**: Listen for `HIRED` events.
2.  **Certificate Polish**: Ensure one-click generation/download.

### Phase 3: Reporting
1.  **Build Placement Dashboard**: Aggregate `HIRED` applications for Admin view.

---

**Next Step:** I will proceed to **Phase 1** and implement the Lead Conversion logic and the Enhanced Applicant functionality.
