"""
Patient model for MongoDB with Beanie ODM
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from beanie import Document, Indexed
from pydantic import BaseModel, Field, EmailStr


class Contact(BaseModel):
    """Contact information"""
    type: str = Field(..., description="Contact type: mobile, home, work")
    value: str = Field(..., description="Contact value")
    primary: bool = Field(default=False, description="Is primary contact")


class Address(BaseModel):
    """Patient address"""
    street: str
    neighborhood: str
    city: str
    state: str = "RJ"
    zip_code: Optional[str] = None
    coordinates: Optional[List[float]] = Field(None, description="[longitude, latitude]")
    access_notes: Optional[str] = Field(None, description="Special access instructions")


class HealthPlan(BaseModel):
    """Health insurance plan"""
    provider: str
    card_number: str
    plan_type: Optional[str] = None
    coverage: List[str] = Field(default_factory=list)
    authorization_required: bool = False
    copay: float = 0.0


class PersonalInfo(BaseModel):
    """Personal information"""
    name: str = Field(..., min_length=2)
    cpf: Indexed(str, unique=True)
    birth_date: datetime
    gender: Optional[str] = Field(None, pattern="^[MF]$")
    email: Optional[EmailStr] = None


class Preferences(BaseModel):
    """Patient preferences"""
    preferred_times: List[str] = Field(default_factory=list)
    special_requirements: Optional[str] = None
    accessibility_needs: bool = False
    preferred_driver: Optional[str] = None
    fasting_exams: bool = True
    home_access_difficulty: str = Field(default="easy", pattern="^(easy|moderate|difficult)$")


class ConfirmationAttempt(BaseModel):
    """Confirmation attempt record"""
    date: datetime
    method: str
    status: str
    operator: Optional[str] = None
    notes: Optional[str] = None


class CollectionRecord(BaseModel):
    """Collection history record"""
    id: str
    date: datetime
    time: str
    car: str
    driver: str
    status: str
    exams: List[str]
    duration: int
    confirmation_timestamp: Optional[datetime] = None
    completion_timestamp: Optional[datetime] = None
    notes: Optional[str] = None


class Analytics(BaseModel):
    """Patient analytics data"""
    frequency: str = Field(default="occasional", pattern="^(occasional|regular|frequent)$")
    seasonal_pattern: Optional[str] = None
    no_show_rate: float = 0.0
    reschedule_rate: float = 0.0
    average_exams_per_visit: float = 0.0
    total_collections: int = 0
    last_collection_date: Optional[datetime] = None
    next_scheduled_date: Optional[datetime] = None
    risk_score: str = Field(default="low", pattern="^(low|medium|high)$")


class Patient(Document):
    """Patient document model"""
    personal_info: PersonalInfo
    contacts: List[Contact] = Field(default_factory=list)
    address: Address
    health_plan: Optional[HealthPlan] = None
    preferences: Preferences = Field(default_factory=Preferences)
    tags: List[str] = Field(default_factory=list)
    status: str = Field(default="active", pattern="^(active|inactive|deceased|moved)$")
    
    # Collection history
    collection_history: List[CollectionRecord] = Field(default_factory=list)
    
    # Confirmation tracking
    confirmation_attempts: List[ConfirmationAttempt] = Field(default_factory=list)
    confirmation_rate: float = Field(default=0.0, ge=0, le=1)
    
    # Analytics
    analytics: Analytics = Field(default_factory=Analytics)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = None
    
    class Settings:
        name = "patients"
        indexes = [
            "personal_info.cpf",
            "personal_info.name",
            "status",
            "tags",
            "address.neighborhood",
            "analytics.risk_score"
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "personal_info": {
                    "name": "Ana Costa Silva",
                    "cpf": "12345678901",
                    "birth_date": "1985-03-15T00:00:00",
                    "gender": "F",
                    "email": "ana.costa@email.com"
                },
                "contacts": [
                    {
                        "type": "mobile",
                        "value": "21987654321",
                        "primary": True
                    }
                ],
                "address": {
                    "street": "Rua das Palmeiras, 230",
                    "neighborhood": "Recreio dos Bandeirantes",
                    "city": "Rio de Janeiro",
                    "state": "RJ"
                }
            }
        }