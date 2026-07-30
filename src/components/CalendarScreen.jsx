import { X } from 'lucide-react';
import { groupStarsByYear, getStarDisplayName, formatDate } from '../lib/birthLight';

const STAR_PATH_D = 'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z';
const STAR_CX = 715.863;
const STAR_CY = 159.818;

function DiamondDot({ hemisphere, rotDeg = 0, uid = 'x' }) {
  const clipId = `dp-${uid}`;
  const rotT = `translate(${STAR_CX},${STAR_CY}) rotate(${rotDeg}) translate(${-STAR_CX},${-STAR_CY})`;
  const isHalf = hemisphere === 'northern' || hemisphere === 'southern';

  return (
    <svg viewBox="689 133 54 54" className="cal-dot-svg" aria-hidden="true">
      {isHalf && (
        <defs>
          <clipPath id={clipId}>
            {hemisphere === 'northern'
              ? <rect x="689" y="133" width="54" height="26.82" />
              : <rect x="689" y="159.82" width="54" height="27.18" />
            }
          </clipPath>
        </defs>
      )}
      {isHalf ? (
        <>
          <path d={STAR_PATH_D} fill="none" stroke="currentColor" strokeWidth="2.5" transform={rotT} />
          <g clipPath={`url(#${clipId})`}>
            <path d={STAR_PATH_D} fill="currentColor" transform={rotT} />
          </g>
        </>
      ) : (
        <path d={STAR_PATH_D} fill="currentColor" transform={rotT} />
      )}
    </svg>
  );
}

function dotRotation(star) {
  return ((Math.floor(star.ra * 10) + Math.floor(star.distLy)) % 11) - 5;
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
        <div className="cal-key-items">
          <span className="cal-key-item">
            <DiamondDot hemisphere="northern" rotDeg={-3} uid="key-n" />
            Northern hemisphere
          </span>
          <span className="cal-key-item">
            <DiamondDot hemisphere="southern" rotDeg={2} uid="key-s" />
            Southern hemisphere
          </span>
          <span className="cal-key-item">
            <DiamondDot hemisphere="both" rotDeg={-1} uid="key-b" />
            Both
          </span>
        </div>
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
                  <DiamondDot hemisphere={star.hemisphere} rotDeg={dotRotation(star)} uid={star.id} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
