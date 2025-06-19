"""
Analytics API endpoints
"""
from fastapi import APIRouter, Query
from datetime import datetime, date, timedelta
from typing import Optional

from src.models.patient import Patient
from src.models.appointment import Appointment
from src.models.car import Car

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_metrics():
    """
    Get main dashboard KPIs
    """
    today = datetime.combine(date.today(), datetime.min.time())
    tomorrow = today + timedelta(days=1)
    
    # Today's appointments
    today_appointments = await Appointment.count_documents({
        "scheduled_date": {"$gte": today, "$lt": tomorrow}
    })
    
    # Confirmation rate (last 30 days)
    last_30_days = today - timedelta(days=30)
    recent_appointments = await Appointment.find({
        "scheduled_date": {"$gte": last_30_days}
    }).to_list()
    
    confirmed = sum(1 for apt in recent_appointments if apt.confirmation.status == "confirmed")
    confirmation_rate = confirmed / len(recent_appointments) if recent_appointments else 0
    
    # Active cars
    active_cars = await Car.count_documents({"active": True})
    
    # Average collection time
    completed_appointments = [apt for apt in recent_appointments if apt.status == "completed"]
    avg_time = sum(apt.duration for apt in completed_appointments) / len(completed_appointments) if completed_appointments else 0
    
    return {
        "visits_today": today_appointments,
        "confirmation_rate": round(confirmation_rate * 100, 1),
        "active_cars": active_cars,
        "average_time": round(avg_time, 0)
    }


@router.get("/patients")
async def get_patient_analytics(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None)
):
    """
    Get patient analytics
    """
    # Total patients
    total_patients = await Patient.count_documents({"status": "active"})
    
    # New patients this month
    month_start = datetime.combine(date.today().replace(day=1), datetime.min.time())
    new_patients = await Patient.count_documents({
        "created_at": {"$gte": month_start}
    })
    
    # Risk distribution
    risk_distribution = await Patient.aggregate([
        {"$match": {"status": "active"}},
        {"$group": {
            "_id": "$analytics.risk_score",
            "count": {"$sum": 1}
        }}
    ]).to_list()
    
    # Top neighborhoods
    neighborhoods = await Patient.aggregate([
        {"$match": {"status": "active"}},
        {"$group": {
            "_id": "$address.neighborhood",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]).to_list()
    
    return {
        "total_patients": total_patients,
        "new_patients_this_month": new_patients,
        "risk_distribution": {item["_id"]: item["count"] for item in risk_distribution},
        "top_neighborhoods": [
            {"neighborhood": item["_id"], "count": item["count"]} 
            for item in neighborhoods if item["_id"]
        ]
    }


@router.get("/schedule")
async def get_schedule_analytics(
    date_from: date = Query(...),
    date_to: date = Query(...)
):
    """
    Get schedule analytics for date range
    """
    start = datetime.combine(date_from, datetime.min.time())
    end = datetime.combine(date_to, datetime.max.time())
    
    appointments = await Appointment.find({
        "scheduled_date": {"$gte": start, "$lte": end}
    }).to_list()
    
    # Status distribution
    status_dist = {}
    for apt in appointments:
        status_dist[apt.status] = status_dist.get(apt.status, 0) + 1
    
    # Car utilization
    cars = await Car.find({"active": True}).to_list()
    car_utilization = {}
    
    for car in cars:
        car_appointments = [apt for apt in appointments if apt.car_id == str(car.id)]
        days_in_range = (date_to - date_from).days + 1
        utilization = len(car_appointments) / (car.capacity * days_in_range) if days_in_range > 0 else 0
        
        car_utilization[car.name] = {
            "appointments": len(car_appointments),
            "capacity": car.capacity * days_in_range,
            "utilization_rate": round(utilization * 100, 1)
        }
    
    # Time slot distribution
    time_slots = {}
    for apt in appointments:
        hour = apt.time_slot.split(":")[0]
        time_slots[f"{hour}:00"] = time_slots.get(f"{hour}:00", 0) + 1
    
    return {
        "date_range": {
            "from": date_from.isoformat(),
            "to": date_to.isoformat()
        },
        "total_appointments": len(appointments),
        "status_distribution": status_dist,
        "car_utilization": car_utilization,
        "time_slot_distribution": dict(sorted(time_slots.items()))
    }


@router.get("/confirmations")
async def get_confirmation_analytics():
    """
    Get confirmation analytics
    """
    # Get recent appointments
    last_30_days = datetime.utcnow() - timedelta(days=30)
    
    # Confirmation by method
    confirmations = await Appointment.aggregate([
        {"$match": {
            "scheduled_date": {"$gte": last_30_days},
            "confirmation.status": "confirmed"
        }},
        {"$group": {
            "_id": "$confirmation.method",
            "count": {"$sum": 1}
        }}
    ]).to_list()
    
    # Confirmation by time of day
    time_distribution = await Appointment.aggregate([
        {"$match": {
            "scheduled_date": {"$gte": last_30_days},
            "confirmation.status": "confirmed"
        }},
        {"$group": {
            "_id": {"$hour": "$confirmation.confirmed_at"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]).to_list()
    
    return {
        "confirmation_by_method": {
            item["_id"]: item["count"] for item in confirmations if item["_id"]
        },
        "confirmation_by_hour": {
            f"{item['_id']:02d}:00": item["count"] for item in time_distribution
        }
    }