# Design

## Visual Theme

Direction: Care Desk. The interface should feel like a calm tabletop with sturdy printed cards, a clear side rail on desktop, and an easy one-column flow on phone.

Physical scene: an older adult or caregiver opens the app at a kitchen table in daylight on a Windows laptop, then later uses the same product on a phone near the fridge.

## Color System

Use warm tinted neutrals and five section colors:

- Move: moss green.
- Understand: clinic blue.
- Bad day plan: warm amber.
- Goal: grounded olive.
- Safety: clear red.

Colors should be expressed in OKLCH where possible. Keep saturation moderate, especially on light backgrounds. Never rely on color alone for meaning.

## Typography

Use local, readable system fonts with a Windows-first path:

```css
Aptos, "Avenir Next", "Segoe UI", Verdana, sans-serif
```

Use larger body text than a typical productivity app. Keep labels compact, but never tiny.

## Layout

Phone:

- Single-column task flow.
- Fixed bottom navigation.
- Safety and check-in remain reachable without awkward horizontal scrolling.

Desktop:

- Full browser layout with a side navigation rail.
- Main panel uses available width.
- Home screen can show a care summary beside primary actions.
- Exercise cards use wider media and text rhythm, not a narrow phone column.

## Components

- Section tiles use text pills and clear headings.
- Exercise media stays visible and framed.
- Buttons use full-width primary controls on phone and measured controls on desktop.
- Progress and safety content use calm panels, not nested cards.
- Focus states are visible and consistent.

## Motion

Motion is brief and state-based only. Respect reduced-motion settings.
