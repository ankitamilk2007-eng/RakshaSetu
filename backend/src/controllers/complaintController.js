import { query } from '../config/db.js';
import { generateStructuredComplaint, calculateRiskScore, recommendAuthority } from '../services/aiService.js';
import { processMatchingEscrow } from '../services/matchingEscrowService.js';
import { calculatePoshDeadline } from '../services/poshDeadlineService.js';
import { logAuditEvent } from '../services/auditService.js';

export const generateAIComplaint = async (req, res) => {
  try {
    const {
      rawStory,
      category,
      personInvolved,
      personRoleOrRelationship,
      incidentDate,
      incidentTime,
      location,
      department,
      hasThreat = false,
      hasPhysicalContact = false,
      hasDiscrimination = false,
      hasSexualHarassment = false,
      hasStalking = false,
      hasCyberHarassment = false,
      isImmediateDanger = false,
      isStillInContact = false,
      witnesses = '',
      evidenceIds = []
    } = req.body;

    // Fetch attached evidence filenames if any
    let evidenceList = [];
    if (evidenceIds && evidenceIds.length > 0) {
      const evRes = await query(`SELECT file_name FROM evidence WHERE id = ANY($1)`, [evidenceIds]);
      evidenceList = evRes.rows.map(r => r.file_name);
    }

    // 1. Generate Structured Legal Complaint
    const structured = generateStructuredComplaint({
      rawStory,
      category,
      personInvolved,
      personRoleOrRelationship,
      incidentDate,
      incidentTime,
      location,
      department,
      hasThreat,
      hasPhysicalContact,
      hasDiscrimination,
      hasSexualHarassment,
      hasStalking,
      hasCyberHarassment,
      isImmediateDanger,
      witnesses,
      evidenceList
    });

    // 2. Compute Transparent AI Risk Scoring
    const risk = calculateRiskScore({
      category,
      description: rawStory || structured.detailedDescription,
      hasThreat,
      hasPhysicalContact,
      hasStalking,
      hasCyberHarassment,
      isImmediateDanger,
      isStillInContact
    });

    // 3. Formulate Authority Recommendation
    const recommendation = recommendAuthority({
      category,
      riskScore: risk.score,
      hasPhysicalContact,
      hasThreat,
      hasStalking,
      isImmediateDanger
    });

    return res.json({
      complaint: structured,
      risk,
      recommendation
    });
  } catch (err) {
    console.error('generateAIComplaint error:', err);
    return res.status(500).json({ error: 'Failed to generate AI complaint.' });
  }
};

