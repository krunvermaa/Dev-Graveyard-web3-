import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "appearance-none flex h-12 w-full rounded-sm border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c53030]/60 focus:ring-1 focus:ring-[#c53030]/30 focus:bg-zinc-900/90 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-mono cursor-pointer",
              error && "border-red-500/80 focus:border-red-500",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 group-focus-within:text-[#c53030] transition-colors">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-400 font-mono mt-1 border-l-2 border-red-500 pl-2 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
