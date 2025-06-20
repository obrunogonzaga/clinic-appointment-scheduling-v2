#!/usr/bin/env python3

"""
Generate new API endpoint boilerplate
Usage: python api-endpoint.py <resource_name> [--crud] [--auth]
"""

import os
import sys
import click
from pathlib import Path
from datetime import datetime

# Template for API endpoint
ENDPOINT_TEMPLATE = '''"""
{resource_title} API endpoints
Generated on: {date}
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId

from src.core.dependencies import get_current_user, get_database
from src.models.{resource_lower} import (
    {resource_class},
    {resource_class}Create,
    {resource_class}Update,
    {resource_class}Response
)

router = APIRouter(
    prefix="/{resource_plural}",
    tags=["{resource_plural}"],
    responses={{404: {{"description": "Not found"}}}}
)

@router.get("/", response_model=List[{resource_class}Response])
async def get_{resource_plural}(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db = Depends(get_database),
    {auth_param}
):
    """
    Get list of {resource_plural} with pagination and search.
    """
    query = {{}}
    
    if search:
        query["$or"] = [
            {{"name": {{"$regex": search, "$options": "i"}}}},
            # Add other searchable fields
        ]
    
    cursor = db.{resource_plural}.find(query).skip(skip).limit(limit)
    {resource_plural} = await cursor.to_list(length=limit)
    
    return [{resource_class}Response(**{resource_lower}) for {resource_lower} in {resource_plural}]

@router.get("/{{id}}", response_model={resource_class}Response)
async def get_{resource_lower}(
    id: str,
    db = Depends(get_database),
    {auth_param}
):
    """
    Get specific {resource_lower} by ID.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    {resource_lower} = await db.{resource_plural}.find_one({{"_id": ObjectId(id)}})
    
    if not {resource_lower}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{resource_title} not found"
        )
    
    return {resource_class}Response(**{resource_lower})

@router.post("/", response_model={resource_class}Response, status_code=status.HTTP_201_CREATED)
async def create_{resource_lower}(
    {resource_lower}: {resource_class}Create,
    db = Depends(get_database),
    {auth_param}
):
    """
    Create new {resource_lower}.
    """
    # Validate unique fields
    # existing = await db.{resource_plural}.find_one({{"field": {resource_lower}.field}})
    # if existing:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail="Field already exists"
    #     )
    
    {resource_lower}_dict = {resource_lower}.dict()
    {resource_lower}_dict["created_at"] = datetime.utcnow()
    {resource_lower}_dict["updated_at"] = datetime.utcnow()
    {auth_created_by}
    
    result = await db.{resource_plural}.insert_one({resource_lower}_dict)
    created = await db.{resource_plural}.find_one({{"_id": result.inserted_id}})
    
    return {resource_class}Response(**created)

@router.put("/{{id}}", response_model={resource_class}Response)
async def update_{resource_lower}(
    id: str,
    {resource_lower}: {resource_class}Update,
    db = Depends(get_database),
    {auth_param}
):
    """
    Update existing {resource_lower}.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    update_data = {resource_lower}.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    {auth_updated_by}
    
    result = await db.{resource_plural}.update_one(
        {{"_id": ObjectId(id)}},
        {{"$set": update_data}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{resource_title} not found"
        )
    
    updated = await db.{resource_plural}.find_one({{"_id": ObjectId(id)}})
    return {resource_class}Response(**updated)

@router.delete("/{{id}}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_{resource_lower}(
    id: str,
    db = Depends(get_database),
    {auth_param}
):
    """
    Delete {resource_lower}.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    result = await db.{resource_plural}.delete_one({{"_id": ObjectId(id)}})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{resource_title} not found"
        )
    
    return None
'''

MODEL_TEMPLATE = '''"""
{resource_title} data models
Generated on: {date}
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, validator
from bson import ObjectId

class {resource_class}Base(BaseModel):
    """Base {resource_lower} model"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    # Add your fields here
    
    class Config:
        schema_extra = {{
            "example": {{
                "name": "Example {resource_title}",
                "description": "This is an example {resource_lower}"
            }}
        }}

class {resource_class}Create({resource_class}Base):
    """Model for creating {resource_lower}"""
    pass

class {resource_class}Update(BaseModel):
    """Model for updating {resource_lower}"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    # Add optional fields for update
    
    class Config:
        schema_extra = {{
            "example": {{
                "name": "Updated {resource_title}",
                "description": "Updated description"
            }}
        }}

class {resource_class}InDB({resource_class}Base):
    """Model for {resource_lower} in database"""
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True
        
    @validator("id", pre=True)
    def validate_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

class {resource_class}Response({resource_class}InDB):
    """Model for {resource_lower} API response"""
    pass

class {resource_class}List(BaseModel):
    """Model for paginated {resource_lower} list"""
    items: List[{resource_class}Response]
    total: int
    skip: int
    limit: int
'''

