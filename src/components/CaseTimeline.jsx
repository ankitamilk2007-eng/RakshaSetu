import React from 'react';
import { CheckCircle2, Clock, Circle, Shield, Search, FileCheck } from 'lucide-react';

export const CaseTimeline = ({ events = [], currentStatus = 'SUBMITTED' }) => {
  const stages = [
    { key: 'SUBMITTED', label: 'Complaint Submitted' },
    { key: 'RECEIVED', label: 'Received by ICC' },
    { key: 'ASSIGNED', label: 'Investigator Appointed' },
    { key: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
    { key: 'EVIDENCE_REVIEW', label: 'Evidence Forensic Review' },
    { key: 'ACTION_TAKEN', label: 'Interim Protection Enacted' },
    { key: 'RESOLVED', label: 'Inquiry Concluded' }
  ];

  const getStageIndex = (status) => {
    const s = (status || '').toUpperCase();
    const idx = stages.findIndex(st => st.key === s);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="py-4">
      {/* Horizontal Progress Bar for Desktop */}
      <div className="hidden lg:flex items-center justify-between relative mb-8 px-4">
        {/* Connecting line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
        <div 
          className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 90}%` }}
        />

        {stages.map((st, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={st.key} className="flex flex-col items-center relative z-10 text-center w-24">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                isDone ? 'bg-emerald-600 text-white' :
                isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110' :
                'bg-white border-2 border-slate-300 text-slate-400'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${
                isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Event Log List */}
      <div className="space-y-4">
        <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Audit Timeline History</h5>
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No formal stage changes logged yet.</p>
        ) : (
          events.map((ev, i) => (
            <div key={ev.id || i} className="flex items-start space-x-3 text-xs">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-1">
                  <span>{new Date(ev.created_at).toLocaleString()}</span>
                  <span className="font-semibold uppercase text-slate-600">{ev.actor_role} ({ev.changed_by_name || 'System'})</span>
                </div>
                <p className="font-semibold text-slate-800">
                  {ev.to_status ? `Status changed to: ${ev.to_status.replace(/_/g, ' ')}` : ev.action}
                </p>
                {ev.notes && (
                  <p className="text-slate-600 mt-1 italic">"{ev.notes}"</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
