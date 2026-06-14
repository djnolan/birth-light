# Birth Light — Project Plan

## Concept

A personal web app where you enter your birthday and discover stars whose light has been traveling toward Earth since the day you were born. The core emotional truth: *the light is as old as you are.*

You enter your birthday, the sky reveals itself, and you’re shown every star with a Birth Light date coming in your future — dates when you can go outside, look up, and see light that left that star the day you were born.

-----

## The Birth Light Moment

For every star in the dataset, the app calculates a specific date — when light that left the star on the exact day you were born will reach Earth. This is a real, calculable event based on precise light-year distances converted to days. Each star produces its own date, so a user has many of these moments stretching years into the future — they are not annual, and not singular.

The name for this concept (“Birth Light” is the current working term) is TBD and will likely become clear once the UI and copy take shape.

-----

## Data

**Source:** HYG Database v3 — a free, well-maintained catalog of ~120,000 stars with distance (in light-years), coordinates (right ascension and declination), magnitude, and proper names where they exist.

**Filtering approach:**

- Distance range covering human lifespans — roughly 1–100 light-years
- Naked-eye visible stars only (magnitude 6.5 or brighter)
- Hemisphere visibility derived from declination (northern / southern / both)
- Preprocessed into a clean local JSON file — no live API needed

**Processed dataset (`stars.json`):**

- 601 total stars (1–100 ly, magnitude ≤ 6.5)
- 50 stars with proper names
- 58 bright stars (magnitude ≤ 3.0)

**Key data points per star:**

- Proper name (if it has one) and Bayer designation
- Distance in light-years (precise enough to calculate Birth Light date)
- Constellation
- Magnitude
- Right ascension + declination (for star map rendering and visibility)
- Hemisphere visibility flag (northern / southern / both)
- Best viewing season (derived from RA)

-----

## Screens & User Flow

### Home Screen

Centered layout, no navigation chrome — this is the root of the app.

- Headline: *“Find your birth light”*
- Subhead: *“Enter your birthday to find starlight as old as you are”*
- Birthday input field (centered)
- Privacy note below input: *“Your information is saved to your device only and not shared anywhere else.”*
- Returning users skip this screen and land directly on their reveal screen
- Designed for both landscape and portrait / mobile orientations

### Reveal Screen

The primary experience. One star shown at a time, carousel ordered by Birth Light date (soonest first). Only upcoming dates shown — the app is purely forward-looking.

**UI elements:**

- Back arrow, top left (returns to home / birthday input)
- Small title text, top center: *“Find your birth light”*
- Calendar icon button, top right (navigates to calendar view)
- Large heading: Birth Light date (e.g. *“August 26, 2026”*)
- Large heading: star name and distance (e.g. *“Vega 25”*)
- Left / right carousel arrows on sides of the visual
- Immersive star field visual, centered, with the star highlighted and a subtle sparkle/glow
- Reveal text block below the visual
- Visibility note at the bottom (small dot + line treatment)

**Reveal text variations** (rotates across stars):

> *“Look up at [star] on [date]. The light you’ll see that night left [age] years ago — the day you were born. You’re seeing the star exactly as it was in that moment.”*

> *“On [date], look up at [star]. That light has been traveling for [age] years. What you’ll see is a picture of the star from the day you were born.”*

> *“Find [star] on [date]. The light reaching your eyes that night left [age] years ago, on the day you were born. You’re looking at a snapshot of that star from your very first day.”*

> *“Step outside on [date] and look for [star]. The light arriving that night has been crossing space for [age] years — since the exact day you were born. That’s how old the light is. That’s how old you are.”*

### Calendar Screen

A separate view, opened from the reveal screen. Close button (×) top right. No back arrow.

**Layout:**

- Headline / key area at top explaining the visualization and visibility indicators
- Scrollable list of upcoming years, each on its own row
- Each row: year label in a box on the left, then a horizontal line with dots marking individual star Birth Light dates for that year
- Visual hemisphere visibility indicator per dot/star, with a key
- Tap a dot or year to navigate to that star on the reveal screen
- Designed for both landscape and portrait / mobile orientations

