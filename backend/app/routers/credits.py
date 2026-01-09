from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.credits import UserCredits, CreditTransaction
from app.schemas.credits import UserCreditsResponse, CreditTransactionResponse

router = APIRouter(prefix="/api/credits", tags=["credits"])


@router.get("/balance", response_model=UserCreditsResponse)
async def get_credit_balance(
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Get credit balance for a user."""
    result = await db.execute(
        select(UserCredits).where(UserCredits.user_id == user_id)
    )
    user_credits = result.scalar_one_or_none()
    if not user_credits:
        raise HTTPException(status_code=404, detail="User not found")
    return user_credits


@router.get("/history", response_model=List[CreditTransactionResponse])
async def get_credit_history(
    user_id: str = Query(...),
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Get credit transaction history for a user."""
    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == user_id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/leaderboard", response_model=List[UserCreditsResponse])
async def get_leaderboard(
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get top contributors by credits earned."""
    result = await db.execute(
        select(UserCredits)
        .order_by(UserCredits.credits_earned_total.desc())
        .limit(limit)
    )
    return result.scalars().all()
