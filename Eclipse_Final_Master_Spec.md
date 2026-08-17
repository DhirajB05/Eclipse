# ECLIPSE — EV Charging Station Finder & Booking
## Final Master PRD + TRD + Design System + Website Flow + AI/Graphify Execution Protocol

**Project type:** College Minor Project / Screening Assessment  
**Primary frontend:** HTML5 + CSS3 + Vanilla JavaScript  
**Backend:** Node.js + Express.js  
**Data:** Kaggle charging-station dataset + in-memory booking data  
**Dataset path:** `/home/aresenic/Eclipse/data`  
**API testing:** Postman (already installed)  
**Maps:** Google Maps, only when required by the relevant screen  
**Project state:** Graphify is the authoritative execution memory  
**Primary coding model:** Claude Sonnet by default  
**Escalation model:** Claude Opus for difficult architecture/reasoning only  
**Visual review model:** Gemini Pro only when a visual QA/refinement task specifically requires it  
**Quick-fix models:** Gemini Flash / GPT-OSS for small isolated tasks only

---

# 0. ABSOLUTE PROJECT RULES

These rules override convenience, refactoring preferences, and model assumptions.

## 0.1 Completed work is LOCKED

The existing completed implementation is **READ-ONLY unless the user explicitly requests a change**.

### Landing page lock

`index.html`, its current CSS, backgrounds, illustrations, assets, typography, spacing, layout, visual hierarchy, animations, and already-approved UI are **LOCKED**.

Do NOT:
- redesign the landing page;
- change its visual hierarchy;
- replace the background artwork;
- change approved colors, typography, spacing, or layout;
- remove or rearrange existing sections;
- replace existing artwork/assets;
- migrate it to another framework;
- add a generic UI-kit style;
- refactor working code merely for code-style preference;
- “improve” the design without explicit approval.

Only make the smallest functional changes required to connect existing controls, such as the existing Search button navigating to the station finder.

### Change safety procedure

Before modifying any existing file:
1. Inspect the file.
2. Determine whether it is completed/locked.
3. Preserve current UI and working behavior.
4. Make the smallest change needed.
5. Test the change.
6. Update Graphify immediately.

If a visual change to a locked page appears necessary, **stop and ask the user before implementing it**.

---

# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 Product

**Eclipse — EV Charging Station Finder & Booking**

## 1.2 Problem

EV users need a convenient way to discover charging stations, inspect charger details, understand current application-level availability, and reserve a charging time slot.

## 1.3 Target user

A student/demo EV user who wants to find a suitable charging station, inspect its charging options, reserve a slot, and manage that reservation.

## 1.4 Product goal

Build a polished, understandable application that demonstrates the screening-assessment concepts:
- HTML structure;
- CSS and Flexbox;
- forms;
- DOM manipulation;
- JavaScript events;
- input validation;
- dynamic data rendering;
- responsive design;
- Node.js;
- Express.js;
- REST APIs;
- GET/POST/PUT/DELETE;
- JSON;
- validation;
- HTTP status codes;
- error handling;
- Postman API testing.

## 1.5 Core user journey

```text
Landing
  ↓
Search
  ↓
3–4 second Wi-Fi loader
  ↓
Station Finder / Results
  ↓
Search + Filter + Sort
  ↓
Station Details
  ↓
Check charger/time availability
  ↓
Booking Form
  ↓
Confirm Booking
  ↓
Booking Details
  ↓
My Bookings
  ↓
Update / Cancel
```

## 1.6 In-scope features

### Landing
- Existing design stays unchanged.
- Existing search becomes functional.
- Search action leads to station finder.

### Station Finder
- Dynamic station retrieval from Express.
- Search.
- Filter.
- Sort.
- Station cards.
- Availability indicators.
- Loading, empty, and error states.
- Optional/approved map section.

### Station Details
- Station identity.
- Address/location.
- Charger information.
- Connector type.
- Power.
- Operating hours.
- Availability.
- Price when supported.
- Contact/amenities when supported.
- Google Maps location.
- Book Now CTA.

### Booking
- Station selection.
- Charger selection.
- Date.
- Start/end time or start time + duration.
- Vehicle model.
- Vehicle registration number.
- Validation.
- Conflict detection.
- Confirmation.

