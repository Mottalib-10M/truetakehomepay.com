import { useCallback, type ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  helpText?: string;
  className?: string;
}

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  helpText,
  className = '',
}: SelectFieldProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          className="w-full appearance-none truncate rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 shadow-sm transition-colors
            focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20
            dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-navy-400"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {helpText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
