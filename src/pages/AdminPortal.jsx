import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  ShieldAlert, Users, Scale, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, ChevronRight, UserCheck, Send, ShieldCheck, 
  BarChart3, FileText, ArrowLeft, RefreshCw, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { CaseStatusBadge } from '../components/CaseStatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { EvidenceCard } from '../components/EvidenceCard';
import { CaseTimeline } from '../components/CaseTimeline';
import { MatchingEscrowAlert } from '../components/MatchingEscrowAlert';
import { PoshDeadlineBanner } from '../components/PoshDeadlineBanner';
import { ChatMessenger } from '../components/ChatMessenger';

export const AdminPortal = () => {
  const { adminTab, setAdminTab, user } = useApp();

  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Case Detail
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [assigneeName, setAssigneeName] = useState(user?.full_name || 'Dr. Sunita Deshmukh');
  const [statusNote, setStatusNote] = useState('');
  const [policeEscalateReason, setPoliceEscalateReason] = useState(
    'Serial harassment pattern detected via Matching Escrow and high-risk employment retaliation threat exceeds civil workplace bounds.'
  );
  const [showPoliceModal, setShowPoliceModal] = useState(false);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, pRes, dRes, aRes, lRes] = await Promise.all([
        api.getAdminDashboard(),
        api.listCases(),
        api.getMatchingPatterns(),
        api.getDeadlines(),
        api.getAnalytics(),
        api.getAuditLogs()
      ]);

      setMetrics(mRes.metrics);
      setCases(cRes.cases || []);
      setPatterns(pRes.patterns || []);
      setDeadlines(dRes.deadlines || []);
      setAnalytics(aRes);
      setAuditLogs(lRes.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCaseDetail = async (id) => {
    try {
      const res = await api.getCase(id);
      setSelectedCase(id);
      setCaseDetail(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCase) return;
    try {
      await api.updateCaseStatus(selectedCase, newStatus, statusNote || `Status changed to ${newStatus}`);
      setStatusNote('');
      await openCaseDetail(selectedCase);
      await loadAllAdminData();
      alert(`Case ${selectedCase} status updated to ${newStatus}. Complainant notified.`);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAssignInvestigator = async () => {
    if (!selectedCase || !assigneeName) return;
    try {
      await api.assignInvestigator(selectedCase, assigneeName, 'Formally appointed by ICC Chair.');
      await openCaseDetail(selectedCase);
      await loadAllAdminData();
      alert(`Investigator ${assigneeName} appointed for Case ${selectedCase}.`);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEscalatePolice = async () => {
    if (!selectedCase) return;
    setEscalating(true);
    try {
      const res = await api.escalateToPolice(selectedCase, policeEscalateReason);
      setShowPoliceModal(false);
      await openCaseDetail(selectedCase);
      await loadAllAdminData();
      alert(`Case ${selectedCase} successfully referred to Police Authority portal. Referral Ref: ${res.referralId}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setEscalating(false);
    }
  };

  // Filter cases
  const filteredCases = cases.filter(c => {
    if (filterRisk !== 'ALL' && c.risk_level !== filterRisk) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        (c.person_involved || '').toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highPriorityCases = cases.filter(c => c.risk_level === 'CRITICAL' || c.risk_level === 'HIGH');

  const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              ICC EXECUTIVE CONSOLE
            </span>
            <span className="text-xs text-slate-500 font-mono">Organization: Tata Consultancy Services</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Internal Complaints Committee (POSH) Management
          </h2>
          <p className="text-xs text-slate-500">
            Authorized Case Officer: <strong>{user?.full_name || 'Dr. Sunita Deshmukh'}</strong> (Presiding Officer)
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {[
            { key: 'overview', label: 'Dashboard' },
            { key: 'highrisk', label: 'High Priority Queue' },
            { key: 'cases', label: 'All Cases' },
            { key: 'escrow', label: 'Matching Escrow' },
            { key: 'deadlines', label: 'POSH 90-Day Tracker' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'audit', label: 'Audit Logs' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setAdminTab(tab.key);
                setSelectedCase(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                adminTab === tab.key
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MATCHING ESCROW SERIAL OFFENDER ALERT BANNER */}
      {patterns.some(p => p.threshold_met) && (
        <div className="space-y-3">
          {patterns.filter(p => p.threshold_met).map(p => (
            <MatchingEscrowAlert
              key={p.id}
              pattern={p}
              onEscalate={() => {
                setAdminTab('cases');
                setSelectedCase('RS-2026-000127');
                openCaseDetail('RS-2026-000127');
              }}
            />
          ))}
        </div>
      )}

      {/* TAB 1: OVERVIEW METRICS */}
      {adminTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total Cases', val: metrics.totalCases, color: 'text-slate-900', bg: 'bg-white' },
              { label: 'New Received', val: metrics.newCases, color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Critical Risk', val: metrics.criticalCases, color: 'text-rose-600', bg: 'bg-rose-50/60' },
              { label: 'In Investigation', val: metrics.underInvestigation, color: 'text-purple-600', bg: 'bg-purple-50/50' },
              { label: 'Resolved Cases', val: metrics.resolvedCases, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
              { label: 'POSH Overdue', val: metrics.overdueCases, color: 'text-amber-600', bg: 'bg-amber-50/60' },
              { label: 'Pattern Alerts', val: metrics.patternAlerts, color: 'text-rose-700', bg: 'bg-rose-100/50' },
              { label: 'Avg Resolution', val: `${metrics.averageResolutionDays}d`, color: 'text-slate-800', bg: 'bg-white' }
            ].map((m, idx) => (
              <div key={idx} className={`${m.bg} border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center`}>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                  {m.label}
                </span>
                <span className={`text-xl font-bold font-mono mt-1 block ${m.color}`}>
                  {m.val}
                </span>
              </div>
            ))}
          </div>

          {/* High Priority Cases Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Urgent Attention Queue</h3>
                <p className="text-xs text-slate-500">Cases flagged with Critical / High AI Risk scores requiring immediate interim relief</p>
              </div>
              <button
                onClick={() => setAdminTab('highrisk')}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                View All Priority Cases →
              </button>
            </div>

            <div className="space-y-3">
              {highPriorityCases.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => openCaseDetail(c.id)}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-purple-800">{c.id}</span>
                      <RiskBadge score={c.risk_score} level={c.risk_level} size="sm" />
                      <CaseStatusBadge status={c.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{c.category}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Subject: <strong>{c.person_involved}</strong> • {c.incident_location}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCaseDetail(c.id);
                      }}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      Inspect Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HIGH PRIORITY QUEUE */}
      {adminTab === 'highrisk' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">High Priority & Threat Queue</h3>
            <p className="text-xs text-slate-500">
              Risk-based routing ensures serious threats of violence, employment retaliation, or stalking are triaged first.
            </p>
          </div>

          <div className="space-y-3">
            {highPriorityCases.map((c) => (
              <div
                key={c.id}
                onClick={() => openCaseDetail(c.id)}
                className="p-4 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-purple-800">{c.id}</span>
                    <RiskBadge score={c.risk_score} level={c.risk_level} size="sm" />
                    <CaseStatusBadge status={c.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{c.category}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Subject: <strong>{c.person_involved}</strong> • Complainant: {c.complainant_name || c.anonymous_display_name}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCaseDetail(c.id);
                    }}
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Review Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALL CASES TABLE & DETAIL DRAWER */}
      {adminTab === 'cases' && (
        <div className="space-y-4">
          {!selectedCase ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">All Organization Complaints</h3>
                  <p className="text-xs text-slate-500">Filter and manage inquiries across company departments.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or Subject..."
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />

                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="ALL">All Risk Levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    <option value="EVIDENCE_REVIEW">Evidence Review</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Case ID</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Alleged Offender</th>
                      <th className="py-3 px-3">Risk</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Investigator</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 cursor-pointer" onClick={() => openCaseDetail(c.id)}>
                        <td className="py-3 px-3 font-mono font-bold text-purple-800">{c.id}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{c.category}</td>
                        <td className="py-3 px-3 text-slate-700">{c.person_involved}</td>
                        <td className="py-3 px-3"><RiskBadge score={c.risk_score} level={c.risk_level} size="sm" /></td>
                        <td className="py-3 px-3"><CaseStatusBadge status={c.status} size="sm" /></td>
                        <td className="py-3 px-3 text-slate-600">{c.assigned_officer_name || 'Unassigned'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCaseDetail(c.id);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : caseDetail ? (
            /* ADMIN CASE DETAIL VIEW */
            <div className="space-y-6">
              <button
                onClick={() => setSelectedCase(null)}
                className="flex items-center space-x-1 text-xs text-purple-700 hover:text-purple-800 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Cases List</span>
              </button>

              {/* Case Header & Quick Actions */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-purple-900">{caseDetail.case.id}</span>
                      <CaseStatusBadge status={caseDetail.case.status} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{caseDetail.case.category}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Complainant: <strong>{caseDetail.case.complainant_name}</strong> ({caseDetail.case.complainant_department}) • Accused: <strong>{caseDetail.case.person_involved}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RiskBadge score={caseDetail.case.risk_score} level={caseDetail.case.risk_level} />
                    <button
                      onClick={() => setShowPoliceModal(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                      <span>Escalate to Police</span>
                    </button>
                  </div>
                </div>

                {/* POSH Deadline Tracker */}
                <PoshDeadlineBanner
                  deadlineInfo={{
                    complaint_submitted_date: caseDetail.case.created_at,
                    investigation_deadline: caseDetail.case.posh_deadline_date,
                    status: caseDetail.case.deadline_status
                  }}
                />

                {/* Case Actions Bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-700">Update Status:</span>
                    {['UNDER_INVESTIGATION', 'EVIDENCE_REVIEW', 'ACTION_TAKEN', 'RESOLVED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          caseDetail.case.status === st
                            ? 'bg-purple-700 text-white'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      placeholder="Officer Name"
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleAssignInvestigator}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-semibold"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <CaseTimeline
                  events={caseDetail.timeline}
                  currentStatus={caseDetail.case.status}
                />
              </div>

              {/* Evidence Vault Inspection & Messaging Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Evidence Items with live hash check */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Secured Evidence Vault Items ({caseDetail.evidence.length})
                  </h4>

                  <div className="space-y-3">
                    {caseDetail.evidence.map((ev) => (
                      <EvidenceCard key={ev.id} item={ev} onVerified={() => openCaseDetail(selectedCase)} />
                    ))}
                  </div>
                </div>

                {/* Secure Messaging */}
                <div>
                  <ChatMessenger
                    caseId={caseDetail.case.id}
                    messages={caseDetail.messages}
                    currentRole="ADMIN"
                    onMessageSent={(newMsg) => {
                      setCaseDetail(prev => ({
                        ...prev,
                        messages: [...prev.messages, newMsg]
                      }));
                    }}
                  />
                </div>

              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* TAB 4: MATCHING ESCROW */}
      {adminTab === 'escrow' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Matching Escrow Pattern Intelligence</h3>
            <p className="text-xs text-slate-500">
              Cross-organization threshold matching model. Independent complaints separately identifying the same individual surface anonymously without exposing survivor identities.
            </p>
          </div>

          <div className="space-y-4">
            {patterns.map((p) => (
              <MatchingEscrowAlert
                key={p.id}
                pattern={p}
                onEscalate={() => {
                  setAdminTab('cases');
                  setSelectedCase('RS-2026-000127');
                  openCaseDetail('RS-2026-000127');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: POSH 90-DAY COMPLIANCE MONITOR */}
      {adminTab === 'deadlines' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">POSH Statutory 90-Day Investigation Window Tracker</h3>
            <p className="text-xs text-slate-500">
              Under Section 11(4) of the POSH Act 2013, inquiries must conclude within 90 days of complaint submission.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Statutory Deadline</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {deadlines.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-blue-800">{d.case_id}</td>
                    <td className="py-3 px-3 font-sans text-slate-800">{d.category}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{d.person_involved}</td>
                    <td className="py-3 px-3 text-slate-500">{new Date(d.complaint_submitted_date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-slate-800 font-bold">{new Date(d.investigation_deadline).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        d.status === 'DUE_SOON' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <button
                        onClick={() => {
                          setAdminTab('cases');
                          openCaseDetail(d.case_id);
                        }}
                        className="text-purple-700 hover:underline font-semibold"
                      >
                        Open Case →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ANALYTICS */}
      {adminTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monthly Trend */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Monthly Case Trajectory & Resolution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" textAnchor="middle" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total Cases" />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
                    <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} name="Critical Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cases by Category */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Distribution by Harassment Category</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {adminTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Immutable System Audit Trail</h3>
            <p className="text-xs text-slate-500">Every sensitive action, evidence access, and status change is immutably logged.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Case Ref</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">{log.actor_name}</td>
                    <td className="py-2 px-3 text-slate-600">{log.actor_role}</td>
                    <td className="py-2 px-3 font-bold text-purple-900">{log.action}</td>
                    <td className="py-2 px-3 text-slate-600">{log.resource}</td>
                    <td className="py-2 px-3 text-blue-700">{log.case_id || '—'}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POLICE ESCALATION MODAL */}
      {showPoliceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg text-slate-900">Escalate Case to Law Enforcement</h3>
                <p className="text-xs text-slate-500">Transfers verified case file to Police Authority Portal</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
              <strong>Escalation Target:</strong> BKC Police Station Cyber Crime & Women Safety Cell. All digital evidence checksums will be made available for police forensic validation.
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Reason for Official Referral</label>
              <textarea
                rows={4}
                value={policeEscalateReason}
                onChange={(e) => setPoliceEscalateReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPoliceModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalatePolice}
                disabled={escalating}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                {escalating ? 'Escalating...' : 'Confirm Police Referral'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
