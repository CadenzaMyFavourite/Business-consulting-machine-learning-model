from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[int] = 3
    due_date: Optional[datetime] = None


class TaskRead(TaskCreate):
    id: int
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ModelInput(BaseModel):
    customers: int
    repeat_rate: float
    avg_age: float
    social_engagement: float