### Booking management
- List bookings.
- View individual booking.
- Update booking.
- Cancel booking.
- Show status.

## 1.7 Out of scope

Do not add unless explicitly approved:
- real charger hardware integration;
- live charger telemetry;
- payment gateway;
- production database;
- authentication;
- notifications;
- Redis;
- Docker;
- AWS;
- Firebase;
- Prisma;
- admin dashboard;
- reviews/ratings;
- QR check-in;
- complex pricing engine.

---

# 2. TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 2.1 Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- DOM APIs
- URLSearchParams
- Responsive CSS/Flexbox/Grid where appropriate

Do not migrate to React/Next.js/Vue/etc.

## 2.2 Backend

- Node.js
- Express.js
- JSON REST APIs
- In-memory arrays/objects for runtime state

Keep dependencies minimal. Only add a package when it solves an actual requirement.

## 2.3 Station dataset

The dataset files are located at:

`/home/aresenic/Eclipse/data`

Before writing dataset-specific code, inspect the directory and identify:
- filenames;
- file types;
- row count;
- actual column names;
- missing values;
- duplicate records;
- latitude/longitude availability;
- station/charger fields;
- relevant geographic fields.

**Never assume the schema.** Build the normalized application model from the actual files.

### Canonical application station model

Adapt to the real dataset:

```js
{
  id,
  name,
  location,
  address,
  city,
  state,
  latitude,
  longitude,
  chargerTypes,
  connectorTypes,
  powerKW,
  operatingHours,
  contact,
  amenities,
  price,
  totalChargers
}
```

Do not fabricate facts that the dataset does not contain. Optional demo fields must be clearly documented.

## 2.4 Charger model

```js
{
  id,
  stationId,
  type,
  connector,
  powerKW,
  status
}
```

Possible statuses:
- `AVAILABLE`
- `BOOKED`
- `MAINTENANCE`
- `CLOSED`

If charger-level records are missing, create only a small deterministic demo charger inventory needed for functionality and document it as simulated.

## 2.5 Booking model

```js
{
  id,
  stationId,
  chargerId,
  date,
  startTime,
  endTime,
  vehicleModel,
  vehicleNumber,
  status,
  createdAt
}
```

Possible statuses:
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`

---

# 3. REST API CONTRACT

## 3.1 Stations

```http
GET /api/stations
GET /api/stations/:id
GET /api/stations/:id/availability
```

### Required behavior
- `200 OK` for valid data.
- `404 Not Found` for unknown station.
- Consistent JSON response shape.
- Query parameters may support search/filter/sort.

## 3.2 Bookings

```http
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

### Required behavior
- `200 OK` for successful reads/updates/deletes.
- `201 Created` for successful booking creation.
- `400 Bad Request` for invalid input.
- `404 Not Found` for unknown station/charger/booking.
- `409 Conflict` for overlapping bookings.
- `500 Internal Server Error` only for unexpected failures.

---

# 4. BOOKING BUSINESS LOGIC

The backend is the final authority on availability.

## 4.1 Booking sequence

```text
POST /api/bookings
  ↓
Validate body
  ↓
Validate station
  ↓
Validate charger
  ↓
Validate date/time
  ↓
Verify operating state if modeled
  ↓
Check overlapping bookings
  ↓
If conflict → 409 Conflict
  ↓
Otherwise create booking
  ↓
Return 201 Created
```

## 4.2 Overlap rule

For an existing booking and a new booking on the same charger/date:

```js
newStart < existingEnd && newEnd > existingStart
```

If true, the periods overlap and the new booking must be rejected.

### Example

Primary user:

`18:30 → 19:15`

Secondary user:

`18:45 → 19:30`

Result:

`409 Conflict`

The secondary user's UI must show a clear message such as:

> This charging slot is already booked. Choose another time or charger.

## 4.3 Availability rule

A charger is not globally “booked forever.” Availability is based on:

**charger + date + requested time interval**

Example:

```text
18:30–19:15  → BOOKED
19:15 onward  → AVAILABLE
```

---

# 5. DESIGN SYSTEM

## 5.1 Locked text colors

