# 🌱 RepSprout

> **Grow stronger, one rep at a time.**

RepSprout is a workout tracker built around **double progression**. Instead of only recording your workouts, RepSprout helps you understand **when you're actually ready to increase the weight** — one working set at a time, not just "the whole exercise."

Most fitness apps are digital notebooks.

RepSprout is a **growth companion**.

---

## ✨ Why RepSprout?

Many people ask:

- Should I increase the weight?
- Should I do more reps first?
- Am I progressing correctly?

RepSprout removes the guesswork by guiding users through a simple, proven progression system — and by growing a companion plant that represents your consistency, not just your numbers.

---

## 🌱 Core Philosophy

Small improvements compound.

Instead of chasing heavier weights every session, RepSprout encourages users to **earn** their progress through consistency.

One more rep.

One more workout.

One more step.

Eventually...

🌸 Bloom.

---

## 🚀 Features

### 📚 Custom Exercise Library

Create your own exercises with:

- Name, category, and equipment
- A configurable rep range (fully optional — Double Progression only runs once one is set)
- Default working sets
- Weight unit (kg/lb)
- A per-exercise rest timer, or fall back to your global default
- Machine/seat setup notes
- A toggle to turn Double Progression suggestions on or off per exercise

### 🏋️ Workout Groups

Create unlimited saved routines — Upper Body, Legs, Push, Pull, Hotel Gym, or anything else — and reuse exercises across as many groups as you like.

### ✨ Three ways to start a workout

Tapping **Start Growing** offers three equal choices, not a primary/secondary pair:

- **Workout Group** — follow one of your saved routines, exactly as before.
- **Build Today's Workout** — a premium two-step flow for a one-off session: an exercise picker (search, category filters, a "Recent" row, borderless selectable cards) followed by a review screen where you can drag-reorder, remove exercises, or create a brand-new exercise inline before starting. Finishing a workout built this way offers to save it as a reusable Workout Group.
- **Create Target** — jump straight to setting up a personal habit target (see Targets below).

Every path — saved group, one-off session, or a session started from the Calendar — runs through the exact same guided workout engine: warm-ups, working sets, rest timers, and session resume all behave identically no matter how the workout was started.

### 📈 Double Progression & Exercise Plants

Each Double-Progression-enabled exercise grows its **own** plant, entirely separate from your Home companion.

- Every working set progresses **independently** — Set 1 can be ready to increase while Set 2 is still building reps.
- The maximum rep target always comes from *your* configured rep range — never a hardcoded number.
- RIR (reps in reserve) informs readiness: hitting your max reps with too many reps left in the tank flags a set as ready to go heavier; a very low RIR suggests holding at the current weight instead.
- Each planned working set maps to exactly one leaf, with three real states — **Growing**, **Ready**, and **Matured** — never color alone; every state has a text label too.
- A leaf only matures when that set is actually performed at a higher weight than its stage-cycle baseline — reaching max reps alone just makes it *ready*.
- The exercise's plant evolves one stage only once **every** planned working set has matured, then establishes new baselines and resets the leaf cycle — your logged weights and history are never touched.
- Warm-up sets are logged and shown in history, but never count toward the working-set target, never receive a leaf, and never affect readiness or recommendations.
- A dedicated **Exercise Progress Detail** page (reachable from the Exercises tab, an active workout, History, or Home) shows the exercise's stage, leaf row, set-by-set status, a recommendation, and recent history.

### 🌸 Companion Plant & Garden

The large plant on Home is your **Companion Plant** — it represents overall care and consistency, never strength performance, and never reads Double Progression data.

- Grows from **Move** (any completed workout or activity), **Recover** (an intentional Recovery Day), and **Show Up** (participation) — repeating your favorite workout keeps it growing just as well as trying something new.
- One clean progress bar — "Plant Progress" — shows how close it is to its next stage.
- Marking a Recovery Day is capped at one contribution per calendar day, so toggling it repeatedly can't be used to farm growth.
- Once a Companion fully blooms, it's added permanently to your **Garden** and you're invited to choose your next companion — the bloomed one is never deleted or overwritten, and you can postpone the choice with no penalty.
- The Garden distinguishes your active Companion from every previously bloomed one.

