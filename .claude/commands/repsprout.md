---
description: Load a full design + functionality briefing on RepSprout (data model, Exercise Plant progression engine, Garden pages, Active Workout flow, Night/Morning Garden theme system, testing approach)
---

You are working in RepSprout, a single-file Firebase PWA fitness-tracking app. Before doing anything else, internalize the reference below — it reflects the actual current code, not the stale README. Then proceed with whatever the user asks.

# RepSprout — Design & Functionality Reference

## 1. Stack & Architecture

**Single-file vanilla PWA.** Everything — HTML, CSS, and JS — lives in one file: `index.html` (~13,700 lines). No build step, no framework, no bundler. This is the *only* real source file in the repo; a `catalog/` directory and `README.md` exist but are stale/unrelated (the README describes a Next.js/Supabase stack that was never actually built).

**Script structure (top to bottom):**
1. `<script src="https://cdn.tailwindcss.com">` — Tailwind's runtime JIT compiler, generating utility classes on the fly.
2. Inline `tailwind.config` (line 15): `darkMode:'class'`, custom fonts (`Inter` body / `Plus Jakarta Sans` display), and two custom color scales — `brand` (green, 50–950) and `lavender` (violet, 50–950). These are the app's only two accent colors; everything else reuses Tailwind's stock `slate` grayscale.
3. A large `<style>` block: CSS custom properties for motion tokens, keyframes, and (as of the most recent work) the entire light-theme color-override system (see §8).
4. A synchronous `<script>` with `firebaseConfig` (project `repsprout`, RTDB region `asia-southeast1`).
5. The main `<script type="module">` — imports Firebase v10.12.0 modular SDK (`firebase-app.js`, `firebase-auth.js`, `firebase-database.js`) directly from `gstatic.com`, no npm/bundler.

**Firebase usage pattern.** Firebase Realtime Database (not Firestore). Auth is Google Sign-In only (`GoogleAuthProvider` + `signInWithPopup`). Every read is a live `onValue()` listener registered inside `subscribeData()`; every write is `set()`/`push()`/`remove()` called directly from UI event handlers, usually paired with an **optimistic local mirror** (mutate the in-memory object immediately, write to Firebase, let the `onValue` listener confirm/reconcile shortly after — this pattern recurs everywhere: `gardenCollection[recordId] = record` before `await set(...)`, `targets[targetId] = target`, etc.).

**Global state** (module-scope `let`/`const`, declared ~line 3092):
```js
let me, userProfile = {}, exercises = {}, sessions = {}, groups = {},
    calendarEntries = {}, customActivities = {}, gardenCollection = {},
    exercisePlantGenerations = {}, targets = {}, targetLogs = {};
let activeSession = null;   // in-memory only until Finish+Save
let groupModalId = null, groupModalDraft = null;
```

**Boot sequence:** `onAuthStateChanged` → if no `prof.plant` yet, show onboarding quiz; otherwise `bootApp(prof)` → `applyTheme()`, `subscribeData()` (registers all `onValue` listeners), `goView('dashboard')`, `checkResumableSession()` (restores an in-progress workout from `localStorage` if the tab was closed mid-session).

## 2. Data Model (Firebase RTDB)

