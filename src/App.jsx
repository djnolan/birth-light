import { useState, useEffect } from 'react';
import { getUpcomingStars } from './lib/birthLight';
import HomeScreen from './components/HomeScreen';
import MessageScreen from './components/MessageScreen';
import RevealScreen from './components/RevealScreen';
import CalendarScreen from './components/CalendarScreen';

export default function App() {
  const [nav, setNav] = useState({ screen: 'home', seq: 0, wrapAnim: 'anim-fade', overlayAnim: '' });
  const [upcomingStars, setUpcomingStars] = useState([]);
  const [starIndex, setStarIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('birthlight_birthday');
    if (saved) {
      const stars = getUpcomingStars(saved);
      if (stars.length > 0) {
        setUpcomingStars(stars);
        setNav({ screen: 'reveal', seq: 1, wrapAnim: 'anim-fade', overlayAnim: '' });
      }
    }
  }, []);

  function go(screen, wrapAnim = 'anim-fade', overlayAnim = '') {
    setNav(prev => ({ screen, seq: prev.seq + 1, wrapAnim, overlayAnim }));
  }

  function handleBirthdaySubmit(birthday) {
    const stars = getUpcomingStars(birthday);
    setUpcomingStars(stars);
    setStarIndex(0);
    localStorage.setItem('birthlight_birthday', birthday);
    go('message', 'anim-zoom');
  }

  function handleLookUp() {
    go('reveal', 'anim-fade', 'anim-slide-up');
  }

  function handleBack() {
    localStorage.removeItem('birthlight_birthday');
    setUpcomingStars([]);
    setStarIndex(0);
    go('home', 'anim-fade');
  }

  function handleStarSelect(index) {
    setStarIndex(index);
    setNav(prev => ({ screen: 'reveal', seq: prev.seq + 1, wrapAnim: 'anim-fade', overlayAnim: '' }));
  }

  const { screen, seq, wrapAnim, overlayAnim } = nav;

  return (
    <div key={seq} className={`screen-wrap ${wrapAnim}`}>
      {screen === 'home' && (
        <HomeScreen onSubmit={handleBirthdaySubmit} />
      )}
      {screen === 'message' && upcomingStars.length > 0 && (
        <MessageScreen
          star={upcomingStars[0]}
          onLookUp={handleLookUp}
        />
      )}
      {screen === 'reveal' && upcomingStars.length > 0 && (
        <RevealScreen
          stars={upcomingStars}
          currentIndex={starIndex}
          onIndexChange={setStarIndex}
          onBack={handleBack}
          onCalendar={() => go('calendar', 'anim-slide-up')}
          overlayAnim={overlayAnim}
        />
      )}
      {screen === 'calendar' && (
        <CalendarScreen
          stars={upcomingStars}
          onClose={() => go('reveal', 'anim-fade')}
          onStarSelect={handleStarSelect}
        />
      )}
    </div>
  );
}
