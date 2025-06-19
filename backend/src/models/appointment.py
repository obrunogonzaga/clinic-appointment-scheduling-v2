"""
Appointment model for MongoDB with Beanie ODM
"""
from datetime import datetime
from typing import List, Optional
from beanie import Document, Link, Indexed
from pydantic import BaseModel, Field


class Confirmation(BaseModel):
    """Appointment confirmation details"""
    status: str = Field(default="pending", pattern="^(pending|confirmed|cancelled|no_show)$")
    confirmed_at: Optional[datetime] = None
    confirmed_by: Optional[str] = None
    method: Optional[str] = None
    attempts: int = 0
    notes: Optional[str] = None


class Appointment(Document):
    """Appointment document model"""
    # References
    patient_id: Indexed(str)
    car_id: Indexed(str)
    
    # Schedule info
    scheduled_date: Indexed(datetime)
    time_slot: str = Field(..., description="Time in HH:MM format")
    duration: int = Field(..., ge=15, le=120, description="Duration in minutes")
    
    # Appointment details
    exams: List[str] = Field(default_factory=list)
    special_instructions: Optional[str] = None
    
    # Status
    status: str = Field(
        default="scheduled",
        pattern="^(scheduled|in_progress|completed|cancelled|no_show|rescheduled)$"
    )
    
    # Confirmation
    confirmation: Confirmation = Field(default_factory=Confirmation)
    
    # Collection details
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    collected_by: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "appointments"
        indexes = [
            "patient_id",
            "car_id",
            "scheduled_date",
            "status",
            [("scheduled_date", 1), ("car_id", 1)],  # Compound index
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "507f1f77bcf86cd799439011",
                "car_id": "507f1f77bcf86cd799439012",
                "scheduled_date": "2025-01-10T00:00:00",
                "time_slot": "08:00",
                "duration": 30,
                "exams": ["Hemograma", "Glicose"],
                "status": "scheduled",
                "confirmation": {
                    "status": "pending",
                    "attempts": 0
                }
            }
        }