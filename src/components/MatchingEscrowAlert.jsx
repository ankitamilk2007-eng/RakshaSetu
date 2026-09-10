import React, { useState } from 'react';
import { ShieldAlert, Users, Building, Link2, ExternalLink, AlertTriangle, EyeOff, CheckCircle2 } from 'lucide-react';

export const MatchingEscrowAlert = ({ pattern, onEscalate, onViewReports }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-rose-600 text-white font-mono font-bold text-[10px] px-3 py-1 rounded-bl-xl tracking-wider uppercase">
        MATCHING ESCROW THRESHOLD REACHED
      </div>

      <div className="flex items-start space-x-3 mb-3">
        <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-base text-rose-950">Serial Harassment Pattern Detected</h4>
            <span className="font-mono text-xs bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded">
              {pattern.id}
            </span>
          </div>
          <p className="text-xs text-rose-800 mt-1 leading-relaxed">
            Cryptographic escrow match: <strong>{pattern.report_count} independent reports</strong> across <strong>{pattern.organizations_count} organizations/departments</strong> identify the same alleged individual ({pattern.offender_alias}).
          </p>
        </div>
      </div>

      {/* Identity Privacy Guarantee Notice */}
      <div className="bg-white/80 border border-rose-200 rounded-xl p-3 text-[11px] text-slate-700 flex items-center space-x-2 mb-3">
        <EyeOff className="w-4 h-4 text-rose-600 flex-shrink-0" />
        <span>
          <strong>Confidential Escrow Rule:</strong> Survivor identities remain strictly anonymous to each other. Pattern match was established via cryptographic pseudonym matching without cross-survivor data exposure.
        </span>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block uppercase">Reports Matched</span>
          <span className="text-lg font-bold text-rose-700 font-mono">{pattern.report_count} Reports</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block uppercase">Organizations</span>
          <span className="text-lg font-bold text-slate-800 font-mono">{pattern.organizations_count} Units</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block uppercase">Risk Severity</span>
          <span className="text-lg font-bold text-rose-600 uppercase font-mono">{pattern.risk_level}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-center">
          <span className="text-[10px] font-semibold text-slate-500 block uppercase">Offender Pseudonym</span>
          <span className="text-xs font-bold text-slate-900 font-mono mt-1 block truncate">{pattern.offender_alias}</span>
        </div>
      </div>

      {/* Expanded Linked Reports */}
      {expanded && pattern.linked_reports && (
        <div className="bg-white rounded-xl border border-rose-200 p-3 mb-4 space-y-2">
          <span className="text-xs font-bold text-slate-800 block">Anonymized Matching Case Records:</span>
          {pattern.linked_reports.map((lr, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono">
              <span className="font-semibold text-blue-700">{lr.case_id}</span>
              <span className="text-slate-600">{lr.department || 'Department Verified'}</span>
              <span className="text-slate-500">{new Date(lr.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-rose-800 hover:text-rose-900 font-semibold underline"
        >
          {expanded ? 'Hide Linked Metadata' : 'Inspect Permitted Metadata'}
        </button>

        {onEscalate && (
          <button
            onClick={() => onEscalate(pattern)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
            <span>Escalate Serial Offender to Police</span>
          </button>
        )}
      </div>

    </div>
  );
};
