"""
Schedule API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body, UploadFile, File
from beanie import PydanticObjectId
from datetime import datetime, date
import pandas as pd
import io

from src.models.appointment import Appointment
from src.models.patient import Patient
from src.models.car import Car

router = APIRouter()


@router.get("/", response_model=List[Appointment])
async def list_appointments(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    car_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
):
    """
    List appointments with filters
    """
    query_filter = {}
    
    # Date range filter
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = datetime.combine(date_from, datetime.min.time())
        if date_to:
            date_filter["$lte"] = datetime.combine(date_to, datetime.max.time())
        query_filter["scheduled_date"] = date_filter
    
    if car_id:
        query_filter["car_id"] = car_id
    
    if status:
        query_filter["status"] = status
    
    appointments = await Appointment.find(query_filter).skip(skip).limit(limit).to_list()
    return appointments


@router.get("/calendar")
async def get_calendar_view(
    date: date = Query(..., description="Date to view schedule"),
    car_ids: Optional[List[str]] = Query(None)
):
    """
    Get calendar view for specific date
    """
    # Get appointments for the date
    start = datetime.combine(date, datetime.min.time())
    end = datetime.combine(date, datetime.max.time())
    
    query_filter = {"scheduled_date": {"$gte": start, "$lte": end}}
    if car_ids:
        query_filter["car_id"] = {"$in": car_ids}
    
    appointments = await Appointment.find(query_filter).to_list()
    
    # Get cars
    cars = await Car.find({"active": True}).to_list()
    
    # Organize by car
    calendar = {}
    for car in cars:
        car_appointments = [apt for apt in appointments if apt.car_id == str(car.id)]
        calendar[car.name] = {
            "car_id": str(car.id),
            "driver": car.driver.name,
            "appointments": car_appointments,
            "total": len(car_appointments),
            "capacity": car.capacity
        }
    
    return {
        "date": date.isoformat(),
        "total_appointments": len(appointments),
        "cars": calendar
    }


@router.post("/", response_model=Appointment)
async def create_appointment(appointment_data: Appointment):
    """
    Create a new appointment
    """
    # Validate patient exists
    patient = await Patient.get(appointment_data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate car exists
    car = await Car.get(appointment_data.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Check for conflicts
    existing = await Appointment.find_one({
        "car_id": appointment_data.car_id,
        "scheduled_date": appointment_data.scheduled_date,
        "time_slot": appointment_data.time_slot,
        "status": {"$nin": ["cancelled", "no_show"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already occupied")
    
    # Create appointment
    appointment = await appointment_data.create()
    return appointment


@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: PydanticObjectId, update_data: dict = Body(...)):
    """
    Update appointment (reschedule, change status, etc.)
    """
    appointment = await Appointment.get(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If rescheduling, check conflicts
    if "time_slot" in update_data or "scheduled_date" in update_data:
        new_date = update_data.get("scheduled_date", appointment.scheduled_date)
        new_time = update_data.get("time_slot", appointment.time_slot)
        new_car = update_data.get("car_id", appointment.car_id)
        
        conflict = await Appointment.find_one({
            "_id": {"$ne": appointment_id},
            "car_id": new_car,
            "scheduled_date": new_date,
            "time_slot": new_time,
            "status": {"$nin": ["cancelled", "no_show"]}
        })
        
        if conflict:
            raise HTTPException(status_code=400, detail="Time slot already occupied")
    
    # Update
    update_data["updated_at"] = datetime.utcnow()
    await appointment.update({"$set": update_data})
    await appointment.sync()
    
    return appointment


@router.post("/upload")
async def upload_schedule(file: UploadFile = File(...)):
    """
    Upload Excel/CSV file and process schedule
    """
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload Excel or CSV file")
    
    try:
        # Read file
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Process the dataframe (this is a simplified version)
        # In production, you'd port the JavaScript fileProcessor logic here
        
        processed_count = 0
        errors = []
        
        # Example processing (you'd implement the full logic)
        for idx, row in df.iterrows():
            try:
                # Extract data from row
                # Create patient if not exists
                # Create appointment
                processed_count += 1
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "processed": processed_count,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


@router.post("/{appointment_id}/confirm")
async def confirm_appointment(appointment_id: PydanticObjectId, confirmation_data: dict = Body(...)):
    """
    Confirm an appointment
    """
    appointment = await Appointment.get(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Update confirmation
    appointment.confirmation.status = "confirmed"
    appointment.confirmation.confirmed_at = datetime.utcnow()
    appointment.confirmation.confirmed_by = confirmation_data.get("confirmed_by")
    appointment.confirmation.method = confirmation_data.get("method")
    
    appointment.updated_at = datetime.utcnow()
    await appointment.save()
    
    return {"message": "Appointment confirmed", "appointment_id": str(appointment_id)}