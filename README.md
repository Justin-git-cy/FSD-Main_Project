# ViewPoint — Bangalore Field Guide

**A Climate-Aware Web Exploration Platform for Off-Beat Trails and Heritage Sites in Bangalore**

ViewPoint is a full-stack web application built for adventure travelers in and around Bengaluru to discover, evaluate, and share hidden trekking trails, urban ruins, and historic sights. Unlike static navigation directories, ViewPoint combines an interactive **Leaflet.js** map over OpenStreetMap tiles with a **100-point dynamic climate-weighted scoring engine** backed by **MongoDB** and **Express.js**.

---

## Key Features

- **Interactive Field Atlas (Leaflet.js + OpenStreetMap):** Visualizes 21 off-beat Bangalore locations (19 verified sights + 2 pending community submissions) with color-coded markers for **Trails**, **Historic Sights**, and **Abandoned & Ruins**, paired with a searchable sidebar and live hazard badges.
- **Dynamic Climate-Weighted Scoring Engine:** Ranks destinations using a transparent 100-point composite score:
  ```text
  S = Proximity (30) + Difficulty (25) + Category (20) + SeasonFit (25) - HazardPenalty
  ```
  Powered by Haversine geodesic distance computation (`R = 6,371 km`), preferred difficulty matching (`easy` / `medium` / `hard`), category affinity, seasonal suitability, and automated monsoon/rain safety penalties.
- **Real-Time Weather Simulations & Hazard Warnings:** Configurable **Season** (`Winter`, `Summer`, `Monsoon`) and **Sky** (`Clear`, `Rain`, `Cloudy`, `Misty`) selectors in the Field Conditions bar immediately recalculate route rankings and surface terrain-specific hazard advisories (such as slippery steep granite monoliths during monsoon rain).
- **Community Coordinate Verification & Reviews:** Authenticated **Explorer** and **Pathfinder** sessions can pin unmapped coordinates via click-to-pin Leaflet.js mapping, configure seasonal fit sliders and weather warnings, verify pending discoveries, upvote sights in the **Trending Sights Registry**, and post 1–5 star field reviews.
- **Adaptive Usability Controls:** Configurable Bangalore **GPS presets** and custom map-click anchors with search radius visualization, plus persistent **Light & Dark display modes** in the navigation bar with dark-adapted Leaflet tiles.

---

## Tech Stack

- **Frontend:** React 19, React Router v6, Leaflet.js, OpenStreetMap tiles, Lucide React, GSAP, Lenis, CSS custom properties (Light/Dark tokens)
- **Backend:** Node.js, Express.js, Mongoose ODM
- **Database:** MongoDB (with offline LocalStorage fallback for deterministic testing)

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB connection URI configured in `backend/.env` (`MONGO_URI`)

### Install Dependencies

```bash
npm install
npm install --prefix backend
```

### Seed the Bangalore Atlas Database (Optional)

```bash
npm run seed --prefix backend
```

### Run Development Servers (Frontend + Backend)

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

### Run Verification Tests & Production Build

```bash
CI=true npm test -- --watchAll=false
npm run build
```

---

## Project Credits

Developed as a Full Stack Web Development project at the **School of Computer Science and Engineering (SoCSE), RV University, Bengaluru** (BCA, 2026–2027):

- **Akash Singh Bisht** (`1RUA24BCA0006`)
- **Justin** (`1RUA24BCA0041`)
- **Guided by:** Prof. Mohammed Danish, SoCSE, RV University
