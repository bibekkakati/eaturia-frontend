import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/** Standardized text input field with support for labels, icons, and error messages. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-white border transition-all duration-150 outline-none
              rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm
              focus:ring-2 focus:ring-offset-0
              ${icon ? 'pl-10' : ''}
              ${error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
              }
            `}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 animate-fade-in">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
