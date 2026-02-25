<p align="center">
  <img src="public/jakd-logo.png" alt="JAKD Logo" width="120" />
</p>

<h1 align="center">JAKD</h1>

<p align="center">
  <strong>AI-powered fitness tracking with real-time computer vision</strong>
</p>

<p align="center">
  <a href="https://github.com/danielzhao07/JAKD/actions/workflows/ci.yml">
    <img src="https://github.com/danielzhao07/JAKD/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
</p>

---

JAKD is a full-stack fitness application that uses **MediaPipe pose estimation** to automatically count reps and analyze form in real-time through your webcam. Built with React, TypeScript, and Supabase.

## Demo

| Workout Tracking | Form Analysis | Analytics Dashboard |
|:---:|:---:|:---:|
| Real-time rep counting with skeleton overlay | Per-rep form scoring with actionable feedback | Workout history and muscle group breakdowns |

## Features

- **Real-time pose detection** -- MediaPipe Tasks Vision with 33-point skeleton tracking at 30fps
- **Automatic rep counting** -- custom detectors for push-ups, bicep curls (both arms & alternating), and squats
- **Form analysis** -- per-rep scoring with specific feedback on range of motion, tempo, and alignment
- **Video recording** -- record sessions with pose overlay for post-workout review
- **Analytics** -- D3.js/Recharts visualizations for workout history, muscle distribution, and progress trends
- **Goal tracking** -- set and track rep/workout goals with progress indicators
- **Cloud sync** -- Supabase backend with auth, real-time database, and file storage
- **Responsive design** -- mobile-first dark theme UI

## Architecture

```
src/
├── components/          # React components organized by domain
│   ├── workout/         # Camera feed, rep counter, form feedback panel
│   ├── exercise/        # Exercise library and selection
│   ├── charts/          # D3.js and Recharts visualizations
│   ├── profile/         # Account settings, goals, preferences
│   └── shared/          # Reusable UI primitives (Button, Modal, Toast)
├── services/            # Core business logic
│   ├── pose/            # MediaPipe integration + exercise detectors
│   │   └── detectors/   # PushupDetector, BicepCurlDetector, SquatDetector
│   ├── video/           # MediaRecorder-based session recording
│   ├── audio/           # Web Audio API workout cues
│   └── metrics/         # Form analysis calculations
├── repositories/        # Data access layer (Supabase queries)
├── store/               # Zustand state management (8 stores)
├── hooks/               # Custom hooks (useCamera, usePoseDetection, etc.)
├── pages/               # Route-level page components
├── types/               # TypeScript type definitions
└── utils/               # Constants and helper functions
```

**Key design decisions:**

- **Repository pattern** separates data access from UI logic, making Supabase queries testable and swappable
- **Detector pattern** -- each exercise has its own detector class extending `BaseDetector`, making it straightforward to add new exercises
- **Zustand stores** are split by domain (auth, workout, exercise, history, etc.) to avoid monolithic state

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, TypeScript 5.6, Vite |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand, TanStack Query |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Computer Vision | MediaPipe Tasks Vision |
| Visualization | D3.js, Recharts |
| CI/CD | GitHub Actions, Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone the repository
git clone https://github.com/danielzhao07/JAKD.git
cd JAKD

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Run database migrations (in Supabase SQL editor, in order)
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_frontend_redesign_schema.sql
# supabase/migrations/003_exercises_rls_safe.sql

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |
| `npm run preview` | Preview production build locally |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## Supported Exercises

| Exercise | Detection Method |
|----------|-----------------|
| Push-ups | Elbow angle tracking with full ROM detection |
| Bicep Curls (Both Arms) | Simultaneous arm angle tracking |
| Alternating Bicep Curls | Independent left/right arm tracking |
| Squats | Hip drop + knee angle analysis |

## Deployment

The app is deployed on **Vercel** with **Supabase** as the backend:

1. Connect repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy -- Vercel handles builds automatically on push

## License

This project is licensed under the [MIT License](LICENSE).
