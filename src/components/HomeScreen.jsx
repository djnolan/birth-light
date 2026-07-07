import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const STAR_PATH_D = 'M719.349,186.544C714.037,184.331 708.504,181.011 702.749,176.584C696.995,172.158 692.457,167.731 689.137,163.304C692.015,157.107 695.667,151.297 700.093,145.874C704.52,140.452 708.947,136.191 713.373,133.092C719.128,135.527 724.661,139.124 729.973,143.882C735.285,148.641 739.491,153.234 742.589,157.66C740.376,162.972 737.111,168.34 732.795,173.762C728.479,179.185 723.997,183.446 719.349,186.544Z';

export default function HomeScreen({ onSubmit }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;
    onSubmit(value);
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
          <input
            id="birthday"
            type="date"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="birthday-input"
            max={new Date().toISOString().split('T')[0]}
            aria-label="Your birthday"
          />
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
