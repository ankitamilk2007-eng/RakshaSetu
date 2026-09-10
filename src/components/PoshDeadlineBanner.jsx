import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export const PoshDeadlineBanner = ({ deadlineInfo }) => {
  if (!deadlineInfo) return null;

  const { complaint_submitted_date, investigation_deadline, status } = deadlineInfo;

  const now = new Date();
  const deadline = new Date(investigation_deadline);
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = diff > 0 ? diff : 0;
  const isOverdue = diff <= 0;

  const config = {
    OVERDUE: {
      bg: 'bg-rose-50 border-rose-300 text-rose-900',
      badge: 'bg-rose-600 text-white',
      label: 'OVERDUE — STATUTORY BREACH RISK',
      icon: AlertTriangle
    },
    DUE_SOON: {
      bg: 'bg-amber-50 border-amber-300 text-amber-900',
      badge: 'bg-amber-500 text-slate-950',
      label: 'DUE SOON (< 30 DAYS REMAINING)',
      icon: Clock
    },
    ON_TRACK: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      badge: 'bg-blue-600 text-white',
      label: 'ON TRACK (90-DAY STATUTORY WINDOW)',
      icon: CheckCircle2
    }
  }[status || 'ON_TRACK'] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    badge: 'bg-slate-600 text-white',
    label: 'POSH DEADLINE',
    icon: Calendar
  };

  const Icon = config.icon;

  return (
    <div className={`border rounded-2xl p-4 shadow-sm ${config.bg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
            <Icon className="w-5 h-5 text-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                {config.label}
              </span>
              <span className="text-xs font-semibold text-slate-700">POSH Act 2013 Section 11</span>
            </div>
            <p className="text-xs font-medium mt-1">
              Mandatory 90-day inquiry deadline from filing date: <strong>{new Date(investigation_deadline).toLocaleDateString()}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 self-end sm:self-center">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Days Remaining</span>
            <span className={`text-xl font-bold font-mono ${isOverdue ? 'text-rose-700' : 'text-slate-900'}`}>
              {isOverdue ? `${Math.abs(diff)} Days Overdue` : `${daysRemaining} Days Left`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
        * Internal compliance deadline tracker based on Section 11(4) of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. Provided as decision support, not legal advice.
      </div>
    </div>
  );
};
