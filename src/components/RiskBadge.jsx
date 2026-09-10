import React from 'react';
import { AlertCircle, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RiskBadge = ({ score = 0, level = 'LOW', size = 'normal', showScore = true }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-700/60',
      icon: ShieldAlert,
      label: 'CRITICAL RISK',
      badgeClass: 'bg-rose-600 text-white'
    },
    HIGH: {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      icon: AlertTriangle,
      label: 'HIGH RISK',
      badgeClass: 'bg-amber-600 text-white'
    },
    MEDIUM: {
      bg: 'bg-yellow-950/50',
      text: 'text-yellow-300',
      border: 'border-yellow-700/50',
      icon: AlertCircle,
      label: 'MEDIUM RISK',
      badgeClass: 'bg-yellow-600 text-white'
    },
    LOW: {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-300',
      border: 'border-emerald-700/50',
      icon: ShieldCheck,
      label: 'LOW RISK',
      badgeClass: 'bg-emerald-600 text-white'
    }
  }[normalizedLevel] || {
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: AlertCircle,
    label: normalizedLevel,
    badgeClass: 'bg-slate-700 text-white'
  };

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-2.5 h-2.5" />
        <span>{normalizedLevel}</span>
        {showScore && <span className="font-mono">({score})</span>}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold tracking-wide">{config.label}</span>
      {showScore && (
        <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono font-bold ${config.badgeClass}`}>
          {score}/100
        </span>
      )}
    </div>
  );
};
