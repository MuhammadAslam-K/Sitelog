import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

/**
 * Reusable DateInput component that always displays selected dates in DD-MM-YYYY format
 * while keeping underlying values and the native browser/mobile date picker in ISO YYYY-MM-DD.
 */
export function DateInput({
  value = '',
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  placeholder = 'dd-mm-yyyy',
  className = '',
  wrapperClassName = '',
  showIcon = false,
  title,
  id,
  name
}) {
  const nativeInputRef = useRef(null);

  const formattedDisplay = value ? formatDate(value) : '';

  const handleOpenPicker = () => {
    if (disabled) return;
    try {
      if (nativeInputRef.current && typeof nativeInputRef.current.showPicker === 'function') {
        nativeInputRef.current.showPicker();
      }
    } catch {
      // Fallback: native input click/focus handles picker on browsers without showPicker
    }
  };

  return (
    <div className={`relative inline-flex items-center ${wrapperClassName}`}>
      <input
        ref={nativeInputRef}
        id={id}
        name={name}
        type="date"
        value={value || ''}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        title={title || formattedDisplay || placeholder}
        onChange={onChange}
        onClick={handleOpenPicker}
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div
        aria-hidden="true"
        className={`flex items-center justify-between gap-1.5 select-none overflow-hidden transition-colors ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${className}`}
      >
        <span className={`font-mono whitespace-nowrap ${formattedDisplay ? '' : 'text-slate-400'}`}>
          {formattedDisplay || placeholder}
        </span>
        {showIcon && (
          <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        )}
      </div>
    </div>
  );
}
