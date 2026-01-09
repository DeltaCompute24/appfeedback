"""
Vercel Serverless API Handler for AppFeedback
Simple HTTP handler without FastAPI for maximum compatibility
"""
import json
import os
import base64
from datetime import datetime
from uuid import uuid4
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from anthropic import Anthropic

# GitHub configuration for auto-creating issues
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
GITHUB_REPO = os.environ.get('GITHUB_REPO', 'Delta-Compute/bumblebee')

# In-memory storage for demo
feedback_items = []
votes = {}
comments = {}
user_credits = {}
attachments = {}  # Store file attachments by feedback_id

algorithm = {
    "id": str(uuid4()),
    "version": "v1.0.0",
    "prompt_content": "Score = (votes * 1.0) + (recency_factor * 0.5) + (feasibility * 0.3) + (impact * 0.4) + (clarity * 0.2)\n\nWhere:\n- votes: Total upvotes minus downvotes\n- recency_factor: 1.0 for items < 7 days old, decays by 0.1 per week",
    "weight_votes": 1.0,
    "weight_recency": 0.5,
    "weight_feasibility": 0.3,
    "weight_impact": 0.4,
    "weight_clarity": 0.2,
    "is_active": True,
    "github_url": "https://github.com/DeltaCompute24/appfeedback/blob/main/algorithm/ranking_prompt.md",
    "created_at": datetime.utcnow().isoformat()
}


def calculate_rank_score(item):
    created = datetime.fromisoformat(item["created_at"].replace("Z", ""))
    days_old = (datetime.utcnow() - created).days
    recency_factor = max(0, 1.0 - (days_old * 0.1 / 7))

    score = item["vote_count"] * 1.0 + recency_factor * 0.5

    # Add AI scores if available
    if item.get("ai_feasibility_score") is not None:
        score += item["ai_feasibility_score"] * 0.3
    if item.get("ai_impact_score") is not None:
        score += item["ai_impact_score"] * 0.4
    if item.get("ai_clarity_score") is not None:
        score += item["ai_clarity_score"] * 0.2

    return score


