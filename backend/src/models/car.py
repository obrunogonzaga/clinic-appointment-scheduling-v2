"""
Car/Vehicle model for MongoDB with Beanie ODM
"""
from datetime import datetime, time
from typing import List, Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class Driver(BaseModel):
    """Driver information"""
    name: str
    phone: str
    license_number: Optional[str] = None
    active: bool = True


class WorkingHours(BaseModel):
    """Working hours for a car"""
    start_time: str = Field(default="07:00", description="Start time HH:MM")
    end_time: str = Field(default="18:00", description="End time HH:MM")
    break_start: Optional[str] = Field(None, description="Break start HH:MM")
    break_duration: int = Field(default=60, description="Break duration in minutes")


class Car(Document):
    """Car/Vehicle document model"""
    # Basic info
    name: Indexed(str, unique=True) = Field(..., description="Car identifier (e.g., CARRO 1)")
    license_plate: Optional[str] = None
    model: Optional[str] = None
    
    # Driver
    driver: Driver
    
    # Operational info
    capacity: int = Field(default=8, description="Max appointments per day")
    active: bool = True
    zones: List[str] = Field(default_factory=list, description="Service zones/neighborhoods")
    
    # Schedule
    working_hours: WorkingHours = Field(default_factory=WorkingHours)
    unavailable_dates: List[datetime] = Field(default_factory=list)
    
    # Statistics
    total_collections: int = 0
    average_collection_time: float = 0.0
    completion_rate: float = Field(default=1.0, ge=0, le=1)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_assignment: Optional[datetime] = None
    
    class Settings:
        name = "cars"
        indexes = [
            "name",
            "active",
            "zones",
            "driver.name"
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "CARRO 1",
                "license_plate": "ABC-1234",
                "model": "Fiat Uno",
                "driver": {
                    "name": "João Silva",
                    "phone": "21999887766",
                    "active": True
                },
                "capacity": 8,
                "active": True,
                "zones": ["Copacabana", "Ipanema", "Leblon"],
                "working_hours": {
                    "start_time": "07:00",
                    "end_time": "18:00",
                    "break_start": "12:00",
                    "break_duration": 60
                }
            }
        }