```css
:root {
  --color-black: #000000;
  --color-pale-green: #a1fea0;
  --color-white: #ffffff;
}
```

Use these three colors as the core text/foreground system unless there is an approved accessibility exception.

## 5.2 Typography

### Main heading
**Integral CF Italic**

Use for:
- hero headline;
- large display headlines;
- primary page-level display titles where appropriate.

### Subheading / section heading
**Monumented Semi Bold**

Use for:
- section headings;
- card titles;
- labels that need stronger hierarchy;
- navigation headings where suitable.

### Body
**Inter**

Use for:
- paragraphs;
- descriptions;
- buttons unless the component specifically uses the subheading role;
- form labels;
- helper/error text;
- metadata.

Do not silently replace the approved typography with system fonts if the project already contains the correct fonts/assets.

## 5.3 Visual language

The Eclipse interface should feel:
- premium;
- cinematic;
- dark;
- high contrast;
- neon mint-accented;
- futuristic but restrained;
- inspired by the existing 90s-anime/cel-shaded background aesthetic.

Avoid:
- generic SaaS dashboards;
- random purple/blue gradients;
- unrelated glassmorphism;
- excessive neon colors;
- generic component-library aesthetics;
- excessive shadows;
- unnecessary animations.

## 5.4 Component language

Create a reusable visual system in the existing CSS/JS architecture for:
- primary/secondary buttons;
- search field;
- filter controls;
- station cards;
- booking cards;
- status pills;
- availability indicators;
- panel/container surfaces;
- input/select/date controls;
- confirmation blocks;
- modal/confirmation UI if needed;
- map container;
- skeleton/loading states;
- error/empty states.

Components must look native to Eclipse. Do not install a component library solely to obtain generic UI pieces.

---

# 6. EXACT PAGE INVENTORY

Only these six core HTML pages are required:

```text
index.html
stations.html
station-details.html
booking.html
booking-details.html
bookings.html
```

Do not create separate pages for search, filters, availability, confirmation modals, or cancellations.

---

# 7. PAGE-BY-PAGE LAYOUT + COMPONENT SPECIFICATION

## 7.1 `index.html` — LOCKED LANDING PAGE

Already completed.

Allowed work only:
- connect Search button;
- connect primary CTA if necessary;
- add the minimum JS required for navigation.

Do not redesign, restructure, replace assets, or alter the approved visual appearance.

---

## 7.2 `stations.html` — STATION FINDER / SEARCH RESULTS

This is the **next page to complete after the landing page**.

### Layout

```text
[Fixed Eclipse background]

[Navbar]

[Search Header]
  Search input
  Search button

[Filter / Sort Row]
  Location/search refinement
  Charger type
  Availability
  Sort

[Results Header]
  Result count
  Active filter chips if needed

[Main Content]
  LEFT / PRIMARY: Station result cards
  RIGHT / SECONDARY: Map panel

[Responsive mobile]
  Results first
  Map below or collapsible
```

### Components

#### Search bar
- Reuse the same Eclipse input language as the rest of the site.
- Preserve the search term from the landing page through the URL.
- Search button must trigger the search process.

#### Required Wi-Fi-style loader
When the user clicks the landing-page Search button:
1. Show a Wi-Fi-style spinner/loader.
2. Keep the existing Eclipse background.
3. Loader duration: **3–4 seconds**.
4. Do not make the loader an arbitrary instant API-dependent delay.
5. After the loader finishes, navigate/show results.
6. If an API/data error occurs, show the error state after the loader.

The loader should feel native to the design, not like a generic Bootstrap spinner.

#### Filters
Suggested controls:
- charger type;
- connector type if available;
- availability;
- city/location;
- sort by distance/name/price where supported by data.

Only render filters that are backed by actual data/application logic.

#### Results cards
Each card should prioritize:
1. station name;
2. location/address;
3. charger type;
4. power;
5. availability;
6. price if supported;
7. operational status;
8. CTA: `View Station`.

Cards should use a premium dark surface derived from the existing palette while preserving the fixed background.

#### Map section
Place the map on the **right side of the desktop results layout** as a secondary navigation aid.

