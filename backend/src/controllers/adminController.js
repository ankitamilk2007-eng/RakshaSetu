import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';
import { syncCaseDeadlines } from '../services/poshDeadlineService.js';

export const getAdminDashboard = async (req, res) => {
  try {
    await syncCaseDeadlines();

    const totalCases = await query(`SELECT COUNT(*) FROM cases`);
    const newCases = await query(`SELECT COUNT(*) FROM cases WHERE status = 'SUBMITTED'`);
    const criticalCases = await query(`SELECT COUNT(*) FROM cases WHERE risk_level IN ('CRITICAL', 'HIGH') AND status NOT IN ('RESOLVED', 'CLOSED')`);
    const underInvestigation = await query(`SELECT COUNT(*) FROM cases WHERE status IN ('ASSIGNED', 'UNDER_INVESTIGATION', 'EVIDENCE_REVIEW')`);
    const resolvedCases = await query(`SELECT COUNT(*) FROM cases WHERE status IN ('RESOLVED', 'CLOSED')`);
    const overdueCases = await query(`SELECT COUNT(*) FROM deadlines WHERE status = 'OVERDUE'`);
    const patternAlerts = await query(`SELECT COUNT(*) FROM matching_patterns WHERE threshold_met = true`);
    const totalEvidence = await query(`SELECT COUNT(*) FROM evidence`);

    // Calculate average resolution time (simulated benchmark or actual days)
    const avgDays = 18;

    return res.json({
      metrics: {
        totalCases: parseInt(totalCases.rows[0].count, 10),
        newCases: parseInt(newCases.rows[0].count, 10),
        criticalCases: parseInt(criticalCases.rows[0].count, 10),
        underInvestigation: parseInt(underInvestigation.rows[0].count, 10),
        resolvedCases: parseInt(resolvedCases.rows[0].count, 10),
        overdueCases: parseInt(overdueCases.rows[0].count, 10),
        patternAlerts: parseInt(patternAlerts.rows[0].count, 10),
        totalEvidence: parseInt(totalEvidence.rows[0].count, 10),
        averageResolutionDays: avgDays
      }
    });
  } catch (err) {
    console.error('getAdminDashboard error:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin dashboard metrics.' });
  }
};

export const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedOfficerId, assignedOfficerName } = req.body;

    const validStatuses = ['SUBMITTED', 'RECEIVED', 'ASSIGNED', 'UNDER_INVESTIGATION', 'EVIDENCE_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const currentCaseRes = await query(`SELECT * FROM cases WHERE id = $1`, [id]);
    if (currentCaseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }
    const currentCase = currentCaseRes.rows[0];

    await query(
      `UPDATE cases 
       SET status = $1, 
           assigned_officer_id = COALESCE($2, assigned_officer_id),
           assigned_officer_name = COALESCE($3, assigned_officer_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, assignedOfficerId || null, assignedOfficerName || null, id]
    );

    // Record timeline step
    await query(
      `INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_by_id, actor_role, notes)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN', $6)`,
      [`csh_${Date.now()}`, id, currentCase.status, status, req.user.id, notes || `Status updated to ${status} by ICC Officer`]
    );

    // Notify Complainant
    await query(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link)
       VALUES ($1, $2, 'USER', $3, $4, 'CASE_STATUS_CHANGED', $5)`,
      [
        `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        currentCase.complainant_id,
        `Case Update: ${id} is now ${status.replace(/_/g, ' ')}`,
        `Your case status was updated. Notes: ${notes || 'Proceeding through inquiry stages.'}`,
        '/user'
      ]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'UPDATE_CASE_STATUS',
      resource: 'CASE',
      caseId: id,
      details: { from: currentCase.status, to: status, notes }
    });

    const updated = await query(`SELECT * FROM cases WHERE id = $1`, [id]);
    return res.json({
      message: 'Case status updated successfully.',
      case: updated.rows[0]
    });
  } catch (err) {
    console.error('updateCaseStatus error:', err);
    return res.status(500).json({ error: 'Failed to update case status.' });
  }
};

