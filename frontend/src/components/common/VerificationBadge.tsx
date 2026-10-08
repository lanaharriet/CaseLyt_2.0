import React from 'react';
import type { VerificationStatus } from '../../types';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true
}) => {
  const configs = {
    VERIFIED: {
      bg: 'bg-[#3E654F]/15 border-[#3E654F]/40 text-[#3E654F]',
      label: 'VERIFIED IN SOURCE TEXT',
      icon: CheckCircle2,
    },
    CONFLICTING: {
      bg: 'bg-[#A16D2B]/15 border-[#A16D2B]/40 text-[#A16D2B]',
      label: 'CONFLICTING EVIDENCE DETECTED',
      icon: AlertTriangle,
    },
    UNVERIFIED: {
      bg: 'bg-[#171717]/10 border-[#171717]/30 text-[#171717]/80',
      label: 'UNVERIFIED / PARTIAL SUPPORT',
      icon: HelpCircle,
    },
    'NOT FOUND': {
      bg: 'bg-[#92383B]/15 border-[#92383B]/40 text-[#92383B]',
      label: 'NOT FOUND IN PROVIDED DOCUMENTS',
      icon: XCircle,
    }
  };

  const config = configs[status] || configs['UNVERIFIED'];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider font-semibold border rounded-xs ${config.bg} ${sizeClasses}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
