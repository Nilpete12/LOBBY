"use client";

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Car, Check, ChevronDown, MapPin } from 'lucide-react';
import { TAXI_STANDS } from '@/lib/taxiStands';

const VARIANT_STYLES = {
  hero: {
    root: 'w-full md:w-64',
    button: 'min-h-14 rounded-xl md:rounded-2xl bg-[#e8ece6] md:bg-transparent p-1 md:p-0',
    iconWrap: 'h-10 w-10 md:h-14 md:w-14 rounded-lg md:rounded-2xl bg-white/70 md:bg-[#e8ece6] shadow-sm md:shadow-none',
    label: 'text-base md:text-sm',
  },
  search: {
    root: 'w-full',
    button: 'min-h-14 rounded-2xl border border-white/70 bg-white/60 px-4 shadow-sm focus:border-[#8ea08e] focus:ring-2 focus:ring-[#8ea08e]/15',
    iconWrap: 'h-9 w-9 rounded-xl bg-[#e8ece6]',
    label: 'text-base',
  },
};

export default function TaxiStandDropdown({
  name = 'stand',
  value,
  defaultValue = '',
  onChange,
  variant = 'search',
  className = '',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedStand = TAXI_STANDS.find((stand) => stand.name === selectedValue);
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.search;

  const updatePanelPosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportPadding = 12;
    const gap = 8;
    const preferredMaxHeight = 320;
    const minHeight = 168;
    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - viewportPadding - width
    );
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const spaceAbove = rect.top - viewportPadding - gap;
    const openAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
    const availableSpace = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(minHeight, Math.min(preferredMaxHeight, availableSpace));
    const top = openAbove
      ? Math.max(viewportPadding, rect.top - gap - maxHeight)
      : Math.min(window.innerHeight - viewportPadding - maxHeight, rect.bottom + gap);

    setPanelStyle({ left, top, width, maxHeight });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition]);

  const selectStand = (nextValue) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={`relative ${styles.root} ${className}`}>
      <input type="hidden" name={name} value={selectedValue || ''} />

      <button
        ref={buttonRef}
        type="button"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex w-full items-center gap-2 text-left outline-none transition ${styles.button}`}
        onClick={() => {
          if (!isOpen) updatePanelPosition();
          setIsOpen((current) => !current);
        }}
      >
        <span className={`flex shrink-0 items-center justify-center text-[#627568] ${styles.iconWrap}`}>
          <Car size={20} />
        </span>

        <span className="min-w-0 flex-1 px-1">
          <span className={`block truncate font-black text-slate-800 ${styles.label}`}>
            {selectedStand?.name || 'Taxi Stands'}
          </span>
          {selectedStand && (
            <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">
              {selectedStand.location}
            </span>
          )}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180 text-[#627568]' : ''}`}
        />
      </button>

      {isOpen && panelStyle && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          id={listId}
          role="listbox"
          style={panelStyle}
          className="fixed z-[80] overflow-y-auto rounded-3xl border border-white/70 bg-white/80 p-2 text-left shadow-2xl shadow-slate-900/15 backdrop-blur-xl"
        >
          <TaxiStandOption
            name="Taxi Stands"
            location="All major stands"
            isSelected={!selectedValue}
            onSelect={() => selectStand('')}
          />

          {TAXI_STANDS.map((stand) => (
            <TaxiStandOption
              key={stand.id}
              name={stand.name}
              location={stand.location}
              status={stand.status}
              statusColor={stand.statusColor}
              isSelected={selectedValue === stand.name}
              onSelect={() => selectStand(stand.name)}
            />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function TaxiStandOption({ name, location, status, statusColor, isSelected, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition last:mb-0 ${
        isSelected
          ? 'bg-[#dce4d8] text-[#627568]'
          : 'text-slate-700 hover:bg-[#e8ece6]'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isSelected ? 'bg-white/80 text-[#627568]' : 'bg-[#e8ece6] text-slate-400'}`}>
        {isSelected ? <Check size={18} /> : <MapPin size={18} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black">{name}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">{location}</span>
      </span>

      {status && (
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${statusColor}`}>
          {status}
        </span>
      )}
    </button>
  );
}
