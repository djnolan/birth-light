# Birth Light — Claude Code Instructions

## Project files

Two files accompany these instructions:

- **`birth-light-plan.md`** — the full project spec. Read this first and refer back to it throughout.
- **`stars.json`** — the preprocessed star dataset (601 stars). This is the only data source. No external API is needed.

-----

## Tech stack

- React + Vite
- Local JSON data only (`stars.json`)
- Canvas API or SVG for the star map visual (your call based on what works best)
- localStorage for persisting the user’s birthday across sessions

-----

## Build order

Work in this sequence. Do not move to the next step until the current one is verified working.

1. **Data layer first** — load `stars.json`, accept a birthday input, calculate Birth Light dates for all 601 stars using the formula below, filter to upcoming dates only, and sort soonest first. Log the output and verify it looks correct before touching any UI.
1. **Home screen** — minimal, centered layout. Birthday input, headline, subhead, privacy note. On submit, save birthday to localStorage and navigate to the reveal screen.
1. **Reveal screen** — one star at a time, carousel with previous/next arrows. Date and star name as large headings, placeholder for star map visual, reveal text block, visibility note at bottom.
1. **Star map visual** — implement the RA/dec → 2D projection as an isolated function first, verify it plots stars in the correct relative positions, then integrate into the reveal screen with the current star highlighted.
1. **Calendar screen** — year-by-year list, each row with a horizontal line and dots for that year’s Birth Light dates. Tapping a dot navigates to that star on the reveal screen.

-----

## Birth Light date formula

The Birth Light date is calculated at runtime from the user’s birthday and each star’s distance:

```
birthLightDate = birthday + (star.distLy × 365.25 days)
```

This gives the exact date when light that left the star on the user’s birthday will reach Earth. Only show stars whose Birth Light date is in the future.

-----

## Design direction

Read the Visual Design Direction section of the plan carefully. Key points:

- **Black and white only** (or very slight variations) — do not use color, gradients, or the default astronomy aesthetic of dark blue
- Minimal and stark but playful — reference: Paul Rand making a children’s book about stars
- Cut paper aesthetic for star shapes — slightly tactile, not photographic
- Subtle sparkle or glow on the highlighted star only — used sparingly
- Compelling, unexpected typography — not system defaults
- The star map visual should feel immersive but remain within the minimal aesthetic — real data, minimal chrome

-----

## Reveal text

Each star in the carousel displays one of these four variations, rotated or assigned consistently:

1. *“Look up at [star] on [date]. The light you’ll see that night left [age] years ago — the day you were born. You’re seeing the star exactly as it was in that moment.”*
1. *“On [date], look up at [star]. That light has been traveling for [age] years. What you’ll see is a picture of the star from the day you were born.”*
1. *“Find [star] on [date]. The light reaching your eyes that night left [age] years ago, on the day you were born. You’re looking at a snapshot of that star from your very first day.”*
1. *“Step outside on [date] and look for [star]. The light arriving that night has been crossing space for [age] years — since the exact day you were born. That’s how old the light is. That’s how old you are.”*

-----

## Important constraints

- No external APIs or live data — everything runs locally
- No backend, no user accounts
- Keep the prototype scope tight — build only what is listed in the Prototype Scope section of the plan
- Do not invent features or UI elements not described in the plan or these instructions
- Ask before making any significant design or structural decisions not covered here
