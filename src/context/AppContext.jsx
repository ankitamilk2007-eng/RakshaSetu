import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('rakshasetu_token') || null);
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('landing'); // 'landing', 'invisible', 'user', 'admin', 'police'
  const [userTab, setUserTab] = useState('report'); // 'report', 'vault', 'cases', 'assistant', 'safety', 'privacy'
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'cases', 'highrisk', 'escrow', 'deadlines', 'analytics', 'audit'
  const [policeTab, setPoliceTab] = useState('overview'); // 'overview', 'referrals', 'verify', 'audit'
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en', 'hi', 'mr'
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Translations dictionary
  const t = {
    en: {
      appName: 'RakshaSetu',
      tagline: 'Speak Safely. Preserve Evidence. Get Help.',
      panicHide: 'Quick Hide (Esc)',
      invisibleMode: 'Invisible Mode',
      reportIncident: 'Report Incident',
      evidenceVault: 'Evidence Vault',
      myCases: 'My Cases',
      aiAssistant: 'AI Complaint Assistant',
      safetyCenter: 'Safety Center',
      privacyCenter: 'Privacy Settings',
      dashboard: 'Dashboard',
      cases: 'Cases',
      highRiskQueue: 'High Priority Queue',
      matchingEscrow: 'Matching Escrow',
      deadlines: 'POSH 90-Day Tracker',
      analytics: 'Analytics',
      auditLogs: 'Audit Trail',
      policeReferrals: 'Police Referrals',
      forensicVerification: 'Forensic Evidence Verification',
      logout: 'Sign Out',
      demoMode: 'Demo Mode',
      enterDemoMode: 'Enter Demo Mode'
    },
    hi: {
      appName: 'रक्षासेतु',
      tagline: 'सुरक्षित बोलें। साक्ष्य सुरक्षित करें। सहायता प्राप्त करें।',
      panicHide: 'तुरंत छिपाएं (त्वरित निकास)',
      invisibleMode: 'अदृश्य मोड (गुप्त कैलकुलेटर)',
      reportIncident: 'घटना दर्ज करें',
      evidenceVault: 'साक्ष्य वॉल्ट',
      myCases: 'मेरी शिकायतें',
      aiAssistant: 'एआई शिकायत सहायक',
      safetyCenter: 'सुरक्षा केंद्र',
      privacyCenter: 'गोपनीयता सेटिंग्स',
      dashboard: 'डैशबोर्ड',
      cases: 'मामले',
      highRiskQueue: 'उच्च जोखिम कतार',
      matchingEscrow: 'मैचिंग एस्क्रो (क्रमिक अपराधी पहचान)',
      deadlines: 'पॉश 90-दिवसीय समयसीमा',
      analytics: 'विश्लेषण',
      auditLogs: 'ऑडिट लॉग',
      policeReferrals: 'पुलिस रेफरल',
      forensicVerification: 'फोरेंसिक साक्ष्य सत्यापन',
      logout: 'लॉग आउट',
      demoMode: 'डेमो मोड',
      enterDemoMode: 'डेमो मोड में प्रवेश करें'
    },
    mr: {
      appName: 'रक्षासेतू',
      tagline: 'सुरक्षित बोला. पुरावे जतन करा. मदत मिळवा.',
      panicHide: 'त्वरित लपवा (पॅनिक एक्झिट)',
      invisibleMode: 'अदृश्य मोड',
      reportIncident: 'घटना नोंदवा',
      evidenceVault: 'पुरावा वॉल्ट',
      myCases: 'माझ्या तक्रारी',
      aiAssistant: 'एआय तक्रार सहाय्यक',
      safetyCenter: 'सुरक्षा केंद्र',
      privacyCenter: 'गोपनीयता सेटिंग्ज',
      dashboard: 'डॅशबोर्ड',
      cases: 'प्रकरणे',
      highRiskQueue: 'अति-महत्त्वाची प्रकरणे',
      matchingEscrow: 'मॅचिंग एस्क्रो',
      deadlines: 'पॉश ९० दिवसांची मुदत',
      analytics: 'विश्लेषण',
      auditLogs: 'ऑडिट ट्रेल',
      policeReferrals: 'पोलीस रेफरल्स',
      forensicVerification: 'पुरावा सत्यता तपासणी',
      logout: 'बाहेर पडा',
      demoMode: 'डेमो मोड',
      enterDemoMode: 'डेमो मोड सुरू करा'
    }
  }[language];

  // Fetch initial profile
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        // Direct to portal based on role if on landing
        if (currentRoute === 'landing') {
          if (data.user.role === 'ADMIN') setCurrentRoute('admin');
          else if (data.user.role === 'POLICE') setCurrentRoute('police');
          else setCurrentRoute('user');
        }
      } catch (err) {
        console.error('Session expired or invalid:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  // Fetch notifications periodically
  useEffect(() => {
    if (!token || !user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.listNotifications();
        setNotifications(res.notifications || []);
        setUnreadCount((res.notifications || []).filter(n => !n.is_read).length);
      } catch (e) {
        // silent
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [token, user]);

  const loginWithCredentials = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('rakshasetu_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.role === 'ADMIN') setCurrentRoute('admin');
      else if (res.user.role === 'POLICE') setCurrentRoute('police');
      else setCurrentRoute('user');
      return res;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (role) => {
    const creds = {
      user: { email: 'user@demo.com', pass: 'User@123' },
      admin: { email: 'admin@demo.com', pass: 'Admin@123' },
      police: { email: 'police@demo.com', pass: 'Police@123' }
    }[role] || { email: 'user@demo.com', pass: 'User@123' };

    return loginWithCredentials(creds.email, creds.pass);
  };

  const logout = () => {
    localStorage.removeItem('rakshasetu_token');
    setToken(null);
    setUser(null);
    setCurrentRoute('landing');
  };

  const triggerPanicHide = () => {
    setCurrentRoute('invisible');
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        setUser,
        currentRoute,
        setCurrentRoute,
        userTab,
        setUserTab,
        adminTab,
        setAdminTab,
        policeTab,
        setPoliceTab,
        selectedCaseId,
        setSelectedCaseId,
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        loading,
        notifications,
        unreadCount,
        t,
        loginWithCredentials,
        loginDemo,
        logout,
        triggerPanicHide
      }}
    >
      <div className={`${highContrast ? 'high-contrast' : ''} ${largeText ? 'large-text' : ''} min-h-screen bg-slate-50 text-slate-900`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