Map behavior:
- station markers use the actual `latitude` and `longitude` from the dataset;
- clicking a marker selects/highlights the corresponding station card;
- clicking `Open in Google Maps` opens Google Maps centered on that station;
- the selected station's pin must be the target location;
- use the exact station coordinates, not a guessed center.

If Google Maps requires an API key and it is not configured, **ask the user for the key at that moment**.

### States

#### Loading
- initial API fetch state;
- use restrained skeletons or the approved spinner language.

#### Empty
Example:
> No charging stations found for this search.

Include a clear action to clear filters/search.

#### Error
Example:
> We couldn't load charging stations. Try again.

Include retry.

---

## 7.3 `station-details.html` — STATION DETAILS

### Layout

```text
[Fixed Eclipse background]
[Navbar]

[Station Identity Block]
  Station name
  City/address
  Open/closed/availability status

[Availability Summary]
  Available chargers
  Total chargers
  Quick charger metrics

[Main Two-Column Content]
  LEFT:
    Station information
    Charger details
    Pricing
    Operating hours
    Amenities/contact when supported

  RIGHT:
    Google Maps panel
    Open in Google Maps action

[Bottom / Sticky CTA]
  Book a charging slot
```

### Map behavior
- The selected station must be pinned.
- The map must center on the station's coordinates.
- `Open in Google Maps` must open the selected location in Google Maps in a new tab.
- Do not create a generic map with no connection to the selected station.
- Ask for the Google Maps API key only when this integration is reached and the key is missing.

---

## 7.4 `booking.html` — BOOKING FORM

### Layout

```text
[Navbar]

[Page Heading]

[Two-column booking area]

LEFT:
  Selected station
  Charger selection
  Date
  Start time
  Duration/end time
  Vehicle model
  Vehicle number

RIGHT:
  Booking summary
  Selected station
  Charger
  Date/time
  Estimated cost if supported
  Availability status
  Confirm Booking button
```

### Validation
- required fields;
- valid station;
- valid charger;
- valid date;
- non-past booking date/time;
- valid duration/end time;
- vehicle details;
- overlapping-slot response from backend.

Inline messages should use Inter and remain clear against the fixed background.

### Conflict UX
If the backend returns `409`:
- do not clear the form;
- retain user input;
- show “Already booked” state;
- suggest another slot or charger;
- provide a clear retry path.

---

## 7.5 `booking-details.html` — CONFIRMATION / SINGLE BOOKING

### Layout

```text
[Navbar]

[Status / Confirmation Hero]
  Booking Confirmed
  Booking ID

[Booking Summary Card]
  Station
  Charger
  Date
  Start/end time
  Vehicle
  Status

[Actions]
  Update booking
  Cancel booking
  Back to My Bookings
```

No fake payment receipt or unnecessary transactional UI.

---

## 7.6 `bookings.html` — MY BOOKINGS

### Layout

```text
[Navbar]
[Page title]

[Tabs / filters]
  Upcoming
  Active
  Completed
  Cancelled

[Booking cards]

[Empty state]
```

Each booking card should show:
- station;
- date/time;
- charger;
- vehicle;
- status;
- View Details;
- Cancel where applicable.

---

# 8. GOOGLE MAPS RULES

Google Maps is allowed and already conceptually approved for the project.

### Credentials rule
- Never invent a key.
- Never hardcode a key into source files.
- Prefer environment configuration.
- If map work starts and no key is configured, **ask the user for the Google Maps API key**.
- Do not repeatedly ask if a valid key is already configured.

### Location rule
Use dataset coordinates:

```text
latitude
longitude
```

### Map rule
Map is meaningful only when it represents the actual selected/listed charging-station location.

### Open Google Maps action
Use the selected coordinates/address to open the corresponding Google Maps location in a new tab.

---

# 9. DATA RETRIEVAL + BOOKING DATA FLOW

## 9.1 Station data

```text
Kaggle dataset
  ↓
/home/aresenic/Eclipse/data
  ↓
Inspect + normalize
  ↓
Backend-readable station data
  ↓
Express GET /api/stations
  ↓
Frontend fetch()
  ↓
Dynamic station cards/map/details
```

The frontend should not bypass Express by reading the raw dataset directly once the API is available.

