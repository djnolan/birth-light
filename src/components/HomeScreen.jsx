import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const STAR_PATH_D = 'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z';

export default function HomeScreen({ onSubmit }) {
  const [dateValue, setDateValue] = useState('');
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: 'm/d/Y',
      maxDate: 'today',
      disableMobile: true,
      onChange(selectedDates) {
        if (!selectedDates[0]) { setDateValue(''); return; }
        const d = selectedDates[0];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDateValue(`${yyyy}-${mm}-${dd}`);
      },
    });
    return () => fpRef.current?.destroy();
  }, []);

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
          <label className="date-label" htmlFor="birthday">Your birthday</label>
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
            <button
              type="button"
              className="date-cal-btn"
              aria-label="Open calendar"
              onClick={() => fpRef.current?.open()}
            >
              <CalendarDays size={15} />
            </button>
          </div>
          <button type="submit" className="star-btn" aria-label="Begin">
            <svg viewBox="689 133 54 54" className="star-btn-shape" aria-hidden="true">
              <path d={STAR_PATH_D} fill="currentColor" />
            </svg>
            <ArrowRight size={24} className="star-btn-arrow" aria-hidden="true" />
          </button>
        </form>
        <p className="privacy-note">Saved to your device only.</p>
      </div>
    </div>
  );
}
