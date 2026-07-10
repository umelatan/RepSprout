# Kumpul

> "Next week lah" never actually happens.

**Kumpul** is a lightweight group hangout planner. Mark your free days, see when everyone overlaps, and lock in a date — no group chat chaos required.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#features">Features</a></li>
    <li><a href="#how-it-works">How It Works</a></li>
    <li><a href="#development-plans">Development Plans</a></li>
    <li><a href="#tech">Tech</a></li>
  </ol>
</details>
---


## Features

- **Mark your availability** — tap days to set morning, afternoon, or evening free slots
- **Heat map** — see at a glance which days most people are free
- **Daily view** — drill into any day to see exactly who's free and when
- **Plan hangouts** — propose a date and time, notify the group, track RSVPs
- **Multi-group** — belong to multiple friend groups, each with their own calendar
- **Invite links** — share a link, admin approves who gets in
- **PWA** — installable on mobile, works offline

<p align="right">(<a href="#kumpul">back to top</a>)</p>
---

## How it works

1. Admin creates a group and shares the invite link
2. Friends sign in with Google and request to join
3. Admin approves requests from the Requests tab
4. Everyone marks their free days
5. Pick the day with the most overlap and plan the hangout

<p align="right">(<a href="#kumpul">back to top</a>)</p>
---

## Development Plans
- [x] PWA
- [x] Enable multi-group function
- [ ] Polling Feature (For location/activities)

<p align="right">(<a href="#kumpul">back to top</a>)</p>
---

## Tech

- Single-file HTML app — no build step, no framework
- Firebase Realtime Database (data + auth)
- Google Sign-In
- Tailwind CSS (CDN)
- PWA (manifest + service worker)

<p align="right">(<a href="#kumpul">back to top</a>)</p>
---

