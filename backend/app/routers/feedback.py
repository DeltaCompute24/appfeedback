from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, delete
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.models.feedback import FeedbackItem, FeedbackVote, FeedbackComment
from app.models.credits import UserCredits, CreditTransaction
from app.schemas.feedback import (
    FeedbackItemCreate,
    FeedbackItemUpdate,
    FeedbackItemResponse,
    FeedbackVoteCreate,
    FeedbackCommentCreate,
    FeedbackCommentResponse,
)
from app.config import get_settings

router = APIRouter(prefix="/api/feedback", tags=["feedback"])
settings = get_settings()


@router.post("", response_model=FeedbackItemResponse)
async def create_feedback_item(item: FeedbackItemCreate, db: AsyncSession = Depends(get_db)):
    """Submit a new wishlist item or bug report."""
    db_item = FeedbackItem(
        item_type=item.item_type,
        title=item.title,
        description=item.description,
        user_id=item.user_id,
        x_handle=item.x_handle,
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)

    # Award credits for submission
    await _award_credits(db, item.user_id, db_item.id, settings.credits_submission, "submission", f"Submitted: {item.title[:50]}")

    # Update user stats
    await _update_user_stats(db, item.user_id, item.x_handle, items_submitted_delta=1)

    return FeedbackItemResponse(
        **{c.name: getattr(db_item, c.name) for c in db_item.__table__.columns},
        comment_count=0,
        user_voted=None
    )


@router.get("", response_model=List[FeedbackItemResponse])
async def list_feedback_items(
    item_type: Optional[str] = Query(None, regex="^(wishlist|bug)$"),
    status: Optional[str] = None,
    sort_by: str = Query("rank", regex="^(rank|votes|recent)$"),
    user_id: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List feedback items with filtering and sorting."""
    query = select(FeedbackItem)

    if item_type:
        query = query.where(FeedbackItem.item_type == item_type)
    if status:
        query = query.where(FeedbackItem.status == status)

    if sort_by == "rank":
        query = query.order_by(FeedbackItem.rank_score.desc())
    elif sort_by == "votes":
        query = query.order_by(FeedbackItem.vote_count.desc())
    else:
        query = query.order_by(FeedbackItem.created_at.desc())

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    items = result.scalars().all()

    # Get comment counts
    comment_counts = {}
    if items:
        item_ids = [item.id for item in items]
        count_query = select(
            FeedbackComment.item_id,
            func.count(FeedbackComment.id).label("count")
        ).where(FeedbackComment.item_id.in_(item_ids)).group_by(FeedbackComment.item_id)
        count_result = await db.execute(count_query)
        comment_counts = {row.item_id: row.count for row in count_result}

    # Get user votes if user_id provided
    user_votes = {}
    if user_id and items:
        vote_query = select(FeedbackVote).where(
            FeedbackVote.item_id.in_(item_ids),
            FeedbackVote.user_id == user_id
        )
        vote_result = await db.execute(vote_query)
        user_votes = {vote.item_id: vote.vote_type for vote in vote_result.scalars()}

    return [
        FeedbackItemResponse(
            **{c.name: getattr(item, c.name) for c in item.__table__.columns},
            comment_count=comment_counts.get(item.id, 0),
            user_voted=user_votes.get(item.id)
        )
        for item in items
    ]


@router.get("/{item_id}", response_model=FeedbackItemResponse)
async def get_feedback_item(
    item_id: UUID,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get a single feedback item by ID."""
    result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Get comment count
    count_result = await db.execute(
        select(func.count(FeedbackComment.id)).where(FeedbackComment.item_id == item_id)
    )
    comment_count = count_result.scalar() or 0

    # Get user vote
    user_voted = None
    if user_id:
        vote_result = await db.execute(
            select(FeedbackVote).where(
                FeedbackVote.item_id == item_id,
                FeedbackVote.user_id == user_id
            )
        )
        vote = vote_result.scalar_one_or_none()
        if vote:
            user_voted = vote.vote_type

    return FeedbackItemResponse(
        **{c.name: getattr(item, c.name) for c in item.__table__.columns},
        comment_count=comment_count,
        user_voted=user_voted
    )


@router.put("/{item_id}", response_model=FeedbackItemResponse)
async def update_feedback_item(
    item_id: UUID,
    update: FeedbackItemUpdate,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Update a feedback item (owner or admin only)."""
    result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check ownership (TODO: add admin check)
    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)

    return FeedbackItemResponse(
        **{c.name: getattr(item, c.name) for c in item.__table__.columns},
        comment_count=0,
        user_voted=None
    )


@router.delete("/{item_id}")
async def delete_feedback_item(
    item_id: UUID,
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Delete a feedback item (owner only)."""
    result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.execute(delete(FeedbackItem).where(FeedbackItem.id == item_id))
    await db.commit()

    return {"message": "Item deleted"}


@router.post("/{item_id}/vote")
async def vote_on_item(
    item_id: UUID,
    vote: FeedbackVoteCreate,
    db: AsyncSession = Depends(get_db),
):
    """Vote on a feedback item (toggle vote if already voted)."""
    # Check item exists
    item_result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.id == item_id)
    )
    item = item_result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check existing vote
    existing_vote_result = await db.execute(
        select(FeedbackVote).where(
            FeedbackVote.item_id == item_id,
            FeedbackVote.user_id == vote.user_id
        )
    )
    existing_vote = existing_vote_result.scalar_one_or_none()

    if existing_vote:
        if existing_vote.vote_type == vote.vote_type:
            # Remove vote (toggle off)
            await db.execute(
                delete(FeedbackVote).where(FeedbackVote.id == existing_vote.id)
            )
            vote_delta = -1 if vote.vote_type == "up" else 1
        else:
            # Change vote direction
            existing_vote.vote_type = vote.vote_type
            vote_delta = 2 if vote.vote_type == "up" else -2
    else:
        # New vote
        new_vote = FeedbackVote(
            item_id=item_id,
            user_id=vote.user_id,
            vote_type=vote.vote_type
        )
        db.add(new_vote)
        vote_delta = 1 if vote.vote_type == "up" else -1

    item.vote_count += vote_delta
    await _recalculate_rank_score(item)
    await db.commit()

    return {"vote_count": item.vote_count, "user_voted": vote.vote_type if not existing_vote or existing_vote.vote_type != vote.vote_type else None}


