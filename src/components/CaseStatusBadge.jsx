import React from 'react';
import { Clock, CheckCircle2, Search, FileCheck, Shield, AlertCircle } from 'lucide-react';

export const CaseStatusBadge = ({ status = 'SUBMITTED', size = 'normal' }) => {
  const norm = (status || 'SUBMITTED').toUpperCase().replace(/\s+/g, '_');

  const config = {
    SUBMITTED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'Submitted'
    },
    RECEIVED: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: FileCheck,
      label: 'Received by ICC'
    },
    ASSIGNED: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Search,
      label: 'Investigator Assigned'
    },
    UNDER_INVESTIGATION: {
      bg: 'bg-amber-50 text-amber-700 border-amber-300',
      icon: Search,
      label: 'Under Investigation'
    },
    EVIDENCE_REVIEW: {
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: FileCheck,
      label: 'Evidence Review'
    },
    ACTION_TAKEN: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Shield,
      label: 'Interim Relief / Action'
    },
    RESOLVED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      icon: CheckCircle2,
      label: 'Resolved / Concluded'
    },
    CLOSED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: CheckCircle2,
      label: 'Closed'
    }
  }[norm] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Clock,
    label: norm.replace(/_/g, ' ')
  };

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg}`}>
        <Icon className="w-2.5 h-2.5" />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} shadow-xs`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