export const submitComplaint = async (req, res) => {
  try {
    const {
      incidentId,
      submissionTarget = 'ICC', // 'PRIVATE', 'ICC', 'POLICE'
      structuredComplaint,
      riskData,
      recommendationData,
      evidenceIds = []
    } = req.body;

    if (!incidentId || !structuredComplaint) {
      return res.status(400).json({ error: 'Incident ID and structured complaint data are required.' });
    }

    // Retrieve the base incident
    const incRes = await query(`SELECT * FROM incidents WHERE id = $1 AND user_id = $2`, [incidentId, req.user.id]);
    if (incRes.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found or unauthorized.' });
    }
    const incident = incRes.rows[0];

    // If saving privately, update complaint without creating a public case
    const complaintId = `CMP-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const isPrivate = submissionTarget === 'PRIVATE';

    await query(
      `INSERT INTO complaints (
        id, incident_id, user_id, title, summary, nature_of_harassment, detailed_description,
        witnesses, safety_concerns, requested_action, is_private, submission_target
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        complaintId,
        incident.id,
        req.user.id,
        structuredComplaint.title,
        structuredComplaint.summary,
        structuredComplaint.natureOfHarassment,
        structuredComplaint.detailedDescription,
        structuredComplaint.witnesses,
        structuredComplaint.safetyConcerns,
        structuredComplaint.requestedAction,
        isPrivate,
        submissionTarget
      ]
    );

    if (isPrivate) {
      await logAuditEvent({
        actorId: req.user.id,
        actorName: req.user.full_name,
        actorRole: req.user.role,
        action: 'SAVE_COMPLAINT_PRIVATELY',
        resource: 'COMPLAINT',
        details: { complaintId, incidentId: incident.id }
      });

      return res.status(200).json({
        message: 'Complaint successfully saved privately in your vault. No external party notified.',
        complaintId,
        isPrivate: true
      });
    }

    // Formal submission: Generate Case ID (e.g. RS-2026-000127)
    const caseId = `RS-2026-000${String(Math.floor(Math.random() * 900) + 100)}`;
    const riskScore = riskData?.score || 65;
    const riskLevel = riskData?.riskLevel || 'HIGH';
    const isPoliceEscalated = submissionTarget === 'POLICE';

    const deadlineInfo = calculatePoshDeadline(new Date());

    const caseRes = await query(
      `INSERT INTO cases (
        id, incident_id, complaint_id, complainant_id, organization_id, category,
        risk_score, risk_level, status, recommended_authority, posh_deadline_date,
        is_police_escalated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SUBMITTED', $9, $10, $11)
      RETURNING *`,
      [
        caseId,
        incident.id,
        complaintId,
        req.user.id,
        req.user.organization_id || 'org_tata_01',
        incident.category,
        riskScore,
        riskLevel,
        recommendationData?.recommendedAuthority || 'Internal Complaints Committee',
        deadlineInfo.deadlineDate,
        isPoliceEscalated
      ]
    );

    const newCase = caseRes.rows[0];

    // Record initial case status history
    await query(
      `INSERT INTO case_status_history (id, case_id, to_status, changed_by_id, actor_role, notes)
       VALUES ($1, $2, 'SUBMITTED', $3, 'USER', 'Formal complaint submitted by complainant.')`,
      [`csh_${Date.now()}`, caseId, req.user.id]
    );

    // Save Risk Assessment record
    if (riskData) {
      await query(
        `INSERT INTO risk_assessments (id, case_id, incident_id, score, risk_level, factors, recommended_pathway, urgency_level, explanation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `ra_${Date.now()}`,
          caseId,
          incident.id,
          riskScore,
          riskLevel,
          JSON.stringify(riskData.factors || []),
          recommendationData?.recommendedAuthority || 'Internal Complaints Committee',
          recommendationData?.urgency || 'HIGH',
          riskData.explanation || 'AI Risk Evaluation'
        ]
      );
    }

    // Save POSH statutory 90-day deadline
    await query(
      `INSERT INTO deadlines (id, case_id, complaint_submitted_date, investigation_deadline, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [`DL_${caseId}`, caseId, deadlineInfo.submittedDate, deadlineInfo.deadlineDate, deadlineInfo.status]
    );

    // Link uploaded evidence to this case
    if (evidenceIds && evidenceIds.length > 0) {
      await query(
        `UPDATE evidence SET case_id = $1 WHERE id = ANY($2)`,
        [caseId, evidenceIds]
      );
    } else {
      // Link any evidence belonging to incident
      await query(
        `UPDATE evidence SET case_id = $1 WHERE incident_id = $2 AND case_id IS NULL`,
        [caseId, incident.id]
      );
    }

    // Mark incident status as SUBMITTED
    await query(`UPDATE incidents SET status = 'SUBMITTED' WHERE id = $1`, [incident.id]);

    // PROCESS MATCHING ESCROW!
    const escrowResult = await processMatchingEscrow({
      caseId,
      incidentId: incident.id,
      personInvolved: incident.person_involved,
      department: incident.department,
      organizationId: req.user.organization_id || 'org_tata_01'
    });

    // If police escalation was chosen directly by survivor, create referral
    if (isPoliceEscalated) {
      await query(
        `INSERT INTO police_referrals (id, case_id, reason, status)
         VALUES ($1, $2, $3, 'PENDING')`,
        [`POL-REF-${caseId}`, caseId, 'Complainant directly requested Police Escalation due to immediate danger / criminal threats.']
      );

      // Notify Police officers
      const policeOfficers = await query(`SELECT id FROM users WHERE role = 'POLICE'`);
      for (const p of policeOfficers.rows) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, type, link)
           VALUES ($1, $2, 'POLICE', $3, $4, 'POLICE_REFERRAL_RECEIVED', $5)`,
          [
            `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            p.id,
            `Urgent Police Referral: Case ${caseId}`,
            `A high-risk workplace harassment case with criminal indicators has been escalated for investigation.`,
            '/police'
          ]
        );
      }
    }

    // Notify Admins / ICC
    const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    for (const a of admins.rows) {
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link)
         VALUES ($1, $2, 'ADMIN', $3, $4, 'NEW_COMPLAINT_SUBMITTED', $5)`,
        [
          `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          a.id,
          `New Case Submitted: ${caseId} (${riskLevel})`,
          `A new formal complaint (${incident.category}) was submitted. AI evaluated risk score is ${riskScore}/100.`,
          '/admin'
        ]
      );
    }

    // Audit log
    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'SUBMIT_COMPLAINT',
      resource: 'CASE',
      caseId,
      details: {
        complaintId,
        riskScore,
        riskLevel,
        submissionTarget,
        escrowPatternId: escrowResult?.patternId
      }
    });

    return res.status(201).json({
      message: 'Complaint formally submitted. Case ID generated and tracking active.',
      caseId,
      case: newCase,
      escrowAlertTriggered: escrowResult?.isNewThresholdReached || false,
      patternId: escrowResult?.patternId
    });
  } catch (err) {
    console.error('submitComplaint error:', err);
    return res.status(500).json({ error: 'Failed to submit complaint.' });
  }
};
