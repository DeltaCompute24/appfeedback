"""
Vercel Serverless API Handler for AppFeedback
Simple HTTP handler without FastAPI for maximum compatibility
"""
import json
from datetime import datetime
from uuid import uuid4
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# In-memory storage for demo
feedback_items = []
votes = {}
comments = {}
user_credits = {}

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
    return item["vote_count"] * 1.0 + recency_factor * 0.5


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
                "user_voted": None
            }
            feedback_items.append(item)

            # Award credits
            user_id = data["user_id"]
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
            user_credits[user_id]["credits_balance"] += 10
            user_credits[user_id]["credits_earned_total"] += 10
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