All data is namespaced by `uid()` (the signed-in user's UID). Two top-level collections sit *outside* `users/{uid}` for historical/security-rule reasons; everything else is nested under `users/{uid}`.

| Path | Shape | Notes |
|---|---|---|
| `exercises/{uid}/{exerciseId}` | `{name, muscleGroup, equipment, currentWeight, unit, defaultSets, minReps, maxReps, restSeconds, machineSetup, notes, progressionEnabled, targetReps[], weightUpFlag, archived, weightIncrement}` | The exercise library. `minReps`/`maxReps` are nullable — "no target configured" is a real, valid state. |
| `sessions/{uid}/{date}/{sessionId}` | `{groupId, groupName, groupColor, sessionType, muscleGroup, startedAt, completedAt, durationSeconds, duration, caloriesBurned, notes, totalVolume, volumeUnit, date, exercises:[{exerciseId, name, muscleGroup, weight, unit, minReps, maxReps, weightIncrement, progressionEnabled, targetReps, skipped, notes, sets:[{weight, reps, rir, completed, warmup, completedAt}]}]}` | One logged workout. `date` is `YYYY-MM-DD`; a day can have multiple sessions (push-keyed). Fully self-contained snapshot — rep targets etc. are copied in at save time so future recalculation never depends on the exercise library's *current* state. |
| `users/{uid}/groups/{groupId}` | `{name, description, color, exercises:[{exerciseId, defaultSets, minReps, maxReps, notes, restSeconds?}], archived, createdAt, updatedAt}` | A saved Workout Group (routine). `color` is one of the fixed `GROUP_COLORS` hexes. |
| `users/{uid}/targets/{targetId}` | `{id, exerciseId, name, targetType, targetAmount, unit, frequency, startDate, status, createdAt, updatedAt}` | Optional habit-tracking layer, deliberately decoupled from Double Progression (`exerciseId` is informational only). `targetType` ∈ reps/duration/distance/sessions; `frequency` ∈ daily/weekly. |
| `users/{uid}/targetLogs/{logId}` | `{id, targetId, amount, occurredAt, createdAt, updatedAt}` | One log entry against a target. |
| `users/{uid}/gardenCollection/{recordId}` | `{id, exerciseId, exerciseName, speciesName, speciesEmoji, generation, bloomedAt}` | The **permanent bloom archive** — one record per fully-completed Exercise Plant lifecycle, forever. Only ever written by `syncExercisePlantsAfterChange()`. |
| `users/{uid}/exercisePlantGenerations/{exerciseId}` | integer | How many generations of *this* exercise's plant have already been archived. The exercise's currently-active (unarchived) plant generation always equals this stored count. |
| `users/{uid}/calendarEntries` | planned/completed calendar plan entries | Drives the Calendar tab's day sheets. |
| `users/{uid}/activities/{activityId}` | custom "other activity" definitions | Merged with `BUILTIN_ACTIVITIES` at read time via `allActivities()`. |
| `users/{uid}/progressionEvents` | keyed by deterministic event id | Double Progression's structured audit trail — regenerated wholesale from `sessions` on every sync, never read back into the growth calculation itself. |
| `users/{uid}` (root fields) | `plant, theme, restTimerMode, restSeconds, targetsInviteDismissed, info:{name,email,photoURL}` | `plant` is the Companion species (set once via onboarding, rarely changed). `theme` is `'light'`/`'dark'`. |

## 3. Exercise Plant / Double Progression — the core gamification mechanic

**This is the only progression system in the app.** Every Double-Progression-configured exercise owns one perpetually-cycling plant: `Seed → Sprout → Young Plant → Growing → Budding → Bloom`, forever. There is no terminal "mastered" state — the moment a plant blooms it's archived permanently and the *same* exercise immediately starts a fresh Seed.

**Constants:**
```js
const DP_STAGE_EMOJI = ['🫘','🌱','🌿','🪴','🌷'];                    // Seed, Sprout, Young Plant, Growing, Budding
const EXERCISE_PLANT_STAGE_NAMES = ['Seed','Sprout','Young Plant','Growing','Budding'];
const EXERCISE_PLANT_CYCLE_LENGTH = 5;   // stages per lifecycle, before Bloom
const EXERCISE_PLANT_SPECIES = [ {name:'Rose',emoji:'🌹'}, {name:'Hibiscus',emoji:'🌺'}, ...17 species total ];
```
Species stay **hidden until Bloom** — the plant's visual is always the generic `DP_STAGE_EMOJI` for its current stage; the actual species only reveals once archived into `gardenCollection`. Species assignment is deterministic per exercise+generation via a seeded shuffle (`exercisePlantSpeciesForGeneration()`), not random each render.

**`calculateExerciseDoubleProgression(exerciseId, pendingSession?)`** (the core function, ~line 3746) — pure, reads `sessions`/`exercises` only, never writes:
- Builds a chronological `timeline` of every real (non-planned) session touching that exercise, optionally with one `pendingSession` appended (used to preview an in-progress, not-yet-saved workout).
- Tracks one **position** per working set (`workingSetCount = defaultSets`), each with its own `baselineWeight`. Set positions are stable by array index among *working* (non-warmup) sets only.
- A leaf **matures** when a set is validly completed at a weight genuinely higher than that position's current cycle baseline (`weight > pos.baselineWeight`) — reaching the rep target isn't enough by itself; the actual weight increase is what matures a leaf. The *first* sighting of a position only establishes its baseline (can't be "greater than itself"), so reaching `cycleIndex = N` takes `N+1` weight-increasing sessions, not `N`.
- When **every** position has matured (`positions.every(p => p.matured)`), the cycle completes: `cycleIndex++`, all baselines reset to current weight, all positions un-mature.
- Returns `{ configured, minReps, maxReps, workingSetCount, cycleIndex, positions, leavesMatured, cycleComplete, events }`.

**Stage math** (derived from `cycleIndex`):
```js
exercisePlantGeneration(dpResult) = Math.floor(dpResult.cycleIndex / 5)   // completed lifecycles = blooms
exercisePlantStageIdx(dpResult)   = dpResult.cycleIndex % 5               // 0..4 = current stage
```

**`syncExercisePlantsAfterChange()`** (~line 3290) — the single choke point every session/target mutation funnels through. For each configured, non-archived exercise: computes `completedGenerations` via the math above, compares against `exercisePlantGenerations[exerciseId]` (the already-archived count), and for every newly-completed generation writes a new `gardenCollection` record (revealing its species) and bumps the stored generation count. Idempotent by construction — recalculating twice never double-archives. Also triggers `syncDoubleProgressionEvents()` to regenerate the audit trail. Called after every workout save, target edit, and once per page load via `ensureExercisePlantsSynced()` (a one-time catch-up sweep, so an exercise with pre-existing deep history backfills correctly with no migration script).

**DP status enum** (`DP_STATUS`): `building_reps | ready_to_increase | increased_weight | below_range | incomplete | skipped`. RIR (reps-in-reserve) eligibility is centralized in `evaluateRirEligibility()` — an RIR of exactly 0 holds a set for a repeat rep-target attempt; missing RIR never blocks progression (reps-only fallback).

**Leaves** (`renderDoubleProgressionLeaves()`) are the micro-progress overlay *inside* a stage — one leaf (Material Symbols `eco` glyph) per working set, colored green (matured) / amber (ready) / gray (still growing). This is a display-only layer; it never renames or replaces the stage system.

## 4. The Companion — a separate, non-progressing identity

Distinct system from Exercise Plants — a single named character picked once via a 3-question onboarding quiz (`scoreAnswer()`/`assignPlant()` — points toward whichever of 5 species scores highest).

```js
const PLANTS = { cactus, oak, bamboo, lavender, sunflower };  // each {emoji, name, desc}
const PLANT_THEME = { ...same 5 keys... };  // each {primary, soft, glow} — per-plant accent color for the Home hero
```

The Companion **never progresses or blooms** — it's purely a mascot with a mood, driven by training consistency:
- `computeStreak(sessionDates)` — shared by `getPlantHealth()` and the dashboard stat row; counts consecutive days ending today.
- `getPlantHealth(sessionDates)` → `{ health, streak }`. Health states: `seed` (never trained) → `sprout`/`growing`/`thriving`/`blooming` (streak-based, ≥7 days = blooming) → `wilting` (4-13 days since last session) → `dormant` (14+ days since last session).
- `HEALTH_LABELS` gives each state a headline + subtitle; `blooming`'s subtitle is generated dynamically by `bloomingStatusVariants(streak)` instead of a fixed string — tiered (7-13 / 14-29 / 30+ days) with 6 rotating, plant/garden-vocabulary messages per tier, each mentioning the real streak count, picked stably once per day via a seeded hash (not re-randomized per render).

## 5. Garden Page (`#profile-view`)

Three tabs — **Growing / Bloomed / Locked** — plus a muscle-group filter row (`GARDEN_FILTER_KEYS = ['', 'upper', 'lower', 'core', 'full']`) that filters all three.

- `gardenExercisePlants()` — every non-archived, DP-configured exercise, split into "everTrained" (shows in **Growing**) vs not (shows in **Locked**, tagged "Locked").
- `gardenArchivedPlants()` — soft-archived exercises with DP history, shown in **Locked** tagged "Archived" (history preserved, never deleted).
- **Bloomed** tab reads `gardenCollection` directly (the permanent archive), filtered by muscle group via each record's `exerciseId → exercises[id].muscleGroup`. `gardenBloomedCardHtml()` renders the revealed species emoji/name, source exercise, and bloom date (tapping opens that exercise's detail page).
- `setGardenTab(tab)` toggles the 3 panels; `renderGardenGrid()` is the shared re-render entry point that rebuilds all three grids together.
- A companion card at the top (art + name + `plant.desc`) is purely informational, not tappable.
- The Home page's own Garden preview (`renderGardenPreview()`) is a *separate*, smaller widget — up to 5 "Growing" plants (sorted by recency) and up to 5 "Bloomed" (randomly rotated once per day if the collection exceeds 5, via `dailyRandomSample()`), tap-to-reveal name tooltips, greyscaled placeholder lotus when no blooms exist yet.

## 6. Active Workout Flow

**`activeSession`** shape (in-memory only, persisted to `localStorage` as a draft for resumability, never Firebase until Finish+Save):
```js
{ groupId, groupName, groupColor, sessionType: 'group'|'quick', startedAt,
  exercises: [{ exerciseId, name, category, unit, weight, minReps, maxReps,
                weightIncrement, progressionEnabled, targetReps, entered, skipped, notes,
                sets: [{weight, reps, rir, completed, warmup, completedAt}],
                restSecondsOverride? }],
  currentExerciseIndex, phase, activeSetStartedAt, restEndsAt, restDurationMs, restPausedRemainingMs }
```

- **`buildSessionExercise(exerciseId, overrides)`** — the single source both a Workout Group start and an in-session "add exercise" build from, so grouped and Quick workouts never diverge. `overrides` (from a group's per-exercise config) can carry `minReps`/`maxReps`/`defaultSets`/`restSeconds`.
- **`startWorkoutSession(groupId)`** / **`startQuickWorkout(exerciseIds?)`** — both refuse to start if `activeSession` already exists ("Finish or exit your current workout before starting another").
- **Phase machine** (`activeSession.phase`, driven by `renderGuidedWorkout()`): `exercise` (not yet started) → `active-set` (mid-rep) → `resting` (between sets) → `exercise-complete` (all working sets done for this exercise) → repeats for next exercise → Finish.
- **Rest timer** — `resolveRestDuration({restTimerMode, exerciseRestSeconds, globalDefaultRestSeconds, sessionOverrideSeconds})` priority: session override always wins → else `exercise_specific` mode uses the exercise's own `restSeconds` → else global default. Absolute-timestamp based (`restEndsAt`) so it survives refresh/backgrounding, not a `setInterval` countdown.
- **Queue drawer** (`openQueueDrawer()`) — shows all exercises in the session with reorder/skip/jump actions; "Add to today's workout" flow lets the user add an exercise mid-session (via a placement sheet: "Start now" jumps to it immediately, "Add to end" queues it) without disrupting the exercise currently in progress.
- **`openFinishSummary()`** — validates at least one completed set exists, then shows duration/sets/progressions (animated count-up), plant progress (`computeSessionPlantProgress()` — a *preview* of DP leaf events this session would create, using the same `pendingSession` mechanism as the DP engine itself), and a volume highlight. Saving (`finish-save-btn`) writes the full session object to `sessions/{uid}/{date}`, optimistically mirrors it locally, then calls `syncExercisePlantsAfterChange()` to actually archive any newly-completed blooms.

## 7. Navigation & Modal Conventions

**Views** (`VIEWS = ['dashboard','workout','calendar','profile','settings']`, full-screen swaps managed by `goView(v)`): Home/Workout/Calendar/Garden are the 4 bottom-nav tabs; Settings is menu-only. `goView()` also resets scroll to top, locks page scroll for Calendar (a fixed non-scrolling screen), and cross-fades the outgoing/incoming view (`rs-view-leaving` → swap → `.rs-view`'s own entrance animation), skipped entirely under `prefers-reduced-motion`.

**Workout sub-tabs** (`switchWorkoutTab(tab)`, `activeWorkoutTab`): `hub` (4 short cards: Groups/Exercises/Targets/History — a fixed, non-scrolling landing menu, scroll-locked like Calendar) → `groups` | `exercises` | `targets` | `history` (each scrollable, re-renders itself on entry).

**Universal modal/sheet system** — every modal shares the shell `class="fixed inset-0 z-[N] ... bg-black/50 backdrop-blur-sm"` with one child dialog. A single CSS attribute-selector rule (`[class^="fixed inset-0 z-"][class*="bg-black/50"]`) gives *every* modal a consistent fade+rise entrance for free — no per-modal animation markup needed. `rsHideModal(id)` is the universal close: adds `.rs-modal-closing` (reverse animation), waits, then cuts `display:none`. Bottom-sheets specifically (Calendar's "Add activity", Add-to-Workout, Add-Exercise-Placement) additionally use `.cap-backdrop`/`.cap-sheet` — opacity + `translateY` toggled via a **double-`requestAnimationFrame`** pattern after setting `display:''`, which is the established, reliable way to trigger a CSS *transition* after a display change (more robust than relying on a `display:none→block`-triggered `animation`, which was found to sometimes fail to fire on iOS Safari after a long-running/backgrounded session — see the Finish Summary's `.finish-reveal` fix, which was rewritten from an animation-based reveal to this same transition+double-rAF technique for that reason).

## 8. Design System — "Night Garden" (dark) vs "Morning Garden" (light)

**Philosophy** (stated in a comment near the top of the file): *calm, smooth, deliberate — Apple Health / Calm / Headspace, never instant or mechanical.* Motion tokens are centralized as CSS custom properties so the whole app moves at one consistent pace:
```css
--rs-ease-standard: cubic-bezier(.4,0,.2,1);   /* backdrop/fade curve */
--rs-ease-settle:   cubic-bezier(0,0,.2,1);    /* sheet/movement curve */
--rs-dur-press:150ms; --rs-dur-quick:240ms; --rs-dur-standard:320ms;
--rs-dur-page:420ms; --rs-dur-sheet:300ms; --rs-dur-celebration:650ms;
```
All zeroed under `prefers-reduced-motion: reduce`. Source of truth for the base curves is Calendar's own "Add activity" sheet, deliberately never redefined itself so nothing can circularly depend on the tokens meant to match it.

**Dark mode ("Night Garden")** — the original, untouched design: near-black `slate-950` canvas, translucent slate "glass" cards (`rgba(30,41,59,.75)`), vivid stock Tailwind `brand` green (`#22c55e`) and `lavender` (`#8b5cf6`) popping hard against the dark backdrop.

**Light mode ("Morning Garden")** — built entirely as CSS overrides scoped behind `html:not(.dark)`, **without editing any HTML**, so dark mode's rendering of the exact same classes (including the many elements that reuse a bare `slate-N`/`brand-N` class with no `dark:` pair at all) is provably unaffected:
- **Warm-neutral scale** replacing cool `slate` — a hand-tuned custom palette (not stock Tailwind `stone`), softer at every step so headings never read as harsh black. Full text/bg/border/divide/ring coverage across shades 200–900, plus the opacity-suffixed variants Tailwind compiles as separate classes (`bg-slate-200/70` etc.) and the `!important`-prefixed ones (`!bg-slate-100`).
- **Cards drop their border entirely**, replaced by a soft three-layer warm-tinted shadow (`0 1px 2px`, `0 10px 24px -10px`, `0 24px 44px -28px`, all `rgba(61,56,47,...)`) — depth from elevation, not outlines. Applies uniformly to `.card`, `.wt-hub-card`, `.cap-card`, `.mission-surface`, `.garden-shelf`, `.mep-ex-card`.
- **Botanical green** (`#6f9450`) and **dusty lavender** (`#8a76ad`) replace vivid `brand-500`/`lavender-500` — full override of both Tailwind color scales *and* the handful of custom CSS classes that hardcode the old vivid hex directly (`.btn-green`, `.nav-active`/`.bnav-active`, focus rings, `#ls-mark-working[aria-pressed=true]`, the muscle-group "Full Body" badge), plus their `:hover` variants.
- Global `input`/`textarea`/`select` base styling, Tailwind's default `shadow-lg`/`shadow-2xl`, and native checkbox `accent-color` were all re-tinted warm in the same pass.
- **Deliberately left vivid/untouched**: `red-*` (delete/error buttons — urgency matters more than atmosphere), and the semantic multi-color palettes — `GROUP_COLORS` (Workout Group badges/calendar dots) and the Workout hub's per-card pink/blue/purple status tags were tried muted and then explicitly reverted per user preference ("stand out better" vivid) — these are functional color-coding, not ambient chrome.
- Home hero gradient: soft sage-green top fading through warm gold into ivory (`linear-gradient(180deg,#e9efdd 0%,#f7ecd8 45%,#f3eee2 100%)`), evoking literal morning light; its warm amber glow overlay boosted slightly for the same effect.

## 9. Testing Approach

No unit-test framework. Verification is done via a **headless Playwright + stubbed-Firebase harness**, built fresh per testing session: `firebase-app.js`/`firebase-auth.js`/`firebase-database.js` are served as local stub files (Playwright's `page.route()` intercepts the `gstatic.com` imports) implementing an in-memory, path-based store seeded via `page.add_init_script(window.__fbStore = {...})` — `getStore/ref/get/set/push/remove/onValue/off` all operate against that in-memory object, with `onValue` re-firing every listener on any write. This lets tests drive the real app UI (`page.click`, `page.fill`) against deterministic seed data without a network connection, and assert on rendered DOM/computed styles afterward. For theme-specific work, Playwright's `webkit` browser channel is used alongside `chromium` to catch WebKit-specific rendering differences (this is how an iOS-Safari-only bug in the Finish Summary reveal animation was reproduced and confirmed fixed). Screenshots (`page.screenshot(full_page=True)`) are the primary tool for visual/design verification passes.
