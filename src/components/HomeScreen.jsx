import { useState } from 'react';

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
            Find my stars
          </button>
        </form>
        <p className="privacy-note">
          Your information is saved to your device only and not shared anywhere else.
        </p>
      </div>
    </div>
  );
}
