from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class UserCredits(Base):
    __tablename__ = "user_credits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), unique=True, nullable=False)
    x_handle = Column(String(50))
    credits_balance = Column(Integer, default=0)
    credits_earned_total = Column(Integer, default=0)
    items_submitted = Column(Integer, default=0)
    items_developed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), nullable=False)
    item_id = Column(UUID(as_uuid=True), ForeignKey("feedback_items.id", ondelete="SET NULL"))
    amount = Column(Integer, nullable=False)
    transaction_type = Column(String(30), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("transaction_type IN ('submission', 'top_ranked', 'developed', 'bonus', 'bug_verified')", name="check_transaction_type"),
    )