## 9.2 Booking data

Bookings are created by the application:

```text
Booking form
  ↓
POST /api/bookings
  ↓
Validation
  ↓
Conflict check
  ↓
In-memory bookings[]
  ↓
JSON response
  ↓
Booking Details / My Bookings
```

Bookings are temporary and reset when the server restarts. This limitation must be documented in the README.

---

# 10. POSTMAN TEST PLAN

Postman is already installed and must be used.

Create a collection:

**Eclipse EV Charging API**

### Stations
- GET All Stations
- GET Station by ID
- GET Station Availability

### Bookings
- POST Create Booking
- GET All Bookings
- GET Booking by ID
- PUT Update Booking
- DELETE Cancel Booking

### Validation / edge cases
- invalid station;
- invalid charger;
- missing required field;
- past date/time;
- overlapping booking;
- unknown booking ID.

### Evidence requirement
Capture evidence of:
- successful GET;
- successful POST;
- `409 Conflict` for duplicate/overlapping booking;
- successful PUT;
- successful DELETE;
- one validation error.

---

# 11. DEVELOPMENT PHASES

## Phase 0 — Inventory
- inspect existing files;
- inspect dataset path;
- inspect current fonts/assets;
- verify current landing page;
- inspect Graphify.

### Graphify update
Create a baseline node:

```text
BASELINE / LOCKED
- Landing page: COMPLETE + LOCKED
- Dataset location: FOUND
- Postman: AVAILABLE
- Google Maps: CONFIG STATUS
- Backend: STATUS
- Next task: dataset normalization
```

---

## Phase 1 — Dataset normalization

Previous model/task must report:
- actual dataset files found;
- actual columns discovered;
- selected fields;
- normalization/transformation logic;
- any assumptions.

Current model must do only the remaining normalization work and preserve the raw files.

### Completion requirement
Update Graphify with:
- files created/changed;
- station schema;
- row count before/after cleaning;
- assumptions;
- test result;
- next task.

---

## Phase 2 — Station APIs

Implement and test:
- `GET /api/stations`
- `GET /api/stations/:id`
- `GET /api/stations/:id/availability`

Update Graphify **after each endpoint passes Postman**.

---

## Phase 3 — Station Finder

Implement in order:
1. fetch stations;
2. dynamic cards;
3. search;
4. filters;
5. sort;
6. loading state;
7. empty state;
8. error state;
9. map panel.

### Graphify
After each item, record complete status and evidence.

---

## Phase 4 — Station Details

Implement:
1. URL ID handling;
2. GET station details;
3. render details;
4. availability;
5. map;
6. Open in Google Maps.

Update Graphify after each sub-function.

---

## Phase 5 — Booking backend

Implement in order:
1. POST create booking;
2. GET all bookings;
3. GET booking by ID;
4. PUT update booking;
5. DELETE cancel booking;
6. validation;
7. overlap detection;
8. 409 response;
9. availability state update.

### Critical Graphify entry

After conflict detection is tested:

```text
BOOKING CONFLICT — COMPLETE
Primary booking created: yes
Secondary overlapping booking: rejected
HTTP status: 409
Postman evidence: attached/recorded
Frontend error state: pending/complete
```

---

## Phase 6 — Booking frontend

Implement:
1. booking form;
2. validation;
3. POST integration;
4. confirmation page;
5. My Bookings;
6. booking details;
7. update;
8. cancel;
9. conflict UI.

Update Graphify after every completed function.

---

## Phase 7 — End-to-end integration

Test:

```text
Landing
 → Search
 → Loader
 → Results
 → Details
 → Map
 → Booking
 → Confirmation
 → My Bookings
 → Update
 → Cancel
```

Also test:

```text
User A books charger/time
 → User B attempts same charger/time
 → backend returns 409
 → UI explains conflict
```

Update Graphify with the full integration result.

---

## Phase 8 — Polish

Only after all core functionality is stable:
- responsive design;
- keyboard/focus states;
- loading states;
- error states;
- empty states;
- spacing consistency;
- typography consistency;
- component consistency.

Do not redesign the locked landing page.

---

# 12. GRAPHIFY AS SOURCE OF TRUTH

