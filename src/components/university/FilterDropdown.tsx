"use client";

import React, { useEffect, useRef, useState } from "react";

export interface FilterDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FilterDropdownProps {
  options: FilterDropdownOption[];
  onSelect: (value: string) => void;
  placeholder: string;
  /** When set, the trigger shows the matching option's label instead of the placeholder. */
  value?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/**
 * A dropdown whose options live in the DOM, so session replay can record the open,
 * the hover, and the pick. A native <select> renders its list in an OS layer that
 * recordings never capture.
 */
export function FilterDropdown({ options, onSelect, placeholder, value, ariaLabel, style }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = value ? options.find((o) => o.value === value) : undefined;

  return (
    <div className="filter-dropdown" ref={rootRef} style={style}>
      <button
        type="button"
        className="sort-select filter-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected ? "" : "filter-dropdown-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>
      {open && (
        <div className="filter-dropdown-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`filter-dropdown-option ${value === option.value ? "selected" : ""}`}
              disabled={option.disabled}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
