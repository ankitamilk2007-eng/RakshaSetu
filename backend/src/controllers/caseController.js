import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';

export const listCases = async (req, res) => {
  try {
    let sql = `
      SELECT c.*, 
             o.name as organization_name,
             u.full_name as complainant_name,
             u.anonymous_display_name,
             i.person_involved,
             i.location as incident_location,
             i.incident_date,
             (SELECT COUNT(*) FROM evidence WHERE case_id = c.id) as evidence_count,
             (SELECT COUNT(*) FROM messages WHERE case_id = c.id) as message_count,
             d.status as deadline_status,
             d.investigation_deadline,
             pr.status as police_status
      FROM cases c
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN users u ON c.complainant_id = u.id
      LEFT JOIN incidents i ON c.incident_id = i.id
      LEFT JOIN deadlines d ON c.id = d.case_id
      LEFT JOIN police_referrals pr ON c.id = pr.case_id
      WHERE 1=1
    `;
    const params = [];

    // Role-based access control
    if (req.user.role === 'USER') {
      sql += ` AND c.complainant_id = $${params.length + 1}`;
      params.push(req.user.id);
    } else if (req.user.role === 'POLICE') {
      sql += ` AND (c.is_police_escalated = true OR pr.id IS NOT NULL)`;
    } else if (req.user.role === 'ADMIN') {
      // In production would filter by req.user.organization_id, or allow multi-org demo
      if (req.query.organizationId) {
        sql += ` AND c.organization_id = $${params.length + 1}`;
        params.push(req.query.organizationId);
      }
    }

    // Optional query filters
    if (req.query.status) {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(req.query.status);
    }
    if (req.query.riskLevel) {
      sql += ` AND c.risk_level = $${params.length + 1}`;
      params.push(req.query.riskLevel);
    }
    if (req.query.category) {
      sql += ` AND c.category = $${params.length + 1}`;
      params.push(req.query.category);
    }
    if (req.query.search) {
      sql += ` AND (c.id ILIKE $${params.length + 1} OR i.person_involved ILIKE $${params.length + 1} OR c.category ILIKE $${params.length + 1})`;
      params.push(`%${req.query.search}%`);
    }

    sql += ` ORDER BY 
      CASE WHEN c.risk_level = 'CRITICAL' THEN 1
           WHEN c.risk_level = 'HIGH' THEN 2
           WHEN c.risk_level = 'MEDIUM' THEN 3
           ELSE 4 END ASC,
      c.created_at DESC`;

    const result = await query(sql, params);
    return res.json({ cases: result.rows });
  } catch (err) {
    console.error('listCases error:', err);
    return res.status(500).json({ error: 'Failed to retrieve cases.' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseRes = await query(
      `SELECT c.*, 
              o.name as organization_name,
              u.full_name as complainant_name,
              u.email as complainant_email,
              u.phone as complainant_phone,
              u.department as complainant_department,
              u.anonymous_display_name,
              cons.allow_evidence_sharing,
              cons.allow_police_escalation,
              i.incident_date, i.incident_time, i.location as incident_location,
              i.category as incident_category, i.person_involved, i.person_role_or_relationship,
              i.description as raw_description, i.has_threat, i.has_physical_contact,
              i.has_discrimination, i.has_sexual_harassment, i.has_stalking, i.has_cyber_harassment,
              i.is_still_in_contact, i.is_immediate_danger, i.audio_url, i.transcript,
              cmp.title as complaint_title, cmp.summary as complaint_summary,
              cmp.nature_of_harassment, cmp.detailed_description, cmp.witnesses,
              cmp.safety_concerns, cmp.requested_action,
              d.complaint_submitted_date, d.investigation_deadline, d.status as deadline_status,
              pr.id as police_referral_id, pr.status as police_status, pr.fir_number,
              pr.police_notes, pr.assigned_officer_name as police_officer_name, pr.referral_date
       FROM cases c
       LEFT JOIN organizations o ON c.organization_id = o.id
       LEFT JOIN users u ON c.complainant_id = u.id
       LEFT JOIN consents cons ON u.id = cons.user_id
       LEFT JOIN incidents i ON c.incident_id = i.id
       LEFT JOIN complaints cmp ON c.complaint_id = cmp.id
       LEFT JOIN deadlines d ON c.id = d.case_id
       LEFT JOIN police_referrals pr ON c.id = pr.case_id
       WHERE c.id = $1`,
      [id]
    );

    if (caseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Case record not found.' });
    }

    const caseData = caseRes.rows[0];

    // RBAC validation
    if (req.user.role === 'USER' && caseData.complainant_id !== req.user.id) {
      return res.status(403).json({ error: 'Access forbidden to private case of another user.' });
    }
    if (req.user.role === 'POLICE' && !caseData.is_police_escalated && !caseData.police_referral_id) {
      return res.status(403).json({ error: 'Access forbidden. This case has not been referred to law enforcement.' });
    }

    // Complainant identity masking if privacy was requested
    if (req.user.role === 'ADMIN' && !caseData.allow_evidence_sharing) {
      // Keep name visible or masked according to consent
    }
    if (req.user.role === 'POLICE' && !caseData.allow_police_escalation && !caseData.is_police_escalated) {
      caseData.complainant_name = caseData.anonymous_display_name || 'Protected Complainant';
      caseData.complainant_email = '[RESTRICTED_BY_CONSENT]';
      caseData.complainant_phone = '[RESTRICTED_BY_CONSENT]';
    }

    // Attached Evidence
    const evRes = await query(
      `SELECT * FROM evidence WHERE case_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // Status Timeline
    const timelineRes = await query(
      `SELECT csh.*, u.full_name as changed_by_name 
       FROM case_status_history csh 
       LEFT JOIN users u ON csh.changed_by_id = u.id 
       WHERE csh.case_id = $1 
       ORDER BY csh.created_at ASC`,
      [id]
    );

    // Risk factors
    const riskRes = await query(
      `SELECT * FROM risk_assessments WHERE case_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    // Secure Messages
    const msgRes = await query(
      `SELECT * FROM messages WHERE case_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'VIEW_CASE_DETAILS',
      resource: 'CASE',
      caseId: id,
      details: { role: req.user.role }
    });

    return res.json({
      case: caseData,
      evidence: evRes.rows,
      timeline: timelineRes.rows,
      riskAssessment: riskRes.rows[0] || null,
      messages: msgRes.rows
    });
  } catch (err) {
    console.error('getCaseById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve case details.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    const caseRes = await query(`SELECT complainant_id, organization_id FROM cases WHERE id = $1`, [id]);
    if (caseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const caseItem = caseRes.rows[0];

    const messageId = `MSG-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const senderRole = req.user.role;
    const senderName = senderRole === 'USER' ? (req.user.anonymous_display_name || 'Complainant') : req.user.full_name;

    const result = await query(
      `INSERT INTO messages (id, case_id, sender_id, sender_role, sender_name, message, attachments)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [messageId, id, req.user.id, senderRole, senderName, message.trim(), JSON.stringify(attachments)]
    );

    // Notify counterpart
    if (senderRole === 'USER') {
      const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
      for (const a of admins.rows) {
        await query(
          `INSERT INTO notifications (id, user_id, role, title, message, type, link)
           VALUES ($1, $2, 'ADMIN', $3, $4, 'CASE_MESSAGE_RECEIVED', $5)`,
          [`notif-${Date.now()}-${Math.random().toString(36).substring(7)}`, a.id, `New message on Case ${id}`, message.substring(0, 80), '/admin']
        );
      }
    } else {
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link)
         VALUES ($1, $2, 'USER', $3, $4, 'CASE_MESSAGE_RECEIVED', $5)`,
        [`notif-${Date.now()}-${Math.random().toString(36).substring(7)}`, caseItem.complainant_id, `Update on Case ${id}`, `The inquiry officer has sent a secure message regarding your case.`, '/user']
      );
    }

    return res.status(201).json({
      message: 'Message sent securely.',
      sentMessage: result.rows[0]
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};