Graphify is not optional documentation. It is the **live execution state** of the project.

## 12.1 Required update after every completed function/section

Every completion node must include:

```text
Feature / Section:
Status:
Model:
Files changed:
API endpoints affected:
Data structures affected:
Tests performed:
Expected result:
Actual result:
Known issues:
Next task:
Model switch recommendation:
```

## 12.2 Previous model → current model handoff

At the end of every model session or major task, the current model must update a Graphify handoff node containing:

```text
PREVIOUS MODEL HANDOFF

Completed by:
Model:
Completed tasks:
Files touched:
Files locked:
Tests passed:
Tests pending:
Known issues:
Current Graphify node:
Next exact task:
Do not touch:
Suggested next model:
Reason for switch:
```

The next model must read **only the relevant Graphify handoff + current task files first**, rather than rereading the entire repository blindly.

## 12.3 Graphify anti-hallucination rule

Before starting a task:
1. Read the current Graphify state.
2. Identify the exact next incomplete node.
3. Inspect only the files relevant to that node.
4. Verify that the prior model actually completed the claimed work.
5. Continue from the verified state.
6. Do not assume undocumented work was completed.

If Graphify says COMPLETE but the code/tests disagree, mark it `NEEDS REVIEW`, investigate, then correct Graphify.

---

# 13. MODEL ORCHESTRATION / SWITCH PROTOCOL

## 13.1 Default model

**Claude Sonnet** is the default continuous development model.

Use it for most work:
- frontend implementation;
- backend implementation;
- API integration;
- booking logic;
- validation;
- debugging;
- documentation;
- tests.

Do not switch models simply for variety.

## 13.2 Claude Opus escalation

Use **Opus only for genuinely difficult reasoning**, such as:
- major architecture conflict;
- difficult booking/business-logic bug;
- cross-feature integration issue that Sonnet cannot resolve;
- complex recovery after a broken state.

### Mandatory notification
When the current model finishes a task that reaches a natural **Opus-worthy escalation point**, it must update Graphify and tell the user:

```text
MODEL SWITCH RECOMMENDATION
Current model: Sonnet
Recommended next model: Opus
Reason: [specific difficult issue]
Safe switch point: [exact completed node]
Files already verified: [list]
Next model should inspect: [list]
Do not touch: [locked files]
```

The current model must **not silently switch itself** if the environment requires user selection.

## 13.3 Gemini Pro visual review

Use Gemini Pro only when the implementation reaches a visual-QA milestone, for example:
- Station Finder visual review;
- Station Details visual review;
- Booking page visual review;
- responsive layout QA.

### Mandatory notification

```text
MODEL SWITCH RECOMMENDATION
Current model: Sonnet
Recommended next model: Gemini Pro
Reason: visual QA/refinement
Safe switch point: [page/section completed]
Locked visual scope: landing page remains untouched
```

## 13.4 Gemini Flash / GPT-OSS

Use only for quick isolated tasks:
- small CSS fix;
- typo;
- simple JS bug;
- small Express route correction;
- simple API response formatting.

Do not hand off a large architectural task to these models.

## 13.5 No mid-generation switching

Do not switch models while a coherent implementation operation is actively writing unless the operation is broken or must be cancelled.

Prefer:

```text
Finish current task
 → Test
 → Graphify update
 → Handoff
 → Switch model
 → New model reads Graphify
 → Continue exact next task
```

---

# 14. CONTEXT-EFFICIENT MODEL SWITCH HANDOFF

A new model must NOT automatically reread the entire project if Graphify already contains a verified handoff.

Use this handoff structure:

```text
ECLIPSE MODEL HANDOFF

Project state:
[one-paragraph summary]

Completed in previous model session:
- [task]
- [task]
- [task]

Locked:
- index.html
- approved landing CSS/assets
- completed pages listed in Graphify

Current task:
[one exact task]

Relevant files only:
- [file]
- [file]

Relevant endpoints only:
- [endpoint]

Known issues:
- [issue]

Tests already passed:
- [test]

Next expected result:
[one measurable result]

Graphify node to update:
[node]
```

The next model should inspect these specific files first. Only widen context if verification shows a dependency outside the listed scope.

