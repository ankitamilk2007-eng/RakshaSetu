import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, EyeOff, Bell, LogOut, User, Globe, AlertTriangle, 
  CheckCircle, ArrowRight, Sun, Type, Lock
} from 'lucide-react';

export const Navbar = () => {
  const {
    user,
    currentRoute,
    setCurrentRoute,
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    notifications,
    unreadCount,
    t,
    logout,
    triggerPanicHide
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentRoute(user ? (user.role === 'ADMIN' ? 'admin' : user.role === 'POLICE' ? 'police' : 'user') : 'landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">{t.appName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-mono border border-blue-700/50">PROTOTYPE</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{t.tagline}</p>
            </div>
          </div>

          {/* Center Actions / Quick Hide */}
          <div className="flex items-center space-x-2">
            {/* Quick Hide / Panic button - Central core safety feature */}
            <button
              onClick={triggerPanicHide}
              title="Instantly switch to disguised calculator/notes mode"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-semibold shadow-sm transition-all transform hover:scale-105"
            >
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span className="font-mono">{t.panicHide}</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>SOS / Helplines</span>
            </button>
          </div>

          {/* Right Controls: Role Indicator, Language, A11y, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Multilingual Selector */}
            <div className="relative flex items-center bg-slate-800 rounded-lg px-2 py-1 text-xs border border-slate-700">
              <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-800 text-white">English</option>
                <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-slate-800 text-white">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Accessibility: High Contrast & Large Font */}
            <div className="hidden lg:flex items-center space-x-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => setHighContrast(!highContrast)}
                title="Toggle High Contrast"
                className={`p-1.5 rounded-md text-xs ${highContrast ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-800'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLargeText(!largeText)}
                title="Toggle Text Size"
                className={`p-1.5 rounded-md text-xs ${largeText ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-800'}`}
              >
                <Type className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 relative border border-slate-700"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-semibold text-sm text-slate-200">Alerts & Notifications</span>
                      <span className="text-xs text-blue-400 font-mono">{notifications.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No active notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`py-2 px-2 rounded-lg text-xs ${n.is_read ? 'opacity-70' : 'bg-slate-800/40'}`}>
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Badge / Logout */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-200">
                    {user.role === 'USER' ? (user.anonymous_display_name || user.full_name) : user.full_name}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    user.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' :
                    user.role === 'POLICE' ? 'bg-sky-900/60 text-sky-300 border border-sky-700/50' :
                    'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  }`}>
                    {user.role === 'USER' ? 'Survivor' : user.role === 'ADMIN' ? 'ICC Admin' : 'Police Authority'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentRoute('landing')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400 mb-3">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="font-bold text-lg text-white">Emergency & Safety Assistance</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              If you are in immediate physical danger, please contact national emergency services immediately or reach a safe public location.
            </p>

            <div className="space-y-2 mb-6">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">National Emergency Helpline</p>
                  <p className="text-[11px] text-slate-400">Police / Ambulance / Fire</p>
                </div>
                <a href="tel:112" className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg">
                  Dial 112
                </a>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Women Helpline (National)</p>
                  <p className="text-[11px] text-slate-400">24/7 Distress Assistance</p>
                </div>
                <a href="tel:1091" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg">
                  Dial 1091
                </a>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Cyber Crime Helpline</p>
                  <p className="text-[11px] text-slate-400">Cyber Stalking & Blackmail</p>
                </div>
                <a href="tel:1930" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-lg">
                  Dial 1930
                </a>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-[11px] text-amber-200 mb-4">
              <span className="font-semibold">Prototype Simulation Notice:</span> This emergency interface provides direct access numbers for demonstration. Real-world dispatch integration depends on telecommunication protocols.
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