-----

## Visibility & the “Go Look” Invitation

The app includes a genuine, actionable invitation to go outside and find the star — grounded in what’s knowable without any location permission:

- **Hemisphere visibility:** Derived from declination. e.g. *“Visible from the northern hemisphere.”*
- **Season:** Derived from right ascension. e.g. *“Best viewed on summer evenings.”*
- **Naked-eye visibility:** All stars in the dataset are naked-eye visible (magnitude ≤ 6.5), noted per star.

Combined, the app can already say something like: *“Vega is visible to the naked eye from the northern hemisphere — look for it on summer evenings.”*

When location is added in a later phase, this same invitation gets upgraded to real-time precision as an enhancement to an existing feature rather than something new.

-----

## Visual Design Direction

- Appealing to both kids and adults
- Stark contrast to typical astronomy apps — no blue gradients
- Minimal and stark but playful — black and white only, or slight variations
- Reference: Paul Rand making a children’s book about stars, in black and white
- Cut paper aesthetic — minimal, slightly tactile star shapes
- Subtle shines or glows used sparingly
- Real star map data underlies the visual even within the minimal aesthetic
- Compelling and unexpected typography
- Additional illustrations TBD

-----

## Star Map Visual

The visual is based on real coordinate data from HYG — not random dots. Right ascension and declination are projected onto a 2D canvas to create an accurate star field. The current star is highlighted at center within this real sky. The visual stays minimal in terms of UI chrome but is astronomically grounded.

Projection math and rendering approach TBD during build — likely Canvas API or SVG. Full interactive sky map is out of scope for the prototype.

-----

## Special Case: Very Young Ages

For users aged 1–3, no star in the dataset is close enough — the nearest star (Rigil Kentaurus / Alpha Centauri) is ~4.3 light years away. Rather than a dead end, this is framed as a moment of wonder: the app shows our nearest stellar neighbor with a note that their light hasn’t had time to travel this far yet. A possible line: *“You’re younger than starlight.”*

-----

## Privacy

- **localStorage:** Birthday is saved locally in the user’s browser and never transmitted anywhere. No cookie banner or consent flow required. Addressed with a single line on the home screen.
- **Location:** Not used in the prototype. No permissions requested.

-----

## Tech Stack

- **React + Vite** — consistent with existing projects, well-suited to the interactivity and state involved
- **Star data** — preprocessed HYG Database subset as local JSON (`stars.json`, 601 stars)
- **Star map rendering** — Canvas API or SVG (TBD)
- **Persistence** — localStorage for birthday and preferences

-----

## Prototype Scope

**In:**

- Birthday input with privacy note
- Birth Light date calculation for all 601 stars
- Reveal screen with carousel of all upcoming stars (ordered by Birth Light date, soonest first)
- Reveal text variations per star
- Visibility note per star on reveal screen (hemisphere, season, naked-eye)
- Calendar screen with year-by-year view, line plot visualization, and hemisphere visibility indicators with key
- Immersive star map visual per star, real coordinate data
- localStorage persistence for return visits

**Out (for now):**

- Location detection of any kind
- Seasonal / nightly sky positioning beyond best season label
- Social sharing
- Any backend or user accounts

-----

## Later Phases

**Location (when it’s worth asking for):**

Hemisphere-level visibility is already knowable without location, making a permission prompt a poor value exchange at the prototype stage. Location becomes worth requesting only when the app can deliver meaningfully precise, personal information in return — specifically:

- **Horizon visibility** — a star’s declination plus the user’s precise latitude determines whether it actually rises above their horizon at all
- **Seasonal visibility** — combined with the current date, location enables *“this star is currently visible”* vs. *“best viewed in winter”*
- **“Go look tonight”** — the most compelling version: *“Vega is visible from your location right now, look northeast after 9pm”* — requires precise location plus spherical astronomy math

This layer should be scoped and built as a distinct phase, framed as a meaningful upgrade to the experience rather than a default behavior.
