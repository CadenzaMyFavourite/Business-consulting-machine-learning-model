from pydantic import BaseModel

class BusinessData(BaseModel):
    customers: int
    repeat_rate: float
    avg_age: float
    social_engagement: float
