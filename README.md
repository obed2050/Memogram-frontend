# Memogram Frontend

React single-page application for the Memogram school memories social platform.

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State**: Context API (Auth, Socket)
- **Real-time**: Socket.IO client
- **Animations**: Framer Motion
- **HTTP**: Axios
- **Icons**: React Icons (Heroicons v2)

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default: http://localhost:5000/api) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── assets/              # Static assets (images, SVGs)
├── components/
│   ├── achievements/    # Achievement badges & grids
│   ├── admin/           # Admin dashboard components
│   ├── albums/          # Album cards & modals
│   ├── badges/          # Badge display components
│   ├── before-now/      # Before & Now feature
│   ├── chat/            # Messenger (chat, calls, voice)
│   ├── clubs/           # Club cards & headers
│   ├── community/       # Community pages
│   ├── events/          # Event components
│   ├── feed/            # Post cards, create post
│   ├── guess-who/       # Guess Who game
│   ├── layout/          # TopBar, NavSidebar, BottomNav
│   ├── profile/         # Profile header, stats, tabs
│   ├── recommendations/ # Memory recommendations
│   ├── streaks/         # Streak display
│   └── ui/              # Reusable: Avatar, Button, Input, Modal, MediaViewer
├── contexts/            # AuthContext, SocketContext
├── hooks/               # useInfiniteScroll
├── pages/               # Route pages (30+)
├── routes/              # AppRoutes.jsx
├── services/            # API service modules
└── utils/               # formatDate, cn, formatNumber
```

## Features

- Home feed with premium media cards
- Real-time messaging with voice messages, video calls
- Communities, schools, clubs
- Memories, On This Day, Before & Now
- Guess Who game
- Explore, search, notifications
- Profile with badges, achievements, streaks
- Admin dashboard
