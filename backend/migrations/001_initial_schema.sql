-- AppFeedback Database Schema
-- Open Source Feature/Bug Fix Rewards System for B2Bee

-- Feedback Items (Wishlist + Bug Hunt)
CREATE TABLE IF NOT EXISTS feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('wishlist', 'bug')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    x_handle VARCHAR(50),
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'planned', 'in_progress', 'completed', 'wont_do')),
    vote_count INTEGER DEFAULT 0,
    rank_score FLOAT DEFAULT 0,
    ai_feasibility_score FLOAT,
    ai_impact_score FLOAT,
    ai_clarity_score FLOAT,
    po_notes TEXT,
    credits_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes on feedback items
CREATE TABLE IF NOT EXISTS feedback_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    vote_type VARCHAR(10) DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

-- Comments on feedback items
CREATE TABLE IF NOT EXISTS feedback_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    x_handle VARCHAR(50),
    content TEXT NOT NULL,
    is_product_owner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credits tracking (standalone)
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    x_handle VARCHAR(50),
    credits_balance INTEGER DEFAULT 0,
    credits_earned_total INTEGER DEFAULT 0,
    items_submitted INTEGER DEFAULT 0,
    items_developed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transaction history
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    item_id UUID REFERENCES feedback_items(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('submission', 'top_ranked', 'developed', 'bonus', 'bug_verified')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ranking algorithm versions (open source)
CREATE TABLE IF NOT EXISTS ranking_algorithms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL,
    prompt_content TEXT NOT NULL,
    weight_votes FLOAT DEFAULT 1.0,
    weight_recency FLOAT DEFAULT 0.5,
    weight_feasibility FLOAT DEFAULT 0.3,
    weight_impact FLOAT DEFAULT 0.4,
    weight_clarity FLOAT DEFAULT 0.2,
    is_active BOOLEAN DEFAULT FALSE,
    github_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_items_type ON feedback_items(item_type);
CREATE INDEX IF NOT EXISTS idx_feedback_items_status ON feedback_items(status);
CREATE INDEX IF NOT EXISTS idx_feedback_items_rank ON feedback_items(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_items_created ON feedback_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_item ON feedback_votes(item_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_item ON feedback_comments(item_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);

-- Insert default ranking algorithm
INSERT INTO ranking_algorithms (version, prompt_content, is_active, github_url)
VALUES (
    'v1.0.0',
    'Score = (votes * 1.0) + (recency_factor * 0.5) + (feasibility * 0.3) + (impact * 0.4) + (clarity * 0.2)

Where:
- votes: Total upvotes minus downvotes
- recency_factor: 1.0 for items < 7 days old, decays by 0.1 per week
- feasibility: AI-assessed 0-1 score based on technical complexity
- impact: AI-assessed 0-1 score based on user benefit
- clarity: AI-assessed 0-1 score based on description quality',
    TRUE,
    'https://github.com/b2bee/appfeedback/blob/main/algorithm/ranking_prompt.md'
) ON CONFLICT DO NOTHING;
