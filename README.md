# 🌌 MOOKY — Cinematic Real‑Time Birthday Experience

A Netflix‑inspired, real‑time, interactive birthday web app. Built for the web and mobile (iOS/Android), it blends a cinematic dark + neon red theme with live wishes, presence, and a fullscreen surprise stage.

- ⚡ Instant, real‑time wish updates (multi‑device)
- 💌 Friendly composer with typing indicator and presence
- 🎬 Fullscreen “Surprise” stage with safe‑area aware controls
- 📱 Mobile‑first with portrait + landscape support (svh + safe areas)
- 🚀 Deployed on Vercel; serverless APIs + Edge-friendly DB

---

## ✨ Key Features

- Live wishes feed with Pusher + SSE fallback
- Optimistic wish submission and SWR reconciliation
- Presence channel ("X here now") and typing indicator
- Surprise page with overlay controls and proper fullscreen polish (safe‑area insets, 44×44 targets)
- Responsive layouts, fluid spacing, and landscape helpers (short‑height devices)

---

## 🧰 Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router, React 18) |
| Styling | TailwindCSS (dark + neon red) |
| Hosting | Vercel (Edge + Node serverless) |
| Database | Neon PostgreSQL |
| Realtime | Pusher Channels |
| Data fetching | SWR + native fetch |
| Animations | Framer Motion (optional) |

---

## 🔗 Live URLs

| Environment | URL |
|---|---|
| Production | https://your-mooky-domain.vercel.app |
| Surprise (external) | https://hbd-card.netlify.app |

> Replace the production URL with your deployed domain.

---

## 📸 Screenshots

Place screenshots in `public/screenshots/` and they will render nicely on GitHub:

- `public/screenshots/home.png`
- `public/screenshots/wishes.png`
- `public/screenshots/surprise.png`

Example embeds:

![Home](public/screenshots/home.png)
![Wishes](public/screenshots/wishes.png)
![Surprise](public/screenshots/surprise.png)

---

## ⚙️ Setup

### 1) Clone

```bash
git clone https://github.com/your-user/mooky.git
cd mooky
```

### 2) Install

```bash
npm install
```

### 3) Environment

Create `.env.local` at the project root with your secrets:

```bash
# Database (Neon Postgres)
DATABASE_URL=postgres://USER:PASSWORD@HOSTNAME/dbname?sslmode=require

# Pusher (server)
PUSHER_APP_ID=xxxxx
PUSHER_KEY=xxxxx
PUSHER_SECRET=xxxxx
PUSHER_CLUSTER=eu

# Pusher (client)
NEXT_PUBLIC_PUSHER_KEY=xxxxx
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# Surprise page (external demo; optional)
NEXT_PUBLIC_SURPRISE_URL=https://hbd-card.netlify.app/
```

Notes:
- Copy the actual Postgres connection string from Neon (not the `psql` helper command).
- Keep server keys only on the server; expose only `NEXT_PUBLIC_*` to the browser.

### 4) Dev

```bash
npm run dev
```

Open http://localhost:3000 and try the Wishes page on two devices to see live updates.

### 5) Build

```bash
npm run build && npm run start
```

---

## 🚀 Deploy (Vercel)

1. Push your repo to GitHub.
2. Import on https://vercel.com (Framework Preset: Next.js).
3. Add Environment Variables in Project → Settings → Environment Variables:
   - `DATABASE_URL`
   - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `NEXT_PUBLIC_SURPRISE_URL`
4. Trigger a deploy. Confirm the Wishes feed updates across devices.

---

## 📐 Mobile Perfection Checklist

- `min-h-[100svh]` for full‑height sections (no jump when URL bar shows/hides)
- Safe‑area insets via `env(safe-area-inset-*)` and `viewport-fit=cover`
- Stage wrappers use responsive aspect ratio with helpers for ultra‑narrow and short landscape devices
- Controls meet 44×44px tap targets and sit above the safe‑area
- Grids adapt at `sm/md/lg` with no horizontal page scroll

---

## 👩‍💻 Developer

- GitHub: https://github.com/your-user
- Hosting: Vercel
- DB: Neon PostgreSQL
- Realtime: Pusher Channels

---

## 📄 License

MIT © MOOKY

---

## 🌙 About MOOKY

MOOKY is a cinematic, interactive birthday experience crafted to feel alive. It takes cues from Netflix’s bold composition and pairs it with a soft neon‑red palette, building a space where messages spark, count up, and stream between friends in real‑time.

Under the hood, serverless APIs, a hosted Postgres, and realtime channels keep everything snappy and reliable. On the surface, it’s light and playful: a wishes wall that updates instantly, a fullscreen surprise that’s safe‑area polished on iOS/Android, and a layout that feels at home in portrait and landscape. 🎉💌

Whether you’re celebrating from your phone or a big screen, MOOKY keeps the moment immersive—simple to use, beautiful to share, and delightful to revisit. 🌙⚡

