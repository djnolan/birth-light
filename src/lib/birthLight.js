import starsData from '../data/stars.json';

export function calcBirthLightDate(birthday, distLy) {
  const birthdayMs = new Date(birthday).getTime();
  return new Date(birthdayMs + distLy * 365.25 * 24 * 60 * 60 * 1000);
}

export function getUpcomingStars(birthday) {
  const now = new Date();
  return starsData
    .map((star, i) => ({
      ...star,
      birthLightDate: calcBirthLightDate(birthday, star.distLy),
      revealVariant: i % 4,
    }))
    .filter(s => s.birthLightDate > now)
    .sort((a, b) => a.birthLightDate - b.birthLightDate);
}

export function getStarDisplayName(star) {
  return star.properName || star.name;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getVisibilityNote(star) {
  const hemi =
    star.hemisphere === 'both'
      ? 'from both hemispheres'
      : `from the ${star.hemisphere} hemisphere`;
  return `Visible to the naked eye ${hemi} — best viewed on ${star.bestSeason} evenings.`;
}

export function getRevealText(star, variant) {
  const name = getStarDisplayName(star);
  const date = formatDate(star.birthLightDate);
  const age = star.distLy.toFixed(1);
  return [
    `Look up at ${name} on ${date}. The light you'll see that night left ${age} years ago — the day you were born. You're seeing the star exactly as it was in that moment.`,
    `On ${date}, look up at ${name}. That light has been traveling for ${age} years. What you'll see is a picture of the star from the day you were born.`,
    `Find ${name} on ${date}. The light reaching your eyes that night left ${age} years ago, on the day you were born. You're looking at a snapshot of that star from your very first day.`,
    `Step outside on ${date} and look for ${name}. The light arriving that night has been crossing space for ${age} years — since the exact day you were born. That's how old the light is. That's how old you are.`,
  ][variant % 4];
}

export function groupStarsByYear(stars) {
  const groups = {};
  for (const star of stars) {
    const year = star.birthLightDate.getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(star);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, yearStars]) => ({ year: Number(year), stars: yearStars }));
}
