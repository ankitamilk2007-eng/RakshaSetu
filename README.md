# RakshaSetu (रक्षासेतु)
### *“Speak Safely. Preserve Evidence. Get Help.”*
**AI-Powered Confidential Workplace Harassment Reporting, Evidence Protection & Case Management Platform**

---

## 1. Executive Overview & Problem Statement

Workplace harassment and sexual misconduct remain severely underreported in corporate and institutional settings due to systemic barriers:
- **Fear of Retaliation**: Survivors fear termination, denied appraisals, or blacklisting.
- **Evidence Degradation & Questioning**: Digital evidence (chats, emails, call logs, CCTV) is often deleted, challenged, or altered before inquiry committees convene.
- **Repeat Offender Invisibility**: Offender behavior across isolated departments or previous employers remains undetected because complaints sit in separate silos.
- **Lack of Post-Filing Visibility**: After filing, survivors are frequently left in the dark without transparent status tracking.
- **Triage Failures**: Life-threatening situations, physical assaults, or stalking are placed in standard grievance queues rather than being prioritized immediately.

**RakshaSetu** solves these critical challenges by providing a trauma-informed, privacy-preserving, multi-interface platform with:
1. **Invisible Mode**: Disguised Calculator and Personal Notes decoy with PIN (`2580`) and instant panic exit.
2. **Secure Evidence Vault**: Immediate tamper-evident SHA-256 cryptographic hashing and automated Section 65B Indian Evidence Act certificates.
3. **AI Complaint Assistant**: Transforms raw unstructured stories into formal legal drafts aligned with POSH Act 2013 standards while keeping the survivor in full control.
4. **Transparent AI Risk Scoring (0–100)**: Explainable contributing weights (e.g. +30 immediate physical threat, +20 violence, +18 retaliation threat).
5. **Confidential Matching Escrow**: Cross-organization serial offender detection alerting committees when $\ge 2$ independent reports identify the same subject—*without revealing survivor identities to each other*.
6. **Statutory POSH 90-Day Tracker**: Automated monitoring of Section 11(4) inquiry windows with overdue warnings.
7. **Strict Role-Based Segregation**: Distinct portals for **Survivors**, **Organization / ICC**, and **Law Enforcement Authorities**.

---

## 2. Three Distinct Interfaces & Access Control

| Interface | URL Route | Demo Credentials | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Survivor / User** | `/user` | `user@demo.com` / `User@123` | Document incidents, record voice statements, vault files with SHA-256 hashes, AI structuring, track case timeline, encrypted messaging. |
| **Admin / ICC** | `/admin` | `admin@demo.com` / `Admin@123` | High-priority risk queue, investigator appointment, status transitions, POSH 90-day tracker, Matching Escrow alerts, police escalation. |
| **Police / Authority** | `/police` | `police@demo.com` / `Police@123` | Filtered referral docket (strictly referred cases only), live SHA-256 forensic verification tool, FIR-related actions, case updates. |

*Note: The platform includes a persistent top **Demo Bar** enabling judges and evaluators to switch between any role with a single click.*

---

## 3. Core Architecture & Tech Stack

