"""
MongoDB connection and initialization
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from src.core.config import settings
from src.models.patient import Patient
from src.models.appointment import Appointment
from src.models.car import Car

# Global MongoDB client
motor_client: AsyncIOMotorClient = None


async def init_db():
    """Initialize MongoDB connection and Beanie ODM"""
    global motor_client
    
    # Create Motor client
    motor_client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # Initialize Beanie with document models
    await init_beanie(
        database=motor_client[settings.MONGODB_DB_NAME],
        document_models=[
            Patient,
            Appointment,
            Car,
        ]
    )
    
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")


async def close_db():
    """Close MongoDB connection"""
    global motor_client
    
    if motor_client:
        motor_client.close()
        print("Disconnected from MongoDB")