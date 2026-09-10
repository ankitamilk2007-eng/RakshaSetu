import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DemoBar } from './components/DemoBar';
import { InvisibleMode } from './components/InvisibleMode';
import { LandingPage } from './pages/LandingPage';
import { UserPortal } from './pages/UserPortal';
import { AdminPortal } from './pages/AdminPortal';
import { PolicePortal } from './pages/PolicePortal';

const AppContent = () => {
  const { currentRoute, triggerPanicHide } = useApp();

  // Global keyboard shortcut: Escape key triggers Quick Hide / Panic mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        triggerPanicHide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPanicHide]);

  // Invisible Mode view (Calculator / Notes decoy)
  if (currentRoute === 'invisible') {
    return <InvisibleMode />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Floating Hackathon Demo Bar for effortless judge evaluation */}
      <DemoBar />

      {/* Top Navbar */}
      <Navbar />

      {/* Dynamic Role Views */}
      <main className="flex-1">
        {currentRoute === 'landing' && <LandingPage />}
        {currentRoute === 'user' && <UserPortal />}
        {currentRoute === 'admin' && <AdminPortal />}
        {currentRoute === 'police' && <PolicePortal />}
      </main>

      {/* Persistent Hackathon Disclaimer Footer on all pages */}
      <footer className="py-4 bg-slate-950 text-slate-500 border-t border-slate-800 text-center text-[11px] px-4">
        <p>
          <strong>RakshaSetu Hackathon Prototype</strong> — AI outputs are decision-support suggestions for review by authorized human committees. Legal and statutory compliance under POSH Act 2013 / Section 65B requires formal advocate/officer verification.
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
