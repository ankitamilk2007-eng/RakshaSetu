import { query } from '../config/db.js';

/**
 * Calculates POSH 90-day statutory window and status
 */
export const calculatePoshDeadline = (submittedDate) => {
  const submitted = new Date(submittedDate);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + 90);

  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'ON_TRACK';
  if (daysRemaining <= 0) {
    status = 'OVERDUE';
  } else if (daysRemaining <= 30) {
    status = 'DUE_SOON';
  }

  return {
    submittedDate: submitted.toISOString().split('T')[0],
    deadlineDate: deadline.toISOString().split('T')[0],
    daysRemaining,
    status
  };
};

/**
 * Refresh and sync deadline records for cases
 */
export const syncCaseDeadlines = async () => {
  try {
    const cases = await query(
      `SELECT c.id, c.created_at, d.id as deadline_id 
       FROM cases c
       LEFT JOIN deadlines d ON c.id = d.case_id
       WHERE c.status NOT IN ('RESOLVED', 'CLOSED')`
    );

    for (const c of cases.rows) {
      const calc = calculatePoshDeadline(c.created_at);
      if (c.deadline_id) {
        await query(
          `UPDATE deadlines 
           SET status = $1, last_checked_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [calc.status, c.deadline_id]
        );
      } else {
        await query(
          `INSERT INTO deadlines (id, case_id, complaint_submitted_date, investigation_deadline, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [`DL-${Date.now()}-${Math.floor(Math.random()*1000)}`, c.id, calc.submittedDate, calc.deadlineDate, calc.status]
        );
      }
    }
  } catch (err) {
    console.error('POSH deadline sync error:', err);
  }
};
