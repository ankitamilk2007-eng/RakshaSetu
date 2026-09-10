import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';
import { calculateFileHash } from '../services/hashService.js';
import fs from 'fs';

export const getPoliceDashboard = async (req, res) => {
  try {
    const totalReferrals = await query(`SELECT COUNT(*) FROM police_referrals`);
    const newReferrals = await query(`SELECT COUNT(*) FROM police_referrals WHERE status = 'PENDING'`);
    const firInitiated = await query(`SELECT COUNT(*) FROM police_referrals WHERE status = 'FIR_INITIATED'`);
    const underInvestigation = await query(`SELECT COUNT(*) FROM police_referrals WHERE status IN ('ACCEPTED', 'INVESTIGATING')`);
    const criticalCases = await query(`SELECT COUNT(*) FROM police_referrals pr JOIN cases c ON pr.case_id = c.id WHERE c.risk_level = 'CRITICAL'`);
    const closedCases = await query(`SELECT COUNT(*) FROM police_referrals WHERE status = 'CLOSED'`);

    return res.json({
      metrics: {
        totalReferrals: parseInt(totalReferrals.rows[0].count, 10),
        newReferrals: parseInt(newReferrals.rows[0].count, 10),
        firInitiated: parseInt(firInitiated.rows[0].count, 10),
        underInvestigation: parseInt(underInvestigation.rows[0].count, 10),
        criticalCases: parseInt(criticalCases.rows[0].count, 10),
        closedCases: parseInt(closedCases.rows[0].count, 10)
      }
    });
  } catch (err) {
    console.error('getPoliceDashboard error:', err);
    return res.status(500).json({ error: 'Failed to retrieve police dashboard metrics.' });
  }
};

export const listReferrals = async (req, res) => {
  try {
    let sql = `
      SELECT pr.*, 
             c.category, c.risk_score, c.risk_level, c.status as case_status,
             c.created_at as complaint_date,
             o.name as organization_name,
             i.location as incident_location,
             i.person_involved,
             i.has_threat, i.has_physical_contact, i.is_immediate_danger,
             (SELECT COUNT(*) FROM evidence WHERE case_id = c.id) as evidence_count
      FROM police_referrals pr
      JOIN cases c ON pr.case_id = c.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN incidents i ON c.incident_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.status) {
      sql += ` AND pr.status = $${params.length + 1}`;
      params.push(req.query.status);
    }
    if (req.query.riskLevel) {
      sql += ` AND c.risk_level = $${params.length + 1}`;
      params.push(req.query.riskLevel);
    }

    sql += ` ORDER BY 
      CASE WHEN c.risk_level = 'CRITICAL' THEN 1 ELSE 2 END ASC,
      pr.referral_date DESC`;

    const result = await query(sql, params);
    return res.json({ referrals: result.rows });
  } catch (err) {
    console.error('listReferrals error:', err);
    return res.status(500).json({ error: 'Failed to retrieve police referrals.' });
  }
};

export const updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, firNumber, policeNotes, assignedOfficerName } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'INVESTIGATING', 'FIR_INITIATED', 'ACTION_TAKEN', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const refRes = await query(`SELECT pr.*, c.complainant_id FROM police_referrals pr JOIN cases c ON pr.case_id = c.id WHERE pr.id = $1`, [id]);
    if (refRes.rows.length === 0) {
      return res.status(404).json({ error: 'Referral not found.' });
    }
    const ref = refRes.rows[0];

    await query(
      `UPDATE police_referrals 
       SET status = $1, 
           fir_number = COALESCE($2, fir_number),
           police_notes = COALESCE($3, police_notes),
           assigned_officer_id = $4,
           assigned_officer_name = COALESCE($5, assigned_officer_name),
           acknowledged_at = COALESCE(acknowledged_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [status, firNumber || null, policeNotes || null, req.user.id, assignedOfficerName || req.user.full_name, id]
    );

    // Timeline event on case
    await query(
      `INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_by_id, actor_role, notes)
       VALUES ($1, $2, 'POLICE_REFERRAL', $3, $4, 'POLICE', $5)`,
      [
        `csh_${Date.now()}`,
        ref.case_id,
        status,
        req.user.id,
        `Police Status: ${status}. FIR: ${firNumber || 'Pending'}. Notes: ${policeNotes || 'Inquiry active.'}`
      ]
    );

    // Notify Complainant
    await query(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link)
       VALUES ($1, $2, 'USER', $3, $4, 'POLICE_UPDATE_RECEIVED', $5)`,
      [
        `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        ref.complainant_id,
        `Law Enforcement Update: Case ${ref.case_id}`,
        `Status updated to ${status}. ${firNumber ? `FIR/Docket Number: ${firNumber}.` : ''} Assigned Officer: ${assignedOfficerName || req.user.full_name}`,
        '/user'
      ]
    );

    // Notify Admins
    const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    for (const a of admins.rows) {
      await query(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link)
         VALUES ($1, $2, 'ADMIN', $3, $4, 'POLICE_STATUS_UPDATE', $5)`,
        [
          `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          a.id,
          `Police Status Update: Case ${ref.case_id}`,
          `Police assigned officer marked status as ${status} (FIR: ${firNumber || 'None'}).`,
          '/admin'
        ]
      );
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'UPDATE_POLICE_REFERRAL',
      resource: 'POLICE_REFERRAL',
      caseId: ref.case_id,
      details: { status, firNumber, policeNotes }
    });

    return res.json({ message: 'Police referral status updated successfully.' });
  } catch (err) {
    console.error('updateReferralStatus error:', err);
    return res.status(500).json({ error: 'Failed to update police referral status.' });
  }
};

export const verifyIndependentHash = async (req, res) => {
  try {
    const { evidenceId, testHash } = req.body;

    const result = await query(`SELECT * FROM evidence WHERE id = $1`, [evidenceId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence record not found.' });
    }

    const ev = result.rows[0];

    // Compute live hash of disk file
    let liveDiskHash = ev.sha256_hash;
    if (fs.existsSync(ev.file_path)) {
      liveDiskHash = calculateFileHash(ev.file_path);
    }

    const expectedHash = ev.sha256_hash;
    const providedHash = (testHash || liveDiskHash).trim().toLowerCase();
    const isMatch = expectedHash.toLowerCase() === providedHash;

    await query(
      `INSERT INTO evidence_hashes (id, evidence_id, sha256_hash, verified_by, verification_source, match_status)
       VALUES ($1, $2, $3, $4, 'POLICE_FORENSIC_CHECK', $5)`,
      [`eh_${Date.now()}`, ev.id, providedHash, req.user.id, isMatch ? 'MATCH' : 'MISMATCH']
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'POLICE_VERIFY_EVIDENCE_HASH',
      resource: 'EVIDENCE',
      caseId: ev.case_id,
      details: { evidenceId, isMatch, providedHash, expectedHash }
    });

    return res.json({
      evidenceId: ev.id,
      fileName: ev.file_name,
      expectedHash,
      actualLiveHash: liveDiskHash,
      providedHash,
      isMatch,
      status: isMatch ? 'VERIFIED_TAMPER_FREE' : 'MISMATCH_INTEGRITY_COMPROMISED',
      verifiedAt: new Date().toISOString(),
      officer: req.user.full_name,
      department: req.user.department || 'Cyber Crime & Women Safety Cell'
    });
  } catch (err) {
    console.error('verifyIndependentHash error:', err);
    return res.status(500).json({ error: 'Forensic verification failed.' });
  }
};
