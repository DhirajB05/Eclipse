# ANTIGRAVITY — EV CHARGING APP UI/UX REDESIGN + BOOKING FLOW

## MASTER INSTRUCTIONS

You are redesigning an **existing EV Charging Station Finder & Booking application**.

Your job is to improve the UI/UX and add/organize the station-detail and booking-flow presentation **without breaking the existing application logic**.

The provided visual references are design references. They are NOT templates to copy blindly.

---

# 0. PRIORITY ORDER

Follow these rules in this exact priority:

1. **Do not modify the existing landing page.**
2. **Do not break existing functionality or logic.**
3. **Do not invent data or functionality.**
4. **Do not generate AI-slop SVG icons.**
5. **Use the provided charging-station image asset.**
6. **Use the supplied card reference for the station-card visual design.**
7. **Use the editorial reference for typography, spacing, borders, and overall visual language.**
8. Build the station → detail → booking → confirmation experience as described below.

If two instructions conflict, the higher-priority rule wins.

---

# 1. LANDING PAGE IS LOCKED

## DO NOT TOUCH THE LANDING PAGE

The existing landing page is completely locked.

Do not modify:

- layout
- hero
- typography
- colors
- images
- illustrations
- navigation
- animations
- spacing
- copy
- responsive behavior
- components
- styling

Do not apply the new card design to the landing page.

Do not "improve" the landing page.

Do not refactor landing-page code unless absolutely required to prevent a functional issue elsewhere.

If a shared component is used by both the landing page and application pages, do NOT globally restyle it.

Instead use:

- a scoped variant
- page-specific classes
- a separate component variant

The landing page must visually remain as it currently is.

---

# 2. EXISTING FUNCTIONALITY IS ALSO LOCKED

The existing application logic is the source of truth.

Do not unnecessarily change:

- API calls
- endpoints
- database logic
- state management
- routing
- authentication
- search logic
- filtering
- sorting
- booking logic
- validation
- event handlers
- dynamic data
- existing integrations
- data structures

The redesign should primarily change the **presentation layer**.

### Core rule:

> Change how the application looks, not what the application does.

If existing booking functionality already exists, adapt the UI to it.

Do not replace working logic with mock logic.

Do not hardcode values that should come from the existing data.

---

# 3. FIRST STEP — AUDIT THE PROJECT

Before modifying anything, inspect the entire relevant application.

Identify:

- framework
- routes
- landing page
- station-list page
- station-card component
- station-detail page
- booking page/flow
- booking confirmation
- my bookings page
- shared components
- CSS/design system
- existing icon library
- existing image assets
- state management
- API/data flow

Do not start changing files before understanding these relationships.

Create a clear mental map:

```text
LOCKED
Landing Page

REDESIGN
Station Listing
Station Cards
Station Detail
Booking UI
Booking Confirmation
My Bookings UI
```

---

# 4. CHARGING STATION IMAGE ASSET

Use the existing station image at:

```text
/home/aresenic/Eclipse/Charging_Station.png
```

This is the preferred image for the charging-station card/detail visual.

### IMPORTANT

Do NOT:

- generate a replacement SVG
- create a random AI illustration
- replace this image with another generated image
- hardcode a different external image
- distort the image

Use the provided local asset through the project's normal asset/import mechanism.

Preserve its quality.

Use appropriate:

```css
object-fit: cover;
```

or

```css
object-fit: contain;
```

depending on the composition required by the card.

Do not crop away the important charging-station subject.

If multiple stations already have real image assets in the application, preserve their dynamic image behavior. Otherwise use the provided `Charging_Station.png` asset consistently.

---

# 5. ICON RULE — NO AI-SLOP SVG

This is non-negotiable.

Do NOT generate random SVG icons.

Do not create:

- generic AI-style SVG illustrations
- random line-art icons
- random geometric icons
- decorative SVG blobs
- generic EV illustrations
- meaningless location-pin SVGs
- random charger SVGs
- random heart SVGs

If an existing icon library is already installed, use it.

Examples:

- Lucide
- Heroicons
- Radix
- Material Symbols
- Font Awesome
- existing project icon system

Use the existing icon system consistently.

Do not introduce another icon library unless absolutely necessary.

If there is no suitable icon:

> No icon is better than a meaningless generated SVG.

---

# 6. DESIGN LANGUAGE

The application pages should combine two references:

### Reference A — Editorial website

Use it for:

- typography
- hierarchy
- spacing
- editorial composition
- thin borders
- asymmetric layouts
- strong headings
- restrained accent color
- whitespace
- visual rhythm

### Reference B — Charging station card

Use it for:

