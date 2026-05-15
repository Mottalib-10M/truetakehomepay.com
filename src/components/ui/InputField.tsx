import { useCallback, useRef, type ChangeEvent } from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  className?: string;
  noFormat?: boolean;
}

function formatWithCommas(val: string): string {
  const clean = val.replace(/[^0-9.]/g, '');
  if (!clean) return '';
  const parts = clean.split('.');
  const intPart = parts[0].replace(/^0+(?=\d)/, '');
  const formatted = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? formatted + '.' + parts[1] : formatted;
}

export default function InputField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  prefix,
  suffix,
  placeholder,
  min,
  max,
  step,
  helpText,
  className = '',
  noFormat = false,
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldFormat = type === 'text' && !noFormat && prefix === '$';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (shouldFormat) {
        const clean = raw.replace(/[^0-9.]/g, '');
        if (!clean) { onChange(''); return; }
        const formatted = formatWithCommas(raw);
        onChange(formatted);
      } else {
        onChange(raw);
      }
    },
    [onChange, shouldFormat]
  );

  const displayValue = shouldFormat && value ? formatWithCommas(String(value)) : value;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`tabular-nums w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors
            placeholder:text-slate-400
            focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20
            dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-navy-400
            ${prefix ? 'pl-7' : ''}
            ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
