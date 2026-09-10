import crypto from 'crypto';
import { query } from '../config/db.js';

/**
 * Normalizes offender name (lowercases, removes honorifics, trims excess spaces)
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(mr|ms|mrs|dr|prof|shri|smt)\.?\s+/gi, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Computes deterministic pseudonym hash for confidential escrow matching
 */
export const hashIdentity = (normalizedName) => {
  return crypto.createHash('sha256').update(`escrow_${normalizedName}`).digest('hex');
};

/**
 * Process a new complaint through Matching Escrow
 */
export const processMatchingEscrow = async ({ caseId, incidentId, personInvolved, department, organizationId }) => {
  const normalized = normalizeName(personInvolved);
  if (!normalized || normalized.length < 3) return null;

  const identityHash = hashIdentity(normalized);

  // Check if an existing pattern exists for this identity
  const patternRes = await query(
    `SELECT * FROM matching_patterns WHERE matched_subject_hash = $1`,
    [identityHash]
  );

  let patternId;
  let isNewThresholdReached = false;

  if (patternRes.rows.length > 0) {
    const pattern = patternRes.rows[0];
    patternId = pattern.id;

    // Check if this case is already linked
    const existingReport = await query(
      `SELECT id FROM matching_reports WHERE pattern_id = $1 AND case_id = $2`,
      [patternId, caseId]
    );

    if (existingReport.rows.length === 0) {
      // Link this case
      await query(
        `INSERT INTO matching_reports (id, pattern_id, case_id, incident_id, offender_normalized_name, offender_department, organization_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`MR-${Date.now()}-${Math.floor(Math.random()*1000)}`, patternId, caseId, incidentId, normalized, department, organizationId]
      );

      // Increment count
      const updatedCount = pattern.report_count + 1;
      const thresholdMet = updatedCount >= 2;
      isNewThresholdReached = thresholdMet && !pattern.threshold_met;

      await query(
        `UPDATE matching_patterns 
         SET report_count = $1, 
             threshold_met = $2, 
             risk_level = 'CRITICAL',
             status = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [updatedCount, thresholdMet, thresholdMet ? 'THRESHOLD_REACHED' : 'MONITORING', patternId]
      );

      // Notify all admins if threshold reached
      if (isNewThresholdReached) {
        const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
        for (const admin of admins.rows) {
          await query(
            `INSERT INTO notifications (id, user_id, role, title, message, type, link)
             VALUES ($1, $2, 'ADMIN', $3, $4, 'MATCHING_ESCROW_ALERT', $5)`,
            [
              `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              admin.id,
              'MATCHING ESCROW ALERT: Serial Offender Pattern Detected',
              `Multiple independent reports (${updatedCount}) have identified the same individual across organizations/departments under Pattern ${patternId}.`,
              '/admin'
            ]
          );
        }
      }
    }
  } else {
    // First report for this individual - initialize pattern in escrow
    patternId = `PAT-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const alias = `Subject-${normalized.split(' ')[0] || 'Unknown'}-${identityHash.substring(0, 4).toUpperCase()}`;

    await query(
      `INSERT INTO matching_patterns (id, matched_subject_hash, offender_alias, report_count, organizations_count, risk_level, threshold_met, status, organizations_list)
       VALUES ($1, $2, $3, 1, 1, 'HIGH', false, 'PENDING_THRESHOLD', $4)`,
      [patternId, identityHash, alias, JSON.stringify([organizationId])]
    );

    await query(
      `INSERT INTO matching_reports (id, pattern_id, case_id, incident_id, offender_normalized_name, offender_department, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`MR-${Date.now()}-${Math.floor(Math.random()*1000)}`, patternId, caseId, incidentId, normalized, department, organizationId]
    );
  }

  return { patternId, isNewThresholdReached };
};
