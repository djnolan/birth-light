import { useEffect, useRef, useState } from 'react';
import flatpickr from 'flatpickr';

// The submit button is the eye (see EyeButton in App); this reports the
// chosen date upward so the eye can enable itself.
export default function HomeScreen({ onSubmit, onDateChange }) {
  const [dateValue, setDateValue] = useState('');
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: 'm/d/Y',
      maxDate: 'today',
      disableMobile: true,
      onReady(_, __, fp) {
        // Replace year spinner with a select dropdown
        const yearEl = fp.currentYearElement;
        const sel = document.createElement('select');
        sel.className = 'flatpickr-year-select';
        const max = new Date().getFullYear();
        for (let y = max; y >= max - 120; y--) {
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          if (y === fp.currentYear) opt.selected = true;
          sel.appendChild(opt);
        }
        sel.addEventListener('change', e => fp.changeYear(Number(e.target.value)));
        yearEl.parentNode.replaceChild(sel, yearEl);
      },
      onYearChange(_, __, fp) {
        const sel = fp.calendarContainer?.querySelector('.flatpickr-year-select');
        if (sel) sel.value = fp.currentYear;
      },
      onMonthChange(_, __, fp) {
        const sel = fp.calendarContainer?.querySelector('.flatpickr-year-select');
        if (sel) sel.value = fp.currentYear;
      },
      onChange(selectedDates) {
        if (!selectedDates[0]) { setDateValue(''); onDateChange?.(''); return; }
        const d = selectedDates[0];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDateValue(`${yyyy}-${mm}-${dd}`);
        onDateChange?.(`${yyyy}-${mm}-${dd}`);
      },
    });
    return () => fpRef.current?.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e) {
    e.preventDefault();
    if (!dateValue) return;
    onSubmit(dateValue);
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <h1 className="home-headline">
          Find Your<br />Birth Light
        </h1>
        <p className="home-subhead">
          Enter your birthday to find starlight as old as you are
        </p>
        <form onSubmit={handleSubmit} className="home-form">
          <div className="date-input-wrap">
            <input
              ref={inputRef}
              id="birthday"
              type="text"
              placeholder="MM/DD/YYYY"
              readOnly
              className="birthday-input"
              aria-label="Your birthday"
            />
          </div>
        </form>
      </div>
      <p className="privacy-note">Saved to your device only.</p>
    </div>
  );
}
