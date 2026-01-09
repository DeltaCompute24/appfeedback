# AppFeedback

Open Source Feature/Bug Fix Rewards System for B2Bee

A community-driven feedback platform where users submit feature requests ("Wishlist") and bug reports ("Bug Hunt"), earn credits for contributions, and engage through shareable social links.

## Live Demo

- **Generic Version**: [appfeedback-one.vercel.app](https://appfeedback-one.vercel.app)
- **BumbleBee Version**: [appfeedback-one.vercel.app/?variant=bumblebee](https://appfeedback-one.vercel.app/?variant=bumblebee)

## Fork This Project

Want to create your own feedback board? Fork this repo and customize it for your product!

```bash
# 1. Fork via GitHub UI (click "Fork" button above)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/appfeedback.git
cd appfeedback

# 3. Install dependencies
cd dashboard && npm install

# 4. Deploy to Vercel
vercel --prod
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## Features

- **Wishlist**: Submit and vote on feature requests
- **Bug Hunt**: Report bugs and track fixes
- **Credits System**: Earn credits for submissions that get developed
- **Open Source Ranking**: Transparent algorithm anyone can view and propose changes to
- **Leaderboard**: Top contributors recognized publicly
- **X Integration**: Share items via social links with your handle

## Tech Stack

- **Backend**: FastAPI + PostgreSQL
- **Frontend**: React + Vite
- **Deployment**: Vercel (serverless)
- **Styling**: Custom CSS (dark minimalist theme)

## Quick Start

### Local Development

1. Install dependencies:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd dashboard
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Add DATABASE_URL for PostgreSQL
```

3. Run database migrations:
```bash
psql -d your_database -f backend/migrations/001_initial_schema.sql
```

4. Start the servers:
```bash
# Backend (terminal 1)
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (terminal 2)
cd dashboard
npm run dev
```

5. Open http://localhost:5173

### Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
4. Deploy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit new item |
| GET | `/api/feedback` | List items |
| GET | `/api/feedback/{id}` | Get item |
| POST | `/api/feedback/{id}/vote` | Vote |
| GET | `/api/feedback/{id}/comments` | Get comments |
| POST | `/api/feedback/{id}/comments` | Add comment |
| GET | `/api/credits/balance` | Get balance |
| GET | `/api/credits/leaderboard` | Top contributors |
| GET | `/api/ranking/algorithm` | View algorithm |
| GET | `/api/stats` | Platform stats |

## Credits System

| Action | Credits |
|--------|---------|
| Submit feedback | +10 |
| Item reaches top 10 | +50 |
| Item gets developed | +500 |
| Verified bug report | +25 |

## Ranking Algorithm

The ranking algorithm is open source and visible at `/api/ranking/algorithm`.

```
Score = (votes * 1.0) + (recency * 0.5) + (feasibility * 0.3) + (impact * 0.4) + (clarity * 0.2)
```

Propose changes via GitHub issues or PRs to `algorithm/ranking_prompt.md`.

## Project Structure

```
/appfeedback
├── api/                  # Vercel serverless handler
│   └── index.py
├── backend/
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── config.py     # Configuration
│   │   ├── database.py   # PostgreSQL connection
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── routers/      # API endpoints
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── requirements.txt
├── dashboard/
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Dark theme styles
│   ├── package.json
│   └── vite.config.js
├── algorithm/
│   ├── ranking_prompt.md # Open source algorithm
│   └── CONTRIBUTING.md
├── vercel.json
└── README.md
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Fork and setup instructions
- Code style guidelines
- PR process
- Algorithm change proposals

## License

MIT - see [LICENSE](LICENSE)
