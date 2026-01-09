# AppFeedback - Open Source Feature/Bug Fix Rewards System

## Project Overview

A community-driven feedback platform where B2Bee users can submit feature requests ("Wishlist") and bug reports ("Bug Hunt"), earn credits for contributions, and engage through X (Twitter) integration.

---

## Architecture Decision

**Tech Stack (aligned with salescopilot):**
- **Backend**: FastAPI + PostgreSQL (async with SQLAlchemy 2.0)
- **Frontend**: React + Vite (consistent with B2Bee dashboard)
- **AI**: Claude API for ranking algorithm
- **Social**: X (Twitter) API for submissions and publishing
- **Auth**: B2Bee API key integration (reuse existing pattern)

---

## Phase 1: Core Database & API Foundation

### Task 1.1: Database Schema Design
- [ ] Create `feedback_items` table (id, type, title, description, user_id, x_handle, status, credits_awarded, created_at, updated_at)
- [ ] Create `feedback_votes` table (id, item_id, user_id, vote_type, created_at)
- [ ] Create `feedback_comments` table (id, item_id, user_id, content, is_product_owner, created_at)
- [ ] Create `ranking_algorithm` table (id, version, prompt_content, parameters, is_active, github_commit_hash, created_at)
- [ ] Create `user_credits` table (id, user_id, credits_balance, credits_earned_total, created_at, updated_at)
- [ ] Create `credit_transactions` table (id, user_id, item_id, amount, transaction_type, description, created_at)
- [ ] Create PostgreSQL migration file

### Task 1.2: Backend API Structure
- [ ] Set up FastAPI app structure in `/appfeedback/backend/`
- [ ] Create database models (SQLAlchemy)
- [ ] Create Pydantic schemas for request/response
- [ ] Create database connection manager (async PostgreSQL)

### Task 1.3: Core CRUD Endpoints
- [ ] `POST /api/feedback` - Submit new wishlist/bug item
- [ ] `GET /api/feedback` - List all items (with pagination, filters)
- [ ] `GET /api/feedback/{id}` - Get single item details
- [ ] `PUT /api/feedback/{id}` - Update item (owner only)
- [ ] `DELETE /api/feedback/{id}` - Delete item (owner only)
- [ ] `POST /api/feedback/{id}/vote` - Upvote/downvote
- [ ] `POST /api/feedback/{id}/comments` - Add comment
- [ ] `GET /api/feedback/{id}/comments` - Get comments

---

## Phase 2: Ranking Algorithm System

### Task 2.1: Open Source Algorithm Design
- [ ] Create algorithm prompt template (Claude-based)
- [ ] Define scoring factors:
  - Vote count (weighted)
  - Recency decay
  - User engagement (comments)
  - Feasibility score (AI-assessed)
  - Impact score (AI-assessed)
  - Clarity of description (AI-assessed)
- [ ] Store algorithm as versioned config in database
- [ ] Create GitHub-synced algorithm file (`/algorithm/ranking_prompt.md`)

### Task 2.2: Ranking Engine Implementation
- [ ] `POST /api/ranking/run` - Trigger ranking recalculation
- [ ] `GET /api/ranking/results` - Get ranked list
- [ ] `GET /api/ranking/algorithm` - View current algorithm (public)
- [ ] `PUT /api/ranking/algorithm` - Update algorithm (admin only)
- [ ] Implement async ranking job (background task)
- [ ] Add webhook for GitHub algorithm updates

### Task 2.3: AI Integration
- [ ] Claude API integration for item analysis
- [ ] Automatic feasibility/impact scoring on submission
- [ ] Batch ranking with Claude for top items
- [ ] Rate limiting and cost controls

---

## Phase 3: Credits System

### Task 3.1: Credit Mechanics
- [ ] Define credit award rules:
  - Item reaches top 10: +50 credits
  - Item gets developed: +500 credits
  - First valid bug report: +25 credits
  - High-quality submission bonus: +10-50 credits
- [ ] `GET /api/credits/balance` - User credit balance
- [ ] `GET /api/credits/history` - Credit transaction history
- [ ] `POST /api/credits/award` - Award credits (admin/system)

### Task 3.2: Credit Integration with B2Bee
- [ ] Design credit sync mechanism with B2Bee platform
- [ ] Webhook to notify B2Bee of credit awards
- [ ] API to verify user exists in B2Bee

---

