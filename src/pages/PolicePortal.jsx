import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, Search, 
  FileText, ExternalLink, ArrowLeft, RefreshCw, Check, Lock, 
  Clock, Shield, Scale, Printer, Award
} from 'lucide-react';
import { CaseStatusBadge } from '../components/CaseStatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { EvidenceCard } from '../components/EvidenceCard';
import { Section65BModal } from '../components/Section65BModal';

export const PolicePortal = () => {
  const { policeTab, setPoliceTab, user } = useApp();

  const [metrics, setMetrics] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Referral Case
  const [selectedRef, setSelectedRef] = useState(null);
  const [refDetail, setRefDetail] = useState(null);

  // Verification Tool State
  const [verifyEvidenceId, setVerifyEvidenceId] = useState('');
  const [verifyCustomHash, setVerifyCustomHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Status update form
  const [policeStatus, setPoliceStatus] = useState('FIR_INITIATED');
  const [firNumber, setFirNumber] = useState('FIR-2026-BKC-0941');
  const [policeNotes, setPoliceNotes] = useState(
    'Preliminary inquiry initiated. Investigating officer inspected venue, verified CCTV checksums, and issued Section 41A notice to respondent.'
  );
  const [updating, setUpdating] = useState(false);

  // Certificate Modal
  const [certData, setCertData] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    loadPoliceData();
  }, []);

  const loadPoliceData = async () => {
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        api.getPoliceDashboard(),
        api.listReferrals()
      ]);
      setMetrics(mRes.metrics);
      setReferrals(rRes.referrals || []);
      if (rRes.referrals && rRes.referrals.length > 0) {
        setVerifyEvidenceId('EV-2026-00004'); // default sample evidence ID
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openReferral = async (caseId, refId) => {
    try {
      const res = await api.getCase(caseId);
      setSelectedRef(refId);
      setRefDetail(res);
      if (res.case.police_status) setPoliceStatus(res.case.police_status);
      if (res.case.fir_number) setFirNumber(res.case.fir_number);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRef) return;
    setUpdating(true);
    try {
      await api.updateReferralStatus(selectedRef, {
        status: policeStatus,
        firNumber,
        policeNotes,
        assignedOfficerName: user?.full_name || 'Inspector Vikram Salve'
      });
      await loadPoliceData();
      if (refDetail) await openReferral(refDetail.case.id, selectedRef);
      alert(`Police referral status updated to ${policeStatus}. Updates dispatched to ICC and Survivor portals.`);
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRunForensicCheck = async (e) => {
    e.preventDefault();
    if (!verifyEvidenceId) return;

    setVerifying(true);
    try {
      const res = await api.verifyPoliceHash(verifyEvidenceId, verifyCustomHash);
      setVerificationResult(res);
    } catch (e) {
      alert(e.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenCertificate = async (evidenceId) => {
    try {
      const res = await api.getEvidenceCertificate(evidenceId);
      setCertData(res.certificate);
      setShowCertModal(true);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Station Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800">
              LAW ENFORCEMENT & SPECIAL CELL PORTAL
            </span>
            <span className="text-xs text-slate-400 font-mono">Bandra Kurla Complex Crime Branch</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Police Authority Harassment & Threat Referral Queue
          </h2>
          <p className="text-xs text-slate-400">
            Duty Officer: <strong>{user?.full_name || 'Inspector Vikram Salve'}</strong> (Cyber Crime & Women Safety Cell)
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setPoliceTab('overview');
              setSelectedRef(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              policeTab === 'overview'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Referred Cases Queue
          </button>
          <button
            onClick={() => {
              setPoliceTab('verify');
              setSelectedRef(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              policeTab === 'verify'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Forensic Hash Verification Tool
          </button>
        </div>
      </div>

      {/* Access Segregation Banner */}
      <div className="bg-sky-950/40 border border-sky-800/60 rounded-2xl p-4 text-xs text-sky-200 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Strict Statutory Isolation Active:</span>
          <span>
            This law enforcement interface displays <strong>only</strong> complaints that have been explicitly referred by Organization ICCs or escalated by survivors due to criminal indicators (assault, extortion, stalking, violence). Standard private internal workplace grievances are strictly sequestered from police view.
          </span>
        </div>
      </div>

      {/* TAB 1: REFERRED CASES QUEUE */}
      {policeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Police KPI Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Referrals', val: metrics.totalReferrals, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'New / Pending', val: metrics.newReferrals, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                { label: 'Critical Threats', val: metrics.criticalCases, color: 'text-rose-600', bg: 'bg-rose-50/60' },
                { label: 'FIR Initiated', val: metrics.firInitiated, color: 'text-sky-600', bg: 'bg-sky-50/50' },
                { label: 'Inquiry Active', val: metrics.underInvestigation, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                { label: 'Closed / Final Report', val: metrics.closedCases, color: 'text-emerald-600', bg: 'bg-emerald-50/50' }
              ].map((m, idx) => (
                <div key={idx} className={`${m.bg} border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center`}>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">{m.label}</span>
                  <span className={`text-xl font-bold font-mono mt-1 block ${m.color}`}>{m.val}</span>
                </div>
              ))}
            </div>
          )}

          {!selectedRef ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Official Police Referral Docket</h3>
                <p className="text-xs text-slate-500">Cases referred by Internal Complaints Committees for criminal threat inquiry.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Referral ID</th>
                      <th className="py-3 px-3">Case ID</th>
                      <th className="py-3 px-3">Referred Date</th>
                      <th className="py-3 px-3">Organization</th>
                      <th className="py-3 px-3">Offender</th>
                      <th className="py-3 px-3">Risk</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Officer</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 cursor-pointer" onClick={() => openReferral(r.case_id, r.id)}>
                        <td className="py-3 px-3 font-mono font-bold text-sky-800">{r.id}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{r.case_id}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(r.referral_date).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-slate-700">{r.organization_name || 'Tata Group'}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{r.person_involved}</td>
                        <td className="py-3 px-3"><RiskBadge score={r.risk_score} level={r.risk_level} size="sm" /></td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'FIR_INITIATED' ? 'bg-sky-100 text-sky-800' :
                            r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{r.assigned_officer_name || 'Pending Assignment'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openReferral(r.case_id, r.id);
                            }}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-md font-semibold"
                          >
                            Inspect Docket
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : refDetail ? (
            /* POLICE CASE DETAIL VIEW */
            <div className="space-y-6">
              <button
                onClick={() => setSelectedRef(null)}
                className="flex items-center space-x-1 text-xs text-sky-700 hover:text-sky-800 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Referral Docket</span>
              </button>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        REFERRAL: {selectedRef}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">{refDetail.case.id}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{refDetail.case.category}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Origin: <strong>{refDetail.case.organization_name}</strong> • Subject: <strong>{refDetail.case.person_involved}</strong>
                    </p>
                  </div>

                  <RiskBadge score={refDetail.case.risk_score} level={refDetail.case.risk_level} />
                </div>

                {/* Referral Details & Criminal Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Referral Reason</span>
                    <p className="text-slate-800 mt-1 font-medium">{refDetail.case.police_notes || 'Referred for criminal threat evaluation.'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Venue / Jurisdiction</span>
                    <p className="text-slate-800 mt-1 font-medium">{refDetail.case.incident_location}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Police Status</span>
                    <p className="text-sky-800 font-bold mt-1 uppercase font-mono">{refDetail.case.police_status || 'PENDING'}</p>
                  </div>
                </div>

                {/* Simulated Law Enforcement Action Form */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">Record Law Enforcement Action (Simulated)</h4>
                      <p className="text-xs text-slate-400">Updates entered here are recorded in audit logs and sent to ICC & Complainant portals.</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      HACKATHON SIMULATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Inquiry Status</label>
                      <select
                        value={policeStatus}
                        onChange={(e) => setPoliceStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                      >
                        <option value="ACCEPTED">Accepted / Assigned</option>
                        <option value="INVESTIGATING">Preliminary Inquiry Active</option>
                        <option value="FIR_INITIATED">FIR / Docket Initiated</option>
                        <option value="ACTION_TAKEN">Notice Issued / Action Taken</option>
                        <option value="CLOSED">Referral Concluded / Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">FIR / Police Docket Number</label>
                      <input
                        type="text"
                        value={firNumber}
                        onChange={(e) => setFirNumber(e.target.value)}
                        placeholder="e.g. FIR-2026-BKC-0941"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">Police Investigation Notes</label>
                      <textarea
                        rows={3}
                        value={policeNotes}
                        onChange={(e) => setPoliceNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm"
                    >
                      {updating ? 'Saving...' : 'Post Police Action Update'}
                    </button>
                  </div>
                </div>

                {/* Evidence Items & Forensic SHA-256 Check */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Permitted Digital Evidence Items ({refDetail.evidence.length})</h4>
                    <span className="text-xs text-slate-500">Forensically anchored at ingestion</span>
                  </div>

                  <div className="space-y-3">
                    {refDetail.evidence.map((ev) => (
                      <div key={ev.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">{ev.id}</span>
                            <span className="font-semibold text-slate-800">{ev.file_name}</span>
                          </div>
                          <p className="font-mono text-[11px] text-slate-600 mt-1 break-all">
                            SHA-256: <strong>{ev.sha256_hash}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setVerifyEvidenceId(ev.id);
                              setVerifyCustomHash(ev.sha256_hash);
                              setPoliceTab('verify');
                            }}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
                          >
                            Verify in Forensic Tool
                          </button>
                          <button
                            onClick={() => handleOpenCertificate(ev.id)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
                          >
                            <Award className="w-3.5 h-3.5 text-blue-600" />
                            <span>Section 65B Cert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : null}

        </div>
      )}

      {/* TAB 2: FORENSIC EVIDENCE INTEGRITY TOOL */}
      {policeTab === 'verify' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-sky-700">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">Live SHA-256 Forensic Integrity Verification</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare an evidence file's live cryptographic hash against the immutable registry hash to prove chain of custody and zero data tampering.
            </p>
          </div>

          <form onSubmit={handleRunForensicCheck} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Evidence ID</label>
              <input
                type="text"
                required
                value={verifyEvidenceId}
                onChange={(e) => setVerifyEvidenceId(e.target.value)}
                placeholder="e.g. EV-2026-00004"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Forensic Checksum to Verify (Optional - leave blank to compare live file with vault record)
              </label>
              <input
                type="text"
                value={verifyCustomHash}
                onChange={(e) => setVerifyCustomHash(e.target.value)}
                placeholder="Paste 64-character hex SHA-256 hash or leave empty"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              {verifying ? 'Executing Cryptographic Comparison...' : 'Run Forensic Verification Check'}
            </button>
          </form>

          {/* Forensic Result Box */}
          {verificationResult && (
            <div className={`p-5 rounded-2xl border text-xs space-y-2 ${
              verificationResult.isMatch
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {verificationResult.isMatch ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>✓ CRYPTOGRAPHIC INTEGRITY VERIFIED — EXACT MATCH</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>⚠ INTEGRITY COMPROMISED — HASH MISMATCH DETECTED</span>
                  </>
                )}
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-slate-200 font-mono space-y-1 text-[11px]">
                <div>File: <strong>{verificationResult.fileName}</strong></div>
                <div className="break-all">Expected Hash: {verificationResult.expectedHash}</div>
                <div className="break-all">Live File Hash: {verificationResult.actualLiveHash}</div>
                <div>Verified By: {verificationResult.officer} ({verificationResult.department})</div>
                <div>Timestamp: {new Date(verificationResult.verifiedAt).toLocaleString()}</div>
              </div>

              <p className="text-[11px] leading-relaxed">
                {verificationResult.isMatch
                  ? 'The electronic artifact on disk is mathematically identical to the state recorded at time of upload. No bits have been altered, truncated, or replaced.'
                  : 'Warning: The computed hash differs from the vault ledger. This evidence file has been modified or corrupted.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* SECTION 65B CERTIFICATE MODAL */}
      {showCertModal && (
        <Section65BModal certificate={certData} onClose={() => setShowCertModal(false)} />
      )}

    </div>
  );
};
