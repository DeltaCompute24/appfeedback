from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class FeedbackItem(Base):
    __tablename__ = "feedback_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_type = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    user_id = Column(String(100), nullable=False)
    x_handle = Column(String(50))
    status = Column(String(30), default="new")
    vote_count = Column(Integer, default=0)
    rank_score = Column(Float, default=0)
    ai_feasibility_score = Column(Float)
    ai_impact_score = Column(Float)
    ai_clarity_score = Column(Float)
    po_notes = Column(Text)
    credits_awarded = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    votes = relationship("FeedbackVote", back_populates="item", cascade="all, delete-orphan")
    comments = relationship("FeedbackComment", back_populates="item", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("item_type IN ('wishlist', 'bug')", name="check_item_type"),
        CheckConstraint("status IN ('new', 'under_review', 'planned', 'in_progress', 'completed', 'wont_do')", name="check_status"),
    )


class FeedbackVote(Base):
    __tablename__ = "feedback_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("feedback_items.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(100), nullable=False)
    vote_type = Column(String(10), default="up")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("FeedbackItem", back_populates="votes")

    __table_args__ = (
        CheckConstraint("vote_type IN ('up', 'down')", name="check_vote_type"),
    )


class FeedbackComment(Base):
    __tablename__ = "feedback_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("feedback_items.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(100), nullable=False)
    x_handle = Column(String(50))
    content = Column(Text, nullable=False)
    is_product_owner = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("FeedbackItem", back_populates="comments")
