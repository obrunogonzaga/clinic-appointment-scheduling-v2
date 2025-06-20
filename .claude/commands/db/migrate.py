#!/usr/bin/env python3

"""
Database migration tool
Usage: python migrate.py [up|down|status] [--version=N]
"""

import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path
import click
from typing import List, Dict, Any

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin")
DB_NAME = "lab_scheduler"
MIGRATIONS_COLLECTION = "_migrations"

class Migration:
    """Base class for migrations"""
    
    def __init__(self, version: int, description: str):
        self.version = version
        self.description = description
        self.applied_at = None
        
    async def up(self, db):
        """Apply migration"""
        raise NotImplementedError
        
    async def down(self, db):
        """Rollback migration"""
        raise NotImplementedError

# Define migrations
class Migration001_AddPhoneIndex(Migration):
    def __init__(self):
        super().__init__(1, "Add index on patient phone numbers")
        
    async def up(self, db):
        await db.patients.create_index("phone")
        await db.patients.create_index("whatsapp")
        
    async def down(self, db):
        await db.patients.drop_index("phone_1")
        await db.patients.drop_index("whatsapp_1")

class Migration002_AddAppointmentStatusIndex(Migration):
    def __init__(self):
        super().__init__(2, "Add compound index for appointment queries")
        
    async def up(self, db):
        await db.appointments.create_index([
            ("date", 1),
            ("status", 1),
            ("provider_id", 1)
        ])
        
    async def down(self, db):
        await db.appointments.drop_index("date_1_status_1_provider_id_1")

class Migration003_AddPatientTags(Migration):
    def __init__(self):
        super().__init__(3, "Add tags field to patients")
        
    async def up(self, db):
        # Add tags field to all patients that don't have it
        await db.patients.update_many(
            {"tags": {"$exists": False}},
            {"$set": {"tags": []}}
        )
        
    async def down(self, db):
        # Remove tags field
        await db.patients.update_many(
            {},
            {"$unset": {"tags": ""}}
        )

class Migration004_AddCollectionHistory(Migration):
    def __init__(self):
        super().__init__(4, "Create collection_history collection")
        
    async def up(self, db):
        # Create collection with validation
        await db.create_collection("collection_history", 
            validator={
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["patient_id", "appointment_id", "collected_at"],
                    "properties": {
                        "patient_id": {"bsonType": "string"},
                        "appointment_id": {"bsonType": "string"},
                        "collected_at": {"bsonType": "date"},
                        "samples": {"bsonType": "array"}
                    }
                }
            }
        )
        
    async def down(self, db):
        await db.drop_collection("collection_history")

class Migration005_AddUserPreferences(Migration):
    def __init__(self):
        super().__init__(5, "Add preferences to users")
        
    async def up(self, db):
        await db.users.update_many(
            {"preferences": {"$exists": False}},
            {"$set": {
                "preferences": {
                    "language": "pt-BR",
                    "timezone": "America/Sao_Paulo",
                    "notifications": {
                        "email": True,
                        "sms": True,
                        "push": False
                    }
                }
            }}
        )
        
    async def down(self, db):
        await db.users.update_many(
            {},
            {"$unset": {"preferences": ""}}
        )

# List of all migrations
MIGRATIONS = [
    Migration001_AddPhoneIndex(),
    Migration002_AddAppointmentStatusIndex(),
    Migration003_AddPatientTags(),
    Migration004_AddCollectionHistory(),
    Migration005_AddUserPreferences(),
]