```
                                +---------------------------+
                                |  RakshaSetu Web Client    |
                                | (React + Tailwind + Vite) |
                                +-------------+-------------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
                   v                          v                          v
             [ /user Portal ]          [ /admin Portal ]          [ /police Portal ]
          (Survivor & Vault)         (ICC & Compliance)        (Criminal Referrals)
                   |                          |                          |
                   +--------------------------+--------------------------+
                                              |
                                              v (REST API + JWT RBAC)
                               +--------------+---------------+
                               |   Express.js Backend Node    |
                               | (Port 5000 / ESM TypeScript) |
                               +--------------+---------------+
                                              |
                   +--------------------------+--------------------------+
                   |                          |                          |
                   v                          v                          v
          [ AI & NLP Service ]       [ Cryptographic Engine ]    [ Matching Escrow ]
         - POSH Structuring         - Real SHA-256 Hashes       - Deterministic Hashes
         - Risk Scoring (0-100)     - Section 65B Certs         - Cross-Org Threshold (>=2)
         - Missing Info Checklist   - Disk Integrity Verifier   - Zero Identity Leakage
                   |                          |                          |
                   +--------------------------+--------------------------+
                                              |
                                              v
                              +---------------+---------------+
                              |    PostgreSQL 16 Database     |
                              |   (19 Relational Tables)      |
                              +-------------------------------+
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts for interactive analytics.
- **Backend**: Node.js, Express.js, Multer for secure uploads, Crypto module for SHA-256 calculations, Bcrypt.js, JSON Web Tokens (JWT).
- **Database**: PostgreSQL 16 (relational schema: `users`, `organizations`, `incidents`, `complaints`, `cases`, `evidence`, `evidence_hashes`, `risk_assessments`, `matching_patterns`, `matching_reports`, `police_referrals`, `deadlines`, `audit_logs`, `messages`, `notifications`, `consents`, `support_contacts`).

---

## 4. End-to-End Demonstration Scenario

1. **Step 1 — Survivor Enters Discreetly**:
   - Accesses `/invisible` (Disguised Calculator).
   - Enters `2580` or clicks *Auto Unlock* to launch the Survivor Portal.
2. **Step 2 — Incident & Voice Documentation**:
   - Uses the step-by-step wizard to document an incident involving *Rajesh Sharma*.
   - Records voice statement in English, Hindi, or Marathi with real-time audio waveform and speech-to-text transcription.
3. **Step 3 — Evidence Vault & Cryptographic Checksum**:
   - Uploads screenshots or chat exports. The backend computes an authentic **SHA-256 checksum** (e.g. `a8c91...7f21`).
   - Downloads a printable **Section 65B Electronic Evidence Certificate**.
4. **Step 4 — AI Complaint Assistant & Transparent Risk Scoring**:
   - Converts raw narrative into a formal legal draft with missing information checklist.
   - Evaluates risk score at **86/100 (CRITICAL)** with itemized factor weights (+30 immediate danger, +25 retaliation threat, +15 stalking).
   - Recommends *Internal ICC + Police Escalation*.
5. **Step 5 — Survivor Submission**:
   - Survivor confirms submission; generates tracking Case ID `RS-2026-000127`.
6. **Step 6 — Admin / ICC Case Management**:
   - ICC Presiding Officer (`admin@demo.com`) opens case in High Priority Risk Queue.
   - Performs live SHA-256 integrity verification.
   - Appoints investigating officer and updates status to `Under Investigation`.
7. **Step 7 — Matching Escrow Triggers**:
   - A companion independent report matches *Rajesh Sharma*.
   - Matching Escrow threshold is met ($\ge 2$ independent reports).
   - Generates **Matching Escrow Alert `PAT-2026-008`** indicating repeated patterns across organizations without revealing survivor identities.
8. **Step 8 — Police Escalation**:
   - Admin escalates case to Police Authority portal due to serial threat patterns.
9. **Step 9 — Law Enforcement Forensic Verification & Action**:
   - Police officer (`police@demo.com`) inspects the referral docket.
   - Uses the live forensic verification tool to verify digital evidence checksums against disk storage.
   - Updates status to `FIR_INITIATED` and records docket `FIR-2026-BKC-0941`.
10. **Step 10 — Closed-Loop Tracking**:
    - Complainant and ICC portals update in real-time with verified timeline milestones and secure messaging.

---

## 5. Setup & Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or local PostgreSQL cluster)

### 1. Database Initialization
Start PostgreSQL and create the database:
```sql
CREATE DATABASE rakshasetu;
```
Execute schema:
```bash
psql -h 127.0.0.1 -p 5433 -U postgres -d rakshasetu -f backend/src/models/schema.sql
```

### 2. Seed Realistic Demo Data
```bash
cd backend
npm install
node src/seed/seedData.js
```
*Seeds 10 users, 8 cases across all risk levels, 15 authentic physical vault files with real SHA-256 hashes, 3 matching escrow patterns, and 6 national emergency helplines.*

### 3. Start Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Runs on `http://localhost:5000` with CORS and `/api` endpoints.*

### 4. Start Frontend Client (Port 3000)
```bash
npm install
npm run dev
```
*Runs on `http://localhost:3000` with automatic `/api` proxy.*

---

## 6. Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Survivor / Complainant** | `user@demo.com` | `User@123` |
| **ICC Admin / Presiding Officer** | `admin@demo.com` | `Admin@123` |
| **Police Authority Officer** | `police@demo.com` | `Police@123` |
| **Invisible Mode Decoy Unlock PIN** | `2580` | Entered on calculator keypad |

---

## 7. Legal & Safety Disclaimers

> **IMPORTANT STATUTORY NOTICE**:
> RakshaSetu is a technology prototype engineered for confidential reporting and workflow support. AI outputs are decision-support suggestions that must be reviewed by authorized human committees. Section 65B Electronic Evidence Certificates generated by this prototype demonstrate cryptographic metadata anchoring; real-world legal admissibility under Section 65B of the Indian Evidence Act / Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 requires formal affidavit and signing by an authorized officer in charge of computer systems. Emergency buttons simulate call prompts and do not dispatch physical emergency services unless configured with carrier telecommunications integrations.
