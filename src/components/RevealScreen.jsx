import { House, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getStarDisplayName, formatDate, getVisibilityNote } from '../lib/birthLight';

export default function RevealScreen({ stars, currentIndex, onIndexChange, onBack, onCalendar }) {
  const star = stars[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  return (
    <div className="reveal-screen">
      <div className="reveal-overlay">
        <div className="reveal-header">
          <button onClick={onBack} className="header-btn" aria-label="Back to home">
            <House size={18} />
          </button>
          <div />
          <button onClick={onCalendar} className="header-btn" aria-label="Open calendar">
            <Calendar size={18} />
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
          ><ChevronLeft size={32} /></button>
          <button
            className="carousel-btn"
            onClick={() => onIndexChange(currentIndex + 1)}
            disabled={!canGoNext}
            aria-label="Next star"
          ><ChevronRight size={32} /></button>
        </div>

        <div className="reveal-bottom">
          <h2 className="birth-date">{formatDate(star.birthLightDate)}</h2>
          <p className="birth-age">You will be {star.distLy.toFixed(1)} years old</p>
          <p className="visibility-note">{getVisibilityNote(star)}</p>
        </div>
      </div>
    </div>
  );
}
