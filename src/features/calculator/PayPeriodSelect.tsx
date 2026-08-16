import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { PayPeriods } from '../../domain/calculate-net-salary';

const OPTIONS: PayPeriods[] = [12, 13, 14];

type PayPeriodSelectProps = {
  label: string;
  value: PayPeriods;
  onChange: (value: PayPeriods) => void;
};

export const PayPeriodSelect = ({
  label,
  value,
  onChange,
}: PayPeriodSelectProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(OPTIONS.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId().replaceAll(':', '');
  const labelId = `pay-period-label-${generatedId}`;
  const listboxId = `pay-period-list-${generatedId}`;

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  const selectActive = () => {
    const nextValue = OPTIONS[activeIndex];
    if (nextValue) {
      onChange(nextValue);
    }
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => Math.min(current + 1, OPTIONS.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => Math.max(current - 1, 0));
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(OPTIONS.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) {
          selectActive();
        } else {
          setActiveIndex(OPTIONS.indexOf(value));
          setOpen(true);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div className="period-field" ref={rootRef}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <div className="pay-period-select">
        <button
          type="button"
          role="combobox"
          aria-labelledby={labelId}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={
            open ? `${listboxId}-option-${OPTIONS[activeIndex]}` : undefined
          }
          onClick={() => {
            setActiveIndex(OPTIONS.indexOf(value));
            setOpen((current) => !current);
          }}
          onKeyDown={handleKeyDown}
        >
          <span>{value}</span>
          <span className="select-chevron" aria-hidden="true">
            {open ? '↑' : '↓'}
          </span>
        </button>

        {open && (
          <ul id={listboxId} role="listbox" aria-labelledby={labelId}>
            {OPTIONS.map((option, index) => (
              <li
                id={`${listboxId}-option-${option}`}
                key={option}
                role="option"
                aria-selected={value === option}
                className={activeIndex === index ? 'is-active' : ''}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span>{option}</span>
                {value === option && <span aria-hidden="true">✓</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