---

# 15. MODEL NOTIFICATION CHECKPOINTS

The user should be notified when:

### Checkpoint A — Architecture ready
Recommended: **Sonnet continues** unless a major unresolved architecture problem exists.

### Checkpoint B — Station API suite complete
Recommended: **Sonnet continues**.

### Checkpoint C — Station Finder + Details complete
Recommended: **Gemini Pro** for visual QA, then return to **Sonnet**.

### Checkpoint D — Booking conflict system complete
Recommended: **Sonnet continues** unless a difficult logic bug remains; if so, recommend **Opus**.

### Checkpoint E — Full end-to-end workflow complete
Recommended: **Gemini Pro** for visual QA if desired, then Sonnet for fixes.

### Checkpoint F — Final submission ready
No model switch required unless a specific unresolved issue remains.

At each checkpoint the model must update Graphify first, then notify the user.

---

# 16. DEFINITION OF DONE

A feature is DONE only when:
- code exists;
- UI works;
- backend works where relevant;
- validation exists;
- error state exists where relevant;
- tests pass;
- Postman evidence exists for relevant APIs;
- Graphify is updated;
- no unrelated locked UI has changed.

The project is DONE when:
- all six pages work;
- landing page remains visually unchanged;
- station data comes through Express;
- search/filter work;
- station details work;
- Google Maps works when configured;
- booking creation works;
- overlap conflicts return 409;
- update works;
- cancel works;
- My Bookings works;
- Postman evidence is prepared;
- README is complete;
- Graphify shows all core nodes COMPLETE.

---

# 17. README / SUBMISSION REQUIREMENTS

README must contain:
- problem statement;
- feature list;
- stack;
- project structure;
- dataset source/path and normalization notes;
- setup instructions;
- run commands;
- API endpoint table;
- validation/error behavior;
- booking conflict behavior;
- Google Maps configuration instructions if used;
- Postman testing evidence;
- known limitation: in-memory bookings reset on server restart;
- future enhancements clearly separated from current scope.

---

# 18. FINAL ANTIGRAVITY EXECUTION PROMPT

Use this section as the operational instruction for the coding agent:

> Read this entire Eclipse Master Specification before changing anything. Then inspect the repository, `/home/aresenic/Eclipse/data`, and the current Graphify state. Treat all existing completed work — especially `index.html` and the landing-page UI/assets — as LOCKED. Do not redesign or rewrite completed UI. Use vanilla HTML/CSS/JavaScript on the frontend and Node.js + Express on the backend. Use the Kaggle dataset only as station-source data. Keep bookings in memory for this assessment. Implement real REST APIs with GET, POST, PUT, DELETE, validation, HTTP status codes, errors, and backend booking-overlap detection. Use Postman to test APIs. Use Google Maps only when a required map section is implemented; if a key is not configured at that point, ask the user for the key rather than inventing one. Use Integral CF Italic for main headings, Monumented Semi Bold for subheadings, and Inter for normal text. Use only `#000000`, `#A1FEA0`, and `#FFFFFF` as the core text colors. The existing fixed background must remain intact.
>
> Work in small verified stages. After each function/section is completed, run the relevant test, update Graphify with the completed node and evidence, and only then move to the next task. Graphify must include the previous model's completed work and an exact handoff to the current model. If a model switch would be useful, notify the user at the safe switch point with the recommended model and exact next task. Never silently switch. Do not switch during active generation unless the current operation must be stopped. Before starting a new task after a model switch, read the current Graphify handoff first and inspect only the relevant files before widening context.

---

# 19. IMMEDIATE NEXT ACTION

Because the landing page is already completed and locked, the next implementation sequence is:

```text
1. Inspect `/home/aresenic/Eclipse/data`
2. Inspect current Graphify state
3. Inspect existing station-related HTML files/backgrounds
4. Normalize the actual dataset
5. Update Graphify
6. Implement station GET API
7. Test it in Postman
8. Update Graphify
9. Build `stations.html` without touching the locked landing UI
10. Add the 3–4 second Wi-Fi-style search transition from the existing landing Search button
11. Update Graphify
```

Do not skip the Graphify update between these stages.
