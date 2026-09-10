import { verifyToken } from '../config/jwt.js';
import { query } from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }

  try {
    const result = await query(
      `SELECT id, email, full_name, anonymous_display_name, role, organization_id, department 
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User record not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication verification failed.' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access forbidden. Required role(s): ${roles.join(', ')}. Current role: ${req.user.role}` 
      });
    }

    next();
  };
};