@router.get("/{item_id}/comments", response_model=List[FeedbackCommentResponse])
async def get_comments(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all comments for a feedback item."""
    result = await db.execute(
        select(FeedbackComment)
        .where(FeedbackComment.item_id == item_id)
        .order_by(FeedbackComment.created_at.asc())
    )
    return result.scalars().all()


@router.post("/{item_id}/comments", response_model=FeedbackCommentResponse)
async def add_comment(
    item_id: UUID,
    comment: FeedbackCommentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a comment to a feedback item."""
    # Check item exists
    item_result = await db.execute(
        select(FeedbackItem).where(FeedbackItem.id == item_id)
    )
    if not item_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Item not found")

    db_comment = FeedbackComment(
        item_id=item_id,
        user_id=comment.user_id,
        x_handle=comment.x_handle,
        content=comment.content,
        is_product_owner=comment.is_product_owner
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)

    return db_comment


async def _award_credits(
    db: AsyncSession,
    user_id: str,
    item_id: UUID,
    amount: int,
    transaction_type: str,
    description: str
):
    """Award credits to a user."""
    transaction = CreditTransaction(
        user_id=user_id,
        item_id=item_id,
        amount=amount,
        transaction_type=transaction_type,
        description=description
    )
    db.add(transaction)

    # Update user balance
    user_result = await db.execute(
        select(UserCredits).where(UserCredits.user_id == user_id)
    )
    user_credits = user_result.scalar_one_or_none()
    if user_credits:
        user_credits.credits_balance += amount
        user_credits.credits_earned_total += amount
    else:
        user_credits = UserCredits(
            user_id=user_id,
            credits_balance=amount,
            credits_earned_total=amount
        )
        db.add(user_credits)


async def _update_user_stats(
    db: AsyncSession,
    user_id: str,
    x_handle: Optional[str],
    items_submitted_delta: int = 0,
    items_developed_delta: int = 0
):
    """Update user statistics."""
    user_result = await db.execute(
        select(UserCredits).where(UserCredits.user_id == user_id)
    )
    user_credits = user_result.scalar_one_or_none()
    if user_credits:
        user_credits.items_submitted += items_submitted_delta
        user_credits.items_developed += items_developed_delta
        if x_handle:
            user_credits.x_handle = x_handle
    else:
        user_credits = UserCredits(
            user_id=user_id,
            x_handle=x_handle,
            items_submitted=items_submitted_delta,
            items_developed=items_developed_delta
        )
        db.add(user_credits)


async def _recalculate_rank_score(item: FeedbackItem):
    """Recalculate the rank score for an item."""
    # Simple rank calculation based on votes and recency
    days_old = (datetime.utcnow() - item.created_at.replace(tzinfo=None)).days if item.created_at else 0
    recency_factor = max(0, 1.0 - (days_old * 0.1 / 7))  # Decay by 0.1 per week

    vote_score = item.vote_count * 1.0
    ai_score = 0
    if item.ai_feasibility_score:
        ai_score += item.ai_feasibility_score * 0.3
    if item.ai_impact_score:
        ai_score += item.ai_impact_score * 0.4
    if item.ai_clarity_score:
        ai_score += item.ai_clarity_score * 0.2

    item.rank_score = vote_score + (recency_factor * 0.5) + ai_score
