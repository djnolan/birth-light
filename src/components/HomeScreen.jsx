import { useState } from 'react';

const STAR_PATH_D = 'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z';
const STAR_ROT_DEG = [0, -93.6, 93.6, -172.5];
const STAR_CX = 715.863;
const STAR_CY = 159.818;
const STAR_NORM = 1 / 26.73; // scale factor to make path radius = 1 unit

const STAR_POS = [
  { x: 8,  y: 4.5, r: 0.50 }, { x: 22, y: 1.8, r: 0.38 },
  { x: 38, y: 6.5, r: 0.42 }, { x: 53, y: 1.2, r: 0.55 },
  { x: 67, y: 4.0, r: 0.38 }, { x: 80, y: 0.8, r: 0.46 },
  { x: 89, y: 6.0, r: 0.34 }, { x: 96, y: 2.5, r: 0.50 },
  { x: 15, y: 9.0, r: 0.28 }, { x: 44, y: 8.5, r: 0.36 },
  { x: 72, y: 7.5, r: 0.30 }, { x: 31, y: 3.0, r: 0.28 },
  { x: 61, y: 8.0, r: 0.40 }, { x: 86, y: 9.5, r: 0.32 },
  { x: 4,  y: 11,  r: 0.24 },
];

function HomeStars() {
  return (
    <svg
      className="home-stars"
      viewBox="0 0 100 13"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {STAR_POS.map(({ x, y, r }, i) => {
        const s = r * STAR_NORM;
        const deg = STAR_ROT_DEG[i % 4];
        const opacity = 0.07 + (i % 4) * 0.05;
        return (
          <path
            key={i}
            d={STAR_PATH_D}
            transform={`translate(${x},${y}) rotate(${deg}) scale(${s.toFixed(5)}) translate(${-STAR_CX},${-STAR_CY})`}
            fill={`rgba(240,240,238,${opacity.toFixed(3)})`}
          />
        );
      })}
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
        <h1 className="home-headline">
          Find Your<br />Birth Light
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
    </div>
  );
}
