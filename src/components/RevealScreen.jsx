import { getStarDisplayName, formatDate, getVisibilityNote } from '../lib/birthLight';

function PersonDownIcon() {
  return (
    <svg viewBox="0 0 20 27" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="5" r="3.8" />
      <path d="M10 9 L10 17" />
      <path d="M10 12 L5 16 M10 12 L15 16" />
      <path d="M10 17 L6.5 22.5 M10 17 L13.5 22.5" />
      <path d="M10 25 L10 27 M7.5 25 L10 27 L12.5 25" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="4" width="16" height="14" rx="1.5" />
      <path d="M2 8 L18 8" />
      <path d="M7 2 L7 6 M13 2 L13 6" />
      <path d="M6 12 L8 12 M10 12 L12 12 M14 12 L16 12" />
    </svg>
  );
}

function HemiDot({ hemisphere }) {
  return (
    <span
      className={`hemi-dot hemi-dot--${hemisphere}`}
      aria-label={
        hemisphere === 'northern' ? 'Northern hemisphere'
        : hemisphere === 'southern' ? 'Southern hemisphere'
        : 'Both hemispheres'
      }
    />
  );
}

export default function RevealScreen({ stars, currentIndex, onIndexChange, onBack, onCalendar }) {
  const star = stars[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  return (
    <div className="reveal-screen">
      <div className="reveal-overlay">
        <div className="reveal-header">
          <button onClick={onBack} className="header-btn" aria-label="Back to home">
            <PersonDownIcon />
          </button>
          <div />
          <button onClick={onCalendar} className="header-btn" aria-label="Open calendar">
            <CalendarIcon />
          </button>
        </div>

        <div className="reveal-top">
          <h1 className="star-name-heading">{getStarDisplayName(star)}</h1>
          <p className="star-distance">{star.distLy.toFixed(1)} light years</p>
        </div>

        <div className="carousel-zone">
          <button
            className="carousel-btn"
            onClick={() => onIndexChange(currentIndex - 1)}
            disabled={!canGoPrev}
            aria-label="Previous star"
          >←</button>
          <button
            className="carousel-btn"
            onClick={() => onIndexChange(currentIndex + 1)}
            disabled={!canGoNext}
            aria-label="Next star"
          >→</button>
        </div>

        <div className="reveal-bottom">
          <h2 className="birth-date">{formatDate(star.birthLightDate)}</h2>
          <p className="birth-age">You will be {star.distLy.toFixed(1)} years old</p>
          <div className="visibility-note">
            <HemiDot hemisphere={star.hemisphere} />
            <span>{getVisibilityNote(star)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
