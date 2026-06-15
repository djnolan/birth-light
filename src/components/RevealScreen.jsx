import StarMap from './StarMap';
import { getStarDisplayName, formatDate, getVisibilityNote, getRevealText } from '../lib/birthLight';

export default function RevealScreen({ stars, currentIndex, onIndexChange, onBack, onCalendar }) {
  const star = stars[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  return (
    <div className="reveal-screen">
      <StarMap centerStar={star} />

      <div className="reveal-overlay">
        <div className="reveal-header">
          <button onClick={onBack} className="header-btn" aria-label="Back to home">←</button>
          <span className="app-wordmark">birth light</span>
          <button onClick={onCalendar} className="header-btn" aria-label="Open calendar">⊟</button>
        </div>

        <div className="star-info">
          <h1 className="birth-date">{formatDate(star.birthLightDate)}</h1>
          <h2 className="star-name">
            {getStarDisplayName(star)}
            <span className="star-dist"> {star.distLy.toFixed(1)}</span>
          </h2>
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

        <div className="reveal-footer">
          <p className="reveal-text">{getRevealText(star, star.revealVariant)}</p>
          <div className="visibility-note">
            <span className="vis-bullet" aria-hidden="true">·</span>
            <span>{getVisibilityNote(star)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
