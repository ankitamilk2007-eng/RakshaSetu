import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';
import { calculateFileHash, verifyHash } from '../services/hashService.js';
import { generateSection65BCertificate } from '../services/certificateService.js';
import { logAuditEvent } from '../services/auditService.js';

export const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No evidence file uploaded.' });
    }

    const { caseId, incidentId, isSharedWithPolice = false } = req.body;
    const file = req.file;

    // Calculate real cryptographic SHA-256 hash
    const sha256Hash = calculateFileHash(file.path);

    const evidenceId = `EV-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    // Store in evidence table
    const result = await query(
      `INSERT INTO evidence (id, case_id, incident_id, uploader_id, file_name, file_path, file_type, file_size, sha256_hash, integrity_status, encryption_status, is_shared_with_police)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'VERIFIED', 'AES-256 GCM AT REST', $10)
       RETURNING *`,
      [
        evidenceId,
        caseId || null,
        incidentId || null,
        req.user.id,
        file.originalname,
        file.path,
        file.mimetype,
        file.size,
        sha256Hash,
        isSharedWithPolice === 'true' || isSharedWithPolice === true
      ]
    );

    // Record initial cryptographic baseline in evidence_hashes
    await query(
      `INSERT INTO evidence_hashes (id, evidence_id, sha256_hash, verified_by, verification_source, match_status)
       VALUES ($1, $2, $3, $4, 'SERVER_UPLOAD', 'MATCH')`,
      [`eh_${Date.now()}_${Math.floor(Math.random() * 1000)}`, evidenceId, sha256Hash, req.user.id]
    );

    // Audit log
    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'UPLOAD_EVIDENCE',
      resource: 'EVIDENCE',
      caseId: caseId || null,
      details: {
        evidenceId,
        fileName: file.originalname,
        sha256Hash,
        fileSize: file.size
      }
    });

    return res.status(201).json({
      message: 'Evidence successfully secured in vault with tamper-evident cryptographic hash.',
      evidence: result.rows[0]
    });
  } catch (err) {
    console.error('Evidence upload error:', err);
    return res.status(500).json({ error: 'Failed to upload and secure evidence.' });
  }
};

export const listEvidence = async (req, res) => {
  try {
    const { caseId, incidentId } = req.query;
    let sql = `SELECT e.*, u.full_name as uploader_name FROM evidence e LEFT JOIN users u ON e.uploader_id = u.id WHERE 1=1`;
    const params = [];

    // Role-based isolation
    if (req.user.role === 'USER') {
      sql += ` AND e.uploader_id = $${params.length + 1}`;
      params.push(req.user.id);
    } else if (req.user.role === 'POLICE') {
      sql += ` AND (e.is_shared_with_police = true OR e.case_id IN (SELECT case_id FROM police_referrals))`;
    }

    if (caseId) {
      sql += ` AND e.case_id = $${params.length + 1}`;
      params.push(caseId);
    }
    if (incidentId) {
      sql += ` AND e.incident_id = $${params.length + 1}`;
      params.push(incidentId);
    }

    sql += ` ORDER BY e.created_at DESC`;

    const result = await query(sql, params);
    return res.json({ evidence: result.rows });
  } catch (err) {
    console.error('listEvidence error:', err);
    return res.status(500).json({ error: 'Failed to retrieve evidence items.' });
  }
};

export const getEvidenceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT e.*, u.full_name as uploader_name, u.anonymous_display_name
       FROM evidence e
       LEFT JOIN users u ON e.uploader_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence record not found.' });
    }

    const item = result.rows[0];

    // Check RBAC permissions
    if (req.user.role === 'USER' && item.uploader_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to private evidence of another user.' });
    }

    // Get audit verification logs
    const hashLogs = await query(
      `SELECT * FROM evidence_hashes WHERE evidence_id = $1 ORDER BY verified_at DESC`,
      [id]
    );

    return res.json({
      evidence: item,
      verificationHistory: hashLogs.rows
    });
  } catch (err) {
    console.error('getEvidenceById error:', err);
    return res.status(500).json({ error: 'Failed to fetch evidence.' });
  }
};

export const verifyEvidenceIntegrity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM evidence WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence record not found.' });
    }

    const item = result.rows[0];

    // Compute live hash of physical file on disk
    if (!fs.existsSync(item.file_path)) {
      return res.status(400).json({
        integrityStatus: 'FILE_MISSING',
        isMatch: false,
        message: 'Physical evidence file missing from vault storage.'
      });
    }

    const { isMatch, actualHash, expectedHash, verifiedAt } = verifyHash(item.file_path, item.sha256_hash);

    // Save verification event
    await query(
      `INSERT INTO evidence_hashes (id, evidence_id, sha256_hash, verified_by, verification_source, match_status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `eh_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        item.id,
        actualHash,
        req.user.id,
        `${req.user.role}_INTEGRITY_CHECK`,
        isMatch ? 'MATCH' : 'MISMATCH'
      ]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'VERIFY_EVIDENCE_INTEGRITY',
      resource: 'EVIDENCE',
      caseId: item.case_id,
      details: {
        evidenceId: item.id,
        isMatch,
        actualHash,
        expectedHash
      }
    });

    return res.json({
      evidenceId: item.id,
      isMatch,
      integrityStatus: isMatch ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_COMPROMISED',
      expectedHash,
      computedHash: actualHash,
      verifiedAt,
      verifiedBy: req.user.full_name,
      role: req.user.role
    });
  } catch (err) {
    console.error('verifyEvidenceIntegrity error:', err);
    return res.status(500).json({ error: 'Integrity verification failed.' });
  }
};

export const getEvidenceCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT e.*, u.full_name as uploader_name, u.anonymous_display_name
       FROM evidence e
       LEFT JOIN users u ON e.uploader_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence record not found.' });
    }

    const item = result.rows[0];

    const certificate = generateSection65BCertificate({
      evidenceId: item.id,
      caseId: item.case_id || 'PENDING_SUBMISSION',
      fileName: item.file_name,
      fileType: item.file_type,
      fileSize: item.file_size,
      sha256Hash: item.sha256_hash,
      uploadedAt: item.created_at,
      uploaderName: item.uploader_name || item.anonymous_display_name || 'Protected Survivor'
    });

    return res.json({ certificate });
  } catch (err) {
    console.error('getEvidenceCertificate error:', err);
    return res.status(500).json({ error: 'Failed to generate Section 65B Certificate.' });
  }
};

export const downloadEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM evidence WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence file not found.' });
    }

    const item = result.rows[0];

    if (req.user.role === 'USER' && item.uploader_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!fs.existsSync(item.file_path)) {
      return res.status(404).json({ error: 'File not found on storage vault.' });
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'DOWNLOAD_EVIDENCE',
      resource: 'EVIDENCE',
      caseId: item.case_id,
      details: { evidenceId: item.id, fileName: item.file_name }
    });

    return res.download(item.file_path, item.file_name);
  } catch (err) {
    console.error('downloadEvidence error:', err);
    return res.status(500).json({ error: 'Failed to download evidence.' });
  }
};
