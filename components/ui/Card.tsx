import React, { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export const Card = memo(function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm ${
        hover ? 'transition-all duration-200 hover:border-[#d1d5db] hover:shadow-md' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = memo(function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 pb-4 border-b border-[#e5e7eb] ${className}`}>
      {children}
    </div>
  );
});

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = memo(function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-base font-semibold text-[#0f172a] ${className}`}>
      {children}
    </h3>
  );
});

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = memo(function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`text-[#0f172a] text-sm ${className}`}>{children}</div>;
});
