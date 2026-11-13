import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full group">
        {label && (
          <label 
            htmlFor={id} 
            className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 transition-colors duration-300 group-focus-within:text-[#c53030]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-12 w-full rounded-sm border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c53030]/60 focus:ring-1 focus:ring-[#c53030]/30 focus:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-mono",
            error && "border-red-500/80 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-mono mt-1 border-l-2 border-red-500 pl-2 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
