from sqlalchemy import Column, String, Text, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class RankingAlgorithm(Base):
    __tablename__ = "ranking_algorithms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(String(20), nullable=False)
    prompt_content = Column(Text, nullable=False)
    weight_votes = Column(Float, default=1.0)
    weight_recency = Column(Float, default=0.5)
    weight_feasibility = Column(Float, default=0.3)
    weight_impact = Column(Float, default=0.4)
    weight_clarity = Column(Float, default=0.2)
    is_active = Column(Boolean, default=False)
    github_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
