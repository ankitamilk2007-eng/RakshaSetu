const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('rakshasetu_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errMessage = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errMessage = data.error || data.message || errMessage;
    } catch (e) {
      errMessage = res.statusText || errMessage;
    }
    throw new Error(errMessage);
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateConsents: async (consents) => {
    const res = await fetch(`${BASE_URL}/auth/consents`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(consents)
    });
    return handleResponse(res);
  },

  // Incidents
  saveIncident: async (incidentData) => {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incidentData)
    });
    return handleResponse(res);
  },

  listIncidents: async () => {
    const res = await fetch(`${BASE_URL}/incidents`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getIncident: async (id) => {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteIncident: async (id) => {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  transcribeVoice: async (language = 'en') => {
    const res = await fetch(`${BASE_URL}/incidents/transcribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ language })
    });
    return handleResponse(res);
  },

  // Evidence
  uploadEvidence: async (formData) => {
    const token = localStorage.getItem('rakshasetu_token');
    const res = await fetch(`${BASE_URL}/evidence/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return handleResponse(res);
  },

  listEvidence: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/evidence${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getEvidence: async (id) => {
    const res = await fetch(`${BASE_URL}/evidence/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  verifyEvidence: async (id) => {
    const res = await fetch(`${BASE_URL}/evidence/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getEvidenceCertificate: async (id) => {
    const res = await fetch(`${BASE_URL}/evidence/${id}/certificate`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // AI Complaints
  generateComplaint: async (payload) => {
    const res = await fetch(`${BASE_URL}/complaints/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  submitComplaint: async (payload) => {
    const res = await fetch(`${BASE_URL}/complaints/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Cases
  listCases: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/cases${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getCase: async (id) => {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  sendMessage: async (id, message, attachments = []) => {
    const res = await fetch(`${BASE_URL}/cases/${id}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, attachments })
    });
    return handleResponse(res);
  },

  // Admin
  getAdminDashboard: async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateCaseStatus: async (id, status, notes = '') => {
    const res = await fetch(`${BASE_URL}/admin/cases/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  assignInvestigator: async (id, officerName, notes = '') => {
    const res = await fetch(`${BASE_URL}/admin/cases/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ officerName, notes })
    });
    return handleResponse(res);
  },

  escalateToPolice: async (id, reason, policeNotes = '') => {
    const res = await fetch(`${BASE_URL}/admin/cases/${id}/escalate-police`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, policeNotes })
    });
    return handleResponse(res);
  },

  getMatchingPatterns: async () => {
    const res = await fetch(`${BASE_URL}/admin/patterns`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getDeadlines: async () => {
    const res = await fetch(`${BASE_URL}/admin/deadlines`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Police
  getPoliceDashboard: async () => {
    const res = await fetch(`${BASE_URL}/police/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  listReferrals: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/police/referrals${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateReferralStatus: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/police/referrals/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  verifyPoliceHash: async (evidenceId, testHash) => {
    const res = await fetch(`${BASE_URL}/police/verify-hash`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ evidenceId, testHash })
    });
    return handleResponse(res);
  },

  // Notifications & Support
  listNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  listSupportContacts: async () => {
    const res = await fetch(`${BASE_URL}/support-contacts`);
    return handleResponse(res);
  }
};
