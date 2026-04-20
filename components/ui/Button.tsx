import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const variants = {
    primary: 'bg-[#6366f1] text-white hover:bg-[#4f46e5] focus:ring-[#6366f1]',
    secondary: 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] focus:ring-[#cbd5e1]',
    outline: 'bg-transparent text-[#6366f1] border border-[#e5e7eb] hover:bg-[#f8fafc] hover:border-[#6366f1] focus:ring-[#6366f1]',
    ghost: 'bg-transparent text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
