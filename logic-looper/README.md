# Logic Looper - Daily Puzzle Game

A full-stack daily puzzle game application built with React, Node.js, and PostgreSQL.

## Features

✨ **Daily Puzzles**: 365 unique puzzles rotating through 5 different types
🔥 **Streak System**: Build daily streaks and earn rewards
🎯 **Multiple Puzzle Types**: Sudoku, Pattern Matching, Sequences, Deduction, Binary Logic
📊 **Leaderboards**: Compete with other players
🎮 **Offline Support**: Play anywhere with IndexedDB storage
🚀 **Fast & Lightweight**: Client-first architecture for instant puzzle generation

## Tech Stack

### Frontend
- React 18 with Vite
- Redux Toolkit for state management
- Tailwind CSS & Framer Motion for styling
- Day.js for date handling
- IndexedDB for offline storage

### Backend
- Node.js + Express
- PostgreSQL (via Prisma ORM)
- Minimalist API design

## Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Backend Setup
```bash
cd backend
npm install
# Setup .env with DATABASE_URL
npx prisma migrate dev
npm run dev
# Backend runs on http://localhost:3000
```

## Project Structure

```
logic-looper/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── store/             # Redux slices
│   │   ├── utils/             # Puzzle generation & utilities
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── controllers/       # Route handlers
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
```

## Puzzle Types

1. **Sudoku**: Classic 9x9 grid puzzle
2. **Pattern Matching**: Visual pattern recognition
3. **Sequence Solver**: Identify mathematical sequences
4. **Deduction Grid**: Logic-based puzzle solving
5. **Binary Logic**: 0/1 grid with constraints

## Key Features Implementation

### Client-Side Puzzle Generation
- Deterministic generation based on date seed
- Uses CryptoJS for hashing
- All puzzle logic runs in browser
- No server dependency for puzzle data

### Daily Reset
- Automatic reset at midnight (local time)
- New puzzle unlocks automatically
- Streak counting logic
- Time-based rewards

### State Management
- Redux store for global state
- Separate slices for puzzle and user data
- Local persistence with IndexedDB

## API Endpoints

### Users
- `POST /api/users/register` - Create/login user
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/streak` - Update streak
- `POST /api/users/:id/points` - Add points

### Scores
- `POST /api/scores` - Save daily score
- `GET /api/scores/:userId/:date` - Get daily score
- `GET /api/scores/leaderboard/:date` - Get top 100
- `GET /api/scores/stats/:userId` - Get user statistics

## Performance Targets
- ⚡ First load: < 100KB
- ⏱️ TTI: < 3s
- 🎮 Puzzle generation: < 100ms
- 📊 Lighthouse score: 95+

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
