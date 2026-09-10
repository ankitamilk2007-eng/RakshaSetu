import { query } from '../config/db.js';

export const listNotifications = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 OR (role = $2 AND user_id IS NULL)
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.id, req.user.role]
    );

    return res.json({ notifications: result.rows });
  } catch (err) {
    console.error('listNotifications error:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    console.error('markNotificationAsRead error:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
};

export const listSupportContacts = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM support_contacts ORDER BY is_emergency DESC, category ASC`);
    return res.json({ contacts: result.rows });
  } catch (err) {
    console.error('listSupportContacts error:', err);
    return res.status(500).json({ error: 'Failed to retrieve safety contacts.' });
  }
};
