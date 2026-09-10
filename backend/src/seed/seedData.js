import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to create dummy file with real content and compute sha256
const createVaultFile = (fileName, content) => {
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, content, 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const stat = fs.statSync(filePath);
  return { filePath, hash, size: stat.size };
};

export const seedDatabase = async () => {
  console.log('--- Starting RakshaSetu Comprehensive Database Seed ---');

  // 1. Clean existing records
  await query(`TRUNCATE TABLE audit_logs, notifications, messages, support_contacts, consents, deadlines, police_referrals, matching_reports, matching_patterns, case_status_history, evidence_hashes, evidence, risk_assessments, cases, complaints, incidents, users, organizations CASCADE;`);

  // 2. Organizations
  const orgs = [
    { id: 'org_tata_01', name: 'Tata Consultancy Services', code: 'TCS-IND', industry: 'Information Technology', address: 'Bandra Kurla Complex, Mumbai' },
    { id: 'org_infy_02', name: 'Infosys Technologies', code: 'INFY-IND', industry: 'Information Technology', address: 'Electronic City, Bengaluru' },
    { id: 'org_apollo_03', name: 'Apollo Hospitals Enterprise', code: 'APOLLO-MED', industry: 'Healthcare', address: 'Greams Road, Chennai' },
    { id: 'org_deloitte_04', name: 'Deloitte India Consulting', code: 'DELOITTE-IND', industry: 'Financial Advisory', address: 'Cyber City, Gurugram' }
  ];

  for (const org of orgs) {
    await query(
      `INSERT INTO organizations (id, name, code, industry, address) VALUES ($1, $2, $3, $4, $5)`,
      [org.id, org.name, org.code, org.industry, org.address]
    );
  }

  // 3. Password Hashes
  const userPasswordHash = await bcrypt.hash('User@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const policePasswordHash = await bcrypt.hash('Police@123', 10);

  // 4. Users (10 users total: survivors, 3 admins, 3 police officers)
  const users = [
    // Core Demo Survivor
    { id: 'usr_demo_user', email: 'user@demo.com', password_hash: userPasswordHash, full_name: 'Ananya Sharma', anonymous_display_name: 'Survivor_A12', phone: '+91 98201 12345', role: 'USER', organization_id: 'org_tata_01', department: 'Engineering / Cloud Services' },
    // Other Survivors
    { id: 'usr_priya', email: 'priya.k@demo.com', password_hash: userPasswordHash, full_name: 'Priya Kulkarni', anonymous_display_name: 'Survivor_P44', phone: '+91 98202 23456', role: 'USER', organization_id: 'org_infy_02', department: 'Product Design' },
    { id: 'usr_sneha', email: 'sneha.r@demo.com', password_hash: userPasswordHash, full_name: 'Sneha Roy', anonymous_display_name: 'Survivor_S89', phone: '+91 98203 34567', role: 'USER', organization_id: 'org_tata_01', department: 'Marketing & PR' },
    { id: 'usr_meera', email: 'meera.nair@demo.com', password_hash: userPasswordHash, full_name: 'Meera Nair', anonymous_display_name: 'Survivor_M71', phone: '+91 98204 45678', role: 'USER', organization_id: 'org_deloitte_04', department: 'Human Resources' },
    { id: 'usr_tanvi', email: 'tanvi.joshi@demo.com', password_hash: userPasswordHash, full_name: 'Tanvi Joshi', anonymous_display_name: 'Survivor_T55', phone: '+91 98205 56789', role: 'USER', organization_id: 'org_apollo_03', department: 'Operations' },
    
    // 3 Admins (ICC Presiding Officers)
    { id: 'usr_demo_admin', email: 'admin@demo.com', password_hash: adminPasswordHash, full_name: 'Dr. Sunita Deshmukh', anonymous_display_name: 'ICC_Lead_Sunita', phone: '+91 98210 99881', role: 'ADMIN', organization_id: 'org_tata_01', department: 'ICC Committee Chair' },
    { id: 'usr_admin_2', email: 'icc.chair@infy.com', password_hash: adminPasswordHash, full_name: 'Adv. Kavita Rao', anonymous_display_name: 'ICC_Lead_Kavita', phone: '+91 98210 99882', role: 'ADMIN', organization_id: 'org_infy_02', department: 'Legal & Ethics' },
    { id: 'usr_admin_3', email: 'admin.hr@deloitte.com', password_hash: adminPasswordHash, full_name: 'Rohit Mathur', anonymous_display_name: 'ICC_Lead_Rohit', phone: '+91 98210 99883', role: 'ADMIN', organization_id: 'org_deloitte_04', department: 'POSH Compliance Cell' },
    
    // 3 Police Officers
    { id: 'usr_demo_police', email: 'police@demo.com', password_hash: policePasswordHash, full_name: 'Inspector Vikram Salve', anonymous_display_name: 'Inspector_Salve', phone: '+91 98220 77661', role: 'POLICE', organization_id: null, department: 'Cyber Crime & Women Safety Cell' },
    { id: 'usr_police_2', email: 'acp.shinde@police.gov.in', password_hash: policePasswordHash, full_name: 'ACP Shalini Shinde', anonymous_display_name: 'ACP_Shinde', phone: '+91 98220 77662', role: 'POLICE', organization_id: null, department: 'Anti-Eve Teasing & Special Task Unit' },
    { id: 'usr_police_3', email: 'si.patil@police.gov.in', password_hash: policePasswordHash, full_name: 'Sub-Inspector R. Patil', anonymous_display_name: 'SI_Patil', phone: '+91 98220 77663', role: 'POLICE', organization_id: null, department: 'BKC Police Station Crime Branch' }
  ];

  for (const u of users) {
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, anonymous_display_name, phone, role, organization_id, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [u.id, u.email, u.password_hash, u.full_name, u.anonymous_display_name, u.phone, u.role, u.organization_id, u.department]
    );

    await query(`INSERT INTO consents (id, user_id) VALUES ($1, $2)`, [`cns_${u.id}`, u.id]);
  }

  // 5. Support Contacts (Emergency helplines)
  const contacts = [
    { id: 'sc_1', category: 'National Emergency', name: 'National Emergency Helpline (Police / Medical)', phone: '112', description: 'Universal nationwide emergency assistance', availability: '24/7', is_emergency: true },
    { id: 'sc_2', category: 'Women Helpline', name: 'Women Helpline (Domestic & Workplace)', phone: '1091', description: 'Dedicated police cell helpline for women in distress', availability: '24/7', is_emergency: true },
    { id: 'sc_3', category: 'Cyber Crime', name: 'National Cyber Crime Reporting Helpline', phone: '1930', description: 'Immediate assistance for cyber stalking, revenge media, and extortion', availability: '24/7', is_emergency: true },
    { id: 'sc_4', category: 'Statutory Body', name: 'National Commission for Women (NCW)', phone: '7827170170', description: 'Statutory 24/7 complaints and legal guidance helpline', availability: '24/7', is_emergency: false },
    { id: 'sc_5', category: 'Mental Health', name: 'Vandrevala Foundation Helpline', phone: '9999 666 555', description: 'Confidential psychological support & crisis counseling', availability: '24/7', is_emergency: false },
    { id: 'sc_6', category: 'Legal Aid', name: 'Free Legal Services Authority (NALSA)', phone: '15100', description: 'Free legal aid and survivor counseling services', availability: 'Mon-Sat 9AM-6PM', is_emergency: false }
  ];

  for (const c of contacts) {
    await query(
      `INSERT INTO support_contacts (id, category, name, phone, description, availability, is_emergency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [c.id, c.category, c.name, c.phone, c.description, c.availability, c.is_emergency]
    );
  }

  // 6. Incidents & Complaints (8 realistic cases covering all risk levels & scenarios)
  const incidents = [
    // Case 1: Core High/Critical Demo Case for Ananya (Retaliation + Serial Offender Rajesh Sharma)
    {
      id: 'INC-2026-00127',
      user_id: 'usr_demo_user',
      org_id: 'org_tata_01',
      date: '2026-09-08',
      time: '18:30',
      location: 'Conference Room 4B & Teams Chat',
      dept: 'Engineering',
      category: 'Sexual harassment',
      person: 'Rajesh Sharma',
      role_rel: 'Senior Engineering Director / Reporting Line Manager',
      desc: 'Repeatedly received unwelcome personal messages after work hours. During the annual review meeting on Sept 8th, he explicitly stated that my promotion was conditional on dinner with him, and threatened to terminate my employment if I reported his behavior.',
      threat: true, physical: false, disc: true, sex: true, stalk: true, cyber: true, contact: true, danger: true,
      case_id: 'RS-2026-000127',
      risk_score: 86,
      risk_level: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      officer_id: 'usr_demo_admin',
      officer_name: 'Dr. Sunita Deshmukh',
      authority: 'Internal ICC + Law Enforcement Escalation',
      days_ago: 2
    },
    // Case 2: Matching Escrow Companion Case (Priya Kulkarni reporting SAME PERSON Rajesh Sharma!)
    {
      id: 'INC-2026-00109',
      user_id: 'usr_priya',
      org_id: 'org_infy_02',
      date: '2026-08-20',
      time: '19:15',
      location: 'Executive Lounge / WhatsApp',
      dept: 'Product Design',
      category: 'Sexual harassment',
      person: 'Rajesh Sharma',
      role_rel: 'Consulting Advisory Partner',
      desc: 'Persistent unwarranted calls and lewd comments after work hours. When confronted, he suggested that complaining to HR would damage my industry reputation across partner networks.',
      threat: true, physical: false, disc: false, sex: true, stalk: false, cyber: true, contact: false, danger: false,
      case_id: 'RS-2026-000109',
      risk_score: 74,
      risk_level: 'HIGH',
      status: 'EVIDENCE_REVIEW',
      officer_id: 'usr_admin_2',
      officer_name: 'Adv. Kavita Rao',
      authority: 'Internal Complaints Committee (ICC)',
      days_ago: 21
    },
    // Case 3: Police Escalated Criminal Assault Case (Sneha Roy)
    {
      id: 'INC-2026-00098',
      user_id: 'usr_sneha',
      org_id: 'org_tata_01',
      date: '2026-08-10',
      time: '21:00',
      location: 'Basement Parking Level -2',
      dept: 'Marketing & PR',
      category: 'Physical harassment',
      person: 'Vikram Mehta',
      role_rel: 'External Vendor Liaison',
      desc: 'Cornered me in the basement parking lot, grabbed my wrist forcefully, and physically prevented me from entering my vehicle while issuing verbal threats.',
      threat: true, physical: true, disc: false, sex: false, stalk: true, cyber: false, contact: false, danger: true,
      case_id: 'RS-2026-000098',
      risk_score: 94,
      risk_level: 'CRITICAL',
      status: 'ACTION_TAKEN',
      officer_id: 'usr_demo_admin',
      officer_name: 'Dr. Sunita Deshmukh',
      authority: 'Police / Law Enforcement Escalation',
      days_ago: 31,
      is_police_escalated: true,
      police_officer_name: 'Inspector Vikram Salve',
      fir_number: 'FIR-2026-BKC-0941',
      police_status: 'FIR_INITIATED'
    },
    // Case 4: Overdue POSH Case (>90 days statutory window)
    {
      id: 'INC-2026-00045',
      user_id: 'usr_meera',
      org_id: 'org_deloitte_04',
      date: '2026-05-15',
      time: '11:00',
      location: 'Floor 14 Boardroom',
      dept: 'Human Resources',
      category: 'Workplace bullying',
      person: 'Amitabh Sen',
      role_rel: 'Managing Partner',
      desc: 'Systematic public humiliation, derogatory remarks regarding gender competency, and intimidation in front of subordinates.',
      threat: false, physical: false, disc: true, sex: false, stalk: false, cyber: false, contact: false, danger: false,
      case_id: 'RS-2026-000045',
      risk_score: 52,
      risk_level: 'MEDIUM',
      status: 'UNDER_INVESTIGATION',
      officer_id: 'usr_admin_3',
      officer_name: 'Rohit Mathur',
      authority: 'Internal Complaints Committee / HR Leadership',
      days_ago: 98, // Over 90 days!
      is_overdue: true
    },
    // Case 5: Resolved POSH Case
    {
      id: 'INC-2026-00062',
      user_id: 'usr_tanvi',
      org_id: 'org_apollo_03',
      date: '2026-06-20',
      time: '16:00',
      location: 'Diagnostic Wing B',
      dept: 'Operations',
      category: 'Verbal harassment',
      person: 'Dr. Alok Verma',
      role_rel: 'Senior Specialist Consultant',
      desc: 'Inappropriate and sexually suggestive remarks made during medical rounds and on internal communication portal.',
      threat: false, physical: false, disc: false, sex: true, stalk: false, cyber: true, contact: false, danger: false,
      case_id: 'RS-2026-000062',
      risk_score: 48,
      risk_level: 'MEDIUM',
      status: 'RESOLVED',
      officer_id: 'usr_demo_admin',
      officer_name: 'Dr. Sunita Deshmukh',
      authority: 'Internal Complaints Committee (ICC)',
      days_ago: 75,
      resolution_notes: 'Formal inquiry concluded. Respondent received written censure, deduction of bonus, and mandatory sensitization counseling. Complainant transferred with promotion to Wing A.'
    },
    // Case 6: Cyber Harassment & Blackmail (Critical)
    {
      id: 'INC-2026-00078',
      user_id: 'usr_demo_user',
      org_id: 'org_tata_01',
      date: '2026-07-28',
      time: '23:15',
      location: 'Signal & Telegram Messaging',
      dept: 'Engineering',
      category: 'Cyber harassment',
      person: 'Karan Singhania',
      role_rel: 'Team Lead',
      desc: 'Received threatening anonymous messages containing photos taken without knowledge inside cafeteria, demanding compliance with private meetings.',
      threat: true, physical: false, disc: false, sex: true, stalk: true, cyber: true, contact: false, danger: true,
      case_id: 'RS-2026-000078',
      risk_score: 82,
      risk_level: 'CRITICAL',
      status: 'EVIDENCE_REVIEW',
      officer_id: 'usr_demo_admin',
      officer_name: 'Dr. Sunita Deshmukh',
      authority: 'Police / Law Enforcement Escalation',
      days_ago: 42
    },
    // Case 7: Low Risk Discrimination Case
    {
      id: 'INC-2026-00085',
      user_id: 'usr_priya',
      org_id: 'org_infy_02',
      date: '2026-08-05',
      time: '10:30',
      location: 'Sprint Planning Meeting',
      dept: 'Product Design',
      category: 'Discrimination',
      person: 'Naveen Chawla',
      role_rel: 'Scrum Master',
      desc: 'Repeated exclusion from technical architecture deliberations following return from maternity leave.',
      threat: false, physical: false, disc: true, sex: false, stalk: false, cyber: false, contact: false, danger: false,
      case_id: 'RS-2026-000085',
      risk_score: 28,
      risk_level: 'LOW',
      status: 'ASSIGNED',
      officer_id: 'usr_admin_2',
      officer_name: 'Adv. Kavita Rao',
      authority: 'Internal Complaints Committee / HR Grievance',
      days_ago: 36
    },
    // Case 8: Newly Submitted Medium Risk Case
    {
      id: 'INC-2026-00135',
      user_id: 'usr_sneha',
      org_id: 'org_tata_01',
      date: '2026-09-09',
      time: '14:00',
      location: 'Virtual Zoom Client Meeting',
      dept: 'Marketing & PR',
      category: 'Verbal harassment',
      person: 'Siddharth Rao',
      role_rel: 'Client Account Lead',
      desc: 'Made continuous inappropriate double-entendre comments regarding appearance and marital status during client review calls.',
      threat: false, physical: false, disc: false, sex: true, stalk: false, cyber: true, contact: true, danger: false,
      case_id: 'RS-2026-000135',
      risk_score: 55,
      risk_level: 'MEDIUM',
      status: 'SUBMITTED',
      officer_id: null,
      officer_name: null,
      authority: 'Internal Complaints Committee (ICC)',
      days_ago: 1
    }
  ];

  for (const inc of incidents) {
    const incDate = new Date();
    incDate.setDate(incDate.getDate() - inc.days_ago);

    await query(
      `INSERT INTO incidents (
        id, user_id, organization_id, incident_date, incident_time, location, department, category,
        person_involved, person_role_or_relationship, description,
        has_threat, has_physical_contact, has_discrimination, has_sexual_harassment,
        has_stalking, has_cyber_harassment, is_still_in_contact, is_immediate_danger, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'SUBMITTED', $20
      )`,
      [
        inc.id, inc.user_id, inc.org_id, incDate.toISOString().split('T')[0], inc.time, inc.location, inc.dept, inc.category,
        inc.person, inc.role_rel, inc.desc, inc.threat, inc.physical, inc.disc, inc.sex, inc.stalk, inc.cyber,
        inc.contact, inc.danger, incDate
      ]
    );

    const cmpId = `CMP-${inc.id.replace('INC-', '')}`;
    await query(
      `INSERT INTO complaints (
        id, incident_id, user_id, title, summary, nature_of_harassment, detailed_description,
        witnesses, safety_concerns, requested_action, is_private, submission_target, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, 'ICC', $11)`,
      [
        cmpId, inc.id, inc.user_id,
        `Formal Workplace Complaint: ${inc.category} by ${inc.person}`,
        `Complaint submitted by complainant documenting ${inc.category.toLowerCase()} by ${inc.person} in the ${inc.dept} department.`,
        inc.desc.substring(0, 100),
        inc.desc,
        'Team members present during session / Teams chat transcripts attached.',
        inc.threat ? 'Fear of career retaliation and psychological intimidation.' : 'General dignity at work concerns.',
        'Immediate inquiry under the POSH Act 2013 and interim protective measures.',
        incDate
      ]
    );

    // POSH Deadline calculation
    const subDate = new Date(incDate);
    const deadlineDate = new Date(subDate);
    deadlineDate.setDate(deadlineDate.getDate() + 90);

    const now = new Date();
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let deadlineStatus = 'ON_TRACK';
    if (daysRemaining <= 0) deadlineStatus = 'OVERDUE';
    else if (daysRemaining <= 30) deadlineStatus = 'DUE_SOON';

    await query(
      `INSERT INTO cases (
        id, incident_id, complaint_id, complainant_id, organization_id, category,
        risk_score, risk_level, status, assigned_officer_id, assigned_officer_name,
        recommended_authority, posh_deadline_date, is_police_escalated, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)`,
      [
        inc.case_id, inc.id, cmpId, inc.user_id, inc.org_id, inc.category,
        inc.risk_score, inc.risk_level, inc.status, inc.officer_id, inc.officer_name,
        inc.authority, deadlineDate.toISOString().split('T')[0], inc.is_police_escalated || false, incDate
      ]
    );

    // Case status history
    await query(
      `INSERT INTO case_status_history (id, case_id, to_status, changed_by_id, actor_role, notes, created_at)
       VALUES ($1, $2, 'SUBMITTED', $3, 'USER', 'Initial formal complaint submitted.', $4)`,
      [`csh_sub_${inc.case_id}`, inc.case_id, inc.user_id, incDate]
    );

    if (inc.status !== 'SUBMITTED') {
      await query(
        `INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_by_id, actor_role, notes, created_at)
         VALUES ($1, $2, 'SUBMITTED', $3, $4, 'ADMIN', $5, $6)`,
        [`csh_act_${inc.case_id}`, inc.case_id, inc.status, inc.officer_id, `Case progressed to ${inc.status}`, new Date()]
      );
    }

    // Risk assessment
    await query(
      `INSERT INTO risk_assessments (id, case_id, incident_id, score, risk_level, factors, recommended_pathway, urgency_level, explanation, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        `ra_${inc.case_id}`, inc.case_id, inc.id, inc.risk_score, inc.risk_level,
        JSON.stringify([
          inc.threat ? { name: 'Retaliation / Termination Threat', weight: '+25', severity: 'high' } : null,
          inc.physical ? { name: 'Direct Physical Assault', weight: '+30', severity: 'critical' } : null,
          inc.danger ? { name: 'Immediate Safety Danger', weight: '+30', severity: 'critical' } : null,
          inc.stalk ? { name: 'Surveillance & Stalking', weight: '+15', severity: 'medium' } : null
        ].filter(Boolean)),
        inc.authority,
        inc.risk_level === 'CRITICAL' ? 'IMMEDIATE' : 'HIGH',
        `Automated factor analysis evaluated ${inc.risk_score}/100.`,
        incDate
      ]
    );

    // Deadlines
    await query(
      `INSERT INTO deadlines (id, case_id, complaint_submitted_date, investigation_deadline, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [`DL_${inc.case_id}`, inc.case_id, subDate.toISOString().split('T')[0], deadlineDate.toISOString().split('T')[0], deadlineStatus]
    );

    // Police referral if escalated
    if (inc.is_police_escalated) {
      await query(
        `INSERT INTO police_referrals (id, case_id, referral_date, reason, status, assigned_officer_id, assigned_officer_name, fir_number, police_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `POL-REF-${inc.case_id}`, inc.case_id, incDate,
          'Urgent referral from Organization ICC regarding physical assault and unlawful restraint.',
          inc.police_status || 'FIR_INITIATED',
          'usr_demo_police',
          inc.police_officer_name || 'Inspector Vikram Salve',
          inc.fir_number || 'FIR-2026-BKC-0941',
          'Investigating officer visited scene, collected CCTV footage, and recorded witness statements.'
        ]
      );
    }
  }

  // 7. Seed 15 Authentic Digital Evidence Items with real disk files & real SHA-256 hashes!
  const evidenceFiles = [
    { name: 'teams_chat_threat_screenshot.png', content: 'BINARY_PNG_DUMMY_CHAT_EXPORT: Rajesh Sharma: "If you don\'t come to dinner with me tonight, don\'t expect your appraisal to go through. Think about your job Ananya."' },
    { name: 'whatsapp_audio_voicenote_intimidation.mp3', content: 'AUDIO_MOCK_TRANSCRIPT: [Timestamp 22:45] "Ananya, you are making a big mistake ignoring my calls. You know who I know in senior management."' },
    { name: 'appraisal_meeting_transcript_sept8.pdf', content: 'OFFICIAL MEETING NOTES: Annual appraisal deliberation with Director Rajesh Sharma. Clear discrepancy noted in rating without documented performance basis.' },
    { name: 'parking_lot_cctv_screenshot_wrist_grab.png', content: 'CCTV CAPTURE 2026-08-10 21:03:15 BKC Parking B2 Pillar 14: Suspect Vikram Mehta physically barring exit of vehicle.' },
    { name: 'parking_security_guard_log_entry.pdf', content: 'INCIDENT LOG: Security Officer S. Yadav recorded commotion at Pillar 14, complainant visibly distressed, assisted to main gate.' },
    { name: 'slack_harassment_export_priya_case.txt', content: 'SLACK DIRECT MESSAGE ARCHIVE: Channel @rajesh_sharma to @priya_k: "Let\'s keep this project between us in private hotel suite."' },
    { name: 'anonymous_threatening_email_headers.txt', content: 'SMTP MIME EMAIL HEADERS: From: anonymous_vault@proton.me To: ananya.sharma@tata.com Subject: Drop the inquiry or else.' },
    { name: 'doctor_medical_injury_certificate.pdf', content: 'HOSPITAL CASUALTY REPORT: Complainant examined for contusions and soft tissue strain on right wrist consistent with physical restraint.' },
    { name: 'conference_room_calendar_invitation.pdf', content: 'OUTLOOK CALENDAR ENTRY: 1-on-1 private meeting scheduled by Director Rajesh Sharma outside official business hours.' },
    { name: 'harassment_witness_affidavit_colleague.docx', content: 'WITNESS STATEMENT: Senior Engineer R. Varma confirms complainant approached him in distress immediately following 1-on-1 review.' },
    { name: 'zoom_call_audio_recording_extract.wav', content: 'AUDIO WAVE RECORDING: Inappropriate comments during client briefing session by Siddharth Rao.' },
    { name: 'hr_performance_record_history_ananya.pdf', content: 'EMPLOYMENT HISTORY: Consistent top 5% performance ratings over preceding 3 fiscal quarters prior to incident.' },
    { name: 'building_access_card_swipe_records.csv', content: 'SWIPE_ID,LOCATION,TIMESTAMP\n10482,BKC_B2_DOOR_4,2026-08-10 20:58:12\n10984,BKC_B2_DOOR_4,2026-08-10 21:01:45' },
    { name: 'legal_notice_demand_letter_draft.pdf', content: 'LEGAL DRAFT NOTICE: Notice under Section 9 of the Sexual Harassment of Women at Workplace Act, 2013.' },
    { name: 'section_65b_preliminary_forensic_hash_log.txt', content: 'ELECTRONIC FORENSIC LOG: Hardware UUID 99482-12093. Device verified unaltered by System Vault.' }
  ];

  const caseAssignments = [
    'RS-2026-000127', 'RS-2026-000127', 'RS-2026-000127',
    'RS-2026-000098', 'RS-2026-000098', 'RS-2026-000109',
    'RS-2026-000078', 'RS-2026-000098', 'RS-2026-000127',
    'RS-2026-000127', 'RS-2026-000135', 'RS-2026-000127',
    'RS-2026-000098', 'RS-2026-000045', 'RS-2026-000062'
  ];

  console.log(`Generating ${evidenceFiles.length} physical vault files with real cryptographic SHA-256 hashes...`);

  for (let i = 0; i < evidenceFiles.length; i++) {
    const ef = evidenceFiles[i];
    const caseId = caseAssignments[i];
    const evidenceId = `EV-2026-00${String(i + 1).padStart(3, '0')}`;
    const { filePath, hash, size } = createVaultFile(ef.name, ef.content);

    const isShared = caseId === 'RS-2026-000098' || caseId === 'RS-2026-000127';

    await query(
      `INSERT INTO evidence (id, case_id, uploader_id, file_name, file_path, file_type, file_size, sha256_hash, integrity_status, encryption_status, is_shared_with_police)
       VALUES ($1, $2, 'usr_demo_user', $3, $4, $5, $6, $7, 'VERIFIED', 'AES-256 GCM AT REST', $8)`,
      [evidenceId, caseId, ef.name, filePath, ef.name.endsWith('.png') ? 'image/png' : ef.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain', size, hash, isShared]
    );

    await query(
      `INSERT INTO evidence_hashes (id, evidence_id, sha256_hash, verified_by, verification_source, match_status)
       VALUES ($1, $2, $3, 'usr_demo_user', 'SERVER_UPLOAD', 'MATCH')`,
      [`eh_init_${evidenceId}`, evidenceId, hash]
    );
  }

  // 8. Seed 3 Matching Patterns (Escrow Serial Offender Alerts)
  // Pattern 1: Rajesh Sharma (Threshold Reached: 2 reports across TCS and Infosys!)
  const normName1 = 'rajesh sharma';
  const hash1 = crypto.createHash('sha256').update(`escrow_${normName1}`).digest('hex');
  await query(
    `INSERT INTO matching_patterns (id, matched_subject_hash, offender_alias, report_count, organizations_count, risk_level, threshold_met, status, organizations_list)
     VALUES ($1, $2, 'Subject-Rajesh-7A41', 2, 2, 'CRITICAL', true, 'THRESHOLD_REACHED', $3)`,
    ['PAT-2026-008', hash1, JSON.stringify(['Tata Consultancy Services', 'Infosys Technologies'])]
  );

  await query(
    `INSERT INTO matching_reports (id, pattern_id, case_id, offender_normalized_name, offender_department, organization_id)
     VALUES 
     ('MR-PAT-001', 'PAT-2026-008', 'RS-2026-000127', 'rajesh sharma', 'Engineering', 'org_tata_01'),
     ('MR-PAT-002', 'PAT-2026-008', 'RS-2026-000109', 'rajesh sharma', 'Product Design', 'org_infy_02')`
  );

  // Pattern 2: Vikram Mehta (Under Monitoring)
  const normName2 = 'vikram mehta';
  const hash2 = crypto.createHash('sha256').update(`escrow_${normName2}`).digest('hex');
  await query(
    `INSERT INTO matching_patterns (id, matched_subject_hash, offender_alias, report_count, organizations_count, risk_level, threshold_met, status, organizations_list)
     VALUES ($1, $2, 'Subject-Vikram-9B12', 1, 1, 'HIGH', false, 'MONITORING', $3)`,
    ['PAT-2026-014', hash2, JSON.stringify(['Tata Consultancy Services'])]
  );
  await query(
    `INSERT INTO matching_reports (id, pattern_id, case_id, offender_normalized_name, offender_department, organization_id)
     VALUES ('MR-PAT-003', 'PAT-2026-014', 'RS-2026-000098', 'vikram mehta', 'Marketing', 'org_tata_01')`
  );

  // Pattern 3: Karan Singhania (Under Monitoring)
  const normName3 = 'karan singhania';
  const hash3 = crypto.createHash('sha256').update(`escrow_${normName3}`).digest('hex');
  await query(
    `INSERT INTO matching_patterns (id, matched_subject_hash, offender_alias, report_count, organizations_count, risk_level, threshold_met, status, organizations_list)
     VALUES ($1, $2, 'Subject-Karan-3F88', 1, 1, 'HIGH', false, 'MONITORING', $3)`,
    ['PAT-2026-022', hash3, JSON.stringify(['Tata Consultancy Services'])]
  );
  await query(
    `INSERT INTO matching_reports (id, pattern_id, case_id, offender_normalized_name, offender_department, organization_id)
     VALUES ('MR-PAT-004', 'PAT-2026-022', 'RS-2026-000078', 'karan singhania', 'Engineering', 'org_tata_01')`
  );

  // 9. Seed Notifications (at least 5 notifications across roles)
  const notifs = [
    { id: 'notif_1', user_id: 'usr_demo_admin', role: 'ADMIN', title: 'MATCHING ESCROW ALERT: Pattern PAT-2026-008', message: 'Two independent reports identify the same individual across TCS and Infosys. Threshold reached.', type: 'MATCHING_ESCROW_ALERT', link: '/admin' },
    { id: 'notif_2', user_id: 'usr_demo_admin', role: 'ADMIN', title: 'Critical Risk Case: RS-2026-000127', message: 'Case RS-2026-000127 received with critical risk score 86/100 and employment retaliation threat.', type: 'CRITICAL_CASE_RECEIVED', link: '/admin' },
    { id: 'notif_3', user_id: 'usr_demo_police', role: 'POLICE', title: 'Urgent Police Escalation: RS-2026-000098', message: 'Basement parking physical assault case referred by Tata ICC with verified digital CCTV evidence.', type: 'POLICE_REFERRAL_RECEIVED', link: '/police' },
    { id: 'notif_4', user_id: 'usr_demo_user', role: 'USER', title: 'Case RS-2026-000127 Under Investigation', message: 'Dr. Sunita Deshmukh (ICC Lead) has been assigned to your case and interim protection is enacted.', type: 'INVESTIGATOR_ASSIGNED', link: '/user' },
    { id: 'notif_5', user_id: 'usr_demo_user', role: 'USER', title: 'Evidence Vault Integrity Verified', message: 'All 6 evidence items successfully anchored with SHA-256 tamper-evident verification.', type: 'EVIDENCE_VERIFIED', link: '/user' },
    { id: 'notif_6', user_id: 'usr_admin_3', role: 'ADMIN', title: 'POSH Statutory Window Overdue: RS-2026-000045', message: 'Investigation deadline exceeded 90-day statutory window. Immediate compliance report required.', type: 'DEADLINE_OVERDUE', link: '/admin' }
  ];

  for (const n of notifs) {
    await query(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [n.id, n.user_id, n.role, n.title, n.message, n.type, n.link]
    );
  }

  // 10. Seed Messages on Case RS-2026-000127
  const messages = [
    { id: 'msg_1', case_id: 'RS-2026-000127', sender_id: 'usr_demo_admin', sender_role: 'ADMIN', sender_name: 'Dr. Sunita Deshmukh', message: 'Hello Ananya, I have been appointed as the Presiding Officer for your ICC inquiry. We take these threats very seriously. An immediate interim order has been issued separating Mr. Sharma from your appraisal and direct reporting line.' },
    { id: 'msg_2', case_id: 'RS-2026-000127', sender_id: 'usr_demo_user', sender_role: 'USER', sender_name: 'Survivor_A12', message: 'Thank you Dr. Deshmukh. I was terrified of losing my job. I have uploaded the screenshots of his chat messages and the calendar invite to the vault.' },
    { id: 'msg_3', case_id: 'RS-2026-000127', sender_id: 'usr_demo_admin', sender_role: 'ADMIN', sender_name: 'Dr. Sunita Deshmukh', message: 'The digital evidence hashes have been verified. Due to matching pattern alerts indicating prior similar complaints, we are preparing the formal notice to respondent today.' }
  ];

  for (const m of messages) {
    await query(
      `INSERT INTO messages (id, case_id, sender_id, sender_role, sender_name, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [m.id, m.case_id, m.sender_id, m.sender_role, m.sender_name, m.message]
    );
  }

  // 11. Initial Audit Logs
  await query(
    `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, case_id, ip_address, result, details)
     VALUES 
     ('aud_01', 'usr_demo_user', 'Ananya Sharma', 'USER', 'SUBMIT_COMPLAINT', 'CASE', 'RS-2026-000127', '127.0.0.1', 'SUCCESS', '{"risk":86,"category":"Sexual harassment"}'),
     ('aud_02', 'usr_demo_user', 'Ananya Sharma', 'USER', 'UPLOAD_EVIDENCE', 'EVIDENCE', 'RS-2026-000127', '127.0.0.1', 'SUCCESS', '{"fileName":"teams_chat_threat_screenshot.png"}'),
     ('aud_03', 'usr_demo_admin', 'Dr. Sunita Deshmukh', 'ADMIN', 'VERIFY_EVIDENCE_INTEGRITY', 'EVIDENCE', 'RS-2026-000127', '127.0.0.1', 'SUCCESS', '{"status":"INTEGRITY_VERIFIED"}'),
     ('aud_04', 'usr_demo_admin', 'Dr. Sunita Deshmukh', 'ADMIN', 'ASSIGN_INVESTIGATOR', 'CASE', 'RS-2026-000127', '127.0.0.1', 'SUCCESS', '{"officer":"Dr. Sunita Deshmukh"}'),
     ('aud_05', 'usr_demo_police', 'Inspector Vikram Salve', 'POLICE', 'POLICE_VERIFY_EVIDENCE_HASH', 'EVIDENCE', 'RS-2026-000098', '127.0.0.1', 'SUCCESS', '{"match":true}')`
  );

  console.log('--- RakshaSetu Database Seed Completed Successfully! ---');
  console.log('✓ 4 Organizations seeded');
  console.log('✓ 10 Users seeded (Demo User: user@demo.com, Demo Admin: admin@demo.com, Demo Police: police@demo.com)');
  console.log('✓ 8 Incidents, Complaints & Cases seeded (Low, Med, High, Critical)');
  console.log('✓ 15 Real evidence files created on disk with authentic SHA-256 hashes');
  console.log('✓ 3 Matching Escrow Patterns seeded (1 Threshold Reached: Rajesh Sharma)');
  console.log('✓ 6 Notifications & 6 Helplines seeded');
};

// If run directly via node seedData.js
if (process.argv[1] && process.argv[1].includes('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('Seed script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed script failed:', err);
      process.exit(1);
    });
}