class MigrationRunner:
    def __init__(self):
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[DB_NAME]
        
    async def get_applied_migrations(self) -> List[int]:
        """Get list of applied migration versions"""
        migrations = await self.db[MIGRATIONS_COLLECTION].find({}).to_list(None)
        return [m["version"] for m in migrations]
        
    async def record_migration(self, migration: Migration):
        """Record that a migration was applied"""
        await self.db[MIGRATIONS_COLLECTION].insert_one({
            "version": migration.version,
            "description": migration.description,
            "applied_at": datetime.utcnow()
        })
        
    async def remove_migration_record(self, version: int):
        """Remove migration record"""
        await self.db[MIGRATIONS_COLLECTION].delete_one({"version": version})
        
    async def run_up(self, target_version: int = None):
        """Run migrations up to target version"""
        applied = await self.get_applied_migrations()
        
        migrations_to_run = []
        for migration in MIGRATIONS:
            if migration.version not in applied:
                if target_version is None or migration.version <= target_version:
                    migrations_to_run.append(migration)
                    
        if not migrations_to_run:
            click.echo(click.style("✓ Database is up to date", fg="green"))
            return
            
        for migration in sorted(migrations_to_run, key=lambda m: m.version):
            click.echo(f"Running migration {migration.version}: {migration.description}")
            try:
                await migration.up(self.db)
                await self.record_migration(migration)
                click.echo(click.style(f"  ✓ Migration {migration.version} applied", fg="green"))
            except Exception as e:
                click.echo(click.style(f"  ✗ Migration {migration.version} failed: {str(e)}", fg="red"))
                raise
                
    async def run_down(self, target_version: int = 0):
        """Rollback migrations down to target version"""
        applied = await self.get_applied_migrations()
        
        migrations_to_rollback = []
        for migration in MIGRATIONS:
            if migration.version in applied and migration.version > target_version:
                migrations_to_rollback.append(migration)
                
        if not migrations_to_rollback:
            click.echo(click.style("✓ Nothing to rollback", fg="green"))
            return
            
        for migration in sorted(migrations_to_rollback, key=lambda m: m.version, reverse=True):
            click.echo(f"Rolling back migration {migration.version}: {migration.description}")
            try:
                await migration.down(self.db)
                await self.remove_migration_record(migration.version)
                click.echo(click.style(f"  ✓ Migration {migration.version} rolled back", fg="green"))
            except Exception as e:
                click.echo(click.style(f"  ✗ Rollback of migration {migration.version} failed: {str(e)}", fg="red"))
                raise
                
    async def show_status(self):
        """Show migration status"""
        applied = await self.get_applied_migrations()
        
        click.echo(click.style("📊 Migration Status", fg="cyan", bold=True))
        click.echo("=" * 60)
        
        for migration in MIGRATIONS:
            if migration.version in applied:
                # Get applied date
                record = await self.db[MIGRATIONS_COLLECTION].find_one({"version": migration.version})
                applied_at = record["applied_at"].strftime("%Y-%m-%d %H:%M:%S")
                status = click.style("✓ Applied", fg="green")
                click.echo(f"{migration.version:3d} | {status} | {applied_at} | {migration.description}")
            else:
                status = click.style("✗ Pending", fg="yellow")
                click.echo(f"{migration.version:3d} | {status} | {'':^19} | {migration.description}")
                
    async def run(self, command: str, version: int = None):
        """Run migration command"""
        try:
            await self.connect()
            
            if command == "up":
                await self.run_up(version)
            elif command == "down":
                if version is None:
                    click.confirm("⚠️  This will rollback ALL migrations. Continue?", abort=True)
                    version = 0
                await self.run_down(version)
            elif command == "status":
                await self.show_status()
            else:
                click.echo(click.style(f"Unknown command: {command}", fg="red"))
                
        except Exception as e:
            click.echo(click.style(f"❌ Error: {str(e)}", fg="red"))
            sys.exit(1)
        finally:
            if self.client:
                self.client.close()

@click.command()
@click.argument('command', type=click.Choice(['up', 'down', 'status']))
@click.option('--version', type=int, help='Target migration version')
def main(command, version):
    """Database migration tool"""
    click.echo(click.style("🔄 Database Migration Tool", fg="green", bold=True))
    
    runner = MigrationRunner()
    asyncio.run(runner.run(command, version))

if __name__ == "__main__":
    main()