## Phase 4: X (Twitter) Integration

### Task 4.1: Submission via X
- [ ] Create dedicated hashtag system (#B2BeeWishlist, #B2BeeBugHunt)
- [ ] Set up X API v2 integration (OAuth 2.0)
- [ ] Implement tweet monitoring (filtered stream)
- [ ] Parse tweets into feedback items
- [ ] Link X handle to submissions automatically
- [ ] Reply to user confirming submission received

### Task 4.2: Publishing to X
- [ ] Auto-post top 5 items weekly
- [ ] Post when item status changes (In Progress, Completed)
- [ ] Post credit awards (@mention user)
- [ ] Create shareable item cards (Open Graph images)

### Task 4.3: Engagement Features
- [ ] Thread creation for popular items
- [ ] Quote tweet integration for votes
- [ ] X poll integration for feature prioritization

---

## Phase 5: Product Owner Dashboard

### Task 5.1: Admin Features
- [ ] Status management (New, Under Review, Planned, In Progress, Completed, Won't Do)
- [ ] Product Owner comment system (highlighted)
- [ ] Bulk status updates
- [ ] Priority override capability
- [ ] Credit award approval workflow

### Task 5.2: Analytics Dashboard
- [ ] Submission trends over time
- [ ] Top contributors leaderboard
- [ ] Category breakdown (Wishlist vs Bug Hunt)
- [ ] Engagement metrics (votes, comments)

---

## Phase 6: Frontend Dashboard

### Task 6.1: User-Facing Dashboard
- [ ] Create React app in `/appfeedback/dashboard/`
- [ ] Two-tab interface (Wishlist / Bug Hunt)
- [ ] Item submission form
- [ ] Ranked item list with search/filters
- [ ] Individual item detail view
- [ ] Voting and commenting UI
- [ ] User profile with credits display

### Task 6.2: Embeddable Widget
- [ ] Create embeddable widget for B2Bee website
- [ ] Iframe and JavaScript embed options
- [ ] Responsive design for various placements

### Task 6.3: X-Native Experience
- [ ] Card-style preview for X embeds
- [ ] Mobile-first responsive design
- [ ] Quick actions from X (vote via reply)

---

## Phase 7: Open Source Infrastructure

### Task 7.1: GitHub Repository Setup
- [ ] Create public repo structure
- [ ] Document contribution guidelines
- [ ] Algorithm file with version history
- [ ] Issue templates for algorithm improvements
- [ ] CI/CD for algorithm validation

### Task 7.2: Transparency Features
- [ ] Public changelog for algorithm updates
- [ ] Ranking history visible to users
- [ ] Score breakdown shown per item
- [ ] Community voting on algorithm changes

---

## File Structure

```
/appfeedback/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Async PostgreSQL connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── feedback.py      # FeedbackItem, Vote, Comment models
│   │   │   ├── credits.py       # UserCredits, CreditTransaction models
│   │   │   └── algorithm.py     # RankingAlgorithm model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── feedback.py      # Pydantic schemas
│   │   │   ├── credits.py
│   │   │   └── ranking.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── feedback.py      # CRUD endpoints
│   │   │   ├── credits.py       # Credits endpoints
│   │   │   ├── ranking.py       # Ranking endpoints
│   │   │   └── twitter.py       # X integration endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ranking_engine.py
│   │   │   ├── claude_analyzer.py
│   │   │   ├── twitter_service.py
│   │   │   └── credit_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── auth.py          # B2Bee auth integration
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── requirements.txt
│   └── Dockerfile
├── dashboard/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── FeedbackList.jsx
│   │   │   ├── FeedbackItem.jsx
│   │   │   ├── SubmitForm.jsx
│   │   │   ├── VoteButton.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── CreditsDisplay.jsx
│   │   │   └── RankingInfo.jsx
│   │   ├── pages/
│   │   │   ├── Wishlist.jsx
│   │   │   ├── BugHunt.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   └── Profile.jsx
│   │   └── services/
│   │       └── api.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── algorithm/
│   ├── ranking_prompt.md        # Open source algorithm
│   ├── CHANGELOG.md             # Algorithm version history
│   └── CONTRIBUTING.md          # How to propose changes
├── docs/
│   ├── API.md                   # API documentation
│   ├── SETUP.md                 # Setup instructions
│   └── INTEGRATION.md           # X/B2Bee integration guide
├── tasks/
│   └── todo.md                  # This file
└── README.md
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit new item |
| GET | `/api/feedback` | List items (paginated) |
| GET | `/api/feedback/{id}` | Get item details |
| PUT | `/api/feedback/{id}` | Update item |
| DELETE | `/api/feedback/{id}` | Delete item |
| POST | `/api/feedback/{id}/vote` | Vote on item |
| GET | `/api/feedback/{id}/comments` | Get comments |
| POST | `/api/feedback/{id}/comments` | Add comment |
| GET | `/api/ranking/results` | Get ranked list |
| POST | `/api/ranking/run` | Trigger re-ranking |
| GET | `/api/ranking/algorithm` | View algorithm |
| GET | `/api/credits/balance` | Get credit balance |
| GET | `/api/credits/history` | Get credit history |
| POST | `/api/twitter/webhook` | X event webhook |
| GET | `/api/health` | Health check |

---

## Priority Order for MVP

1. **Database schema** - Foundation for everything
2. **Core feedback CRUD** - Submit and view items
3. **Voting system** - Community engagement
4. **Basic ranking** - Simple vote-based first
5. **Credits system** - Reward mechanism
6. **React dashboard** - User interface
7. **X submission** - Social integration
8. **AI ranking** - Claude-powered ranking
9. **X publishing** - Auto-posting results

---

## Review Section

### MVP Built (Completed)

**Backend (`/appfeedback/backend/`):**
- [x] PostgreSQL schema with 6 tables: `feedback_items`, `feedback_votes`, `feedback_comments`, `user_credits`, `credit_transactions`, `ranking_algorithms`
- [x] FastAPI app with async SQLAlchemy 2.0
- [x] Full CRUD for feedback items
- [x] Voting system with toggle support
- [x] Comments system with PO flagging
- [x] Credits system (balance, history, leaderboard)
- [x] Ranking endpoints with transparent algorithm

**Frontend (`/appfeedback/dashboard/`):**
- [x] React 18 + Vite setup
- [x] Dark minimalist theme with Space Grotesk font
- [x] Two-tab interface (Wishlist / Bug Hunt)
- [x] Item list with sorting (rank, votes, recent)
- [x] Vote buttons with visual feedback
- [x] Submit form with X handle field
- [x] Stats grid and leaderboard sidebar
- [x] Algorithm transparency section

**Deployment (`/appfeedback/`):**
- [x] Vercel serverless configuration
- [x] In-memory demo API for quick testing
- [x] Production-ready backend for PostgreSQL

**Documentation:**
- [x] README.md with setup instructions
- [x] Open source algorithm in `algorithm/ranking_prompt.md`
- [x] Contribution guidelines in `algorithm/CONTRIBUTING.md`
- [x] Environment example file

### X Integration Workaround
Instead of direct X API integration:
- Users enter X handle manually in submission form
- Handles displayed on items and leaderboard
- Shareable links can be posted to X manually
- No API costs or rate limits

### Files Created
```
/appfeedback/
├── api/index.py                    # Vercel serverless handler (in-memory demo)
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/__init__.py
│   │   ├── models/feedback.py
│   │   ├── models/credits.py
│   │   ├── models/algorithm.py
│   │   ├── schemas/__init__.py
│   │   ├── schemas/feedback.py
│   │   ├── schemas/credits.py
│   │   ├── schemas/ranking.py
│   │   ├── routers/__init__.py
│   │   ├── routers/feedback.py
│   │   ├── routers/credits.py
│   │   └── routers/ranking.py
│   ├── migrations/001_initial_schema.sql
│   └── requirements.txt
├── dashboard/
│   ├── src/App.jsx
│   ├── src/main.jsx
│   ├── src/index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── algorithm/
│   ├── ranking_prompt.md
│   └── CONTRIBUTING.md
├── tasks/todo.md
├── vercel.json
├── requirements.txt
├── .env.example
└── README.md
```

### Next Steps (Future Phases)
1. Connect to real PostgreSQL database
2. Add Claude AI for feasibility/impact scoring
3. Add authentication (B2Bee integration)
4. Build admin dashboard for Product Owner
5. Add email notifications
6. Create embeddable widget

### Notes
- MVP uses in-memory storage for Vercel demo (no database setup needed)
- Switch to PostgreSQL by setting DATABASE_URL environment variable
- Dark theme designed for developer audience
- Algorithm is fully transparent and documented
