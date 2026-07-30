import { useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStarDisplayName, formatDate, getVisibilityNote } from '../lib/birthLight';

const STAR_PATH_D = 'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z';
const STAR_CX = 715.863;
const STAR_CY = 159.818;

const GRID_ROTS = [2, -1.5, 3.5, -2, 0.5, -3, 1, -2.5, 2.5];

function StarGridIcon() {
  const s = 5 / 54;
  return (
    <svg viewBox="0 0 21 21" className="header-grid-svg" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = col * 7 + 3.5;
        const cy = row * 7 + 3.5;
        return (
          <path
            key={i}
            d={STAR_PATH_D}
            fill="currentColor"
            transform={`translate(${cx},${cy}) rotate(${GRID_ROTS[i]}) scale(${s}) translate(${-STAR_CX},${-STAR_CY})`}
          />
        );
      })}
    </svg>
  );
}

export default function RevealScreen({ stars, currentIndex, onIndexChange, onBack, onCalendar }) {
  const star = stars[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < stars.length - 1;

  // On first mount (e.g. arriving from pan-up) don't animate text; only animate on navigation
  const mountedRef = useRef(false);
  const animKey = mountedRef.current ? star.id : 'initial';
  if (!mountedRef.current) mountedRef.current = true;

  return (
    <div className="reveal-screen">
      <div className="reveal-overlay">
        <div className="reveal-header">
          <button onClick={onBack} className="header-btn header-ghost-btn" aria-label="Back to home">
            <span className="header-ghost-wrap">
              <svg viewBox="689 133 54 54" className="header-ghost-svg" aria-hidden="true">
                <path d={STAR_PATH_D} fill="none" stroke="currentColor" strokeWidth="2.5" />
              </svg>
              <ArrowLeft size={13} className="header-ghost-icon" />
            </span>
          </button>
          <div />
          <button onClick={onCalendar} className="header-btn" aria-label="Open calendar">
            <StarGridIcon />
          </button>
        </div>

        {/* key changes on navigation → remount triggers CSS animation; initial mount skips it */}
        <div key={animKey} className={`star-text-anim${animKey !== 'initial' ? ' star-text-anim--navigating' : ''}`}>
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
    </div>
  );
}
