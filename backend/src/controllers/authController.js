import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../config/jwt.js';
import { logAuditEvent } from '../services/auditService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await query(
      `SELECT u.*, o.name as organization_name 
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    // Generate token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    });

    await logAuditEvent({
      actorId: user.id,
      actorName: user.full_name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resource: 'AUTH',
      ipAddress: req.ip || '127.0.0.1',
      details: { email: user.email, role: user.role }
    });

    // Strip password hash
    delete user.password_hash;

    return res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, fullName, anonymousDisplayName, phone, role = 'USER', organizationId, department } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await query(
      `INSERT INTO users (id, email, password_hash, full_name, anonymous_display_name, phone, role, organization_id, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        email.trim().toLowerCase(),
        passwordHash,
        fullName.trim(),
        anonymousDisplayName || `Survivor_${userId.substring(userId.length - 4)}`,
        phone || null,
        role,
        organizationId || 'org_tata_01',
        department || 'General'
      ]
    );

    // Initialize consent record
    await query(
      `INSERT INTO consents (id, user_id) VALUES ($1, $2)`,
      [`cns_${userId}`, userId]
    );

    const token = signToken({ id: userId, email, role, organization_id: organizationId });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        full_name: fullName,
        role,
        department
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.anonymous_display_name, u.phone, u.role, u.department, u.preferred_language,
              o.name as organization_name, o.id as organization_id,
              c.allow_evidence_sharing, c.allow_anonymous_pattern_matching, c.allow_cross_org_matching, c.allow_police_escalation, c.allow_notifications
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       LEFT JOIN consents c ON u.id = c.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

export const updateConsents = async (req, res) => {
  try {
    const { allow_evidence_sharing, allow_anonymous_pattern_matching, allow_cross_org_matching, allow_police_escalation, allow_notifications } = req.body;

    await query(
      `UPDATE consents 
       SET allow_evidence_sharing = COALESCE($1, allow_evidence_sharing),
           allow_anonymous_pattern_matching = COALESCE($2, allow_anonymous_pattern_matching),
           allow_cross_org_matching = COALESCE($3, allow_cross_org_matching),
           allow_police_escalation = COALESCE($4, allow_police_escalation),
           allow_notifications = COALESCE($5, allow_notifications),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [allow_evidence_sharing, allow_anonymous_pattern_matching, allow_cross_org_matching, allow_police_escalation, allow_notifications, req.user.id]
    );

    await logAuditEvent({
      actorId: req.user.id,
      actorName: req.user.full_name,
      actorRole: req.user.role,
      action: 'UPDATE_PRIVACY_CONSENTS',
      resource: 'CONSENTS',
      details: req.body
    });

    return res.json({ message: 'Privacy consents updated successfully.' });
  } catch (err) {
    console.error('updateConsents error:', err);
    return res.status(500).json({ error: 'Failed to update privacy settings.' });
  }
};
