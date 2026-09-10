import React from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldCheck, ShieldAlert, EyeOff, Sparkles, Database } from 'lucide-react';

export const DemoBar = () => {
  const { user, loginDemo, setCurrentRoute, currentRoute } = useApp();

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-blue-900/40 px-3 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-1 font-mono font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>HACKATHON DEMO SHORTCUTS:</span>
        </span>
        <span className="text-slate-400 hidden sm:inline">Instant Role Switcher</span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        {/* Survivor shortcut */}
        <button
          onClick={() => loginDemo('user')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            user?.role === 'USER' && currentRoute === 'user'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <User className="w-3 h-3 text-emerald-400" />
          <span>1. Survivor Portal</span>
          <span className="text-[10px] text-slate-400 hidden md:inline">(user@demo.com)</span>
        </button>

        {/* Admin shortcut */}
        <button
          onClick={() => loginDemo('admin')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            user?.role === 'ADMIN' && currentRoute === 'admin'
              ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-purple-400" />
          <span>2. ICC / Admin Portal</span>
          <span className="text-[10px] text-slate-400 hidden md:inline">(admin@demo.com)</span>
        </button>

        {/* Police shortcut */}
        <button
          onClick={() => loginDemo('police')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            user?.role === 'POLICE' && currentRoute === 'police'
              ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-sky-400" />
          <span>3. Police Portal</span>
          <span className="text-[10px] text-slate-400 hidden md:inline">(police@demo.com)</span>
        </button>

        {/* Invisible Mode shortcut */}
        <button
          onClick={() => setCurrentRoute('invisible')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            currentRoute === 'invisible'
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/60'
          }`}
        >
          <EyeOff className="w-3 h-3 text-amber-400" />
          <span>Test Invisible Mode (PIN: 2580)</span>
        </button>
      </div>
    </div>
  );
};
