import React, { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]',
  success: 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]',
  warning: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
  info: 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]',
};

export const Badge = memo(function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
});
