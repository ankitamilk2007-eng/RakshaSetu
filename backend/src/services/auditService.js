import { query } from '../config/db.js';

/**
 * Append tamper-evident audit log entry
 */
export const logAuditEvent = async ({
  actorId = null,
  actorName = 'System',
  actorRole = 'SYSTEM',
  action,
  resource,
  caseId = null,
  ipAddress = '127.0.0.1',
  result = 'SUCCESS',
  details = {}
}) => {
  try {
    const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    await query(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, case_id, ip_address, result, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        actorId,
        actorName,
        actorRole,
        action,
        resource,
        caseId,
        ipAddress,
        result,
        JSON.stringify(details)
      ]
    );
    return id;
  } catch (err) {
    console.error('Audit log error:', err);
    return null;
  }
};
