"""
Patients API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from beanie import PydanticObjectId
from datetime import datetime

from src.models.patient import Patient, PersonalInfo, Contact, Address

router = APIRouter()


@router.get("/", response_model=List[Patient])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, CPF, or phone"),
    status: Optional[str] = Query(None, description="Filter by status"),
    neighborhood: Optional[str] = Query(None, description="Filter by neighborhood"),
    risk_score: Optional[str] = Query(None, description="Filter by risk score")
):
    """
    List patients with pagination and filters
    """
    # Build query
    query_filter = {}
    
    if status:
        query_filter["status"] = status
    
    if neighborhood:
        query_filter["address.neighborhood"] = {"$regex": neighborhood, "$options": "i"}
    
    if risk_score:
        query_filter["analytics.risk_score"] = risk_score
    
    # Search across multiple fields
    if search:
        query_filter["$or"] = [
            {"personal_info.name": {"$regex": search, "$options": "i"}},
            {"personal_info.cpf": search.replace(".", "").replace("-", "")},
            {"contacts.value": {"$regex": search.replace(" ", "").replace("-", ""), "$options": "i"}}
        ]
    
    # Execute query
    patients = await Patient.find(query_filter).skip(skip).limit(limit).to_list()
    
    return patients


@router.post("/", response_model=Patient)
async def create_patient(patient_data: Patient):
    """
    Create a new patient
    """
    # Check if CPF already exists
    existing = await Patient.find_one({"personal_info.cpf": patient_data.personal_info.cpf})
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this CPF already exists")
    
    # Create patient
    patient = await patient_data.create()
    return patient


@router.get("/{patient_id}", response_model=Patient)
async def get_patient(patient_id: PydanticObjectId):
    """
    Get patient by ID
    """
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient


@router.put("/{patient_id}", response_model=Patient)
async def update_patient(patient_id: PydanticObjectId, patient_data: dict = Body(...)):
    """
    Update patient information
    """
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update fields
    patient_data["updated_at"] = datetime.utcnow()
    await patient.update({"$set": patient_data})
    
    # Refresh from database
    await patient.sync()
    return patient


@router.delete("/{patient_id}")
async def delete_patient(patient_id: PydanticObjectId):
    """
    Delete patient (soft delete by changing status)
    """
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Soft delete
    patient.status = "inactive"
    patient.updated_at = datetime.utcnow()
    await patient.save()
    
    return {"message": "Patient deactivated successfully"}


@router.get("/{patient_id}/history")
async def get_patient_history(patient_id: PydanticObjectId):
    """
    Get patient collection history
    """
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "patient_id": str(patient_id),
        "patient_name": patient.personal_info.name,
        "total_collections": len(patient.collection_history),
        "history": patient.collection_history
    }


@router.post("/{patient_id}/confirm")
async def add_confirmation_attempt(
    patient_id: PydanticObjectId,
    attempt_data: dict = Body(...)
):
    """
    Add confirmation attempt for patient
    """
    patient = await Patient.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Add confirmation attempt
    attempt_data["date"] = datetime.utcnow()
    patient.confirmation_attempts.append(attempt_data)
    
    # Update confirmation rate
    confirmed = sum(1 for a in patient.confirmation_attempts if a.get("status") == "confirmed")
    patient.confirmation_rate = confirmed / len(patient.confirmation_attempts) if patient.confirmation_attempts else 0
    
    patient.updated_at = datetime.utcnow()
    await patient.save()
    
    return {"message": "Confirmation attempt added", "confirmation_rate": patient.confirmation_rate}