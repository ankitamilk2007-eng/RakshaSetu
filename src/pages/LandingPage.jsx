import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, EyeOff, Lock, FileCheck2, AlertTriangle, Users, 
  ArrowRight, CheckCircle2, ChevronRight, Scale, Clock, Sparkles 
} from 'lucide-react';

export const LandingPage = () => {
  const { setCurrentRoute, loginDemo, loginWithCredentials, t } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginWithCredentials(email, password);
      } else {
        // Register survivor
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, department })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        localStorage.setItem('rakshasetu_token', data.token);
        await loginWithCredentials(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const workflowSteps = [
    { num: '01', title: 'INCIDENT', desc: 'Experience or witness harassment' },
    { num: '02', title: 'CAPTURE', desc: 'Record voice or notes in Invisible Mode' },
    { num: '03', title: 'PROTECT', desc: 'Anchor evidence with SHA-256 hashes' },
    { num: '04', title: 'STRUCTURE', desc: 'AI converts story into formal legal draft' },
    { num: '05', title: 'REVIEW', desc: 'Review missing facts & authority pathway' },
    { num: '06', title: 'SUBMIT', desc: 'Survivor explicitly chooses submission' },
    { num: '07', title: 'ANALYZE', desc: 'AI scores risk & checks serial offender escrow' },
    { num: '08', title: 'ESCALATE', desc: 'ICC or police inquiry initiated' },
    { num: '09', title: 'TRACK', desc: 'Transparent real-time status updates' },
    { num: '10', title: 'RESOLVE', desc: 'Inquiry conclusion & anti-retaliation audit' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-6 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Confidential Workplace Harassment Redressal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {t.appName}
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-blue-400 font-sans mt-2">
              "{t.tagline}"
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            A secure, trauma-informed platform for women to privately document workplace harassment, preserve tamper-evident digital evidence, evaluate threat risk, and uncover serial offenders through confidential Matching Escrow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => loginDemo('user')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Document Incident Privately</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentRoute('invisible')}
              className="flex items-center space-x-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-sm rounded-xl transition-all"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Launch Invisible Mode (Decoy)</span>
            </button>
          </div>

        </div>
      </section>

      {/* Role Selection & Instant Demo Cards */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Select Portal Interface</span>
            <h2 className="text-2xl font-bold text-white mt-1">Continue to Interface</h2>
            <p className="text-xs text-slate-400 mt-1">One platform, three strictly segregated role-based interfaces</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Survivor Card */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">1. Survivor / User Interface</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Document incidents safely, record voice statements, lock evidence with SHA-256 hashes, draft AI complaints, and track progress with complete privacy control.
              </p>
              <div className="text-[11px] text-slate-500 font-mono mb-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Demo: user@demo.com / User@123
              </div>
              <button
                onClick={() => loginDemo('user')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter as Survivor</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Admin / ICC Card */}
            <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">2. Organization / ICC Interface</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Prioritize cases by AI risk score, assign presiding officers, monitor POSH 90-day statutory windows, review anonymous matching patterns, and escalate to authorities.
              </p>
              <div className="text-[11px] text-slate-500 font-mono mb-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Demo: admin@demo.com / Admin@123
              </div>
              <button
                onClick={() => loginDemo('admin')}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter as ICC Admin</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Police Card */}
            <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-700/50 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">3. Police / Authority Interface</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Inspect strictly authorized referrals, perform live SHA-256 evidence integrity forensic verification, record FIR updates, and notify inquiry officers.
              </p>
              <div className="text-[11px] text-slate-500 font-mono mb-4 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Demo: police@demo.com / Police@123
              </div>
              <button
                onClick={() => loginDemo('police')}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Enter as Police Officer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Built For Safety & Admissibility</span>
          <h2 className="text-3xl font-bold text-white mt-1">Core Innovation Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 text-rose-400 flex items-center justify-center mb-4 border border-rose-800/50">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">Invisible Mode</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disguises RakshaSetu as a working Calculator or Notes app. Typing secret PIN <strong className="text-rose-300 font-mono">2580</strong> unlocks the encrypted portal with instant panic reset.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center mb-4 border border-blue-800/50">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">Secure Evidence Vault</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload photos, chats, voice and PDFs. Every file receives an authentic SHA-256 cryptographic hash and downloadable Section 65B Electronic Evidence Certificate.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-800/50">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">AI Complaint Drafting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforms raw user stories into structured legal complaints aligned with POSH Act provisions, highlighting missing information without taking control from the survivor.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center mb-4 border border-amber-800/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">Explainable AI Risk Scoring</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates transparent 0-100 risk score and categorizes Low, Medium, High, or Critical threat levels with explicit contributing weights (physical contact, retaliation, stalking).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center mb-4 border border-purple-800/50">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">Matching Escrow (Serial Offenders)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects repeat offenders when 2 or more independent reports match the same person across departments or organizations, triggering alerts without revealing survivor identities.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-800/50">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">POSH 90-Day Statutory Tracker</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors compliance with Section 11(4) of the Indian POSH Act, tracking days remaining and issuing alerts when inquiries approach or exceed the 90-day window.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive How It Works Timeline */}
      <section className="py-16 bg-slate-950 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">End-to-End Workflow</span>
            <h2 className="text-3xl font-bold text-white mt-1">How RakshaSetu Works</h2>
            <p className="text-xs text-slate-400 mt-1">From private documentation to evidence-backed legal resolution</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {workflowSteps.map((step, idx) => (
              <div key={step.num} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 font-bold mb-1">{step.num}</span>
                <span className="text-xs font-bold text-white mb-1">{step.title}</span>
                <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign In / Register Form Drawer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <button
              onClick={() => setAuthMode('login')}
              className={`text-sm font-bold pb-1 transition-colors ${authMode === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`text-sm font-bold pb-1 transition-colors ${authMode === 'register' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department / Business Unit</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering, Marketing, Operations"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Corporate or Personal Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-colors mt-2"
            >
              {submitting ? 'Authenticating...' : authMode === 'login' ? 'Sign In to RakshaSetu' : 'Register Secure Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">Quick Hackathon Evaluation:</span>
            <div className="flex justify-center space-x-2 mt-2">
              <button onClick={() => loginDemo('user')} className="text-[10px] text-emerald-400 hover:underline">Demo Survivor</button>
              <span className="text-slate-600">•</span>
              <button onClick={() => loginDemo('admin')} className="text-[10px] text-purple-400 hover:underline">Demo Admin</button>
              <span className="text-slate-600">•</span>
              <button onClick={() => loginDemo('police')} className="text-[10px] text-sky-400 hover:underline">Demo Police</button>
            </div>
          </div>

        </div>
      </section>

      {/* Mandatory Statutory & Ethical Disclaimer Footer */}
      <footer className="py-8 bg-black border-t border-slate-900 text-center px-4 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-semibold text-slate-400">
            RakshaSetu Hackathon Demonstration Platform
          </p>
          <p className="text-[11px] leading-relaxed">
            “RakshaSetu is a prototype for confidential reporting and workflow support. AI outputs are decision-support suggestions and should be reviewed by authorized humans. Legal and regulatory implementation requires appropriate professional review. Section 65B documentation is generated for prototype demonstration and requires signing by an authorized officer in charge of computer systems for statutory compliance.”
          </p>
          <p className="text-[10px] text-slate-600">
            © 2026 RakshaSetu Platform. Speak Safely. Preserve Evidence. Get Help.
          </p>
        </div>
      </footer>

    </div>
  );
};
