from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.routers import feedback_router, credits_router, ranking_router

app = FastAPI(
    title="AppFeedback API",
    description="Open Source Feature/Bug Fix Rewards System for B2Bee",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(feedback_router)
app.include_router(credits_router)
app.include_router(ranking_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "appfeedback"}


@app.get("/api/stats")
async def get_stats():
    """Get overall platform statistics."""
    from sqlalchemy import select, func
    from app.database import async_session
    from app.models.feedback import FeedbackItem
    from app.models.credits import UserCredits

    async with async_session() as db:
        # Total items
        items_result = await db.execute(select(func.count(FeedbackItem.id)))
        total_items = items_result.scalar() or 0

        # By type
        wishlist_result = await db.execute(
            select(func.count(FeedbackItem.id)).where(FeedbackItem.item_type == "wishlist")
        )
        wishlist_count = wishlist_result.scalar() or 0

        bug_result = await db.execute(
            select(func.count(FeedbackItem.id)).where(FeedbackItem.item_type == "bug")
        )
        bug_count = bug_result.scalar() or 0

        # Completed items
        completed_result = await db.execute(
            select(func.count(FeedbackItem.id)).where(FeedbackItem.status == "completed")
        )
        completed_count = completed_result.scalar() or 0

        # Total contributors
        contributors_result = await db.execute(select(func.count(UserCredits.id)))
        contributors_count = contributors_result.scalar() or 0

        # Total credits awarded
        credits_result = await db.execute(select(func.sum(UserCredits.credits_earned_total)))
        total_credits = credits_result.scalar() or 0

    return {
        "total_items": total_items,
        "wishlist_count": wishlist_count,
        "bug_count": bug_count,
        "completed_count": completed_count,
        "contributors_count": contributors_count,
        "total_credits_awarded": total_credits
    }


# Serve static files if dashboard is built
dashboard_path = os.path.join(os.path.dirname(__file__), "..", "..", "dashboard", "dist")
if os.path.exists(dashboard_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dashboard_path, "assets")), name="assets")

    @app.get("/")
    async def serve_dashboard():
        return FileResponse(os.path.join(dashboard_path, "index.html"))

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        file_path = os.path.join(dashboard_path, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dashboard_path, "index.html"))
