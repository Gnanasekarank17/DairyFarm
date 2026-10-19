import React, { useEffect, useRef, useState } from 'react';

interface EditableCellProps {
  value: string;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'number';
  /** Provide to render a <select> instead of a text input. */
  options?: string[];
  /** Custom read-only display (e.g. a status badge) shown when not editing. */
  displayValue?: React.ReactNode;
}

/** Click-to-edit cell: click to enter edit mode, Enter/blur to save, Escape to cancel. */
export function EditableCell({
  value, editing, onStartEdit, onCommit, onCancel, type = 'text', options, displayValue,
}: EditableCellProps) {
  const [draft, setDraft] = useState(value);
  const cancelledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      cancelledRef.current = false;
      requestAnimationFrame(() => (inputRef.current ?? selectRef.current)?.focus());
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        onClick={onStartEdit}
        style={{ cursor: 'pointer', minHeight: 20, padding: '3px 6px', borderRadius: 6 }}
        title="Click to edit"
      >
        {displayValue ?? (value || <span style={{ color: '#CBD5E1' }}>—</span>)}
      </div>
    );
  }

  const commitAndClose = (v: string) => {
    if (cancelledRef.current) return;
    // Ensure value is always a string when committing
    onCommit(String(v));
  };
  const cancel = () => {
    cancelledRef.current = true;
    onCancel();
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '4px 6px', border: '1.5px solid #2563EB', borderRadius: 6,
    fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff',
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitAndClose(draft); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  };

  if (options) {
    return (
      <select
        ref={selectRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitAndClose(draft)}
        onKeyDown={onKeyDown}
        style={inputStyle}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type === 'number' ? 'number' : 'text'}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commitAndClose(draft)}
      onKeyDown={onKeyDown}
      style={inputStyle}
    />
  );
}

export interface CellEditingState {
  id: string;
  field: string;
}

/** Shared edit-state helper: which cell is being edited, keyed by row id + field. */
export function useCellEditing() {
  const [editing, setEditing] = useState<CellEditingState | null>(null);
  return {
    editing,
    isEditing: (id: string, field: string) => editing?.id === id && editing?.field === field,
    startEdit: (id: string, field: string) => setEditing({ id, field }),
    stopEdit: () => setEditing(null),
  };
}
