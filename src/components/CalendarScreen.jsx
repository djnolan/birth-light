import { X } from 'lucide-react';
import { groupStarsByYear, getStarDisplayName, formatDate } from '../lib/birthLight';

function HemiDot({ hemisphere }) {
  return (
    <span
      className={`cal-dot cal-dot--${hemisphere}`}
      aria-label={
        hemisphere === 'northern'
          ? 'Northern hemisphere'
          : hemisphere === 'southern'
          ? 'Southern hemisphere'
          : 'Both hemispheres'
      }
    />
  );
}

function dateToFraction(date) {
  const start = new Date(date.getFullYear(), 0, 1).getTime();
  const end = new Date(date.getFullYear() + 1, 0, 1).getTime();
  return (date.getTime() - start) / (end - start);
}

export default function CalendarScreen({ stars, onClose, onStarSelect }) {
  const years = groupStarsByYear(stars);

  function handleDotClick(starId) {
    const index = stars.findIndex(s => s.id === starId);
    if (index >= 0) onStarSelect(index);
  }

  return (
    <div className="calendar-screen">
      <div className="cal-header">
        <div>
          <h2 className="cal-title">Upcoming dates</h2>
          <p className="cal-subtitle">When your birth light will arrive</p>
        </div>
        <button onClick={onClose} className="close-btn" aria-label="Close calendar">
          <X size={22} />
        </button>
      </div>

      <div className="cal-key">
        <span className="cal-key-label">Visibility</span>
        <span className="cal-key-item"><span className="cal-dot cal-dot--northern" /> Northern hemisphere</span>
        <span className="cal-key-item"><span className="cal-dot cal-dot--southern" /> Southern hemisphere</span>
        <span className="cal-key-item"><span className="cal-dot cal-dot--both" /> Both</span>
      </div>

      <div className="cal-years">
        {years.map(({ year, stars: yearStars }) => (
          <div key={year} className="cal-year-row">
            <button className="cal-year-label" onClick={() => handleDotClick(yearStars[0].id)}>{year}</button>
            <div className="cal-timeline">
              <div className="cal-line" />
              {yearStars.map(star => (
                <button
                  key={star.id}
                  className="cal-dot-btn"
                  style={{ left: `${dateToFraction(star.birthLightDate) * 100}%` }}
                  onClick={() => handleDotClick(star.id)}
                  title={`${getStarDisplayName(star)} — ${formatDate(star.birthLightDate)}`}
                  aria-label={`${getStarDisplayName(star)}, ${formatDate(star.birthLightDate)}`}
                >
                  <HemiDot hemisphere={star.hemisphere} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