def score_feedback_item(title, description, item_type):
    """Score a feedback item using Claude API."""
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return {"feasibility": None, "impact": None, "clarity": None}

    try:
        client = Anthropic(api_key=api_key)

        prompt = f"""Score this {item_type} feedback item on three dimensions (0.0 to 1.0):

Title: {title}
Description: {description}

Score each dimension:
1. FEASIBILITY (0-1): How technically feasible? Consider complexity, resources needed, risk.
2. IMPACT (0-1): How much user benefit? Consider users affected, frequency, pain severity.
3. CLARITY (0-1): How well described? Consider completeness, reproducibility, examples.

Respond ONLY with JSON: {{"feasibility": 0.X, "impact": 0.X, "clarity": 0.X}}"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}]
        )

        return json.loads(message.content[0].text)
    except Exception:
        return {"feasibility": None, "impact": None, "clarity": None}


def create_github_issue(title, body, labels=None):
    """Create a GitHub issue for bug reports"""
    if not GITHUB_TOKEN:
        return None, "GitHub token not configured"

    try:
        import urllib.request

        url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
        data = {
            "title": title,
            "body": body,
            "labels": labels or ["bug", "user-reported", "from-feedback-site"]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={
                'Authorization': f'token {GITHUB_TOKEN}',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'AppFeedback-Bot'
            },
            method='POST'
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('html_url'), None
    except Exception as e:
        return None, str(e)


def json_response(handler, data, status=200):
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode())


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # Health check
        if path == '/api/health':
            return json_response(self, {"status": "healthy", "service": "appfeedback"})

        # Stats
        if path == '/api/stats':
            wishlist = [i for i in feedback_items if i["item_type"] == "wishlist"]
            bugs = [i for i in feedback_items if i["item_type"] == "bug"]
            completed = [i for i in feedback_items if i["status"] == "completed"]
            total_credits = sum(u.get("credits_earned_total", 0) for u in user_credits.values())
            return json_response(self, {
                "total_items": len(feedback_items),
                "wishlist_count": len(wishlist),
                "bug_count": len(bugs),
                "completed_count": len(completed),
                "contributors_count": len(user_credits),
                "total_credits_awarded": total_credits
            })

        # List feedback
        if path == '/api/feedback':
            item_type = params.get("item_type", [None])[0]
            sort_by = params.get("sort_by", ["rank"])[0]
            user_id = params.get("user_id", [None])[0]

            items = feedback_items.copy()
            if item_type:
                items = [i for i in items if i["item_type"] == item_type]

            for item in items:
                item["comment_count"] = len(comments.get(item["id"], []))
                item["user_voted"] = votes.get(f"{item['id']}:{user_id}")

            if sort_by == "rank":
                items.sort(key=lambda x: x["rank_score"], reverse=True)
            elif sort_by == "votes":
                items.sort(key=lambda x: x["vote_count"], reverse=True)
            else:
                items.sort(key=lambda x: x["created_at"], reverse=True)

            return json_response(self, items)

        # Get single feedback item
        if path.startswith('/api/feedback/') and '/comments' not in path and '/vote' not in path:
            item_id = path.split('/api/feedback/')[1]
            user_id = params.get("user_id", [None])[0]
            for item in feedback_items:
                if item["id"] == item_id:
                    item["comment_count"] = len(comments.get(item_id, []))
                    item["user_voted"] = votes.get(f"{item_id}:{user_id}")
                    return json_response(self, item)
            return json_response(self, {"detail": "Not found"}, 404)

        # Get comments
        if '/comments' in path:
            item_id = path.split('/api/feedback/')[1].split('/comments')[0]
            return json_response(self, comments.get(item_id, []))

        # Credits balance
        if path == '/api/credits/balance':
            user_id = params.get("user_id", [None])[0]
            if user_id in user_credits:
                return json_response(self, user_credits[user_id])
            return json_response(self, {"detail": "User not found"}, 404)

        # Leaderboard
        if path == '/api/credits/leaderboard':
            limit = int(params.get("limit", [20])[0])
            sorted_users = sorted(user_credits.values(), key=lambda x: x["credits_earned_total"], reverse=True)
            return json_response(self, sorted_users[:limit])

        # Ranking algorithm
        if path == '/api/ranking/algorithm':
            return json_response(self, algorithm)

        # Ranked results
        if path == '/api/ranking/results':
            item_type = params.get("item_type", [None])[0]
            limit = int(params.get("limit", [20])[0])
            items = feedback_items.copy()
            if item_type:
                items = [i for i in items if i["item_type"] == item_type]
            items.sort(key=lambda x: x["rank_score"], reverse=True)
            return json_response(self, items[:limit])

        return json_response(self, {"detail": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body) if body else {}

        # Create feedback
        if path == '/api/feedback':
            item_id = str(uuid4())
            now = datetime.utcnow().isoformat()

            # Bug-specific fields
            is_bug = data["item_type"] == "bug"
            platform = data.get("platform", "unknown")
            app_version = data.get("app_version", "unknown")
            steps_to_reproduce = data.get("steps_to_reproduce", "")

            item = {
                "id": item_id,
                "item_type": data["item_type"],
                "title": data["title"],
                "description": data["description"],
                "user_id": data["user_id"],
                "x_handle": data.get("x_handle"),
                "status": "new",
                "vote_count": 0,
                "rank_score": 0.5,
                "ai_feasibility_score": None,
                "ai_impact_score": None,
                "ai_clarity_score": None,
                "po_notes": None,
                "credits_awarded": 0,
                "created_at": now,
                "updated_at": now,
                "comment_count": 0,
                "user_voted": None,
                "platform": platform,
                "app_version": app_version,
                "steps_to_reproduce": steps_to_reproduce,
                "github_issue_url": None
            }

            # For bug reports, create GitHub issue
            if is_bug and GITHUB_TOKEN:
                issue_body = f"""## Bug Report from Feedback Site