export const assignInvestigator = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId, officerName, notes } = req.body;

    if (!officerName) {
      return res.status(400).json({ error: 'Officer name is required.' });
    }

    const currentCase = await query(`SELECT * FROM cases WHERE id = $1`, [id]);
    if (currentCase.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    await query(
      `UPDATE cases 
       SET assigned_officer_id = $1, assigned_officer_name = $2, status = 'UNDER_INVESTIGATION', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [officerId || req.user.id, officerName, id]
    );

    await query(
      `INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_by_id, actor_role, notes)
       VALUES ($1, $2, $3, 'UNDER_INVESTIGATION', $4, 'ADMIN', $5)`,
      [`csh_${Date.now()}`, id, currentCase.rows[0].status, req.user.id, `Assigned investigator: ${officerName}. ${notes || ''}`]
    );

    await query(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link)
       VALUES ($1, $2, 'USER', $3, $4, 'INVESTIGATOR_ASSIGNED', $5)`,
      [
        `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        currentCase.rows[0].complainant_id,
        `Investigator Assigned for Case ${id}`,
        `${officerName} has been appointed to lead your inquiry. Status is now Under Investigation.`,
        '/user'
      ]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'ASSIGN_INVESTIGATOR',
      resource: 'CASE',
      caseId: id,
      details: { officerName, officerId }
    });

    return res.json({ message: `Case ${id} successfully assigned to ${officerName}.` });
  } catch (err) {
    console.error('assignInvestigator error:', err);
    return res.status(500).json({ error: 'Failed to assign investigator.' });
  }
};

export const escalateToPolice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, policeNotes } = req.body;

    const caseRes = await query(`SELECT * FROM cases WHERE id = $1`, [id]);
    if (caseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const c = caseRes.rows[0];

    // Mark case as escalated
    await query(
      `UPDATE cases 
       SET is_police_escalated = true, 
           recommended_authority = 'Police Escalation (Active)',
           risk_level = 'CRITICAL',
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );

    // Create or update police_referral record
    const refId = `POL-REF-${id}`;
    const existingRef = await query(`SELECT id FROM police_referrals WHERE case_id = $1`, [id]);
    if (existingRef.rows.length === 0) {
      await query(
        `INSERT INTO police_referrals (id, case_id, referred_by_id, reason, police_notes, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')`,
        [refId, id, req.user.id, reason || 'Escalated by Organization ICC due to serious criminal harassment/threat indicators.', policeNotes || '']
      );
    } else {
      await query(
        `UPDATE police_referrals SET reason = $1, status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE case_id = $2`,
        [reason, id]
      );
    }

    // Share evidence with police
    await query(`UPDATE evidence SET is_shared_with_police = true WHERE case_id = $1`, [id]);

    // Timeline event
    await query(
      `INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_by_id, actor_role, notes)
       VALUES ($1, $2, $3, $3, $4, 'ADMIN', $5)`,
      [`csh_${Date.now()}`, id, c.status, req.user.id, `Formal Escalation to Law Enforcement Authority: ${reason}`]
    );

    // Notify Police Portal
    const policeOfficers = await query(`SELECT id FROM users WHERE role = 'POLICE'`);
    for (const p of policeOfficers.rows) {
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link)
         VALUES ($1, $2, 'POLICE', $3, $4, 'POLICE_REFERRAL_RECEIVED', $5)`,
        [
          `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          p.id,
          `Urgent Referral: Case ${id}`,
          `Case ${id} escalated by ICC (${req.user.organization_name || 'Organization'}). Immediate review requested.`,
          '/police'
        ]
      );
    }

    // Notify Complainant
    await query(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link)
       VALUES ($1, $2, 'USER', $3, $4, 'POLICE_REFERRAL_SUBMITTED', $5)`,
      [
        `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        c.complainant_id,
        `Case Escalated to Law Enforcement: ${id}`,
        `Your case has been formally referred to the Police Authority for criminal inquiry.`,
        '/user'
      ]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'ESCALATE_TO_POLICE',
      resource: 'CASE',
      caseId: id,
      details: { reason }
    });

    return res.json({
      message: `Case ${id} successfully escalated to Police portal. Law enforcement officers notified.`,
      referralId: refId
    });
  } catch (err) {
    console.error('escalateToPolice error:', err);
    return res.status(500).json({ error: 'Failed to escalate case to police.' });
  }
};

export const listMatchingPatterns = async (req, res) => {
  try {
    const result = await query(
      `SELECT mp.*,
              (SELECT json_agg(json_build_object('case_id', mr.case_id, 'department', mr.offender_department, 'date', mr.created_at))
               FROM matching_reports mr WHERE mr.pattern_id = mp.id) as linked_reports
       FROM matching_patterns mp
       ORDER BY mp.threshold_met DESC, mp.report_count DESC, mp.created_at DESC`
    );

    return res.json({ patterns: result.rows });
  } catch (err) {
    console.error('listMatchingPatterns error:', err);
    return res.status(500).json({ error: 'Failed to retrieve matching escrow patterns.' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    // 1. Cases by category
    const catRes = await query(`SELECT category as name, COUNT(*) as count FROM cases GROUP BY category`);

    // 2. Cases by risk
    const riskRes = await query(`SELECT risk_level as name, COUNT(*) as count FROM cases GROUP BY risk_level`);

    // 3. Department distribution
    const deptRes = await query(`SELECT u.department as name, COUNT(*) as count FROM cases c JOIN users u ON c.complainant_id = u.id GROUP BY u.department`);

    // 4. Monthly trends (sample distribution)
    const monthlyTrends = [
      { month: 'Apr', total: 4, resolved: 3, critical: 1 },
      { month: 'May', total: 6, resolved: 5, critical: 2 },
      { month: 'Jun', total: 8, resolved: 6, critical: 2 },
      { month: 'Jul', total: 11, resolved: 8, critical: 3 },
      { month: 'Aug', total: 9, resolved: 7, critical: 2 },
      { month: 'Sep', total: 14, resolved: 9, critical: 5 }
    ];

    return res.json({
      categories: catRes.rows,
      riskDistribution: riskRes.rows,
      departments: deptRes.rows,
      monthlyTrends
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

export const listAuditLogs = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`
    );
    return res.json({ logs: result.rows });
  } catch (err) {
    console.error('listAuditLogs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
};

export const listDeadlines = async (req, res) => {
  try {
    await syncCaseDeadlines();

    const result = await query(
      `SELECT d.*, c.category, c.status as case_status, c.assigned_officer_name,
              i.person_involved
       FROM deadlines d
       JOIN cases c ON d.case_id = c.id
       LEFT JOIN incidents i ON c.incident_id = i.id
       ORDER BY 
         CASE WHEN d.status = 'OVERDUE' THEN 1
              WHEN d.status = 'DUE_SOON' THEN 2
              ELSE 3 END ASC,
         d.investigation_deadline ASC`
    );

    return res.json({ deadlines: result.rows });
  } catch (err) {
    console.error('listDeadlines error:', err);
    return res.status(500).json({ error: 'Failed to fetch deadlines.' });
  }
};