- station card structure
- green availability pill
- large station title
- location row
- specification grid
- price/action area
- large image panel
- white surface
- soft green accents
- generous spacing
- rounded outer card

Do NOT copy either reference literally.

The final product must still look like the existing EV application.

---

# 7. VISUAL SYSTEM

Use:

### Background

- white / off-white
- very subtle neutral surfaces

### Text

- near-black / dark navy
- strong contrast

### Accent

- restrained green/lime green

Use green for:

- availability
- active states
- primary CTA
- important values
- selected states
- subtle visual accents

Avoid:

- purple AI gradients
- excessive gradients
- glassmorphism
- heavy shadows
- excessive neon
- excessive colors

---

# 8. TYPOGRAPHY

Typography should be a major part of the redesign.

Use:

- large bold display headings
- strong uppercase labels where appropriate
- clean body typography
- italic/editorial accent typography only where it genuinely improves hierarchy
- tight heading line-height
- strong contrast between headings and metadata

Do not randomly install decorative fonts.

Inspect the existing project first.

Use a production-quality font system.

---

# 9. CHARGING STATION LISTING

The station listing is the main place where the provided charging-station card reference should be implemented.

## DESKTOP GRID

Display:

**2 charging station cards per row.**

Example:

```text
┌──────────────────────────┐  ┌──────────────────────────┐
│ Station 01               │  │ Station 02               │
│                          │  │                          │
│                          │  │                          │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ Station 03               │  │ Station 04               │
│                          │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

Use an actual responsive two-column grid.

Do not create three or four cards per row on desktop.

On mobile:

**1 card per row.**

---

# 10. CHARGING STATION CARD DESIGN

The card should closely follow the provided charging-station reference.

## Card composition

Each card should have:

### TOP

Left:

```text
● 2 / 3 Available
```

Right:

Favorite/heart control.

Both values and state must remain dynamic.

Use existing data and existing interaction logic.

---

## STATION TITLE

Large, bold title.

Example:

```text
The Forum Fiza Mall
AC Charging Station
Mangalore
```

Use the actual station name from the application.

Do not hardcode the example.

---

## LOCATION

Below title:

```text
[icon] Mangalore, Karnataka
```

Use actual station location data.

Use an existing icon library.

---

## DIVIDER

Use a thin divider separating identity information from technical specifications.

---

# 11. SPECIFICATION GRID

Use a 2-column specification layout.

Example:

```text
CHARGER              POWER
AC Charger           7.4 kW

CONNECTOR            HOURS
Type 1               06:00 – 22:00
```

Use existing station data.

Possible fields:

- charger type
- power
- connector
- operating hours
- availability

Only show fields that actually exist.

Do not invent technical specifications.

---

# 12. CARD IMAGE

The right side of the card should contain a large image area.

Use:

```text
/home/aresenic/Eclipse/Charging_Station.png
```

The image should feel like a major part of the card, not a tiny thumbnail.

Target visual balance:

```text
CONTENT ≈ 55–60%
IMAGE ≈ 40–45%
```

Maintain generous whitespace and clean alignment.

The image should have rounded corners consistent with the reference.

---

# 13. PRICE + VIEW STATION

At the bottom of the card:

Left:

```text
PRICE

