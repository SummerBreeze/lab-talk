import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0f172a] mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-[#e5e7eb] bg-white text-[#0f172a] placeholder-[#94a3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent hover:border-[#d1d5db] transition-all text-sm ${
          error ? 'border-[#ef4444] focus:ring-[#ef4444]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#ef4444]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0f172a] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 border border-[#e5e7eb] bg-white text-[#0f172a] placeholder-[#94a3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent hover:border-[#d1d5db] transition-all resize-vertical text-sm min-h-[120px] ${
          error ? 'border-[#ef4444] focus:ring-[#ef4444]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#ef4444]">{error}</p>}
    </div>
  );
}