### 🎯 Targets — optional daily & weekly habits

Track a personal goal that has nothing to do with a Workout Group — 30 push-ups a day, 3 km of walking a week, 3 dead-hang sessions a week.

- Pick from your own exercise library or a small curated activity list (Push-ups, Squats, Plank, Pull-ups, Dead Hang, Stretching, Walking).
- Four target types: **Reps, Duration, Distance, Sessions** — each with the right unit.
- Log progress throughout the day or week; every entry is stored individually so the total is always recalculated from what's actually logged (editing or deleting an entry updates completion automatically).
- Completing a target's current period contributes one Plant Progress reward — never more than once per day (daily targets) or once per week (weekly targets), and never for partial progress.
- Targets are completely optional: with none created, Home stays exactly as it always has, aside from a small dismissible invitation.
- Manage targets — edit, pause, resume, archive, or delete — from Workout → Targets.
- Targets never touch Double Progression or Exercise Plants, by design: a Target has its own amount and unit, never a live reference into an exercise's rep range or progression state.

### 📅 Workout Calendar

Plan ahead or log retroactively:

- Workout Groups, Quick Workouts, other activities, and Recovery Days
- Tap any date to see everything logged or planned for that day
- A completed plan links straight to the session it was fulfilled by

### 📊 History

Every completed session — group, Quick Workout, or Build Today's Workout — with warm-ups clearly distinguished from working sets, ready to review or edit.

### 💚 Recovery & Other Activities

Recovery is treated as real progress, not a workout you skipped:

- Mark a Recovery Day directly from Home or the Calendar
- Log any other activity (yoga, spin, a walk, anything you've added to your activity library)
- Recovery and other activities contribute Companion Plant growth but never touch Exercise Plants or Double Progression

### 🌿 Garden / Profile

- Daily nutrition goals (calories, protein, carbs, fat)
- Rest timer preferences — per-exercise or one global default
- Optional AI-assisted calorie extraction from a workout-tracker screenshot (bring your own OpenAI key — stored privately on your account)

### 📱 Installable, dark-mode PWA

RepSprout installs to your home screen like a native app, works fully offline-first once loaded, and supports both light and dark themes.

---

## 🛣️ Roadmap

### ✅ Shipped

- Double Progression with per-set leaves and per-exercise Exercise Plants
- Companion Plant, Plant Progress, and Garden bloom collection
- Optional daily/weekly Targets
- Workout Groups, Quick Workout, and the two-step Build Today's Workout flow
- Workout Calendar, History, and Recovery Day tracking
- Dark mode and installable PWA support

### Next up

- Target reminders / notifications
- Apple Health & Google Fit integration
- Smart rest-timer tuning based on your own history
- Additional progression strategies beyond Double Progression (e.g. general fitness tracking, timed/distance activities)

### Later

- Friends & shared workout programs
- Challenges
- AI-powered recommendations
- Apple Watch & Wear OS support

---

## 🛠️ Tech Stack

RepSprout is intentionally simple to run and deploy:

- **Frontend** — a single `index.html`: vanilla JavaScript (ES modules), no framework or build step, styled with Tailwind CSS via CDN
- **Backend** — Firebase Authentication (Google sign-in) and Firebase Realtime Database
- **Hosting** — static hosting (GitHub Pages); see `SETUP.md` for the Firebase project setup steps

No React, no Next.js, no Supabase, no server — everything lives in one file plus your Firebase project.

---

## 🤝 Contributing

Contributions, ideas and feature requests are welcome.

Feel free to open an issue or submit a pull request.

---

## 📜 License

MIT License

---

# 🌱 Brand Promise

**Grow stronger, one rep at a time.**
