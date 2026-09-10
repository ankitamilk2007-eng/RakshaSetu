import { query } from '../config/db.js';
import { logAuditEvent } from '../services/auditService.js';
import { transcribeSpeech } from '../services/aiService.js';

export const createOrUpdateIncident = async (req, res) => {
  try {
    const {
      id,
      incidentDate,
      incidentTime,
      location,
      department,
      category,
      personInvolved,
      personRoleOrRelationship,
      description,
      hasThreat = false,
      hasPhysicalContact = false,
      hasDiscrimination = false,
      hasSexualHarassment = false,
      hasStalking = false,
      hasCyberHarassment = false,
      isStillInContact = false,
      isImmediateDanger = false,
      audioUrl = null,
      transcript = null,
      audioLanguage = 'en'
    } = req.body;

    if (!category || !personInvolved || !description) {
      return res.status(400).json({ error: 'Category, person involved, and incident description are required.' });
    }

    const incidentId = id || `INC-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    const existing = await query(`SELECT id FROM incidents WHERE id = $1`, [incidentId]);

    if (existing.rows.length > 0) {
      await query(
        `UPDATE incidents 
         SET incident_date = $1, incident_time = $2, location = $3, department = $4, category = $5,
             person_involved = $6, person_role_or_relationship = $7, description = $8,
             has_threat = $9, has_physical_contact = $10, has_discrimination = $11, has_sexual_harassment = $12,
             has_stalking = $13, has_cyber_harassment = $14, is_still_in_contact = $15, is_immediate_danger = $16,
             audio_url = $17, transcript = $18, audio_language = $19
         WHERE id = $20 AND user_id = $21`,
        [
          incidentDate || new Date().toISOString().split('T')[0],
          incidentTime || '14:00',
          location || 'Workplace Premises',
          department || req.user.department || 'General',
          category,
          personInvolved,
          personRoleOrRelationship,
          description,
          hasThreat,
          hasPhysicalContact,
          hasDiscrimination,
          hasSexualHarassment,
          hasStalking,
          hasCyberHarassment,
          isStillInContact,
          isImmediateDanger,
          audioUrl,
          transcript,
          audioLanguage,
          incidentId,
          req.user.id
        ]
      );
    } else {
      await query(
        `INSERT INTO incidents (
          id, user_id, organization_id, incident_date, incident_time, location, department, category,
          person_involved, person_role_or_relationship, description,
          has_threat, has_physical_contact, has_discrimination, has_sexual_harassment,
          has_stalking, has_cyber_harassment, is_still_in_contact, is_immediate_danger,
          audio_url, transcript, audio_language, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'DRAFT'
        )`,
        [
          incidentId,
          req.user.id,
          req.user.organization_id || 'org_tata_01',
          incidentDate || new Date().toISOString().split('T')[0],
          incidentTime || '14:00',
          location || 'Workplace Premises',
          department || req.user.department || 'General',
          category,
          personInvolved,
          personRoleOrRelationship,
          description,
          hasThreat,
          hasPhysicalContact,
          hasDiscrimination,
          hasSexualHarassment,
          hasStalking,
          hasCyberHarassment,
          isStillInContact,
          isImmediateDanger,
          audioUrl,
          transcript,
          audioLanguage
        ]
      );
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'SAVE_INCIDENT_DRAFT',
      resource: 'INCIDENT',
      details: { incidentId, category, hasThreat }
    });

    const saved = await query(`SELECT * FROM incidents WHERE id = $1`, [incidentId]);
    return res.status(200).json({
      message: 'Incident draft saved privately.',
      incident: saved.rows[0]
    });
  } catch (err) {
    console.error('createOrUpdateIncident error:', err);
    return res.status(500).json({ error: 'Failed to save incident.' });
  }
};

export const listUserIncidents = async (req, res) => {
  try {
    const result = await query(
      `SELECT i.*, 
              (SELECT COUNT(*) FROM evidence WHERE incident_id = i.id) as evidence_count,
              c.id as complaint_id,
              cs.id as case_id,
              cs.status as case_status
       FROM incidents i
       LEFT JOIN complaints c ON c.incident_id = i.id
       LEFT JOIN cases cs ON cs.incident_id = i.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    return res.json({ incidents: result.rows });
  } catch (err) {
    console.error('listUserIncidents error:', err);
    return res.status(500).json({ error: 'Failed to retrieve incidents.' });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM incidents WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident draft not found or unauthorized.' });
    }

    const evidenceResult = await query(
      `SELECT * FROM evidence WHERE incident_id = $1`,
      [id]
    );

    return res.json({
      incident: result.rows[0],
      evidence: evidenceResult.rows
    });
  } catch (err) {
    console.error('getIncidentById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve incident details.' });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure cannot delete if already submitted as an active case
    const caseCheck = await query(`SELECT id FROM cases WHERE incident_id = $1`, [id]);
    if (caseCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete an incident that has been submitted as an official case.' });
    }

    await query(`DELETE FROM incidents WHERE id = $1 AND user_id = $2`, [id, req.user.id]);

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'DELETE_INCIDENT_DRAFT',
      resource: 'INCIDENT',
      details: { incidentId: id }
    });

    return res.json({ message: 'Incident draft removed from private storage.' });
  } catch (err) {
    console.error('deleteIncident error:', err);
    return res.status(500).json({ error: 'Failed to delete incident draft.' });
  }
};

export const transcribeVoice = async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const transcript = transcribeSpeech(language);
    return res.json({ transcript, language });
  } catch (err) {
    console.error('transcribeVoice error:', err);
    return res.status(500).json({ error: 'Voice transcription failed.' });
  }
};