₹10 /kWh
```

Use actual price data.

Right:

```text
View Station →
```

The button must preserve the existing click behavior.

Do not change the route or handler.

Only redesign the button visually.

---

# 14. STATION DETAIL PAGE

When the user clicks:

**View Station**

open the existing station-detail route/page.

Do not create a random new dashboard.

The page should be structured around:

> understand → locate → book

---

## DETAIL PAGE TOP

Use a compact top navigation:

```text
← BACK TO STATIONS                         ♡ SAVE STATION
```

Preserve existing route and favorite behavior.

---

# 15. STATION DETAIL — MAIN LAYOUT

Desktop:

Use approximately:

```text
LEFT CONTENT ≈ 55%
MAP ≈ 45%
```

Structure:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STATION INFORMATION              GOOGLE MAP                │
│                                                             │
│  ● 2 / 3 Available                                         │
│                                                             │
│  THE FORUM FIZA MALL                                       │
│  AC CHARGING STATION                                      │
│  MANGALORE                                                 │
│                                                             │
│  Mangalore, Karnataka                                     │
│                                                             │
│  ───────────────────────      ┌─────────────────────────┐  │
│                               │                         │  │
│  CHARGER        POWER         │                         │  │
│  AC Charger     7.4 kW        │      GOOGLE MAP         │  │
│                               │                         │  │
│  CONNECTOR      HOURS         │            ●            │  │
│  Type 1         06–22         │                         │  │
│                               │                         │  │
│  ───────────────────────      │                         │  │
│                               └─────────────────────────┘  │
│  ₹10 /kWh                 [ BOOK NOW → ]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 16. GOOGLE MAP

Integrate the Google Map into the station-detail page.

The map should be a proper large visual panel.

It should display:

- station location
- map context
- marker
- useful roads/nearby context
- standard map controls where appropriate

Do not cover the map with decorative overlays.

Do not replace the map with a static fake image.

Use the existing Google Maps integration if one already exists.

If Google Maps functionality already exists in the project, preserve it.

If credentials/configuration are already present, use them rather than inventing new configuration.

---

# 17. GET DIRECTIONS

Provide a clear:

```text
GET DIRECTIONS →
```

action if the existing application supports it.

It should open the appropriate map/directions behavior.

Do not fake the functionality.

---

# 18. BOOK NOW

The primary action on the station-detail page should be:

```text
BOOK NOW →
```

Keep it visually prominent.

It must use the existing booking functionality.

Do not create a fake booking flow if one already exists.

---

# 19. BOOKING PAGE

After clicking:

**BOOK NOW**

show a focused booking page.

Do not use a generic dashboard.

The booking page should answer:

> When do you want to charge?

---

# 20. BOOKING PAGE STRUCTURE

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ ← BACK TO STATION                               STEP 01 / 02 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ BOOK YOUR CHARGING SLOT                                      │
│ The Forum Fiza Mall                                          │
│ Mangalore, Karnataka                                         │
│                                                              │
│ ┌─────────────────────────────────┐ ┌──────────────────────┐ │
│ │                                 │ │ BOOKING SUMMARY      │ │
│ │ SELECT DATE                     │ │                      │ │
│ │                                 │ │ Station               │ │
│ │ AUGUST 2026                     │ │ The Forum Fiza Mall  │ │
│ │                                 │ │                      │ │
│ │ M  T  W  T  F  S  S             │ │ DATE                 │ │
│ │                                 │ │ 18 Aug 2026          │ │
│ │ 17 18 19 20 21 22 23             │ │                      │ │
│ │ 24 25 26 27 28 29 30             │ │ TIME                 │ │
│ │                                 │ │ 10:30–11:30          │ │
│ │ SELECT TIME                     │ │                      │ │
│ │                                 │ │ DURATION             │ │
│ │ [10:00] [10:30] [11:00]         │ │ 1 hour               │ │
│ │ [11:30] [12:00] ...             │ │                      │ │
│ │                                 │ │ PRICE                │ │
│ │                                 │ │ ₹10 / kWh            │ │
│ └─────────────────────────────────┘ │                      │ │
│                                     │ [ CONFIRM BOOKING → ] │ │
│                                     └──────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Adapt the exact controls to the existing booking functionality.

---

# 21. DATE SELECTION

Provide a clear date selector/calendar.

Use actual current availability logic if already implemented.

Do not hardcode availability.

Unavailable dates must not appear selectable if the existing logic supports date availability.

---

# 22. TIME SELECTION

Show available time slots.

Example:

```text
10:00 AM
10:30 AM
11:00 AM
11:30 AM
12:00 PM
```

But these are examples only.

Use actual available booking slots from the application.

Unavailable slots must have a clear disabled state.

---

# 23. DURATION

If the existing application supports booking duration:

show a clear duration selector.

Examples:

```text
30 min
1 hour
2 hours
```

Only use durations supported by the existing functionality.

Do not invent a new booking rule.

---

# 24. BOOKING SUMMARY

Keep a persistent summary panel.

It should show:

- station
- charger
- date
- time
- duration
- price/rate
- estimated cost if the application calculates it

Do not invent cost calculations.

If the current system only stores a rate and does not calculate a total, display only the available information.

---

# 25. CONFIRMATION STEP

Do not immediately finalize a booking when the user selects a slot unless the existing product logic explicitly requires that.

Prefer a confirmation state:

```text
CONFIRM YOUR BOOKING

The Forum Fiza Mall
AC Charging Station

18 AUGUST 2026
10:30 AM — 11:30 AM

CHARGER
AC Charger

CONNECTOR
Type 1

LOCATION
Mangalore, Karnataka

────────────────────

PRICE
₹10 /kWh

[ ← EDIT BOOKING ]    [ CONFIRM BOOKING → ]
```

The final confirmation button must use the existing booking submission logic.

---

# 26. BOOKING CONFIRMED

After successful booking, show a clean confirmation state.

Example:

```text
                         ✓

                  BOOKING CONFIRMED

                  You're all set.

              The Forum Fiza Mall
              AC Charging Station

              18 AUGUST 2026
              10:30 AM — 11:30 AM

              BOOKING ID
              EV-240817-01

             [ VIEW MY BOOKINGS ]

             [ BACK TO STATIONS ]
