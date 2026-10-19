import React from 'react';
import type { SelectProps } from './Select';

export type { SelectOption, SelectProps } from './Select';

// Web dropdown: a real <select> so it gets keyboard / mouse-wheel / type-to-search for free.
// Plain DOM + inline styles (NativeWind is not applied to *.web.tsx files).
export function Select({ label, value, options, onChange, placeholder = 'Select…', required, error, disabled }: SelectProps) {
  const selected = options.find((o) => o.value === value);
  return (
    <div style={{ marginBottom: 16 }}>
      {label ? (
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          {label}{required ? <span style={{ color: '#EF4444' }}> *</span> : null}
        </label>
      ) : null}
      <div style={{ position: 'relative' }}>
        {selected?.color ? (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: 999, background: selected.color, pointerEvents: 'none' }} />
        ) : null}
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', appearance: 'none', WebkitAppearance: 'none',
            padding: `13px 40px 13px ${selected?.color ? 32 : 16}px`,
            border: `1px solid ${error ? '#F87171' : '#CBD5E1'}`, borderRadius: 16,
            fontSize: 15, color: selected ? '#111827' : '#9CA3AF', background: '#fff',
            fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer', outline: 'none',
          }}
        >
          {!selected ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} style={o.accent ? { color: '#2563EB', fontWeight: 600 } : undefined}>
              {o.label}
            </option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B', fontSize: 12 }}>▼</span>
      </div>
      {error ? <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}