**Platform:** {platform}
**App Version:** {app_version}
**Submitted by:** {data.get('x_handle') or data['user_id'][:12]}

### Description
{data['description']}

### Steps to Reproduce
{steps_to_reproduce or 'Not provided'}

---
*This issue was auto-created from the [BumbleBee Feedback Site](https://appfeedback-one.vercel.app/?variant=bumblebee)*
*Feedback ID: {item_id}*
"""
                labels = ["bug", "user-reported", "from-feedback-site"]
                if platform == "windows":
                    labels.append("windows")
                elif platform == "mac":
                    labels.append("macos")

                github_url, error = create_github_issue(
                    f"[User Report] {data['title']}",
                    issue_body,
                    labels
                )
                if github_url:
                    item["github_issue_url"] = github_url

            # Score with Claude AI
            scores = score_feedback_item(data["title"], data["description"], data["item_type"])
            item["ai_feasibility_score"] = scores.get("feasibility")
            item["ai_impact_score"] = scores.get("impact")
            item["ai_clarity_score"] = scores.get("clarity")
            item["rank_score"] = calculate_rank_score(item)

            feedback_items.append(item)

            # Award credits (bugs get bonus for helping debug)
            user_id = data["user_id"]
            credits_to_award = 15 if is_bug else 10  # Bugs get bonus

            if user_id not in user_credits:
                user_credits[user_id] = {
                    "id": str(uuid4()),
                    "user_id": user_id,
                    "x_handle": data.get("x_handle"),
                    "credits_balance": 0,
                    "credits_earned_total": 0,
                    "items_submitted": 0,
                    "items_developed": 0,
                    "created_at": now
                }
            user_credits[user_id]["credits_balance"] += credits_to_award
            user_credits[user_id]["credits_earned_total"] += credits_to_award
            user_credits[user_id]["items_submitted"] += 1
            if data.get("x_handle"):
                user_credits[user_id]["x_handle"] = data.get("x_handle")

            return json_response(self, item, 201)

        # Vote
        if '/vote' in path:
            item_id = path.split('/api/feedback/')[1].split('/vote')[0]
            user_id = data["user_id"]
            vote_type = data.get("vote_type", "up")
            vote_key = f"{item_id}:{user_id}"

            for item in feedback_items:
                if item["id"] == item_id:
                    existing_vote = votes.get(vote_key)
                    if existing_vote:
                        if existing_vote == vote_type:
                            del votes[vote_key]
                            item["vote_count"] += -1 if vote_type == "up" else 1
                            user_voted = None
                        else:
                            votes[vote_key] = vote_type
                            item["vote_count"] += 2 if vote_type == "up" else -2
                            user_voted = vote_type
                    else:
                        votes[vote_key] = vote_type
                        item["vote_count"] += 1 if vote_type == "up" else -1
                        user_voted = vote_type

                    item["rank_score"] = calculate_rank_score(item)
                    return json_response(self, {"vote_count": item["vote_count"], "user_voted": user_voted})

            return json_response(self, {"detail": "Not found"}, 404)

        # Add comment
        if '/comments' in path:
            item_id = path.split('/api/feedback/')[1].split('/comments')[0]
            comment = {
                "id": str(uuid4()),
                "item_id": item_id,
                "user_id": data["user_id"],
                "x_handle": data.get("x_handle"),
                "content": data["content"],
                "is_product_owner": data.get("is_product_owner", False),
                "created_at": datetime.utcnow().isoformat()
            }
            if item_id not in comments:
                comments[item_id] = []
            comments[item_id].append(comment)
            return json_response(self, comment, 201)

        # Run ranking
        if path == '/api/ranking/run':
            for item in feedback_items:
                item["rank_score"] = calculate_rank_score(item)
            return json_response(self, {"message": f"Re-ranked {len(feedback_items)} items"})

        return json_response(self, {"detail": "Not found"}, 404)
