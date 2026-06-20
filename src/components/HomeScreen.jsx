import { useState } from 'react';

const STAR_POS = [
  { x: 8,  y: 11, r: 1.1 }, { x: 22, y: 5,  r: 0.8 }, { x: 37, y: 15, r: 1.0 },
  { x: 52, y: 4,  r: 1.3 }, { x: 67, y: 10, r: 0.9 }, { x: 79, y: 3,  r: 1.1 },
  { x: 88, y: 14, r: 0.8 }, { x: 95, y: 7,  r: 1.2 }, { x: 15, y: 19, r: 0.7 },
  { x: 44, y: 20, r: 0.9 }, { x: 71, y: 18, r: 0.8 }, { x: 30, y: 8,  r: 0.7 },
  { x: 60, y: 19, r: 1.0 }, { x: 85, y: 21, r: 0.8 }, { x: 5,  y: 23, r: 0.6 },
];

function HomeStars() {
  return (
    <svg className="home-stars" viewBox="0 0 100 26" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {STAR_POS.map(({ x, y, r }, i) => (
        <polygon
          key={i}
          points={`${x},${y - r * 1.5} ${x + r},${y} ${x},${y + r * 1.5} ${x - r},${y}`}
          fill={`rgba(240,240,238,${0.12 + (i % 4) * 0.06})`}
        />
      ))}
    </svg>
  );
}

function FigureSmall() {
  return (
    <svg viewBox="0 0 40 88" width="36" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <ellipse cx="20" cy="11" rx="7.5" ry="8.5" />
      <path d="M20 20 L20 50" />
      <path d="M20 32 L8 44" />
      <path d="M20 32 L32 44" />
      <path d="M20 50 L12 78" />
      <path d="M20 50 L28 78" />
    </svg>
  );
}

export default function HomeScreen({ onSubmit }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;
    onSubmit(value);
  }

  return (
    <div className="home-screen">
      <HomeStars />

      <div className="home-content">
        <p className="app-wordmark">birth light</p>
        <h1 className="home-headline">
          Find your<br />birth light
        </h1>
        <p className="home-subhead">
          Enter your birthday to find starlight as old as you are
        </p>
        <form onSubmit={handleSubmit} className="home-form">
          <input
            type="date"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="birthday-input"
            max={new Date().toISOString().split('T')[0]}
            required
            aria-label="Your birthday"
          />
          <button type="submit" className="submit-btn" disabled={!value}>
            Begin ◇
          </button>
        </form>
        <p className="privacy-note">
          Your information is saved to your device only and not shared anywhere else.
        </p>
      </div>

      <div className="home-figure" aria-hidden="true">
        <FigureSmall />
        <div className="home-ground" />
      </div>
    </div>
  );
}
