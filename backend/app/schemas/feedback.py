from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class FeedbackItemCreate(BaseModel):
    item_type: Literal["wishlist", "bug"]
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    user_id: str = Field(..., min_length=1, max_length=100)
    x_handle: Optional[str] = Field(None, max_length=50)


class FeedbackItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=20)
    status: Optional[Literal["new", "under_review", "planned", "in_progress", "completed", "wont_do"]] = None
    po_notes: Optional[str] = None


class FeedbackItemResponse(BaseModel):
    id: UUID
    item_type: str
    title: str
    description: str
    user_id: str
    x_handle: Optional[str]
    status: str
    vote_count: int
    rank_score: float
    ai_feasibility_score: Optional[float]
    ai_impact_score: Optional[float]
    ai_clarity_score: Optional[float]
    po_notes: Optional[str]
    credits_awarded: int
    created_at: datetime
    updated_at: datetime
    comment_count: Optional[int] = 0
    user_voted: Optional[str] = None

    class Config:
        from_attributes = True


class FeedbackVoteCreate(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=100)
    vote_type: Literal["up", "down"] = "up"


class FeedbackCommentCreate(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=100)
    x_handle: Optional[str] = Field(None, max_length=50)
    content: str = Field(..., min_length=1)
    is_product_owner: bool = False


class FeedbackCommentResponse(BaseModel):
    id: UUID
    item_id: UUID
    user_id: str
    x_handle: Optional[str]
    content: str
    is_product_owner: bool
    created_at: datetime

    class Config:
        from_attributes = True
