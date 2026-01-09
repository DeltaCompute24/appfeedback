from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.feedback import FeedbackItem
from app.models.algorithm import RankingAlgorithm
from app.schemas.feedback import FeedbackItemResponse
from app.schemas.ranking import RankingAlgorithmResponse

router = APIRouter(prefix="/api/ranking", tags=["ranking"])


@router.get("/results", response_model=List[FeedbackItemResponse])
async def get_ranked_results(
    item_type: str = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Get items ranked by the current algorithm."""
    query = select(FeedbackItem).order_by(FeedbackItem.rank_score.desc())

    if item_type:
        query = query.where(FeedbackItem.item_type == item_type)

    query = query.limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()

    return [
        FeedbackItemResponse(
            **{c.name: getattr(item, c.name) for c in item.__table__.columns},
            comment_count=0,
            user_voted=None
        )
        for item in items
    ]


@router.post("/run")
async def run_ranking(db: AsyncSession = Depends(get_db)):
    """Trigger a re-ranking of all items."""
    result = await db.execute(select(FeedbackItem))
    items = result.scalars().all()

    for item in items:
        days_old = (datetime.utcnow() - item.created_at.replace(tzinfo=None)).days if item.created_at else 0
        recency_factor = max(0, 1.0 - (days_old * 0.1 / 7))

        vote_score = item.vote_count * 1.0
        ai_score = 0
        if item.ai_feasibility_score:
            ai_score += item.ai_feasibility_score * 0.3
        if item.ai_impact_score:
            ai_score += item.ai_impact_score * 0.4
        if item.ai_clarity_score:
            ai_score += item.ai_clarity_score * 0.2

        item.rank_score = vote_score + (recency_factor * 0.5) + ai_score

    await db.commit()

    return {"message": f"Re-ranked {len(items)} items", "timestamp": datetime.utcnow().isoformat()}


@router.get("/algorithm", response_model=RankingAlgorithmResponse)
async def get_current_algorithm(db: AsyncSession = Depends(get_db)):
    """Get the current active ranking algorithm (open source)."""
    result = await db.execute(
        select(RankingAlgorithm).where(RankingAlgorithm.is_active == True)
    )
    algorithm = result.scalar_one_or_none()
    if not algorithm:
        raise HTTPException(status_code=404, detail="No active algorithm found")
    return algorithm


@router.get("/algorithm/history", response_model=List[RankingAlgorithmResponse])
async def get_algorithm_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get history of ranking algorithms."""
    result = await db.execute(
        select(RankingAlgorithm)
        .order_by(RankingAlgorithm.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
