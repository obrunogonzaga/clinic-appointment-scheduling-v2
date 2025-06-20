#!/usr/bin/env python3

"""
Seed database with sample data
Usage: python seed.py [--records=100] [--clean]
"""

import asyncio
import random
import sys
import os
from datetime import datetime, timedelta, date
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from faker import Faker
from bson import ObjectId
import click

# Initialize Faker for Brazilian Portuguese
fake = Faker('pt_BR')

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin")
DB_NAME = "lab_scheduler"

# Sample data
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
MEDICAL_CONDITIONS = [
    "Diabetes", "Hipertensão", "Asma", "Artrite", "Tireoide",
    "Colesterol Alto", "Anemia", "Obesidade", "Depressão", "Ansiedade"
]
ALLERGIES = [
    "Penicilina", "Dipirona", "Látex", "Poeira", "Polen",
    "Frutos do Mar", "Lactose", "Glúten", "Amendoim", "Ovo"
]
SERVICE_TYPES = ["consultation", "exam", "collection", "procedure"]
EXAM_TYPES = [
    "Hemograma Completo", "Glicemia", "Colesterol Total", "Triglicerídeos",
    "TSH", "T4 Livre", "Creatinina", "Ureia", "TGO", "TGP",
    "Urina Tipo 1", "Urocultura", "PSA", "Beta HCG"
]