```

Use the actual booking ID/data.

Do not invent one.

Do not add excessive animation or confetti.

A simple confirmation icon and strong typography are sufficient.

---

# 27. MY BOOKINGS

If the application already contains a My Bookings page, redesign its visual presentation using the same system.

Keep:

- booking data
- booking status
- cancellation
- update
- view details
- existing routes
- existing logic

Do not invent booking records.

Use a clean editorial list/card system consistent with the station cards.

---

# 28. RESPONSIVE DESIGN

## Desktop

Station listing:

```text
2 cards per row
```

Station detail:

```text
Information + Map side-by-side
```

Booking:

```text
Booking controls + Summary side-by-side
```

## Tablet

Maintain two columns where there is enough space.

## Mobile

Station listing:

```text
1 card per row
```

Station detail:

```text
Station information
↓
Google Map
↓
Specifications
↓
Book Now
```

Booking:

```text
Station
↓
Date
↓
Time
↓
Duration
↓
Summary
↓
Confirm
```

Do not allow horizontal overflow.

---

# 29. CARD / DETAIL / BOOKING VISUAL CONSISTENCY

All application pages must feel like one product.

Reuse:

- typography
- spacing
- borders
- green accent
- button styling
- icon system
- status styling
- surface styling

Do not create a different design language for every page.

---

# 30. DO NOT OVER-DESIGN

Do not add:

- random illustrations
- unnecessary charts
- unnecessary statistics
- fake testimonials
- fake badges
- decorative blobs
- excessive gradients
- glassmorphism
- excessive shadows
- random animations
- extra sections

If the page feels empty:

First improve:

1. typography
2. spacing
3. alignment
4. hierarchy
5. composition

Do not fill empty space with random graphics.

---

# 31. ANTI-AI-SLOP CHECK

Before completing the work, verify:

- [ ] No random SVG icons were generated.
- [ ] Existing icon library is respected.
- [ ] No unnecessary illustrations were added.
- [ ] No generic purple/blue AI gradients were added.
- [ ] No excessive rounded cards were added.
- [ ] No fake content was added.
- [ ] No fake data was added.
- [ ] No unnecessary sections were added.
- [ ] No unnecessary animations were added.
- [ ] The design does not look like a generic AI SaaS template.

---

# 32. FUNCTIONAL QA

Before finishing, verify:

- [ ] Search works.
- [ ] Filters work.
- [ ] Station cards render dynamic data.
- [ ] Favorite works.
- [ ] View Station works.
- [ ] Google Map loads correctly.
- [ ] Station marker is correct.
- [ ] Get Directions works if already supported.
- [ ] Book Now works.
- [ ] Date selection works.
- [ ] Time selection works.
- [ ] Duration selection works if supported.
- [ ] Booking summary updates dynamically.
- [ ] Confirm Booking works.
- [ ] Booking confirmation appears after successful booking.
- [ ] My Bookings still works.
- [ ] Existing routes still work.
- [ ] Existing API/data flow still works.

---

# 33. FINAL LANDING-PAGE CHECK

Before declaring the task complete:

**Open the landing page.**

Compare it against its state before the redesign.

It must remain unchanged.

If any redesign accidentally changed the landing page:

**REVERT THAT CHANGE.**

Do not solve it by modifying the landing page further.

---

# 34. FINAL SUCCESS CRITERIA

The final result should feel like:

> A carefully designed EV charging product with a strong editorial visual identity, where finding a station, viewing its location, and booking a charging slot feels like one coherent experience.

It should NOT feel like:

> A copied reference website.

It should NOT feel like:

> A generic AI-generated SaaS dashboard.

The correct flow is:

```text
LANDING PAGE
     ↓
SEARCH / FIND STATIONS
     ↓
STATION LIST
     ↓
2-COLUMN STATION CARDS
     ↓
VIEW STATION
     ↓
STATION DETAIL + GOOGLE MAP
     ↓
BOOK NOW
     ↓
SELECT DATE + TIME (+ DURATION IF SUPPORTED)
     ↓
BOOKING SUMMARY
     ↓
CONFIRM BOOKING
     ↓
BOOKING CONFIRMED
     ↓
MY BOOKINGS
```

## FINAL PRINCIPLE

**Preserve the product.**

**Preserve the logic.**

**Preserve the landing page.**

**Use the provided station image.**

**Use the station-card reference closely.**

**Use the editorial reference for visual language.**

**Do not generate AI-slop SVG icons.**

**Do not invent functionality.**

**Do not invent data.**

**Do not over-design.**

The goal is a polished, coherent UI/UX redesign — not a rebuild.