TEST_TEMPLATE = '''"""
Tests for {resource_lower} endpoints
Generated on: {date}
"""

import pytest
from httpx import AsyncClient
from bson import ObjectId

from src.main import app

@pytest.fixture
async def test_{resource_lower}():
    return {{
        "name": "Test {resource_title}",
        "description": "Test description"
    }}

@pytest.mark.asyncio
async def test_create_{resource_lower}(async_client: AsyncClient, test_{resource_lower}, auth_headers):
    response = await async_client.post(
        "/api/v1/{resource_plural}",
        json=test_{resource_lower},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == test_{resource_lower}["name"]
    assert "id" in data

@pytest.mark.asyncio
async def test_get_{resource_plural}(async_client: AsyncClient, auth_headers):
    response = await async_client.get(
        "/api/v1/{resource_plural}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_{resource_lower}_by_id(async_client: AsyncClient, test_{resource_lower}, auth_headers):
    # Create {resource_lower} first
    create_response = await async_client.post(
        "/api/v1/{resource_plural}",
        json=test_{resource_lower},
        headers=auth_headers
    )
    {resource_lower}_id = create_response.json()["id"]
    
    # Get by ID
    response = await async_client.get(
        f"/api/v1/{resource_plural}/{{{resource_lower}_id}}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == {resource_lower}_id

@pytest.mark.asyncio
async def test_update_{resource_lower}(async_client: AsyncClient, test_{resource_lower}, auth_headers):
    # Create {resource_lower} first
    create_response = await async_client.post(
        "/api/v1/{resource_plural}",
        json=test_{resource_lower},
        headers=auth_headers
    )
    {resource_lower}_id = create_response.json()["id"]
    
    # Update
    update_data = {{"name": "Updated {resource_title}"}}
    response = await async_client.put(
        f"/api/v1/{resource_plural}/{{{resource_lower}_id}}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated {resource_title}"

@pytest.mark.asyncio
async def test_delete_{resource_lower}(async_client: AsyncClient, test_{resource_lower}, auth_headers):
    # Create {resource_lower} first
    create_response = await async_client.post(
        "/api/v1/{resource_plural}",
        json=test_{resource_lower},
        headers=auth_headers
    )
    {resource_lower}_id = create_response.json()["id"]
    
    # Delete
    response = await async_client.delete(
        f"/api/v1/{resource_plural}/{{{resource_lower}_id}}",
        headers=auth_headers
    )
    assert response.status_code == 204
    
    # Verify deleted
    get_response = await async_client.get(
        f"/api/v1/{resource_plural}/{{{resource_lower}_id}}",
        headers=auth_headers
    )
    assert get_response.status_code == 404
'''

def pluralize(word):
    """Simple pluralization"""
    if word.endswith('y'):
        return word[:-1] + 'ies'
    elif word.endswith('s') or word.endswith('x') or word.endswith('ch'):
        return word + 'es'
    else:
        return word + 's'

@click.command()
@click.argument('resource_name')
@click.option('--crud', is_flag=True, help='Generate full CRUD operations')
@click.option('--auth', is_flag=True, help='Include authentication')
def generate_endpoint(resource_name, crud, auth):
    """Generate API endpoint boilerplate"""
    
    # Prepare variables
    resource_lower = resource_name.lower()
    resource_class = ''.join(word.capitalize() for word in resource_name.split('_'))
    resource_title = resource_name.replace('_', ' ').title()
    resource_plural = pluralize(resource_lower)
    date = datetime.now().strftime('%Y-%m-%d')
    
    # Auth-related variables
    auth_param = "current_user = Depends(get_current_user)" if auth else ""
    auth_created_by = f'{resource_lower}_dict["created_by"] = str(current_user.id)' if auth else ""
    auth_updated_by = f'update_data["updated_by"] = str(current_user.id)' if auth else ""
    
    # Paths
    backend_path = Path("backend")
    endpoint_path = backend_path / "src" / "api" / "endpoints" / f"{resource_plural}.py"
    model_path = backend_path / "src" / "models" / f"{resource_lower}.py"
    test_path = backend_path / "tests" / f"test_{resource_plural}.py"
    
    # Generate files
    click.echo(click.style(f"🚀 Generating API endpoint for {resource_title}", fg="green"))
    
    # Create endpoint file
    endpoint_content = ENDPOINT_TEMPLATE.format(
        resource_lower=resource_lower,
        resource_class=resource_class,
        resource_title=resource_title,
        resource_plural=resource_plural,
        date=date,
        auth_param=auth_param,
        auth_created_by=auth_created_by,
        auth_updated_by=auth_updated_by
    )
    
    endpoint_path.write_text(endpoint_content)
    click.echo(f"  ✓ Created endpoint: {endpoint_path}")
    
    # Create model file
    model_content = MODEL_TEMPLATE.format(
        resource_lower=resource_lower,
        resource_class=resource_class,
        resource_title=resource_title,
        date=date
    )
    
    model_path.write_text(model_content)
    click.echo(f"  ✓ Created model: {model_path}")
    
    # Create test file
    test_content = TEST_TEMPLATE.format(
        resource_lower=resource_lower,
        resource_class=resource_class,
        resource_title=resource_title,
        resource_plural=resource_plural,
        date=date
    )
    
    test_path.write_text(test_content)
    click.echo(f"  ✓ Created tests: {test_path}")
    
    # Instructions
    click.echo("\n" + click.style("Next steps:", fg="yellow"))
    click.echo(f"1. Add router to main.py:")
    click.echo(f"   from src.api.endpoints.{resource_plural} import router as {resource_plural}_router")
    click.echo(f"   app.include_router({resource_plural}_router, prefix='/api/v1')")
    click.echo(f"2. Update the model fields in {model_path}")
    click.echo(f"3. Run tests: pytest {test_path}")
    click.echo(f"4. Update API documentation")

if __name__ == "__main__":
    generate_endpoint()