class DatabaseSeeder:
    def __init__(self, records=100, clean=False):
        self.records = records
        self.clean = clean
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[DB_NAME]
        
    async def clean_database(self):
        """Remove all existing data"""
        click.echo(click.style("🗑️  Cleaning existing data...", fg="yellow"))
        collections = await self.db.list_collection_names()
        for collection in collections:
            if collection != "users":  # Keep users
                await self.db[collection].delete_many({})
        click.echo(click.style("✓ Database cleaned", fg="green"))
        
    async def seed_users(self):
        """Create system users"""
        click.echo(click.style("👥 Creating users...", fg="cyan"))
        
        users = [
            {
                "_id": ObjectId(),
                "username": "admin",
                "email": "admin@clinic.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH8Q4J8jJS",  # admin123
                "first_name": "Admin",
                "last_name": "Sistema",
                "role": "admin",
                "status": "active",
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "username": "operador",
                "email": "operador@clinic.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH8Q4J8jJS",  # admin123
                "first_name": "João",
                "last_name": "Operador",
                "role": "operator",
                "status": "active",
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "username": "motorista",
                "email": "motorista@clinic.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGH8Q4J8jJS",  # admin123
                "first_name": "Carlos",
                "last_name": "Motorista",
                "role": "driver",
                "status": "active",
                "created_at": datetime.utcnow()
            }
        ]
        
        await self.db.users.insert_many(users)
        click.echo(click.style("✓ Created 3 users", fg="green"))
        
    async def seed_patients(self):
        """Create sample patients"""
        click.echo(click.style(f"👨‍👩‍👧‍👦 Creating {self.records} patients...", fg="cyan"))
        
        patients = []
        for i in range(self.records):
            # Generate realistic Brazilian data
            first_name = fake.first_name()
            last_name = fake.last_name()
            
            patient = {
                "_id": ObjectId(),
                "patient_code": f"PAT-2024-{str(i+1).zfill(5)}",
                "first_name": first_name,
                "last_name": last_name,
                "date_of_birth": fake.date_of_birth(minimum_age=1, maximum_age=90),
                "gender": random.choice(["M", "F", "O"]),
                "cpf": fake.cpf(),
                "rg": fake.rg(),
                "email": fake.email(),
                "phone": fake.cellphone_number(),
                "whatsapp": fake.cellphone_number() if random.random() > 0.3 else None,
                "preferred_contact": random.choice(["phone", "whatsapp", "email", "sms"]),
                "address": {
                    "street": fake.street_name(),
                    "number": fake.building_number(),
                    "complement": fake.secondary_address() if random.random() > 0.5 else None,
                    "neighborhood": fake.neighborhood(),
                    "city": fake.city(),
                    "state": fake.state_abbr(),
                    "zip_code": fake.postcode(),
                    "coordinates": {
                        "lat": float(fake.latitude()),
                        "lng": float(fake.longitude())
                    }
                },
                "blood_type": random.choice(BLOOD_TYPES) if random.random() > 0.3 else None,
                "allergies": random.sample(ALLERGIES, random.randint(0, 3)),
                "medications": [fake.word() for _ in range(random.randint(0, 2))],
                "medical_conditions": random.sample(MEDICAL_CONDITIONS, random.randint(0, 3)),
                "medical_notes": fake.text(max_nb_chars=200) if random.random() > 0.7 else None,
                "emergency_contact": {
                    "name": fake.name(),
                    "relationship": random.choice(["Cônjuge", "Filho(a)", "Pai", "Mãe", "Irmão(ã)", "Amigo(a)"]),
                    "phone": fake.cellphone_number()
                },
                "status": random.choice(["active"] * 95 + ["inactive"] * 4 + ["blocked"]),
                "tags": random.sample(["VIP", "Idoso", "Gestante", "Criança", "Prioritário"], random.randint(0, 2)),
                "created_at": fake.date_time_between(start_date="-1y", end_date="now"),
                "updated_at": datetime.utcnow()
            }
            
            # Add insurance for some patients
            if random.random() > 0.4:
                patient["insurance"] = {
                    "provider": random.choice(["Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro"]),
                    "plan": random.choice(["Basic", "Standard", "Premium"]),
                    "number": fake.numerify("############"),
                    "valid_until": fake.date_between(start_date="today", end_date="+2y")
                }
            
            patients.append(patient)
            
            if (i + 1) % 10 == 0:
                click.echo(f"  Created {i + 1} patients...", nl=False)
                click.echo("\r", nl=False)
        
        await self.db.patients.insert_many(patients)
        click.echo(click.style(f"✓ Created {self.records} patients", fg="green"))
        return patients
    
    async def seed_appointments(self, patients):
        """Create sample appointments"""
        click.echo(click.style(f"📅 Creating appointments...", fg="cyan"))
        
        appointments = []
        appointment_count = 0
        
        # Create appointments for 60% of patients
        for patient in random.sample(patients, int(len(patients) * 0.6)):
            # Each patient has 1-5 appointments
            for _ in range(random.randint(1, 5)):
                appointment_date = fake.date_between(start_date="-30d", end_date="+60d")
                appointment_time = fake.time_object()
                
                appointment = {
                    "_id": ObjectId(),
                    "appointment_code": f"APT-{appointment_date.strftime('%Y-%m')}-{str(appointment_count+1).zfill(6)}",
                    "patient_id": str(patient["_id"]),
                    "provider_id": str(ObjectId()),  # Would reference provider collection
                    "service_type": random.choice(SERVICE_TYPES),
                    "date": appointment_date,
                    "time_slot": appointment_time.strftime("%H:%M"),
                    "duration_minutes": random.choice([15, 30, 45, 60]),
                    "location_type": random.choice(["clinic"] * 80 + ["home"] * 15 + ["mobile"] * 5),
                    "location": {
                        "name": "Clínica Central" if random.random() > 0.3 else "Clínica Sul",
                        "address": patient["address"] if random.random() > 0.8 else None,
                        "room": f"Sala {random.randint(1, 20)}"
                    },
                    "status": self._get_appointment_status(appointment_date),
                    "confirmation_status": random.choice(["confirmed"] * 70 + ["pending"] * 25 + ["failed"] * 5),
                    "created_at": fake.date_time_between(start_date="-60d", end_date="now"),
                    "updated_at": datetime.utcnow()
                }
                
                # Add collection data for collection appointments
                if appointment["service_type"] == "collection":
                    appointment["collection_data"] = {
                        "tests_requested": random.sample(EXAM_TYPES, random.randint(1, 4)),
                        "fasting_required": random.choice([True, False]),
                        "special_instructions": "Jejum de 12 horas" if random.random() > 0.5 else None
                    }
                
                appointments.append(appointment)
                appointment_count += 1
        
        await self.db.appointments.insert_many(appointments)
        click.echo(click.style(f"✓ Created {len(appointments)} appointments", fg="green"))
        
    async def seed_cars(self):
        """Create sample collection vehicles"""
        click.echo(click.style("🚗 Creating collection vehicles...", fg="cyan"))
        
        cars = [
            {
                "_id": ObjectId(),
                "vehicle_code": "VEH-001",
                "license_plate": "ABC-1234",
                "make": "Volkswagen",
                "model": "Saveiro",
                "year": 2022,
                "color": "Branco",
                "capacity": {
                    "max_stops": 20,
                    "storage_boxes": 4,
                    "refrigerated": True
                },
                "status": "active",
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "vehicle_code": "VEH-002",
                "license_plate": "XYZ-5678",
                "make": "Fiat",
                "model": "Fiorino",
                "year": 2021,
                "color": "Prata",
                "capacity": {
                    "max_stops": 15,
                    "storage_boxes": 3,
                    "refrigerated": True
                },
                "status": "active",
                "created_at": datetime.utcnow()
            }
        ]
        
        await self.db.cars.insert_many(cars)
        click.echo(click.style("✓ Created 2 collection vehicles", fg="green"))
        
    def _get_appointment_status(self, appointment_date):
        """Determine appointment status based on date"""
        today = date.today()
        if appointment_date < today:
            return random.choice(["completed"] * 70 + ["no_show"] * 20 + ["cancelled"] * 10)
        elif appointment_date == today:
            return random.choice(["scheduled", "confirmed", "arrived", "in_progress"])
        else:
            return random.choice(["scheduled"] * 60 + ["confirmed"] * 35 + ["cancelled"] * 5)
    
    async def create_indexes(self):
        """Create database indexes"""
        click.echo(click.style("📇 Creating indexes...", fg="cyan"))
        
        # Patient indexes
        await self.db.patients.create_index("patient_code", unique=True)
        await self.db.patients.create_index("cpf", unique=True)
        await self.db.patients.create_index("email")
        await self.db.patients.create_index("phone")
        await self.db.patients.create_index([("last_name", 1), ("first_name", 1)])
        
        # Appointment indexes
        await self.db.appointments.create_index("appointment_code", unique=True)
        await self.db.appointments.create_index("patient_id")
        await self.db.appointments.create_index([("date", 1), ("status", 1)])
        
        # User indexes
        await self.db.users.create_index("username", unique=True)
        await self.db.users.create_index("email", unique=True)
        
        click.echo(click.style("✓ Indexes created", fg="green"))
    
    async def run(self):
        """Run the seeding process"""
        try:
            await self.connect()
            
            if self.clean:
                await self.clean_database()
            
            await self.create_indexes()
            await self.seed_users()
            patients = await self.seed_patients()
            await self.seed_appointments(patients)
            await self.seed_cars()
            
            # Print summary
            click.echo("\n" + "="*50)
            click.echo(click.style("✅ Database seeding completed!", fg="green", bold=True))
            click.echo("="*50)
            click.echo("\n📊 Summary:")
            click.echo(f"  • Patients: {await self.db.patients.count_documents({})}")
            click.echo(f"  • Appointments: {await self.db.appointments.count_documents({})}")
            click.echo(f"  • Users: {await self.db.users.count_documents({})}")
            click.echo(f"  • Vehicles: {await self.db.cars.count_documents({})}")
            
            click.echo("\n🔑 Login credentials:")
            click.echo("  • Admin: admin@clinic.com / admin123")
            click.echo("  • Operator: operador@clinic.com / admin123")
            click.echo("  • Driver: motorista@clinic.com / admin123")
            
        except Exception as e:
            click.echo(click.style(f"❌ Error: {str(e)}", fg="red"))
            sys.exit(1)
        finally:
            if self.client:
                self.client.close()

@click.command()
@click.option('--records', default=100, help='Number of patient records to create')
@click.option('--clean', is_flag=True, help='Clean existing data before seeding')
def main(records, clean):
    """Seed the database with sample data"""
    click.echo(click.style("🌱 Database Seeder", fg="green", bold=True))
    click.echo(f"Creating {records} patient records...")
    
    if clean:
        click.confirm("⚠️  This will delete all existing data. Continue?", abort=True)
    
    seeder = DatabaseSeeder(records=records, clean=clean)
    asyncio.run(seeder.run())

if __name__ == "__main__":
    main()