from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class RankingAlgorithmResponse(BaseModel):
    id: UUID
    version: str
    prompt_content: str
    weight_votes: float
    weight_recency: float
    weight_feasibility: float
    weight_impact: float
    weight_clarity: float
    is_active: bool
    github_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
