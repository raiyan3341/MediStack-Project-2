import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  if (status === 'approved') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
      >
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        Verified Organization
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}
      >
        {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
        Verification Pending
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}
    >
      {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
      Verification Rejected
    </span>
  );
};

