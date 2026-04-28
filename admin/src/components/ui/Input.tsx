'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            className={[
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white',
              'placeholder:text-slate-500 outline-none transition-all duration-200',
              'focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60',
              error ? 'border-red-500/60' : 'border-white/10',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
