import express from 'express';
import { login, register, getMe, updateConsents } from '../controllers/authController.js';
import { createOrUpdateIncident, listUserIncidents, getIncidentById, deleteIncident, transcribeVoice } from '../controllers/incidentController.js';
import { uploadEvidence, listEvidence, getEvidenceById, verifyEvidenceIntegrity, getEvidenceCertificate, downloadEvidence } from '../controllers/evidenceController.js';
import { generateAIComplaint, submitComplaint } from '../controllers/complaintController.js';
import { listCases, getCaseById, sendMessage } from '../controllers/caseController.js';
import { getAdminDashboard, updateCaseStatus, assignInvestigator, escalateToPolice, listMatchingPatterns, getAnalytics, listAuditLogs, listDeadlines } from '../controllers/adminController.js';
import { getPoliceDashboard, listReferrals, updateReferralStatus, verifyIndependentHash } from '../controllers/policeController.js';
import { listNotifications, markNotificationAsRead, listSupportContacts } from '../controllers/notificationController.js';

import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// --- Public Auth & Support ---
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/support-contacts', listSupportContacts);

// --- Authenticated Common Routes ---
router.use(authenticateToken);
router.get('/auth/me', getMe);
router.patch('/auth/consents', updateConsents);
router.get('/notifications', listNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);

// --- Survivor / Incidents ---
router.post('/incidents', createOrUpdateIncident);
router.get('/incidents', listUserIncidents);
router.get('/incidents/:id', getIncidentById);
router.delete('/incidents/:id', deleteIncident);
router.post('/incidents/transcribe', transcribeVoice);

// --- Evidence Vault ---
router.post('/evidence/upload', upload.single('file'), uploadEvidence);
router.get('/evidence', listEvidence);
router.get('/evidence/:id', getEvidenceById);
router.post('/evidence/:id/verify', verifyEvidenceIntegrity);
router.get('/evidence/:id/certificate', getEvidenceCertificate);
router.get('/evidence/:id/download', downloadEvidence);

// --- AI Complaint Generation & Submission ---
router.post('/complaints/generate', generateAIComplaint);
router.post('/complaints/submit', submitComplaint);

// --- Cases & Case Tracking ---
router.get('/cases', listCases);
router.get('/cases/:id', getCaseById);
router.post('/cases/:id/messages', sendMessage);

// --- Admin / ICC Routes ---
router.get('/admin/dashboard', requireRole('ADMIN'), getAdminDashboard);
router.patch('/admin/cases/:id/status', requireRole('ADMIN'), updateCaseStatus);
router.post('/admin/cases/:id/assign', requireRole('ADMIN'), assignInvestigator);
router.post('/admin/cases/:id/escalate-police', requireRole('ADMIN'), escalateToPolice);
router.get('/admin/patterns', requireRole('ADMIN'), listMatchingPatterns);
router.get('/admin/analytics', requireRole('ADMIN'), getAnalytics);
router.get('/admin/audit-logs', requireRole('ADMIN'), listAuditLogs);
router.get('/admin/deadlines', requireRole('ADMIN'), listDeadlines);

// --- Police / Authority Routes ---
router.get('/police/dashboard', requireRole('POLICE'), getPoliceDashboard);
router.get('/police/referrals', requireRole('POLICE'), listReferrals);
router.patch('/police/referrals/:id/status', requireRole('POLICE'), updateReferralStatus);
router.post('/police/verify-hash', requireRole('POLICE'), verifyIndependentHash);

export default router;
