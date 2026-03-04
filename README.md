# Iron Log

A self-hosted workout tracker with an industrial dark UI. Log sessions, track body weight, visualize progress — all data stays on your own server.

![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express-informational)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

## Features

### Workout Logger
- Start a named workout session (defaults to today's date)
- Add exercises from your **Exercise Library** via dropdown — no typos, no duplicates
- Three exercise types: **Reps**, **Timed Sets** (sets × seconds), **Duration** (minutes)
- Optional weight (kg / lbs toggle) and notes per exercise
- Remove individual exercises before finishing
- Finish or cancel the session at any time

### Exercise Library
- Manage a personal list of exercises (add / delete)
- Library is per-user — each account has its own list
- Exercises in the library appear in the workout dropdown

### Rest Timer
- Countdown timer with custom seconds input
- Quick presets: 30 s / 60 s / 90 s / 120 s
- Visual and audio cue when time is up

### Workout History
- All past sessions listed with date, duration, and exercises
- Expandable session cards
- Two-click delete per session

### Progress Chart
- Bar chart of total volume (sets × reps × weight) per exercise
- Filter by exercise name
- Built with Recharts

### Body Weight Tracker
- Log body weight entries with date
- Line chart of weight over time
- Two-click delete per entry

### Multi-User & Auth
- JWT-based login via HttpOnly cookie (7-day session)
- Each user sees only their own sessions, exercises, and weight log
- Add users via CLI — no public registration

### Data Export
- Download all your sessions as a JSON file with one click

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, Recharts, Lucide    |
| Backend  | Node.js, Express 5                  |
| Auth     | JWT + bcrypt, HttpOnly cookie       |
| Storage  | JSON file (no database required)    |
| Styling  | Plain CSS, Barlow Condensed, DM Mono|

---

## Installation

### Requirements
- Node.js >= 18

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/iron-log.git
cd iron-log/workout-app
npm install
```

### 2. Set environment variables

Create a `.env` file in `workout-app/`:

```env
JWT_SECRET=change-this-to-a-long-random-string
PORT=3001
```

> Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Create a user account

```bash
node server/create-user.js <username> <password>
```

You can create multiple accounts by running this command multiple times.

### 4. Start (development)

```bash
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` to Express on port 3001.

### 5. Start (production)

```bash
npm run build
npm start
```

Express serves the built frontend and the API on the same port (default `3001`).

---

## Data Files

| File                  | Contents                        |
|-----------------------|---------------------------------|
| `server/data.json`    | Sessions, weight log, exercises |
| `server/users.json`   | Usernames and hashed passwords  |

Both files are created automatically and are excluded from git (see `.gitignore`). **Back them up regularly.**

---

## Docker Deployment

### Requirements
- Docker & Docker Compose

### 1. Clone the repo

```bash
git clone https://github.com/Hubertikusrex/IronLog.git
cd IronLog/workout-app
```

### 2. Create a `.env` file

```bash
cp .env.example .env
```

Then edit `.env` and set a strong secret:

```env
JWT_SECRET=change-this-to-a-long-random-string
```

Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Build and start

```bash
docker compose up -d --build
```

The app runs on `http://localhost:3001`.

### 4. Create a user account

```bash
docker compose exec iron-log node server/create-user.js <username> <password>
```

Run this once per user. You can add multiple users.

### 5. Update to a new version

```bash
git pull
docker compose up -d --build
```

---

### Data persistence

All data (sessions, weight log, exercises, users) is stored in a Docker named volume:

```
iron-log-data  →  /app/data  inside the container
```

The volume survives container restarts and image rebuilds. To back up your data:

```bash
# Copy data files to your host
docker compose cp iron-log:/app/data ./backup
```

---

### Using a reverse proxy (Traefik / Nginx)

The included `docker-compose.yml` is already configured for an **external Docker network** called `proxy_netzwerk`. This is the typical setup when you run a reverse proxy (e.g. Traefik or Nginx Proxy Manager) on the same host.

If you don't use a reverse proxy, change the network section to a simple setup:

```yaml
services:
  iron-log:
    build: .
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - iron-log-data:/app/data
    restart: unless-stopped

volumes:
  iron-log-data:
```

---

## Scripts

| Command         | Description                              |
|-----------------|------------------------------------------|
| `npm run dev`   | Start Vite + Express in development mode |
| `npm run build` | Build frontend for production            |
| `npm start`     | Run production server                    |
| `npm run lint`  | Run ESLint                               |

---

## License

MIT
