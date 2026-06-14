import { useState, useEffect } from 'react';
import { getUpcomingStars } from './lib/birthLight';
import HomeScreen from './components/HomeScreen';
import RevealScreen from './components/RevealScreen';
import CalendarScreen from './components/CalendarScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [upcomingStars, setUpcomingStars] = useState([]);
  const [starIndex, setStarIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('birthlight_birthday');
    if (saved) {
      const stars = getUpcomingStars(saved);
      if (stars.length > 0) {
        setUpcomingStars(stars);
        setScreen('reveal');
      }
    }
  }, []);

  function handleBirthdaySubmit(birthday) {
    const stars = getUpcomingStars(birthday);
    setUpcomingStars(stars);
    setStarIndex(0);
    localStorage.setItem('birthlight_birthday', birthday);
    setScreen('reveal');
  }

  function handleReset() {
    localStorage.removeItem('birthlight_birthday');
    setUpcomingStars([]);
    setStarIndex(0);
    setScreen('home');
  }

  function handleStarSelect(index) {
    setStarIndex(index);
    setScreen('reveal');
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen onSubmit={handleBirthdaySubmit} />
      )}
      {screen === 'reveal' && upcomingStars.length > 0 && (
        <RevealScreen
          stars={upcomingStars}
          currentIndex={starIndex}
          onIndexChange={setStarIndex}
          onBack={handleReset}
          onCalendar={() => setScreen('calendar')}
        />
      )}
      {screen === 'calendar' && (
        <CalendarScreen
          stars={upcomingStars}
          onClose={() => setScreen('reveal')}
          onStarSelect={handleStarSelect}
        />
      )}
    </>
  );
}
